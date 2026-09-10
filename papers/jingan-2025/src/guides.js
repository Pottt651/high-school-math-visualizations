window.LessonGuides={
9:'改变双曲线参数，比较焦点圆半径与焦点到渐近线的垂距；两个量相等才是相切，而不是看起来接触。',
11:'偶函数先把参数限制到单位圆。沿圆改变参数，纵截距变成一条振幅固定的三角曲线，红点显示当前截距。',
15:'沿 CD 折叠时，两张含 CD 的面始终是直角三角形；重点检查另外两张面的直角是否同时出现。',
18:'两条单位向量的夹角是 2x。平行四边形对角线给出向量和，联动观察点积、模长与所求函数。',
19:'先看正四面体的高，再用中位线连成截面。解除“中点”条件作对照时得到矩形，回到中点才是正方形。',
20:'矩形横向长度卷成圆柱底面周长，竖向长度才是高。切到第三问，让两切线斜率乘积始终为 −1，观察交点所在直线。',
21:'把 f−1 看成非负且超可加的函数。示例用于观察，完整结论来自题设不等式；特别区分非减与严格递增。'
};
window.JA25={
mount(host,c){let s={...c.initial};const id=c.id;host.innerHTML=`<div class="controls">${c.controls}</div><div class="figures">${Array.from({length:c.two?2:1},(_,i)=>`<svg id="${id}-svg${i}" class="${c.two?'figure':'main-figure'}" role="img" aria-label="${c.label}"></svg>`).join('')}</div><div class="readout" id="${id}-read"></div><div class="explain">${c.proof}</div>`;const svgs=Array.from(host.querySelectorAll('.figures > svg'));for(const e of host.querySelectorAll('[data-k]'))e.id=id+'-'+e.dataset.k;for(const e of host.querySelectorAll('[data-action]'))e.id=id+'-'+e.dataset.action;
function render(){for(const e of host.querySelectorAll('[data-k]'))e.value=s[e.dataset.k];for(const e of host.querySelectorAll('[data-part]'))e.hidden=!e.dataset.part.split(',').includes(String(s.part));c.draw(c.two?svgs:svgs[0],s);host.querySelector('#'+id+'-read').innerHTML=c.read(s);c.sync?.(host,s);}
for(const e of host.querySelectorAll('[data-k]'))e.addEventListener(e.tagName==='SELECT'?'change':'input',()=>{s[e.dataset.k]=e.type==='range'||e.type==='number'?+e.value:e.value;c.change?.(s,e.dataset.k);render();});for(const e of host.querySelectorAll('[data-action]'))e.onclick=()=>{c.action?.(s,e.dataset.action);render();};return{render,reset(){s={...c.initial};render();},getState:()=>({...s,...c.model?.(s)})};},
hyperbola(m){const b=Math.sqrt(m),c=Math.sqrt(4+m),e=c/2,F=[c,0],H=[4*c/(4+m),2*b*c/(4+m)];return{m,b,c,e,F,H,d:b,tangent:Math.abs(b-e)<1e-10};},
intercept(t){const a=Math.cos(t),b=Math.sin(t);return{t,a,b,value:a*a+2*a*b-b*b};},
fold(phi){const D=[0,0,0],C=[0,1,0],B=[-1,0,0],A=[-Math.sqrt(3)*Math.cos(phi),0,Math.sqrt(3)*Math.sin(phi)],atB=1-Math.sqrt(3)*Math.cos(phi);return{phi,A,B,C,D,atB,atC:1+Math.sqrt(3)*Math.cos(phi),atD:Math.sqrt(3)*Math.cos(phi),legal:Math.abs(atB)<1e-9};},
vectors(x){const a=[Math.cos(1.5*x),Math.sin(1.5*x)],b=[Math.cos(-.5*x),Math.sin(-.5*x)],sum=[a[0]+b[0],a[1]+b[1]],dot=Math.cos(2*x),length=2*Math.cos(x);return{x,a,b,sum,dot,length,value:dot-length};},
tetra(t=.5){const B=[0,0,0],C=[2,0,0],D=[1,Math.sqrt(3),0],A=[1,Math.sqrt(3)/3,2*Math.sqrt(6)/3],mix=(a,b)=>a.map((v,i)=>(1-t)*v+t*b[i]);return{A,B,C,D,E:mix(A,C),F:mix(A,D),G:mix(B,C),H:mix(B,D),O:[1,Math.sqrt(3)/3,0],t,EF:2*t,EG:2*(1-t),volume:2*Math.sqrt(2)/3};},
parabola(t=1,k=1){return{t,k,height:2-t*t/2,width:2*t,radius:t/Math.PI,volume:t*t*(2-t*t/2)/Math.PI,slope2:-1/k,T:[k,k*k/2],U:[-1/k,1/(2*k*k)],P:[(k-1/k)/2,-.5]};},
u(kind,x){return kind==='step'?(x>=1?3:1):kind==='line'?1+2*x:Math.pow(3,x);},
uState(kind,x,r,n){const y=(1-x)*r,f=z=>JA25.u(kind,z),t=3**(-n);return{kind,x,y,n,t,fx:f(x),fy:f(y),fsum:f(x+y),gap:f(x+y)-f(x)-f(y)+1,bound:1+2*t,sample:f(t)};}
};
