import React from 'react';
import {AbsoluteFill,Img,Audio,Sequence,useCurrentFrame,interpolate} from 'remotion';
import {smoothProgress} from '../motion.mjs';
import {audioVolume,audioLevel} from '../top/model.mjs';
import {discoveryFrames} from './model.mjs';
export function DiscoveryVideo({data}){
 const frame=useCurrentFrame();const duration=discoveryFrames(data);const fade=smoothProgress(frame,0,24);const audioFrames=data.audio?Math.min(duration,Math.max(1,Math.floor((data.audioDuration-data.audioStart)*30))):0;
 return <AbsoluteFill style={{background:'#101015',color:'#f6f1ff',fontFamily:'Arial, sans-serif',overflow:'hidden'}}>
 {data.cover&&<Img src={data.cover} style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',filter:'blur(14px)',transform:`scale(${interpolate(frame,[0,duration],[1.07,1.14])})`}}/>}
 <AbsoluteFill style={{background:'linear-gradient(180deg,#080810b8,#080810ce 55%,#080810f0)'}}/>
 <div style={{position:'absolute',top:210,left:140,right:140,textAlign:'center',fontSize:data.heading.length>100?42:data.heading.length>55?58:80,fontWeight:700,lineHeight:1.12,overflowWrap:'anywhere',opacity:fade,transform:`translateY(${12*(1-fade)}px)`}}>{data.heading||'LA DÉCOUVERTE'}</div>
 {data.cover?<Img src={data.cover} style={{position:'absolute',left:230,top:510,width:620,height:620,objectFit:'cover',borderRadius:10,boxShadow:'0 30px 80px #0009',opacity:fade,transform:`scale(${.96+.04*fade})`}}/>:<div style={{position:'absolute',left:230,top:510,width:620,height:620,background:'#26202f',borderRadius:10}}/>}
 <div style={{position:'absolute',top:1190,left:140,right:140,textAlign:'center',opacity:smoothProgress(frame,10,24),overflowWrap:'anywhere'}}><div style={{fontSize:data.title.length>110?30:data.title.length>30?46:64,fontWeight:700,lineHeight:1.14}}>{data.title||'Titre du morceau'}</div><div style={{fontSize:data.artist.length>45?28:38,color:'#cbb9df',marginTop:24}}>{data.artist||'Artiste'}</div></div>
 {data.musicAnimation!==false&&<div style={{position:'absolute',top:1500,left:390,width:300,display:'flex',alignItems:'center',justifyContent:'center',gap:24,opacity:fade}}><div style={{width:98,height:98,flexShrink:0,borderRadius:'50%',background:'repeating-radial-gradient(circle,#19171f 0px,#19171f 4px,#39313f 5px,#19171f 6px)',boxShadow:'0 8px 26px #0008',display:'flex',alignItems:'center',justifyContent:'center',transform:`rotate(${frame*2}deg)`}}><div style={{width:34,height:34,borderRadius:'50%',background:'#c8afe8',display:'flex',alignItems:'center',justifyContent:'center',color:'#25202b',fontSize:22}}>♪</div></div><div style={{height:56,display:'flex',gap:6,alignItems:'center'}}>{Array.from({length:7},(_,i)=><div key={i} style={{width:5,height:12+Math.abs(Math.sin(frame*.12+i*.8))*36,background:'#c8afe8',borderRadius:4}}/>)}</div></div>}
 {data.audio&&<Sequence durationInFrames={audioFrames}><Audio src={data.audio} startFrom={Math.round(data.audioStart*30)} volume={f=>audioLevel({},data)*audioVolume(f,audioFrames)}/></Sequence>}
 </AbsoluteFill>;
}
