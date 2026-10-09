import test from 'node:test';
import assert from 'node:assert/strict';
import {searchMusic} from '../src/music-search.mjs';
test('Catalogue query is encoded and returns usable previews without arbitrary URL protocols',async()=>{
 let requested;
 const tracks=await searchMusic('Été & Laylow',async url=>{requested=url;return {ok:true,json:async()=>({results:[{kind:'song',trackId:1,trackName:'Été',artistName:'Laylow',collectionName:'Album',previewUrl:'https://audio.example/preview.m4a',trackViewUrl:'https://music.apple.com/fr/album/1'},{kind:'song',trackId:2,previewUrl:'javascript:alert(1)'},{kind:'feature-movie'}]})};});
 assert.equal(requested.origin,'https://itunes.apple.com');assert.equal(requested.searchParams.get('term'),'Été & Laylow');assert.equal(tracks.length,2);assert.equal(tracks[0].preview,'https://audio.example/preview.m4a');assert.equal(tracks[1].preview,null);
 await assert.rejects(searchMusic('a'),/deux caractères/);await assert.rejects(searchMusic('valid',async()=>({ok:false})),/indisponible/);
});
