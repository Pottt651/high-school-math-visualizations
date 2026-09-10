const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'../papers/huangpu-2024/src/model.js'),'utf8'),ctx);const H=ctx.window.HP24;
const near=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
assert.ok(H.phase(Math.PI/6).monotone);assert.ok(!H.phase(0).monotone);assert.ok(!H.phase(Math.PI/6+1e-5).monotone);
for(let u=-3;u<=3;u+=.2)for(let v=-3;v<=3;v+=.4){const s=H.reflection(u,v);near(s.constraint,0);assert.ok(s.value>=8-1e-10);near(H.norm(H.sub(s.P,s.A)),H.norm(H.sub(s.P,s.mirror)));}near(H.reflection(H.reflection(0,0).bestU,0).value,8);
for(let t=0;t<2*Math.PI;t+=.01){const s=H.square(t);assert.ok(s.distance>=s.min-1e-10&&s.distance<=s.max+1e-10);const[a,b]=s.P;assert.ok(Math.abs(s.Q[0]-a)<=1+1e-10&&Math.abs(s.Q[1]-b)<=1+1e-10);}near(H.square(Math.atan2(1,3)).distance,Math.sqrt(10)+2);near(H.square(Math.atan2(1,3)+Math.PI).distance,Math.sqrt(10)-2);
for(let a=-Math.PI/3+.0001;a<Math.PI/3;a+=.003){const s=H.garden(a);near(s.dc+s.ce,100);assert.ok(s.area<=1250*Math.sqrt(3)+1e-8);near(H.norm(s.C),s.r);}
for(let a=1.251;a<1.375;a+=.003){const pair=H.equalPair(a);near(pair.first.length,pair.second.length);assert.ok(Math.abs(pair.first.k-pair.second.k)>1e-5);for(const s of [pair.first,pair.second]){near(s.T[0]**2+(s.T[1]-a)**2,1);for(const P of [s.X,s.Y]){near(P[1],P[0]**2);near(P[1],s.k*P[0]+s.b);}}}assert.equal(H.equalPair(1.25),null);assert.equal(H.equalPair(1.375),null);
for(let a=.01;a<=50;a+=.03){const s=H.local(a);assert.ok(s.t>0&&s.t<1&&s.b>0);near(s.value,s.b*Math.exp(s.t));near(s.slope,s.b*Math.exp(s.t));}
for(let z=-6;z<6;z+=.01){const s=H.logLocal(Math.exp(z));near(s.m*s.t+s.n/s.t,Math.log(s.t));near(s.m-s.n/s.t**2,1/s.t);assert.ok(s.m<=.5+1e-10);}
console.log('PASS: HP phase endpoints, constrained reflection, square projection, fixed fence, equal chords and simultaneous value/derivative equations.');
