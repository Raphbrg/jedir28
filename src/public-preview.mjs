export async function downloadPreviewAudio(address,allowedHost,fetcher=fetch,signal=AbortSignal.timeout(30000)){
 let url=new URL(address);
 for(let redirects=0;redirects<=3;redirects++){
  if(url.protocol!=='https:'||url.username||url.password||(url.port&&url.port!=='443')||!allowedHost(url.hostname))throw Error('Adresse d’extrait non reconnue.');
  const audio=await fetcher(url,{signal,redirect:'manual'});
  if([301,302,303,307,308].includes(audio.status)){const location=audio.headers.get('location');await audio.body?.cancel();if(!location)throw Error('Redirection audio invalide.');url=new URL(location,url);continue;}
  if(!audio.ok||!audio.body)throw Error('Extrait audio indisponible.');
  const max=20*1024*1024;if(Number(audio.headers.get('content-length'))>max){await audio.body.cancel();throw Error('Extrait trop volumineux.');}
  const reader=audio.body.getReader();const chunks=[];let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw Error('Extrait trop volumineux.');}chunks.push(Buffer.from(value));}}finally{reader.releaseLock();}
  if(!size)throw Error('Extrait vide.');
  return Buffer.concat(chunks);
 }
 throw Error('Trop de redirections pour cet extrait.');
}
