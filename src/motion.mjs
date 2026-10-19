export function smoothProgress(frame,start,length=24){const p=Math.max(0,Math.min(1,(frame-start)/length));return p*p*(3-2*p);}
export function phaseOpacity(frame,start,end,length=24){return smoothProgress(frame,start-length/2,length)*(1-smoothProgress(frame,end-length/2,length));}
export function coverPose(frame,t,width=780){
 const top=smoothProgress(frame,t.resultEnd-18,36);
 const recap=smoothProgress(frame,t.topEnd-15,30);
 const mainSize=380-60*top;
 const size=mainSize+(200-mainSize)*recap;
 return {size,left:(width-size)/2,top:20*(1-recap),recap,mainSize};
}
