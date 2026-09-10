/* Models contain mathematical state only; both views read these coordinates. */
(function(root){
  const pi=Math.PI;
  function sinPi(t){
    if(Number.isInteger(t))return 0;
    if(Number.isInteger(t-.5))return Math.round(t-.5)%2===0?1:-1;
    return Math.sin(pi*t);
  }
  function cosPi(t){return sinPi(t+.5);}
  function chord(angle){
    const t=angle===90?0:1/Math.tan(angle*pi/180),D=3-t*t;
    if(!(angle>30&&angle<150&&D>0))return {angle,t,D,finite:false,valid:false};
    const s=Math.sqrt(3*(1+t*t)),ya=(2*t+s)/D,yb=(2*t-s)/D;
    const A=[2+t*ya,ya],B=[2+t*yb,yb],K=[6/D,2*t/D];
    const R=Math.sqrt(3)*(1+t*t)/D,d=K[0]-1.5;
    const half=Math.sqrt(Math.max(0,R*R-d*d));
    const M=[1.5,K[1]+half],N=[1.5,K[1]-half];
    return {angle,t,D,A,B,K,R,d,M,N,H:[1.5,K[1]],finite:true,valid:angle!==90,
      angleA:Math.atan2(Math.abs(ya),A[0]-1.5),angleB:Math.atan2(Math.abs(yb),B[0]-1.5),
      theta:2*Math.acos(d/R)};
  }
  function tDefinition({mode='sine',omegaPi=1,phiPi=0,tPi=.25}={}){
    const cosine=mode==='cosine';
    const u=cosine?cosPi(tPi):sinPi(tPi);
    const x=cosine?tPi*pi:(tPi-phiPi)/omegaPi;
    const g=z=>cosine?Math.cos(z):sinPi(omegaPi*z+phiPi);
    const v=g(u),product=u===0||v===0?0:u*v;
    const evenPhase=Number.isInteger(phiPi/2);
    return {mode,omegaPi,phiPi,tPi,x,u,v,product,isT:product>=0,
      universal:!cosine&&evenPhase&&omegaPi<=1,g};
  }
  function witness(omegaPi,phiPi){
    const phase=((phiPi%2)+2)%2;
    if(phase===0){
      if(omegaPi<=1)return null;
      return (1+Math.min(2,omegaPi))/(2*omegaPi);
    }
    if(phase===1)return Math.min(.5,.5/omegaPi);
    const distance=Math.min(phase%1,1-phase%1);
    return (phase<1?-1:1)*Math.min(.4,distance/(2*omegaPi));
  }
  const api={sinPi,cosPi,chord,tDefinition,witness};
  root.XuhuiMath=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
