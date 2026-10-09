import {isImage} from '../top/model.mjs';
export function discoveryFrames(data){const seconds=Number(data.durationSeconds??12);return Math.round((Number.isFinite(seconds)?Math.max(3,Math.min(60,seconds)):12)*30);}
export function validateDiscovery(data){
 if(!data||!isImage(data.cover))throw Error('Importez la pochette.');
 for(const [key,label] of [['heading','le titre au-dessus de la pochette'],['title','le titre du morceau'],['artist','le nom de l’artiste']])if(typeof data[key]!=='string'||!data[key].trim())throw Error(`Renseignez ${label}.`);
 if(!Number.isFinite(data.durationSeconds)||data.durationSeconds<3||data.durationSeconds>60)throw Error('Choisissez une durée entre 3 et 60 secondes.');
 if(data.audio){if(!/^\/api\/audio\/[a-f0-9-]{36}$/.test(data.audio))throw Error('Audio invalide.');if(!Number.isFinite(data.audioDuration)||!Number.isFinite(data.audioStart)||data.audioStart<0||data.audioStart>=data.audioDuration)throw Error('Début de l’extrait audio invalide.');}
 if(data.audioVolume!=null&&(!Number.isFinite(data.audioVolume)||data.audioVolume<0||data.audioVolume>100))throw Error('Le volume doit être compris entre 0 et 100 %.');
}
