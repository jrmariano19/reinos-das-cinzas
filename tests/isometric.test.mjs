import test from 'node:test';
import assert from 'node:assert/strict';
import { worldToScreen, screenToWorld, screenToTile, tileDrawOrder } from '../src/isometric.js';

test('projeção isométrica preserva coordenadas em ida e volta', () => {
  for (const [x,y] of [[0,0],[12,7],[-3,5],[55,55]]) {
    const p=worldToScreen(x,y,320,80);
    const q=screenToWorld(p.x,p.y,320,80);
    assert.ok(Math.abs(q.x-x)<1e-9);
    assert.ok(Math.abs(q.y-y)<1e-9);
    assert.deepEqual(screenToTile(p.x,p.y,320,80),{x,y});
  }
});
test('ordem de profundidade segue diagonais', () => {
  const tiles=[{x:3,y:3},{x:0,y:0},{x:2,y:1}].sort(tileDrawOrder);
  assert.deepEqual(tiles.map(p=>p.x+p.y),[0,3,6]);
});
