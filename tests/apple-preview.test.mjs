import test from 'node:test';
import assert from 'node:assert/strict';
import {downloadApplePreview} from '../src/apple-preview.mjs';
const lookup=previewUrl=>({ok:true,json:async()=>({results:[{kind:'song',trackId:7,trackName:'Test',artistName:'Ninho',previewUrl}]})});
test('Imports only the official preview resolved by track ID',async()=>{
 const calls=[];const result=await downloadApplePreview(7,'FR',async(url,options)=>{calls.push(String(url));if(calls.length===1)return lookup('https://audio-ssl.itunes.apple.com/test.m4a');assert.equal(options.redirect,'manual');return new Response(new Uint8Array([1,2,3]));});
 assert.equal(result.name,'Ninho - Test (extrait Apple)');assert.deepEqual([...result.buffer],[1,2,3]);assert.match(calls[0],/id=7/);
});
test('Rejects untrusted preview destinations and redirects before contacting them',async()=>{
 let calls=0;await assert.rejects(downloadApplePreview(7,'FR',async()=>{calls++;return lookup('https://127.0.0.1/private');}),/non reconnue/);assert.equal(calls,1);
 calls=0;await assert.rejects(downloadApplePreview(7,'FR',async()=>{calls++;return calls===1?lookup('https://audio-ssl.itunes.apple.com/test'):new Response(null,{status:302,headers:{location:'http://localhost/private'}});}),/non reconnue/);assert.equal(calls,2);
});
test('Reports missing previews, invalid IDs and oversized downloads',async()=>{
 await assert.rejects(downloadApplePreview('bad'),/invalide/);
 await assert.rejects(downloadApplePreview(7,'FR',async()=>lookup(null)),/Aucun extrait/);
 let calls=0;await assert.rejects(downloadApplePreview(7,'FR',async()=>++calls===1?lookup('https://audio-ssl.itunes.apple.com/test'):new Response('x',{headers:{'content-length':String(21*1024*1024)}})),/volumineux/);
});
