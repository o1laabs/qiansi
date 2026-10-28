import { calculateXiaoliurenData } from "taibu-core/xiaoliuren";

export interface XiaoliurenInput {
  /** 问卜时刻的小时(0-23) */
  hour: number;
  /** 问卜日期 YYYY-MM-DD；缺省用今天 */
  date?: string;
  /** 占问事项 */
  question?: string;
}

export interface XiaoliurenResult {
  status: string;      // 大安/留连/速喜/赤口/小吉/空亡
  nature: string;      // 吉/凶/半吉半凶
  direction: string;   // 方位
  element: string;     // 五行
  description: string;
  poem: string;
  monthStatus: string;
  dayStatus: string;
  hourStatus: string;
}

/** 小六壬占卜：月上起、日上起、时上起 → 最终卦象 */
export function calcXiaoliuren(inp: XiaoliurenInput): XiaoliurenResult {
  const r = calculateXiaoliurenData({
    hour: inp.hour,
    date: inp.date,
    question: inp.question,
    hourType: "clock",
  });
  return {
    status: r.result.name,
    nature: r.result.nature,
    direction: r.result.direction,
    element: r.result.element,
    description: r.result.description,
    poem: r.result.poem,
    monthStatus: r.monthStatus,
    dayStatus: r.dayStatus,
    hourStatus: r.hourStatus,
  };
}
