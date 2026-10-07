import fs from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import ffmpegPath from 'ffmpeg-static';
import ffprobe from 'ffprobe-static';
const run=promisify(execFile);
export const AUDIO_MAX_BYTES=100*1024*1024;
export async function normalizeAudio(input,output){
 let duration;
 try{
  const {stdout}=await run(process.env.FFPROBE_PATH||ffprobe.path,['-v','error','-show_entries','format=duration:stream=codec_type','-of','json',input],{timeout:30000});
  const probe=JSON.parse(stdout);duration=Number(probe.format?.duration);
  if(!probe.streams?.some(stream=>stream.codec_type==='audio')||!Number.isFinite(duration)||duration<=0)throw Error('NO_AUDIO');
 }catch(error){
  if(error.code==='ENOENT')throw Error('Le moteur audio est absent. Relancez npm ci puis redémarrez l’application.');
  throw Error('Aucune piste audio lisible. Choisissez un fichier MP3, WAV, M4A, AAC, FLAC ou OGG non protégé. Un lien ou un fichier Apple Music protégé ne peut pas être importé.');
 }
 if(duration>7200)throw Error('Le fichier dépasse 2 heures. Importez un extrait plus court.');
 try{
  await run(process.env.FFMPEG_PATH||ffmpegPath,['-nostdin','-y','-v','error','-i',input,'-map','0:a:0','-vn','-map_metadata','-1','-ac','2','-ar','44100','-codec:a','libmp3lame','-b:a','192k',output],{timeout:180000});
 }catch(error){
  await fs.unlink(output).catch(()=>{});
  if(error.code==='ENOENT')throw Error('Le moteur de conversion audio est absent. Relancez npm ci puis redémarrez l’application.');
  throw Error('La conversion audio a échoué. Essayez un fichier non protégé ou un extrait plus court.');
 }
 return duration;
}
