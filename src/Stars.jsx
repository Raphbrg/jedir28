import React from 'react';
import {starsForScore} from './model.mjs';
const shape='M12 2.5 14.9 8.4 21.4 9.3 16.7 13.9 17.8 20.4 12 17.3 6.2 20.4 7.3 13.9 2.6 9.3 9.1 8.4Z';
export function Stars({score,size=30}){
 const value=starsForScore(score);
 if(value==null)return null;
 const color='#f5c84c';
 return <div aria-label={`${String(value).replace('.',',')} étoiles sur 5`} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:size*.12,color}}>
 {Array.from({length:5},(_,i)=>{const fill=Math.max(0,Math.min(1,value-i));return <span aria-hidden="true" key={i} style={{position:'relative',display:'inline-block',width:size,height:size,flexShrink:0}}><svg width={size} height={size} viewBox="0 0 24 24" style={{display:'block'}}><path d={shape} fill="#65606e"/></svg><span style={{position:'absolute',top:0,left:0,width:`${fill*100}%`,height:'100%',overflow:'hidden'}}><svg width={size} height={size} viewBox="0 0 24 24" style={{display:'block',maxWidth:'none'}}><path d={shape} fill={color}/></svg></span></span>})}
 </div>;
}
