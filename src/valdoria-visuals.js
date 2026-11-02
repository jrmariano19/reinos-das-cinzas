import { worldToScreen } from './isometric.js';

/**
 * Identidade visual original para Valdoria — arquitetura 2.5D de fantasia medieval.
 * Referência de gênero: cidades clássicas de MMORPGs isométricos.
 * Nenhum mapa, sprite, textura ou personagem de terceiros é reutilizado.
 * Os edifícios usam o cadastro já existente do jogo; o mapa e a colisão não mudam.
 */
const STYLES = {
  slate:   {wall:'#c2b6a0',side:'#827e77',roof:'#506779',roofShade:'#334451',trim:'#dcc9a2'},
  plaster: {wall:'#dbcaad',side:'#ad967c',roof:'#ad5144',roofShade:'#713a38',trim:'#f0cf91'},
  stone:   {wall:'#aeb1b0',side:'#727f83',roof:'#596e79',roofShade:'#344954',trim:'#d5c9a8'},
  moss:    {wall:'#b9b4a1',side:'#838a79',roof:'#547260',roofShade:'#344c47',trim:'#c6b48a'},
  brick:   {wall:'#b99075',side:'#856854',roof:'#914b37',roofShade:'#61332d',trim:'#e2c6a2'},
  timber:  {wall:'#c6a77c',side:'#846b54',roof:'#8e4c37',roofShade:'#5f342c',trim:'#f1d0a0'}
};
const ROLES = {
  cathedral: ['✦','Santuário'], archive: ['✧','Arquivo'], keep:['♜','Cidadela'],
  tower:['✦','Observatório'], barracks:['⚔','Guarda'], arsenal:['⚒','Arsenal'],
  alchemy:['✶','Alquimia'], warehouse:['▣','Depósito'], inn:['♨','Estalagem'],
  forge:['⚒','Forja'], guild:['◆','Guilda'], bank:['◇','Tesouraria']
};
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

