import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

const file = readFileSync(new URL('../preview/valdoria-3d.html', import.meta.url), 'utf8');
const moduleBody = file.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];

test('nova prévia 3D tem módulo válido e importmap versionado',()=>{
 assert.ok(moduleBody, 'existe script de renderização');
 assert.match(file, /type="importmap"/);
 assert.match(file, /three@0\.160\.1/);
 assert.doesNotThrow(()=>new Script(moduleBody.replace(/^import .*;$/gm,'')));
});

test('arquitetura original inclui cidade, serviços, profundidade e iluminação',()=>{
 for(const building of ['forge','guild','inn','market','temple']) {
   assert.match(moduleBody,new RegExp("makeBuilding\\('"+building+"'"));
 }
 assert.match(moduleBody,/PerspectiveCamera/);
 assert.match(moduleBody,/shadowMap\.enabled=true/);
 assert.match(moduleBody,/roofMaterial/);
 assert.match(moduleBody,/textureStone/);
 assert.match(moduleBody,/watchTower/);
 assert.match(moduleBody,/marketStall/);
});

test('controles interativos e estado de carregamento',()=>{
 for(const id of ['home','aerial','street','day','night','closeInfo']) {
   assert.match(file,new RegExp('id="'+id+'"'));
 }
 assert.match(moduleBody,/raycaster\.intersectObjects/);
 assert.match(file,/id="error"/);
 assert.match(file,/window\.addEventListener\('unhandledrejection'/);
});

test('arte de estudo não altera o jogo principal',()=>{
 assert.doesNotMatch(file,/reinos-das-cinzas-save-v1/);
 assert.doesNotMatch(file,/localStorage\.setItem/);
});
