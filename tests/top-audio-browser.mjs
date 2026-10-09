import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import ffmpeg from 'ffmpeg-static';
const baseURL=process.env.TEST_BASE_URL||'http://localhost:3000';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const page=await browser.newPage();await page.goto(baseURL+'/le-top.html');
 execFileSync(ffmpeg,['-y','-v','error','-f','lavfi','-i','sine=frequency=440:duration=3','/tmp/top-library-tone.wav']);const buffer=await fs.readFile('/tmp/top-library-tone.wav');const unique=Date.now();
 await page.getByText('BIBLIOTHÈQUE AUDIO',{exact:true}).click();await page.getByLabel('Importer plusieurs audios',{exact:true}).setInputFiles([{name:`ÉTÉ-${unique}.wav`,mimeType:'audio/wav',buffer},{name:`Autre-${unique}.wav`,mimeType:'audio/wav',buffer}]);await expect(page.getByRole('status')).toHaveText('2 audio(s) ajouté(s) à la bibliothèque.');
 await page.getByRole('button',{name:'RECHERCHER UN AUDIO',exact:true}).click();await page.getByLabel('Recherche audio',{exact:true}).fill('ete-'+unique);await expect(page.getByRole('button',{name:'UTILISER CET AUDIO',exact:true})).toHaveCount(1);
 await page.getByRole('button',{name:'CATALOGUE',exact:true}).click();await page.route('**/api/music-search?*',route=>route.fulfill({json:{tracks:[{id:1,title:'MENACE',artist:'Laylow',album:'Album',preview:'https://example.com/preview.m4a',link:'https://music.apple.com/fr/album/1'}]}}));await page.getByLabel('Recherche audio',{exact:true}).fill('MENACE Laylow');await page.getByRole('button',{name:'CHERCHER',exact:true}).click();await expect(page.getByText('MENACE',{exact:true})).toBeVisible();await expect(page.getByLabel('Extrait de MENACE',{exact:true})).toBeVisible();
 await page.unroute('**/api/music-search?*');await page.route('**/api/music-search?*',route=>route.fulfill({status:503,json:{error:'Catalogue indisponible'}}));await page.getByRole('button',{name:'CHERCHER',exact:true}).click();await expect(page.getByRole('alert')).toHaveText('Catalogue indisponible');
 await page.getByRole('button',{name:'MES AUDIOS',exact:true}).click();await page.getByLabel('Recherche audio',{exact:true}).fill('ete-'+unique);await page.getByRole('button',{name:'UTILISER CET AUDIO',exact:true}).click();
 const volume=page.getByLabel('Volume audio 1',{exact:true});await volume.press('Home');await volume.press('ArrowRight');assert.equal(await volume.inputValue(),'1');const master=page.getByLabel('Volume général',{exact:true});await master.press('Home');await master.press('ArrowRight');assert.equal(await master.inputValue(),'1');assert.ok(Math.abs(await page.locator('.top-entry audio').evaluate(audio=>audio.volume)-.0001)<.000001);
 const bad=await page.request.get(baseURL+'/api/music-search?q=a');assert.equal(bad.status(),400);
 console.log('Batch library upload, accented filename search, library selection, track/master volume, mocked catalogue and error handling: PASS');
}finally{await browser.close();}
