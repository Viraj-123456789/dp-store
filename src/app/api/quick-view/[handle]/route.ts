import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getQuickViewItem } from "@/lib/quick-view";

/** Product content for the quick-view modal. */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/quick-view/[handle]">) {
  const { handle } = await ctx.params;
  const item = await getQuickViewItem(handle);

  return item ? NextResponse.json(item) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
