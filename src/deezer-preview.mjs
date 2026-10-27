import {downloadPreviewAudio} from './public-preview.mjs';
import {catalogueKey} from './ninho-catalogue.mjs';
export async function searchDeezerPreview(title,fetcher=fetch){
 const url=new URL('https://api.deezer.com/search');url.search=new URLSearchParams({q:`artist:"Ninho" track:"${title.replaceAll('"','')}"`,limit:'100'}).toString();
 const response=await fetcher(url,{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('Catalogue Deezer indisponible.');
 const data=await response.json();if(data.error)throw Error('Catalogue Deezer indisponible.');
 const track=data.data?.find(t=>catalogueKey(t.title)===catalogueKey(title)&&catalogueKey(t.artist?.name)==='ninho'&&t.preview?.startsWith('https://'));
 return track?{deezerId:track.id,title:track.title,artist:track.artist.name,album:track.album?.title||'',preview:track.preview,link:track.link?.startsWith('https://')?track.link:null,provider:'deezer'}:null;
}
export async function downloadDeezerPreview(id,fetcher=fetch){
 if(!/^\d+$/.test(String(id)))throw Error('Morceau Deezer invalide.');
 const response=await fetcher(new URL('https://api.deezer.com/track/'+id),{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('Catalogue Deezer indisponible.');
 const track=await response.json();if(track.error||String(track.id)!==String(id)||!track.preview)throw Error('Aucun extrait Deezer disponible.');
 const buffer=await downloadPreviewAudio(track.preview,host=>host.endsWith('.dzcdn.net'),fetcher);
 return {buffer,name:`${track.artist?.name} - ${track.title} (extrait Deezer)`,trackId:track.id};
}
