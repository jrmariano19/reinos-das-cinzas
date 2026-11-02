/**
 * Adaptação da matriz de tiles jogável para coordenadas 3D.
 * Mantém x/y do A* e do save; no Three.js (x, height, z) = (tileX, height, tileY).
 * Nenhuma criação de mapa paralelo, nenhum estado persistido.
 */
export function tileToWorld(x,y,height=0) {
 if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(height))throw new TypeError('Coordenadas inválidas');
 return {x,y:height,z:y};
}
export function worldToTile(x,z,map) {
 if(!Number.isFinite(x)||!Number.isFinite(z)||!Array.isArray(map))return null;
 const tileX=Math.round(x),tileY=Math.round(z);
 if(tileX<0||tileY<0||tileY>=map.length||tileX>=map[tileY]?.length)return null;
 return {x:tileX,y:tileY};
}
export function tileCategory(tile,TILE) {
 if(tile===TILE.WATER)return 'water';
 if([TILE.DIRT_ROAD,TILE.FARM].includes(tile))return 'road';
 if([TILE.GRASS,TILE.FLOWERS,TILE.WILD_FLOWERS,TILE.FERN,TILE.REEDS,TILE.MARSH].includes(tile))return 'grass';
 if([TILE.WOOD_FLOOR,TILE.BRIDGE].includes(tile))return 'wood';
 if([TILE.DUNGEON_FLOOR,TILE.CRYPT_FLOOR,TILE.MOSS_FLOOR].includes(tile))return 'dungeon';
 return 'stone';
}
export function obstacleKind(tile,TILE) {
 if([TILE.CASTLE_WALL,TILE.GATE_ARCH,TILE.DUNGEON_WALL,TILE.CRYPT_WALL].includes(tile))return 'wall';
 if(tile===TILE.HOUSE_WALL)return 'housewall';
 if(tile===TILE.HOUSE_DOOR)return 'door';
 if([TILE.TREE,TILE.PINE].includes(tile))return 'tree';
 if([TILE.FOUNTAIN,TILE.ALTAR].includes(tile))return 'fountain';
 if([TILE.LANTERN,TILE.TORCH_WALL,TILE.CAMP_FIRE].includes(tile))return 'flame';
 if([TILE.MARKET_STALL,TILE.TENT].includes(tile))return 'stall';
 if([TILE.CRATE,TILE.CHEST,TILE.BARREL,TILE.SIGNPOST,TILE.BENCH].includes(tile))return 'prop';
 if([TILE.ROCK,TILE.ANCIENT_STONE,TILE.RUIN_PILLAR,TILE.CLIFF,TILE.FURNITURE].includes(tile))return 'rock';
 return null;
}
export function collectTileLayers(map,TILE) {
 if(!Array.isArray(map)||!map.length)throw new TypeError('Mapa vazio');
 const ground=new Map(),obstacles=new Map();
 for(let y=0;y<map.length;y++){
  if(!Array.isArray(map[y]))throw new TypeError('Linha de mapa inválida');
  for(let x=0;x<map[y].length;x++){
   const category=tileCategory(map[y][x],TILE);
   if(!ground.has(category))ground.set(category,[]);
   ground.get(category).push([x,y]);
   const obstacle=obstacleKind(map[y][x],TILE);
   if(obstacle){
    if(!obstacles.has(obstacle))obstacles.set(obstacle,[]);
    obstacles.get(obstacle).push([x,y,map[y][x]]);
   }
  }
 }
 return {ground,obstacles};
}
export function visibleActor(actor,floor) {
 return !!actor && actor.floor===floor && !actor.dead && Number.isFinite(actor.x) && Number.isFinite(actor.y);
}
