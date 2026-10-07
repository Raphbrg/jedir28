export function smoothProgress(frame,start,length=24){const p=Math.max(0,Math.min(1,(frame-start)/length));return p*p*(3-2*p);}
export function phaseOpacity(frame,start,end,length=24){return smoothProgress(frame,start-length/2,length)*(1-smoothProgress(frame,end-length/2,length));}
export function coverPose(frame,t){
 const top=smoothProgress(frame,t.resultEnd-18,36);
 const recap=smoothProgress(frame,t.topEnd-15,30);
 const base=390-80*top;
 const centered=(1080-base)/2;
 return {size:base+(220-base)*recap,left:centered+(80-centered)*recap,top:190-20*recap,recap};
}
