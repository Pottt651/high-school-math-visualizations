const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),context=vm.createContext({Problems:{},M:{inline:x=>x,block:x=>x,answer:x=>x}});
for(const id of [16,21])vm.runInContext(fs.readFileSync(path.join(root,'papers/baoshan-2026/src',`q${id}.js`),'utf8'),context);
const q16=context.Problems[16].model,q21=context.Problems[21].model;
const close=(a,b,eps=1e-10)=>assert.ok(Math.abs(a-b)<=eps*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
// Integer arithmetic makes equality at the first failure exact (strict < excludes it).
for(let units=21;units<=60;units++){
 const d=units/20,N=q16.arithmetic(units,1).firstFailure;
 assert.ok(q16.arithmetic(units,N).margin>=0);
 if(N>1)assert.ok(q16.arithmetic(units,N-1).margin<0);
 for(let n=1;n<=40;n++){
  const m=q16.arithmetic(units,n),sum=Array.from({length:n},(_,i)=>-1+i*d).reduce((a,b)=>a+b,0);
  close(m.sum,sum);close(m.margin,2*(sum-m.bound)/n);
 }
}
assert.equal(q16.arithmetic(30,3).margin,0);
assert.equal(q16.arithmetic(21,1).firstFailure,21);
for(const family of ['three','two'])for(let n=1;n<=30;n++){
 const m=q16.geometric(family,n),a=k=>m.first*m.ratio**(k-1),b=k=>a(k+1)/(k+1);
 close(m.delta,a(n+1)-a(n));close(m.transformedDelta,b(n+1)-b(n));
 assert.ok(m.delta>1);
 if(family==='three')assert.ok(m.transformedDelta>=1.5);
}
assert.equal(q16.geometric('three',1).halfDelta,1);
assert.equal(q16.geometric('two',1).halfDelta,1);
close(q16.geometric('two',1).transformedDelta,2/3);
for(const x of [-8,-1,-.001,0,.001,.8,4]){
 const m=q21.exponential(x);close(m.F,4**x*(4**x-1));assert.equal(m.inM,x>=0);
}
assert.equal(q21.exponential(0).F,0);
for(const t of [1e-6,.01,.2,.5,.9,.99,1-1e-6]){
 const m=q21.critical(t);assert.ok(m.admissible&&m.a>0&&m.a<Math.E);
 close(Math.exp(t)-m.a/t,0);close(m.F,Math.exp(t)*(2-t-t*Math.log(t)));
 assert.ok(m.F>Math.exp(t)*(2-t));
 const derivative=x=>Math.exp(x)-m.a/x;
 assert.ok(derivative(t/2)<0&&derivative((t+1)/2)>0);
}
assert.equal(q21.critical(0).admissible,false);assert.equal(q21.critical(1).admissible,false);
for(const x0 of [-1.5,-.4,0,.4,1.5])for(const kind of ['tangent','upper','lower','tilt']){
 const m=q21.concave(x0,kind),F=x=>-x*x-m.slope*x-m.intercept;
 for(const root of m.roots)close(F(root),0);
 assert.equal(m.singletonAtX0,kind==='tangent');
 if(kind==='tangent'){assert.equal(m.roots.length,1);close(m.roots[0],x0);assert.ok(F(x0-.5)<0&&F(x0+.5)<0);}
 if(kind==='upper'){assert.equal(m.roots.length,0);assert.ok(F(x0)<0);}
 if(kind==='lower'||kind==='tilt'){assert.equal(m.roots.length,2);assert.ok(F((m.roots[0]+m.roots[1])/2)>0);}
}
console.log('Baoshan q16/q21 mathematical models and strict endpoints passed.');
