window.HP24=(()=>{
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),sub=(a,b)=>a.map((v,i)=>v-b[i]),add=(a,b)=>a.map((v,i)=>v+b[i]),scale=(a,k)=>a.map(v=>v*k),norm=a=>Math.hypot(...a);
 function phase(phi){return {phi,left:phi-Math.PI/2,right:phi+Math.PI/3,monotone:phi>0&&phi<=Math.PI/6+1e-12};}
 const h=Math.sqrt(13),A=[0,0,h],B=[2*Math.sqrt(3),0,0],C=[-Math.sqrt(3),3,0],D=[-Math.sqrt(3),-3,0],G=[0,0,h/4],M=scale(add(A,B),.5),n=[4*Math.sqrt(3),0,h],U=[h/Math.sqrt(61),0,-4*Math.sqrt(3)/Math.sqrt(61)],V=[0,1,0],mirror=sub(A,scale(n,39/122)),best=[-39*Math.sqrt(3)/100,0,61*h/100];
 function reflection(u,v){const P=add(G,add(scale(U,u),scale(V,v)));return {u,v,A,B,C,D,G,M,n,mirror,best,P,value:2*(norm(sub(P,M))+norm(sub(P,A))),constraint:dot(n,sub(G,P)),bestU:dot(sub(best,G),U)};}
 function square(theta){const P=[4+2*Math.cos(theta),2+2*Math.sin(theta)],Q=[P[0]-1,Math.max(0,P[1]-1)];return {theta,P,Q,distance:norm(Q),min:Math.sqrt(10)-2,max:Math.sqrt(10)+2};}
 function garden(alpha){const r=50/Math.cos(alpha/2),D=[r,0],E=[-r/2,Math.sqrt(3)*r/2],C=[r*Math.cos(Math.PI/3+alpha),r*Math.sin(Math.PI/3+alpha)];return {alpha,r,D,E,C,dc:norm(sub(D,C)),ce:norm(sub(C,E)),area:1250*Math.sqrt(3)*Math.cos(alpha)/(Math.cos(alpha/2)**2)};}
 const chordH=(a,u)=>u*u*(u*u-4*u+4*a-1);
 function tangent(a,k){const u=Math.hypot(1,k),b=a-u,discriminant=k*k+4*b,T=[k/u,a-1/u];if(discriminant<0)return {a,k,u,b,T,valid:false};const x1=(k-Math.sqrt(discriminant))/2,x2=(k+Math.sqrt(discriminant))/2;return {a,k,u,b,T,valid:true,X:[x1,x1*x1],Y:[x2,x2*x2],length:Math.sqrt((1+k*k)*discriminant)};}
 function equalPair(a){if(!(a>1.25&&a<1.375))return null;const d=Math.sqrt(11-8*a),low=(3-d)/2,high=(3+d)/2,target=(chordH(a,low)+chordH(a,high))/2;function bisect(l,r,up){for(let i=0;i<65;i++){const m=(l+r)/2;if((chordH(a,m)<target)===up)l=m;else r=m;}return(l+r)/2;}let end=high+1;while(chordH(a,end)<target)end++;const u=bisect(low,high,false),v=bisect(high,end,true);return {first:tangent(a,Math.sqrt(u*u-1)),second:tangent(a,Math.sqrt(v*v-1)),low,high,target};}
 function local(a){const t=2*a/(a+2+Math.sqrt(a*a+4)),b=(a-2*t)*Math.exp(-t);return {a,t,b,value:-t*t+a*t,slope:a-2*t};}
 function logLocal(t){return {t,m:(Math.log(t)+1)/(2*t),n:t*(Math.log(t)-1)/2};}
 return {clamp,dot,sub,add,scale,norm,phase,reflection,square,garden,chordH,tangent,equalPair,local,logLocal};
})();
