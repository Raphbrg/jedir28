// Download only the public preview returned by Apple's track lookup.
export async function downloadApplePreview(id,country='FR',fetcher=fetch){
 if(!/^\d+$/.test(String(id))||!['FR','US','GB'].includes(country))throw Error('Morceau ou région invalide.');
 const lookup=new URL('https://itunes.apple.com/lookup');lookup.search=new URLSearchParams({id:String(id),country}).toString();
 const signal=AbortSignal.timeout(30000);
 const response=await fetcher(lookup,{signal});if(!response.ok)throw Error('Catalogue Apple indisponible.');
 const data=await response.json();const track=data.results?.find(t=>t.kind==='song'&&String(t.trackId)===String(id));
 if(!track?.previewUrl)throw Error('Aucun extrait disponible pour ce morceau dans cette région.');
 let url=new URL(track.previewUrl);
 for(let redirects=0;redirects<=3;redirects++){
  if(url.protocol!=='https:'||url.username||url.password||(url.port&&url.port!=='443')||!(url.hostname==='audio-ssl.itunes.apple.com'||url.hostname.endsWith('.mzstatic.com')))throw Error('Adresse d’extrait Apple non reconnue.');
  const audio=await fetcher(url,{signal,redirect:'manual'});
  if([301,302,303,307,308].includes(audio.status)){const location=audio.headers.get('location');await audio.body?.cancel();if(!location)throw Error('Redirection Apple invalide.');url=new URL(location,url);continue;}
  if(!audio.ok||!audio.body)throw Error('Extrait Apple indisponible.');
  const max=20*1024*1024;if(Number(audio.headers.get('content-length'))>max){await audio.body.cancel();throw Error('Extrait trop volumineux.');}
  const reader=audio.body.getReader();const chunks=[];let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw Error('Extrait trop volumineux.');}chunks.push(Buffer.from(value));}}finally{reader.releaseLock();}
  if(!size)throw Error('Extrait vide.');
  return {buffer:Buffer.concat(chunks),name:`${track.artistName} - ${track.trackName} (extrait Apple)`,trackId:track.trackId};
 }
 throw Error('Trop de redirections pour cet extrait.');
}
