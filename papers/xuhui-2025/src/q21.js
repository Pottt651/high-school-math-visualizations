Problems[21]={
  title:'T 类数：把导函数连续代入两次',
  statement:`记 ${M.inline(String.raw`g=f'`)}。若 ${M.inline('y_0=g(x_0)')} 且 ${M.inline(String.raw`g(x_0)g(y_0)\ge0`)}，则称 ${M.inline('x_0')} 为 ${M.inline('f')} 的一个“<span class="target">T 类数</span>”。<span class="statement-part">（1）${M.inline(String.raw`f(x)=\sin x`)}：判断 ${M.inline(String.raw`\frac\pi2,\frac{3\pi}4`)}；（2）${M.inline('g')} 在 ${M.inline(String.raw`\mathbb R`)} 上连续，若 T 类集 ${M.inline(String.raw`S\subsetneq\mathbb R`)}，证明 ${M.inline('g')} 有零点；（3）${M.inline(String.raw`f(x)=-\frac1\omega\cos(\omega x+\varphi),\ \omega>0`)}，求 T 类集为 ${M.inline(String.raw`\mathbb R`)} 时 <span class="target">${M.inline(String.raw`\omega`)} 的最大值</span>。</span>`,
  mount(host){
    const C=Lab.C;let mode='sine',omegaPi=1,phiPi=0,tPi=.25,step=null,plot,drag=false;
    const show=n=>step===null||step>=n,model=()=>XuhuiMath.tDefinition({mode,omegaPi,phiPi,tPi});
    const segments=(g,lo,hi)=>Array.from({length:160},(_,i)=>{const a=lo+(hi-lo)*i/160,b=lo+(hi-lo)*(i+1)/160;return [[a,g(a)],[b,g(b)]];});
    const steps=()=>[
      {title:'画导函数，先确定第一次代入',body:`令 ${M.inline(String.raw`g=f'`)}。当前 ${M.inline(mode==='cosine'?String.raw`g(x)=\cos x`:String.raw`g(x)=\sin(\omega x+\varphi)`)}，左图画的是导函数，不是原函数 ${M.inline('f')}。`},
      {title:'选 x₀，从曲线上读出 y₀',body:`从横轴 ${M.inline('x_0')} 竖直到导函数曲线，得到 ${M.inline('y_0=g(x_0)')}。题目里的 ${M.inline('y_0')} 就是第一次的输出。`},
      {title:'把 y₀ 放到新的横轴上',body:`第二次要算 ${M.inline('g(y_0)')}，所以把 ${M.inline('y_0')} 当横坐标。两种导函数的值域都是 ${M.inline('[-1,1]')}，右图只需完整考察这一段输入。`},
      {title:'再次代入，再判断两次输出是否同号',body:`右图点为 ${M.inline('(y_0,g(y_0))')}。它落在第一或第三象限，或坐标轴上，就有 ${M.inline(String.raw`y_0g(y_0)\ge0`)}；这正是当前 ${M.inline('x_0')} 成为 T 类数的条件。`},
      {title:'从一个候选走向所有实数',body:`因为第一次输出遍历整个 ${M.inline('[-1,1]')}，T 类集为全体实数等价于右侧这段曲线全部满足 ${M.inline(String.raw`t\,g(t)\ge0`)}。绿色区域是允许区域，红色曲线段给出不满足的输入；最后仍用解析条件判断整个区间。`}
    ];
    host.innerHTML=`<div class="controls"><label>函数 <select id="x21-mode"><option value="sine">（3）正弦导函数</option><option value="cosine">（1）余弦导函数</option></select></label><label id="x21-w-label">${M.inline(String.raw`\frac\omega\pi`)} <input id="x21-w" aria-label="频率与π的比值" type="range" min="0.1" max="1.8" step="0.01" value="1"><output id="x21-w-value"></output></label><label id="x21-phi-label">${M.inline(String.raw`\frac\varphi\pi`)} <input id="x21-phi" aria-label="相位与π的比值" type="range" min="0" max="2" step="0.01" value="0"><output id="x21-phi-value"></output></label><label>沿曲线移动 ${M.inline('x_0')} <input id="x21-x" aria-label="沿导函数移动候选点" type="range" min="-1" max="1" step="0.01" value="0.25"></label><button id="x21-boundary">最大频率</button><button id="x21-witness">定位反例</button><span id="x21-cos-presets" class="preset-group" hidden><button data-x="0.5">${M.inline(String.raw`\frac\pi2`)}</button><button data-x="0.75">${M.inline(String.raw`\frac{3\pi}4`)}</button></span></div><div class="figures"><svg id="x21-first" class="figure" role="img" aria-label="第一次代入导函数，从x0得到y0"></svg><svg id="x21-second" class="figure" role="img" aria-label="第二次以y0为横坐标代入，在完整值域上判断同号"></svg></div><div class="readout" id="x21-readout"></div><div class="explain">
      <section class="proof-step"><h3>新定义其实是函数复合</h3>${M.block(String.raw`y_0=g(x_0),\qquad y_0g(y_0)\ge0`)}<p>第二次代入的输入是第一次输出。右图的横坐标是 ${M.inline('y_0')}，其范围由 ${M.inline('g')} 的完整值域决定。</p></section>
      <section class="proof-step"><h3>第一问：余弦输出再进余弦</h3><p>${M.inline(String.raw`g(x)=\cos x`)}。${M.inline(String.raw`x=\frac\pi2`)} 时第一次输出为 ${M.inline('0')}，乘积为零，属于 T 类数。${M.inline(String.raw`x=\frac{3\pi}4`)} 时第一次输出为负，但 ${M.inline(String.raw`\cos t>0\ (|t|\le1)`)}，乘积为负，不属于 T 类数。其完整 T 类集为 ${M.inline(String.raw`\{x:\cos x\ge0\}`)}。</p></section>
      <section class="proof-step"><h3>第二问：连续且无零点就必同号</h3><p>反设 ${M.inline('g')} 在 ${M.inline(String.raw`\mathbb R`)} 上没有零点。由连续性，它只能恒正或恒负，因而 ${M.inline('g(x)')} 和 ${M.inline('g(g(x))')} 总同号，得到 ${M.inline(String.raw`S=\mathbb R`)}，与真子集条件矛盾。</p><p class="proof-note">原题 ${M.inline(String.raw`S\subset\mathbb R`)} 在此表示真子集；如果允许 ${M.inline(String.raw`S=\mathbb R`)}，这条结论就不成立。</p></section>
      <section class="proof-step"><h3>第三问：把全称条件换到固定区间</h3><p>${M.inline(String.raw`g(x)=\sin(\omega x+\varphi)`)}，因 ${M.inline(String.raw`\omega>0`)}，其值域恰为 ${M.inline('[-1,1]')}。故</p>${M.block(String.raw`S=\mathbb R\iff t\sin(\omega t+\varphi)\ge0\quad\forall t\in[-1,1]`)}<p>左图的一段周期只是可供操作的窗口；右图的 ${M.inline('[-1,1]')} 才是完整的第一次输出范围。</p></section>
      <section class="proof-step"><h3>原点两侧限制相位</h3><p>当 ${M.inline(String.raw`t\to0^+`)} 时要求正弦非负，当 ${M.inline(String.raw`t\to0^-`)} 时要求非正。由连续性 ${M.inline(String.raw`\sin\varphi=0`)}。若 ${M.inline(String.raw`\varphi=(2k+1)\pi`)}，小的正 ${M.inline('t')} 会使第二次输出为负，故只能</p>${M.block(String.raw`\varphi=2k\pi,\qquad k\in\mathbb Z`)}</section>
      <section class="proof-step"><h3>频率的最大值来自第一次越过零点</h3><p>此时正半轴需要 ${M.inline(String.raw`\sin(\omega t)\ge0\ (0<t\le1)`)}，充要为 ${M.inline(String.raw`0<\omega\le\pi`)}；负半轴由奇性同时满足。若 ${M.inline(String.raw`\omega>\pi`)}，取</p>${M.block(String.raw`\frac\pi\omega<t<\min\left\{\frac{2\pi}\omega,1\right\}`)}<p>便得反例。因此 <span class="target">${M.inline(String.raw`\omega_{\max}=\pi`)}</span>。${M.inline(String.raw`\omega=\pi`)} 时 ${M.inline(String.raw`t=\pm1`)} 的乘积为零，仍允许。</p><p>${M.inline(String.raw`0<\omega\le\pi`)} 时 ${M.inline(String.raw`A=2\pi\mathbb Z`)}；${M.inline(String.raw`\omega>\pi`)} 时 ${M.inline(String.raw`A=\varnothing`)}。</p></section></div>`;
    const first=host.querySelector('#x21-first'),second=host.querySelector('#x21-second'),xrange=host.querySelector('#x21-x');
    function render(){
      const z=model(),cos=mode==='cosine',xmin=cos?-Math.PI:(-1-phiPi)/omegaPi,xmax=cos?Math.PI:(1-phiPi)/omegaPi;
      host.querySelector('#x21-w-label').hidden=cos;host.querySelector('#x21-phi-label').hidden=cos;host.querySelector('#x21-boundary').hidden=cos;host.querySelector('#x21-cos-presets').hidden=!cos;
      host.querySelector('#x21-w').value=omegaPi;host.querySelector('#x21-phi').value=phiPi;host.querySelector('#x21-w-value').textContent=Lab.fmt(omegaPi,2);host.querySelector('#x21-phi-value').textContent=Lab.fmt(phiPi,2);xrange.value=tPi;
      host.querySelector('#x21-witness').disabled=z.universal;
      const leftSegments=segments(z.g,xmin,xmax),rightSegments=segments(z.g,-1,1);
      const p=Lab.plot(first,{xmin:xmin-.10*(xmax-xmin),xmax:xmax+.10*(xmax-xmin),ymin:-1.65,ymax:1.7,equal:false,pad:44});plot=p;
      p.axes({y:'g(x)'});p.curve(z.g,xmin,xmax,{stroke:C.blue,width:2.5});
      p.screenText(13,25,'① 第一次：从 x₀ 读出 y₀',{size:17});
      if(show(1)){
        p.line([z.x,0],[z.x,z.u],{stroke:C.gold,dash:'5 4',width:1.6});p.line([z.x,z.u],[Math.max(xmin,Math.min(xmax,0)),z.u],{stroke:C.gold,dash:'5 4',width:1.4});p.dot([z.x,z.u],'',C.gold);p.math([z.x,0],'x_0',{color:C.gold,dy:z.u>=0?23:-16,anchor:'middle',avoidSegments:leftSegments});p.math([z.x,z.u],'y_0=g(x_0)',{color:C.gold,dx:12,dy:z.u>=0?-16:26,size:18,avoidSegments:leftSegments});
        p.screenMath(13,p.h-14,String.raw`x_0\approx${M.number(z.x,3)},\quad y_0\approx${M.number(z.u,3)}`,{size:17,color:C.gold});
      }
      p.finish();
      const q=Lab.plot(second,{xmin:-1.3,xmax:1.3,ymin:-1.65,ymax:1.7,equal:false,pad:44});
      q.screenText(13,25,show(2)?'② 第二次：用 y₀ 作输入':'下一步：把输出放到新的横轴上',{size:17,color:show(2)?C.ink:C.gray});
      if(show(2)){
        if(show(3)){q.poly([[0,0],[1,0],[1,1.15],[0,1.15]],{fill:C.green,opacity:.13,stroke:'none'});q.poly([[-1,0],[0,0],[0,-1.15],[-1,-1.15]],{fill:C.green,opacity:.13,stroke:'none'});}
        q.axes({x:'t = y₀',y:'g(t)',stepX:.5,stepY:.5});q.line([-1,0],[1,0],{stroke:C.gold,width:2.5});q.dot([z.u,0],'',C.gold);q.math([z.u,0],'y_0',{color:C.gold,dy:26,anchor:'middle',size:19,avoidSegments:rightSegments});
        q.line([-1,-1.15],[-1,1.15],{stroke:C.gray,width:1,dash:'4 5'});q.line([1,-1.15],[1,1.15],{stroke:C.gray,width:1,dash:'4 5'});
      }
      if(show(3)){
        q.curve(z.g,-1,1,{stroke:C.blue,width:2.5});q.line([z.u,0],[z.u,z.v],{stroke:C.target,dash:'5 4',width:1.8});q.dot([z.u,z.v],'',C.target);q.math([z.u,z.v],'g(y_0)',{color:C.target,dy:z.v>=0?-18:26,dx:12,size:19,avoidSegments:rightSegments});
        if(show(4))q.curve(t=>t*z.g(t)<-1e-13?z.g(t):NaN,-1,1,{stroke:C.target,width:3.5,n:600});
        q.screenMath(13,q.h-14,String.raw`y_0g(y_0)\approx${M.number(z.product,4)}`,{size:19,color:C.target});
      }
      q.finish();
      const result=z.product===0?'乘积为 0，允许':z.isT?'同号，属于 T 类数':'异号，不属于 T 类数';
      host.querySelector('#x21-readout').innerHTML=`<span class="target">当前候选：${result}</span>${!cos?`<span>${z.universal?'整个 T 类集为 ℝ':'整个 T 类集不等于 ℝ'}</span>`:''}${M.answer(cos?`（1）${M.inline(String.raw`\frac\pi2`)} 是，${M.inline(String.raw`\frac{3\pi}4`)} 不是；（2）${M.inline(String.raw`M\ne\varnothing`)}。`:`（3）${M.inline(String.raw`\omega_{\max}=\pi`)}，可取 ${M.inline(String.raw`\varphi=2k\pi\ (k\in\mathbb Z)`)}。`)}<small>${cos?'绿色区域表示 t 与 g(t) 同号（含坐标轴）；这里 g(t)=cos t 在整个 [−1,1] 恒正。':'全区间判断依据解析条件：相位为偶数倍 π，且 0<ω≤π；红色曲线段用来定位反例。'}</small>`;
    }
    function restart(){if(step!==null)step=0;host.dispatchEvent(new Event('constructionchange'));}
    host.querySelector('#x21-mode').onchange=e=>{mode=e.target.value;tPi=mode==='cosine'?.5:.25;restart();render();};
    host.querySelector('#x21-w').oninput=e=>{omegaPi=+e.target.value;render();};host.querySelector('#x21-phi').oninput=e=>{phiPi=+e.target.value;render();};xrange.oninput=()=>{tPi=+xrange.value;render();};
    host.querySelector('#x21-boundary').onclick=()=>{omegaPi=1;phiPi=0;tPi=.5;render();};
    host.querySelector('#x21-witness').onclick=()=>{if(mode==='cosine')tPi=.75;else{const u=XuhuiMath.witness(omegaPi,phiPi);if(u!==null)tPi=Math.asin(u)/Math.PI;}render();};
    host.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{tPi=+b.dataset.x;render();});
    function move(e){const [x]=plot.fromEvent(e);tPi=mode==='cosine'?x/Math.PI:omegaPi*x+phiPi;tPi=Math.max(-1,Math.min(1,tPi));render();}
    first.onpointerdown=e=>{if(!show(1))return;const z=model(),a=plot.to([z.x,z.u]),b=plot.to(plot.fromEvent(e));if(Math.hypot(a[0]-b[0],a[1]-b[1])>26)return;drag=true;first.setPointerCapture(e.pointerId);};first.onpointermove=e=>{if(drag)move(e);};first.onpointerup=()=>drag=false;first.onpointercancel=()=>drag=false;
    render();return{render,getConstructionSteps:steps,getConstructionStep:()=>step,setConstructionStep(i){step=i===null?null:Math.max(0,Math.min(4,i));render();},reset(){mode='sine';omegaPi=1;phiPi=0;tPi=.25;host.querySelector('#x21-mode').value=mode;restart();render();},getState(){const z=model();return {mode,omegaPi,phiPi,tPi,x:z.x,y:z.u,second:z.v,product:z.product,isT:z.isT,universal:z.universal};}};
  }
};
