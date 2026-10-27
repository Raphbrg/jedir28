import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import ffmpeg from 'ffmpeg-static';
import ffprobe from 'ffprobe-static';
const port=3317;const base=`http://localhost:${port}`;
const server=spawn(process.execPath,['--import','./tests/fixtures/apple-catalogue.mjs','server.mjs'],{env:{...process.env,PORT:String(port),NODE_ENV:'production'},stdio:['ignore','pipe','pipe']});
let logs='';server.stdout.on('data',b=>logs+=b);server.stderr.on('data',b=>logs+=b);
let browser;
try{
 let ready=false;for(let i=0;i<60;i++){try{const r=await fetch(base+'/api/health');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}assert.ok(ready,logs);
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/le-top.html');await page.getByRole('button',{name:'RECHERCHER UN AUDIO',exact:true}).click();await page.getByRole('button',{name:'CATALOGUE',exact:true}).click();await page.getByLabel('Artiste du catalogue',{exact:true}).fill('Ninho');await page.getByRole('button',{name:'DISCOGRAPHIE DE L’ARTISTE',exact:true}).click();await page.getByRole('button',{name:'VOIR LES MORCEAUX : Album de test',exact:true}).click();
 await page.getByRole('button',{name:'UTILISER L’EXTRAIT DANS LA VIDÉO',exact:true}).click();await page.locator('.top-entry audio').waitFor();await expect(page.getByLabel('Titre 1',{exact:true})).toHaveValue('Titre de test');await expect(page.getByLabel('Artiste 1',{exact:true})).toHaveValue('Ninho');
 const library=await (await fetch(base+'/api/audio-library')).json();assert.ok(library.audios.some(a=>a.trackId===701&&a.source==='apple-preview'));
 const image=Buffer.from(await page.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=500;c.getContext('2d').fillRect(0,0,500,500);return Array.from(Uint8Array.from(atob(c.toDataURL().split(',')[1]),c=>c.charCodeAt(0)));}));
 for(const label of ['Photo de fond','Pochette 1'])await page.getByLabel(label,{exact:true}).setInputFiles({name:'cover.png',mimeType:'image/png',buffer:image});
 await page.getByRole('button',{name:'GÉNÉRER LA VIDÉO'}).click();await page.getByRole('link',{name:'TÉLÉCHARGER MP4'}).waitFor({timeout:240000});const url=await page.getByRole('link',{name:'TÉLÉCHARGER MP4'}).getAttribute('href');const response=await page.request.get(base+url);assert.equal(response.status(),200);const file='/tmp/apple-preview-top-test.mp4';await fs.writeFile(file,await response.body());
 const info=JSON.parse(execFileSync(ffprobe.path,['-v','error','-show_streams','-of','json',file],{encoding:'utf8'}));assert.ok(info.streams.some(s=>s.codec_type==='audio'));assert.ok(info.streams.some(s=>s.width===1080&&s.height===1920));
 const samples=execFileSync(ffmpeg,['-v','error','-ss','3','-t','1','-i',file,'-f','s16le','-ac','1','-']);let energy=0;for(let i=0;i+1<samples.length;i+=2)energy+=samples.readInt16LE(i)**2;assert.ok(Math.sqrt(energy/(samples.length/2))>300,'Exported preview must be audible');assert.deepEqual(errors,[]);
 console.log('PASS: mocked Apple discography → album → preview download → real audio normalization/library → LE TOP MP4 with audible test tone.');
}catch(error){console.error(logs);throw error;}finally{await browser?.close();server.kill('SIGTERM');}
