import express from 'express';
import multer from 'multer';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const runFile=promisify(execFile);
import {createServer as createViteServer} from 'vite';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia} from '@remotion/renderer';
import {validate} from './src/model.mjs';
import {validateTop} from './src/top/model.mjs';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
const root=path.dirname(new URL(import.meta.url).pathname);
const app=express();app.use(express.json({limit:'80mb'}));
await fs.mkdir(path.join(root,'exports'),{recursive:true});
const audioDir=path.join(root,'exports','audio');await fs.mkdir(audioDir,{recursive:true});
const audioUpload=multer({storage:multer.diskStorage({destination:audioDir,filename:(_,file,cb)=>cb(null,randomUUID())}),limits:{fileSize:20*1024*1024}}).single('audio');
app.post('/api/audio',(req,res)=>audioUpload(req,res,async error=>{
 if(error)return res.status(400).json({error:'Fichier audio limité à 20 Mo.'});
 if(!req.file)return res.status(400).json({error:'Choisissez un fichier audio.'});
 try{const {stdout}=await runFile('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_type','-of','json',req.file.path]);const probe=JSON.parse(stdout);const duration=Number(probe.format.duration);if(!probe.streams.some(s=>s.codec_type==='audio')||probe.streams.some(s=>s.codec_type==='video')||!Number.isFinite(duration)||duration<=0)throw Error('Audio invalide');res.json({url:'/api/audio/'+req.file.filename,duration});}
 catch{await fs.unlink(req.file.path).catch(()=>{});res.status(400).json({error:'Audio illisible. Utilisez un fichier MP3, WAV ou M4A.'});}
}));
app.get('/api/audio/:id',(req,res)=>{if(!/^[a-f0-9-]{36}$/.test(req.params.id))return res.sendStatus(404);res.sendFile(path.join(audioDir,req.params.id));});
const jobs=new Map();let active=false;
function renderHandler(compositionId,validateData,downloadName){return async(req,res)=>{
 try{validateData(req.body);}catch(e){return res.status(400).json({error:e.message});}
 if(active)return res.status(409).json({error:'Un export est déjà en cours. Patientez.'});
 active=true;const id=randomUUID();jobs.set(id,{status:'rendering',progress:0,downloadName});res.json({id});
 try{
  const serveUrl=await bundle({entryPoint:path.join(root,'src/remotion.jsx')});
  const renderData=compositionId==='LeTop'?{...req.body,entries:req.body.entries.map(entry=>({...entry,audio:entry.audio?'http://127.0.0.1:'+(process.env.PORT||3000)+entry.audio:undefined}))}:req.body;
  const options={serveUrl,inputProps:{data:renderData},browserExecutable:process.env.CHROME_PATH||'/usr/bin/chromium'};
  const composition=await selectComposition({...options,id:compositionId});
  await renderMedia({...options,composition,codec:'h264',pixelFormat:'yuv420p',crf:18,concurrency:2,outputLocation:path.join(root,'exports',`${id}.mp4`),onProgress:({progress})=>jobs.set(id,{status:'rendering',progress,downloadName})});
  jobs.set(id,{status:'done',progress:1,url:`/api/download/${id}`,downloadName});
 }catch(e){console.error(e);jobs.set(id,{status:'error',error:'Échec du rendu : '+e.message,downloadName});}
 finally{active=false;}
};}
app.post('/api/render',renderHandler('AlbumReview',data=>{validate(data);if(!/^data:image\/(png|jpeg|webp);base64,/.test(data.cover))throw Error('Pochette PNG, JPEG ou WebP requise.');},'album-review.mp4'));
app.post('/api/top/render',renderHandler('LeTop',validateTop,'le-top.mp4'));
app.get('/api/jobs/:id',(req,res)=>{const job=jobs.get(req.params.id);if(!job)return res.status(404).json({error:'Export introuvable.'});res.json(job);});
app.get('/api/download/:id',(req,res)=>{const job=jobs.get(req.params.id);if(job?.status!=='done')return res.sendStatus(404);res.download(path.join(root,'exports',`${req.params.id}.mp4`),job.downloadName);});
app.get('/api/health',(_,res)=>res.json({ok:true}));
if(process.env.NODE_ENV==='production')app.use(express.static(path.join(root,'dist')));
else {const vite=await createViteServer({server:{middlewareMode:true},appType:'spa'});app.use(vite.middlewares);}
app.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Album Studio démarré sur le port '+(process.env.PORT||3000)+' · LE TOP disponible sur /le-top.html'));
