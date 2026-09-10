const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ctx=vm.createContext({Problems:{},Lab:{C:{}},M:{inline:x=>x,block:x=>x,answer:x=>x,number:(x,p=4)=>x.toFixed(p)}});
vm.runInContext('window=globalThis',ctx);
const dir=path.join(__dirname,'../papers/yangpu-2024/src');
vm.runInContext(fs.readFileSync(path.join(dir,'guides.js'),'utf8'),ctx);
for(const id of [11,15,18,21])vm.runInContext(fs.readFileSync(path.join(dir,`q${id}.js`),'utf8'),ctx);
ctx.YP24.mount=(_,c)=>c;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
const parabola=ctx.Problems[11].mount({});
for(const p of [1.5,2,3,4,5,7]){const m=parabola.model({p});for(const point of[m.A,m.B])near(point[1]**2,2*p*point[0]);near(m.af,m.A[0]+p/2);near(m.bf,m.B[0]+p/2);near(m.delta,16/p);near(m.length,Math.hypot(16/p,4));near((m.A[1]+m.B[1])/2,4);assert.equal(m.matches,p===4);}
near(parabola.model({p:4}).length,4*Math.SQRT2);
for(const q of[1.1,2,2*Math.SQRT2,2.9,3.2,3.99,4,5.5]){const m=ctx.YP24.sum(q,4),all=Array.from({length:200},(_,i)=>{const n=i+1;return 6*n-n*(n-1)/2*Math.log2(q);}),max=Math.max(...all),best=all.flatMap((x,i)=>Math.abs(x-max)<1e-9?[i+1]:[]);assert.deepEqual(Array.from(m.best),best);assert.equal(m.best.length===1&&m.best[0]===4,q>2*Math.SQRT2&&q<4);}
assert.deepEqual(Array.from(ctx.YP24.sum(2*Math.SQRT2,4).best),[4,5]);assert.deepEqual(Array.from(ctx.YP24.sum(4,4).best),[3,4]);
const exponential=ctx.Problems[18].mount({});near(exponential.model({x:Math.log(2),b:1}).residual,0);
for(const b of[-1,0,.999,1,1.001,3]){const m=exponential.model({x:0,b});near(m.minGap,1-b);assert.equal(m.holds,b<=1);for(const x of[-50,-5,-1,0,.1,1,5,50])assert.ok(Math.exp(x)-x-b>=m.minGap-1e-10);}
for(const which of [0,1]){const a=ctx.YP24.cycle(which);assert.ok(a>(which?3:2)&&a<(which?4:3));near(a+4*Math.sin(Math.PI*a/2),0);const seq=ctx.YP24.sequence(8,a,true);for(let i=0;i<seq.values.length;i++){near(seq.values[i],(-1)**i*a);if(i)near(seq.values[i],seq.values[i-1]+8*Math.sin(Math.PI*seq.values[i-1]/2));}}
for(const A of[.2,.5,2,3.9,8])for(const a of[.1,.5,1,2.5,3.8]){const m=ctx.YP24.sequence(A,a);for(let i=1;i<m.values.length;i++)near(m.values[i]-m.values[i-1],A*Math.sin(Math.PI*m.values[i-1]/2));near((-a)+A*Math.sin(-Math.PI*a/2),-(a+A*Math.sin(Math.PI*a/2)));}
assert.equal(ctx.YP24.sequence(.5,.5).increasing,true);
console.log('PASS YP11/15/18/21: focal geometry, unique discrete maxima and endpoint ties, exponential equation, global lower bound, oddness and exact two-cycles.');
