const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const X=require('../papers/xuhui-2025/src/model.js');
const sandbox={window:{}};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../papers/huangpu-2025/src/model.js'),'utf8'),sandbox);
const H=sandbox.window.HuangpuMath;
const near=(a,b,e=1e-9)=>assert.ok(Math.abs(a-b)<=e*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
let checks=0;
for(let angle=30.1;angle<150;angle+=.37){
  const z=X.chord(angle);assert.ok(z.valid&&z.finite);
  for(const P of [z.A,z.B]){near(P[0]**2/3-P[1]**2,1,1e-8);assert.ok(P[0]>=Math.sqrt(3)-1e-9);near(P[0]-2,z.t*P[1]);}
  near(Math.hypot(z.A[0]-z.B[0],z.A[1]-z.B[1]),2*z.R);
  near(z.angleA,z.angleB);near(z.d/z.R,Math.sqrt(3)/2);near(z.theta,Math.PI/3);
  for(const P of [z.M,z.N]){near(P[0],1.5);near(Math.hypot(P[0]-z.K[0],P[1]-z.K[1]),z.R);}
  checks++;
}
assert.equal(X.chord(90).valid,false);
for(const a of [0,30,150,180,NaN])assert.equal(X.chord(a).finite,false);
for(const angle of [60,120]){const z=X.chord(angle),P=angle===60?z.N:z.M;near(P[1],0);}
for(let wi=10;wi<=180;wi+=7)for(let fi=0;fi<=200;fi+=5){
  const w=wi/100,phi=fi/100,u=X.witness(w,phi),valid=phi%2===0&&w<=1;
  assert.equal(u===null,valid);
  if(u!==null){assert.ok(u>-1&&u<1&&u!==0);assert.ok(u*X.sinPi(w*u+phi)<0);}
  for(const tPi of [-1,-.5,0,.25,.5,1]){
    const s=X.tDefinition({omegaPi:w,phiPi:phi,tPi});
    near(s.u,Math.sin(Math.PI*tPi));near(s.v,Math.sin(Math.PI*(w*s.u+phi)));
    assert.equal(s.universal,valid);if(valid)assert.ok(s.product>=-1e-14);
  }
  checks++;
}
for(const tPi of [-.5,.5])assert.equal(X.tDefinition({omegaPi:1,phiPi:0,tPi}).product,0);
assert.equal(X.tDefinition({mode:'cosine',tPi:.5}).isT,true);
assert.equal(X.tDefinition({mode:'cosine',tPi:.75}).isT,false);
// The minimum between the closed disk and the perpendicular bisector is attained.
const shortest=H.complex(135,1,-.5);near(shortest.distance,Math.SQRT2/2);
for(let a=0;a<360;a+=7)for(const r of [0,.25,.9,1]){
  const z=H.complex(a,r,.4);assert.ok(z.distance>=Math.SQRT2/2-1e-10);near(z.foot[1]-z.foot[0],1);checks++;
}
assert.equal(H.cubePairs.length,210);
for(const z of H.cubePairs){assert.equal(new Set(z.ids).size,4);assert.ok(Math.abs(z.angle-30)>1);}
for(const a of [45,60,90])assert.ok(H.cubePairs.some(z=>Math.abs(z.angle-a)<1e-8));
// Test the original two distances, not only the reduced equality formula.
for(const a of [1.01,1.1,1.25,1.34]){
  const u=(3-a*a)/(2*a),f=(u-a/3)/(1-a/3),z=H.hyperbola(a,f);
  assert.ok(z.valid&&z.possible);near(Math.hypot(z.A[0]-z.B[0],z.A[1]-z.B[1]),Math.hypot(z.A[0]-3,z.A[1]));
  for(const P of [z.A,z.B])near(P[0]**2/(a*a)-P[1]**2/(9-a*a),1,1e-8);
  assert.ok(z.A[0]>=a&&z.A[1]>0&&z.B[0]<=-a);checks++;
}
assert.equal(H.hyperbola(1,.5).possible,false);assert.equal(H.hyperbola(3/Math.sqrt(5),.5).possible,false);
for(const m of [.1,.5,.95,1.05,2,5]){const z=H.offset('cubic',m);assert.ok(z.x0>z.h);near(z.fn(z.roots[0]),0);near(z.fn(z.roots[1]),0);near(z.probe,-((m-1)**2)/4);}
for(const m of [1.000001,1+1e-10]){const z=H.offset('cubic',m);assert.ok(z.offsetDelta>0);near(z.offsetDelta/((m-1)**2),1/16,1e-6);}
for(const a of [.005,.02,.1,.25,.36]){const z=H.offset('log',a);assert.ok(z.valid&&z.h>z.x0);for(const r of z.roots)near(Math.log(r)-r,Math.log(a));assert.ok(z.fn(z.mirror)>z.level);}
console.log(`PASS: ${checks} configurations; original conics/distances, angle exclusions, exact T endpoints and counterexamples, finite permutation directions, and strict offset/existence bounds.`);
