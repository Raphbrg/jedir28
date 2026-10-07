import test from 'node:test';
import assert from 'node:assert/strict';
import {parseTracklist,mergeTracklist} from '../src/import-tracklist.mjs';
test('Bulk import accepts French decimals, separators, numbering and /10 without changing spelling',()=>{
 const result=parseTracklist("1. MENACE — 10\r\n\r\n2) DÉCONNECTÉ - 9\nRYUK\t9,5/10\nAC/DC : 7.2 / 10\nJUSQU’AU DERNIER GRAMME;8\n24/7 9\n● PARTIE 2 – 0");
 assert.deepEqual(result,[{title:'MENACE',score:'10'},{title:'DÉCONNECTÉ',score:'9'},{title:'RYUK',score:'9.5'},{title:'AC/DC',score:'7.2'},{title:'JUSQU’AU DERNIER GRAMME',score:'8'},{title:'24/7',score:'9'},{title:'PARTIE 2',score:'0'}]);
});
test('Invalid lines reject the complete import and show original line numbers',()=>{assert.throws(()=>parseTracklist('MENACE — 10\n\nRYUK\nTITRE — 11\nAUTRE — -1'),/Ligne 3[\s\S]*Ligne 4[\s\S]*Ligne 5/);assert.throws(()=>parseTracklist('  \n'));assert.throws(()=>parseTracklist('TITRE — 9/20'));});
test('Append replaces the empty placeholder and preserves existing selection',()=>{let n=0;const id=()=>String(++n);const empty={tracks:[{id:'blank',title:'',score:8}],top:['','','']};const a=mergeTracklist(empty,parseTracklist('A — 10'), 'append',id);assert.equal(a.tracks.length,1);const b=mergeTracklist({...a,top:['1','','']},parseTracklist('B — 9'), 'append',id);assert.equal(b.tracks.length,2);assert.equal(b.top[0],'1');});
test('Replace preserves IDs for exact titles and clears removed Top 3 selections',()=>{const data={tracks:[{id:'a',title:'ÉTÉ',score:8},{id:'b',title:'AUTRE',score:7},{id:'c',title:'ÉTÉ',score:6}],top:['a','b','c']};const result=mergeTracklist(data,parseTracklist('ÉTÉ — 10\nÉTÉ — 9'), 'replace',()=>assert.fail('Existing IDs should be reused'));assert.deepEqual(result.tracks.map(t=>t.id),['a','c']);assert.deepEqual(result.top,['a','','c']);});
