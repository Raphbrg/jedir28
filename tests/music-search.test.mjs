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

test('Discography resolves the exact artist and lists albums beyond song search',async()=>{
 const {artistAlbums,albumTracks}=await import('../src/music-search.mjs');
 const fetcher=async url=>({ok:true,json:async()=>({results:url.pathname==='/search'?[{wrapperType:'artist',artistName:'Ninho',artistId:42},{wrapperType:'artist',artistName:'Other',artistId:9}]:url.searchParams.get('entity')==='album'?[{wrapperType:'artist',artistId:42},{wrapperType:'collection',collectionId:7,collectionName:'Album test',artistName:'Ninho',releaseDate:'2025-01-01',trackCount:2}]:[{wrapperType:'collection',collectionId:7},{kind:'song',collectionId:7,trackId:8,trackName:'Titre test',artistName:'Ninho',collectionName:'Album test',previewUrl:'https://audio-ssl.itunes.apple.com/test.m4a'},{kind:'song',collectionId:99,trackId:10}]})});
 const result=await artistAlbums('Ninho','all',fetcher);assert.equal(result.albums.length,1);assert.equal(result.albums[0].id,7);assert.equal(result.warning,null);
 const tracks=await albumTracks(7,'FR',fetcher);assert.equal(tracks.length,1);assert.equal(tracks[0].title,'Titre test');assert.equal(tracks[0].country,'FR');
});
test('Discography reports partial regional failures and rejects ambiguous artists',async()=>{
 const {artistAlbums}=await import('../src/music-search.mjs');
 await assert.rejects(artistAlbums('Ninho','FR',async()=>({ok:true,json:async()=>({results:[{wrapperType:'artist',artistName:'Ninho',artistId:1},{wrapperType:'artist',artistName:'Ninho',artistId:2}]})})),/Plusieurs artistes/);
 const result=await artistAlbums('Ninho','all',async url=>{if(url.searchParams.get('country')==='US')throw Error('offline');return {ok:true,json:async()=>({results:url.pathname==='/search'?[{wrapperType:'artist',artistName:'Ninho',artistId:1}]:[]})};});assert.match(result.warning,/incomplète/);
});
