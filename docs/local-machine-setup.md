# Set up the whole project on a new local machine

Goal: a second computer (Windows, macOS or Linux) running everything, with the same behaviour as the
working setup: the Medusa backend, Postgres, Redis, the Admin dashboard and the Next.js storefront, all on
`localhost`. Real vendors (SMS, email, payment gateways) are not needed for this; development shortcuts
stand in for them.

This is the single-machine version. [SETUP.md](SETUP.md) covers putting the backend and storefront on two
different machines, and [TESTING.md](TESTING.md) covers the checks.

Steps 2 to 7 were followed on a brand-new empty database on the working machine (migrate, admin user, start,
seed, set up the test state, run five contract suites; all passed). Steps that depend on the other computer
itself (installing Node or Docker, copying files) could not be tried here.

```
 Browser ──► Storefront (Next.js)  :3000 ──► Backend (Medusa) :9000 ──► Postgres :5432
                                                    │                  Redis    :6379
                                         Admin dashboard: :9000/app
```

## 1. Prerequisites on the new machine

| Need | Version | Check |
|---|---|---|
| Node.js | 22.22 or newer (the working machine uses 24) | `node -v` |
| npm | 11 (the repo pins 11.6.2) | `npm -v`; `npm install -g npm@11.6.2` |
| Docker | Docker Desktop, or Engine plus the compose plugin | `docker --version` |
| Git | any | `git --version` |

Free ports: 3000 (storefront), 9000 (backend), 5432 (Postgres), 6379 (Redis). If another Postgres or Redis
already uses 5432 or 6379, stop it or change the port mappings in step 3 and the URLs in step 4.

Windows: use Git Bash for the commands below (the unit-test command in step 7 does not work in PowerShell or cmd).

## 2. Get the two repositories onto the machine

The code is in two folders:

- `my-storeback` (backend, a Turborepo with the app in `apps/backend`)
- `my-storefront` (storefront)

Neither repository has been committed yet, so there is nothing to `git clone` until you commit and push. Until
then copy the folders (zip, USB or network share) and **leave out**: `node_modules`, `.next`, `.medusa`, `.env`,
`.env.local`, `.playwright-mcp` and `apps/backend/spikes/.state.json`. You will recreate the env files below.
Put both folders side by side, for example `~/dp/my-storeback` and `~/dp/my-storefront`.

Once the repos are pushed to a Git host, this step becomes `git clone` for each.

## 3. Start Postgres and Redis

Create `docker-compose.yml` anywhere (for example in `~/dp/`):

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: dp-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: medusa
      POSTGRES_PASSWORD: change-me
      POSTGRES_DB: medusa-dpetals
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - dp-pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U medusa -d medusa-dpetals"]
      interval: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    container_name: dp-redis
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes"]
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - dp-redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      retries: 10

volumes:
  dp-pgdata:
  dp-redisdata:
```

```bash
docker compose up -d
docker compose ps          # both "healthy"
```

Data lives in the named volumes and survives restarts. `docker compose down -v` deletes it. Redis matters here:
it holds sign-in codes, rate-limit counters and locks, so keep it running with the backend.

## 4. Configure and prepare the backend

```bash
cd my-storeback
npm install                # one install at the root covers both workspaces
cd apps/backend
cp .env.template .env
```

Edit `apps/backend/.env`. Generate each secret with
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` (run it once per value).

```env
DATABASE_URL=postgres://medusa:change-me@localhost:5432/medusa-dpetals
REDIS_URL=redis://localhost:6379

JWT_SECRET=<random>
COOKIE_SECRET=<random>
# Both of these must be the same value in the storefront's .env.local (step 5)
REVALIDATE_SECRET=<random>
STOREFRONT_API_SECRET=<random, at least 32 characters>

STORE_CORS=http://localhost:3000
AUTH_CORS=http://localhost:3000,http://localhost:9000
ADMIN_CORS=http://localhost:9000
STOREFRONT_URL=http://localhost:3000
MEDIA_BASE_URL=https://dpetals.com/cdn/shop/

# Development stand-ins. NEVER set these in production (the server refuses to start if you do).
OTP_DEV_ECHO=true              # the sign-in code is shown on screen instead of sent by SMS
ALLOW_MANUAL_PAYMENT=true      # test orders without a payment gateway
RATE_LIMIT_DISABLED=true       # the contract tests make hundreds of carts from one address

# Only for running the test suites quickly (defaults are stricter)
REVIEW_LIMIT_PER_HOUR=1000
NEWSLETTER_LIMIT_PER_HOUR=1000
REVIEW_COOLDOWN_SECONDS=1
```

