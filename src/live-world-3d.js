/**
 * REINOS DAS CINZAS — Renderer 3D do JOGO REAL (não é uma demo isolada).
 *
 * Renderiza as matrizes maps[floor], houses, entities e player recebidas do
 * index.html. A* / colisão / NPC / loot / quest / save CONTINUAM sob o jogo 2D.
 *
 * Assets geométricos originais provisórios, substituíveis por GLTF no futuro.
 * WebGL/Three.js opcional: se não carregar, jogo clássico continua intacto.
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import {
 collectTileLayers,worldToTile,tileToWorld,visibleActor
} from './live-world-contract.js';
import {
 GAMEPLAY_ZOOM,clampZoom,shouldHideRoofFromCamera,shouldShowHouseLabel,
 shouldShowActorLabel,isWorldNearby
} from './live-world-visibility.js';

const vec=(x,y,z)=>new THREE.Vector3(x,y,z);
const hex=(v)=>new THREE.Color(v);
const material=(color,roughness=.95,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const MAT={
 wall:material('#656d72'),wallLight:material('#93978f'),
 plaster:material('#c9bca5'),timber:material('#5d4435'),timberLight:material('#957050'),
 window:material('#8ed9df',.2,.12),door:material('#513828'),metal:material('#475562',.45,.55),
 gold:material('#c9a16a',.55,.28),skin:material('#d6a88a'),
 roofRed:material('#944c3d'),roofBlue:material('#465c77'),
 roofGreen:material('#647d64'),roofOchre:material('#a17d48'),
 stone:material('#777e7e'),water:material('#417f96',.35,.16),
 bark:material('#674d39'),leaf:material('#32634b'),leafLight:material('#4e865c'),
 iron:material('#434850'),scarlet:material('#a84f48'),amber:material('#f6b963'),
 monster:material('#8b4543'),monsterDark:material('#4d3334'),
}
function seededTexture(kind){
 const c=document.createElement('canvas');c.width=c.height=256;
 const ctx=c.getContext('2d');
 const backgrounds={
  stone:'#7a7974',road:'#725944',grass:'#466b4b',
  wood:'#765942',water:'#397d90',dungeon:'#525b64'
 };
 ctx.fillStyle=backgrounds[kind]||'#777';ctx.fillRect(0,0,256,256);
 let seed=[...kind].reduce((a,c)=>a*31+c.charCodeAt(0),117)>>>0;
 const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 if(kind==='stone'||kind==='dungeon'){
  ctx.fillStyle='#4b4b49';
  for(let y=-20,row=0;y<276;y+=29,row++){
   let x=-42+(row%2)*25;
   while(x<275){
    const width=33+Math.floor(rnd()*22);
    const value=kind==='stone'?105+Math.floor(rnd()*43):79+Math.floor(rnd()*32);
    ctx.fillStyle='rgb('+value+','+(value-1)+','+(value-3)+')';
    ctx.beginPath();ctx.moveTo(x+3,y+3);ctx.lineTo(x+width-3,y+4);
    ctx.lineTo(x+width-2,y+25);ctx.lineTo(x+4,y+26);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#2a2c2b89';ctx.lineWidth=2;ctx.stroke();
    x+=width+3;
   }
  }
 }else if(kind==='wood'){
  for(let x=0;x<256;x+=32){
   ctx.fillStyle=x%64===0?'#76583b':'#876846';ctx.fillRect(x+2,0,28,256);
   ctx.strokeStyle='#3e3026';ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,256);ctx.stroke();
  }
 }else if(kind==='road'){
  for(let i=0;i<135;i++){
   const x=rnd()*256,y=rnd()*256;
   ctx.fillStyle=rnd()>.55?'#a89573':'#5d493b';ctx.globalAlpha=.45+rnd()*.25;
   ctx.beginPath();ctx.ellipse(x,y,2+rnd()*7,1+rnd()*4,rnd()*Math.PI,0,Math.PI*2);ctx.fill();
  }
 }else if(kind==='grass'){
  for(let i=0;i<390;i++){
   ctx.fillStyle=rnd()>.58?'#6b8b55':'#274c41';ctx.globalAlpha=.2+rnd()*.6;
   const x=rnd()*256,y=rnd()*256;ctx.fillRect(x,y,1+rnd()*3,3+rnd()*8);
  }
 }else{
  for(let i=0;i<90;i++){
   const x=rnd()*256,y=rnd()*256;ctx.strokeStyle='#b0d2cc3e';
   ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+9,y-3,x+25,y+1);ctx.stroke();
  }
 }
 ctx.globalAlpha=1;
 const texture=new THREE.CanvasTexture(c);
 texture.colorSpace=THREE.SRGBColorSpace;
 texture.anisotropy=4;
 return texture;
}
const CLASS_COATS=Object.freeze({
 sentinela:material('#455f87'),colosso:material('#9e4e3a'),
 vigia:material('#557b53'),artifice:material('#94724c'),
 arcanista:material('#654e9b'),devota:material('#c8a66d'),
 tecelao:material('#427d82'),espectro:material('#5c597a')
});
const tileMaterials=Object.fromEntries(
 ['stone','road','grass','wood','water','dungeon'].map(k=>
  [k,new THREE.MeshStandardMaterial({
   map:seededTexture(k),color:k==='stone'?'#d0c8b5':'#ffffff',
   roughness:k==='water'?.37:1,side:THREE.DoubleSide
  })]
 )
);
const TILE_GEOMETRY=new THREE.PlaneGeometry(1,1);
TILE_GEOMETRY.rotateX(-Math.PI/2);
const UNIT_BOX=new THREE.BoxGeometry(1,1,1);
const UNIT_CYL=new THREE.CylinderGeometry(1,1,1,9);
const UNIT_CONE=new THREE.ConeGeometry(1,1,10);
const UNIT_SPHERE=new THREE.SphereGeometry(1,12,9);
const dummy=new THREE.Object3D();
function setInstance(mesh,i,x,y,z,sx=1,sy=1,sz=1,rotation=0){
 dummy.position.set(x,y,z);dummy.rotation.set(0,rotation,0);
 dummy.scale.set(sx,sy,sz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
}
function addBox(parent,w,h,d,x,y,z,mat,cast=true){
 const obj=new THREE.Mesh(UNIT_BOX,mat);
 obj.position.set(x,y,z);obj.scale.set(w,h,d);
 obj.castShadow=cast;obj.receiveShadow=true;parent.add(obj);return obj;
}
function addShape(parent,geometry,mat,x,y,z,scale=[1,1,1]){
 const mesh=new THREE.Mesh(geometry,mat);
 mesh.position.set(x,y,z);mesh.scale.set(...scale);
 mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function labelSprite(label,color='#f6dfb6',background='rgba(15,24,29,.85)'){
 const c=document.createElement('canvas');c.width=448;c.height=80;
 const t=c.getContext('2d');
 t.fillStyle=background;t.beginPath();t.roundRect(5,8,438,62,13);t.fill();
 t.strokeStyle='#bfa16b';t.lineWidth=3;t.stroke();
 t.font='bold 26px system-ui';t.textAlign='center';t.fillStyle=color;
 t.fillText(String(label).slice(0,34),224,49,420);
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({
  map:texture,transparent:true,depthTest:false,depthWrite:false
 }));
 sprite.scale.set(3.6,.64,1);
 return sprite;
}
function makeTree(group,x,z,pine){
 const g=new THREE.Group();g.position.set(x,0,z);group.add(g);
 addShape(g,UNIT_CYL,MAT.bark,0,1.1,0,[.12,2.2,.12]);
 if(pine){
  addShape(g,UNIT_CONE,MAT.leaf,0,2.45,0,[.95,2.4,.95]);
  addShape(g,UNIT_CONE,MAT.leafLight,0,3.13,0,[.68,1.72,.68]);
 }else{
  addShape(g,UNIT_SPHERE,MAT.leaf,0,2.65,0,[1.12,.88,1.05]);
  addShape(g,UNIT_SPHERE,MAT.leafLight,-.42,3.0,.15,[.69,.68,.73]);
 }
}
function makeDecoration(group,x,z,kind,tile,TILE){
 const g=new THREE.Group();g.position.set(x,0,z);group.add(g);
 if(kind==='flame'){
  addBox(g,.13,1.3,.13,0,.66,0,MAT.iron);
  addBox(g,.5,.22,.5,0,1.4,0,MAT.gold);
  const glow=addShape(g,UNIT_CONE,MAT.amber,0,1.73,0,[.18,.53,.18]);
  glow.castShadow=false;
 }else if(kind==='portal'){
  addShape(g,UNIT_CYL,MAT.stone,0,.12,0,[.58,.20,.58]);
  addShape(g,UNIT_CYL,MAT.gold,0,.23,0,[.46,.10,.46]);
  const core=addShape(g,UNIT_SPHERE,MAT.window,0,.37,0,[.29,.11,.29]);
  core.castShadow=false;
  if(tile===TILE.PORTAL_EXIT||tile===TILE.PORTAL_RETURN){
    for(const side of [-1,1])addBox(g,.14,1.6,.14,side*.48,.86,0,MAT.gold);
    addBox(g,1.15,.18,.26,0,1.65,0,MAT.stone);
  }
 }else if(kind==='fountain'){
  addShape(g,UNIT_CYL,MAT.stone,0,.31,0,[.54,.52,.54]);
  addShape(g,UNIT_CYL,MAT.water,0,.62,0,[.42,.07,.42]);
  addShape(g,UNIT_CYL,MAT.gold,0,.99,0,[.1,.66,.1]);
 }else if(kind==='stall'){
  for(const side of [-1,1])addBox(g,.09,1.18,.09,side*.42,.61,0,MAT.timber);
  addBox(g,1.1,.13,.89,0,1.19,0,MAT.scarlet);
  addBox(g,.8,.28,.59,0,.46,0,MAT.timber);
 }else if(kind==='prop'){
  if(tile===TILE.BARREL){
   addShape(g,UNIT_CYL,MAT.timber,0,.42,0,[.37,.82,.37]);
   addShape(g,UNIT_CYL,MAT.iron,0,.8,0,[.38,.08,.38]);
  }else if(tile===TILE.BENCH){
   addBox(g,1.3,.16,.43,0,.52,0,MAT.timber);
   addBox(g,1.3,.61,.13,0,.85,-.24,MAT.timber);
   addBox(g,.1,.45,.1,-.45,.23,0,MAT.iron);
   addBox(g,.1,.45,.1,.45,.23,0,MAT.iron);
  }else{
   addBox(g,.75,.65,.7,0,.35,0,MAT.timber);
   addBox(g,.8,.09,.8,0,.7,0,MAT.gold);
  }
 }else if(kind==='rock'){
  addShape(g,UNIT_SPHERE,MAT.stone,0,.37,0,[.6,.37,.58]);
 }
}
function buildHouse(house){
 const g=new THREE.Group();
 const cx=house.x+(house.w-1)/2,cz=house.y+(house.h-1)/2;
 g.position.set(cx,0,cz);
 const roof=new THREE.Group();g.add(roof);
 const width=house.w+.5,depth=house.h+.5,rise=Math.min(2.3,1.15+house.w*.11);
 const red=['brick','timber'].includes(house.style);
 const roofMat=red?MAT.roofRed:house.style==='moss'?MAT.roofGreen:house.style==='stone'?MAT.roofBlue:MAT.roofOchre;
 const half=width/2,slant=Math.hypot(half,rise);
 for(const sign of [-1,1]){
  const side=addBox(roof,slant+.2,.19,depth+.7,sign*half/2,2.95+rise/2,0,roofMat);
  side.rotation.z=-sign*Math.atan2(rise,half);
 }
 addBox(roof,.25,.23,depth+.7,0,2.95+rise,0,MAT.gold);
 // Distinctive silhouettes for forge, keep, cathedral and town hall.
 if(house.role==='forge'){
  addBox(roof,1.3,3.3,1.3,width*.24,3.8,-depth*.22,MAT.stone);
  addBox(roof,1.6,.38,1.6,width*.24,5.6,-depth*.22,MAT.wallLight);
 }else if(['keep','cathedral','tower'].includes(house.role)){
  const towerX=house.role==='cathedral'?-width*.31:width*.31;
  addBox(roof,1.65,3.0,1.65,towerX,4.2,-depth*.18,MAT.stone);
  const cap=addShape(roof,UNIT_CONE,roofMat,towerX,6.3,-depth*.18,[1.35,2.3,1.35]);
  cap.rotation.y=Math.PI/4;
 }else if(house.role==='inn'){
  addBox(roof,3,.3,1.6,0,2.8,depth*.52,MAT.timber);
 }
 // Windows show on the face along the street, regardless of render LOD.
 for(let dx=-width/2+1.8;dx<=width/2-1;dx+=2.7){
  if(Math.abs(dx)<1.8)continue;
  addBox(g,.78,.98,.11,dx,1.62,depth*.5+.09,MAT.window,false);
  addBox(g,.12,1.03,.15,dx,1.62,depth*.5+.17,MAT.timber,false);
  addBox(g,.81,.12,.15,dx,1.62,depth*.5+.18,MAT.gold,false);
 }
 // A nameplate above the street-side facade.
 const name=labelSprite(house.name,'#f5dfb4');
 name.position.set(0,5.3,depth*.5+.27);g.add(name);
 return {group:g,roof,sign:name,house};
}
function figure({player=false,monster=false,role='npc',name=''}){
 const body=new THREE.Group();
 const coat=player?MAT.roofRed:monster?MAT.monster:
  role==='npc'?MAT.roofBlue:MAT.leaf;
 const leg=monster?MAT.monsterDark:MAT.iron;
 const legs=[];
 const torso=addBox(body,.65,.91,.38,0,1.03,0,coat);
 addBox(body,.72,.14,.52,0,.60,0,MAT.gold);
 const head=addShape(body,UNIT_SPHERE,monster?MAT.monsterDark:MAT.skin,0,1.68,0,[.32,.34,.30]);
 if(!monster){
  addShape(body,UNIT_CONE,player?MAT.gold:MAT.iron,0,2.04,0,[.39,.54,.39]);
  addBox(body,.1,.38,.24,-.45,1.15,0,MAT.gold);
  addBox(body,.1,.38,.24,.45,1.15,0,MAT.gold);
 }else{
  for(const d of [-1,1]){
   const horn=addShape(body,UNIT_CONE,MAT.monsterDark,d*.26,2.03,0,[.14,.56,.14]);
   horn.rotation.z=d*.35;
  }
 }
 for(const d of [-1,1]){
  const l=new THREE.Group();l.position.set(d*.19,.60,0);body.add(l);
  addBox(l,.23,.62,.23,0,-.28,0,leg);
  legs.push(l);
 }
 let weapon=null,shield=null;
 const arms=[],armorPieces=[];
 if(player){
  // Armadura medieval original modelada por primitivas para a versão jogável.
  // O modelo acompanha a classe e permanece legível mesmo na câmera mobile.
  const cuirass=addBox(body,.78,.75,.49,0,1.11,.03,MAT.metal);
  armorPieces.push(cuirass);
  addBox(body,.20,.34,.085,0,1.11,.297,MAT.gold,false);
  addBox(body,.09,.44,.11,0,1.13,.35,MAT.window,false);
  addBox(body,.86,.17,.56,0,.65,.03,MAT.timber);
  addBox(body,.27,.13,.59,0,.70,.06,MAT.gold);
  const cape=addBox(body,.82,1.18,.10,0,.96,-.32,MAT.scarlet);
  cape.rotation.x=.12;
  const crest=addBox(body,.13,.32,.55,0,2.30,0,MAT.gold);
  crest.rotation.z=.08;
  addBox(body,.70,.17,.52,0,1.91,.01,MAT.iron);
  addBox(body,.62,.12,.55,0,1.79,.1,MAT.gold);
  for(const side of [-1,1]){
   const arm=new THREE.Group();
   arm.position.set(side*.50,1.43,.02);body.add(arm);
   const upper=addBox(arm,.30,.46,.40,side*.03,-.18,0,MAT.iron);
   const shoulder=addShape(arm,UNIT_SPHERE,MAT.metal,side*.025,.04,0,[.29,.20,.27]);
   armorPieces.push(shoulder);
   addBox(arm,.31,.26,.35,side*.04,-.50,.02,MAT.gold);
   addBox(arm,.24,.22,.31,side*.04,-.70,.02,MAT.iron);
   arms.push(arm);
  }
  // Escudo preso ao antebraço esquerdo, com centro dourado e borda de ferro.
  shield=new THREE.Group();arms[0].add(shield);
  shield.position.set(-.32,-.45,.27);
  addBox(shield,.55,.81,.12,0,-.02,0,MAT.metal);
  addBox(shield,.42,.67,.15,0,-.02,.09,MAT.roofBlue);
  addShape(shield,UNIT_SPHERE,MAT.gold,0,-.02,.18,[.14,.16,.065]);
  // Espada visível e animável no braço direito.
  weapon=new THREE.Group();arms[1].add(weapon);
  weapon.position.set(.12,-.78,.15);
  addBox(weapon,.10,.28,.11,0,-.03,0,MAT.timber);
  addBox(weapon,.44,.10,.16,0,.16,0,MAT.gold);
  addBox(weapon,.15,.85,.08,0,.60,0,MAT.wallLight);
  const tip=addShape(weapon,UNIT_CONE,MAT.wallLight,0,1.12,0,[.10,.28,.065]);
  tip.rotation.z=Math.PI;
 }
 if(name){
  const badge=labelSprite(name,player?'#ffe7a2':monster?'#ffc0ae':'#cef5f9');
  badge.position.y=player?2.85:2.65;body.add(badge);
 }
 return {group:body,legs,mesh:torso,weapon,shield,arms,armorPieces};
}
export function createLiveWorld3D({canvas,TILE,onSelectTile,onStatus}){
 if(!canvas||typeof onSelectTile!=='function'||!TILE)throw new TypeError('Parâmetros inválidos');
 const isTouch=window.matchMedia('(pointer:coarse)').matches;
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,isTouch?1.2:1.6));
 renderer.setClearColor('#34494e');
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.32;
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();
 scene.background=hex('#66808a');scene.fog=new THREE.FogExp2('#66808a',.013);
 const hemisphere=new THREE.HemisphereLight('#e0e9ed','#3d473c',2.2);scene.add(hemisphere);
 const sun=new THREE.DirectionalLight('#ffddad',2.65);
 sun.position.set(12,27,19);sun.castShadow=true;sun.shadow.mapSize.set(isTouch?512:1024,isTouch?512:1024);
 sun.shadow.camera.left=-28;sun.shadow.camera.right=28;
 sun.shadow.camera.top=28;sun.shadow.camera.bottom=-28;
 sun.shadow.bias=-.0003;scene.add(sun);
 const camera=new THREE.OrthographicCamera(-13,13,13,-13,.1,180);
 let zoom=GAMEPLAY_ZOOM, azimuth=Math.PI/4;
 const plane=new THREE.Plane(vec(0,1,0),0);
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 const point=vec(0,0,0);
 const floorGroups=new Map(),actorCache=new Map();
 const hero=figure({player:true,name:'Ivo'});scene.add(hero.group);
 // Só o protagonista recebe escala extra; NPCs continuam no tamanho de seus tiles.
 hero.group.scale.setScalar(isTouch?1.26:1.16);
 const heroRing=new THREE.Mesh(
  new THREE.RingGeometry(.50,.64,40),
  new THREE.MeshBasicMaterial({color:'#e8c179',transparent:true,opacity:.91,depthWrite:false,side:THREE.DoubleSide})
 );
 heroRing.rotation.x=-Math.PI/2;
 heroRing.renderOrder=15;scene.add(heroRing);
 const heroGlow=new THREE.PointLight('#ffda91',1.5,5,2);
 scene.add(heroGlow);
 let activeFloor=null,activeLayer=null,disposed=false,frame=0;
 let cameraAt=vec(22,0,14),lastSizeW=0,lastSizeH=0,mouseStart=null;
 const actorPickables=[];
 const allHouses=[];
 function floorLayer(floor,map,houses){
  const layer=new THREE.Group();layer.name='real-floor-'+floor;
  const {ground,obstacles}=collectTileLayers(map,TILE);
  const planeColors={stone:'#f0ece3',road:'#f3f0e5',grass:'#e5ecdc',water:'#c8e5ed',wood:'#f7ebd0',dungeon:'#e0e2dd'};
  for(const [kind,tiles] of ground){
   const mesh=new THREE.InstancedMesh(TILE_GEOMETRY,tileMaterials[kind],tiles.length);
   const normalColor=hex(planeColors[kind]||'#ffffff');
   for(let i=0;i<tiles.length;i++){
    const [x,z]=tiles[i];
    setInstance(mesh,i,x,.015,z);
    const tone=1-((x*7+z*13)%5)*.012;
    mesh.setColorAt(i,normalColor.clone().multiplyScalar(tone));
   }
   mesh.instanceMatrix.needsUpdate=true;mesh.receiveShadow=true;
   mesh.frustumCulled=false;layer.add(mesh);
  }
  for(const [kind,tiles] of obstacles){
   if(['wall','housewall','door'].includes(kind)){
    const heights={wall:3.1,housewall:2.8,door:2.1};
    const mat=kind==='wall'?MAT.wall:kind==='door'?MAT.door:MAT.plaster;
    const mesh=new THREE.InstancedMesh(UNIT_BOX,mat,tiles.length);
    for(let i=0;i<tiles.length;i++){
     const [x,z]=tiles[i],h=heights[kind];
     setInstance(mesh,i,x,h/2,z,1,h,1);
    }
    mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=true;
    mesh.receiveShadow=true;mesh.frustumCulled=false;layer.add(mesh);
   }else{
    for(const [x,z,t] of tiles){
     if(kind==='tree')makeTree(layer,x,z,t===TILE.PINE);
     else makeDecoration(layer,x,z,kind,t,TILE);
    }
   }
  }
  const doorLayer=obstacles.get('door')||[];
  const doors={tiles:doorLayer.map(([x,z])=>[x,z]),mesh:null,lastStates:new Map()};
  layer.traverse(child=>{
    if(child.isInstancedMesh && child.material===MAT.door)doors.mesh=child;
  });
  const roofs=[];
  for(const h of houses){
   if((h.floor??0)!==floor)continue;
   const built=buildHouse(h);
   layer.add(built.group);roofs.push(built);
  }
  floorGroups.set(floor,{group:layer,roofs,map,doors});
  return floorGroups.get(floor);
 }
 function setFloor(floor,map,houses){
  if(activeFloor===floor)return;
  if(activeLayer)scene.remove(activeLayer.group);
  if(!floorGroups.has(floor))floorLayer(floor,map,houses);
  activeFloor=floor;activeLayer=floorGroups.get(floor);
  scene.add(activeLayer.group);
  for(const actor of actorCache.values()){
   scene.remove(actor.group);
  }
  actorCache.clear();
  actorPickables.length=0;
  for(const marker of corpseMarkers.values())scene.remove(marker);
  corpseMarkers.clear();
  onStatus?.('Mundo 3D conectado ao andar '+floor);
 }
 function updateDoors(floor,openDoors){
  if(!openDoors || !activeLayer?.doors?.mesh)return;
  const {tiles,mesh,lastStates}=activeLayer.doors;
  let changed=false;
  for(let i=0;i<tiles.length;i++){
   const [x,z]=tiles[i];
   const open=openDoors.has(floor+':'+x+':'+z);
   if(lastStates.get(i)===open)continue;
   lastStates.set(i,open);
   setInstance(mesh,i,x,open ? .13 : 1.05,z,1,open ? .20 : 2.1,open ? .22 : 1);
   changed=true;
  }
  if(changed)mesh.instanceMatrix.needsUpdate=true;
 }
 const corpseMarkers=new Map();
 function renderCorpses(corpses,floor,px,pz){
  const current=new Set();
  for(const corpse of corpses||[]){
   if(corpse.floor!==floor||Math.abs(corpse.x-px)>15||Math.abs(corpse.y-pz)>15)continue;
   const id=String(corpse.id??(corpse.x+':'+corpse.y+':'+floor));
   current.add(id);
   let marker=corpseMarkers.get(id);
   if(!marker){
    marker=new THREE.Group();
    addShape(marker,UNIT_SPHERE,MAT.monsterDark,0,.20,0,[.5,.18,.35]);
    const label=labelSprite('LOOT','#efce8c');
    label.position.y=.9;marker.add(label);
    corpseMarkers.set(id,marker);
    scene.add(marker);
   }
   marker.position.set(corpse.x,0,corpse.y);
  }
  for(const [id,obj] of corpseMarkers){
   if(!current.has(id)){scene.remove(obj);corpseMarkers.delete(id)}
  }
 }
 function actorsSnapshot(entities,floor,px,pz){
  const active=new Set();
  for(const e of entities){
   if(!visibleActor(e,floor))continue;
   if(!isWorldNearby(e,{x:px,y:pz},15))continue;
   const id=String(e.id);
   active.add(id);
   let actor=actorCache.get(id);
   if(!actor){
    actor=figure({monster:e.type==='monster',role:e.type,name:e.name||''});
    actor.badge=actor.group.children.find(part=>part.isSprite)||null;
    actor.group.userData.actorId=id;
    actor.group.traverse(part=>{
     if(part.isMesh){part.userData.actorId=id;actorPickables.push(part);}
    });
    scene.add(actor.group);actorCache.set(id,actor);
   }
   actor.entity=e;
   actor.group.visible=true;
   actor.group.position.set(e.renderX??e.x,0,e.renderY??e.y);
   if(actor.badge)actor.badge.visible=shouldShowActorLabel(e,{x:px,y:pz},isTouch?3.3:6);
   if(e.type==='monster'){
    actor.group.rotation.y=(e.dir==='left'?-Math.PI/2:e.dir==='up'?Math.PI:e.dir==='right'?Math.PI/2:0);
   }else{
    actor.group.rotation.y=(e.dir==='left'?-Math.PI/2:e.dir==='up'?Math.PI:e.dir==='right'?Math.PI/2:0);
   }
   const walking=Math.abs((e.renderX??e.x)-e.x)+Math.abs((e.renderY??e.y)-e.y)>.04;
   const stride=walking?Math.sin(frame*.22+e.x*4)*.3:0;
   actor.legs[0].rotation.x=stride;actor.legs[1].rotation.x=-stride;
  }
  for(const [id,actor] of actorCache){
   if(!active.has(id)){
    scene.remove(actor.group);actorCache.delete(id);
    for(const part of actorPickables.slice()){
     if(part.userData.actorId===id)actorPickables.splice(actorPickables.indexOf(part),1);
    }
   }
  }
 }
 function resize(){
  const rect=canvas.getBoundingClientRect();
  const w=Math.max(1,Math.floor(rect.width)),h=Math.max(1,Math.floor(rect.height));
  if(w===lastSizeW && h===lastSizeH)return;
  lastSizeW=w;lastSizeH=h;
  const aspect=w/h;
  camera.left=-zoom*aspect;
  camera.right=zoom*aspect;
  camera.top=zoom;
  camera.bottom=-zoom;
  camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);
 }
 function cameraFollow(player,now){
  // O foco é o tronco do herói, não o chão; câmera baixa melhora leitura de armaduras.
  const goal=vec(player.renderX??player.x,.85,player.renderY??player.y);
  cameraAt.lerp(goal,.19);
  const eye=vec(Math.sin(azimuth)*zoom*1.58,zoom*1.15,Math.cos(azimuth)*zoom*1.58);
  camera.position.copy(cameraAt).add(eye);
  camera.lookAt(cameraAt.x,cameraAt.y,cameraAt.z);
  sun.position.set(cameraAt.x+12,26,cameraAt.z+17);
  sun.target.position.set(cameraAt.x,0,cameraAt.z);
  sun.target.updateMatrixWorld();
 }
 function update({map,floor,player,entities,houses,corpses,openDoors,now}){
  if(disposed||!map)return;
  if(activeFloor!==floor)setFloor(floor,map,houses);
  resize();frame++;
  hero.group.position.set(player.renderX??player.x,0,player.renderY??player.y);
  hero.group.rotation.y=player.dir==='up'?Math.PI:player.dir==='left'?-Math.PI/2:player.dir==='right'?Math.PI/2:0;
  const armorColor=CLASS_COATS[player.classId]||MAT.roofRed;
  hero.mesh.material=armorColor;
  for(const piece of hero.armorPieces)piece.material=armorColor;
  const magic=['arcanista','devota','tecelao'].includes(player.classId);
  const heavy=player.classId==='colosso';
  if(hero.weapon){
    hero.weapon.scale.set(heavy?1.38:magic?.95:1,magic?1.24:1,1);
    hero.weapon.rotation.z=player.attackAnimUntil>now?-.9:0;
  }
  if(hero.shield)hero.shield.visible=!magic&&player.classId!=='vigia'&&player.classId!=='espectro';
  const movement=Math.abs(player.x-(player.renderX??player.x))+Math.abs(player.y-(player.renderY??player.y));
  const stride=movement>.03?Math.sin(frame*.22)*.42:0;
  hero.legs[0].rotation.x=stride;hero.legs[1].rotation.x=-stride;
  if(hero.arms.length===2){
    hero.arms[0].rotation.x=-stride*.58;
    hero.arms[1].rotation.x=player.attackAnimUntil>now?-1.45:stride*.58;
  }
  hero.group.position.y=movement>.03?Math.abs(Math.sin(frame*.22))*.06:0;
  heroRing.position.set(player.renderX??player.x,.075,player.renderY??player.y);
  heroGlow.position.set((player.renderX??player.x)+.3,2.3,(player.renderY??player.y)+.2);
  for(const {roof,house,sign} of activeLayer.roofs){
   const occluding=shouldHideRoofFromCamera(house,player,azimuth);
   roof.visible=!occluding;
   sign.visible=!occluding&&shouldShowHouseLabel(house,player,isTouch?4:7);
  }
  updateDoors(floor,openDoors);
  actorsSnapshot(entities,floor,player.x,player.y);
  renderCorpses(corpses,floor,player.x,player.y);
  cameraFollow(player,now);
  renderer.render(scene,camera);
 }
 function groundClick(e){
  const rect=canvas.getBoundingClientRect();
  if(!rect.width||!rect.height||!activeLayer)return;
  pointer.set((e.clientX-rect.left)/rect.width*2-1,
    -((e.clientY-rect.top)/rect.height*2-1));
  raycaster.setFromCamera(pointer,camera);
  const picked=raycaster.intersectObjects(actorPickables,false)[0];
  if(picked?.object?.userData?.actorId){
   const actor=actorCache.get(String(picked.object.userData.actorId))?.entity;
   if(actor){onSelectTile(actor.x,actor.y);return;}
  }
  const intersection=raycaster.ray.intersectPlane(plane,point);
  if(!intersection)return;
  const tile=worldToTile(point.x,point.z,activeLayer.map);
  if(tile)onSelectTile(tile.x,tile.y);
 }
 function pointerDown(event){
  mouseStart={x:event.clientX,y:event.clientY,button:event.button,
   previousX:event.clientX,dragged:false};
 }
 function pointerMove(event){
  if(!mouseStart||mouseStart.button!==2)return;
  const delta=event.clientX-mouseStart.previousX;
  mouseStart.previousX=event.clientX;
  if(Math.abs(delta)>0){
   mouseStart.dragged=true;
   azimuth+=delta*.008;
  }
 }
 function pointerUp(event){
  if(!mouseStart)return;
  const distance=Math.hypot(event.clientX-mouseStart.x,event.clientY-mouseStart.y);
  const start=mouseStart;mouseStart=null;
  if(start.button!==0||distance>8||start.dragged)return;
  groundClick(event);
 }
 function wheel(event){
  event.preventDefault();
  zoom=clampZoom(zoom+(event.deltaY>0?1:-1)*.9);
  lastSizeW=0;resize();
 }
 const contextMenu=event=>event.preventDefault();
 canvas.addEventListener('pointerdown',pointerDown);
 canvas.addEventListener('pointermove',pointerMove);
 canvas.addEventListener('pointerup',pointerUp);
 canvas.addEventListener('pointercancel',()=>{mouseStart=null;});
 canvas.addEventListener('wheel',wheel,{passive:false});
 canvas.addEventListener('contextmenu',contextMenu);
 function dispose(){
  if(disposed)return;
  disposed=true;
  canvas.removeEventListener('pointerdown',pointerDown);
  canvas.removeEventListener('pointermove',pointerMove);
  canvas.removeEventListener('pointerup',pointerUp);
  canvas.removeEventListener('wheel',wheel);
  canvas.removeEventListener('contextmenu',contextMenu);
  renderer.dispose();
  for(const a of actorCache.values())scene.remove(a.group);
  actorCache.clear();
 }
 return {update,dispose,
  zoomIn(){zoom=clampZoom(zoom-1);lastSizeW=0;},
  zoomOut(){zoom=clampZoom(zoom+1);lastSizeW=0;},
  resetCamera(){zoom=GAMEPLAY_ZOOM;azimuth=Math.PI/4;lastSizeW=0;},
  get floor(){return activeFloor;},get zoom(){return zoom;}};
}
