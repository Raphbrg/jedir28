// Test-only Apple responses. Audio is a generated sine wave, never a song.
import {execFileSync} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
import {ninhoAppleMatches} from '../../src/ninho-apple-matches.mjs';
const tone=execFileSync(ffmpeg,['-v','error','-f','lavfi','-i','sine=frequency=440:duration=5','-f','wav','pipe:1']);
const original=globalThis.fetch;
globalThis.fetch=async(input,options)=>{
 const url=new URL(input);
 if(url.hostname==='api.deezer.com'){const track={id:702,title:'Zipette',artist:{name:'Ninho'},album:{title:'M.I.L.S 3'},preview:'https://cdnt-preview.dzcdn.net/test.mp3'};return Response.json(url.pathname==='/search'?{data:[track]}:track);}
 if(url.hostname==='audio-ssl.itunes.apple.com'&&process.env.TEST_APPLE_AUDIO_FAILURE==='1')return new Response('Unavailable',{status:503});
 if(url.hostname==='audio-ssl.itunes.apple.com'||url.hostname==='cdnt-preview.dzcdn.net')return new Response(tone,{headers:{'Content-Type':'audio/wav'}});
 if(url.hostname!=='itunes.apple.com')return original(input,options);
 const artist={wrapperType:'artist',artistName:'Ninho',artistId:320366644};
 const album={wrapperType:'collection',collectionId:700,collectionName:'Album de test',artistName:'Ninho',releaseDate:'2025-01-01',trackCount:1};
 const saved=Object.values(ninhoAppleMatches).find(t=>String(t.appleId)===url.searchParams.get('id'));
 const track={kind:'song',collectionId:700,trackId:701,trackName:'Titre de test',artistName:'Ninho',collectionName:'Album de test',previewUrl:'https://audio-ssl.itunes.apple.com/test.wav'};
 if(saved)Object.assign(track,{trackId:saved.appleId,trackName:saved.title,artistName:saved.artist});
 return Response.json({results:url.pathname==='/search'?[artist]:url.searchParams.get('entity')==='album'?[artist,album]:url.searchParams.get('entity')==='song'?[album,track]:[track]});
};
