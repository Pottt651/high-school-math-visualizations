Problems[10] = {
  title: '空间距离：哪些量一起变？',
  statement: `三个两两垂直的向量以 ${M.inline('O')} 为起点，终点为 ${M.inline('B_1,B_2,B_3')}，且 ${M.inline(String.raw`\overrightarrow{OP}=\overrightarrow{OB_1}+\overrightarrow{OB_2}+\overrightarrow{OB_3}`)}。已知 ${M.inline('AB_1=AB_2=AB_3=1')}，且 ${M.inline(String.raw`AP\le1`)}，求 <span class="target">${M.inline('OA')} 的范围</span>。`,
  mount(host) {
    const initial = { s: 0.55, yaw: -1.28, pitch: 0.44 };
    let state = { ...initial }, geometryKey = null, readoutKey = null, constructionStep = null;
    const constructionSteps = [
      {title:'从三个垂直方向开始',body:`以 ${M.inline('O')} 为起点，画三个两两垂直的向量 ${M.inline(String.raw`\overrightarrow{OB_1},\overrightarrow{OB_2},\overrightarrow{OB_3}`)}。本图取三向量等长，展示一族对称的合法构造；原题没有要求它们等长。`},
      {title:'用向量和确定 P',body:`题设 ${M.inline(String.raw`\overrightarrow{OP}=\overrightarrow{OB_1}+\overrightarrow{OB_2}+\overrightarrow{OB_3}`)}。沿三个方向补出平行六面体，三个向量之和到达对角顶点 ${M.inline('P')}。`},
      {title:'把三个单位距离画出来',body:`取满足 ${M.inline('AB_1=AB_2=AB_3=1')} 的点 ${M.inline('A')}，连出三条绿色线段并标为 ${M.inline('1')}。这里的 ${M.inline('A')} 由同一个对称构造计算，三个距离同时成立。`},
      {title:'加入 AP 的限制',body:`连接 ${M.inline('A,P')}，得到蓝色线段 ${M.inline('AP')}。题设 ${M.inline(String.raw`AP\le1`)}，距离又非负，因此可在 ${M.inline(String.raw`0\le AP\le1`)} 内拖动参数；三个单位距离始终保持。`},
      {title:'最后标出所求 OA',body:`连接 ${M.inline('O,A')}，用红色标出所求的 ${M.inline('OA')}。现在比较：蓝色 ${M.inline('AP')} 改变时，红色 ${M.inline('OA')} 怎样变化？这族图形可说明可达性，一般构型的完整范围仍需用题设关系证明。`},
    ];
    host.innerHTML = `<div class="controls"><label>${M.inline('AP')} <input id="q10-s" type="range" min="0" max="1" step="0.005" value="0.55"> <output id="q10-s-value"></output></label><button id="q10-ap0">${M.inline('AP=0')}</button><button id="q10-ap1">${M.inline('AP=1')}</button><button id="q10-view">恢复视角</button><span class="hint">拖动旋转 · 滚轮缩放</span></div><div class="figures"><svg class="main-figure" id="q10-svg" role="img" aria-label="满足三个单位距离的空间构型，可拖动旋转"></svg></div><div class="readout" id="q10-readout"></div><div class="explain"><section class="proof-step"><h3>由距离关系求范围</h3><p>对任意合法构型，设 ${M.inline('B_1=(p,0,0)')}、${M.inline('B_2=(0,q,0)')}、${M.inline('B_3=(0,0,r)')}，则 ${M.inline('P=(p,q,r)')}。展开三个单位距离的平方，相加后可得</p>${M.block(String.raw`\begin{aligned}AB_1^2+AB_2^2+AB_3^2&=3\\2OA^2+AP^2&=3\end{aligned}`)}<p>${M.inline(String.raw`0\le AP\le1`)}，所以 ${M.inline(String.raw`1\le OA^2\le\dfrac32`)}，即 <span class="target">${M.inline(String.raw`OA\in\left[1,\sqrt{\dfrac32}\right]`)}</span>。</p></section><section class="proof-step"><h3>构造验证每个值都能取到</h3><p>此处展示一族对称的合法例子。令</p>${M.block(String.raw`\begin{aligned}s&=AP,\\t&=\sqrt{\dfrac{3-s^2}{6}},\\c&=t+\dfrac{s}{\sqrt3}.\end{aligned}`)}<p>取 ${M.inline('A=(t,t,t)')}，三个 ${M.inline('B_i')} 分别为 ${M.inline('(c,0,0)')}、${M.inline('(0,c,0)')}、${M.inline('(0,0,c)')}。此时</p>${M.block('AB_i^2=(t-c)^2+2t^2=1')}<p>拖动 ${M.inline('s')} 从 ${M.inline('0')} 到 ${M.inline('1')}，端点及全部中间值均可实现。一般恒等式证明范围，构造证明可达。</p></section></div>`;
    const svg = host.querySelector('#q10-svg'), slider = host.querySelector('#q10-s');
    const subtract = (a,b) => a.map((v,i)=>v-b[i]);
    const norm = a => Math.hypot(...a);
    function model() {
      const t=Math.sqrt((3-state.s*state.s)/6),c=t+state.s/Math.sqrt(3);
      const O=[0,0,0],A=[t,t,t],B1=[c,0,0],B2=[0,c,0],B3=[0,0,c],P=[c,c,c];
      return {t,c,O,A,B1,B2,B3,P,oa:norm(A),ap:norm(subtract(A,P)),unit:[B1,B2,B3].map(B=>norm(subtract(A,B)))};
    }
    const viewport=Space.create(svg,{center:[.55,.55,.55],span:2.42,view:initial,onViewChange:next=>{state.yaw=next.yaw;state.pitch=next.pitch;}});
    const middle=(a,b)=>a.map((v,i)=>(v+b[i])/2);
    function sceneFor(m){
      const C=Lab.C,points=[],edges=[],faces=[],annotations=[];
      const vertices=Array.from({length:8},(_,i)=>[0,1,2].map(k=>(i&(1<<k))?m.c:0));
      [[0,1,3,2],[4,5,7,6],[0,1,5,4],[2,3,7,6],[0,2,6,4],[1,3,7,5]].forEach((indices,i)=>faces.push({id:'frame-face-'+i,vertices:indices.map(k=>vertices[k]),color:C.ink,opacity:.028}));
      for(let i=0;i<8;i++)for(let j=0;j<3;j++)if(!(i&(1<<j)))edges.push({id:`frame-${i}-${j}`,a:vertices[i],b:vertices[i|(1<<j)],color:C.gray,width:1.2,opacity:.48,hiddenOpacity:.18});
      [m.B1,m.B2,m.B3].forEach((B,i)=>edges.push({id:'axis-'+i,a:m.O,b:B,color:C.ink,width:2,occlude:false}));
      edges.push({id:'OA',a:m.O,b:m.A,color:C.target,width:4.2,occlude:false},{id:'AP',a:m.A,b:m.P,color:C.blue,width:3.6,occlude:false});
      [m.B1,m.B2,m.B3].forEach((B,i)=>{edges.push({id:'unit-'+i,a:m.A,b:B,color:C.green,width:2.6,occlude:false});annotations.push({id:'unit-label-'+i,at:middle(m.A,B),tex:'1',color:C.green,size:19,priority:65});});
      const e=Math.min(m.c*.18,.15);
      [[0,1],[0,2],[1,2]].forEach(([i,j])=>{const q=[0,0,0],r=[0,0,0],v=[0,0,0];q[i]=e;r[i]=e;r[j]=e;v[j]=e;edges.push({id:`right-${i}-${j}-a`,a:q,b:r,color:C.gray,width:1,occlude:false},{id:`right-${i}-${j}-b`,a:r,b:v,color:C.gray,width:1,occlude:false});});
      points.push({id:'O',at:m.O,label:'O',color:C.ink,priority:95,occlude:false});
      [m.B1,m.B2,m.B3].forEach((at,i)=>points.push({id:'B'+(i+1),at,label:['B₁','B₂','B₃'][i],color:C.ink,priority:90,occlude:false}));
      points.push({id:'A',at:m.A,label:m.ap<1e-9?'A = P':'A',color:C.target,priority:98,occlude:false});
      if(m.ap>=1e-9)points.push({id:'P',at:m.P,label:'P',color:C.blue,priority:94,occlude:false});
      else if(constructionStep!==null&&constructionStep<2)points.push({id:'P',at:m.P,label:'P',color:C.blue,priority:94,occlude:false});
      annotations.push({id:'OA-label',at:middle(m.O,m.A),tex:'OA',color:C.target,priority:100,size:22});
      if(m.ap>.14)annotations.push({id:'AP-label',at:middle(m.A,m.P),tex:'AP',color:C.blue,priority:85,size:19});
      if(constructionStep===null)return {points,edges,faces,annotations};
      const visible=(step)=>constructionStep>=step;
      return {
        points:points.filter(point=>visible(point.id==='A'?2:point.id==='P'?1:0)),
        edges:edges.filter(edge=>visible(edge.id==='OA'?4:edge.id==='AP'?3:edge.id.startsWith('unit-')?2:edge.id.startsWith('frame-')?1:0)),
        faces:visible(1)?faces:[],
        annotations:annotations.filter(label=>visible(label.id==='OA-label'?4:label.id==='AP-label'?3:2)),
      };
    }
    function render() {
      const m=model(),C=Lab.C;slider.value=state.s;host.querySelector('#q10-s-value').textContent=Lab.fmt(m.ap,3);
      const sceneKey=state.s+'|'+constructionStep;
      if(geometryKey!==sceneKey){geometryKey=sceneKey;viewport.setScene(sceneFor(m));}else viewport.render();
      if(readoutKey===state.s)return;readoutKey=state.s;
      host.querySelector('#q10-readout').innerHTML=`<span style="color:${C.green}">${M.inline('AB_1=AB_2=AB_3=1')}</span><span class="target">${M.inline(String.raw`OA\approx${Lab.fmt(m.oa)}`)}</span><span style="color:${C.blue}">${M.inline(String.raw`AP\approx${Lab.fmt(m.ap)}`)}</span><span class="aux">${M.inline('2OA^2+AP^2=3')}</span>${M.answer(M.inline(String.raw`OA\in\left[1,\sqrt{\dfrac32}\right]`))}<small>拖动 ${M.inline('AP')} 改变构型；拖动图形只改变视角。图中是一族满足条件的例子。</small>`;
    }
    slider.addEventListener('input',()=>{state.s=+slider.value;render();});
    host.querySelector('#q10-ap0').onclick=()=>{state.s=0;render();};host.querySelector('#q10-ap1').onclick=()=>{state.s=1;render();};host.querySelector('#q10-view').onclick=()=>viewport.resetView();
    render();return {
      render,
      reset(){state={...initial};if(constructionStep!==null)constructionStep=0;viewport.resetView();render();host.dispatchEvent(new Event('constructionchange'));},
      getConstructionSteps(){return constructionSteps;},
      getConstructionStep(){return constructionStep;},
      setConstructionStep(index){constructionStep=index===null?null:Math.max(0,Math.min(constructionSteps.length-1,Math.trunc(Number(index)||0)));render();},
      getState(){return {...state,...model(),space:viewport.getState()};},
      destroy(){viewport.destroy();},
    };
  }
};
