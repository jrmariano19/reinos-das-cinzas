import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import { createIsometricWorldRenderer } from '../src/isometric-world.js';
import { worldToScreen } from '../src/isometric.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const scriptMatches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];

test('script principal do jogo permanece sintaticamente válido', () => {
  assert.equal(scriptMatches.length, 1);
  assert.doesNotThrow(() => new Script(scriptMatches[0][1], {filename:'index.html'}));
});

test('cliques clássico e isométrico compartilham seleção e salvamento não muda', () => {
  assert.match(html, /function handleWorldTileSelection\(tileX, tileY\)/);
  assert.match(html, /canvas\.addEventListener\('mousedown',[\s\S]*?handleWorldTileSelection\(tileX, tileY\)/);
  assert.match(html, /isoPreviewCanvas\.addEventListener\('pointerdown',[\s\S]*?handleWorldTileSelection\(tile\.x,tile\.y\)/);
  assert.match(html, /const SAVE_KEY = 'reinos-das-cinzas-save-v1'/);
  assert.match(html, /isoPreviewCanvas\.style\.pointerEvents = isoPreviewEnabled/);
});

test('a projeção de cliques funciona para coordenadas fora do centro', () => {
  const width=720,height=528;
  const player={x:28,y:20};
  const map=Array.from({length:56},()=>Array(56).fill(0));
  const renderer=createIsometricWorldRenderer();
  const camera=renderer.cameraFor(player,width,height);
  for (const point of [{x:20,y:20},{x:30,y:17},{x:33,y:27},{x:25,y:28}]) {
    const projected=worldToScreen(point.x,point.y,camera.x,camera.y);
    assert.deepEqual(renderer.hitTest(projected.x,projected.y,player,width,height,map),point);
  }
});
