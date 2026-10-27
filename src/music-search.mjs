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
  const body=await response.json();return (body.results||[]).filter(track=>track.kind==='song').map(track=>({...track,catalogueCountry:country}));
 })));
 if(!results.some(result=>result.status==='fulfilled'))throw Error('Le catalogue est temporairement indisponible.');
 const seen=new Set();const tracks=[];
 for(const result of results){if(result.status!=='fulfilled')continue;for(const track of result.value){const identity=track.trackName?[track.trackName,track.artistName,track.collectionName].map(normalize).join('|'):String(track.trackId);if(seen.has(identity))continue;seen.add(identity);tracks.push({id:track.trackId,title:track.trackName,artist:track.artistName,album:track.collectionName,country:track.catalogueCountry,genre:track.primaryGenreName,preview:typeof track.previewUrl==='string'&&track.previewUrl.startsWith('https://')?track.previewUrl:null,link:typeof track.trackViewUrl==='string'&&track.trackViewUrl.startsWith('https://')?track.trackViewUrl:null});}}
 const compact=value=>normalize(value).replace(/[^a-z0-9]/g,'');const titleQuery=compact(normalize(term).replace(normalize(artistName),'').trim());
 const score=track=>(artistName&&normalize(track.artist)===normalize(artistName)?100:0)+(titleQuery&&compact(track.title)===titleQuery?100:titleQuery&&compact(track.title).includes(titleQuery)?40:0)+(/rap|hip.hop/i.test(track.genre||'')?5:0);tracks.sort((a,b)=>score(b)-score(a));
 if(fetcher===fetch){if(cache.size>=100)cache.delete(cache.keys().next().value);cache.set(key,{tracks,expires:Date.now()+5*60*1000});}
 return tracks;
}

async function appleRequest(params,fetcher){
 const url=new URL(params.id?'https://itunes.apple.com/lookup':'https://itunes.apple.com/search');
 url.search=new URLSearchParams({...params,limit:'200'}).toString();
 const response=await fetcher(url,{signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Error('Catalogue Apple indisponible. Réessayez dans un instant.');
 const body=await response.json();return body.results||[];
}
export async function artistAlbums(name,region='FR',fetcher=fetch){
 const term=String(name||'').trim().slice(0,100);
 if(term.length<2)throw Error('Saisissez le nom de l’artiste.');
 if(!['all','FR','US','GB'].includes(region))throw Error('Région de recherche invalide.');
 const countries=region==='all'?['FR','US','GB']:[region];
 const albums=new Map();let found=false;let incomplete=false;let capped=false;
 for(const country of countries){
  try{
   const artists=await appleRequest({term,entity:'musicArtist',country},fetcher);
   const matches=artists.filter(a=>a.wrapperType==='artist'&&normalize(a.artistName)===normalize(term));
   // Verified French rapper Ninho; avoid the many artists sharing his name.
   const preferred=normalize(term)==='ninho'?matches.find(a=>a.artistId===320366644):null;
   if(matches.length>1&&!preferred)throw Error('Plusieurs artistes portent ce nom dans le catalogue.');
   if(!matches.length)continue;
   const selected=preferred||matches[0];
   found=true;
   const results=await appleRequest({id:String(selected.artistId),entity:'album',country},fetcher);
   const collections=results.filter(a=>a.wrapperType==='collection'&&a.collectionId);
   if(collections.length>=200)capped=true;
   for(const album of collections){if(!albums.has(album.collectionId))albums.set(album.collectionId,{id:album.collectionId,title:album.collectionName,artist:album.artistName,releaseDate:album.releaseDate,trackCount:album.trackCount,country});}
  }catch(error){if(countries.length===1)throw error;incomplete=true;}
 }
 if(!found)throw Error('Artiste introuvable ou catalogue indisponible. Essayez une autre région.');
 return {albums:[...albums.values()].sort((a,b)=>String(b.releaseDate).localeCompare(String(a.releaseDate))),warning:incomplete?'Certaines régions sont indisponibles. La liste peut être incomplète.':capped?'Apple limite la liste à 200 albums par région. Essayez aussi une autre région.':null};
}
export async function albumTracks(id,country='FR',fetcher=fetch){
 if(!/^\d+$/.test(String(id)))throw Error('Album invalide.');
 if(!['FR','US','GB'].includes(country))throw Error('Région de recherche invalide.');
 const results=await appleRequest({id:String(id),entity:'song',country},fetcher);
 return results.filter(t=>t.kind==='song'&&String(t.collectionId)===String(id)).map(t=>({id:t.trackId,title:t.trackName,artist:t.artistName,album:t.collectionName,country,preview:typeof t.previewUrl==='string'&&t.previewUrl.startsWith('https://')?t.previewUrl:null,link:typeof t.trackViewUrl==='string'&&t.trackViewUrl.startsWith('https://')?t.trackViewUrl:null}));
}
