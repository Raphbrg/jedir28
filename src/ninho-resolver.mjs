import {ninhoCatalogue,catalogueKey} from './ninho-catalogue.mjs';
import {searchMusic} from './music-search.mjs';
import {searchDeezerPreview} from './deezer-preview.mjs';
export async function resolveNinhoTrack(id,region='FR',fetcher=fetch){
 const track=ninhoCatalogue.find(t=>t.id===id);if(!track)throw Error('Titre Ninho inconnu.');
 if(!['FR','US','GB','all'].includes(region))throw Error('Région invalide.');
 const aliases={'Somnanbule':'Somnambule'};const title=aliases[track.title]||track.title;
 let match;
 try{
  const tracks=await searchMusic(title,fetcher,region,'Ninho');
  match=tracks.find(t=>catalogueKey(t.title)===catalogueKey(title)&&(t.artistId===320366644||catalogueKey(t.artist)==='ninho')&&t.preview);
  if(match)return {...match,id:track.id,appleId:match.id,provider:'apple',source:track.source,lookupDone:true};
 }catch{}
 try{match=await searchDeezerPreview(title,fetcher);}catch{}
 if(match)return {...match,id:track.id,source:track.source,lookupDone:true};
 return {...track,lookupDone:true,notice:'Aucun extrait correspondant disponible chez Apple ou Deezer. Tu peux utiliser ce titre et importer ton fichier audio.'};
}
