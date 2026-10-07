import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3000/');await page.getByRole('link',{name:'LE TOP ↗'}).click();await expect(page).toHaveTitle('LE TOP — Video Studio');
 await page.getByRole('button',{name:'GÉNÉRER LA VIDÉO'}).click();await page.getByRole('alert').waitFor();
 await page.getByLabel('NOM DU TOP').fill('Mon top Laylow');
 const makeImage=async color=>Buffer.from(await page.evaluate(async color=>{const c=document.createElement('canvas');c.width=800;c.height=800;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,800,800);x.fillStyle='#efdbbd';x.font='bold 65px Arial';x.fillText('LE TOP',200,410);const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));return Array.from(new Uint8Array(await blob.arrayBuffer()));},color));
 const background=await makeImage('#53354f');await page.getByLabel('Photo de fond',{exact:true}).setInputFiles({name:'artiste.png',mimeType:'image/png',buffer:background});await page.locator('.top-background img').waitFor();
 await page.locator('details summary').click();await page.getByLabel('TITRE — ARTISTE',{exact:true}).fill('MENACE — Laylow\nDÉCONNECTÉ — Laylow\nRYUK — Laylow');await page.getByRole('button',{name:'IMPORTER LES TITRES'}).click();assert.equal(await page.locator('.top-entry').count(),3);
 for(let i=1;i<=3;i++){const cover=await makeImage(['#b96339','#393b83','#6e477f'][i-1]);await page.getByLabel(`Pochette ${i}`,{exact:true}).setInputFiles({name:`cover-${i}.png`,mimeType:'image/png',buffer:cover});await page.locator('.top-entry').nth(i-1).locator('img').waitFor();}
 await page.getByRole('button',{name:'Descendre 1',exact:true}).click();assert.equal(await page.getByLabel('Titre 1',{exact:true}).inputValue(),'DÉCONNECTÉ');await page.getByRole('button',{name:'Monter 2',exact:true}).click();
 assert.equal(await page.getByLabel('ORDRE DE RÉVÉLATION').inputValue(),'countdown');
 await page.getByRole('button',{name:'VOIR LE BILAN',exact:true}).click();await expect(page.locator('.player-shell').getByText('LE CLASSEMENT FINAL')).toBeVisible();await expect(page.locator('.player-shell').getByText('MENACE',{exact:true})).toBeVisible();
 await page.screenshot({path:'/tmp/le-top-desktop.png',fullPage:true});
 await page.getByLabel('DURÉE DE LA VIDÉO').selectOption('manual');await page.getByLabel('Durée totale en secondes',{exact:true}).press('Home');
 await page.getByRole('button',{name:'GÉNÉRER LA VIDÉO'}).click();await page.getByRole('link',{name:'TÉLÉCHARGER MP4'}).waitFor({timeout:240000});const url=await page.getByRole('link',{name:'TÉLÉCHARGER MP4'}).getAttribute('href');const response=await page.request.get('http://localhost:3000'+url);assert.equal(response.status(),200);assert.match(response.headers()['content-disposition'],/le-top.mp4/);await fs.writeFile('/tmp/le-top-test.mp4',await response.body());
 const metadata=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height,nb_frames,r_frame_rate','-of','json','/tmp/le-top-test.mp4'],{encoding:'utf8'})).streams[0];assert.equal(metadata.width,1080);assert.equal(metadata.height,1920);assert.equal(metadata.r_frame_rate,'30/1');assert.equal(metadata.nb_frames,'390');
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);await page.screenshot({path:'/tmp/le-top-mobile.png',fullPage:true});assert.deepEqual(errors,[]);
 const invalid=await page.request.post('http://localhost:3000/api/top/render',{data:{name:'Test',entries:[],revealOrder:'countdown'}});assert.equal(invalid.status(),400);
 await page.getByRole('link',{name:'Album Studio',exact:true}).click();await expect(page.getByPlaceholder('Ex. Laylow')).toBeVisible();
 console.log('LE TOP: imports, ranking, countdown, recap, manual duration, mobile, real 13-second MP4 and Album Studio navigation: PASS');
}finally{await browser.close();}
