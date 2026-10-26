import React from 'react';
import {Stars} from './Stars.jsx';
import {smoothProgress as fade,phaseOpacity,coverPose} from './motion.mjs';
import {AbsoluteFill,Img,useCurrentFrame,interpolate} from 'remotion';
import {categories,category,timing} from './model.mjs';
const WIDTH=780;
const centered={position:'absolute',left:0,width:WIDTH,textAlign:'center'};
export function AlbumVideo({data}){
 const f=useCurrentFrame();const t=timing(data.tracks,data.durationSeconds,data.endScreenSeconds);
 const cover=coverPose(f,t,WIDTH);const {recap,mainSize,size}=cover;
 const tracksOpacity=phaseOpacity(f,t.introEnd,t.tracksEnd);const resultOpacity=phaseOpacity(f,t.tracksEnd,t.resultEnd);const topOpacity=phaseOpacity(f,t.resultEnd,t.topEnd);
 const zoom=interpolate(f,[0,t.duration],[1.07,1.14]);
 return <AbsoluteFill style={{background:'#101015',color:'#f6f4fa',fontFamily:'Arial, sans-serif',overflow:'hidden'}}>
 {data.cover&&<Img src={data.cover} style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',filter:'blur(16px)',transform:`scale(${zoom})`}}/>}
 <AbsoluteFill style={{background:'linear-gradient(180deg,#08080eb0,#08080ee0 70%,#08080ef5)'}}/>
 <div data-testid="album-content" style={{position:'absolute',left:150,top:160,width:WIDTH,height:1380}}>
 {data.cover&&<Img src={data.cover} data-testid="foreground-cover" style={{position:'absolute',left:cover.left,top:cover.top,width:size,height:size,objectFit:'cover',boxShadow:'0 25px 70px #0008',borderRadius:8,opacity:fade(f,5,24),transform:`scale(${.94+.06*fade(f,5,30)})`}}/>}
 {recap<1&&<div style={{...centered,top:mainSize+44,opacity:fade(f,5,24)*(1-recap)}}>
 <div style={{fontSize:data.artist.length>35?36:52,fontWeight:700,lineHeight:1.16,opacity:fade(f,24),overflowWrap:'anywhere'}}>{data.artist||'ARTISTE'}</div>
 <div style={{fontSize:data.album.length>70?28:38,fontWeight:700,lineHeight:1.18,color:'#d2cbd8',marginTop:14,opacity:fade(f,38),overflowWrap:'anywhere'}}>{data.album||'Nom de l’album'}</div></div>}
 {tracksOpacity>0&&<>
 {t.pages.map((visible,page)=>{const start=t.pageStarts[page];const end=t.pageStarts[page+1]??t.tracksEnd;const opacity=phaseOpacity(f,start,end,24);if(opacity<=0)return null;return <div key={page} style={{position:'absolute',top:620,left:0,width:560,opacity,transform:`translateY(${(1-fade(f,start-12,24))*10}px)`}}>
 <div style={{fontSize:24,fontWeight:700,letterSpacing:4,color:'#b7acc7',marginBottom:25}}>TRACKLIST · {page+1}/{t.pages.length}</div>
 {visible.map((track,i)=>{const a=fade(f,start+i*t.step,Math.min(16,t.step*.8));return <div key={track.id} style={{minHeight:track.rowHeight,display:'flex',alignItems:'center',gap:20,opacity:a,transform:`translateX(${(1-a)*14}px)`}}><Dot score={track.score} size={48}/><span style={{fontSize:track.title.length>90?26:track.title.length>60?30:34,fontWeight:700,lineHeight:'34px',flex:1,overflowWrap:'anywhere'}}>{track.title}</span></div>;})}</div>;})}
 <div style={{position:'absolute',left:610,top:680,width:170,opacity:tracksOpacity}}>{categories.map(c=><div key={c.label} style={{fontSize:23,fontWeight:700,color:c.color,marginBottom:32}}>{c.label}</div>)}</div></>}
 {resultOpacity>0&&<div style={{...centered,top:800,opacity:resultOpacity}}><div style={{fontSize:30,fontWeight:700,letterSpacing:5,color:'#bfb0ce'}}>NOTE GLOBALE</div><div style={{marginTop:36,color:category(data.score).color,fontSize:160,fontWeight:700,lineHeight:1.1}}>{String(data.score).replace('.',',')}<span style={{fontSize:48}}>/10</span></div><div style={{marginTop:32}}><Stars score={data.score} size={64}/></div></div>}
 {topOpacity>0&&<div style={{...centered,top:620,opacity:topOpacity}}><div style={{fontSize:32,fontWeight:700,letterSpacing:7,color:'#c9b7dc'}}>TOP 3</div>{data.top.map((id,i)=>{const track=data.tracks.find(x=>x.id===id);const a=fade(f,t.resultEnd+20+i*30,22);return <div key={i} style={{margin:'34px 0',opacity:a,transform:`scale(${i===0?.95+.05*a:.98+.02*a})`,color:i===0?'#e1d0ff':'#e6e1ec',fontSize:track?.title.length>60?[40,34,30][i]:[64,50,42][i],lineHeight:1.15,fontWeight:700,overflowWrap:'anywhere'}}><div style={{fontSize:24,color:'#b4a2c8',marginBottom:12}}>0{i+1}</div>{track?.title||'—'}</div>;})}</div>}
 {recap>0&&<Summary data={data} opacity={recap}/>}
 </div></AbsoluteFill>;
}
function Dot({score,size}){
 const label=String(score??'').trim()===''?'—':String(score).replace('.',',');
 return <span aria-label={`Note ${label} sur 10`} style={{boxSizing:'border-box',border:'2px solid #ffffff30',display:'inline-flex',alignItems:'center',justifyContent:'center',width:size,height:size,borderRadius:'50%',background:category(score).color,color:'#fff',fontSize:size*(label.length>3?.29:label.length>2?.34:.43),fontWeight:800,lineHeight:1,fontVariantNumeric:'tabular-nums',textShadow:'0 1px 3px #0009',flexShrink:0}}>{label}</span>;
}
function RatingLegend(){
 return <div aria-label="Légende des notes" style={{display:'flex',justifyContent:'center',flexWrap:'wrap',gap:'12px 20px',flexShrink:0}}>{categories.map(c=><div key={c.label} style={{display:'flex',alignItems:'center',gap:8,fontSize:19,fontWeight:700,color:'#eee7f5'}}><span style={{width:14,height:14,borderRadius:'50%',background:c.color,flexShrink:0}}/>{c.label}</div>)}</div>;
}
function Summary({data,opacity}){
 const columns=data.tracks.length>32?3:data.tracks.length>10?2:1;const rows=Math.max(1,Math.ceil(data.tracks.length/columns));const fontSize=Math.max(14,Math.min(columns===1?38:26,620/rows*.65));
 return <div style={{position:'absolute',inset:0,opacity,display:'flex',flexDirection:'column',gap:24}}>
 <div style={{textAlign:'center',flexShrink:0}}><div style={{height:220}}/><div style={{fontSize:data.artist.length>50?30:44,fontWeight:700,overflowWrap:'anywhere'}}>{data.artist}</div><div style={{fontSize:data.album.length>80?24:30,fontWeight:700,color:'#c9bdd4',marginTop:10,overflowWrap:'anywhere'}}>{data.album}</div><div style={{marginTop:14,fontSize:72,fontWeight:700,lineHeight:1.1,color:category(data.score).color}}>{String(data.score).replace('.',',')}<span style={{fontSize:30}}>/10</span></div><div style={{marginTop:12}}><Stars score={data.score} size={38}/></div></div>
 <div style={{fontSize:24,fontWeight:700,letterSpacing:4,color:'#c3afd5',textAlign:'center'}}>LE BILAN · {data.tracks.length} MORCEAUX</div>
 <div style={{flex:1,minHeight:0,display:'grid',gridTemplateColumns:`repeat(${columns},minmax(0,1fr))`,gridTemplateRows:`repeat(${rows},minmax(0,1fr))`,gridAutoFlow:'column',columnGap:36}}>{data.tracks.map(track=><div key={track.id} style={{display:'flex',alignItems:'center',gap:16,borderBottom:'1px solid #ffffff15',minHeight:0}}><Dot score={track.score} size={columns===1?44:38}/><span style={{flex:1,minWidth:0,fontSize:track.title.length>45?fontSize*.78:fontSize,fontWeight:700,lineHeight:1.15,overflowWrap:'anywhere'}}>{track.title}</span></div>)}</div>
 <RatingLegend/>
 <div style={{borderTop:'1px solid #ffffff25',paddingTop:20,textAlign:'center',flexShrink:0}}><div style={{fontSize:24,fontWeight:700,letterSpacing:5,color:'#c3afd5',marginBottom:16}}>TOP 3</div>{data.top.map((id,i)=><div key={i} style={{fontSize:[40,34,30][i],fontWeight:700,color:i===0?'#dec8ff':'#e6deed',marginTop:12,lineHeight:1.15,overflowWrap:'anywhere'}}>{i+1}. {data.tracks.find(track=>track.id===id)?.title||'—'}</div>)}</div>
 </div>;
}
