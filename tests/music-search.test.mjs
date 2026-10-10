import test from 'node:test';
import assert from 'node:assert/strict';
import {searchMusic} from '../src/music-search.mjs';
test('Catalogue query is encoded and returns usable previews without arbitrary URL protocols',async()=>{
 let requested;
 const tracks=await searchMusic('Été & Laylow',async url=>{requested=url;return {ok:true,json:async()=>({results:[{kind:'song',trackId:1,trackName:'Été',artistName:'Laylow',collectionName:'Album',previewUrl:'https://audio.example/preview.m4a',trackViewUrl:'https://music.apple.com/fr/album/1'},{kind:'song',trackId:2,previewUrl:'javascript:alert(1)'},{kind:'feature-movie'}]})};});
 assert.equal(requested.origin,'https://itunes.apple.com');assert.equal(requested.searchParams.get('term'),'Été & Laylow');assert.equal(tracks.length,2);assert.equal(tracks[0].preview,'https://audio.example/preview.m4a');assert.equal(tracks[1].preview,null);
 await assert.rejects(searchMusic('a'),/deux caractères/);await assert.rejects(searchMusic('valid',async()=>({ok:false})),/indisponible/);
});

test('French rap artist fallback finds and ranks PLK despite split title spelling',async()=>{const calls=[];const tracks=await searchMusic('Tout re commencer PLK',async url=>{calls.push(url);return {ok:true,json:async()=>({results:url.searchParams.get('term')==='PLK'?[{kind:'song',trackId:1,trackName:'Tout recommencer',artistName:'PLK',collectionName:'Album',primaryGenreName:'Hip-Hop/Rap'},{kind:'song',trackId:2,trackName:'Autre morceau',artistName:'PLK',collectionName:'Album'}]:[]})};},'FR','PLK');assert.equal(tracks[0].title,'Tout recommencer');assert.ok(calls.some(url=>url.searchParams.get('term')==='PLK'));assert.ok(calls.every(url=>url.searchParams.get('country')==='FR'&&url.searchParams.get('limit')==='200'));});
test('Expanded catalogue deduplicates regions and tolerates one unavailable storefront',async()=>{const countries=[];const tracks=await searchMusic('PLK',async url=>{const country=url.searchParams.get('country');countries.push(country);if(country==='US')throw Error('Unavailable');return {ok:true,json:async()=>({results:[{kind:'song',trackId:1,trackName:'Tout recommencer',artistName:'PLK',collectionName:'Album'}]})};},'all');assert.deepEqual(countries,['FR','US','GB']);assert.equal(tracks.length,1);});
