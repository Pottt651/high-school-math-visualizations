Problems[10] = {
  title: '空间距离：哪些量一起变？',
  statement: `三个两两垂直的向量以 ${M.inline('O')} 为起点，终点为 ${M.inline('B_1,B_2,B_3')}，且 ${M.inline(String.raw`\overrightarrow{OP}=\overrightarrow{OB_1}+\overrightarrow{OB_2}+\overrightarrow{OB_3}`)}。已知 ${M.inline('AB_1=AB_2=AB_3=1')}，且 ${M.inline(String.raw`AP\le1`)}，求 <span class="target">${M.inline('OA')} 的范围</span>。`,
  mount(host) {
    const initial = { s: 0.55, yaw: -0.66, pitch: 0.36 };
    let state = { ...initial }, drag = null;
    host.innerHTML = `<div class="controls"><label>${M.inline('AP')} <input id="q10-s" type="range" min="0" max="1" step="0.005" value="0.55"> <output id="q10-s-value"></output></label><button id="q10-ap0">${M.inline('AP=0')}</button><button id="q10-ap1">${M.inline('AP=1')}</button><button id="q10-view">恢复视角</button><span class="hint">拖动图形旋转观察</span></div><div class="figures"><svg class="main-figure" id="q10-svg" role="img" aria-label="满足三个单位距离的空间构型，可拖动旋转"></svg></div><div class="readout" id="q10-readout"></div><div class="explain"><p><b>对任意合法构型：</b>设 ${M.inline('B_1=(p,0,0)')}、${M.inline('B_2=(0,q,0)')}、${M.inline('B_3=(0,0,r)')}，则 ${M.inline('P=(p,q,r)')}。展开三个单位距离的平方，相加后可得</p>${M.block(String.raw`\begin{aligned}AB_1^2+AB_2^2+AB_3^2&=3\\2OA^2+AP^2&=3\end{aligned}`)}<p>${M.inline(String.raw`0\le AP\le1`)}，所以 ${M.inline(String.raw`1\le OA^2\le\dfrac32`)}，即 <span class="target">${M.inline(String.raw`OA\in\left[1,\sqrt{\dfrac32}\right]`)}</span>。</p><p><b>图形还回答了“能否取到”：</b>此处展示一族对称的合法例子。令</p>${M.block(String.raw`\begin{aligned}s&=AP,\\t&=\sqrt{\dfrac{3-s^2}{6}},\\c&=t+\dfrac{s}{\sqrt3}.\end{aligned}`)}<p>取 ${M.inline('A=(t,t,t)')}，三个 ${M.inline('B_i')} 分别为 ${M.inline('(c,0,0)')}、${M.inline('(0,c,0)')}、${M.inline('(0,0,c)')}。此时</p>${M.block('AB_i^2=(t-c)^2+2t^2=1')}<p>拖动 ${M.inline('s')} 从 ${M.inline('0')} 到 ${M.inline('1')}，端点及全部中间值均可实现。一般恒等式证明范围，构造证明可达。</p></div>`;
    const svg = host.querySelector('#q10-svg'), slider = host.querySelector('#q10-s');
    const subtract = (a,b) => a.map((v,i)=>v-b[i]);
    const norm = a => Math.hypot(...a);
    function model() {
      const t=Math.sqrt((3-state.s*state.s)/6),c=t+state.s/Math.sqrt(3);
      const O=[0,0,0],A=[t,t,t],B1=[c,0,0],B2=[0,c,0],B3=[0,0,c],P=[c,c,c];
      return {t,c,O,A,B1,B2,B3,P,oa:norm(A),ap:norm(subtract(A,P)),unit:[B1,B2,B3].map(B=>norm(subtract(A,B)))};
    }
    function render() {
      const m=model(); slider.value=state.s; host.querySelector('#q10-s-value').textContent=Lab.fmt(m.ap,3);
      const p=Lab.plot(svg,{xmin:-1.35,xmax:1.35,ymin:-1.12,ymax:1.22,pad:36});
      const C=Lab.C,cy=Math.cos(state.yaw),sy=Math.sin(state.yaw),cp=Math.cos(state.pitch),sp=Math.sin(state.pitch);
      const project=q=>{const [x,y,z]=q.map(v=>v-m.c/2);return [x*cy-y*sy,z*cp-(x*sy+y*cy)*sp];};
      const line=(a,b,style)=>p.line(project(a),project(b),style);
      const middle=(a,b)=>a.map((v,i)=>(v+b[i])/2);
      for(let i=0;i<8;i++) for(let j=0;j<3;j++) if(!(i&(1<<j))) {
        const a=[0,1,2].map(k=>(i&(1<<k))?m.c:0),b=a.slice();b[j]=m.c;
        line(a,b,{stroke:C.gray,width:1,dash:'4 5',opacity:0.45});
      }
      [m.B1,m.B2,m.B3].forEach(B=>line(m.O,B,{stroke:C.ink,width:2}));
      line(m.O,m.A,{stroke:C.target,width:4}); line(m.A,m.P,{stroke:C.blue,width:3.5});
      [m.B1,m.B2,m.B3].forEach((B,i)=>{line(m.A,B,{stroke:C.green,width:2,dash:'5 4'});p.text(project(middle(m.A,B)),'1',{color:C.green,size:18,dx:7,dy:i===2?-8:15});});
      const e=Math.min(m.c*.18,.15);
      [[0,1],[0,2],[1,2]].forEach(([i,j])=>{const q=[0,0,0],r=[0,0,0],v=[0,0,0];q[i]=e;r[i]=e;r[j]=e;v[j]=e;line(q,r,{stroke:C.gray,width:1});line(r,v,{stroke:C.gray,width:1});});
      p.dot(project(m.O),'O',C.ink,-20,18);p.dot(project(m.B1),'B₁',C.ink,8,18);p.dot(project(m.B2),'B₂',C.ink,-28,16);p.dot(project(m.B3),'B₃',C.ink,-27,-9);
      if(m.ap<1e-9)p.dot(project(m.A),'A=P',C.target,11,-12);
      else{p.dot(project(m.P),'P',C.blue,11,-10);p.dot(project(m.A),'A',C.target,-23,-9);}
      p.text(project(middle(m.O,m.A)),'OA',{color:C.target,dx:-34,dy:-3,weight:700,size:20});
      if(m.ap>.17)p.text(project(middle(m.A,m.P)),'AP',{color:C.blue,dx:12,dy:4});
      p.screenText(16,25,'B₁、B₂、B₃ 在三个互相垂直的轴上',{color:C.gray,size:16});
      p.finish();
      host.querySelector('#q10-readout').innerHTML=`<span style="color:${C.green}">${M.inline('AB_1=AB_2=AB_3=1')}</span><span class="target">${M.inline(String.raw`OA\approx${Lab.fmt(m.oa)}`)}</span><span style="color:${C.blue}">${M.inline(String.raw`AP\approx${Lab.fmt(m.ap)}`)}</span><span class="aux">${M.inline('2OA^2+AP^2=3')}</span>${M.answer(M.inline(String.raw`OA\in\left[1,\sqrt{\dfrac32}\right]`))}<small>拖动 ${M.inline('AP')} 改变构型；拖动图形只改变视角。图中是一族满足条件的例子。</small>`;
    }
    slider.addEventListener('input',()=>{state.s=+slider.value;render();});
    host.querySelector('#q10-ap0').onclick=()=>{state.s=0;render();};host.querySelector('#q10-ap1').onclick=()=>{state.s=1;render();};host.querySelector('#q10-view').onclick=()=>{state.yaw=initial.yaw;state.pitch=initial.pitch;render();};
    svg.style.touchAction='none';svg.style.cursor='grab';
    svg.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,yaw:state.yaw,pitch:state.pitch};svg.setPointerCapture(e.pointerId);});
    svg.addEventListener('pointermove',e=>{if(!drag)return;state.yaw=drag.yaw+(e.clientX-drag.x)*.008;state.pitch=Math.max(-1.35,Math.min(1.35,drag.pitch+(e.clientY-drag.y)*.008));render();});
    svg.addEventListener('pointerup',()=>{drag=null;});svg.addEventListener('pointercancel',()=>{drag=null;});
    render();return {render,reset(){state={...initial};render();},getState(){return {...state,...model()};},destroy(){drag=null;}};
  }
};
