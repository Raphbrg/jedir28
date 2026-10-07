import express from 'express';
import {createServer as createViteServer} from 'vite';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia} from '@remotion/renderer';
import {validate} from './src/model.mjs';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
const root=path.dirname(new URL(import.meta.url).pathname);
const app=express();app.use(express.json({limit:'18mb'}));
await fs.mkdir(path.join(root,'exports'),{recursive:true});
const jobs=new Map();let active=false;let bundled;
app.post('/api/render',async(req,res)=>{try{validate(req.body);if(!/^data:image\/(png|jpeg|webp);base64,/.test(req.body.cover))throw Error('Pochette PNG, JPEG ou WebP requise.');}catch(e){return res.status(400).json({error:e.message});}if(active)return res.status(409).json({error:'Un export est déjà en cours. Patientez.'});active=true;const id=randomUUID();jobs.set(id,{status:'rendering',progress:0});res.json({id});try{bundled=await bundle({entryPoint:path.join(root,'src/remotion.jsx')});const inputProps={data:req.body};const options={serveUrl:bundled,inputProps,browserExecutable:process.env.CHROME_PATH||'/usr/bin/chromium'};const composition=await selectComposition({...options,id:'AlbumReview'});await renderMedia({...options,composition,codec:'h264',pixelFormat:'yuv420p',crf:18,concurrency:2,outputLocation:path.join(root,'exports',`${id}.mp4`),onProgress:({progress})=>jobs.set(id,{status:'rendering',progress})});jobs.set(id,{status:'done',progress:1,url:`/api/download/${id}`});}catch(e){console.error(e);jobs.set(id,{status:'error',error:'Échec du rendu : '+e.message});}finally{active=false;}});
app.get('/api/jobs/:id',(req,res)=>{const job=jobs.get(req.params.id);if(!job)return res.status(404).json({error:'Export introuvable.'});res.json(job)});
app.get('/api/download/:id',(req,res)=>{if(jobs.get(req.params.id)?.status!=='done')return res.sendStatus(404);res.download(path.join(root,'exports',`${req.params.id}.mp4`),'album-review.mp4')});
app.get('/api/health',(_,res)=>res.json({ok:true}));
if(process.env.NODE_ENV==='production')app.use(express.static(path.join(root,'dist')));else {const vite=await createViteServer({server:{middlewareMode:true},appType:'spa'});app.use(vite.middlewares);}
app.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Album Studio démarré sur le port '+(process.env.PORT||3000)));
