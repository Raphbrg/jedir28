import express from 'express';
import multer from 'multer';
import {searchMusic} from './src/music-search.mjs';
import {normalizeAudio,AUDIO_MAX_BYTES,audioFileName} from './src/audio-server.mjs';
import {createServer as createViteServer} from 'vite';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia} from '@remotion/renderer';
import {validate} from './src/model.mjs';
import {validateDiscovery} from './src/discovery/model.mjs';
import {validateTop} from './src/top/model.mjs';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
const root=path.dirname(new URL(import.meta.url).pathname);
const app=express();app.use(express.json({limit:'80mb'}));
await fs.mkdir(path.join(root,'exports'),{recursive:true});
const audioDir=path.join(root,'exports','audio');await fs.mkdir(audioDir,{recursive:true});
const audioUpload=multer({storage:multer.diskStorage({destination:audioDir,filename:(_,file,cb)=>cb(null,randomUUID())}),limits:{fileSize:AUDIO_MAX_BYTES}}).single('audio');
app.post('/api/audio',(req,res)=>audioUpload(req,res,async error=>{
 if(error){console.error('Import audio:',error.message);return res.status(400).json({error:error.code==='LIMIT_FILE_SIZE'?'Fichier trop volumineux : 100 Mo maximum.':'L’import audio a échoué. Réessayez avec un seul fichier.'});}
 if(!req.file)return res.status(400).json({error:'Choisissez un fichier audio.'});
 try{const duration=await normalizeAudio(req.file.path,req.file.path+'.mp3');const audio={url:'/api/audio/'+req.file.filename,duration,name:audioFileName(req.file.originalname),createdAt:Date.now()};await fs.writeFile(req.file.path+'.json',JSON.stringify(audio));res.json(audio);}
 catch(error){await fs.unlink(req.file.path+'.mp3').catch(()=>{});console.error('Import audio:',error.message);res.status(400).json({error:error.message});}
 finally{await fs.unlink(req.file.path).catch(()=>{});}
}));
app.get('/api/audio/:id',async(req,res)=>{if(!/^[a-f0-9-]{36}$/.test(req.params.id))return res.sendStatus(404);const file=path.join(audioDir,req.params.id);try{await fs.access(file+'.mp3');res.type('audio/mpeg');res.sendFile(file+'.mp3');}catch{res.sendFile(file);}});
app.get('/api/audio-library',async(req,res)=>{
 try{const names=(await fs.readdir(audioDir)).filter(name=>/^[a-f0-9-]{36}\.json$/.test(name));const audios=(await Promise.all(names.map(async name=>{try{const audio=JSON.parse(await fs.readFile(path.join(audioDir,name),'utf8'));audio.name=audioFileName(audio.name);await fs.access(path.join(audioDir,name.replace('.json','.mp3')));return audio;}catch{return null;}}))).filter(Boolean).sort((a,b)=>b.createdAt-a.createdAt);res.json({audios});}catch{res.status(500).json({error:'La bibliothèque audio est indisponible.'});}
});
app.get('/api/music-search',async(req,res)=>{try{if(typeof req.query.q!=='string'||req.query.q.trim().length<2)return res.status(400).json({error:'Saisissez au moins deux caractères.'});res.json({tracks:await searchMusic(req.query.q,fetch,typeof req.query.region==='string'?req.query.region:'FR',typeof req.query.artist==='string'?req.query.artist:'')});}catch(error){console.error('Recherche musique:',error.message);res.status(503).json({error:'Catalogue Apple inaccessible pour le moment. Réessayez ou cherchez dans Mes audios.'});}});
const jobs=new Map();let active=false;
function renderHandler(compositionId,validateData,downloadName){return async(req,res)=>{
 try{validateData(req.body);}catch(e){return res.status(400).json({error:e.message});}
 if(active)return res.status(409).json({error:'Un export est déjà en cours. Patientez.'});
 active=true;const id=randomUUID();jobs.set(id,{status:'rendering',progress:0,downloadName});res.json({id});
 try{
  const serveUrl=await bundle({entryPoint:path.join(root,'src/remotion.jsx')});
  const renderData=compositionId==='LeTop'?{...req.body,entries:req.body.entries.map(entry=>({...entry,audio:entry.audio?'http://127.0.0.1:'+(process.env.PORT||3000)+entry.audio:undefined}))}:compositionId==='Discovery'?{...req.body,audio:req.body.audio?'http://127.0.0.1:'+(process.env.PORT||3000)+req.body.audio:undefined}:req.body;
  const options={serveUrl,inputProps:{data:renderData},browserExecutable:process.env.CHROME_PATH||'/usr/bin/chromium'};
  const composition=await selectComposition({...options,id:compositionId});
  await renderMedia({...options,composition,codec:'h264',pixelFormat:'yuv420p',crf:18,concurrency:2,outputLocation:path.join(root,'exports',`${id}.mp4`),onProgress:({progress})=>jobs.set(id,{status:'rendering',progress,downloadName})});
  jobs.set(id,{status:'done',progress:1,url:`/api/download/${id}`,downloadName});
 }catch(e){console.error(e);jobs.set(id,{status:'error',error:'Échec du rendu : '+e.message,downloadName});}
 finally{active=false;}
};}
app.post('/api/render',renderHandler('AlbumReview',data=>{validate(data);if(!/^data:image\/(png|jpeg|webp);base64,/.test(data.cover))throw Error('Pochette PNG, JPEG ou WebP requise.');},'album-review.mp4'));
app.post('/api/discovery/render',renderHandler('Discovery',validateDiscovery,'la-decouverte.mp4'));
app.post('/api/top/render',renderHandler('LeTop',validateTop,'le-top.mp4'));
app.get('/api/jobs/:id',(req,res)=>{const job=jobs.get(req.params.id);if(!job)return res.status(404).json({error:'Export introuvable.'});res.json(job);});
app.get('/api/download/:id',(req,res)=>{const job=jobs.get(req.params.id);if(job?.status!=='done')return res.sendStatus(404);res.download(path.join(root,'exports',`${req.params.id}.mp4`),job.downloadName);});
app.get('/api/health',(_,res)=>res.json({ok:true}));
if(process.env.NODE_ENV==='production')app.use(express.static(path.join(root,'dist')));
else {const vite=await createViteServer({server:{middlewareMode:true},appType:'spa'});app.use(vite.middlewares);}
const port=Number(process.env.PORT||3000);
app.listen(port,'0.0.0.0',error=>{if(error){console.error('Impossible de démarrer sur le port '+port+' : '+error.message);process.exit(1);}console.log('Album Studio · LE TOP · La Découverte démarrés sur le port '+port);});
