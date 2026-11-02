import test from 'node:test';
import assert from 'node:assert/strict';
import {CLASSES,FACTIONS,getClass,classSkillsAtLevel} from '../src/class-catalog.js';
import {tierForLevel,LEVEL_CAP,attributePointsForLevel,skillPointsForLevel} from '../src/class-balance.js';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

test('oito classes originais divididas entre duas facções',()=>{
 assert.equal(CLASSES.length,8);
 assert.equal(FACTIONS.length,2);
 assert.equal(new Set(CLASSES.map(c=>c.id)).size,8);
 for(const faction of FACTIONS)assert.equal(CLASSES.filter(c=>c.faction===faction.id).length,4);
});
test('cinco habilidades únicas por classe, uma por Tier',()=>{
 const skills=new Set();
 for(const c of CLASSES){
  assert.equal(c.skills.length,5);
  assert.deepEqual(c.skills.map(s=>s.tier),[1,2,3,4,5]);
  assert.deepEqual(c.skills.map(s=>s.unlockLevel),[1,20,40,60,80]);
  for(const skill of c.skills){assert.ok(!skills.has(skill.id));skills.add(skill.id)}
 }
 assert.equal(skills.size,40);
});
test('atributos iniciais com orçamento equilibrado',()=>{
 const attrs=['str','agi','int','vit','spr'];
 for(const c of CLASSES){
  assert.equal(Object.values(c.attributes).reduce((a,b)=>a+b,0),60,c.name);
  assert.deepEqual(Object.keys(c.attributes),attrs);
  for(const v of Object.values(c.base))assert.ok(v>0);
 }
});
test('habilidades e Tiers só desbloqueiam nos níveis previstos',()=>{
 for(const c of CLASSES){
  assert.equal(classSkillsAtLevel(c.id,1).length,1);
  assert.equal(classSkillsAtLevel(c.id,19).length,1);
  assert.equal(classSkillsAtLevel(c.id,20).length,2);
  assert.equal(classSkillsAtLevel(c.id,40).length,3);
  assert.equal(classSkillsAtLevel(c.id,60).length,4);
  assert.equal(classSkillsAtLevel(c.id,80).length,5);
  assert.equal(classSkillsAtLevel(c.id,LEVEL_CAP).length,5);
 }
 assert.equal(tierForLevel(80),5);
 assert.equal(attributePointsForLevel(1),0);
 assert.equal(skillPointsForLevel(20),10);
 assert.equal(getClass('invalid'),null);
 assert.throws(()=>classSkillsAtLevel('invalid',1),RangeError);
});
test('a seleção de classes não modifica saves do jogo',()=>{
 const html=readFileSync(new URL('../preview/classes.html',import.meta.url),'utf8');
 assert.match(html,/src\/class-catalog\.js/);
 assert.match(html,/id="select"/);
 assert.doesNotMatch(html,/localStorage\.(setItem|removeItem|clear)/);
 assert.doesNotMatch(html,/reinos-das-cinzas-save-v1/);
 const js=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
 assert.ok(js);
 assert.doesNotThrow(()=>new Script(js.replace(/^import .*;$/gm,'')));
});