Notes:
- The working machine's `.env` also has `AUTH_MFA_ENCRYPTION_KEY` and `MEDUSA_ADMIN_ONBOARDING_TYPE=default`
  (written by the Medusa scaffold). The code does not use them. If Medusa complains about the first one,
  add a random 32-byte hex value.
- Leave the Razorpay and PhonePe variables empty. With none set the backend still boots and test orders use the
  manual provider.

### Migrate, create the admin user, start

Still in `apps/backend`:

```bash
npx medusa db:migrate
npx medusa user -e admin@dpetals.com -p 'DpDev#2026'
npm run dev                # backend on http://localhost:9000, leave it running
```

- The migration also loads Medusa's starter demo data (a few sample products and a Europe region). That is
  expected; the seed below adds the real catalogue next to it.
- `admin@dpetals.com` / `DpDev#2026` are the credentials the test scripts expect. Use other values for anything
  that is not a throwaway machine, and then set `SPIKE_ADMIN_EMAIL` and `SPIKE_ADMIN_PASSWORD` when running tests.
- Wait for "Server is ready on port: 9000", then check `http://localhost:9000/health` returns OK and
  `http://localhost:9000/ready` shows `"database": true, "cache": true`.

### Seed the DPetals data

In a second terminal, in `apps/backend`:

```bash
npx medusa exec ./src/scripts/seed-dpetals.ts
```

(`npm run backend:seed` from the repo root does not work: the script it points to does not exist.)

It is safe to run again; it only adds what is missing. It creates the India region (INR, tax-inclusive GST),
the "DPetals Web" sales channel, the Ahmedabad stock location with 50 units per variant, shipping, 28 products,
17 categories, the reward-tier and first-order promotions, the home page, navigation, 5 pages, 6 journal
articles and 3 testimonials. The last line prints the publishable key:

```
DPetals seed done: 28 products, 17 categories. Storefront env: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
```

Copy that `pk_...` value. (It is also in Admin under Settings > Publishable API Keys, titled "DPetals Storefront".)

Other seed words: `reset` recreates the 28 products (refused while stock is reserved by orders),
`overwrite-content` resets the editable content to the seed data.

## 5. Configure and run the storefront

```bash
cd my-storefront
npm install
```

Create `.env.local` in `my-storefront`:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...        # from the seed output
NEXT_PUBLIC_MEDIA_BASE_URL=https://dpetals.com/cdn/shop/
NEXT_PUBLIC_SITE_URL=http://localhost:3000
REVALIDATE_SECRET=<same value as the backend>
STOREFRONT_API_SECRET=<same value as the backend>
```

```bash
npm run dev                # http://localhost:3000
```

`NEXT_PUBLIC_*` values are fixed when the code is compiled: restart `npm run dev` (or rebuild) after changing one.
The backend must be running first; the storefront reads the home page, products and content from it.

## 6. Check that everything works

1. `http://localhost:3000` shows the home page with products, banners, journal and footer.
2. Open a product, add it to the cart, open the cart. Totals, the free-shipping bar and the reward bar update.
3. Sign in at `http://localhost:3000/account/login`: enter any 10-digit mobile number starting 6 to 9, then use
   the "Development code" shown under the field. You land on your account; add an address.
4. Check out: with `ALLOW_MANUAL_PAYMENT=true` the order is placed without a gateway and you reach the
   confirmation page. It then appears under Account > Orders.
