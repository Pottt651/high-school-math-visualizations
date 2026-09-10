const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ctx=vm.createContext({Problems:{},M:{inline:x=>x,block:x=>x,answer:x=>x}});
for(const id of [9,20,21])vm.runInContext(fs.readFileSync(path.join(__dirname,'../papers/jiading-2024/src',`q${id}.js`),'utf8'),ctx);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
const critical=3-2*Math.SQRT2;
for(const [m,n] of [[-.6,0],[0,2],[.1,4],[critical,3],[.2,2],[-3-2*Math.SQRT2,1],[-7,2]]){
 const s=ctx.Problems[9].model(m);assert.equal(s.roots.length,n);s.roots.forEach(x=>near(Math.abs(x*x-3*x+2),m*x));
}
for(const s of [.01,.1,.5,1,2,5,20,100]){const r=ctx.Problems[20].model(s);for(const P of [r.P,r.Q])near(P[1]**2,4*P[0]);near(Math.hypot(r.Q[0]-r.P[0],r.Q[1]-r.P[1]),r.length);near((r.Q[1]-r.P[1])/(r.Q[0]-r.P[0])*r.slope,-1);assert.ok(r.length>=6*Math.sqrt(3)-1e-10);}
near(ctx.Problems[20].model(1).area,12);near(ctx.Problems[20].model(2).length,6*Math.sqrt(3));
const s=ctx.Problems[21].model(.28),special=ctx.Problems[21].model(s.special);assert.equal(s.roots.length,4);assert.equal(special.roots.length,3);near(special.roots[0]*special.roots[2],special.roots[1]**2);
for(const a of [.01,.1,.2,.3,.36]){const r=ctx.Problems[21].model(a);for(const x of [r.u,r.v])near(x*Math.exp(-x),a);for(const x of [Math.exp(r.u),Math.exp(r.v)])near(Math.log(x)/x,a);}
console.log('PASS JD2024 exact intersection transitions, parabola and normal invariants, global minimum, exponential root correspondence.');
