/**
 * Regras puras de visibilidade/câmera do jogo 3D integrado.
 * Coords usam a mesma matriz x/y e as mesmas casas do jogo 2D.
 */
export const GAMEPLAY_ZOOM=7.2;
export const ZOOM_MIN=5.5;
export const ZOOM_MAX=19;
export function clampZoom(value){
 if(!Number.isFinite(value))throw new TypeError('Zoom inválido');
 return Math.max(ZOOM_MIN,Math.min(ZOOM_MAX,value));
}
export function distanceToHouse(house,x,y){
 if(!house || !Number.isFinite(x)||!Number.isFinite(y))throw new TypeError('Posição inválida');
 const nearestX=Math.max(house.x,Math.min(x,house.x+house.w-1));
 const nearestY=Math.max(house.y,Math.min(y,house.y+house.h-1));
 return Math.hypot(x-nearestX,y-nearestY);
}
/** Esconde telhados próximos ao jogador; mantém paredes e portas, sem alterar colisões. */
export function shouldHideRoof(house,player){
 return distanceToHouse(house,player.x,player.y)<=3.7;
}
/** Etiquetas só aparecem na vizinhança, não sobre toda a capital. */
export function shouldShowHouseLabel(house,player,radius=8){
 if(!Number.isFinite(radius)||radius<0)throw new RangeError('Raio inválido');
 return distanceToHouse(house,player.x,player.y)<=radius;
}
export function shouldShowActorLabel(actor,player,radius=6){
 if(!actor||!player)return false;
 if(!Number.isFinite(radius)||radius<0)throw new RangeError('Raio inválido');
 return Math.hypot(actor.x-player.x,actor.y-player.y)<=radius;
}
export function isWorldNearby(actor,player,radius=15){
 if(!actor||!player)return false;
 return Math.abs(actor.x-player.x)<=radius && Math.abs(actor.y-player.y)<=radius;
}
