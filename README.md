# 千思 · 命盘 (qiansi)

八字 × 紫微 · 读懂你的人生节奏。**确定性排盘 + 情感化解盘**的命理应用。

## 技术栈（生产级）

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** 
- **lunar-javascript**（6tail，确定性历法引擎）
- API Routes（Route Handlers）作为后端
- `tsx` 跑引擎单元测试

## 架构

```
src/
├─ app/                    # 页面与 API 路由（前端 + 后端）
│  ├─ page.tsx             # 首页
│  └─ api/fortune/route.ts # 排盘 API
├─ components/feature/     # 业务组件
├─ lib/engine/             # ★ 排盘引擎（纯逻辑，可测，与 UI 解耦）
│  ├─ bazi.ts              # 八字：四柱/五行/身强弱/格局/喜用/大运
│  └─ ziwei.ts             # 紫微：命宫/身宫/五行局/紫微天府/十四主星
└─ types/                  # 类型声明
```

**核心原则**：排盘引擎与 UI 完全解耦，位于 `lib/engine`，可独立测试。

## 快速开始

```bash
npm install
npm run dev      # http://localhost:3000
npm run test     # 引擎单元测试（八字+紫微锚点）
npm run build    # 生产构建
npm run start    # 生产服务
```

## 引擎测试

`npm run test` 验证确定性排盘锚点：

- 八字 1988-5-20 戌时 → 戊辰 丁巳 乙亥 丙戌（身弱/食神格/喜水/大运逆行）
- 八字 2000-1-1 子时 → 己卯 丙子 戊午 壬子
- 紫微 1988-5-20 戌时 → 命宫己未 / 火六局 / 紫微午 / 天府戌

## 声明

八字与紫微为传统历法文化，内容仅供参考，不构成人生决策依据。
