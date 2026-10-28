import { NextResponse } from "next/server";
import { calcXiaoliuren, XiaoliurenInput } from "@/lib/engine/xiaoliuren";

export async function POST(req: Request) {
  try {
    const body: XiaoliurenInput = await req.json();
    if (body.hour === undefined) {
      return NextResponse.json({ ok: false, error: "hour 参数必填" }, { status: 400 });
    }
    const r = calcXiaoliuren(body);
    return NextResponse.json({ ok: true, data: r });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 400 });
  }
}
