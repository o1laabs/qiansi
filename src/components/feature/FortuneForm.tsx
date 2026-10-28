"use client";
import { useState } from "react";
import type { BaziInput, BaziResult } from "@/lib/engine/bazi";
import type { ZiweiInput, ZiweiResult } from "@/lib/engine/ziwei";

export interface FortuneViewProps { initial?: BaziInput; }

type Tab = "bazi" | "ziwei" | "xiaoliuren";

const TABS: { id: Tab; label: string }[] = [
  { id: "bazi", label: "八字" },
  { id: "ziwei", label: "紫微斗数" },
  { id: "xiaoliuren", label: "小六壬" },
];

export default function FortuneView(props: FortuneViewProps) {
  const [tab, setTab] = useState<Tab>("bazi");
  const [y, setY] = useState(props.initial?.y ?? 1990);
  const [m, setM] = useState(props.initial?.m ?? 1);
  const [d, setD] = useState(props.initial?.d ?? 1);
  const [h, setH] = useState(props.initial?.hour ?? 12);
  const [g, setG] = useState<"男" | "女">(props.initial?.gender ?? "男");
  const [q, setQ] = useState("");            // 小六壬问题
  const [err, setErr] = useState("");

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="mt-2 mb-1 text-2xl font-semibold tracking-wide">千思 · 命盘</h1>
      <p className="mb-5 text-sm text-neutral-500">排盘引擎确定性历法，不联网、不割韭菜 —— 规则全部公开可核对</p>

      {/* Tab 切换 */}
      <div className="mb-4 flex gap-1 rounded-lg bg-neutral-100 p-1 text-sm">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-3 py-2 transition ${tab === t.id ? "bg-white shadow text-neutral-900" : "text-neutral-500"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {err && <p className="mb-3 text-sm text-red-500">{err}</p>}

      {/* 通用生辰表单（八字/紫微共用；小六壬只需时辰） */}
      {tab !== "xiaoliuren" && (
        <div className="grid grid-cols-4 gap-2 text-sm">
          <label className="col-span-2">年份<input type="number" value={y} onChange={e => setY(+e.target.value)} className="w-full rounded border p-2" /></label>
          <label>月<input type="number" value={m} onChange={e => setM(+e.target.value)} className="w-full rounded border p-2" /></label>
          <label>日<input type="number" value={d} onChange={e => setD(+e.target.value)} className="w-full rounded border p-2" /></label>
          <label className="col-span-2">时辰(0-23)<input type="number" value={h} onChange={e => setH(+e.target.value)} className="w-full rounded border p-2" /></label>
          <label className="col-span-2">性别
            <select value={g} onChange={e => setG(e.target.value as any)} className="w-full rounded border p-2"><option>男</option><option>女</option></select></label>
        </div>
      )}

      {/* 小六壬问题输入 */}
      {tab === "xiaoliuren" && (
        <div className="text-sm">
          <label className="block">时辰(0-23)<input type="number" value={h} onChange={e => setH(+e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
          <label className="mt-2 block">你想问什么？（选填）<input value={q} onChange={e => setQ(e.target.value)} placeholder="例：今日出行是否顺利" className="mt-1 w-full rounded border p-2" /></label>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={() => run(tab, setErr)} className="rounded bg-neutral-900 px-6 py-2 text-white">问卦</button>
        <button onClick={() => { setY(1988); setM(5); setD(20); setH(20); setG("女"); }} className="rounded border px-4 py-2">示例</button>
      </div>

      <Panel tab={tab} birth={{ y, m, d, hour: h, gender: g }} question={q} />
    </div>
  );
}

function run(tab: Tab, setErr: (s: string) => void) {
  setErr("");
}

/* ---------------- 面板容器 ---------------- */
function Panel({ tab, birth, question }: {
  tab: Tab; birth: { y: number; m: number; d: number; hour: number; gender: "男" | "女" }; question: string;
}) {
  if (tab === "ziwei") return <ZiweiPanel birth={birth} />;
  if (tab === "xiaoliuren") return <XiaoliurenPanel hour={birth.hour} question={question} />;
  return <BaziPanel birth={birth} />;
}

/* ---------------- 八字面板 ---------------- */
function BaziPanel({ birth }: { birth: any }) {
  const [res, setRes] = useState<BaziResult | null>(null);
  const [err, setErr] = useState("");
  function run() {
    setErr("");
    fetch("/api/fortune", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(birth) })
      .then(x => x.json()).then(r => r.ok ? setRes(r.data) : (setErr(r.error), setRes(null)))
      .catch(e => setErr(String(e)));
  }
  return (
    <div className="mt-4">
      <button onClick={run} className="rounded bg-neutral-900 px-6 py-2 text-white">排八字</button>
      {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
      {res && <BaziResultCard r={res} />}
    </div>
  );
}
function BaziResultCard({ r }: { r: BaziResult }) {
  return (
    <div className="mt-4 rounded-xl border p-4 text-sm">
      <div className="mb-2 font-semibold text-base">八字命书</div>
      <div className="flex gap-3">
        {r.pillars.map(p => <div key={p.label} className="flex-1 rounded bg-neutral-100 p-2 text-center"><div className="text-xs text-neutral-400">{p.label}</div><div className="text-lg font-bold">{p.gan}{p.zhi}</div>{p.shishen && <div className="text-xs text-neutral-500">{p.shishen}</div>}</div>)}
      </div>
      <div className="mt-3 space-y-1">
        <div>日主 <b>{r.dayMaster}</b> · 五行 {Object.entries(r.wx).filter(([, v]) => v).map(([k, v]) => `${k}${v}`).join(" ")} · <b>{r.strength}</b></div>
        <div>格局 <b>{r.geju}</b> · 喜用 <b className="text-amber-600">{r.xiyong}</b></div>
      </div>
      <div className="mt-2">大运：
        {r.daYun.slice(0, 5).map(x => <span key={x.start} className="mr-2 inline-block rounded bg-neutral-100 px-2 py-1">{x.gz} · {x.ten}@{x.start}</span>)}
      </div>
    </div>
  );
}

/* ---------------- 紫微面板（十二宫盘面） ---------------- */
const PAL_CN = ["命宫","兄弟","夫妻","子女","财帛","疾厄","迁移","交友","官禄","田宅","福德","父母"];
function ZiweiPanel({ birth }: { birth: any }) {
  const [res, setRes] = useState<ZiweiResult | null>(null);
  const [err, setErr] = useState("");
  function run() {
    setErr("");
    fetch("/api/ziwei", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(birth) })
      .then(x => x.json()).then(r => r.ok ? setRes(r.data) : (setErr(r.error), setRes(null)))
      .catch(e => setErr(String(e)));
  }
  return (
    <div className="mt-4">
      <button onClick={run} className="rounded bg-neutral-900 px-6 py-2 text-white">排紫微</button>
      {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
      {res && <ZiweiPlate z={res} />}
    </div>
  );
}
// 十二宫盘面：十二地支宫环绕，中宫放命宫信息
const Z_BY_POS = ["午","未","申","酉","戌","亥","子","丑","寅","卯","辰","巳"]; // 盘面排列(顺)
function ZiweiPlate({ z }: { z: ZiweiResult }) {
  const order = ["巳","午","未","申","酉","戌","亥","子","丑","寅","卯","辰"]; // 盘面格顺序
  const mingZhi = z.minggz[1];          // 命宫地支
  const mingIdx = "子丑寅卯辰巳午未申酉戌亥".indexOf(mingZhi);
  // 每格地支 -> 紫微宫序（逆时针：命宫起，下一地支为兄弟…父母）
  const palName = (zhi: string): string => {
    const idx = "子丑寅卯辰巳午未申酉戌亥".indexOf(zhi);
    return PAL_CN[((mingIdx - idx) % 12 + 12) % 12];
  };
  // 当前格标记：命宫/身宫/紫微/天府
  const mark = (zhi: string): string => {
    if (zhi === mingZhi) return "命";
    if (zhi === z.shengong) return "身";
    if (zhi === z.ziwei) return "紫";
    if (zhi === z.tianfu) return "府";
    return "";
  };
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-3 text-sm">
        <span>命宫 <b>{z.minggz}</b></span>
        <span>身宫 <b>{z.shengong}</b></span>
        <span>五行局 <b className="text-amber-600">{z.wuxingju}</b></span>
        <span className="text-xs text-neutral-400">{z.lunar}</span>
      </div>
      <div className="grid grid-cols-4 gap-1 text-xs">
        {order.map((zhi, i) => {
          const pn = palName(zhi);
          const mk = mark(zhi);
          return (
            <div key={zhi} className={`min-h-16 rounded-md border p-1.5 ${i === 5 || i === 6 ? "bg-neutral-50" : ""}`}>
              <div className="flex justify-between text-neutral-400">
                <span className="font-medium">{zhi}</span>
                <span>{pn}</span>
              </div>
              <div className={`mt-0.5 text-[11px] font-semibold ${mk ? "text-amber-600" : ""}`}>{mk}</div>
              <div className="mt-0.5 leading-tight">
                {(z.stars[zhi] ?? []).map(s => <div key={s} className="rounded bg-amber-50 px-1 py-0.5 text-[11px] text-amber-800 mb-0.5">{s}</div>)}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-neutral-400">主星安法：紫微系逆排（紫微天机空太阳武曲…），天府系顺排（天府太阴贪狼…）· 确定性历法，与 iztro 行业标准逐宫一致。</p>
    </div>
  );
}

/* ---------------- 小六壬面板 ---------------- */
function XiaoliurenPanel({ hour, question }: { hour: number; question: string }) {
  const [res, setRes] = useState<any>(null);
  const [err, setErr] = useState("");
  function run() {
    setErr("");
    fetch("/api/xiaoliuren", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hour: +hour, date: new Date().toISOString().slice(0, 10), question }) })
      .then(x => x.json()).then(r => r.ok ? setRes(r.data) : (setErr(r.error), setRes(null)))
      .catch(e => setErr(String(e)));
  }
  return (
    <div className="mt-4">
      <button onClick={run} className="rounded bg-neutral-900 px-6 py-2 text-white">起卦</button>
      {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
      {res && (
        <div className="mt-4 rounded-xl border p-4 text-sm">
          <div className="mb-2 font-semibold text-base">小六壬 · {res.status}</div>
          <div className="flex gap-2 text-xs">
            <span className="rounded bg-neutral-100 px-2 py-1">月上起：{res.monthStatus}</span>
            <span className="rounded bg-neutral-100 px-2 py-1">日上起：{res.dayStatus}</span>
            <span className="rounded bg-neutral-100 px-2 py-1">时上定：{res.hourStatus}</span>
          </div>
          <div className="mt-2 space-y-1">
            <div>吉凶 <b className={res.nature.includes("吉") ? "text-emerald-600" : "text-red-500"}>{res.nature}</b> · 五行 <b>{res.element}</b> · 方位 <b>{res.direction}</b></div>
            <div className="text-neutral-500">{res.description}</div>
            <div className="mt-1 rounded bg-neutral-50 p-2 text-neutral-600">{res.poem}</div>
          </div>
        </div>
      )}
    </div>
  );
}
