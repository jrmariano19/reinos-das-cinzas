/**
 * Arte vetorial ORIGINAL de personagem para a tela experimental de classes.
 * Atores e equipamento são apenas estudo de silhueta, sem sprites de terceiros.
 * Não interfere nos saves ou na renderização do mundo.
 */
export const PORTRAIT_STYLES=Object.freeze({
 sentinela:{primary:'#4e6c83',secondary:'#2a3d50',trim:'#d4b16e',glow:'#8dc3f2',weapon:'shield',crest:'◆'},
 colosso:{primary:'#8f4e3d',secondary:'#492e2e',trim:'#db9963',glow:'#ff975d',weapon:'axe',crest:'✦'},
 vigia:{primary:'#5e7651',secondary:'#344b42',trim:'#e1c68d',glow:'#a7d48e',weapon:'bow',crest:'❖'},
 artifice:{primary:'#96764d',secondary:'#463e3c',trim:'#c6c4a5',glow:'#ffd68d',weapon:'crossbow',crest:'✧'},
 arcanista:{primary:'#594982',secondary:'#283657',trim:'#b5a3e5',glow:'#a88aff',weapon:'staff',crest:'✶'},
 devota:{primary:'#aa986e',secondary:'#d2b890',trim:'#ffe3aa',glow:'#ffdd91',weapon:'scepter',crest:'✺'},
 tecelao:{primary:'#497476',secondary:'#293e5c',trim:'#a5dad5',glow:'#87e5dd',weapon:'orb',crest:'◇'},
 espectro:{primary:'#5c546b',secondary:'#22283b',trim:'#b6b6da',glow:'#b0b4ef',weapon:'daggers',crest:'✥'}
});
const PI=Math.PI;
function polygon(ctx,pts,fill,stroke,line=2){
 ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
 if(fill){ctx.fillStyle=fill;ctx.fill();}
 if(stroke){ctx.lineWidth=line;ctx.strokeStyle=stroke;ctx.stroke();}
}
function circle(ctx,x,y,r,color){
 ctx.beginPath();ctx.arc(x,y,r,0,PI*2);ctx.fillStyle=color;ctx.fill();
}
function line(ctx,a,b,color,width=3){
 ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();
}
function glow(ctx,x,y,r,color){
 const g=ctx.createRadialGradient(x,y,3,x,y,r);
 g.addColorStop(0,color+'88');g.addColorStop(.40,color+'32');g.addColorStop(1,color+'00');
 circle(ctx,x,y,r,g);
}
function drawWeapon(ctx,style,id){
 const gold=style.trim,metal='#e4e9e3',dark='#202d39';
 ctx.lineJoin='round';
 switch(style.weapon){
 case 'shield':
  line(ctx,[329,284],[370,125],gold,9);
  polygon(ctx,[[367,96],[381,129],[354,133]],metal,gold,3);
  polygon(ctx,[[119,199],[173,182],[190,266],[156,332],[118,285]],style.secondary,gold,5);
  polygon(ctx,[[133,216],[163,206],[174,266],[157,296],[133,268]],style.primary,'#ffffff77',2);
  polygon(ctx,[[154,223],[165,243],[155,260],[145,243]],gold);
  break;
 case 'axe':
  line(ctx,[344,341],[385,99],'#6d462c',12);
  polygon(ctx,[[372,100],[412,91],[419,131],[399,153],[366,145]],metal,gold,3);
  polygon(ctx,[[383,99],[351,93],[346,133],[370,146]],'#b4c1c3',dark,3);
  break;
 case 'bow':
  ctx.beginPath();ctx.ellipse(370,210,42,130,-.2,-1.45,1.5);ctx.strokeStyle=gold;ctx.lineWidth=9;ctx.stroke();
  line(ctx,[345,93],[385,332],'#d3e6dd',2);
  line(ctx,[305,238],[380,211],metal,4);
  polygon(ctx,[[387,207],[378,219],[381,207],[373,201]],gold);
  break;
 case 'crossbow':
  line(ctx,[293,260],[408,217],'#8d7152',15);
  ctx.beginPath();ctx.arc(366,208,51,.8,3.9);ctx.lineWidth=8;ctx.strokeStyle=metal;ctx.stroke();
  line(ctx,[330,173],[394,248],gold,2);
  circle(ctx,373,217,14,style.glow);
  break;
 case 'staff':
 case 'scepter':
  line(ctx,[347,343],[366,93],gold,10);
  polygon(ctx,[[352,116],[368,65],[387,114],[367,133]],style.glow,metal,3);
  glow(ctx,369,105,50,style.glow);
  if(style.weapon==='scepter'){
   for(let i=0;i<6;i++){const a=i*PI/3;circle(ctx,369+Math.cos(a)*35,100+Math.sin(a)*35,5,gold);}
  }
  break;
 case 'orb':
  glow(ctx,358,173,76,style.glow);
  circle(ctx,358,173,31,style.glow);
  polygon(ctx,[[358,139],[378,173],[358,207],[338,173]],'#e7ffff',gold,3);
  for(let i=0;i<6;i++){const a=i*PI/3;circle(ctx,358+Math.cos(a)*52,173+Math.sin(a)*34,5,gold);}
  break;
 case 'daggers':
  line(ctx,[313,315],[367,191],gold,8);
  line(ctx,[142,317],[112,206],gold,8);
  polygon(ctx,[[354,206],[369,167],[375,190]],metal,style.glow,3);
  polygon(ctx,[[105,219],[105,174],[121,199]],metal,style.glow,3);
  break;
 }
}
export function drawClassPortrait(canvas,classId,frame=0){
 if(!canvas||typeof canvas.getContext!=='function')throw new TypeError('Canvas inválido');
 const ctx=canvas.getContext('2d');
 if(!ctx)return false;
 const style=PORTRAIT_STYLES[classId]||PORTRAIT_STYLES.sentinela;
 const W=canvas.width,H=canvas.height;
 ctx.clearRect(0,0,W,H);
 ctx.save();ctx.scale(W/480,H/390);
 const bg=ctx.createLinearGradient(0,0,0,390);
 bg.addColorStop(0,'#1e303b');bg.addColorStop(.55,'#172633');bg.addColorStop(1,'#0a1421');
 ctx.fillStyle=bg;ctx.fillRect(0,0,480,390);
 glow(ctx,245,145,170,style.glow);
 ctx.save();ctx.globalAlpha=.14;
 circle(ctx,240,164,130,'#91a9ad');
 circle(ctx,240,164,121,'#172633');
 for(let i=0;i<16;i++){const a=i*PI/8+frame*.002;circle(ctx,240+Math.cos(a)*141,164+Math.sin(a)*141,2.1,style.trim);}
 ctx.restore();
 // Silhueta de torreões e ruínas ao fundo.
 for(const [x,h,w] of [[14,130,50],[73,95,40],[135,119,37],[346,122,42],[408,153,54]]){
  const y=390-h;ctx.fillStyle='#09131d';ctx.fillRect(x,y,w,h);
  for(let px=x;px<x+w;px+=14)ctx.fillRect(px,y-12,9,12);
  ctx.fillStyle='#6d604431';for(let wy=y+28;wy<390;wy+=36)ctx.fillRect(x+14,wy,7,12);
 }
 ctx.fillStyle='#101b25';ctx.beginPath();ctx.ellipse(237,384,195,40,0,0,PI*2);ctx.fill();
 // Capa e pernas.
 polygon(ctx,[[163,189],[311,189],[333,385],[151,385]],style.secondary,'#111820',3);
 polygon(ctx,[[199,307],[225,310],[223,390],[187,390]],'#3c424c',style.trim,3);
 polygon(ctx,[[258,310],[284,310],[302,390],[258,390]],'#3c424c',style.trim,3);
 polygon(ctx,[[180,379],[226,372],[229,390],[173,390]],'#202c35',style.trim,3);
 polygon(ctx,[[256,373],[307,372],[315,390],[257,390]],'#202c35',style.trim,3);
 // Torso triangular volumétrico, ombreiras e braços.
 const armor=ctx.createLinearGradient(152,158,326,336);
 armor.addColorStop(0,style.primary);armor.addColorStop(.45,style.secondary);armor.addColorStop(1,style.primary);
 polygon(ctx,[[176,165],[303,166],[325,288],[287,332],[193,334],[156,287]],armor,style.trim,4);
 polygon(ctx,[[170,170],[141,189],[137,253],[172,272],[195,216]],style.primary,style.trim,4);
 polygon(ctx,[[306,170],[335,188],[343,256],[308,269],[290,213]],style.primary,style.trim,4);
 polygon(ctx,[[139,249],[177,265],[167,324],[137,331]],style.secondary,style.trim,3);
 polygon(ctx,[[308,261],[341,249],[349,328],[312,329]],style.secondary,style.trim,3);
 polygon(ctx,[[191,172],[286,174],[283,211],[238,241],[195,212]],'#18232e',style.trim,3);
 polygon(ctx,[[205,193],[237,218],[267,192],[238,251]],style.primary,style.trim,2);
 polygon(ctx,[[193,298],[286,298],[285,324],[193,324]],'#2b2a30',style.trim,3);
 polygon(ctx,[[223,301],[254,301],[254,321],[223,321]],style.trim,'#f4e2bb',2);
 // Cabeça, cabelo e peças de elmo próprias da classe.
 polygon(ctx,[[207,107],[270,107],[278,171],[238,201],[199,171]],'#b78c71','#2b2d30',3);
 polygon(ctx,[[202,114],[201,138],[216,126],[266,126],[278,138],[271,105],[254,87],[222,86]],'#252b31',style.trim,3);
 polygon(ctx,[[201,109],[235,76],[271,106],[260,118],[210,118]],style.primary,style.trim,4);
 polygon(ctx,[[231,77],[245,77],[242,113],[233,113]],style.trim);
 if(['sentinela','colosso','vigia'].includes(classId)){
  polygon(ctx,[[210,132],[267,132],[257,161],[218,161]],'#20303c',style.trim,3);
  line(ctx,[217,146],[257,146],style.glow,2);
 }else{
  line(ctx,[218,145],[231,146],style.glow,3);
  line(ctx,[247,146],[260,145],style.glow,3);
 }
 polygon(ctx,[[222,177],[238,188],[257,177],[256,189],[238,204],[219,189]],style.trim);
 // Insígnia gravada no peitoral.
 glow(ctx,239,268,37,style.glow);
 circle(ctx,239,265,17,style.trim);
 circle(ctx,239,265,11,style.secondary);
 polygon(ctx,[[239,252],[250,265],[239,278],[228,265]],style.glow);
 drawWeapon(ctx,style,classId);
 ctx.globalAlpha=.65;
 for(let i=0;i<20;i++){
  const xx=(37+i*73)%450, yy=(i*97+frame*.03*(i%3+1))%390;
  circle(ctx,xx,yy,i%5===0?2:1,style.trim);
 }
 ctx.restore();
 return true;
}
