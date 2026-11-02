import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

const game=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/mobile-game.css',import.meta.url),'utf8');

test('layout mobile usa o mesmo jogo e não altera o save legado',()=>{
 assert.match(game,/href="\.\/src\/mobile-game\.css"/);
 assert.match(game,/const SAVE_KEY = 'reinos-das-cinzas-save-v1'/);
 assert.match(game,/function fitGameViewport\(\)/);
 assert.match(game,/window\.enableLive3D=async function/);
 assert.doesNotMatch(css,/localStorage|sessionStorage|fetch\(/);
 const main=game.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 assert.ok(main);
 assert.doesNotThrow(()=>new Script(main));
});

test('HUD mobile contém vida, mana e botões funcionais',()=>{
 for(const id of [
  'mobileVitals','mobileHeroTitle','mobileHPFill','mobileMPFill',
  'mobileHPText','mobileMPText','mobilePanelsButton','mobilePanelsClose',
  'mobileSidebarBackdrop','mobileLogToggle','touchDpad','actionConsole',
  'skillBar','chatTabsBar'
 ]){
  assert.match(game,new RegExp('id="'+id+'"'));
 }
 assert.match(game,/mobileHpFill\.style\.width=/);
 assert.match(game,/mobileMpFill\.style\.width=/);
 assert.match(game,/mobileHpText\.textContent=/);
 assert.match(game,/mobileMpText\.textContent=/);
 assert.match(game,/window\.triggerHotkey\(1\)/);
 assert.match(game,/window\.movePlayer\(0,-1\)/);
});

test('painel lateral vira gaveta e respeita teclado, foco e acessibilidade',()=>{
 assert.match(css,/#gameSidebar\s*\{[\s\S]*?position:fixed!important/);
 assert.match(css,/body\.mobile-panels-open #gameSidebar/);
 assert.match(css,/body\.mobile-panels-open #mobileSidebarBackdrop/);
 assert.match(game,/mobileSidebar\.inert=allowed&&!visible/);
 assert.match(game,/mobilePanelsButton\.setAttribute\('aria-expanded'/);
 assert.match(game,/mobilePanelsClose\.addEventListener\('click'/);
 assert.match(game,/mobileBackdrop\.addEventListener\('click'/);
 assert.match(game,/window\.addEventListener\('keydown'/);
});

test('mapa ganha mais tela e hotbar não quebra em duas linhas no celular',()=>{
 assert.match(css,/pointer:coarse/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\)!important/);
 assert.match(css,/grid-template-rows:minmax\(0,1fr\) 76px!important/);
 assert.match(css,/#skillBar\s*\{[\s\S]*?flex-wrap:nowrap!important/);
 assert.match(css,/overflow-x:auto!important/);
 assert.match(css,/#touchDpad\s*\{[\s\S]*?display:grid!important/);
 assert.match(css,/#live3dCameraControls/);
 assert.match(css,/body\.mobile-log-open/);
 assert.match(game,/mobileLogToggle\.addEventListener\('click'/);
});

test('interface desktop preservada fora do media query',()=>{
 const start=css.indexOf('@media');
 assert.ok(start>0);
 assert.match(css.slice(0,start),/#mobilePanelsButton,#mobilePanelsClose,#mobileVitals,#mobileSidebarBackdrop,#mobileLogToggle\{display:none\}/);
 assert.match(game,/id="gameSidebar"/);
 assert.match(game,/id="minimapCanvas"/);
 assert.match(game,/id="chatLog"/);
 assert.match(game,/id="hk6"/);
});
