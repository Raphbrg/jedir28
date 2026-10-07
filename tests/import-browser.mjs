import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3000');
 const text=page.getByLabel('COLLEZ VOTRE TRACKLIST ET VOS NOTES');
 const button=page.getByRole('button',{name:'IMPORTER LA TRACKLIST',exact:true});
 await text.fill('MENACE — 10\nDÉCONNECTÉ — 9\nRYUK — 9,5/10');await button.click();
 await page.getByRole('status').waitFor();
 assert.equal(await page.locator('.track-row').count(),3);
 assert.equal(await page.getByLabel('Titre 2',{exact:true}).inputValue(),'DÉCONNECTÉ');
 assert.equal(await page.getByLabel('Note 3',{exact:true}).inputValue(),'9.5');
 assert.equal(await page.locator('.track-row > i').first().evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(198, 167, 255)');
 const top=page.locator('.top-fields select').first();const id=await top.locator('option').nth(1).getAttribute('value');await top.selectOption(id);
 await text.fill('INVALIDE');await button.click();await page.getByRole('alert').waitFor();assert.equal(await page.locator('.track-row').count(),3);
 await text.fill('CAPUCHE — 8');await button.click();assert.equal(await page.locator('.track-row').count(),4);assert.equal(await top.inputValue(),id);
 await page.getByLabel('MODE D’IMPORT').selectOption('replace');await text.fill('MENACE — 9\nNOUVEAU — 7');await button.click();
 assert.equal(await page.locator('.track-row').count(),2);assert.equal(await top.inputValue(),id);assert.equal(await page.getByLabel('Note 1',{exact:true}).inputValue(),'9');
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
 assert.deepEqual(errors,[]);
 console.log('Bulk import UI: append, replacement, decimals, colors, Top 3 preservation, invalid input and mobile: PASS');
} finally {await browser.close();}