export function createValdoriaVisuals({tileWidth=64,tileHeight=32}={}) {
  if(tileWidth<=0||tileHeight<=0)throw new RangeError('Dimensões isométricas inválidas');
  const hw=tileWidth/2,hh=tileHeight/2;
  const point=(x,y,z,camera)=>{
    const p=worldToScreen(x,y,camera.x,camera.y,tileWidth,tileHeight);
    p.y-=z;
    return p;
  };
  function polygon(ctx,points,fill,stroke=null,lineWidth=1) {
    ctx.beginPath();
    ctx.moveTo(points[0].x,points[0].y);
    for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
    ctx.closePath();
    if(fill){ctx.fillStyle=fill;ctx.fill();}
    if(stroke){ctx.lineWidth=lineWidth;ctx.strokeStyle=stroke;ctx.stroke();}
  }
  function line(ctx,a,b,color,width=1) {
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  }
  function facadeWindow(ctx,house,x,y,front,camera,glow=false) {
    const p1=front?point(x-.32,y,26,camera):point(x,y-.32,26,camera);
    const p2=front?point(x+.32,y,26,camera):point(x,y+.32,26,camera);
    const p3=front?point(x+.32,y,44,camera):point(x,y+.32,44,camera);
    const p4=front?point(x-.32,y,44,camera):point(x,y-.32,44,camera);
    polygon(ctx,[p1,p2,p3,p4],'#273c43','#d3bc84',2);
    const a={x:(p1.x+p3.x)/2,y:(p1.y+p3.y)/2};
    ctx.fillStyle=glow?'#ffc26e':'#8cb4bb';
    ctx.fillRect(a.x-3,a.y-6,6,12);
    line(ctx,{x:a.x,y:a.y-9},{x:a.x,y:a.y+9},'#d7c7a6',1.4);
    line(ctx,{x:a.x-8,y:a.y},{x:a.x+8,y:a.y},'#d7c7a6',1);
  }
  function drawBuilding(ctx,house,camera,player,now) {
    const style=STYLES[house.style]||STYLES.stone;
    const x=house.x-.5,y=house.y-.5,w=house.w,h=house.h;
    const tall=house.role==='tower'?132:house.role==='keep'?105:house.role==='cathedral'?100:house.role==='forge'?75:66;
    const rise=house.role==='cathedral'?62:house.role==='keep'?35:house.role==='tower'?67:43;
    const indoors=player.floor===(house.floor??0) &&
      player.x>house.x && player.x<house.x+house.w-1 &&
      player.y>house.y && player.y<house.y+house.h-1;
    ctx.save();ctx.globalAlpha=indoors?.24:1;

    const a=point(x,y,0,camera),b=point(x+w,y,0,camera);
    const c=point(x+w,y+h,0,camera),d=point(x,y+h,0,camera);
    const A=point(x,y,tall,camera),B=point(x+w,y,tall,camera);
    const C=point(x+w,y+h,tall,camera),D=point(x,y+h,tall,camera);
    const r1={x:(A.x+D.x)/2,y:(A.y+D.y)/2-rise};
    const r2={x:(B.x+C.x)/2,y:(B.y+C.y)/2-rise};

    // Sombra volumétrica, duas fachadas e contrafortes.
    polygon(ctx,[{x:a.x+11,y:a.y+12},{x:b.x+11,y:b.y+12},
      {x:c.x+11,y:c.y+12},{x:d.x+11,y:d.y+12}],'rgba(13,16,20,.32)');
    polygon(ctx,[B,C,c,b],style.side,'#403a36',2);
    polygon(ctx,[D,C,c,d],style.wall,'#443b31',2);
    line(ctx,D,C,style.trim,3);line(ctx,C,c,style.trim,2);
    line(ctx,B,C,'#d8c5a4',2);
    // Base em pedra contornando o salão.
    line(ctx,d,c,'#6e665d',5);line(ctx,c,b,'#625c57',5);

    // Madeira nas construções civis, reforços nos prédios de pedra.
    for(let i=1;i<house.w;i+=2) {
      const top=point(x+i,y+h,tall-10,camera);
      const bottom=point(x+i,y+h,4,camera);
      line(ctx,top,bottom,house.style==='timber'?'#614730':'#b6a68c',house.style==='timber'?3:1.5);
    }
    for(let i=1;i<house.h;i+=2){
      const top=point(x+w,y+i,tall-10,camera);
      const bottom=point(x+w,y+i,4,camera);
      line(ctx,top,bottom,'#827468',1.6);
    }
    if(house.style==='timber'){
      line(ctx,point(x,y+h,12,camera),point(x+w,y+h,tall-8,camera),'rgba(91,62,46,.65)',3);
      line(ctx,point(x+w,y,15,camera),point(x+w,y+h,tall-8,camera),'rgba(91,62,46,.65)',3);
    }
    // Portas de acesso exatamente nas coordenadas originais de interação.
    const doorX=Number.isFinite(house.door)?house.door:house.x+Math.floor(w/2);
    const wallY=y+h+.06;
    const left=point(doorX-.43,wallY,0,camera);
    const right=point(doorX+.43,wallY,0,camera);
    const rt=point(doorX+.43,wallY,37,camera);
    const lt=point(doorX-.43,wallY,37,camera);
    polygon(ctx,[left,right,rt,lt],'#312a27','#e0c392',3);
    const mid=point(doorX,wallY,13,camera);
    ctx.fillStyle='#e7c66e';ctx.beginPath();ctx.arc(mid.x+5,mid.y,2,0,Math.PI*2);ctx.fill();
    for(let i=1.4;i<house.w-1;i+=2){
      if(Math.abs((x+i)-doorX)<1.2)continue;
      facadeWindow(ctx,house,x+i,y+h+.1,true,camera,house.role==='forge'||house.role==='inn');
    }
    for(let i=1.4;i<house.h-1;i+=2.3)
      facadeWindow(ctx,house,x+w+.07,y+i,false,camera,house.role==='forge');

    // Telhado com duas águas e cumeeira; as texturas são procedurais.
    polygon(ctx,[A,B,r2,r1],style.roofShade,'#342c2a',2);
    polygon(ctx,[r1,r2,C,D],style.roof,'#392f2b',2.5);
    line(ctx,r1,r2,style.trim,3);
    line(ctx,D,C,style.trim,2.5);
    for(let t=.13;t<.99;t+=.15) {
      const p={x:r1.x+(D.x-r1.x)*t,y:r1.y+(D.y-r1.y)*t};
      const q={x:r2.x+(C.x-r2.x)*t,y:r2.y+(C.y-r2.y)*t};
      line(ctx,p,q,'rgba(28,25,31,.22)',1.3);
    }
    for(let t=.15;t<.99;t+=.2) {
      const top={x:r1.x+(r2.x-r1.x)*t,y:r1.y+(r2.y-r1.y)*t};
      const bottom={x:D.x+(C.x-D.x)*t,y:D.y+(C.y-D.y)*t};
      line(ctx,top,bottom,'rgba(255,229,175,.13)',1);
    }

    // Silhuetas monumentais definem os distritos à distância.
    if(house.role==='keep'||house.role==='barracks'){
      for(const k of [0,.25,.5,.75,1]){
        const px=D.x+(C.x-D.x)*k,py=D.y+(C.y-D.y)*k;
        ctx.fillStyle='#b2aaa0';ctx.fillRect(px-6,py-13,12,16);
        ctx.fillStyle='#827b70';ctx.fillRect(px+4,py-13,4,13);
      }
    }
    if(house.role==='cathedral'||house.role==='tower') {
      const center=point(x+w/2,y+h/2,tall+rise+12,camera);
      const roofTop=point(x+w/2,y+h/2,tall+rise,camera);
      line(ctx,center,roofTop,'#e9c785',3);
      ctx.fillStyle='#efcf77';ctx.beginPath();ctx.arc(center.x,center.y,5,0,Math.PI*2);ctx.fill();
    }
    if(house.role==='forge'){
      const top=point(x+w*.75,y+h*.3,tall+rise*.5,camera);
      ctx.fillStyle='#60483c';ctx.fillRect(top.x-9,top.y-40,18,40);
      ctx.fillStyle='#cf9b60';ctx.fillRect(top.x-11,top.y-43,22,6);
    }
    // Placa de serviço independente dos nomes do Priston Tale.
    const role=ROLES[house.role]||['◆','Ofício'];
    const sign=point(doorX,wallY,tall*.62,camera);
    const width=Math.max(72,role[1].length*7+29);
    ctx.fillStyle='rgba(27,27,29,.88)';ctx.fillRect(sign.x-width/2,sign.y-13,width,24);
    ctx.strokeStyle='#d8ad69';ctx.lineWidth=1.5;ctx.strokeRect(sign.x-width/2,sign.y-13,width,24);
    ctx.fillStyle='#f7d48a';ctx.font='bold 12px sans-serif';ctx.textAlign='center';
    ctx.fillText(role[0]+' '+role[1],sign.x,sign.y+3);
    ctx.restore();
  }
  function drawProp(ctx,item,camera,now) {
    const {x,y,type,T}=item,p=point(x,y,0,camera),sx=p.x,sy=p.y;
    ctx.save();
    if(type===T.TREE||type===T.PINE){
      ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(sx,sy,18,8,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#694932';ctx.fillRect(sx-5,sy-45,10,44);
      for(const [dy,width] of [[-23,30],[-40,25],[-58,19]]){
        polygon(ctx,[{x:sx-width,y:sy+dy+9},{x:sx,y:sy+dy-35},{x:sx+width,y:sy+dy+9}],
          type===T.PINE?'#335d50':'#426c4a','#273d35',1.2);
      }
    }else if(type===T.FOUNTAIN){
      ctx.fillStyle='rgba(13,22,29,.27)';ctx.beginPath();ctx.ellipse(sx,sy,41,18,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#777a79';ctx.beginPath();ctx.ellipse(sx,sy-5,37,18,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#d0c3a8';ctx.beginPath();ctx.ellipse(sx,sy-12,34,15,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#4f9cae';ctx.beginPath();ctx.ellipse(sx,sy-13,28,11,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#b8eaf0';ctx.beginPath();ctx.ellipse(sx,sy-13,12+Math.sin(now/450)*2,5,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#a8a496';ctx.fillRect(sx-7,sy-48,14,35);
      ctx.fillStyle='#e7c78d';ctx.beginPath();ctx.arc(sx,sy-51,8,0,Math.PI*2);ctx.fill();
    }else if(type===T.LANTERN||type===T.TORCH_WALL){
      const glow=13+Math.sin(now/240+x*4+y)*2;
      const light=ctx.createRadialGradient(sx,sy-59,2,sx,sy-59,glow*3);
      light.addColorStop(0,'rgba(255,188,85,.46)');light.addColorStop(1,'rgba(255,151,53,0)');
      ctx.fillStyle=light;ctx.beginPath();ctx.arc(sx,sy-59,glow*3,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#302d2c';ctx.fillRect(sx-3,sy-61,6,61);
      ctx.fillStyle='#ffd38a';ctx.fillRect(sx-7,sy-69,14,17);
      ctx.strokeStyle='#504638';ctx.lineWidth=3;ctx.strokeRect(sx-7,sy-69,14,17);
      ctx.fillStyle='#2d3334';ctx.fillRect(sx-10,sy-72,20,5);
    }else if(type===T.MARKET_STALL){
      ctx.fillStyle='#72513b';ctx.fillRect(sx-21,sy-31,4,31);
      ctx.fillRect(sx+17,sy-31,4,31);
      polygon(ctx,[{x:sx-28,y:sy-29},{x:sx,y:sy-51},{x:sx+28,y:sy-29},{x:sx,y:sy-12}],
        (x+y)%2?'#ae5544':'#dbb97c','#4b382d',2);
      ctx.fillStyle='#d9bf90';ctx.fillRect(sx-19,sy-12,38,10);
      ctx.fillStyle='#725438';ctx.fillRect(sx-20,sy-3,40,4);
    }else if(type===T.BENCH){
      ctx.fillStyle='#745037';ctx.fillRect(sx-21,sy-17,42,8);
      ctx.fillRect(sx-18,sy-9,5,15);ctx.fillRect(sx+13,sy-9,5,15);
      ctx.fillStyle='#b38a53';ctx.fillRect(sx-21,sy-20,42,4);
    }else if(type===T.FLOWERS||type===T.WILD_FLOWERS){
      ctx.fillStyle='#477047';
      for(let i=-2;i<=2;i++) {
        ctx.fillRect(sx+i*6,sy-9-(i%2)*3,2,12);
        ctx.fillStyle=i%2?'#ffcb74':'#e49ab3';
        ctx.beginPath();ctx.arc(sx+i*6+1,sy-11-(i%2)*3,3,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#477047';
      }
    }else if(type===T.SIGNPOST){
      ctx.fillStyle='#6b4e37';ctx.fillRect(sx-3,sy-46,6,46);
      ctx.fillStyle='#c6aa75';ctx.fillRect(sx-21,sy-43,43,17);
      ctx.strokeStyle='#593d2f';ctx.strokeRect(sx-21,sy-43,43,17);
      ctx.fillStyle='#4c372b';ctx.font='bold 9px sans-serif';ctx.textAlign='center';
      ctx.fillText('VALDORIA',sx,sy-31);
    }else if(type===T.BARREL||type===T.CRATE){
      ctx.fillStyle=type===T.BARREL?'#835331':'#aa8053';
      ctx.fillRect(sx-10,sy-23,20,23);
      ctx.strokeStyle='#47352c';ctx.lineWidth=2;ctx.strokeRect(sx-10,sy-23,20,23);
      ctx.beginPath();ctx.moveTo(sx-10,sy-17);ctx.lineTo(sx+10,sy-17);ctx.stroke();
    }else if(type===T.GATE_ARCH){
      ctx.fillStyle='#95968d';ctx.fillRect(sx-13,sy-73,26,72);
      ctx.fillStyle='#d3c6aa';ctx.fillRect(sx-16,sy-77,32,10);
    }
    ctx.restore();
  }
  function drawActor(ctx,item,camera,player) {
    const x=item.x,y=item.y;
    const p=point(x,y,0,camera),sx=p.x,sy=p.y;
    const own=item.kind==='player',npc=item.entity?.type==='npc';
    const armor=own?'#d0a55d':npc?'#617b95':'#a15b54';
    const cloak=own?'#8d3632':npc?'#415369':'#543b42';
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();
    ctx.ellipse(sx,sy-1,14,6,0,0,Math.PI*2);ctx.fill();
    polygon(ctx,[{x:sx-7,y:sy-20},{x:sx-13,y:sy-3},{x:sx+13,y:sy-3},{x:sx+7,y:sy-20}],cloak);
    ctx.fillStyle='#3b3b43';ctx.fillRect(sx-8,sy-13,6,12);ctx.fillRect(sx+2,sy-13,6,12);
    ctx.fillStyle=armor;ctx.fillRect(sx-10,sy-36,20,24);
    ctx.fillStyle='#e1c49c';ctx.fillRect(sx-7,sy-52,14,16);
    ctx.fillStyle=own?'#aeb3b5':'#5b4635';ctx.fillRect(sx-9,sy-53,18,7);
    ctx.fillStyle='#d2d7d7';ctx.fillRect(sx-3,sy-48,6,5);
    ctx.fillStyle=armor;ctx.fillRect(sx-14,sy-35,5,18);ctx.fillRect(sx+9,sy-35,5,18);
    if(own){
      ctx.strokeStyle='#d6d9df';ctx.lineWidth=3;ctx.beginPath();
      ctx.moveTo(sx+16,sy-14);ctx.lineTo(sx+23,sy-46);ctx.stroke();
      ctx.strokeStyle='#a16f36';ctx.lineWidth=3;ctx.beginPath();
      ctx.moveTo(sx+12,sy-21);ctx.lineTo(sx+21,sy-19);ctx.stroke();
    }
    if(own || (npc&&Math.abs(x-player.x)<6&&Math.abs(y-player.y)<6)){
      const name=own?player.name:item.entity.name;
      ctx.font=own?'bold 12px sans-serif':'11px sans-serif';ctx.textAlign='center';
      const label=name.length>25?name.slice(0,24)+'…':name;
      const width=ctx.measureText(label).width+10;
      ctx.fillStyle='rgba(12,19,22,.75)';ctx.fillRect(sx-width/2,sy-75,width,17);
      ctx.fillStyle=own?'#f4db93':'#d7eefa';ctx.fillText(label,sx,sy-63);
    }
    ctx.restore();
  }
  function drawGroundDetails(ctx,map,player,camera,T,viewportWidth,viewportHeight) {
    const minY=clamp(Math.floor(player.y)-22,0,map.length-1);
    const maxY=clamp(Math.ceil(player.y)+22,0,map.length-1);
    for(let y=minY;y<=maxY;y++) {
      const row=map[y];if(!row)continue;
      for(let x=clamp(Math.floor(player.x)-22,0,row.length-1);x<=clamp(Math.ceil(player.x)+22,0,row.length-1);x++){
        const t=row[x],p=point(x,y,0,camera);
        if(p.x<-hw||p.x>viewportWidth+hw||p.y<-hh||p.y>viewportHeight+hh)continue;
        if(t===T.STONE_FLOOR||t===T.DIRT_ROAD||t===T.ANCIENT_STONE){
          const seed=(x*31+y*47)%9;
          ctx.strokeStyle=t===T.DIRT_ROAD?'rgba(82,61,39,.29)':'rgba(236,226,191,.23)';
          ctx.lineWidth=1;
          const length=8+(seed%4)*3;
          ctx.beginPath();ctx.moveTo(p.x-length,p.y+(seed%4)*2);
          ctx.lineTo(p.x+length,p.y+(seed%4)*2-3);ctx.stroke();
          if(seed===1||seed===5) {
            ctx.fillStyle='rgba(35,42,43,.14)';ctx.fillRect(p.x+8,p.y-4,7,3);
          }
        }else if(t===T.WATER){
          ctx.strokeStyle='rgba(148,218,231,.36)';ctx.lineWidth=1;
          ctx.beginPath();ctx.moveTo(p.x-13,p.y+1);ctx.lineTo(p.x+6,p.y-3);ctx.stroke();
        }
      }
    }
  }
  function draw(ctx,{camera,map,player,entities=[],houses=[],tileTypes,viewportWidth,viewportHeight,now=0}){
    if(!ctx||!camera||!Array.isArray(map)||!player||!tileTypes)return;
    const T=tileTypes,items=[];
    drawGroundDetails(ctx,map,player,camera,T,viewportWidth,viewportHeight);
    for(const house of houses){
      if((house.floor??0)!==player.floor)continue;
      const center=point(house.x+house.w/2,house.y+house.h/2,0,camera);
      if(center.x < -house.w*hw-house.h*hw-80||center.x > viewportWidth+house.w*hw+house.h*hw+80 ||
         center.y < -house.w*hh-house.h*hh-230||center.y>viewportHeight+house.w*hh+house.h*hh+230)continue;
      items.push({kind:'building',house,depth:house.door+house.y+house.h-1.5});
    }
    const visibleProps=new Set([T.TREE,T.PINE,T.FOUNTAIN,T.LANTERN,T.TORCH_WALL,
      T.MARKET_STALL,T.BENCH,T.FLOWERS,T.WILD_FLOWERS,T.SIGNPOST,T.BARREL,T.CRATE,T.GATE_ARCH]);
    const loY=clamp(Math.floor(player.y)-23,0,map.length-1);
    const hiY=clamp(Math.ceil(player.y)+23,0,map.length-1);
    for(let y=loY;y<=hiY;y++){
      if(!map[y])continue;
      for(let x=clamp(Math.floor(player.x)-23,0,map[y].length-1);x<=clamp(Math.ceil(player.x)+23,0,map[y].length-1);x++){
        const type=map[y][x];if(!visibleProps.has(type))continue;
        const p=point(x,y,0,camera);
        if(p.x<-75||p.x>viewportWidth+75||p.y<-100||p.y>viewportHeight+65)continue;
        items.push({kind:'prop',x,y,type,T,depth:x+y});
      }
    }
    for(const entity of entities){
      if(entity.dead||entity.floor!==player.floor)continue;
      const x=Number.isFinite(entity.renderX)?entity.renderX:entity.x;
      const y=Number.isFinite(entity.renderY)?entity.renderY:entity.y;
      if(!Number.isFinite(x)||!Number.isFinite(y))continue;
      const p=point(x,y,0,camera);
      if(p.x<-85||p.x>viewportWidth+85||p.y<-100||p.y>viewportHeight+70)continue;
      items.push({kind:'actor',entity,x,y,depth:x+y});
    }
    items.push({kind:'player',x:player.renderX??player.x,y:player.renderY??player.y,depth:(player.renderX??player.x)+(player.renderY??player.y)});
    items.sort((a,b)=>a.depth-b.depth||({building:0,prop:1,actor:2,player:3}[a.kind]-{building:0,prop:1,actor:2,player:3}[b.kind]));
    for(const item of items){
      if(item.kind==='building')drawBuilding(ctx,item.house,camera,player,now);
      else if(item.kind==='prop')drawProp(ctx,item,camera,now);
      else drawActor(ctx,item,camera,player);
    }
    return {objectsDrawn:items.length,buildings:items.filter(i=>i.kind==='building').length};
  }
  return {draw};
}
