import test from 'node:test';
import assert from 'node:assert/strict';
import {PORTRAIT_STYLES,drawClassPortrait} from '../src/class-portraits.js';
import {CLASSES} from '../src/class-catalog.js';
import {readFileSync} from 'node:fs';

function fakeCanvas(){
 let strokes=0,shapes=0;
 const ctx={
  createLinearGradient(){return {addColorStop(){}};},
  createRadialGradient(){return {addColorStop(){}};},
  clearRect(){},save(){},restore(){},scale(){},
  beginPath(){shapes++;},closePath(){},moveTo(){},lineTo(){},
  arc(){},ellipse(){},fill(){},stroke(){strokes++;},fillRect(){},
 };
 return {width:720,height:585,getContext(){return ctx},inspect(){return {strokes,shapes}}};
}
test('oito retratos correspondem às oito classes',()=>{
 assert.deepEqual(Object.keys(PORTRAIT_STYLES).sort(),CLASSES.map(c=>c.id).sort());
});
test('cada retrato vetorial desenha sem erro em canvas 2D',()=>{
 for(const c of CLASSES){
  const canvas=fakeCanvas();
  assert.equal(drawClassPortrait(canvas,c.id),true,c.id);
  const {shapes,strokes}=canvas.inspect();
  assert.ok(shapes>20,c.id+' contém formas');
  assert.ok(strokes>10,c.id+' contém contornos');
 }
});
test('seletor tem ilustração e continua isolado do save legado',()=>{
 const html=readFileSync(new URL('../preview/classes.html',import.meta.url),'utf8');
 assert.match(html,/id="classPortrait"/);
 assert.match(html,/drawClassPortrait\(portrait,chosen\)/);
 assert.match(html,/portraitName/);
 assert.doesNotMatch(html,/localStorage\.(setItem|removeItem|clear)/);
 assert.doesNotMatch(html,/reinos-das-cinzas-save-v1/);
});
