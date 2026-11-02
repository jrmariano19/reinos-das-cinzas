import test from 'node:test';
import assert from 'node:assert/strict';
import {
 SETTLEMENTS,SETTLEMENT_BY_ID,visibleSettlements,getSettlement,
 liveSafeSettlement,locationServices,regenerationRates,regenerateVitals
} from '../src/territories.js';

test('duas localidades jogáveis e quatro planejadas, sem prometer mapas inexistentes',()=>{
 assert.equal(SETTLEMENTS.length,6);
 assert.equal(visibleSettlements().length,2);
 assert.deepEqual(visibleSettlements().map(x=>x.id),['valdoria','lanternas']);
 assert.equal(visibleSettlements(true).length,6);
 assert.equal(SETTLEMENT_BY_ID.noxara.status,'planned');
 assert.ok(SETTLEMENTS.every(x=>typeof x.visual==='string'&&x.visual.length>15));
});
test('continuidade com facções e serviços de equipamentos',()=>{
 assert.equal(getSettlement('valdoria').faction,'legiao');
 assert.equal(getSettlement('noxara').faction,'conclave');
 assert.ok(locationServices('valdoria').includes('forge'));
 assert.ok(locationServices('marisma').includes('party-hub'));
 assert.equal(getSettlement('inexistente'),null);
 assert.throws(()=>locationServices('inexistente'),RangeError);
});
test('zonas seguras preservam coordenadas da cidade e da vila antigas',()=>{
 assert.equal(liveSafeSettlement(0,3,3),'valdoria');
 assert.equal(liveSafeSettlement(0,53,39),'valdoria');
 assert.equal(liveSafeSettlement(0,2,3),null);
 assert.equal(liveSafeSettlement(0,20,40),null);
 assert.equal(liveSafeSettlement(1,10,6),'lanternas');
 assert.equal(liveSafeSettlement(1,34,17),'lanternas');
 assert.equal(liveSafeSettlement(1,35,17),null);
 assert.equal(liveSafeSettlement(-1,25,15),null);
 assert.equal(liveSafeSettlement(0,NaN,0),null);
});
test('descanso parado em zona segura tem recuperação dupla',()=>{
 const initial={hp:70,maxHp:100,mp:35,maxMp:80};
 assert.deepEqual(regenerationRates({safe:false,idle:true}),{hp:1,mp:.5});
 assert.deepEqual(regenerationRates({safe:true,idle:true}),{hp:2,mp:1});
 const safe=regenerateVitals(initial,{seconds:1,safe:true,idle:true});
 const wild=regenerateVitals(initial,{seconds:1,safe:false,idle:true});
 assert.equal(safe.hp,72);
 assert.equal(safe.mp,36);
 assert.equal(wild.hp,71);
 assert.equal(wild.mp,35.5);
 assert.deepEqual(regenerateVitals(initial,{seconds:1,safe:true,idle:false}),initial);
 assert.deepEqual(initial,{hp:70,maxHp:100,mp:35,maxMp:80});
});
test('regeneração respeita máximo, rejeita dados e tempos inválidos',()=>{
 const r=regenerateVitals({hp:99,maxHp:100,mp:79.8,maxMp:80},
  {seconds:1,idle:true,safe:true});
 assert.equal(r.hp,100);
 assert.equal(r.mp,80);
 assert.throws(()=>regenerateVitals({hp:20,maxHp:0,mp:10,maxMp:50},
   {seconds:1,idle:true,safe:true}),TypeError);
 assert.throws(()=>regenerateVitals({hp:20,maxHp:30,mp:10,maxMp:50},
   {seconds:2,idle:true,safe:true}),RangeError);
});
