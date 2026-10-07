import {bundle} from '@remotion/bundler';
import {selectComposition,renderStill} from '@remotion/renderer';
import {timing} from '../src/model.mjs';
import assert from 'node:assert/strict';
const serveUrl=await bundle({entryPoint:'src/remotion.jsx'});
for(const count of [8,20]){const data={artist:'ARTISTE TEST',album:'Album de validation',cover:'',score:9.7,tracks:Array.from({length:count},(_,i)=>({id:String(i),title:`MORCEAU ${i+1} — ÉDITION`,score:[10,8.6,7.2,5,4,2,1][i%7]})),top:['0','1','2']};const t=timing(data.tracks);const inputProps={data};const composition=await selectComposition({serveUrl,id:'AlbumReview',inputProps,browserExecutable:'/usr/bin/chromium'});assert.equal(composition.durationInFrames,t.duration);for(const [name,frame] of [['tracklist',t.tracksEnd-15],['result',t.tracksEnd+40],['top',t.topEnd-10],['summary',t.duration-10]]){await renderStill({serveUrl,composition,inputProps,browserExecutable:'/usr/bin/chromium',frame,output:`/tmp/album-${count}-${name}.png`});}console.log(`${count} tracks: final tracklist page, score and top frames rendered; ${(t.duration/30).toFixed(1)}s`);}
