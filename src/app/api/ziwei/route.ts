import { NextResponse } from "next/server";
import { calcZiwei, ZiweiInput } from "@/lib/engine/ziwei";

export async function POST(req: Request) {
  try {
    const body: ZiweiInput = await req.json();
    const r = calcZiwei(body);
    return NextResponse.json({ ok: true, data: r });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 400 });
  }
}
