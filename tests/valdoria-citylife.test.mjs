import test from 'node:test';
import assert from 'node:assert/strict';
import {createPatrol, advancePatrol} from '../src/valdoria-citylife.js';

test('morador avança suavemente em direção ao próximo ponto',()=>{
  const p=createPatrol([[0,0],[0,10]],2);
  advancePatrol(p,.05);
  assert.ok(Math.abs(p.z-.1)<1e-8);
  assert.equal(p.x,0);
  assert.equal(p.walking,true);
});

test('passagem de aba não teletransporta personagens',()=>{
  const p=createPatrol([[0,0],[10,0]],3);
  advancePatrol(p,500);
  assert.ok(p.x <= .150001);
});

test('rota circular retorna para o começo',()=>{
  const p=createPatrol([[0,0],[.1,0],[.1,.1],[0,.1]],4);
  for(let i=0;i<30;i++)advancePatrol(p,.05);
  assert.ok(p.x >= -0.0001 && p.x <= .1001);
  assert.ok(p.z >= -0.0001 && p.z <= .1001);
  assert.ok(p.index>=0 && p.index < 4);
});

test('pontos sobrepostos não bloqueiam o simulador',()=>{
  const p=createPatrol([[1,1],[1,1],[2,1]],2);
  advancePatrol(p,.05);
  assert.ok(p.x > 1 && p.x <= 1.1);
});

test('rotas inválidas são rejeitadas',()=>{
  assert.throws(()=>createPatrol([]),TypeError);
  assert.throws(()=>createPatrol([[0,0],[NaN,2]]),TypeError);
  assert.throws(()=>createPatrol([[0,0],[1,2]],0),RangeError);
});
