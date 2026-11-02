/**
 * Bridge reversível de progressão: aplica uma classe sem apagar bônus obtidos no save legado.
 * O sistema atual usa 180/80/24/20 no nível 1 e ganho fixo 35/15/3/2 por nível.
 * O ajuste substitui somente a diferença das bases e dos ganhos por nível.
 */
import {CLASSES,getClass} from './class-catalog.js';

export const LEGACY_BASE=Object.freeze({hp:180,mp:80,attack:24,defense:20});
export const LEGACY_GROWTH=Object.freeze({hp:35,mp:15,attack:3,defense:2});
export const CLASS_GROWTH=Object.freeze({
 sentinela:{hp:42,mp:9,attack:2.2,defense:2.4},
 colosso:{hp:35,mp:8,attack:3.1,defense:1.5},
 vigia:{hp:24,mp:12,attack:3.2,defense:1},
 artifice:{hp:27,mp:18,attack:2.5,defense:1.1},
 arcanista:{hp:19,mp:30,attack:3.25,defense:.75},
 devota:{hp:24,mp:26,attack:1.8,defense:1.05},
 tecelao:{hp:25,mp:26,attack:2.1,defense:1},
 espectro:{hp:25,mp:12,attack:3.4,defense:.9}
});
export const SKILL_1_COSTS=Object.freeze({
 sentinela:{mana:12,cooldown:10000},
 colosso:{mana:12,cooldown:5000},
 vigia:{mana:11,cooldown:4000},
 artifice:{mana:13,cooldown:5000},
 arcanista:{mana:16,cooldown:4500},
 devota:{mana:16,cooldown:3800},
 tecelao:{mana:12,cooldown:4400},
 espectro:{mana:12,cooldown:4000}
});
export function availableClasses(){return CLASSES;}
export function levelGrowth(classId){
 const growth=CLASS_GROWTH[classId];
 if(!growth)throw new RangeError('Classe desconhecida');
 return growth;
}
function finite(value){return typeof value==='number'&&Number.isFinite(value)}
function assertStats(stats){
 if(!stats||!Number.isInteger(stats.level)||stats.level<1||stats.level>120||
   !finite(stats.maxHp)||stats.maxHp<=0||!finite(stats.maxMp)||stats.maxMp<=0||
   !finite(stats.hp)||!finite(stats.mp)||!finite(stats.atk)||!finite(stats.def)) {
   throw new TypeError('Personagem inválido');
 }
}
/** Retorna uma cópia do save com modificações mínimas, sem alterar a entrada. */
export function applyFirstClassChoice(stats,classId){
 assertStats(stats);
 const cls=getClass(classId);
 if(!cls)throw new RangeError('Classe desconhecida');
 if(stats.classId)throw new Error('Classe já definida; troca requer migração futura');
 const g=levelGrowth(classId);
 const lv=stats.level-1;
 const adjusted=(original,baseKey)=>Math.max(baseKey==='defense'?0:1,Math.round(
  original + cls.base[baseKey]-LEGACY_BASE[baseKey]+(g[baseKey]-LEGACY_GROWTH[baseKey])*lv
 ));
 const newMaxHp=Math.max(60,adjusted(stats.maxHp,'hp'));
 const newMaxMp=Math.max(25,adjusted(stats.maxMp,'mp'));
 const hpRatio=Math.max(0,Math.min(1,stats.hp/stats.maxHp));
 const mpRatio=Math.max(0,Math.min(1,stats.mp/stats.maxMp));
 return {
  ...stats,
  classId, title:cls.name,
  maxHp:newMaxHp,maxMp:newMaxMp,
  hp:Math.max(1,Math.min(newMaxHp,Math.round(hpRatio*newMaxHp))),
  mp:Math.max(0,Math.min(newMaxMp,Math.round(mpRatio*newMaxMp))),
  atk:adjusted(stats.atk,'attack'),
  def:adjusted(stats.def,'defense')
 };
}
export function nextLevelStats(classId){
 return levelGrowth(classId);
}
