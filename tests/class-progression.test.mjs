import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {CLASSES} from '../src/class-catalog.js';
import {applyFirstClassChoice,levelGrowth,SKILL_1_COSTS} from '../src/class-progression.js';

const legacy=()=>({
 name:'Ivo',classId:null,level:6,atk:51,def:34,
 hp:300,maxHp:355,mp:95,maxMp:155,
 gold:825,questCompleted:true,weaponTier:2,
 lootBag:[{id:'item1',name:'Pedra',qty:3}]
});
test('as oito classes têm avanço por nível e custo de habilidade',()=>{
 assert.equal(CLASSES.length,8);
 for(const cls of CLASSES){
  const g=levelGrowth(cls.id);
  const cost=SKILL_1_COSTS[cls.id];
  assert.ok(g.hp>0 && g.mp>0 && g.attack>0 && g.defense>0);
  assert.ok(cost.mana>0 && cost.cooldown>=1000);
 }
});
test('seleção de classe mantém nível, ouro, inventário e bônus de missões',()=>{
 const before=legacy();
 const after=applyFirstClassChoice(before,'sentinela');
 assert.equal(before.classId,null);
 assert.equal(after.classId,'sentinela');
 assert.equal(after.title,'Sentinela de Ferro');
 assert.equal(after.level,6);
 assert.equal(after.gold,825);
 assert.equal(after.weaponTier,2);
 assert.deepEqual(after.lootBag,before.lootBag);
 assert.equal(after.questCompleted,true);
 // No nível 6: ATQ legado 24+3*5 = 39; bônus obtido 12 deve continuar.
 const expectedAttack=Math.round(51+(18-24)+(2.2-3)*5);
 assert.equal(after.atk,expectedAttack);
 assert.equal(after.maxHp,355+240-180+(42-35)*5);
 assert.ok(after.hp>0 && after.hp<=after.maxHp);
});
test('classes frágeis mantêm status positivo ao migrar herói',()=>{
 const before=legacy();
 const after=applyFirstClassChoice(before,'arcanista');
 assert.ok(after.maxHp>=60);
 assert.ok(after.maxMp>=25);
 assert.ok(after.hp<=after.maxHp && after.mp<=after.maxMp);
 assert.equal(before.hp,300);
});
test('classe não pode ser sobrescrita sem migração explícita',()=>{
 const after=applyFirstClassChoice(legacy(),'vigia');
 assert.throws(()=>applyFirstClassChoice(after,'devota'),/já definida/);
 assert.throws(()=>applyFirstClassChoice(legacy(),'fantasma'),RangeError);
 assert.throws(()=>applyFirstClassChoice({...legacy(),level:0},'sentinela'),TypeError);
});
test('motor atual tem modal, persiste classId e habilita a tecla de classe',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(html,/id="classChoiceModal"/);
 assert.match(html,/id="chooseClassButton"/);
 assert.match(html,/id="playerClassTitle"/);
 assert.match(html,/function castTierOneClassSkill\(now\)/);
 assert.match(html,/classApi\.applyFirstClassChoice\(player,chosen\.id\)/);
 assert.match(html,/classReadyPromise\.then\(api=>/);
 assert.match(html,/\x27contract\x27,\x27contractsCompleted\x27,\x27cameraRows\x27,\x27classId\x27/);
 assert.match(html,/const SAVE_KEY = 'reinos-das-cinzas-save-v1'/);
 assert.match(html,/if\(player\.classId && slot>=1 && slot<=4\)/);
 assert.match(html,/if\(player\.level<ability\.unlockLevel\)/);
 assert.match(html,/else addLog\(ability\.name\+' \(Tier '\+slot\+'\) ainda está em desenvolvimento\.'/);
 assert.match(html,/slot\.setAttribute\('aria-disabled',String\(!implemented\)\)/);
 assert.match(html,/if\(player\.classId\)refreshClassSkillLabel\(\)/);
 const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.equal(inline.length,1);
 assert.doesNotThrow(()=>new Script(inline[0][1]));
});
test('laboratório solicita confirmação no jogo sem modificar save sozinho',()=>{
 const lab=readFileSync(new URL('../preview/classes.html',import.meta.url),'utf8');
 assert.match(lab,/index\.html\?chooseClass=/);
 assert.doesNotMatch(lab,/localStorage\.(setItem|removeItem|clear)/);
});

test('classe escolhida não executa mais golpes legados nos slots 2–4',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const handler=html.slice(html.indexOf('window.triggerHotkey = function(slot)'),html.indexOf('function castTierOneClassSkill(now)'));
 assert.ok(handler.includes('player.classId && slot>=1 && slot<=4'));
 assert.ok(handler.includes('return;'));
 // Os consumíveis 5 e 6 continuam acessíveis por fora da guarda de classes.
 assert.match(html,/else if \(slot === 5\)/);
 assert.match(html,/else if \(slot === 6\)/);
 assert.match(html,/const savedFields = \[/);
});
