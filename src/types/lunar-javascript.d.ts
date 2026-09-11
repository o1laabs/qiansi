declare module "lunar-javascript" {
  export class Solar {
    static fromYmd(y: number, m: number, d: number): Solar;
    static fromYmdHms(y: number, m: number, d: number, h: number, mi: number, s: number): Solar;
    getLunar(): Lunar;
    getYear(): number; getMonth(): number; getDay(): number;
  }
  export class Lunar {
    getEightChar(): EightChar;
    getYear(): number; getMonth(): number; getDay(): number;
    getDayInGanZhi(): string;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getTimeInGanZhi(): string;
    getYearShengXiao(): string;
    getMonthInChinese(): string;
  }
  export class EightChar {
    getYear(): string; getMonth(): string; getDay(): string; getTime(): string;
    toString(): string;
  }
}
