import { NextResponse } from "next/server";
import { calcBazi, BaziInput } from "@/lib/engine/bazi";

export async function POST(req: Request) {
  try {
    const body: BaziInput = await req.json();
    const r = calcBazi(body);
    return NextResponse.json({ ok: true, data: r });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 400 });
  }
}
