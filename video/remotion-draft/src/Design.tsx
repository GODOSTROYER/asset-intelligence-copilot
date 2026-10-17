import React from 'react';
import {AbsoluteFill, CanvasImage, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const ink = '#102940';
export const paper = '#f5f6f0';
export const blue = '#82b7ff';
export const mint = '#a8ddcc';
export const SharedFrame: React.FC<React.PropsWithChildren<{dark?: boolean; section: string}>> = ({children, dark=false, section}) => {
  const frame=useCurrentFrame(); const {fps,durationInFrames}=useVideoConfig();
  return <AbsoluteFill style={{background:dark?ink:paper,color:dark?paper:ink,fontFamily:'Arial, Helvetica, sans-serif',overflow:'hidden'}}>
    <div style={{position:'absolute',left:88,right:88,top:39,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:25,letterSpacing:1.2,fontWeight:600}}>
      <span>ASSET INTELLIGENCE COPILOT</span><span style={{fontWeight:400,opacity:.7}}>{section}</span>
    </div>
    <div style={{position:'absolute',left:88,right:88,top:88,height:1,background:dark?'#345169':'#cbd4d6'}}/>
    <div style={{opacity:interpolate(frame,[0,.45*fps],[0,1],{extrapolateRight:'clamp'}),translate:`0px ${interpolate(frame,[0,.7*fps],[18,0],{extrapolateRight:'clamp'})}px`}}>{children}</div>
    <div style={{position:'absolute',bottom:37,left:88,right:88,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:24,color:dark?'#d1deea':'#486176'}}>
      <span>Draft · AI narration · replace with entrant voice</span><span>Sample-data screen evidence · 17 Oct 2026</span>
    </div>
    <div style={{position:'absolute',left:0,bottom:0,height:5,width:`${interpolate(frame,[0,durationInFrames],[0,100])}%`,background:dark?blue:'#2b71ca'}}/>
  </AbsoluteFill>;
};
export const Heading: React.FC<React.PropsWithChildren<{sub?:string}>>=({children,sub})=><div style={{position:'absolute',left:88,top:124,right:88}}><div style={{fontSize:64,fontWeight:600,letterSpacing:-2,lineHeight:1.07}}>{children}</div>{sub?<div style={{fontSize:29,marginTop:15,color:'#557085'}}>{sub}</div>:null}</div>;
export const Crop: React.FC<{src:string;x:number;y:number;w:number;h:number;left:number;top:number;width:number;radius?:number}> = ({src,x,y,w,h,left,top,width,radius=16})=>{
  const scale=width/w;
  return <div style={{position:'absolute',left,top,width,height:h*scale,overflow:'hidden',borderRadius:radius,boxShadow:'0 18px 45px #10294018',border:'1px solid #d0dce3',background:'white'}}>
    <CanvasImage src={staticFile(`evidence/${src}`)} style={{position:'absolute',width:1505*scale,height:1045*scale,left:-x*scale,top:-y*scale,maxWidth:'none'}}/>
  </div>;
};
export const SmallLabel: React.FC<React.PropsWithChildren<{top:number;left?:number;color?:string}>>=({children,top,left=88,color='#557085'})=><div style={{position:'absolute',left,top,fontSize:24,color,letterSpacing:1.1,textTransform:'uppercase',fontWeight:600}}>{children}</div>;
