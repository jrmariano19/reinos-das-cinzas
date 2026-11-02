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
/**
 * Um telhado entre a câmera e o personagem também esconde o herói
 * mesmo quando está a mais de 3.7 tiles dele. O teste do segmento
 * utiliza somente coordenadas do mapa real e não altera colisões.
 */
export function houseBlocksCamera(house,player,azimuth,reach=11){
 if(!house||!player||!Number.isFinite(azimuth)||!Number.isFinite(reach)||reach<=0)
  return false;
 if(![house.x,house.y,house.w,house.h,player.x,player.y].every(Number.isFinite))
  return false;
 if(house.w<=0||house.h<=0)return false;
 const dx=Math.sin(azimuth)*reach,dy=Math.cos(azimuth)*reach;
 const box={
  xmin:house.x-.35,xmax:house.x+house.w-.65,
  ymin:house.y-.35,ymax:house.y+house.h-.65
 };
 let enter=0,leave=1;
 for(const [start,d,low,high] of [
  [player.x,dx,box.xmin,box.xmax],[player.y,dy,box.ymin,box.ymax]
 ]){
  if(Math.abs(d)<1e-8){
   if(start<low||start>high)return false;
  }else{
   let t1=(low-start)/d,t2=(high-start)/d;
   if(t1>t2)[t1,t2]=[t2,t1];
   enter=Math.max(enter,t1);leave=Math.min(leave,t2);
   if(enter>leave)return false;
  }
 }
 return enter<=leave && leave>=0 && enter<=1;
}
export function shouldHideRoofFromCamera(house,player,azimuth){
 return shouldHideRoof(house,player)||houseBlocksCamera(house,player,azimuth,10);
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