5. Admin: `http://localhost:9000/app`, sign in as the admin user. Open "Storefront content" in the sidebar,
   change something on the home page, and the storefront updates within a few seconds (this proves
   `REVALIDATE_SECRET` and `STOREFRONT_URL` are right).

## 7. Run the checks (optional but recommended)

Backend, in `apps/backend`, with the backend running:

```bash
node spikes/01-setup-india.mjs     # once: writes spikes/.state.json (ids the tests need)
node contract-tests/catalog.mjs
node contract-tests/cart.mjs
node contract-tests/checkout.mjs
node contract-tests/account.mjs
node contract-tests/content.mjs
node contract-tests/admin-content.mjs
node contract-tests/reconcile.mjs
```

Each should end with `ALL PASS`. They create real orders and reserve stock for good, so use them only on this
development database (they top stock back up themselves). `spikes/.state.json` belongs to one database: if you
point at a different database later, run `node spikes/01-setup-india.mjs` again.

Unit tests, lint and types (Git Bash; on Windows `npm run test:unit` fails because it sets the variable in a
way only Unix shells understand):

```bash
cd apps/backend
TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules npx jest --silent --runInBand --forceExit
npm run lint
npx tsc --noEmit
```

Storefront, in `my-storefront`:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## 8. Day to day

```bash
# start (after a reboot)
docker compose up -d                          # in the folder with the compose file
cd my-storeback/apps/backend && npm run dev   # terminal 1
cd my-storefront && npm run dev               # terminal 2
```

Changing `apps/backend/.env` needs a backend restart; the dev watcher does not pick it up.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Storefront shows an error page or empty home | Backend not running, or `NEXT_PUBLIC_MEDUSA_BACKEND_URL` wrong. Check `http://localhost:9000/ready`. |
| Products load but are empty, or "publishable key" errors | Wrong key in `.env.local`, or it was changed without restarting `npm run dev`. Take the key from the seed output or Admin. |
| Browser CORS error | `STORE_CORS` / `AUTH_CORS` must contain exactly `http://localhost:3000` (scheme, host and port; no trailing slash). Restart the backend after editing. |
| Admin edits do not show on the storefront | `REVALIDATE_SECRET` differs between the two files, or `STOREFRONT_URL` is wrong. |
| Cannot sign in: no code appears | `OTP_DEV_ECHO=true` missing in the backend `.env` (and restart). The code is shown under the field only in development. |
| Checkout says "Online payments aren't available" | `ALLOW_MANUAL_PAYMENT=true` missing, or the region has no manual provider. A gateway-less install needs the dev flag. |
| 429 "Too many requests" while testing | Set `RATE_LIMIT_DISABLED=true` in the backend `.env` (development only) and restart. |
| "Could not connect to the database" at start-up | Postgres not running, wrong credentials in `DATABASE_URL`, or (production mode only) a non-SSL database needs `?sslmode=disable`. |
| Redis errors, or sign-in codes vanish | Redis not running or wrong `REDIS_URL`. |
| Contract tests: login failed or "stockLocationId" undefined | Admin user missing (step 4), backend not running, or `spikes/.state.json` belongs to another database: run `node spikes/01-setup-india.mjs`. |
| Contract tests: "fetch failed" once | A stale connection after a long pause; run the suite again. |
| Search or a page shows a stale error after changing code | Stop the storefront, delete the `.next` folder, start again. |
| Port already in use | Another program holds 3000, 9000, 5432 or 6379. Stop it or change the port in the compose file and the matching URL. |
| `npm install` complains about peer dependencies in the backend | The repo's `.npmrc` handles it; if you install elsewhere add `--legacy-peer-deps`. |

## Differences from production

Do not copy these development settings to a real deployment: `OTP_DEV_ECHO`, `ALLOW_MANUAL_PAYMENT`,
`RATE_LIMIT_DISABLED`, weak secrets, `localhost` CORS values, Postgres and Redis ports open to the host.
The backend refuses to start in production mode with any of them. The production path (containers, backups,
cutover) is in the backend repo's `docs/phase4-launch.md`, and what is still open before launch is in
[pending.md](pending.md).
