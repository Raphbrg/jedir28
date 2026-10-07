export const categories=[{score:10,label:'Exceptionnel',color:'#c6a7ff'},{score:8.5,label:'Très bon',color:'#52d9c4'},{score:7,label:'Bon',color:'#8ed36a'},{score:5,label:'Moyen',color:'#f3d163'},{score:4,label:'Médiocre',color:'#f7a052'},{score:2,label:'Mauvais',color:'#ef657d'},{score:1,label:'Inaudible',color:'#8994a7'}];
export const ratingValue=score=>Number(String(score).replace(',','.'));
export const category=score=>String(score??'').trim()===''?{score:null,label:'À noter',color:'#555463'}:categories.reduce((best,item)=>Math.abs(item.score-ratingValue(score))<Math.abs(best.score-ratingValue(score))?item:best,categories[0]);
export const FPS=30;
export function paginate(tracks){const pages=[];let current=[];let height=0;for(const track of tracks){const lines=Math.max(1,Math.ceil(track.title.length/31));const rowHeight=Math.max(96,lines*39+18);if(current.length&&(current.length===8||height+rowHeight>820)){pages.push(current);current=[];height=0;}current.push({...track,rowHeight});height+=rowHeight;}if(current.length)pages.push(current);return pages;}
export function timing(input, requestedSeconds){
  const count=Array.isArray(input)?input.length:input;
  const pages=Array.isArray(input)?paginate(input):Array.from({length:Math.ceil(count/8)},(_,i)=>Array(Math.min(8,count-i*8)).fill(null));
  let step=count>16?22:count>8?26:32;
  let introEnd=90, resultLength=85, topLength=145, pageHold=45;
  const summaryLength=60;
  const automaticDuration=380+count*step+pages.length*45;
  const compactMinimum=265+count*6+pages.length*15;
  const minSeconds=Math.ceil(compactMinimum/FPS);
  const maxSeconds=Math.max(180,Math.ceil(automaticDuration/FPS*3));
  if(count && requestedSeconds!=null && requestedSeconds!=='' && Number.isFinite(Number(requestedSeconds))){
    const target=Math.round(Math.max(minSeconds,Math.min(maxSeconds,Number(requestedSeconds)))*FPS);
    const normalMinimum=380+count*18+pages.length*45;
    const ratio=Math.min(1,Math.max(0,(target-compactMinimum)/(normalMinimum-compactMinimum)));
    introEnd=60+30*ratio;resultLength=45+40*ratio;topLength=100+45*ratio;pageHold=15+30*ratio;
    step=(target-introEnd-resultLength-topLength-summaryLength-pages.length*pageHold)/count;
  }
  const pageStarts=[];let tracksEnd=introEnd;
  for(const page of pages){pageStarts.push(tracksEnd);tracksEnd+=page.length*step+pageHold;}
  const resultEnd=tracksEnd+resultLength,topEnd=resultEnd+topLength;
  return {step,pages,pageStarts,introEnd,tracksEnd,resultEnd,topEnd,duration:Math.round(topEnd+summaryLength),automaticDuration,minSeconds,maxSeconds};
}
export function validate(a){if(!a.artist?.trim()||!a.album?.trim()||!a.cover)throw Error('Renseignez artiste, album et pochette.');if(!Array.isArray(a.tracks)||!a.tracks.length)throw Error('Ajoutez au moins un morceau.');for(const t of a.tracks){if(!t.title?.trim()||String(t.score).trim()===''||!Number.isFinite(ratingValue(t.score))||ratingValue(t.score)<0||ratingValue(t.score)>10)throw Error('Chaque morceau doit avoir un titre et une note entre 0 et 10.');}if(String(a.score).trim()===''||!Number.isFinite(ratingValue(a.score))||ratingValue(a.score)<0||ratingValue(a.score)>10)throw Error('La note globale doit être comprise entre 0 et 10.');if(a.top.length!==3||new Set(a.top).size!==3||a.top.some(id=>!a.tracks.some(t=>t.id===id)))throw Error('Sélectionnez trois morceaux distincts pour le Top 3.');}
