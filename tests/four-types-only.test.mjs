import assert from 'node:assert/strict';import {score15,report15,WEIGHTS15} from '../supabase/functions/mama-v2/questionnaire15.mjs';
const keys=['bear','tiger','hen','cat'];
// Dynamic programming covers every one of 4^15 complete response combinations.
let states=new Map([['0,0',1]]);for(const weights of WEIGHTS15){const next=new Map();for(const[k,count]of states){const[r,d]=k.split(',').map(Number);for(const w of weights){const key=(r+w[0])+','+(d+(w[1]??0));next.set(key,(next.get(key)||0)+count);}}states=next;}
assert.equal([...states.values()].reduce((a,b)=>a+b,0),4**15);
// Enumerate all 4^5 responses in each scene, then sample whole questionnaires.
for(let scene=0;scene<3;scene++)for(let n=0;n<1024;n++){let v=n;const a=Array(15).fill(0);for(let i=0;i<5;i++){a[scene*5+i]=v%4;v=Math.floor(v/4);}const r=score15(a),s=r.scenes[scene];assert(keys.includes(r.key));assert(keys.includes(s.key));const expected=s.R>1.5?(s.D>1.5?'bear':'hen'):(s.D>1.5?'tiger':'cat');assert.equal(s.key,expected);if(s.D===1.5)assert(['hen','cat'].includes(s.key));}
let seed=17;for(let i=0;i<10000;i++){const a=Array.from({length:15},()=>{seed=(seed*1664525+1013904223)>>>0;return(seed>>>8)%4;});const r=score15(a);assert(keys.includes(r.key));assert.equal(r.key,r.R>1.5?(r.D>1.5?'bear':'hen'):(r.D>1.5?'tiger':'cat'));}
const r=report15(Array(15).fill(0));assert.equal(r.classificationVersion,'four-types-20261102');assert.equal(r.key,'tiger');assert(!JSON.stringify(r).includes('类型交界'));assert.equal(score15(Array(15).fill(4)).key,'insufficient15');
console.log('PASS: all 1,024 patterns per scene, 10,000 full questionnaires, exact ties go to the <= half side, scoring version recorded; all completed answers return one of four types.');
