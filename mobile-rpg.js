/* Mobile controls adapt to existing movePlayer and triggerHotkey; game rules remain unchanged. */
(function(){
 const hud=document.createElement('div');hud.id='mobileRpgHud';
 hud.innerHTML='<div class="mobile-top"><span class="mobile-title">REINOS DAS CINZAS</span><span>⚔ RPG MOBILE</span></div><div class="mobile-menu"><button type="button" data-action="inventory">🎒 Itens</button><button type="button" data-action="map">🗺 Mapa</button></div><div class="mobile-controls" aria-label="Joystick de movimentação"><div class="mobile-stick"></div></div><div class="mobile-skills"><button type="button" data-skill="2" aria-label="Provocar">🛡</button><button type="button" data-skill="3" aria-label="Correr">👢</button><button type="button" data-skill="4" aria-label="Muralha">🔰</button><button type="button" data-skill="5" aria-label="Poção de vida">❤️</button><button type="button" data-skill="6" aria-label="Poção de mana">💧</button><button type="button" class="mobile-attack" data-skill="1" aria-label="Golpe brutal">⚔</button></div>';
 const hint=document.createElement('div');hint.id='mobilePortraitHint';hint.textContent='↻ Gire o celular para jogar na horizontal';
 document.querySelector('.viewport-container')?.appendChild(hud);document.body.appendChild(hint);
 hud.querySelectorAll('[data-skill]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();window.triggerHotkey?.(Number(b.dataset.skill));}));
 hud.querySelector('[data-action="map"]').addEventListener('click',()=>window.openWorldMap?.());

 // Reparent the live backpack rather than copying its contents: existing item listeners remain intact.
 const inventory=document.createElement('section');inventory.id='mobileInventory';inventory.setAttribute('role','dialog');inventory.setAttribute('aria-label','Inventário');inventory.setAttribute('aria-modal','true');
 inventory.innerHTML='<div id="mobileInventoryHeader"><span>🎒 Inventário</span><button id="mobileInventoryClose" type="button" aria-label="Fechar inventário">✕</button></div><div id="mobileInventoryBody"></div>';
 hud.appendChild(inventory);
 const backpack=document.getElementById('sidebar-backpack');
 const originalParent=backpack?.parentNode, originalNext=backpack?.nextSibling;
 function closeInventory(){inventory.classList.remove('is-open');if(backpack&&originalParent){originalParent.insertBefore(backpack,originalNext&&originalNext.parentNode===originalParent?originalNext:null);} }
 function openInventory(){if(!backpack)return;backpack.open=true;inventory.querySelector('#mobileInventoryBody').appendChild(backpack);inventory.classList.add('is-open');}
 hud.querySelector('[data-action="inventory"]').onclick=()=>inventory.classList.contains('is-open')?closeInventory():openInventory();
 inventory.querySelector('#mobileInventoryClose').addEventListener('click',closeInventory);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeInventory();});
 window.addEventListener('orientationchange',closeInventory);
 const pad=hud.querySelector('.mobile-controls'),stick=hud.querySelector('.mobile-stick');
 let pointer=null,dx=0,dy=0,last=0;
 function stop(){pointer=null;dx=dy=0;stick.style.transform='translate(0px,0px)';}
 function update(e){const r=pad.getBoundingClientRect(),x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2),dist=Math.hypot(x,y),limit=39;const scale=Math.min(1,limit/(dist||1));stick.style.transform='translate('+x*scale+'px,'+y*scale+'px)';if(dist<18){dx=dy=0;return;}if(Math.abs(x)>Math.abs(y)){dx=Math.sign(x);dy=0;}else{dx=0;dy=Math.sign(y);}}
 pad.addEventListener('pointerdown',e=>{e.preventDefault();pointer=e.pointerId;pad.setPointerCapture(pointer);update(e);});
 pad.addEventListener('pointermove',e=>{if(e.pointerId===pointer){e.preventDefault();update(e);}});
 ['pointerup','pointercancel','lostpointercapture'].forEach(type=>pad.addEventListener(type,e=>{if(e.pointerId===pointer)stop();}));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 function tick(t){if(pointer!==null&&(dx||dy)&&t-last>=75){window.movePlayer?.(dx,dy);last=t;}requestAnimationFrame(tick);}requestAnimationFrame(tick);
})();
