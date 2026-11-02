import test from 'node:test';
import assert from 'node:assert/strict';
import {
 GAMEPLAY_ZOOM,ZOOM_MIN,ZOOM_MAX,clampZoom,distanceToHouse,
 shouldHideRoof,houseBlocksCamera,shouldHideRoofFromCamera,
 shouldShowHouseLabel,shouldShowActorLabel,isWorldNearby
} from '../src/live-world-visibility.js';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

const house={x:22,y:4,w:13,h:9};
const close={x:23,y:14};
const inside={x:24,y:10};
const far={x:3,y:34};

test('camera próxima é padrão e permite zoom limitado',()=>{
 assert.ok(GAMEPLAY_ZOOM<9.5);
 assert.ok(GAMEPLAY_ZOOM>ZOOM_MIN);
 assert.equal(clampZoom(-100),ZOOM_MIN);
 assert.equal(clampZoom(100),ZOOM_MAX);
 assert.equal(clampZoom(GAMEPLAY_ZOOM),GAMEPLAY_ZOOM);
 assert.throws(()=>clampZoom(Infinity),TypeError);
});
test('telhados próximos são escondidos apenas na camada visual',()=>{
 assert.equal(distanceToHouse(house,close.x,close.y),2);
 assert.equal(distanceToHouse(house,inside.x,inside.y),0);
 assert.equal(shouldHideRoof(house,close),true);
 assert.equal(shouldHideRoof(house,inside),true);
 assert.equal(shouldHideRoof(house,far),false);
 assert.deepEqual(house,{x:22,y:4,w:13,h:9});
});
test('telhados na linha de visão entre jogador e câmera deixam de obstruir',()=>{
 const p={x:10,y:10};
 const foreground={x:13,y:13,w:4,h:4};
 const behind={x:2,y:2,w:3,h:3};
 const side={x:16,y:2,w:3,h:3};
 assert.equal(shouldHideRoof(foreground,p),false);
 assert.equal(houseBlocksCamera(foreground,p,Math.PI/4),true);
 assert.equal(shouldHideRoofFromCamera(foreground,p,Math.PI/4),true);
 assert.equal(houseBlocksCamera(behind,p,Math.PI/4),false);
 assert.equal(houseBlocksCamera(side,p,Math.PI/4),false);
 assert.equal(shouldHideRoofFromCamera(behind,p,Math.PI/4),false);
 assert.equal(houseBlocksCamera(foreground,p,-Math.PI/4),false);
 assert.equal(houseBlocksCamera(foreground,p,Number.NaN),false);
});
test('herói recebe armadura detalhada e pose de ataque sincronizada com o combate real',()=>{
 const js=readFileSync(new URL('../src/live-world-3d.js',import.meta.url),'utf8');
 assert.match(js,/const cuirass=addBox\(body/);
 assert.match(js,/shield=new THREE.Group\(\)/);
 assert.match(js,/hero\.group\.scale\.setScalar\(isTouch\?1\.26:1\.16\)/);
 assert.match(js,/hero\.arms\[1\]\.rotation\.x=player\.attackAnimUntil>now/);
 assert.match(js,/hero\.mesh\.material=armorColor/);
 assert.match(js,/cameraAt\.lerp\(goal,\.19\)/);
});

test('só placas e NPCs próximos aparecem',()=>{
 assert.equal(shouldShowHouseLabel(house,close),true);
 assert.equal(shouldShowHouseLabel(house,far),false);
 assert.equal(shouldShowActorLabel({x:26,y:14},close),true);
 assert.equal(shouldShowActorLabel({x:49,y:14},close),false);
 assert.equal(isWorldNearby({x:25,y:8},close),true);
 assert.equal(isWorldNearby({x:55,y:8},close),false);
});
test('renderizador aplica visibilidade, marcador do herói e órbita',()=>{
 const js=readFileSync(new URL('../src/live-world-3d.js',import.meta.url),'utf8');
 assert.match(js,/shouldHideRoofFromCamera\(house,player,azimuth\)/);
 assert.match(js,/shouldShowHouseLabel\(house,player,isTouch\?4:7\)/);
 assert.match(js,/shouldShowActorLabel\(e,\{x:px,y:pz\},isTouch\?3\.3:6\)/);
 assert.match(js,/const heroRing=new THREE\.Mesh/);
 assert.match(js,/heroRing\.position\.set/);
 assert.match(js,/azimuth\+=delta\*\.008/);
 assert.match(js,/resetCamera\(\)/);
 assert.match(js,/zoom=GAMEPLAY_ZOOM/);
 assert.doesNotMatch(js,/localStorage/);
 const clean=js.replace(/import[\s\S]*?from\s+'[^']+';/g,'').replace(/\bexport\s+/g,'');
 assert.doesNotThrow(()=>new Script(clean));
});
test('interface de jogo permite zoom, mantém saves e fallback 2D',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 for(const id of ['live3dCameraControls','live3dZoomIn','live3dZoomOut','live3dZoomReset']){
  assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(html,/live3dWorld\?\.zoomIn\(\)/);
 assert.match(html,/live3dWorld\?\.zoomOut\(\)/);
 assert.match(html,/live3dWorld\?\.resetCamera\(\)/);
 assert.match(html,/function disableLive3D\(\)/);
 assert.match(html,/const SAVE_KEY = 'reinos-das-cinzas-save-v1'/);
 const code=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 assert.ok(code);
 assert.doesNotThrow(()=>new Script(code));
});
