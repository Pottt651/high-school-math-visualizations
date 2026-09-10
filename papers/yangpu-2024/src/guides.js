window.LessonGuides={
11:'利用焦点到准线的等距关系，把两个焦距之差变成横坐标之差；改变候选p，对照中点、弦长和焦距差三个条件。',
15:'前n项和是离散点，不能把连续抛物线的顶点直接当作整数答案。比较第4项与第5项的符号，特别观察两个边界上的并列最大值。',
17:'先保持正方形底面与竖直棱，观察两平面为何垂直；第二问固定体积，垂足H同时满足两条面内垂线条件。',
18:'第一问先记住指数函数值必须为正；第二问上下移动直线，找到对所有x都不超过指数曲线的最高位置。',
19:'先比较同样横向宽度下两种雨棚的板材面积，再保持入射角条件改变圆弧端点位置；右图同步显示真正的遮挡高度。',
21:'奇性是全体对称点的关系；递推图只显示有限前缀，等差不可能性的证明用连续三个相位。最后按精确二周期关系构造负公比数列。'
};
window.YP24={
 mount(host,c){let s={...c.initial};const id=c.id,$=name=>host.querySelector('#'+id+'-'+name);
  host.innerHTML=`<div class="controls">${c.controls}</div><div class="figures"><svg id="${id}-svg" class="main-figure" role="img" aria-label="${c.label}"></svg></div><div class="readout" id="${id}-read"></div><div class="explain">${c.proof}</div>`;
  const svg=$('svg');for(const e of host.querySelectorAll('[data-k]'))e.id=id+'-'+e.dataset.k;for(const e of host.querySelectorAll('[data-action]'))e.id=id+'-'+e.dataset.action;
  function render(){for(const e of host.querySelectorAll('[data-k]')){e.value=s[e.dataset.k];}for(const e of host.querySelectorAll('[data-part]'))e.hidden=!e.dataset.part.split(',').includes(String(s.part));c.draw(svg,s);$('read').innerHTML=c.read(s);c.sync?.(host,s);}
  for(const e of host.querySelectorAll('[data-k]'))e.addEventListener(e.tagName==='SELECT'?'change':'input',()=>{s[e.dataset.k]=e.type==='range'||e.type==='number'?+e.value:e.value;c.change?.(s,e.dataset.k);render();});
  for(const e of host.querySelectorAll('[data-action]'))e.onclick=()=>{c.action?.(s,e.dataset.action);render();};return{render,reset(){s={...c.initial};render();},getState:()=>({...s,...c.model?.(s)})};
 },
 sum(q,n){const c=Math.log2(q),B=n=>6*n-n*(n-1)*c/2;let best=[];if(c>0){const v=6/c+.5,candidates=[Math.max(1,Math.floor(v)),Math.max(1,Math.ceil(v))],max=Math.max(...candidates.map(B));best=[...new Set(candidates)].filter(k=>Math.abs(B(k)-max)<1e-9);}return{q,n,c,b4:6-3*c,b5:6-4*c,B:B(n),best,values:Array.from({length:10},(_,i)=>B(i+1))};},
 cycle(which=0){const F=x=>x+4*Math.sin(Math.PI*x/2);let l=which?3:2,r=which?4:3;for(let i=0;i<55;i++){const mid=(l+r)/2;if((F(mid)>0)===!which)l=mid;else r=mid;}return(l+r)/2;},
 sequence(A,seed,cycle=false){const values=[seed];for(let i=1;i<12;i++)values.push(cycle?(i%2?-seed:seed):values.at(-1)+A*Math.sin(Math.PI*values.at(-1)/2));return{values,diffs:values.slice(1).map((x,i)=>x-values[i]),increasing:values.slice(1).every((x,i)=>x>values[i])};}
};
