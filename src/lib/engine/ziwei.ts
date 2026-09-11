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
  // 紫微: 五行局起宫(考据) - start, 每局星进格
  const start=(JU_START[ju]!==undefined?JU_START[ju]:2); const n=JU_N[ju]||4;
  const ziweiPos=(start - Math.floor((dd-1)/n)+12)%12;
  const ziwei=Z[ziweiPos]; const tianfu=Z[(4-ziweiPos+12)%12];
  // 布宫: 紫微系(逆,含空宫) + 天府系(顺), offset表
  const zwM={紫微:0,天机:1,太阳:3,武曲:4,天同:5,廉贞:7} as Record<string,number>;
  const tfM={天府:0,太阴:1,贪狼:2,巨门:3,天相:4,天梁:5,七杀:6,破军:7} as Record<string,number>;
  const tfPos=(4-ziweiPos+12)%12;
  const stars:Record<string,string[]>={}; for(let i=0;i<12;i++)stars[Z[i]]=[];
  Object.entries(zwM).forEach(([k,o])=>{ stars[Z[(ziweiPos + o + 12)%12]].push(k); });
  stars[Z[ziweiPos]]; // keep
  Object.entries(tfM).forEach(([k,o])=>{ stars[Z[(tfPos + o + 12)%12]].push(k); });
  return { minggz, shengong: Z[shen], wuxingju: ju, ziwei, tianfu, stars, lunar: mm+"月"+dd+"日" };
}

