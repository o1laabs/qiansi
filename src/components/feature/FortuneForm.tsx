"use client";
import { useState } from "react";
import type { BaziInput, BaziResult } from "@/lib/engine/bazi";

export interface FortuneViewProps { initial?: BaziInput; }

export default function FortuneView(props: FortuneViewProps) {
  const [y, setY] = useState(props.initial?.y ?? 1990);
  const [m, setM] = useState(props.initial?.m ?? 1);
  const [d, setD] = useState(props.initial?.d ?? 1);
  const [h, setH] = useState(props.initial?.hour ?? 12);
  const [g, setG] = useState<"男" | "女">(props.initial?.gender ?? "男");
  const [res, setRes] = useState<BaziResult | null>(null);
  const [err, setErr] = useState("");
  function run() {
    if (!y || !m || !d) { setErr("请填写完整"); return; }
    setErr("");
    fetch("/api/fortune", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ y: +y, m: +m, d: +d, hour: +h, gender: g }),
    }).then(x => x.json()).then(r => {
      if (r.ok) setRes(r.data); else { setErr(r.error); setRes(null); }
    }).catch(e => setErr(String(e)));
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="mt-2 mb-1 text-2xl font-semibold tracking-wide">千思 · 命盘</h1>
      <p className="mb-6 text-sm text-neutral-500">输入生辰，排定八字（确定性历法引擎，不联网）</p>
      <div className="grid grid-cols-4 gap-2 text-sm">
        <label className="col-span-2">年份
          <input type="number" value={y} onChange={e => setY(+e.target.value)} className="w-full rounded border p-2" /></label>
        <label>月<input type="number" value={m} onChange={e => setM(+e.target.value)} className="w-full rounded border p-2" /></label>
        <label>日<input type="number" value={d} onChange={e => setD(+e.target.value)} className="w-full rounded border p-2" /></label>
        <label className="col-span-2">时辰(0-23)<input type="number" value={h} onChange={e => setH(+e.target.value)} className="w-full rounded border p-2" /></label>
        <label className="col-span-2">性别
          <select value={g} onChange={e => setG(e.target.value as any)} className="w-full rounded border p-2"><option>男</option><option>女</option></select></label>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={run} className="rounded bg-neutral-900 px-6 py-2 text-white">排盘</button>
        <button onClick={() => { setY(1988); setM(5); setD(20); setH(20); setG("女"); }} className="rounded border px-4 py-2">示例</button>
      </div>
      {err && <p className="mt-3 text-red-500 text-sm">{err}</p>}
      {res && <ResultCard r={res} />}
    </div>
  );
}
function ResultCard({ r }: { r: BaziResult }) {
  return (
    <div className="mt-5 rounded-xl border p-4 text-sm">
      <div className="mb-2 font-semibold text-base">八字命书</div>
      <div className="flex gap-3">
        {r.pillars.map(p => <div key={p.label} className="flex-1 rounded bg-neutral-100 p-2 text-center"><div className="text-xs text-neutral-400">{p.label}</div><div className="text-lg font-bold">{p.gan}{p.zhi}</div>{p.shishen && <div className="text-xs text-neutral-500">{p.shishen}</div>}</div>)}
      </div>
      <div className="mt-3 space-y-1">
        <div>日主 <b>{r.dayMaster}</b> · 五行 {Object.entries(r.wx).filter(([,v])=>v).map(([k,v])=>(`${k}${v}`)).join(" ")} · <b>{r.strength}</b></div>
        <div>格局 <b>{r.geju}</b> · 喜用 <b className="text-amber-600">{r.xiyong}</b></div>
      </div>
      <div className="mt-2">大运：
        {r.daYun.slice(0,5).map(x => <span key={x.start} className="mr-2 inline-block rounded bg-neutral-100 px-2 py-1">{x.gz} · {x.ten}@{x.start}</span>)}
      </div>
    </div>
  );
}
