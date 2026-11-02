import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {tileToWorld,worldToTile,tileCategory,obstacleKind,collectTileLayers,visibleActor}
 from '../src/live-world-contract.js';

const TILE={
 GRASS:0,STONE_FLOOR:1,DIRT_ROAD:2,CASTLE_WALL:3,GATE_ARCH:4,TREE:5,
 WATER:6,SEWER_GRATE:11,DUNGEON_FLOOR:13,DUNGEON_WALL:14,
 PINE:17,HOUSE_WALL:19,HOUSE_DOOR:20,FURNITURE:21,LANTERN:22,
 FOUNTAIN:23,MARKET_STALL:24,CHEST:31,PORTAL_EXIT:32,PORTAL_RETURN:33,
 CRYPT_WALL:26,STAIR_DOWN:27,STAIR_UP:28,BRIDGE:30,BARREL:44,CRATE:45,BENCH:46
};
const map=[
 [1,1,0,3],
 [2,19,20,5],
 [6,11,32,31],
 [13,14,4,33]
];
test('cada tile do mundo real vira um ponto 3D reversível',()=>{
 assert.deepEqual(tileToWorld(2,1,5),{x:2,y:5,z:1});
 assert.deepEqual(worldToTile(2,1,map),{x:2,y:1});
 assert.deepEqual(worldToTile(1.51,.6,map),{x:2,y:1});
 assert.deepEqual(worldToTile(-1,0,map),null);
 assert.deepEqual(worldToTile(99,0,map),null);
 assert.deepEqual(worldToTile(0,99,map),null);
 assert.deepEqual(worldToTile(Infinity,0,map),null);
 assert.throws(()=>tileToWorld(NaN,1),TypeError);
});
test('o terreno 3D usa os mesmos tipos de chão e obstáculo do mapa clássico',()=>{
 assert.equal(tileCategory(TILE.STONE_FLOOR,TILE),'stone');
 assert.equal(tileCategory(TILE.DIRT_ROAD,TILE),'road');
 assert.equal(tileCategory(TILE.GRASS,TILE),'grass');
 assert.equal(tileCategory(TILE.WATER,TILE),'water');
 assert.equal(obstacleKind(TILE.CASTLE_WALL,TILE),'wall');
 assert.equal(obstacleKind(TILE.HOUSE_DOOR,TILE),'door');
 assert.equal(obstacleKind(TILE.TREE,TILE),'tree');
 assert.equal(obstacleKind(TILE.SEWER_GRATE,TILE),'portal');
 assert.equal(obstacleKind(TILE.PORTAL_EXIT,TILE),'portal');
 assert.equal(obstacleKind(TILE.CHEST,TILE),'prop');
 assert.equal(obstacleKind(TILE.STONE_FLOOR,TILE),null);
});
test('camadas agrupam cada coordenada uma única vez, sem alterar o mapa',()=>{
 const before=JSON.stringify(map);
 const {ground,obstacles}=collectTileLayers(map,TILE);
 const all=[...ground.values()].flat();
 assert.equal(all.length,16);
 assert.equal(new Set(all.map(([x,y])=>x+':'+y)).size,16);
 assert.deepEqual(obstacles.get('door'),[[2,1,TILE.HOUSE_DOOR]]);
 assert.ok(obstacles.get('portal').length>=2);
 assert.equal(JSON.stringify(map),before);
 assert.throws(()=>collectTileLayers([],TILE),TypeError);
});
test('atores de outro andar e monstros mortos não aparecem na visão 3D',()=>{
 assert.equal(visibleActor({x:4,y:8,floor:0,dead:false},0),true);
 assert.equal(visibleActor({x:4,y:8,floor:1,dead:false},0),false);
 assert.equal(visibleActor({x:4,y:8,floor:0,dead:true},0),false);
 assert.equal(visibleActor({x:NaN,y:8,floor:0,dead:false},0),false);
});
test('renderizador 3D é importável e mapeia estado real para cliques do jogo',()=>{
 const source=readFileSync(new URL('../src/live-world-3d.js',import.meta.url),'utf8');
 assert.match(source,/https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.160\.1/);
 assert.match(source,/collectTileLayers\(map,TILE\)/);
 assert.match(source,/worldToTile\(point\.x,point\.z,activeLayer\.map\)/);
 assert.match(source,/onSelectTile\(tile\.x,tile\.y\)/);
 assert.match(source,/onSelectTile\(e\.x,e\.y\)/);
 assert.match(source,/updateDoors\(floor,openDoors\)/);
 assert.match(source,/renderCorpses\(corpses,floor,player\.x,player\.y\)/);
 assert.match(source,/visibleActor\(e,floor\)/);
 assert.doesNotMatch(source,/localStorage/);
 assert.doesNotMatch(source,/world\.location/);
 const withoutImports=source.replace(/import[\s\S]*?from\s+'[^']+';/g,'')
  .replace(/\bexport\s+/g,'');
 assert.doesNotThrow(()=>new Script(withoutImports,{filename:'live-world-3d.js'}));
});
test('a tela principal usa o novo renderer mas mantém lógica antiga e fallback',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(html,/id="live3dCanvas"/);
 assert.match(html,/id="live3dToggle"/);
 assert.match(html,/import\('\.\/src\/live-world-3d\.js'\)/);
 assert.match(html,/map:maps\[player\.floor\],floor:player\.floor,player,entities,houses,corpses,openDoors,now/);
 assert.match(html,/onSelectTile:\(x,y\)=>handleWorldTileSelection\(x,y\)/);
 assert.match(html,/function disableLive3D\(\)/);
 assert.match(html,/new URLSearchParams\(window\.location\.search\)\.get\('view'\)==='3d'/);
 assert.match(html,/function handleWorldTileSelection\(tileX, tileY\)/);
 assert.match(html,/const SAVE_KEY = 'reinos-das-cinzas-save-v1'/);
 assert.match(html,/function checkFloorTransition\(\)/);
 assert.match(html,/function isTileBlocked\(floor, x, y, ignoreEntityId = null\)/);
 assert.doesNotMatch(html,/localStorage\.clear\(\)/);
 const js=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.equal(js.length,1);
 assert.doesNotThrow(()=>new Script(js[0][1],{filename:'index.html'}));
});
