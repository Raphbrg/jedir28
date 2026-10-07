import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1100}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:3000');await page.getByRole('button',{name:'GÉNÉRER LA VIDÉO'}).click();await page.getByRole('alert').waitFor();
await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=800;c.height=800;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,800,800);g.addColorStop(0,'#e16a36');g.addColorStop(.5,'#261624');g.addColorStop(1,'#7865ad');x.fillStyle=g;x.fillRect(0,0,800,800);x.fillStyle='#ead6b7';x.font='bold 75px sans-serif';x.fillText('AFTER HOURS',80,380);const b=await new Promise(r=>c.toBlob(r,'image/png'));window.testCover=Array.from(new Uint8Array(await b.arrayBuffer()));});
const cover=Buffer.from(await page.evaluate(()=>window.testCover));await page.locator('input[type=file]').setInputFiles({name:'cover.png',mimeType:'image/png',buffer:cover});await page.locator('.cover-upload img').waitFor();
await page.getByPlaceholder('Ex. Laylow').fill('ARTISTE TEST');await page.getByPlaceholder('Ex. L’étrange histoire de Mr. Anderson').fill('Album de démonstration');await page.getByLabel('Note globale',{exact:true}).fill('9.7');
await page.getByLabel('Titre 1',{exact:true}).fill('MENACE');await page.getByLabel('Note 1',{exact:true}).fill('10');
for(const [i,title,score] of [[2,'DÉCONNECTÉ','9'],[3,'RYUK','9.5']]){await page.getByRole('button',{name:'AJOUTER UN TITRE'}).click();await page.getByLabel(`Titre ${i}`,{exact:true}).fill(title);await page.getByLabel(`Note ${i}`,{exact:true}).fill(score);}
const selects=page.locator('select');for(let i=0;i<3;i++){const value=await selects.nth(i).locator('option').nth(i+1).getAttribute('value');await selects.nth(i).selectOption(value);}
await page.getByRole('button',{name:'Descendre 1',exact:true}).click();assert.equal(await page.getByLabel('Titre 1',{exact:true}).inputValue(),'DÉCONNECTÉ');await page.getByRole('button',{name:'Monter 2',exact:true}).click();
await page.getByRole('button',{name:/APERÇU/}).click();await page.waitForTimeout(4300);await page.screenshot({path:'/tmp/album-studio-desktop.png',fullPage:true});
await page.getByRole('button',{name:'GÉNÉRER LA VIDÉO'}).click();await page.getByRole('link',{name:'TÉLÉCHARGER MP4'}).waitFor({timeout:240000});const url=await page.getByRole('link',{name:'TÉLÉCHARGER MP4'}).getAttribute('href');const response=await page.request.get('http://localhost:3000'+url);assert.equal(response.status(),200);await fs.writeFile('/tmp/album-studio-test.mp4',await response.body());
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/album-studio-mobile.png',fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
assert.deepEqual(errors,[]);console.log('UI, upload, validation, reorder, preview, mobile and real MP4 download: PASS');await browser.close();
