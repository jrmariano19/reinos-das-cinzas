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

test('moradores 3D possuem rotas, personagens animados e interações',()=>{
 assert.match(moduleBody,/import \{createPatrol, advancePatrol\} from '\.\.\/src\/valdoria-citylife\.js'/);
 assert.match(moduleBody,/function makeResident/);
 assert.match(moduleBody,/function updateResidents/);
 assert.match(moduleBody,/advancePatrol\(actor\.patrol,dt\)/);
 assert.match(moduleBody,/raycaster\.intersectObjects\(pickTargets,false\)/);
 assert.match(moduleBody,/function updateForgeEffects/);
 for(const name of ['Capitã Elra','Bran, Ferreiro','Mara, Mercadora','Élio, Mensageiro','Pavo, Escriba']){
   assert.ok(moduleBody.includes(name),name+' na cena');
 }
 assert.match(file,/id="citizens"/);
});

test('pavimentação e câmera não repetem o defeito do piso listrado',()=>{
 assert.match(moduleBody,/function textureEarth\(/);
 assert.match(moduleBody,/const foundation=block\(scene,86,\.65,88,0,-\.1,0,earth,false\)/);
 assert.match(moduleBody,/const northSouth=block\(scene,9,\.18,111,0,\.39,0,northRoad,false\)/);
 assert.match(moduleBody,/const eastWest=block\(scene,111,\.18,9,0,\.39,0,eastRoad,false\)/);
 assert.match(moduleBody,/const centerPlaza=cylinder\(scene,18\.8,18\.8,\.24,0,\.49,0,plazaPaving,56\)/);
 assert.match(moduleBody,/camera\.position\.set\(45,33,52\)/);
 assert.match(moduleBody,/scene\.fog=new THREE\.FogExp2\('#a4b6bc',\.0026\)/);
 assert.doesNotMatch(moduleBody,/const foundation=block\(scene,70,\.65,71,0,-\.05,0,cobble,false\)/);
});
  
test('arte de estudo não altera o jogo principal',()=>{
 assert.doesNotMatch(file,/reinos-das-cinzas-save-v1/);
 assert.doesNotMatch(file,/localStorage\.setItem/);
});
