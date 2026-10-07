import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {AlbumVideo} from './Video.jsx';
import {timing} from './model.mjs';
import {TopVideo} from './top/TopVideo.jsx';
import {topTiming} from './top/model.mjs';
registerRoot(()=> <>
 <Composition id="AlbumReview" component={AlbumVideo} width={1080} height={1920} fps={30} durationInFrames={600} defaultProps={{data:{artist:'',album:'',score:0,cover:'',tracks:[],top:[]}}} calculateMetadata={({props})=>({durationInFrames:timing(props.data.tracks,props.data.durationSeconds,props.data.endScreenSeconds).duration})}/>
 <Composition id="LeTop" component={TopVideo} width={1080} height={1920} fps={30} durationInFrames={600} defaultProps={{data:{name:'Mon top',background:'',entries:[],revealOrder:'countdown',endScreenSeconds:5}}} calculateMetadata={({props})=>({durationInFrames:topTiming(props.data).duration})}/>
</>);
