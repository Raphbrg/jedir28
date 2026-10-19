import test from 'node:test';import assert from 'node:assert/strict';
import {smoothProgress,phaseOpacity,coverPose} from '../src/motion.mjs';
import {timing} from '../src/model.mjs';
test('Cover continuously shrinks during note-to-top and moves into the recap',()=>{const t=timing(20);assert.equal(coverPose(t.resultEnd-18,t).size,380);assert.equal(coverPose(t.resultEnd+18,t).size,320);assert.equal(coverPose(t.duration-1,t).size,200);assert.equal(coverPose(t.duration-1,t).left,290);for(let f=0;f<t.duration;f++){const pose=coverPose(f,t);assert.equal(150+pose.left+pose.size/2,540);}
for(let f=t.resultEnd-20;f<t.resultEnd+20;f++)assert.ok(Math.abs(coverPose(f+1,t).size-coverPose(f,t).size)<4);});
test('Crossfades never leave an empty scene at phase boundaries',()=>{const t=timing(20);for(const boundary of [t.tracksEnd,t.resultEnd]){for(let d=-12;d<=12;d++){const f=boundary+d;assert.ok(phaseOpacity(f,boundary-100,boundary)+phaseOpacity(f,boundary,boundary+100)>.99);}}assert.equal(smoothProgress(12,0,24),.5);});
