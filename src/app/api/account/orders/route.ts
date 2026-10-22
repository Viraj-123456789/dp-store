import { accountJson, withSession } from "@/lib/account/server";
import { listOrders } from "@/lib/medusa/account";

/** GET /api/account/orders: Order[] (newest first). */
export function GET() {
  return withSession(async (token) => accountJson(await listOrders(token)));
}
