import test from 'node:test';
import assert from 'node:assert/strict';
import {ninhoCatalogue,filterNinhoCatalogue} from '../src/ninho-catalogue.mjs';
import {resolveNinhoTrack} from '../src/ninho-resolver.mjs';
test('Project catalogue preserves all titles, repeated intros/outros and unique IDs without a network',()=>{
 assert.equal(ninhoCatalogue.length,150);assert.equal(new Set(ninhoCatalogue.map(t=>t.id)).size,150);
 assert.equal(ninhoCatalogue.filter(t=>t.title==='Intro').length,2);assert.equal(ninhoCatalogue.filter(t=>t.title==='Outro').length,2);
 assert.equal(ninhoCatalogue[0].title,'M.I.L.S');assert.equal(ninhoCatalogue.at(-1).title,'DES PIGES');
 assert.equal(filterNinhoCatalogue('NINHO').length,150);assert.equal(filterNinhoCatalogue('cresus')[0].title,'Crésus');assert.equal(filterNinhoCatalogue('N.W.A')[0].title,'N.W.A');
});
test('Preview lookup accepts only the matching title and artist, preserving local IDs',async()=>{
 const track=ninhoCatalogue.find(t=>t.title==='Zipette');
 const fetcher=async()=>({ok:true,json:async()=>({results:[{kind:'song',trackId:5,trackName:'Zipette',artistName:'Other artist',artistId:9},{kind:'song',trackId:6,trackName:'Zipette',artistName:'Ninho',artistId:320366644,previewUrl:'https://audio-ssl.itunes.apple.com/test'}]})});
 const result=await resolveNinhoTrack(track.id,'FR',fetcher);assert.equal(result.id,track.id);assert.equal(result.appleId,6);assert.ok(result.preview);
 const missing=await resolveNinhoTrack(track.id,'FR',async()=>({ok:true,json:async()=>({results:[]})}));assert.equal(missing.title,'Zipette');assert.equal(missing.preview,null);assert.ok(missing.notice);
});
test('Falls back to Deezer when Apple fails, without accepting a different artist',async()=>{
 const track=ninhoCatalogue.find(t=>t.title==='Zipette');let deezerCalled=false;
 const result=await resolveNinhoTrack(track.id,'FR',async url=>{
  if(url.hostname==='itunes.apple.com')throw Error('Apple offline');deezerCalled=true;
  return {ok:true,json:async()=>({data:[{id:1,title:'Zipette',artist:{name:'Other'},preview:'https://cdnt-preview.dzcdn.net/1'},{id:2,title:'Zipette',artist:{name:'Ninho'},preview:'https://cdnt-preview.dzcdn.net/2'}]})};
 });
 assert.ok(deezerCalled);assert.equal(result.provider,'deezer');assert.equal(result.deezerId,2);assert.equal(result.id,track.id);
});
test('Deezer imports resolve official track IDs and enforce audio host checks',async()=>{
 const {downloadDeezerPreview}=await import('../src/deezer-preview.mjs');let calls=0;
 const result=await downloadDeezerPreview(2,async()=>++calls===1?{ok:true,json:async()=>({id:2,title:'Zipette',artist:{name:'Ninho'},preview:'https://cdnt-preview.dzcdn.net/test'})}:new Response(new Uint8Array([1,2,3])));
 assert.equal(result.trackId,2);assert.equal(result.name,'Ninho - Zipette (extrait Deezer)');assert.equal(result.buffer.length,3);
 await assert.rejects(downloadDeezerPreview(2,async()=>({ok:true,json:async()=>({id:2,preview:'https://localhost/private'})})),/non reconnue/);
});
test('All 150 project entries have a verified Apple title match and a public preview URL',async()=>{
 const {ninhoAudioCatalogue}=await import('../src/ninho-catalogue.mjs');
 assert.equal(ninhoAudioCatalogue.length,150);
 for(const track of ninhoAudioCatalogue){assert.ok(Number.isInteger(track.appleId),track.title);assert.equal(track.provider,'apple');assert.equal(new URL(track.preview).hostname,'audio-ssl.itunes.apple.com');assert.ok(track.album,track.title);}
});
