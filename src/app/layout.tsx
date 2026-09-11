import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "千思 · 命盘",
  description: "确定性排盘的八字 × 紫微助手",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full">
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "-apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
