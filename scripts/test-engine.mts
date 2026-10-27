import { calcBazi } from "../src/lib/engine/bazi.ts";
import { calcZiwei } from "../src/lib/engine/ziwei.ts";

let pass = 0, fail = 0;
function ok(name: string, cond: boolean, extra = "") {
  if (cond) { pass++; console.log("✓", name, extra); }
  else { fail++; console.log("✗", name, extra); }
}

// —— 八字锚点 ——
const b1 = calcBazi({ y: 1988, m: 5, d: 20, hour: 20, gender: "女" });
ok("八字四柱 1988-5-20戌时 = 戊辰丁巳乙亥丙戌",
  b1.pillars.map(p => p.gan + p.zhi).join("") === "戊辰丁巳乙亥丙戌",
  b1.pillars.map(p => p.gan + p.zhi).join(" "));
ok("日主/格局/喜用", b1.dayMaster === "乙亥" && b1.geju === "食神格" && b1.xiyong === "水",
  `${b1.dayMaster} ${b1.strength} ${b1.geju} 喜${b1.xiyong}`);
ok("大运逆行(阴年女)", b1.daYun[0].gz === "丙辰" && b1.daYun[0].ten === "伤官",
  b1.daYun.slice(0, 4).map(x => `${x.gz}(${x.ten})`).join(" "));

const b2 = calcBazi({ y: 2000, m: 1, d: 1, hour: 0, gender: "男" });
ok("八字四柱 2000-1-1子时 = 己卯丙子戊午壬子",
  b2.pillars.map(p => p.gan + p.zhi).join("") === "己卯丙子戊午壬子",
  b2.pillars.map(p => p.gan + p.zhi).join(" "));

// —— 紫微锚点（对齐 iztro 行业标准）——
const z1 = calcZiwei({ y: 1988, m: 5, d: 20, hour: 20, gender: "女" });
ok("紫微命宫/局/紫微/天府 = 己未/火六局/丑/卯",
  z1.minggz === "己未" && z1.wuxingju === "火六局" && z1.ziwei === "丑" && z1.tianfu === "卯",
  `${z1.minggz} ${z1.wuxingju} 紫微${z1.ziwei} 天府${z1.tianfu}`);
// 逐宫主星（对照 iztro：丑=紫微破军, 未=天相, 酉=武曲七杀）
ok("紫微布星丑宫=紫微破军",
  z1.stars["丑"]?.includes("紫微") && z1.stars["丑"]?.includes("破军"),
  `丑宫: ${z1.stars["丑"]?.join(",")}`);
ok("紫微布星未宫(命)=天相 酉宫=武曲七杀",
  z1.stars["未"]?.includes("天相") && z1.stars["酉"]?.includes("武曲") && z1.stars["酉"]?.includes("七杀"),
  `未:${z1.stars["未"]?.join(",")} 酉:${z1.stars["酉"]?.join(",")}`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
