import React from 'react';
import {Stars} from './Stars.jsx';
import {smoothProgress,phaseOpacity,coverPose} from './motion.mjs';
import {AbsoluteFill,Img,useCurrentFrame,interpolate} from 'remotion';
import {categories,category,timing} from './model.mjs';
const fade=smoothProgress;
const format=n=>String(n).replace('.',',');
function ScoreDot({score,size=48}){const color=category(score).color;return <span aria-label={`Note ${format(score)} sur 10`} title={`${format(score)}/10`} style={{width:size,height:size,minWidth:size,borderRadius:'50%',background:color,display:'inline-block',flexShrink:0,border:'5px solid #ffffff75',boxShadow:`0 0 0 5px #0005,0 0 28px ${color}88`}}/>;}
const topSizes=[{font:74,dot:74,pad:34},{font:61,dot:62,pad:29},{font:51,dot:54,pad:25}];
export function AlbumVideo({data}){const f=useCurrentFrame();const t=timing(data.tracks,data.durationSeconds,data.endScreenSeconds);const cover=coverPose(f,t);const tracksOpacity=phaseOpacity(f,t.introEnd,t.tracksEnd);const resultOpacity=phaseOpacity(f,t.tracksEnd,t.resultEnd);const topOpacity=phaseOpacity(f,t.resultEnd,t.topEnd);const scale=interpolate(f,[0,t.duration],[1.07,1.14]);return <AbsoluteFill style={{background:'#101015',color:'#f6f4fa',fontFamily:'Arial, sans-serif',overflow:'hidden'}}>
{data.cover&&<Img src={data.cover} style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',filter:'blur(16px)',transform:`scale(${scale})`}}/>}
<AbsoluteFill style={{background:'linear-gradient(180deg,rgba(8,8,14,.65),rgba(8,8,14,.88) 70%,rgba(8,8,14,.96))'}}/>
{/* Center the review horizontally, with inset margins for social controls and captions. */}
<AbsoluteFill style={{left:90,right:90,top:130,bottom:170,transform:'scale(.91)',transformOrigin:'top center'}}>
<div style={{position:'absolute',top:105,left:80,fontSize:30,fontWeight:800,letterSpacing:6,color:'#b4afb9'}}>ALBUM / REVIEW</div>
{data.cover&&<Img src={data.cover} data-testid="foreground-cover" style={{position:'absolute',left:cover.left,top:cover.top,width:cover.size,height:cover.size,objectFit:'cover',boxShadow:'0 25px 70px #0008',borderRadius:8,opacity:fade(f,5,24),transform:`scale(${.94+.06*fade(f,5,30)})`}}/>}
{cover.recap<1&&<div style={{position:'absolute',top:190,width:'100%',textAlign:'center',opacity:fade(f,5,24)*(1-cover.recap)}}><div style={{height:390-80*fade(f,t.resultEnd-18,36)}}/>
<div style={{fontSize:data.artist.length>60?43:57,fontWeight:700,marginTop:32,opacity:fade(f,24),padding:'0 70px',overflowWrap:'anywhere'}}>{data.artist||'ARTISTE'}</div>
<div style={{fontSize:data.album.length>80?33:41,color:'#d2cbd8',marginTop:14,padding:'0 70px',opacity:fade(f,38),overflowWrap:'anywhere'}}>{data.album||'Nom de l’album'}</div>
</div>}
{tracksOpacity>0&&<div>{t.pages.map((visible,page)=>{const start=t.pageStarts[page];const end=t.pageStarts[page+1]??t.tracksEnd;const opacity=phaseOpacity(f,start,end,24);if(opacity<=0)return null;return <div key={page} style={{position:'absolute',top:800,left:45,width:700,opacity,transform:`translateY(${(1-fade(f,start-12,24))*10}px)`}}><div style={{fontSize:30,fontWeight:800,letterSpacing:5,color:'#ddd4ea',marginBottom:35}}>TRACKLIST <span style={{letterSpacing:0}}> {page+1}/{t.pages.length}</span></div>{visible.map((track,i)=>{const a=fade(f,start+i*t.step,Math.min(16,t.step*.8));return <div key={track.id} style={{minHeight:track.rowHeight,display:'flex',alignItems:'center',gap:18,opacity:a,transform:`translateX(${(1-a)*18}px)`}}><ScoreDot score={track.score} size={42}/><span style={{fontSize:36,fontWeight:800,lineHeight:'43px',flex:1,overflowWrap:'anywhere'}}>{track.title}</span></div>})}</div>})}<div style={{position:'absolute',right:25,top:900,width:215,opacity:tracksOpacity}}>{categories.map(c=><div key={c.label} style={{fontSize:28,fontWeight:800,color:c.color,marginBottom:35}}>{c.label}</div>)}</div></div>}
{resultOpacity>0&&<div style={{position:'absolute',top:900,left:0,right:0,textAlign:'center',opacity:resultOpacity,transform:`translateY(${(1-fade(f,t.tracksEnd-12,24))*15}px)`}}><div style={{fontSize:34,fontWeight:800,letterSpacing:6,color:'#ddd4ea'}}>NOTE GLOBALE</div><div style={{display:'flex',justifyContent:'center',marginTop:58}}><ScoreDot score={data.score} size={190}/></div><Stars score={data.score} size={56}/></div>}
{topOpacity>0&&<div style={{position:'absolute',top:755,left:0,right:0,textAlign:'center',opacity:topOpacity}}><div style={{fontSize:37,fontWeight:900,letterSpacing:8,color:'#e1d3f1'}}>TOP 3</div>{data.top.map((id,i)=>{const track=data.tracks.find(x=>x.id===id);const a=fade(f,t.resultEnd+20+i*30,22);const style=topSizes[i];return <div key={i} style={{margin:`${style.pad}px 46px`,opacity:a,transform:`scale(${.94+.06*a})`,display:'flex',alignItems:'center',justifyContent:'center',gap:26,color:i===0?'#f4e5ff':'#f1eaf8',fontSize:track?.title.length>70?style.font*.72:style.font,fontWeight:900,lineHeight:1.15,overflowWrap:'anywhere',textShadow:'0 4px 12px #000b'}}><span style={{fontSize:style.font*.75,color:i===0?'#ffd967':'#dec8ff',flexShrink:0}}>0{i+1}</span><span style={{minWidth:0,maxWidth:610}}>{track?.title||'—'}</span>{track&&<ScoreDot score={track.score} size={style.dot}/>}</div>})}</div>}
{cover.recap>0&&<Summary data={data} opacity={cover.recap}/>}
</AbsoluteFill>
</AbsoluteFill>}

function Summary({data,opacity}){
 const columns=data.tracks.length>32?3:data.tracks.length>10?2:1;
 const rows=Math.ceil(data.tracks.length/columns);
 const fontSize=Math.max(18,Math.min(37,630/Math.max(1,rows)));
 return <AbsoluteFill style={{padding:'185px 85px 240px',opacity,display:'flex',flexDirection:'column',gap:30}}>
 <div style={{display:'flex',alignItems:'center',gap:35}}>
 {data.cover&&<div style={{width:220,height:220,flexShrink:0}}/>}
 <div style={{flex:1,minWidth:0,overflowWrap:'anywhere'}}><div style={{fontSize:43,fontWeight:900}}>{data.artist}</div><div style={{fontSize:32,fontWeight:800,color:'#e5dbe9',marginTop:10}}>{data.album}</div><div style={{marginTop:18}}><ScoreDot score={data.score} size={100}/></div><div style={{display:'flex',justifyContent:'flex-start',marginTop:6}}><Stars score={data.score} size={32}/></div></div></div>
 <div style={{fontSize:27,fontWeight:900,letterSpacing:5,color:'#d8c7e9'}}>LE BILAN · {data.tracks.length} MORCEAUX</div>
 <div style={{flex:1,minHeight:0,display:'grid',gridTemplateColumns:`repeat(${columns},minmax(0,1fr))`,gridTemplateRows:`repeat(${Math.max(1,rows)},minmax(0,1fr))`,gridAutoFlow:'column',columnGap:30}}>
 {data.tracks.map(track=><div key={track.id} style={{display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid #ffffff15',minHeight:0}}><ScoreDot score={track.score} size={Math.max(25,Math.min(39,fontSize))}/><span style={{flex:1,minWidth:0,fontSize:track.title.length>45?fontSize*.8:fontSize,fontWeight:800,lineHeight:1.17,overflowWrap:'anywhere'}}>{track.title}</span></div>)}
 </div><div style={{borderTop:'1px solid #ffffff25',paddingTop:22,textAlign:'center'}}><div style={{fontSize:28,fontWeight:900,letterSpacing:5,color:'#d8c7e9',marginBottom:20}}>TOP 3</div>{data.top.map((id,i)=>{const track=data.tracks.find(item=>item.id===id);return <div key={i} style={{fontSize:i===0?42:i===1?35:30,fontWeight:900,color:i===0?'#f3deff':'#f1e8f7',marginTop:14,display:'flex',alignItems:'center',justifyContent:'center',gap:15,overflowWrap:'anywhere'}}><span>{i+1}.</span><span>{track?.title||'—'}</span>{track&&<ScoreDot score={track.score} size={i===0?48:i===1?41:35}/>}</div>})}</div>
 </AbsoluteFill>;
}
