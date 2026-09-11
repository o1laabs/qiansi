import { Solar } from "lunar-javascript";

export interface BaziInput {
  y: number; m: number; d: number; hour: number; gender: "男" | "女";
}
export interface BaziResult {
  pillars: { label: string; gan: string; zhi: string; shishen?: string }[];
  dayMaster: string;
  wx: Record<string, number>;
  strength: string;
  xiyong: string;
  geju: string;
  daYun: { start: number; gz: string; ten: string }[];
}

const G="甲乙丙丁戊己庚辛壬癸";
const Z="子丑寅卯辰巳午未申酉戌亥";
const GAN_WX=[0,0,1,1,2,2,3,3,4,4]; // 木木火火土土金金水水
const SHENG:Record<string,string>={"木":"火","火":"土","土":"金","金":"水","水":"木"};
const SHENG_ME:Record<string,string>={"木":"水","火":"木","土":"火","金":"土","水":"金"};
const KE:Record<string,string>={"木":"土","土":"水","水":"火","火":"金","金":"木"};
const KE_ME:Record<string,string>={"木":"金","土":"木","水":"土","火":"水","金":"火"};
const WX=["木","火","土","金","水"];
export function shishen(dm:string,other:string):string{
  const d=G.indexOf(dm),o=G.indexOf(other); if(d<0||o<0)return""; if(d===o)return"比肩";
  const yy=d%2===o%2; const dw=WX[GAN_WX[d]],ow=WX[GAN_WX[o]];
  if(SHENG[dw]===ow)return yy?"食神":"伤官";       // 我生
  if(SHENG_ME[dw]===ow)return yy?"偏印":"正印";    // 生我(同性偏印)
  if(KE[dw]===ow)return yy?"偏财":"正财";          // 我克
  if(KE_ME[dw]===ow)return yy?"七杀":"正官";       // 克我
  return"劫财";
}
function dayday(y:number):string{return G[((y-4)%10+10)%10]+Z[((y-4)%12+12)%12];}
export function calcBazi(inp:BaziInput):BaziResult{
  const solar=Solar.fromYmdHms(inp.y,inp.m,inp.d,Math.max(0,Math.min(23,inp.hour))||0,30,0);
  const lunar=solar.getLunar(); const ec=lunar.getEightChar();
  const Y=ec.getYear(), Mo=ec.getMonth(), D=ec.getDay(), T=ec.getTime();
  const pillars=[{label:"年柱",gan:Y[0],zhi:Y[1]},{label:"月柱",gan:Mo[0],zhi:Mo[1]},{label:"日柱",gan:D[0],zhi:D[1]},{label:"时柱",gan:T[0],zhi:T[1]}];
  const dm=D[0], dmIdx=G.indexOf(dm); if(dmIdx<0)throw new Error("bad dayMaster");
  // 五行计数(干支)
  const cnt:Record<string,number>={木:0,火:0,土:0,金:0,水:0};
  const zhWx=[4,2,0,0,2,1,1,2,3,3,2,4]; // 地支本气五行序0木..4水
  pillars.forEach(p=>{cnt[WX[GAN_WX[G.indexOf(p.gan)]]]=(cnt[WX[GAN_WX[G.indexOf(p.gan)]]]||0)+1;cnt[WX[zhWx[Z.indexOf(p.zhi)]]]=(cnt[WX[zhWx[Z.indexOf(p.zhi)]]]||0)+1;});
  // 身强弱: 助力=同我+生我
  const dmWx=WX[GAN_WX[dmIdx]];
  const helpWx=SHENG_ME[dmWx];
  const total=cnt.木+cnt.火+cnt.土+cnt.金+cnt.水;
  let help=cnt[dmWx]+(cnt[helpWx]||0); const ratio=total?help/total:0.5;
  const strength=ratio>0.58?"身强":(ratio<0.4?"身弱":"中和");
  // 格局: 月干十神对日主
  const mgShi=shishen(dm,Mo[0]);
  const gejuMap:Record<string,string>={"正官":"正官格","七杀":"七杀格","正印":"正印格","偏印":"偏印格","食神":"食神格","伤官":"伤官格","正财":"正财格","偏财":"偏财格"};
  const geju=gejuMap[mgShi]||(dmWx+"命");
  // 喜用神
  let xiyong="";
  if(strength==="身强"){ xiyong=WX.find(w=>w!==dmWx&&w!==helpWx)||WX[1]; }
  else if(strength==="身弱"){ xiyong=helpWx; } // 喜印生我
  else xiyong=dmWx;
  // 大运: 阳男阴女顺 / 阴男阳女逆, 月柱起, 每柱10年
  const yang=G.indexOf(Y[0])%2===0;
  const forward=(yang&&inp.gender==="男")||(!yang&&inp.gender==="女");
  const mgi=G.indexOf(Mo[0]), mzi=Z.indexOf(Mo[1]);
  // 起运岁数(近似, 由月内位置粗估)
  const qiMap:Record<string,number>={"子":1,"丑":3,"寅":2,"卯":2,"辰":4,"巳":6,"午":7,"未":6,"申":3,"酉":4,"戌":5,"亥":1};
  const qiYun=Math.max(1,Math.min(9,(qiMap[Mo[1]]||3)+(dmIdx%3)));
  // 逐柱大运[十神,干支]
  const daYun=[]; let cg=mgi, cz=mzi, startAge=qiYun;
  for(let k=0;k<8;k++){
    const ng=((cg+(forward?1:-1))%10+10)%10, nz=((cz+(forward?1:-1))%12+12)%12;
    cg=ng; cz=nz; startAge=k===0?qiYun:(daYun[k-1].start+10);
    daYun.push({start:startAge, gz:G[ng]+Z[nz], ten:shishen(dm,G[ng])});
  }
  return {pillars, dayMaster:dm+D[1], wx:cnt, strength, xiyong, geju, daYun};
}

