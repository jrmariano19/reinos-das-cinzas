/**
 * REINOS DAS CINZAS - Equipamentos originais v0.1.
 * Gerador com RNG injetavel, sem IO e sem depender de Canvas/DOM.
 * O navegador e apenas um prototipo; um MMO real exige validacao no servidor.
 */
export const GEAR_TEMPLATES=Object.freeze({
 espada:{name:'Lamina de Cinza',icon:'⚔️',slot:'weapon',attack:12,defense:0,absorption:0,block:0,weight:10},
 machado:{name:'Machado de Escoria',icon:'🪓',slot:'weapon',attack:17,defense:0,absorption:0,block:0,weight:15},
 arco:{name:'Arco da Vigilia',icon:'🏹',slot:'weapon',attack:14,defense:0,absorption:0,block:0,weight:6},
 besta:{name:'Besta Runica',icon:'🏹',slot:'weapon',attack:14,defense:0,absorption:0,block:0,weight:9},
 cajado:{name:'Cajado do Veu',icon:'🪄',slot:'weapon',attack:13,defense:0,absorption:0,block:0,weight:5},
 cetro:{name:'Cetro da Aurora',icon:'✨',slot:'weapon',attack:10,defense:1,absorption:0,block:0,weight:4},
 orbe:{name:'Orbe dos Ecos',icon:'🔮',slot:'weapon',attack:11,defense:1,absorption:0,block:0,weight:3},
 adagas:{name:'Adagas da Noite',icon:'🗡️',slot:'weapon',attack:16,defense:0,absorption:0,block:0,weight:4},
 escudo:{name:'Escudo do Bastiao',icon:'🛡️',slot:'armor',attack:0,defense:8,absorption:1,block:10,weight:12},
 armadura:{name:'Couraca de Valdoria',icon:'🛡️',slot:'armor',attack:0,defense:10,absorption:2,block:0,weight:14},
 manto:{name:'Manto das Cinzas',icon:'🥋',slot:'armor',attack:0,defense:5,absorption:1,block:0,weight:4}
});
export const CLASS_START_WEAPONS=Object.freeze({
 sentinela:'espada',colosso:'machado',vigia:'arco',artifice:'besta',
 arcanista:'cajado',devota:'cetro',tecelao:'orbe',espectro:'adagas'
});
export const MIX_RECIPES=Object.freeze({
 brasa:{name:'Selo da Brasa',material:'core-brasa',qty:2,gold:200,attack:4,defense:0,absorption:0,block:0},
 bastiao:{name:'Selo do Bastiao',material:'core-brasa',qty:2,gold:200,attack:0,defense:3,absorption:1,block:0}
});
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
function getRoll(random){
 const r=random();
 if(!Number.isFinite(r)||r<0||r>=1)throw new RangeError('RNG deve retornar valor no intervalo [0,1)');
 return r;
}
export function rollEquipment({templateId,level=1,classId=null,id},random=Math.random){
 const t=GEAR_TEMPLATES[templateId];
 if(!t||!Number.isInteger(level)||level<1||level>120||typeof id!=='string'||!id.trim()||id.length>120)
   throw new RangeError('Dados do equipamento invalidos');
 if(classId!==null && !Object.hasOwn(CLASS_START_WEAPONS,classId))
   throw new RangeError('Especializacao de classe invalida');
 const rarityRoll=getRoll(random),qualityRoll=getRoll(random);
 const rarity=rarityRoll<.04?'epico':rarityRoll<.19?'raro':'comum';
 const rarityBonus=rarity==='epico'?1.35:rarity==='raro'?1.15:1;
 const scale=1+Math.floor((level-1)/10)*.23;
 const quality=.90+qualityRoll*.20;
 const v=field=>t[field]?Math.max(1,Math.round(t[field]*scale*rarityBonus*quality)):0;
 return {
  id,type:'equipment',templateId,slot:t.slot,icon:t.icon,
  name:t.name,rarity,requiredLevel:Math.max(1,Math.floor((level-1)/10)*10+1),
  specClass:classId,aging:0,mixId:null,qty:1,weight:t.weight,
  stats:{attack:v('attack'),defense:v('defense'),absorption:v('absorption'),block:v('block')}
 };
}
export function isValidEquipment(item){
 return !!item && item.type==='equipment' && typeof item.id==='string' &&
  item.id.length>0 && item.id.length<=120 && Object.hasOwn(GEAR_TEMPLATES,item.templateId) &&
  GEAR_TEMPLATES[item.templateId].slot===item.slot &&
  Number.isInteger(item.requiredLevel) && item.requiredLevel>=1 && item.requiredLevel<=120 &&
  Number.isInteger(item.aging) && item.aging>=0 && item.aging<=20 &&
  (item.mixId===null||Object.hasOwn(MIX_RECIPES,item.mixId)) &&
  item.stats && ['attack','defense','absorption','block'].every(k=>
    Number.isInteger(item.stats[k]) && item.stats[k]>=0 && item.stats[k]<=5000);
}
export function itemBonuses(item,classId=null){
 if(!item)return {attack:0,defense:0,absorption:0,block:0};
 if(!isValidEquipment(item))throw new TypeError('Equipamento corrompido');
 const specBonus=item.specClass && item.specClass===classId?1.08:1;
 const agingMult=1+item.aging*.055;
 const mix=item.mixId?MIX_RECIPES[item.mixId]:null;
 const stats=item.stats;
 return {
  attack:Math.round(stats.attack*agingMult*specBonus)+(mix?.attack||0),
  defense:Math.round(stats.defense*agingMult*specBonus)+(mix?.defense||0),
  absorption:stats.absorption+Math.floor(item.aging/4)+(mix?.absorption||0),
  block:stats.block+(mix?.block||0)
 };
}
export function totalGearBonuses(equipped,classId){
 const sums={attack:0,defense:0,absorption:0,block:0};
 for(const slot of ['weapon','armor']){
  const one=itemBonuses(equipped?.[slot],classId);
  for(const key of Object.keys(sums))sums[key]+=one[key];
 }
 return sums;
}
/** A troca retorna estado novo, sem mutar inventario ou item antigo. */
export function equipFromBag(state,index){
 const bag=state?.lootBag;
 if(!Array.isArray(bag)||!Number.isInteger(index)||index<0||index>=bag.length)
   throw new RangeError('Indice invalido');
 const item=bag[index];
 if(!isValidEquipment(item))throw new TypeError('Item nao equipavel');
 if(!Number.isInteger(state.level)||state.level<item.requiredLevel)
   throw new RangeError('Nivel insuficiente para equipar');
 const current=state.equippedGear||{weapon:null,armor:null};
 if(Object.values(current).some(v=>v&&v.id===item.id))throw new Error('Item duplicado');
 const nextBag=bag.filter((_,i)=>i!==index);
 if(current[item.slot])nextBag.push({...current[item.slot]});
 return {...state,lootBag:nextBag,equippedGear:{...current,[item.slot]:{...item}}};
}
export function unequipToBag(state,slot){
 if(!['weapon','armor'].includes(slot))throw new RangeError('Slot desconhecido');
 const current=state?.equippedGear?.[slot];
 if(!isValidEquipment(current))throw new Error('Slot vazio ou invalido');
 return {...state,lootBag:[...state.lootBag,{...current}],
  equippedGear:{...state.equippedGear,[slot]:null}};
}
export function agingOdds(current){
 if(!Number.isInteger(current)||current<0||current>=20)
   throw new RangeError('Aging fora do intervalo');
 if(current<4)return {success:.95,degrade:0,destroy:0};
 if(current<10)return {success:.78,degrade:.15,destroy:0};
 const success=clamp(.58-(current-10)*.035,.24,.58);
 const destroy=clamp(.06+(current-10)*.024,.06,.28);
 return {success,degrade:.22,destroy};
}
export function agingCost(item){
 if(!isValidEquipment(item)||item.aging>=20)throw new RangeError('Equipamento no limite');
 return Math.round(100*(item.aging+1)**1.45);
}
/** Falha sem break antes do +11; destruicao so e possivel a partir do +11. */
export function ageEquipped(state,slot,random=Math.random){
 if(!['weapon','armor'].includes(slot))throw new RangeError('Slot invalido');
 const item=state?.equippedGear?.[slot];
 if(!isValidEquipment(item))throw new TypeError('Equipamento invalido ou ausente');
 const cost=agingCost(item);
 if(!Number.isFinite(state.gold)||state.gold<cost)throw new RangeError('Ouro insuficiente');
 const odds=agingOdds(item.aging),r=getRoll(random);
 let outcome='fail',nextItem={...item};
 if(r<odds.success){outcome='success';nextItem.aging++;}
 else if(r<odds.success+odds.destroy){outcome='destroy';nextItem=null;}
 else if(r<odds.success+odds.destroy+odds.degrade){
  outcome='degrade';nextItem.aging=Math.max(0,nextItem.aging-1);
 }
 return {outcome,cost,state:{...state,gold:state.gold-cost,
   equippedGear:{...state.equippedGear,[slot]:nextItem}}};
}
export function mixEquipped(state,slot,recipeId){
 if(!['weapon','armor'].includes(slot))throw new RangeError('Slot invalido');
 const recipe=MIX_RECIPES[recipeId],item=state?.equippedGear?.[slot];
 if(!recipe||!isValidEquipment(item))throw new RangeError('Receita ou item invalido');
 if(item.mixId)throw new Error('Item ja recebeu um selo');
 if(recipeId==='brasa'&&slot!=='weapon'||recipeId==='bastiao'&&slot!=='armor')
   throw new RangeError('Receita incompatível com o slot');
 if(!Number.isFinite(state.gold)||state.gold<recipe.gold)throw new RangeError('Ouro insuficiente');
 const bag=Array.isArray(state.lootBag)?state.lootBag:[];
 const total=bag.reduce((n,i)=>n+(i.id===recipe.material&&i.type==='material'?Math.max(0,Math.floor(i.qty||1)):0),0);
 if(total<recipe.qty)throw new RangeError('Materiais insuficientes');
 let remaining=recipe.qty;
 const updatedBag=[];
 for(const element of bag){
  const amount=element.id===recipe.material&&element.type==='material'?Math.max(0,Math.floor(element.qty||1)):0;
  const used=Math.min(amount,remaining);
  remaining-=used;
  if(used<amount)updatedBag.push({...element,qty:amount-used});
  else if(amount===0)updatedBag.push(element);
 }
 return {cost:recipe.gold,state:{...state,gold:state.gold-recipe.gold,lootBag:updatedBag,
   equippedGear:{...state.equippedGear,[slot]:{...item,mixId:recipeId}}}};
}
