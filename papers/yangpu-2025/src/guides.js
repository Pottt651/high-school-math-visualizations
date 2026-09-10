window.LessonGuides={
9:'改变圆柱高度，看半径怎样被球面限制。左边是轴截面，右边是真正的侧面展开图，只有右图矩形面积才是所求侧面积。',
10:'两段方程各有一个候选解，但候选能否成为零点还要看它是否落在该段定义域。特别观察 a=8 与 a=9 的开闭端点。',
11:'固定近月距离为1，把远月距离放大4倍。观察两轨道离心率的比值，并找出比值恰为2.5的原轨道。',
12:'外部圆在复映射下形成一族椭圆；再观察以1−i为圆心的圆周是否碰到被删去的实线段。圆周大到包围线段时也可能完全不相交。',
17:'先找与 EF 平行的底面对角线，再作垂直 EF 的截面。旋转观察时，所求二面角不能直接用屏幕投影角替代。',
20:'用两条平行弦的共同参数保持平行，观察中点与对角线交点总在同一水平线上。最后固定两个距离，改变弦的倾斜程度，看面积为何不变。',
21:'p生成函数量的是弦上点与函数点的竖直差。切换三问，分别观察值域、全区间非负，以及生成函数怎样证明割线斜率递增。'
};
window.YP25Mount=(host,c)=>{let s={...c.initial},stage=null;const id=c.id;
 host.innerHTML=`<div class="controls">${c.controls}</div><div class="figures"><svg id="${id}-svg" class="${c.second?'figure':'main-figure'}" role="img" aria-label="${c.label}"></svg>${c.second?`<svg id="${id}-second" class="figure" role="img" aria-label="${c.second}"></svg>`:''}</div><div class="readout" id="${id}-read"></div><div class="explain">${c.proof}</div>`;
 const svg=host.querySelector('#'+id+'-svg'),second=host.querySelector('#'+id+'-second');for(const el of host.querySelectorAll('[data-k]'))el.id=id+'-'+el.dataset.k;for(const el of host.querySelectorAll('[data-action]'))el.id=id+'-'+el.dataset.action;
 function render(){for(const el of host.querySelectorAll('[data-k]'))el.value=s[el.dataset.k];for(const el of host.querySelectorAll('[data-part]'))el.hidden=!el.dataset.part.split(',').includes(s.part);c.draw(svg,s,second,stage);host.querySelector('#'+id+'-read').innerHTML=c.read(s);c.sync?.(host,s);}
 const steps=()=>typeof c.steps==='function'?c.steps(s):c.steps;
 function update(change){const previous=[s.part,s.kind].join('|');change();const changed=previous!==[s.part,s.kind].join('|');if(changed&&stage!==null)stage=0;render();if(changed)host.dispatchEvent(new Event('constructionchange'));}
 for(const el of host.querySelectorAll('[data-k]'))el.addEventListener(el.tagName==='SELECT'?'change':'input',()=>update(()=>{s[el.dataset.k]=['range','number'].includes(el.type)?+el.value:el.value;c.change?.(s,el.dataset.k);}));for(const el of host.querySelectorAll('[data-action]'))el.onclick=()=>update(()=>c.action?.(s,el.dataset.action));
 return{render,reset(){s={...c.initial};stage=null;render();},getState:()=>({...s,...c.model?.(s)}),...(c.steps?{getConstructionSteps:steps,getConstructionStep:()=>stage,setConstructionStep:n=>{stage=n===null?null:Math.max(0,Math.min(steps().length-1,n));render();}}:{})};
};
