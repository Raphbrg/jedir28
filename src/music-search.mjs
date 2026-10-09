export async function searchMusic(query,fetcher=fetch){
 const term=String(query||'').trim().slice(0,160);
 if(term.length<2)throw Error('Saisissez au moins deux caractères.');
 const url=new URL('https://itunes.apple.com/search');
 url.search=new URLSearchParams({term,entity:'song',media:'music',country:'FR',limit:'12'}).toString();
 const response=await fetcher(url,{signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Error('Le catalogue est temporairement indisponible.');
 const body=await response.json();
 return (body.results||[]).filter(track=>track.kind==='song').map(track=>({id:track.trackId,title:track.trackName,artist:track.artistName,album:track.collectionName,preview:typeof track.previewUrl==='string'&&track.previewUrl.startsWith('https://')?track.previewUrl:null,link:typeof track.trackViewUrl==='string'&&track.trackViewUrl.startsWith('https://')?track.trackViewUrl:null}));
}
