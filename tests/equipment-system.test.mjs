import test from 'node:test';
import assert from 'node:assert/strict';
import {
 GEAR_TEMPLATES,CLASS_START_WEAPONS,MIX_RECIPES,
 rollEquipment,isValidEquipment,itemBonuses,totalGearBonuses,
 equipFromBag,unequipToBag,agingOdds,agingCost,ageEquipped,mixEquipped
} from '../src/equipment-system.js';

const make=(id='gear-1',rng=()=>.45)=>rollEquipment({
 templateId:'espada',level:12,classId:'sentinela',id
},rng);
const inventory=()=>({level:12,gold:250000,lootBag:[make()],
 equippedGear:{weapon:null,armor:null}});

test('templates cobrem as oito classes',()=>{
 assert.equal(Object.keys(CLASS_START_WEAPONS).length,8);
 for(const id of Object.values(CLASS_START_WEAPONS))assert.equal(GEAR_TEMPLATES[id].slot,'weapon');
 assert.equal(Object.keys(MIX_RECIPES).length,2);
});
test('raridade, spec e atributos dependem do RNG, sem contaminar outros itens',()=>{
 const rolled=(id,rarity)=>{
  let i=0;
  const values=[rarity,.5];
  return make(id,()=>values[i++]);
 };
 const common=rolled('common',.8);
 const rare=rolled('rare',.1);
 const epic=rolled('epic',.02);
 assert.equal(common.rarity,'comum');
 assert.equal(rare.rarity,'raro');
 assert.equal(epic.rarity,'epico');
 assert.ok(epic.stats.attack>rare.stats.attack&&rare.stats.attack>common.stats.attack);
 assert.ok(itemBonuses(common,'sentinela').attack>itemBonuses(common,'vigia').attack);
 assert.equal(common.aging,0);assert.equal(common.mixId,null);
 assert.ok(isValidEquipment(common));
 assert.throws(()=>rollEquipment({templateId:'INVALID',level:5,id:'x'}),RangeError);
 assert.throws(()=>make('bad',()=>1),RangeError);
});
test('equipar e desequipar sao transacoes imutaveis',()=>{
 const before=inventory();
 const equip=equipFromBag(before,0);
 assert.equal(equip.lootBag.length,0);
 assert.equal(equip.equippedGear.weapon.id,'gear-1');
 assert.equal(before.lootBag.length,1);
 assert.equal(before.equippedGear.weapon,null);
 const result=unequipToBag(equip,'weapon');
 assert.equal(result.lootBag.length,1);
 assert.equal(result.equippedGear.weapon,null);
 assert.throws(()=>equipFromBag({...before,level:1},0),/Nivel insuficiente/);
});
test('aging tem limite, gasto de ouro e falha sem quebra precoce',()=>{
 const initial=equipFromBag(inventory(),0);
 const price=agingCost(initial.equippedGear.weapon);
 let result=ageEquipped(initial,'weapon',()=>0);
 assert.equal(result.outcome,'success');
 assert.equal(result.cost,price);
 assert.equal(result.state.gold,initial.gold-price);
 assert.equal(result.state.equippedGear.weapon.aging,1);
 assert.equal(initial.equippedGear.weapon.aging,0);
 const fails=ageEquipped(initial,'weapon',()=>.999);
 assert.equal(fails.outcome,'fail');
 assert.equal(fails.state.equippedGear.weapon.aging,0);
 assert.equal(agingOdds(0).destroy,0);
 assert.equal(agingOdds(10).destroy,.06);
 assert.throws(()=>agingOdds(20),RangeError);
});
test('aging avancado pode degradar ou destruir sem duplicar item',()=>{
 const before=equipFromBag(inventory(),0);
 const item={...before.equippedGear.weapon,aging:11};
 const state={...before,equippedGear:{...before.equippedGear,weapon:item}};
 const odds=agingOdds(11);
 const destroyed=ageEquipped(state,'weapon',()=>odds.success+.01);
 assert.equal(destroyed.outcome,'destroy');
 assert.equal(destroyed.state.equippedGear.weapon,null);
 assert.equal(destroyed.state.lootBag.length,0);
 const degraded=ageEquipped(state,'weapon',()=>odds.success+odds.destroy+.01);
 assert.equal(degraded.outcome,'degrade');
 assert.equal(degraded.state.equippedGear.weapon.aging,10);
});
test('mixing consome materiais uma unica vez e aplica bonus fixo',()=>{
 const equipped=equipFromBag(inventory(),0);
 const state={...equipped,lootBag:[
  {id:'core-brasa',type:'material',name:'Nucleo de Brasa',qty:3},
  {id:'apple',type:'food',qty:1}
 ]};
 const result=mixEquipped(state,'weapon','brasa');
 assert.equal(result.state.equippedGear.weapon.mixId,'brasa');
 assert.equal(result.state.gold,state.gold-200);
 assert.equal(result.state.lootBag[0].qty,1);
 assert.equal(state.lootBag[0].qty,3);
 assert.equal(itemBonuses(result.state.equippedGear.weapon,'sentinela').attack-
 itemBonuses(state.equippedGear.weapon,'sentinela').attack,4);
 assert.throws(()=>mixEquipped(result.state,'weapon','brasa'),/ja recebeu/);
 assert.throws(()=>mixEquipped(state,'weapon','bastiao'),/incompat/);
 assert.throws(()=>mixEquipped({...state,lootBag:[]},'weapon','brasa'),/Materiais/);
 assert.equal(totalGearBonuses(result.state.equippedGear,'sentinela').attack,
 itemBonuses(result.state.equippedGear.weapon,'sentinela').attack);
});
