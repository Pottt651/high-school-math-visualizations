(function(root){
 const Y={
  cylinder(z){const r=Math.sqrt(1-z*z);return{z,r,h:2*z,area:4*Math.PI*r*z,maximum:2*Math.PI};},
  piecewise(a){return{a,roots:[...(a>=8?[8]:[]),...(a<9?[9]:[])],count:(a>=8?1:0)+(a<9?1:0)};},
  orbit(e){const R=(1+e)/(1-e),nextR=4*R,nextE=(nextR-1)/(nextR+1);return{e,R,nextR,nextE,ratio:nextE/e,a:(R+1)/2,b:Math.sqrt(R),nextA:(nextR+1)/2,nextB:Math.sqrt(nextR),exact:(Math.sqrt(65)-5)/10};},
  joukowski(r,theta,a){const w=[r*Math.cos(theta),r*Math.sin(theta)],z=[(r+1/r)*Math.cos(theta),(r-1/r)*Math.sin(theta)],xs=a<1?[]:[1-Math.sqrt(a*a-1),1+Math.sqrt(a*a-1)].filter(x=>x>=-2-1e-10&&x<=2+1e-10),intersections=[...new Set(xs.map(x=>Math.round(x*1e12)/1e12))];return{w,z,a,intersections,allowed:a<1||a>Math.sqrt(10),threshold:Math.sqrt(10)};},
  cube(){const A=[0,0,0],B=[1,0,0],C=[1,1,0],D=[0,1,0],A1=[0,0,1],B1=[1,0,1],C1=[1,1,1],D1=[0,1,1],E=[.5,0,0],F=[1,.5,0],H=[.75,.25,0];return{A,B,C,D,A1,B1,C1,D1,E,F,H,cosine:1/3,angle:Math.acos(1/3),BH:Math.SQRT2/4};},
  trapezoid(t,r,s){const pt=y=>[y*y,y],A=pt(t+r),B=pt(t-r),C=pt(t-s),D=pt(t+s),M=[t*t+r*r,t],N=[t*t+s*s,t],H=[t*t+r*s,t],HM=r*Math.abs(s-r),HN=s*Math.abs(s-r);return{t,r,s,A,B,C,D,M,N,H,HM,HN,area:(r+s)**2*Math.abs(s-r),AB:2*r*Math.sqrt(1+4*t*t),CD:2*s*Math.sqrt(1+4*t*t),valid:r>Math.abs(t)&&s>Math.abs(t)&&r!==s};},
  F(a,x){return 2*a*x*x/9+Math.log1p(x)/3-Math.log1p(x/3);},
  witness(a){if(a>=.5)return null;return a<=0?.5:Math.min(.5,(-2+Math.sqrt(1+3/(2*a)))/2);},
  convex(kind,x){return kind==='cube'?x*x*x:kind==='exp'?Math.expm1(x):x*x;},
  generated(part,x,a,p,kind){if(part==='1'){const t=Math.cos(Math.PI*x);return{x,p:.5,value:t*t-t,min:-.25,max:2};}if(part==='2'){const witness=Y.witness(a);return{x,a,p:1/3,value:Y.F(a,x),holds:a>=.5,witness,witnessValue:witness===null?null:Y.F(a,witness)};}const f=t=>Y.convex(kind,t),u=p*x;return{x,p,u,value:p*f(x)-f(u),fx:f(x),fu:f(u),slopeX:f(x)/x,slopeU:f(u)/u};}
 };
 if(typeof module==='object'&&module.exports)module.exports=Y;root.YP25=Y;
})(typeof window==='undefined'?globalThis:window);
