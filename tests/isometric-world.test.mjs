import test from 'node:test';
import assert from 'node:assert/strict';
import { createIsometricWorldRenderer } from '../src/isometric-world.js';
import { worldToScreen } from '../src/isometric.js';

const map = Array.from({length: 56}, (_, y) => Array.from({length: 56}, (_, x) => (x+y)%3));
const renderer = createIsometricWorldRenderer({getTileColor: t => ['#345','#456','#567'][t]});

test('câmera acompanha jogador no centro da viewport', () => {
  const player = {x: 28, y: 20};
  const camera = renderer.cameraFor(player, 720, 528);
  assert.deepEqual(worldToScreen(player.x,player.y,camera.x,camera.y),{x:360,y:264});
});

test('clique no centro corresponde à posição do jogador', () => {
  const player = {x:28,y:20};
  assert.deepEqual(renderer.hitTest(360,264,player,720,528,map),player);
});

test('clique fora do mapa não seleciona tile', () => {
  const player = {x:0,y:0};
  assert.equal(renderer.hitTest(-5000,-5000,player,720,528,map),null);
});

test('renderiza terreno do mapa real sem alterar a matriz', () => {
  let fills=0, objects=0;
  const ctx = {
    beginPath(){},moveTo(){},lineTo(){},closePath(){},
    fill(){fills++},set fillStyle(_value){}
  };
  const snapshot=JSON.stringify(map);
  renderer.draw(ctx,map,{x:28,y:20},720,528,[{x:28,y:20}],()=>objects++);
  assert.ok(fills > 0 && fills < 56*56, 'desenha somente os terrenos visíveis');
  assert.equal(objects,1);
  assert.equal(JSON.stringify(map),snapshot);
});
