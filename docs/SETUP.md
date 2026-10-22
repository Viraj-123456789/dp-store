# Setup guide: storeback (Medusa) and storefront on separate machines

```
 Machine B (storefront)                    Machine A (storeback)
 Next.js :3000  ── HTTP(S) ──────────────► Medusa :9000
 browser also calls Medusa directly              │
                                                 ├── PostgreSQL :5432 (Docker)
                                                 └── Redis      :6379 (Docker)
```

The storefront never touches the database or Redis. It only needs the backend URL and a publishable key.

---

## Part 1: Machine A, backend (my-storeback)

### 1.1 Prerequisites
- Node >= 22.22.0 (the repo's `engines` field), npm 11
- Git
- Docker Desktop (Windows/macOS) or Docker Engine + the compose plugin (Linux)

### 1.2 Clone
```bash
git clone <my-storeback-repo-url>
cd my-storeback
npm install
```

### 1.3 Postgres and Redis in Docker
Create `docker-compose.yml` in the `my-storeback` root:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: medusa-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: medusa
      POSTGRES_PASSWORD: change-me
      POSTGRES_DB: medusa-backend
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U medusa -d medusa-backend"]
      interval: 5s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7
    container_name: medusa-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  pgdata:
  redisdata:
```

```bash
docker compose up -d
docker compose ps        # both should be "healthy"
```

Data lives in the named volumes and survives restarts. `docker compose down -v` deletes it.

If Medusa runs on the same machine, bind the ports to localhost only (`"127.0.0.1:5432:5432"`, `"127.0.0.1:6379:6379"`). Never expose Postgres or Redis to the internet.

### 1.4 Backend environment
```bash
cd apps/backend
cp .env.template .env
```
Edit `apps/backend/.env`:

```env
DATABASE_URL=postgres://medusa:change-me@localhost:5432/medusa-backend
REDIS_URL=redis://localhost:6379

# generate each with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=<random>
COOKIE_SECRET=<random>
OTP_SECRET=<random>
ORDER_TOKEN_SECRET=<random>

# Storefront origin(s). Exact scheme + host + port, comma-separated, no trailing slash.
STORE_CORS=http://<storefront-host>:3000
AUTH_CORS=http://<storefront-host>:3000,http://<backend-host>:9000
ADMIN_CORS=http://<backend-host>:9000

# Used for on-demand revalidation; REVALIDATE_SECRET must match the storefront
STOREFRONT_URL=http://<storefront-host>:3000
REVALIDATE_SECRET=<random, same as storefront>

MEDIA_BASE_URL=https://dpetals.com/cdn/shop/

# Development only. Never set these in production.
OTP_DEV_ECHO=true
ALLOW_MANUAL_PAYMENT=true
```

Payments (Razorpay / PhonePe) are registered only when all of that gateway's variables are set. See `docs/payments.md` in the backend repo. Webhook URLs are `<backend>/hooks/payment/razorpay_razorpay` and `<backend>/hooks/payment/phonepe_phonepe`, so the backend must be reachable from the internet for those.

### 1.5 Migrate, create the admin user and seed
```bash
cd apps/backend
npx medusa db:migrate
npx medusa user -e admin@example.com -p <password>
```
Seed data (check `apps/backend/package.json` for the seed script; the root has `npm run backend:seed`):
```bash
cd ../..
npm run backend:seed
```

### 1.6 Start
```bash
npm run backend:dev          # from repo root, port 9000
```
Production:
```bash
cd apps/backend
npm run build
npm run start                # use pm2 / systemd / a container to keep it running
```

### 1.7 Publishable API key
1. Open `http://<backend-host>:9000/app` and log in.
2. Go to **Settings → Publishable API Keys**, create a key, and copy the `pk_...` value.
3. Open the key and **add your Sales Channel** to it. Without this, product requests return nothing.
4. Confirm the region (INR), shipping options and products are set up and assigned to that sales channel.

### 1.8 Network access from Machine B
- **LAN:** use the machine's IP, e.g. `http://192.168.1.20:9000`. Allow inbound TCP 9000 in Windows Firewall:
  ```powershell
  New-NetFirewallRule -DisplayName "Medusa 9000" -Direction Inbound -Protocol TCP -LocalPort 9000 -Action Allow
  ```
- **Internet (testing):** `cloudflared tunnel --url http://localhost:9000` or `ngrok http 9000` gives you an HTTPS URL.
- **Internet (production):** a server with a domain and a reverse proxy (Caddy or Nginx) terminating HTTPS for `api.yourdomain.com` and forwarding to `localhost:9000`.

---

## Part 2: Machine B, storefront (my-storefront)

### 2.1 Prerequisites
Node 20+ (match whatever Next.js in `package.json` requires) and Git.

### 2.2 Clone and install
```bash
git clone <my-storefront-repo-url>
cd my-storefront
npm install
```

### 2.3 Environment
Create `.env.local`:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://<backend-host>:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_MEDIA_BASE_URL=https://dpetals.com/cdn/shop/
NEXT_PUBLIC_SITE_URL=http://<storefront-host>:3000
REVALIDATE_SECRET=<same value as the backend>
```

`NEXT_PUBLIC_*` values are inlined at build time. After changing them, restart `npm run dev` or rebuild.

### 2.4 Run
```bash
npm run dev                  # http://localhost:3000
```
Production:
```bash
npm run lint
npm run build
npm run start
```

---

## Part 3: Verify the connection

From Machine B:

```bash
curl http://<backend-host>:9000/health
curl -H "x-publishable-api-key: pk_..." "http://<backend-host>:9000/store/products?limit=1"
```

Then check CORS (the response must include `access-control-allow-origin`):

```bash
curl -i -H "Origin: http://<storefront-host>:3000" \
  -H "x-publishable-api-key: pk_..." \
  "http://<backend-host>:9000/store/products?limit=1"
```

Finally, open the storefront and add an item to the cart.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| CORS error in the browser console | The storefront origin is missing or differs from `STORE_CORS` / `AUTH_CORS` (port, `http` vs `https`, trailing slash). Fix it and restart the backend. |
| Empty product list | The publishable key isn't linked to the sales channel, or the products aren't in it. |
| "Publishable key required" | `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is missing or wrong, or the dev server wasn't restarted. |
| Connection refused / timeout from Machine B | Firewall, wrong IP, or the backend isn't running. Test `/health` with curl. |
| Backend can't connect to the DB | `docker compose ps`. Check that the credentials in `DATABASE_URL` match the compose file. |
| Mixed content blocked | An HTTPS storefront calling an HTTP backend. Put the backend behind HTTPS too. |
| Cart or login cookies don't persist | In production, use HTTPS on both sides and sibling subdomains of one domain (`shop.` and `api.`). |
| Redis errors | `docker compose logs redis`. Check that `REDIS_URL` points at the right host and port. |
| Cache doesn't refresh after admin edits | `REVALIDATE_SECRET` differs between the two, or `STOREFRONT_URL` is unreachable from the backend. |

## Production checklist
- Remove `OTP_DEV_ECHO` and `ALLOW_MANUAL_PAYMENT`. Configure a real payment gateway.
- Use strong, unique secrets and a strong DB password. Don't commit `.env` files.
- Don't publish Postgres or Redis ports. Keep them on the Docker network or localhost.
- HTTPS on both the backend and storefront; update `STORE_CORS`, `AUTH_CORS`, `STOREFRONT_URL` and `NEXT_PUBLIC_SITE_URL` to the real domains.
- Back up the Postgres volume: `docker exec medusa-postgres pg_dump -U medusa medusa-backend > backup.sql`.
- Rebuild the storefront after changing any `NEXT_PUBLIC_*` value.
