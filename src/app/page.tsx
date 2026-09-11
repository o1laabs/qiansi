import FortuneView from "@/components/feature/FortuneForm";

export default function Home() {
  return (
    <main className="mx-auto max-w-lg px-5 py-10">
      <h1 className="mb-1 text-center text-2xl font-semibold tracking-wide">千思 · 命盘</h1>
      <p className="mb-6 text-center text-sm text-neutral-500">八字 × 紫微 · 读懂你的人生节奏</p>
      <FortuneView />
    </main>
  );
}
