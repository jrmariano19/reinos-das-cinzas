import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {GEAR_TEMPLATES} from '../src/equipment-system.js';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];

test('o script original permanece sintaticamente valido',()=>{
 assert.equal(inline.length,1);
 assert.doesNotThrow(()=>new Script(inline[0][1],{filename:'index.html'}));
});
test('forja runica e mochila integram o modulo sem remover o legado',()=>{
 assert.match(html,/import\('\.\/src\/equipment-system\.js'\)/);
 for(const id of ['runeForgeDetails','ageRuneWeapon','mixRuneWeapon',
  'ageRuneArmor','mixRuneArmor','unequipRuneWeapon','unequipRuneArmor']){
  assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(html,/window\.ageRuneGear=function\(slot\)/);
 assert.match(html,/window\.mixRuneGear=function\(slot,recipeId\)/);
 assert.match(html,/window\.unequipRuneGear=function\(slot\)/);
 assert.match(html,/equipmentApi\.equipFromBag\(player,idx\)/);
 assert.match(html,/if\(player\.classId\)\{[\s\S]*?use a Forja Rúnica/);
});
test('classes, missões e saves antigos continuam na mesma chave',()=>{
 assert.match(html,/const SAVE_KEY = 'reinos-das-cinzas-save-v1'/);
 assert.match(html,/\x27classId\x27,\x27equippedGear\x27,\x27starterEquipmentGranted\x27/);
 assert.match(html,/player\.equippedGear=\{[\s\S]*?weapon:api\.isValidEquipment/);
 assert.match(html,/const restored = restoreProgress\(\)/);
 assert.match(html,/function castTierOneClassSkill/);
 assert.match(html,/const FORGE_COSTS=\[450,900,1500,2400\]/);
});
test('monstros geram saques de material e itens com RNG isolado',()=>{
 assert.match(html,/corpseItems\.push\(equipmentApi\.rollEquipment\(/);
 assert.match(html,/id:'core-brasa'/);
 assert.match(html,/mob\.isBoss\?2:1/);
 assert.match(html,/addItemToBag\(it,quantity\)/);
});
test('item equipado impacta ataque, defesa e absorcao',()=>{
 assert.match(html,/gearBonuses\(\)\.attack/);
 assert.match(html,/gearBonuses\(\)\.defense/);
 assert.match(html,/gearBonuses\(\)\.absorption\*\.02/);
 assert.ok(Object.keys(GEAR_TEMPLATES).length>=8);
});
