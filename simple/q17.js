Problems[17] = {
  title: '斜三棱柱：高与辅助线',
  statement: `三棱柱 ${M.inline('ABC-A_1B_1C_1')} 中，${M.inline('AB=AC')}，侧面 ${M.inline('BB_1C_1C')} 垂直于底面 ${M.inline('ABC')}；${M.inline('E,F')} 分别为 ${M.inline('BC,A_1C_1')} 的中点。<span class="statement-part">（1）底面为边长 ${M.inline('2')} 的正三角形，${M.inline('CC_1=2')}，${M.inline('CC_1')} 与底面所成角为 ${M.inline(String.raw`60^\circ`)}，求 <span class="target">体积 ${M.inline('V')}</span>。</span><span class="statement-part">（2）证明 <span class="target">${M.inline(String.raw`EF\parallel\text{平面}\,AA_1B_1B`)}</span>。</span>`,
  mount(host) {
    const initial={part:1,shift:.7,height:1.45,base:1.4,yaw:.48,pitch:.48};let state={...initial},geometryKey='',readoutKey='',proofPart=0,constructionStep=null;
    const constructionSteps={
      1:[
        {title:'先画正三角形底面',body:`第一问给定底面是边长 ${M.inline('2')} 的正三角形。先画 ${M.inline(String.raw`\triangle ABC`)}，在底边上标出已知长度；此时还没有画上底面或侧棱。`},
        {title:'把侧棱与线面角落到图上',body:`侧面 ${M.inline('BB_1C_1C')} 垂直于底面，因此 ${M.inline('CC_1')} 的底面投影沿 ${M.inline('BC')} 所在直线。画长为 ${M.inline('2')} 的侧棱 ${M.inline('CC_1')}，使它与投影方向成 ${M.inline(String.raw`60^\circ`)}，投影端点记为 ${M.inline('H')}。`},
        {title:'平移底面，补全三棱柱',body:`三棱柱的上下底面互为平移。沿 ${M.inline(String.raw`\overrightarrow{CC_1}`)} 平移 ${M.inline('A,B')} 得到 ${M.inline('A_1,B_1')}，连接对应点和上底面的三条边，补全 ${M.inline('ABC-A_1B_1C_1')}。`},
        {title:'作出垂直高',body:`从 ${M.inline('C_1')} 向底面作垂线 ${M.inline('C_1H')}，标出直角。直角三角形 ${M.inline('CC_1H')} 给出 ${M.inline(String.raw`h=CC_1\sin60^\circ=\sqrt3`)}，而 ${M.inline(String.raw`CH=CC_1\cos60^\circ=1`)}；侧棱与高分别是蓝线和金线。`},
        {title:'把底面积与高连接到体积',body:`正三角形的底面积为 ${M.inline(String.raw`S_{\text{底}}=\dfrac{\sqrt3}{4}\cdot2^2=\sqrt3`)}。图中已有垂直高，因此 ${M.inline(String.raw`V=S_{\text{底}}h=3`)}；最后用红色标出所求体积。`},
      ],
      2:[
        {title:'从等腰底面开始',body:`公共题设给出 ${M.inline('AB=AC')}。先画等腰底面 ${M.inline('ABC')}，用相同短线标记两腰相等；第二问不沿用第一问的边长、侧棱长或 ${M.inline(String.raw`60^\circ`)}。`},
        {title:'按侧面条件补出一般棱柱',body:`侧面 ${M.inline('BB_1C_1C')} 垂直于底面。将 ${M.inline('ABC')} 平移到 ${M.inline('A_1B_1C_1')} 并连对应点；改变高和水平偏移仍保持这一垂直关系。`},
        {title:'按题设标出两个中点',body:`${M.inline('E')} 是 ${M.inline('BC')} 的中点，${M.inline('F')} 是 ${M.inline('A_1C_1')} 的中点。先在相应边上标出这两点，注意它们分别位于下底面和上底面。`},
        {title:'标出要研究的线与面',body:`连接 ${M.inline('E,F')} 得到红色目标线，并用蓝色标出平面 ${M.inline('AA_1B_1B')}。目标是证明这条线平行于该平面，需要在平面内找到一条与 ${M.inline('EF')} 平行的线。`},
        {title:'增加辅助中点 D',body:`取 ${M.inline('AB')} 的中点 ${M.inline('D')}，连接 ${M.inline('ED')}，同时标出 ${M.inline('FA_1')}。中位线关系给出 ${M.inline(String.raw`ED\parallel CA`)}、${M.inline(String.raw`ED=\dfrac{CA}{2}`)}；${M.inline('FA_1')} 与它同向且等长。`},
        {title:'连出目标平面内的平行线',body:`连接绿色 ${M.inline('DA_1')}。由 ${M.inline('ED')} 与 ${M.inline('FA_1')} 平行且相等，${M.inline('EDA_1F')} 是平行四边形，故 ${M.inline(String.raw`EF\parallel DA_1`)}。${M.inline('DA_1')} 在目标平面内，且 ${M.inline('E')} 不在该平面内，得到所求线面平行关系。`},
      ],
    };
    host.innerHTML=`<div class="controls"><label>小问 <select id="q17-part"><option value="1">（1）侧棱与高</option><option value="2">（2）寻找平行线</option></select></label><label id="q17-shift-control">上底水平偏移 <input id="q17-shift" type="range" min="-0.8" max="1.4" step="0.02" value="0.7"></label><label id="q17-height-control">高 <input id="q17-height" type="range" min="0.6" max="2.1" step="0.02" value="1.45"></label><button id="q17-view">恢复视角</button><button id="q17-side">侧面正视</button><span class="hint">拖动旋转 · 滚轮缩放</span></div><div class="figures"><svg class="main-figure" id="q17-svg" role="img" aria-label="可旋转的斜三棱柱，观察垂直高和中点辅助线"></svg></div><div class="readout" id="q17-readout"></div><div class="explain" id="q17-explain"></div>`;
    const svg=host.querySelector('#q17-svg'),part=host.querySelector('#q17-part'),shift=host.querySelector('#q17-shift'),height=host.querySelector('#q17-height');
    const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mid=(a,b)=>a.map((v,i)=>(v+b[i])/2),norm=a=>Math.hypot(...a);
    function model(){const one=state.part===1,v=one?[1,0,Math.sqrt(3)]:[state.shift,0,state.height],A=[0,one?Math.sqrt(3):state.base,0],B=[-1,0,0],C=[1,0,0],A1=add(A,v),B1=add(B,v),C1=add(C,v),E=mid(B,C),F=mid(A1,C1),D=mid(A,B),H=[C1[0],C1[1],0];return {A,B,C,A1,B1,C1,E,F,D,H,v,height:v[2],baseArea:A[1],volume:A[1]*v[2],side:norm(v),ef:sub(F,E),da1:sub(A1,D)};}
    const viewport=Space.create(svg,{center:[.35,.55,.88],span:3.85,view:initial,onViewChange:next=>{state.yaw=next.yaw;state.pitch=next.pitch;}});
    function sceneFor(m,reveal){
      const C=Lab.C,one=state.part===1,points=[],edges=[],faces=[],annotations=[];
      const emphasizeTarget=!one&&(constructionStep===null||constructionStep>=3);
      faces.push({id:'base',vertices:[m.A,m.B,m.C],color:C.green,opacity:one?.11:.05},
        {id:'top',vertices:[m.A1,m.C1,m.B1],color:C.ink,opacity:.055},
        {id:'target-plane',vertices:[m.A,m.A1,m.B1,m.B],color:emphasizeTarget?C.blue:C.ink,opacity:emphasizeTarget?.23:.055},
        {id:'vertical-side',vertices:[m.B,m.B1,m.C1,m.C],color:C.ink,opacity:.055},
        {id:'other-side',vertices:[m.C,m.C1,m.A1,m.A],color:C.ink,opacity:.055});
      [['AB',m.A,m.B],['BC',m.B,m.C],['CA',m.C,m.A],['A1B1',m.A1,m.B1],['B1C1',m.B1,m.C1],['C1A1',m.C1,m.A1],['AA1',m.A,m.A1],['BB1',m.B,m.B1],['CC1',m.C,m.C1]].forEach(([id,a,b])=>edges.push({id,a,b,color:one&&id==='CC1'?C.blue:C.ink,width:one&&id==='CC1'?3.5:2,hiddenOpacity:.38}));
      [['A',m.A],['B',m.B],['C',m.C],['A₁',m.A1],['B₁',m.B1],['C₁',m.C1]].forEach(([id,at])=>points.push({id,at,label:id,color:one&&id==='C₁'?C.blue:C.ink,priority:85}));
      if(one){
        edges.push({id:'projection',a:m.C,b:m.H,color:C.gray,width:1.7,dash:'4 4'}, {id:'height',a:m.C1,b:m.H,color:C.gold,width:3.4,hiddenOpacity:.6});
        const r=.13;edges.push({id:'right-a',a:[m.H[0]-r,0,0],b:[m.H[0]-r,0,r],color:C.gold,width:1.4},{id:'right-b',a:[m.H[0]-r,0,r],b:[m.H[0],0,r],color:C.gold,width:1.4});
        const arc=Array.from({length:19},(_,i)=>{const a=Math.PI/3*i/18;return [m.C[0]+.39*Math.cos(a),0,.39*Math.sin(a)];});
        for(let i=1;i<arc.length;i++)edges.push({id:'angle-'+i,a:arc[i-1],b:arc[i],color:C.gold,width:1.6});
        points.push({id:'H',at:m.H,label:'H',color:C.gold,priority:88});
        annotations.push({id:'side-length',at:mid(m.C,m.C1),tex:'2',color:C.blue,size:20,priority:90},
          {id:'height-value',at:mid(m.C1,m.H),tex:String.raw`h=\sqrt3`,color:C.gold,size:20,priority:94},
          {id:'projection-value',at:mid(m.C,m.H),tex:'1',color:C.gray,size:18,priority:65},
          {id:'angle-value',at:[m.C[0]+.55,0,.25],tex:String.raw`60^\circ`,color:C.gold,size:18,priority:70,dx:-12,dy:0},
          {id:'base-area',at:[0,m.A[1]/3,0],tex:String.raw`S_{\text{底}}=\sqrt3`,color:C.green,size:18,priority:75,hideWhenEdgeOn:'base'},
          {id:'volume',at:[.45,m.A[1]/3,m.height*.57],tex:'V=3',color:C.target,size:24,priority:105});
      }else{
        edges.push({id:'EF',a:m.E,b:m.F,color:C.target,width:4.2,hiddenOpacity:.8});
        points.push({id:'E',at:m.E,label:'E',color:C.target,priority:100},{id:'F',at:m.F,label:'F',color:C.target,priority:100});
        annotations.push({id:'EF-label',at:mid(m.E,m.F),tex:'EF',color:C.target,size:22,priority:105});
        if(reveal||constructionStep!==null){
          faces.push({id:'parallelogram',vertices:[m.E,m.D,m.A1,m.F],color:C.green,opacity:.065,occluder:false});
          edges.push({id:'DA1',a:m.D,b:m.A1,color:C.green,width:3.4,hiddenOpacity:.65},{id:'ED',a:m.E,b:m.D,color:C.gold,width:2.6,hiddenOpacity:.55},{id:'FA1',a:m.F,b:m.A1,color:C.gold,width:2.6,hiddenOpacity:.55});
          points.push({id:'D',at:m.D,label:'D',color:C.gold,priority:95});annotations.push({id:'DA1-label',at:mid(m.D,m.A1),tex:'DA_1',color:C.green,size:20,priority:90});
        }
      }
      if(constructionStep===null)return {points,edges,faces,annotations};
      const visible=(step)=>constructionStep>=step;
      if(one){
        annotations.push({id:'given-base-length',at:mid(m.B,m.C),tex:'2',color:C.green,size:18,priority:65,dx:-7,dy:34});
        return {
          points:points.filter(point=>visible(point.id==='C₁'||point.id==='H'?1:point.id==='A₁'||point.id==='B₁'?2:0)),
          edges:edges.filter(edge=>visible(['AB','BC','CA'].includes(edge.id)?0:edge.id==='CC1'||edge.id==='projection'||edge.id.startsWith('angle-')?1:edge.id==='height'||edge.id.startsWith('right-')?3:2)),
          faces:faces.filter(face=>visible(face.id==='base'?0:2)),
          annotations:annotations.filter(label=>visible(label.id==='given-base-length'?0:label.id==='side-length'||label.id==='angle-value'?1:label.id==='height-value'||label.id==='projection-value'?3:4)),
        };
      }
      [[m.A,m.B],[m.A,m.C]].forEach(([a,b],i)=>{const at=mid(a,b),length=norm(sub(b,a)),cross=[-(b[1]-a[1])*.06/length,(b[0]-a[0])*.06/length,0];edges.push({id:'given-equal-'+i,a:sub(at,cross),b:add(at,cross),color:C.green,width:1.5,occlude:false});});
      return {
        points:points.filter(point=>visible(point.id==='D'?4:point.id==='E'||point.id==='F'?2:point.id.includes('₁')?1:0)),
        edges:edges.filter(edge=>visible(['AB','BC','CA'].includes(edge.id)||edge.id.startsWith('given-equal-')?0:edge.id==='EF'?3:edge.id==='DA1'?5:edge.id==='ED'||edge.id==='FA1'?4:1)),
        faces:faces.filter(face=>visible(face.id==='base'?0:face.id==='parallelogram'?5:1)),
        annotations:annotations.filter(label=>visible(label.id==='EF-label'?3:5)),
      };
    }
    function render(){
      const m=model(),one=state.part===1,C=Lab.C,reveal=document.body.classList.contains('show-key');part.value=state.part;shift.value=state.shift;height.value=state.height;host.querySelector('#q17-shift-control').hidden=one;host.querySelector('#q17-height-control').hidden=one;host.querySelector('#q17-side').hidden=!one;
      const key=[state.part,state.shift,state.height].join('|'),sceneKey=key+'|'+reveal+'|'+constructionStep;
      if(geometryKey!==sceneKey){geometryKey=sceneKey;viewport.setScene(sceneFor(m,reveal));}else viewport.render();
      if(readoutKey!==key){readoutKey=key;
      host.querySelector('#q17-readout').innerHTML=one?`<span style="color:${C.green}">${M.inline(String.raw`S_{\text{底}}=\sqrt3`)}</span><span style="color:${C.blue}">侧棱 ${M.inline('CC_1=2')}</span><span style="color:${C.gold}">高 ${M.inline(String.raw`h=\sqrt3`)}</span>${M.answer('（1）体积 '+M.inline('V=3'))}<small>${M.inline(String.raw`\triangle CC_1H`)} 是线面角所在的直角三角形。旋转视角，侧棱和高的真实长度不会改变。</small>`:`<span>高 ${M.inline(String.raw`h\approx${Lab.fmt(m.height,2)}`)}</span><span>上底水平偏移 ${M.inline(Lab.fmt(state.shift,2))}</span><span class="aux target">${M.inline(String.raw`|EF|\approx${Lab.fmt(norm(m.ef))}`)}</span><span class="aux" style="color:${C.green}">${M.inline(String.raw`|DA_1|\approx${Lab.fmt(norm(m.da1))}`)}</span>${M.answer('（2）'+M.inline(String.raw`EF\parallel\text{平面}\,AA_1B_1B`))}<small>第二问为一般构型，不沿用第一问的边长与 ${M.inline(String.raw`60^\circ`)}。显示关键关系后，观察绿色 ${M.inline('DA_1')} 与红色 ${M.inline('EF')}。</small>`;

      }
      if(proofPart!==state.part){proofPart=state.part;
      host.querySelector('#q17-explain').innerHTML=one?`<section class="proof-step"><h3>先求垂直高</h3><p>侧面 ${M.inline('BB_1C_1C')} 垂直于底面，所以侧棱在底面内的投影沿 ${M.inline('BC')} 所在直线。</p>${M.block(String.raw`h=CC_1\sin60^\circ=2\cdot\dfrac{\sqrt3}{2}=\sqrt3`)}</section><section class="proof-step"><h3>底面积乘垂直高</h3><div class="target">${M.block(String.raw`V=S_{\text{底}}\,h=\dfrac{\sqrt3}{4}\cdot2^2\cdot\sqrt3=3`)}</div><p>${M.inline('H')} 可以落在底面三角形之外，仍然是 ${M.inline('C_1')} 到底面所在平面的垂足。</p></section>`:`<section class="proof-step"><h3>辅助线为什么选 ${M.inline('DA_1')}</h3><p>取 ${M.inline('AB')} 中点 ${M.inline('D')}。在 ${M.inline(String.raw`\triangle ABC`)} 中，${M.inline(String.raw`ED\parallel CA`)} 且 ${M.inline(String.raw`ED=\dfrac{CA}{2}`)}；又 ${M.inline(String.raw`FA_1\parallel CA`)} 且 ${M.inline(String.raw`FA_1=\dfrac{CA}{2}`)}，所以 ${M.inline('EDA_1F')} 是平行四边形，<span class="target">${M.inline(String.raw`EF\parallel DA_1`)}</span>。</p><p>${M.inline('DA_1')} 在平面 ${M.inline('AA_1B_1B')} 内，${M.inline('E')} 不在该平面内，故 <span class="target">${M.inline(String.raw`EF\parallel\text{平面}\,AA_1B_1B`)}</span>。</p></section><section class="proof-step"><h3>用向量解释同一关系</h3><p>设侧棱向量为 ${M.inline(String.raw`\vec v`)}，则</p>${M.block(String.raw`\overrightarrow{EF}=\vec v+\dfrac12\overrightarrow{BA}=\overrightarrow{DA_1}`)}<p>拖动高和水平投影，这个等式仍然成立；证明只用了中点与棱柱的平移关系。</p></section>`;

      }
    }
    part.onchange=()=>{state.part=+part.value;if(constructionStep!==null)constructionStep=0;viewport.resetView();render();host.dispatchEvent(new Event('constructionchange'));};shift.oninput=()=>{state.shift=+shift.value;render();};height.oninput=()=>{state.height=+height.value;render();};host.querySelector('#q17-view').onclick=()=>viewport.resetView();host.querySelector('#q17-side').onclick=()=>viewport.setView({yaw:0,pitch:0,zoom:1});
    render();return {
      render,
      reset(){state={...initial};if(constructionStep!==null)constructionStep=0;viewport.resetView();render();host.dispatchEvent(new Event('constructionchange'));},
      getConstructionSteps(){return constructionSteps[state.part];},
      getConstructionStep(){return constructionStep;},
      setConstructionStep(index){constructionStep=index===null?null:Math.max(0,Math.min(constructionSteps[state.part].length-1,Math.trunc(Number(index)||0)));render();},
      getState(){return {...state,...model(),space:viewport.getState()};},
      destroy(){viewport.destroy();},
    };
  }
};
