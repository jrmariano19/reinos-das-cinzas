import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {SETTLEMENTS} from '../src/territories.js';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const atlas=readFileSync(new URL('../preview/territories.html',import.meta.url),'utf8');

test('o atlas so descreve as seis localidades do catalogo',()=>{
 assert.equal(SETTLEMENTS.length,6);
 assert.match(atlas,/id="atlas"/);
 assert.match(atlas,/Somente jogáveis/);
 assert.match(atlas,/Em planejamento/);
 assert.match(atlas,/status==='playable'/);
 assert.match(atlas,/import \{SETTLEMENTS,getSettlement\} from '\.\.\/src\/territories\.js'/);
 const moduleCode=atlas.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
 assert.ok(moduleCode);
 assert.doesNotThrow(()=>new Script(moduleCode.replace(/^import .*;$/gm,'')));
});

test('descanso in-game preserva protecoes, movimento e save antigo',()=>{
 assert.match(html,/import\('\.\/src\/territories\.js'\)/);
 assert.match(html,/function applyRestingRegeneration\(now\)/);
 assert.match(html,/applyRestingRegeneration\(now\);/);
 assert.match(html,/liveSafeSettlement\(player\.floor,player\.x,player\.y\)/);
 assert.match(html,/now-player\.moveCooldown>=1500/);
 assert.match(html,/seconds:1,idle,safe:inTown/);
 assert.match(html,/const SAVE_KEY = 'reinos-das-cinzas-save-v1'/);
 assert.match(html,/function isProtectionZone\(floor, x, y\)/);
 assert.match(html,/window\.movePlayer = function\(dx, dy\)/);
 assert.match(html,/id="worldMapCanvas"/);
 assert.match(html,/href="\.\/preview\/territories\.html"/);
 const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.equal(scripts.length,1);
 assert.doesNotThrow(()=>new Script(scripts[0][1],{filename:'index.html'}));
});

test('Atlas nao introduz salvamento proprio ou teleporte para locais inexistentes',()=>{
 assert.doesNotMatch(atlas,/localStorage\.(setItem|removeItem|clear)/);
 assert.doesNotMatch(atlas,/window\.location\.href=/);
 assert.doesNotMatch(atlas,/fetch\(/);
});
