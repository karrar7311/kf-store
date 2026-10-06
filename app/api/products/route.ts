import { NextResponse } from "next/server";
import { memoryProducts } from "@/lib/repository";

export const dynamic = "force-static";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const list = await memoryProducts.list({ category: u.searchParams.get("category") ?? undefined, gender: u.searchParams.get("gender") ?? undefined });
  return NextResponse.json({ products: list });
}
