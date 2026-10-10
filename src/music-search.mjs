const cache=new Map();
const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export async function searchMusic(query,fetcher=fetch,region='FR',artist=''){
 const term=String(query||'').trim().slice(0,160);
 if(term.length<2)throw Error('Saisissez au moins deux caractères.');
 if(!['all','FR','US','GB'].includes(region))throw Error('Région de recherche invalide.');
 const artistName=String(artist||'').trim().slice(0,100);const key=region+':'+normalize(artistName)+':'+normalize(term);const cached=cache.get(key);if(fetcher===fetch&&cached&&cached.expires>Date.now())return cached.tracks;
 const countries=region==='all'?['FR','US','GB']:[region];
 const queries=artistName&&normalize(artistName)!==normalize(term)?[term,artistName]:[term];
 const results=await Promise.allSettled(countries.flatMap(country=>queries.map(async query=>{
  const url=new URL('https://itunes.apple.com/search');url.search=new URLSearchParams({term:query,entity:'song',media:'music',country,limit:'200'}).toString();
  const response=await fetcher(url,{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('Catalogue indisponible');
  const body=await response.json();return (body.results||[]).filter(track=>track.kind==='song');
 })));
 if(!results.some(result=>result.status==='fulfilled'))throw Error('Le catalogue est temporairement indisponible.');
 const seen=new Set();const tracks=[];
 for(const result of results){if(result.status!=='fulfilled')continue;for(const track of result.value){const identity=track.trackName?[track.trackName,track.artistName,track.collectionName].map(normalize).join('|'):String(track.trackId);if(seen.has(identity))continue;seen.add(identity);tracks.push({id:track.trackId,title:track.trackName,artist:track.artistName,album:track.collectionName,genre:track.primaryGenreName,preview:typeof track.previewUrl==='string'&&track.previewUrl.startsWith('https://')?track.previewUrl:null,link:typeof track.trackViewUrl==='string'&&track.trackViewUrl.startsWith('https://')?track.trackViewUrl:null});}}
 const compact=value=>normalize(value).replace(/[^a-z0-9]/g,'');const titleQuery=compact(normalize(term).replace(normalize(artistName),'').trim());
 const score=track=>(artistName&&normalize(track.artist)===normalize(artistName)?100:0)+(titleQuery&&compact(track.title)===titleQuery?100:titleQuery&&compact(track.title).includes(titleQuery)?40:0)+(/rap|hip.hop/i.test(track.genre||'')?5:0);tracks.sort((a,b)=>score(b)-score(a));
 if(fetcher===fetch){if(cache.size>=100)cache.delete(cache.keys().next().value);cache.set(key,{tracks,expires:Date.now()+5*60*1000});}
 return tracks;
}
