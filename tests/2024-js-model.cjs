const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ctx=vm.createContext({Problems:{},M:{inline:x=>x,block:x=>x,answer:x=>x}});
for(const id of [11,19,20,21])vm.runInContext(fs.readFileSync(path.join(__dirname,'../papers/jinshan-2024/src',`q${id}.js`),'utf8'),ctx);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
for(const [c,n] of [[.1,8],[8.99,8],[9,7],[9.01,6],[15.99,6],[16,4],[16.01,2]]){const s=ctx.Problems[11].model(c);assert.equal(s.roots.length,n);s.roots.forEach(x=>near(Math.abs(16-((x+2)**2-5)**2),c));}
for(const beta of [.1,5,15,30,45,60,75,85,89.9]){const s=ctx.Problems[19].model(beta),cross=(a,b)=>a[0]*b[1]-a[1]*b[0],sub=(a,b)=>a.map((v,i)=>v-b[i]);near(Math.hypot(...sub(s.H,s.E)),1.2);near(Math.hypot(...sub(s.F,s.E)),s.L);near(cross(sub(s.O,s.E),sub(s.F,s.E)),0);near(s.H[1],0);near(s.G[0],0);assert.ok(s.L>=3.6*Math.SQRT2-2.4-1e-9);const t=(s.O[0]-s.E[0])/(s.F[0]-s.E[0]);assert.ok(t>=0&&t<=1);}
const cmodel=ctx.Problems[20].model;
for(const k of [-3,-1,-.1,.1,.8,1,2,5]){const c=cmodel.chord(k,-8*k);near(c.dot,0);for(const P of [c.A,c.B]){near(P[1]**2,8*P[0]);near(P[1],k*(P[0]-8));}}
for(const t of [-2.8,-2,-1,0])for(const r of [1.2,2,3]){const c=cmodel.triples(t,r),ds=c.chords.map(x=>x.distance),ss=c.chords.map(x=>x.area);near(ds[0]*ds[2],ds[1]**2);c.chords.forEach(x=>{assert.ok(x.m<-t);for(const P of [x.A,x.B])near(P[1]**2,8*P[0]);near(x.area,Math.abs((x.A[0]-t)*x.B[1]-(x.B[0]-t)*x.A[1])/2);});if(t===-2)near(ss[0]*ss[2],ss[1]**2);else assert.ok(Math.abs(ss[0]*ss[2]-ss[1]**2)>1e-4);}
const q=ctx.Problems[21].model;
for(const [m,exists] of [[-100,true],[1.99,true],[2,false],[5,false],[q.critical-1e-5,false],[q.critical,true],[10,true],[100,true]]){const xs=q.roots(m);assert.equal(xs.length>0,exists);for(const x of xs){assert.ok(x>1&&x<3);const t=2**(x-1);near(-2*t*t+m*t-12,(3*m-30)/2);}}
for(const x of [0,.01,.3,1,1.6,2])near(q.f(x)+q.f(2-x),1);
assert.ok(q.partition(14).product<=2023);assert.ok(q.partition(15).product>2023);for(const n of [0,1,3,8]){const N=2**n,total=Array.from({length:N},(_,i)=>q.f(2*(i+1)/(N+1))).reduce((a,b)=>a+b,0);near(total,q.partition(n).H);}
console.log('PASS JS2024 quartic root counts, refrigerator contact geometry and minimum, chord orthogonality and two progressions, mean-value endpoints and exact sums.');
