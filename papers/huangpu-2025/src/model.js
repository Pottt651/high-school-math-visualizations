/* One mathematical model per picture. Construction steps change visibility only. */
window.HuangpuMath=(()=>{
  const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),scale=(a,k)=>a.map(v=>v*k),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),norm=a=>Math.hypot(...a),mid=(a,b)=>scale(add(a,b),.5);
  function construction(host,steps,render){let index=null;const list=()=>typeof steps==='function'?steps():steps;return{show:n=>index===null||index>=n,get:()=>index,restart(){if(index!==null)index=0;host.dispatchEvent(new Event('constructionchange'));},api:{getConstructionSteps:list,getConstructionStep:()=>index,setConstructionStep(n){index=n===null?null:Math.max(0,Math.min(list().length-1,Math.trunc(Number(n)||0)));render();}}};}
  function layers(scene,construction){return Object.fromEntries(['points','edges','faces','annotations'].map(k=>[k,(scene[k]||[]).filter(item=>construction.show(item.layer||0))]));}
  const cubePoints={A:[0,0,0],B:[1,0,0],C:[1,1,0],D:[0,1,0],A1:[0,0,1],B1:[1,0,1],C1:[1,1,1],D1:[0,1,1]};
  const cubeEdges=[['A','B'],['B','C'],['C','D'],['D','A'],['A1','B1'],['B1','C1'],['C1','D1'],['D1','A1'],['A','A1'],['B','B1'],['C','C1'],['D','D1']];
  const cubeFaces=[['A','B','C','D'],['A1','D1','C1','B1'],['A','A1','B1','B'],['B','B1','C1','C'],['C','C1','D1','D'],['D','D1','A1','A']];
  function cubeScene(C){return{points:Object.entries(cubePoints).map(([id,at])=>({id,at,label:id.replace('1','₁'),color:C.ink,priority:70})),edges:cubeEdges.map(([a,b])=>({id:a+b,a:cubePoints[a],b:cubePoints[b],color:C.gray,width:1.8,hiddenOpacity:.3})),faces:cubeFaces.map((names,i)=>({id:'cube-face-'+i,vertices:names.map(n=>cubePoints[n]),color:C.ink,opacity:.035})),annotations:[]};}
  const vertices=Array.from({length:8},(_,i)=>[i&1,(i>>1)&1,(i>>2)&1]);
  const cubePairs=[];
  for(let a=0;a<8;a++)for(let b=a+1;b<8;b++)for(let c=a+1;c<8;c++)for(let d=c+1;d<8;d++){
    if(new Set([a,b,c,d]).size!==4)continue;
    const u=sub(vertices[b],vertices[a]),v=sub(vertices[d],vertices[c]),p=dot(u,v),r=dot(u,u),s=dot(v,v),cos=Math.abs(p)/Math.sqrt(r*s);
    cubePairs.push({ids:[a,b,c,d],u,v,p,r,s,cos,angle:Math.acos(Math.min(1,cos))*180/Math.PI});
  }
  function complex(angle,radius,t){const a=angle*Math.PI/180,center=[1,-1],P=[1+Math.SQRT2*radius*Math.cos(a),-1+Math.SQRT2*radius*Math.sin(a)],Q=[t,t+1],signed=(P[0]-P[1]+1)/2,foot=[P[0]-signed,P[1]+signed];return{center,P,Q,foot,distance:norm(sub(P,Q)),toLine:Math.abs(signed)*Math.SQRT2};}
  function recurrence(kind,a1,n){const fn=kind==='nonlinear'?x=>Math.exp(-x):x=>2-(kind==='expand'?1.25:.5)*x;const fixed=kind==='nonlinear'?.5671432904097838:kind==='expand'?8/9:4/3,terms=[a1];for(let i=1;i<n;i++)terms.push(fn(terms.at(-1)));return{fn,fixed,terms,valid:a1!==fixed};}
  function hyperbola(a,fraction){const c=3,b=Math.sqrt(9-a*a),u=a/3+(1-a/3)*fraction,s=Math.sqrt(Math.max(0,1-u*u)),F1=[-3,0],F2=[3,0],r=(9-a*a)/(3*u+a),valid=fraction>0&&fraction<1,T=fraction===0?Infinity:(9-a*a)/(3*u-a),A=Number.isFinite(T)?[-3+T*u,T*s]:null,B=[-3+r*u,r*s];return{a,b,c,u,s,F1,F2,T,r,A,B,valid,AB:valid?T-r:null,AF2:valid?T-2*a:null,difference:2*a-r,targetU:(3-a*a)/(2*a),possible:a>1&&a<3/Math.sqrt(5)};}
  function bisect(fn,lo,hi){let flo=fn(lo);for(let i=0;i<100;i++){const m=(lo+hi)/2,fm=fn(m);if(fm===0)return m;if((flo<0)===(fm<0)){lo=m;flo=fm;}else hi=m;}return(lo+hi)/2;}
  function offset(kind,parameter){
    if(kind==='quadratic')return{fn:x=>x*x-1,roots:[-1,1],x0:0,h:0,level:0,valid:true,sign:0,xmax:1.7,xmin:-1.7,ymin:-1.35,ymax:2,formula:'y=x^2-1',axis:'x'};
    if(kind==='cubic'){const m=parameter,x0=(m+Math.sqrt(m*m+3))/3,roots=[Math.min(1,m),Math.max(1,m)],h=(1+m)/2,fn=x=>(x-m)*(x-1)*(x+1),depth=Math.max(.035,-fn(x0));return{fn,roots,x0,h,level:0,valid:m>0&&m!==1,sign:1,xmin:Math.max(0,roots[0]-.35),xmax:roots[1]+.35,ymin:-depth*1.45,ymax:depth*1.5,formula:'y=(x-m)(x-1)(x+1)',axis:'x',offsetDelta:((m-1)**2)/(2*(2*Math.sqrt(m*m+3)+m+3)),probe:-((m-1)**2)/4};}
    const a=parameter,level=Math.log(a),fn=t=>Math.log(t)-t,valid=a>0&&a<1/Math.E;
    if(!valid)return{fn,roots:a===1/Math.E?[1,1]:[],x0:1,h:1,level,valid:false,sign:0,xmin:.04,xmax:3,ymin:-2.7,ymax:.15,formula:'y=\\ln t-t',axis:'t=ax'};
    const left=bisect(t=>fn(t)-level,Math.min(a*.1,.001),1);let right=2;while(fn(right)>level)right*=2;right=bisect(t=>fn(t)-level,1,right);return{fn,roots:[left,right],x0:1,h:(left+right)/2,level,valid:true,sign:-1,mirror:2-left,xmin:Math.min(.04,left*.65),xmax:right*1.12,ymin:level-.55,ymax:.15,formula:'y=\\ln t-t',axis:'t=ax'};
  }
  return{add,sub,scale,dot,norm,mid,construction,layers,cubePoints,cubeScene,vertices,cubePairs,complex,recurrence,hyperbola,offset};
})();
