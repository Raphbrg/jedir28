import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
import ffprobe from 'ffprobe-static';
import {normalizeAudio} from '../src/audio-server.mjs';
test('Bundled engines normalize WAV, M4A, FLAC and MP3 with embedded artwork; invalid files give useful errors',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'audio-import-'));
 const run=args=>execFileSync(ffmpeg,['-nostdin','-y','-v','error',...args]);
 try{
  for(const extension of ['wav','m4a','flac','mp3']){
   const input=path.join(dir,'input.'+extension);const output=path.join(dir,'output-'+extension+'.mp3');
   run(['-f','lavfi','-i','sine=frequency=440:duration=2',input]);
   if(extension==='mp3'){
    const cover=path.join(dir,'cover.jpg');run(['-f','lavfi','-i','color=red:s=100x100','-frames:v','1','-threads','1',cover]);
    const decorated=path.join(dir,'artwork.mp3');run(['-i',input,'-i',cover,'-map','0:a','-map','1:v','-c','copy','-id3v2_version','3','-disposition:v','attached_pic',decorated]);await fs.rename(decorated,input);
    const original=JSON.parse(execFileSync(ffprobe.path,['-v','error','-show_streams','-of','json',input],{encoding:'utf8'}));assert.ok(original.streams.some(s=>s.codec_type==='video'));
   }
   const duration=await normalizeAudio(input,output);assert.ok(duration>=2&&duration<2.2);
   const metadata=JSON.parse(execFileSync(ffprobe.path,['-v','error','-show_streams','-of','json',output],{encoding:'utf8'}));assert.equal(metadata.streams.length,1);assert.equal(metadata.streams[0].codec_type,'audio');assert.equal(metadata.streams[0].codec_name,'mp3');
  }
  const invalid=path.join(dir,'not-audio.mp3');await fs.writeFile(invalid,'not an audio');await assert.rejects(normalizeAudio(invalid,path.join(dir,'bad.mp3')),/Aucune piste audio lisible/);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
