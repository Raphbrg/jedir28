import {downloadPreviewAudio} from './public-preview.mjs';
// Download only the public preview returned by Apple's track lookup.
export async function downloadApplePreview(id,country='FR',fetcher=fetch){
 if(!/^\d+$/.test(String(id))||!['FR','US','GB'].includes(country))throw Error('Morceau ou région invalide.');
 const lookup=new URL('https://itunes.apple.com/lookup');lookup.search=new URLSearchParams({id:String(id),country}).toString();
 const signal=AbortSignal.timeout(30000);
 const response=await fetcher(lookup,{signal});if(!response.ok)throw Error('Catalogue Apple indisponible.');
 const data=await response.json();const track=data.results?.find(t=>t.kind==='song'&&String(t.trackId)===String(id));
 if(!track?.previewUrl)throw Error('Aucun extrait disponible pour ce morceau dans cette région.');
 const buffer=await downloadPreviewAudio(track.previewUrl,host=>host==='audio-ssl.itunes.apple.com'||host.endsWith('.mzstatic.com'),fetcher,signal);
 return {buffer,name:`${track.artistName} - ${track.trackName} (extrait Apple)`,trackId:track.trackId};
}
