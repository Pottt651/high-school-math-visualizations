window.LessonGuides={
7:'拖动开区间的中心 a，观察三个固定数中恰有一个落在区间内。空心端点不计入；真子集个数先转换成集合的元素个数。',
10:'移动水平线，观察相邻三交点之间的短间距与长间距。改变相位只平移图像；只有比值等于 2 的候选才满足原题。',
12:'P 始终在所选面上，M、N 始终是内切球的一对对径点。旋转四面体，观察点积为何只由 OP 的长度决定。',
16:'转动经过固定点的直线，数它与两段函数的不同交点。原卷选项存在遗漏，先按原公式精确求根，再用 m=12 核验。',
19:'第一问改变 a 看对称性；第二问固定 a=1，把两个自变量到原点的距离与函数值对应。',
21:'切换三个分问，先逐项核对新定义，再看特殊递推与对数不等式。有限项只辅助观察，完整结论由解析证明给出。'
};
window.PT24={
  open(p,at,color=Lab.C.target,r=6){const q=p.to(at);p.add(`<circle cx="${q[0]}" cy="${q[1]}" r="${r}" fill="var(--canvas)" stroke="${color}" stroke-width="2"/>`);},
  mount(host,c){let state={...c.initial},stage=null;const id=c.id,$=s=>host.querySelector(s);
    host.innerHTML=`<div class="controls">${c.controls}</div><div class="figures"><svg id="${id}-svg" class="main-figure" role="img" aria-label="${c.label}"></svg></div><div class="readout" id="${id}-read"></div><div class="explain" id="${id}-proof"></div>`;
    const svg=$('#'+id+'-svg');let proof='';for(const el of host.querySelectorAll('[data-k]'))if(!el.id)el.id=id+'-'+el.dataset.k;for(const [i,el]of [...host.querySelectorAll('[data-action]')].entries())if(!el.id)el.id=id+'-action-'+i;
    function render(){for(const el of host.querySelectorAll('[data-k]'))el.value=state[el.dataset.k];for(const el of host.querySelectorAll('[data-part]'))el.hidden=!el.dataset.part.split(',').includes(String(state.part));c.draw(svg,state,stage===null?99:stage);$('#'+id+'-read').innerHTML=c.read(state);const next=c.proof(state);if(next!==proof){proof=next;$('#'+id+'-proof').innerHTML=next;}}
    const restart=()=>{if(stage!==null)stage=0;host.dispatchEvent(new Event('constructionchange'));};
    for(const el of host.querySelectorAll('[data-k]'))el.addEventListener(el.tagName==='SELECT'?'change':'input',()=>{let v=el.type==='range'||el.type==='number'?Number(el.value):el.value;if(typeof v==='number'&&!Number.isFinite(v))return;state[el.dataset.k]=v;if(el.dataset.k==='part')restart();c.change?.(state,el.dataset.k);render();});
    for(const el of host.querySelectorAll('[data-action]'))el.onclick=()=>{const part=state.part;c.action?.(state,el.dataset.action);if(state.part!==part)restart();render();};
    render();const api={render,reset(){state={...c.initial};restart();render();},getState:()=>({...state,...c.model?.(state)})};
    if(c.steps)Object.assign(api,{getConstructionSteps:()=>c.steps(state),getConstructionStep:()=>stage,setConstructionStep(n){stage=n===null?null:Math.max(0,Math.min(c.steps(state).length-1,Math.trunc(n)));render();}});return api;
  }
};
