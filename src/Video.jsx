import React from 'react';
import {Stars} from './Stars.jsx';
import {smoothProgress,phaseOpacity,coverPose} from './motion.mjs';
import {AbsoluteFill,Img,useCurrentFrame,interpolate} from 'remotion';
import {categories,category,timing} from './model.mjs';
const fade=smoothProgress;
const format=n=>String(n).replace('.',',');
export function AlbumVideo({data}){const f=useCurrentFrame();const t=timing(data.tracks,data.durationSeconds,data.endScreenSeconds);const cover=coverPose(f,t);const tracksOpacity=phaseOpacity(f,t.introEnd,t.tracksEnd);const resultOpacity=phaseOpacity(f,t.tracksEnd,t.resultEnd);const topOpacity=phaseOpacity(f,t.resultEnd,t.topEnd);const scale=interpolate(f,[0,t.duration],[1.07,1.14]);return <AbsoluteFill style={{background:'#101015',color:'#f6f4fa',fontFamily:'Arial, sans-serif',overflow:'hidden'}}>
{data.cover&&<Img src={data.cover} style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',filter:'blur(16px)',transform:`scale(${scale})`}}/>}
<AbsoluteFill style={{background:'linear-gradient(180deg,rgba(8,8,14,.65),rgba(8,8,14,.88) 70%,rgba(8,8,14,.96))'}}/>
{/* Center the review horizontally, with inset margins for social controls and captions. */}
<AbsoluteFill style={{left:108,top:100,transform:'scale(.8)',transformOrigin:'top left'}}>
<div style={{position:'absolute',top:105,left:80,fontSize:24,letterSpacing:8,color:'#b4afb9'}}>ALBUM / REVIEW</div>
{data.cover&&<Img src={data.cover} data-testid="foreground-cover" style={{position:'absolute',left:cover.left,top:cover.top,width:cover.size,height:cover.size,objectFit:'cover',boxShadow:'0 25px 70px #0008',borderRadius:8,opacity:fade(f,5,24),transform:`scale(${.94+.06*fade(f,5,30)})`}}/>}
{cover.recap<1&&<div style={{position:'absolute',top:190,width:'100%',textAlign:'center',opacity:fade(f,5,24)*(1-cover.recap)}}><div style={{height:390-80*fade(f,t.resultEnd-18,36)}}/>
<div style={{fontSize:data.artist.length>60?36:46,fontWeight:700,marginTop:32,opacity:fade(f,24),padding:'0 70px',overflowWrap:'anywhere'}}>{data.artist||'ARTISTE'}</div>
<div style={{fontSize:data.album.length>80?28:32,color:'#d2cbd8',marginTop:14,padding:'0 70px',opacity:fade(f,38),overflowWrap:'anywhere'}}>{data.album||'Nom de l’album'}</div>
</div>}
{tracksOpacity>0&&<div>{t.pages.map((visible,page)=>{const start=t.pageStarts[page];const end=t.pageStarts[page+1]??t.tracksEnd;const opacity=phaseOpacity(f,start,end,24);if(opacity<=0)return null;return <div key={page} style={{position:'absolute',top:850,left:80,width:670,opacity,transform:`translateY(${(1-fade(f,start-12,24))*10}px)`}}><div style={{fontSize:24,letterSpacing:6,color:'#a9a0b6',marginBottom:35}}>TRACKLIST <span style={{letterSpacing:0}}> {page+1}/{t.pages.length}</span></div>{visible.map((track,i)=>{const a=fade(f,start+i*t.step,Math.min(16,t.step*.8));return <div key={track.id} style={{minHeight:track.rowHeight,display:'flex',alignItems:'center',gap:18,opacity:a,transform:`translateX(${(1-a)*18}px)`}}><span style={{width:17,height:17,borderRadius:'50%',background:category(track.score).color,flexShrink:0}}/><span style={{fontSize:30,lineHeight:'34px',flex:1,overflowWrap:'anywhere'}}>{track.title}</span><span style={{fontSize:28,color:category(track.score).color,marginLeft:10}}>{format(track.score)}</span></div>})}</div>})}<div style={{position:'absolute',right:55,top:935,width:220,opacity:tracksOpacity}}>{categories.map(c=><div key={c.label} style={{fontSize:24,color:c.color,marginBottom:35}}>{c.label}</div>)}</div></div>}
{resultOpacity>0&&<div style={{position:'absolute',top:1000,width:'100%',textAlign:'center',opacity:resultOpacity,transform:`translateY(${(1-fade(f,t.tracksEnd-12,24))*15}px)`}}><div style={{fontSize:25,letterSpacing:7,color:'#aaa0b6'}}>NOTE GLOBALE</div><div style={{fontSize:185,fontWeight:700,color:category(data.score).color,marginTop:35}}>{format(data.score)}<span style={{fontSize:55}}>/10</span></div><Stars score={data.score} size={56}/></div>}
{topOpacity>0&&<div style={{position:'absolute',top:820,width:'100%',textAlign:'center',opacity:topOpacity}}><div style={{fontSize:26,letterSpacing:8,color:'#b8adca'}}>TOP 3</div>{data.top.map((id,i)=>{const track=data.tracks.find(x=>x.id===id);const a=fade(f,t.resultEnd+20+i*30,22);return <div key={i} style={{margin:'40px 65px',opacity:a,transform:`scale(${i===0?.95+.05*a:.98+.02*a})`,color:i===0?'#e1d0ff':'#e6e1ec',fontSize:track?.title.length>70?(i===0?32:28):(i===0?53:39),fontWeight:i===0?700:400,overflowWrap:'anywhere'}}><div style={{fontSize:20,color:'#9c8cae',marginBottom:12}}>0{i+1}</div>{track?.title||'—'}</div>})}</div>}
{cover.recap>0&&<Summary data={data} opacity={cover.recap}/>}
</AbsoluteFill>
</AbsoluteFill>}

function Summary({data,opacity}){
 const columns=data.tracks.length>32?3:data.tracks.length>10?2:1;
 const rows=Math.ceil(data.tracks.length/columns);
 const fontSize=Math.max(12,Math.min(30,560/Math.max(1,rows)));
 return <AbsoluteFill style={{padding:'170px 80px 150px',opacity,display:'flex',flexDirection:'column',gap:30}}>
 <div style={{display:'flex',alignItems:'center',gap:35}}>
 {data.cover&&<div style={{width:220,height:220,flexShrink:0}}/>}
 <div style={{flex:1,minWidth:0,overflowWrap:'anywhere'}}><div style={{fontSize:36,fontWeight:700}}>{data.artist}</div><div style={{fontSize:26,color:'#c9bdd4',marginTop:10}}>{data.album}</div><div style={{fontSize:83,fontWeight:700,color:category(data.score).color,marginTop:12}}>{format(data.score)}<span style={{fontSize:32}}>/10</span></div><div style={{display:'flex',justifyContent:'flex-start',marginTop:6}}><Stars score={data.score} size={32}/></div></div></div>
 <div style={{fontSize:21,letterSpacing:6,color:'#b7a6c9'}}>LE BILAN · {data.tracks.length} MORCEAUX</div>
 <div style={{flex:1,minHeight:0,display:'grid',gridTemplateColumns:`repeat(${columns},minmax(0,1fr))`,gridTemplateRows:`repeat(${Math.max(1,rows)},minmax(0,1fr))`,gridAutoFlow:'column',columnGap:30}}>
 {data.tracks.map(track=><div key={track.id} style={{display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid #ffffff15',minHeight:0}}><span style={{width:12,height:12,borderRadius:'50%',background:category(track.score).color,flexShrink:0}}/><span style={{flex:1,minWidth:0,fontSize:track.title.length>45?fontSize*.78:fontSize,lineHeight:1.15,overflowWrap:'anywhere'}}>{track.title}</span><span style={{fontSize,color:category(track.score).color}}>{format(track.score)}</span></div>)}
 </div><div style={{borderTop:'1px solid #ffffff25',paddingTop:22,textAlign:'center'}}><div style={{fontSize:21,letterSpacing:6,color:'#b7a6c9',marginBottom:20}}>TOP 3</div>{data.top.map((id,i)=><div key={i} style={{fontSize:i===0?32:26,color:i===0?'#dec8ff':'#e6deed',marginTop:14,overflowWrap:'anywhere'}}>{i+1}. {data.tracks.find(track=>track.id===id)?.title||'—'}</div>)}</div>
 </AbsoluteFill>;
}
