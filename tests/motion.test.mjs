import test from 'node:test';import assert from 'node:assert/strict';
import {smoothProgress,phaseOpacity,coverPose} from '../src/motion.mjs';
import {timing} from '../src/model.mjs';
test('Cover continuously shrinks during note-to-top and moves into the recap',()=>{const t=timing(20);assert.equal(coverPose(t.resultEnd-18,t).size,390);assert.equal(coverPose(t.resultEnd+18,t).size,310);assert.equal(coverPose(t.duration-1,t).size,220);assert.equal(coverPose(t.duration-1,t).left,80);for(let f=t.resultEnd-20;f<t.resultEnd+20;f++)assert.ok(Math.abs(coverPose(f+1,t).size-coverPose(f,t).size)<4);});
test('Crossfades never leave an empty scene at phase boundaries',()=>{const t=timing(20);for(const boundary of [t.tracksEnd,t.resultEnd]){for(let d=-12;d<=12;d++){const f=boundary+d;assert.ok(phaseOpacity(f,boundary-100,boundary)+phaseOpacity(f,boundary,boundary+100)>.99);}}assert.equal(smoothProgress(12,0,24),.5);});
