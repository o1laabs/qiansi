import { Solar } from "lunar-javascript";

export interface ZiweiInput { y: number; m: number; d: number; hour: number; gender: "男" | "女"; }
export interface ZiweiResult {
  minggz: string; shengong: string; wuxingju: string; ziwei: string; tianfu: string;
  stars: Record<string, string[]>;
  lunar: string;
}
const G = "甲乙丙丁戊己庚辛壬癸", Z = "子丑寅卯辰巳午未申酉戌亥";
const WX = ["木", "火", "土", "金", "水"];
// 干支序号->纳音五行(0金1木2水3火4土) 复用GLOBAL 60甲子
const NA_WX = [0,3,1,2,0,3,2,4,0,1,2,4,3,1,2,0,3,1,4,0,3,2,4,0,1,2,4,3,1,2];
const WX_MAP = { 金:"金四局", 木:"木三局", 水:"水二局", 火:"火六局", 土:"土五局" } as Record<string,string>;
const JU_START = { 水二局:1, 木三局:2, 金四局:4, 土五局:5, 火六局:6 } as Record<string,number>;
const JU_N = { 水二局:2, 木三局:3, 金四局:4, 土五局:5, 火六局:6 } as Record<string,number>;
export const zwStars = ["紫微","天机","太阳","武曲","天同","廉贞","天府","太阴","贪狼","巨门","天相","天梁","七杀","破军"];

function gzSeq(gan:number, zhi:number):number{ return ((gan*6 - zhi*5)%60+60)%60; }
function juGz(i:number){ return gzSeq(i>>2? -1 : 0,0); } // noop avoid unused
function nayinJu(gan:number, zhi:number): string {
  const seq=gzSeq(gan,zhi); const wx=NA_WX[Math.floor(seq/2)%30];
  const nm={0:"金四局",1:"木三局",2:"水二局",3:"火六局",4:"土五局"} as Record<number,string>;
  return nm[wx];
}
function wuhu_yin(yg:number){ return (({0:2,1:4,2:6,3:8} as Record<number,number>)[yg%5]) ?? 0; } // 甲0丙 乙1戊 丙2庚 丁3壬 戊4甲
export function calcZiwei(inp:ZiweiInput): ZiweiResult {
  const hour=Math.max(0,Math.min(23,inp.hour)||0);
  const solar=Solar.fromYmdHms(inp.y,inp.m,inp.d,hour,30,0);
  const lm=solar.getLunar(); const ec=lm.getEightChar();
  const mm=lm.getMonth(), dd=lm.getDay();
  const tyear=ec.getYear(), tmonth=ec.getMonth(), tday=ec.getDay(), ttime=ec.getTime();
  const yg=G.indexOf(tyear[0]), hz=Z.indexOf(ttime[1]); // 时支索引 0..11
  const hzz=(hz<0?0:hz);
  const mid=(2+(mm-1))%12; const ming=(mid - hzz +12)%12; const shen=(mid + hzz)%12;
  const yinj=wuhu_yin(yg); const mingGan=(yinj + ((ming-2+12)%12))%10;
  const minggz=G[mingGan]+Z[ming];
  const ju=nayinJu(mingGan,ming);
  // 紫微定位：复刻《紫微斗数全书》"起紫微星诀"（iztro getStartIndex 同源算法）
  //   局数除日数→商数宫前走；日数小於局，还直宫中守（加最小数至整除，奇逆偶顺）
  // 宫位索引：本文件 Z="子丑寅卯..."（子=0），紫微口诀从寅起（寅=索引2）
  const n=JU_N[ju]||4;
  let offset=-1, quotient=1, div;
  do { offset++; div=dd+offset; quotient=Math.floor(div/n); } while (div%n!==0);
  let q=quotient%12;
  let ziweiIz=q-1;                 // iztro 体系：寅=0
  ziweiIz = (offset%2===0) ? ziweiIz+offset : ziweiIz-offset; // 偶顺奇逆
  // fixIndex + 换算到本文件体系（寅=索引2）
  const ziweiPos=(((ziweiIz%12)+12)%12 + 2) % 12;
  const ziwei=Z[ziweiPos]; const tianfu=Z[(4-ziweiPos+12)%12];
  const tfPos=(4-ziweiPos+12)%12;
  // 布宫: 复刻 iztro 安紫微/天府诸星诀（寅=索引2体系）
  //   紫微系: [紫微,天机,空,太阳,武曲,天同,空,空,廉贞] 从紫微宫逆时针
  //   天府系: [天府,太阴,贪狼,巨门,天相,天梁,七杀,空,空,空,破军] 从天府宫顺时针
  const zwM=["紫微","天机","","太阳","武曲","天同","","","廉贞"] as string[];
  const tfM=["天府","太阴","贪狼","巨门","天相","天梁","七杀","","","","破军"] as string[];
  const stars:Record<string,string[]>={}; for(let i=0;i<12;i++)stars[Z[i]]=[];
  zwM.forEach((k,i)=>{ if(k) stars[Z[((ziweiPos - i)%12+12)%12]].push(k); });
  tfM.forEach((k,i)=>{ if(k) stars[Z[((tfPos + i)%12+12)%12]].push(k); });
  return { minggz, shengong: Z[shen], wuxingju: ju, ziwei, tianfu, stars, lunar: mm+"月"+dd+"日" };
}

