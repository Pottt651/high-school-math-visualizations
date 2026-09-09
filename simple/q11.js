Problems[11] = {
  title: '拱桥费用',
  statement: `半径为 ${M.inline('4\\,\\mathrm m')} 的圆弧桥面 ${M.inline('ACB')}，两端接与圆相切的直线段 ${M.inline('AD,BE')}。图示中 ${M.inline('D,O,E')} 在同一水平线上，桥关于 ${M.inline('OC')} 左右对称，坡角为 ${M.inline(String.raw`\angle ADO=\theta`)}。直线段每米 0.4 万元，圆弧每米 2.5 万元。${M.inline(String.raw`\theta\in\left[\arcsin\frac13,\frac\pi6\right]`)}，求使总费用最少的<span class="target">坡角</span>。〔原卷第 1 页〕`,
  mount(host) {
    const lo = Math.asin(1/3), hi = Math.PI/6, optimum = Math.asin(.4), C = Lab.C;
    let theta = lo, view = 'total', bridgePlot, costPlot, dragging = null, constructionStep = null;
    const show=step=>constructionStep===null||constructionStep>=step;
    const constructionSteps=[
      {title:'先画半径已知的参考圆',body:`桥面圆弧所在圆的半径为 ${M.inline('4\\,\\mathrm m')}。先画圆的上半部，标出圆心 ${M.inline('O')}、最高点 ${M.inline('C')} 和半径 ${M.inline('OC=4')}。浅色圆弧是定位用的参考线。`},
      {title:'在圆上确定桥面的两个端点',body:`取关于竖直半径对称的 ${M.inline('A,B')}，用经过 ${M.inline('C')} 的短弧连接，金色部分就是桥面 ${M.inline('ACB')}。连接 ${M.inline('OA,OB')}，两条半径均长 ${M.inline('4')}。`},
      {title:'按相切条件接上两段直桥',body:`过 ${M.inline('A,B')} 分别作垂直于半径的切线，与过 ${M.inline('O')} 的水平线交于 ${M.inline('D,E')}。保留 ${M.inline('AD,BE')}，并在 ${M.inline('D')} 处标出题设坡角 ${M.inline(String.raw`\theta`)}。`},
      {title:'从桥形读出两类长度',body:`${M.inline(String.raw`OA\perp AD`)}，所以 ${M.inline(String.raw`\angle AOC=\theta`)}；对称得到 ${M.inline(String.raw`\angle AOB=2\theta`)}。于是每段切线长 ${M.inline(String.raw`4\cot\theta`)}，弧长为 ${M.inline(String.raw`4\cdot2\theta=8\theta`)}（角用弧度）。`},
      {title:'把长度变成费用图',body:`将两段直线总长乘以 ${M.inline('0.4')}，圆弧长乘以 ${M.inline('2.5')}，得到 ${M.inline(String.raw`C(\theta)=\frac{16}{5}\cot\theta+20\theta`)}。右图横轴是坡角，纵轴是费用；寻找红色曲线的最低点，就是原题要求的坡角。`}
    ];
    host.innerHTML = `<div class="controls"><label style="color:${C.target}">坡角 ${M.inline(String.raw`\theta`)} <input id="q11-angle" type="range" min="${lo}" max="${hi}" step="0.0001" value="${lo}"></label><input id="q11-degrees" type="number" aria-label="坡角（度）" min="${lo*180/Math.PI}" max="30" step="0.01" value="${lo*180/Math.PI}"><span>°</span><label>费用图 <select id="q11-view"><option value="total">总费用局部放大</option><option value="parts">费用构成</option></select></label><button id="q11-best" class="aux">取费用最低的坡角</button></div>
    <div class="figures"><svg id="q11-bridge" class="figure" role="img" aria-label="圆弧及两端切线构成的拱桥；拖动切点调整坡角"></svg><svg id="q11-cost" class="figure" role="img" aria-label="直线段、圆弧和总费用随坡角变化的曲线"></svg></div>
    <div class="readout" id="q11-readout"></div>
    <div class="explain" id="q11-proof">
      <section class="proof-step"><h3>① 相切条件 → 两段直桥长度</h3>
        <p>图中 ${M.inline('D,O,E')} 共线且水平，${M.inline(String.raw`OA\perp AD`)}。在直角三角形 ${M.inline('OAD')} 中，坡角为 ${M.inline(String.raw`\angle ADO=\theta`)}，故</p>
        ${M.block(String.raw`\tan\theta=\frac{OA}{AD}=\frac4{AD}`)}
        ${M.block(String.raw`AD=BE=4\cot\theta`)}
        <p>左右对称，所以两段直桥总长为 <span class="blue">${M.inline(String.raw`L_{\text{直}}=8\cot\theta`)}</span> 米。</p>
      </section>
      <section class="proof-step"><h3>② 圆心角 → 圆弧长度</h3>
        <p>${M.inline('OC')} 垂直于水平线，${M.inline('OA')} 垂直于切线。因此 ${M.inline(String.raw`\angle AOC=\theta`)}，对称得 ${M.inline(String.raw`\angle AOB=2\theta`)}。</p>
        ${M.block(String.raw`L_{\text{弧}}=r\alpha=4\cdot2\theta=8\theta`)}
        <p class="proof-note">弧长公式中的 ${M.inline(String.raw`\theta`)} 必须用弧度。输入框和图上横轴用度，计算时先乘 ${M.inline(String.raw`\pi/180`)}。</p>
      </section>
      <section class="proof-step"><h3>③ 长度 × 单价 → 费用函数</h3>
        <p class="blue">直桥每米 0.4 万元：</p>
        ${M.block(String.raw`C_{\text{直}}=0.4\cdot8\cot\theta=\frac{16}{5}\cot\theta`)}
        <p class="gold">圆弧每米 2.5 万元：</p>
        ${M.block(String.raw`C_{\text{弧}}=2.5\cdot8\theta=20\theta`)}
        <div class="target">${M.block(String.raw`C(\theta)=\frac{16}{5}\cot\theta+20\theta`)}</div>
        <p>费用单位为万元，定义域为 ${M.inline(String.raw`\theta\in[\arcsin\frac13,\frac\pi6]`)}。红色总费用曲线就是两项相加的结果。</p>
      </section>
      <section class="proof-step"><h3>④ 代入当前坡角，逐项算费用</h3><div id="q11-worked"></div></section>
      <section class="proof-step"><h3>⑤ 求导并判断最小值</h3>
        ${M.block(String.raw`C'(\theta)=20-\frac{16}{5\sin^2\theta}`)}
        ${M.block(String.raw`C'(\theta)=0\ \Longrightarrow\ \sin^2\theta=\frac4{25}`)}
        <p>坡角是锐角，故 ${M.inline(String.raw`\sin\theta=\frac25`)}。又 ${M.inline(String.raw`\frac13<\frac25<\frac12`)}，临界点 ${M.inline(String.raw`\theta_* =\arcsin\frac25`)} 在定义域内部。其左侧导数为负、右侧为正，所以总费用先减后增。</p>
        <p>此时 ${M.inline(String.raw`\cos\theta_* =\frac{\sqrt{21}}5`)}，${M.inline(String.raw`\cot\theta_* =\frac{\sqrt{21}}2`)}，代回费用函数：</p>
        <div class="target">${M.block(String.raw`\begin{aligned}C_{\min}&=\frac{16}{5}\cdot\frac{\sqrt{21}}2+20\arcsin\frac25\\&=\frac{8\sqrt{21}}5+20\arcsin\frac25.\end{aligned}`)}</div>
        <p>最优坡角约 ${M.inline('23.578^\\circ')}，最低费用约 ${M.inline('15.562')} 万元。</p>
      </section>
    </div>`;
    const angle = host.querySelector('#q11-angle'), degrees = host.querySelector('#q11-degrees'), bridge = host.querySelector('#q11-bridge'), cost = host.querySelector('#q11-cost');
    const straight = t => 3.2/Math.tan(t), arc = t => 20*t, total = t => straight(t)+arc(t);
    function set(t) { if (!Number.isFinite(t)) return; theta = Math.max(lo, Math.min(hi,t)); render(); }
    function render() {
      angle.value=theta; degrees.value=+(theta*180/Math.PI).toFixed(3);
      // Establish the two-column layout before either SVG measures its viewport.
      cost.toggleAttribute('hidden',!show(4));
      const A=[-4*Math.sin(theta),4*Math.cos(theta)], B=[-A[0],A[1]], D=[-4/Math.sin(theta),0], E=[-D[0],0];
      const p = Lab.plot(bridge,{xmin:-13,xmax:13,ymin:-1.2,ymax:6.1,pad:30}); bridgePlot=p;
      if(constructionStep!==null){p.curve(x=>Math.sqrt(Math.max(0,16-x*x)),-4,4,{stroke:C.gray,width:1.3,dash:'5 5',opacity:.5});p.line([0,0],[0,4],{stroke:C.gray,dash:'5 5'});}
      if(constructionStep===0)p.text([0,2],'4 m',{color:C.gray,dx:14,size:16});
      if(show(2))p.line([-12.5,0],[12.5,0],{stroke:C.gray,width:1});
      if(show(1)){
      p.curve(x=>Math.sqrt(16-x*x),A[0],B[0],{stroke:C.gold,width:4});
      if(show(2)){p.line(D,A,{stroke:C.blue,width:4}); p.line(B,E,{stroke:C.blue,width:4});}
      p.line([0,0],A,{stroke:C.gray,dash:'5 5'});p.line([0,0],B,{stroke:C.gray,dash:'5 5'});
      }
      if(show(3)){
      p.add(`<polyline points="${Array.from({length:31},(_,i)=>{const a=Math.PI/2-theta+2*theta*i/30;return p.to([1.15*Math.cos(a),1.15*Math.sin(a)]).join(',');}).join(' ')}" fill="none" stroke="${C.target}" stroke-width="2.5"/>`);
      p.math([0,1.3],String.raw`2\theta`,{color:C.target,anchor:'middle',size:18});
      }
      if(show(2)){
      p.add(`<polyline points="${Array.from({length:21},(_,i)=>p.to([D[0]+1.7*Math.cos(theta*i/20),1.7*Math.sin(theta*i/20)]).join(',')).join(' ')}" fill="none" stroke="${C.target}" stroke-width="2.5"/>`);
      p.math([D[0]+2.15,.33],String.raw`\theta`,{color:C.target,size:20});
      p.dot(D,'D',C.blue,-10,24);p.dot(E,'E',C.blue,5,24);
      if(constructionStep!==null){
        for(const [X,T] of [[A,D],[B,E]]){
          const r=.26,u=[-X[0]/4,-X[1]/4],length=Math.hypot(T[0]-X[0],T[1]-X[1]),v=[(T[0]-X[0])/length,(T[1]-X[1])/length];
          const one=[X[0]+u[0]*r,X[1]+u[1]*r],two=[one[0]+v[0]*r,one[1]+v[1]*r],three=[X[0]+v[0]*r,X[1]+v[1]*r];
          p.line(one,two,{stroke:C.gray,width:1.2});p.line(two,three,{stroke:C.gray,width:1.2});
        }
      }
      }
      if(show(1)){p.dot(A,'A',C.blue,-22,-11);p.dot(B,'B',C.blue,10,-11);p.text([A[0]/2,A[1]/2],'4 m',{color:C.gray,dx:-32,size:16});}
      p.dot([0,4],'C',C.gold,0,-16);p.dot([0,0],'O',C.ink,-6,24);
      if(show(1))p.screenText(18,25,'桥形：拖动 A 或 B 改变坡角',{size:17,color:C.ink});
      if(show(3))p.screenText(18,p.h-18,`直线段总长 ${Lab.fmt(8/Math.tan(theta),2)} m　圆弧长 ${Lab.fmt(8*theta,2)} m`,{size:17,color:C.ink});p.finish();
      if(show(4)){
      const zoom = view === 'total', ymin = zoom ? 15.5 : 0, ymax = zoom ? 16.1 : 22;
      const xmin = lo*180/Math.PI-.5, xmax = 30.5, deg = theta*180/Math.PI, best = optimum*180/Math.PI;
      const q=Lab.plot(cost,{xmin,xmax,ymin,ymax,equal:false,pad:58});costPlot=q;
      // The zoom changes only the vertical scale; both views use the same cost model.
      const axisLeft=q.to([xmin,ymin])[0], axisBottom=q.to([xmin,ymin])[1], bestX=q.to([best,ymin])[0];
      q.line([xmin,ymin],[xmax,ymin],{stroke:C.gray,width:1});q.line([xmin,ymin],[xmin,ymax],{stroke:C.gray,width:1});
      const ticks=zoom?[15.5,15.6,15.7,15.8,15.9,16,16.1]:[0,5,10,15,20];
      for(const y of ticks){
        const py=q.to([xmin,y])[1];
        if(y>ymin)q.line([xmin,y],[xmax,y],{stroke:C.gray,width:.7,opacity:.2,dash:'2 5'});
        q.screenText(axisLeft-8,py+4,Lab.fmt(y,1),{size:12,anchor:'end',color:C.gray});
      }
      for(const x of [20,22,24,26,28,30]){
        const px=q.to([x,ymin])[0];
        q.add(`<line x1="${px}" y1="${axisBottom-3}" x2="${px}" y2="${axisBottom+3}" stroke="${C.gray}"/>`);
        // Give the exact minimum-angle label room instead of layering it over tick labels.
        if(Math.abs(px-bestX)>68)q.screenText(px,axisBottom+21,String(x),{size:12,anchor:'middle',color:C.gray});
      }
      if(!zoom){
        q.curve(x=>straight(x*Math.PI/180),lo*180/Math.PI,30,{stroke:C.blue,width:2});
        q.curve(x=>arc(x*Math.PI/180),lo*180/Math.PI,30,{stroke:C.gold,width:2});
        q.dot([deg,straight(theta)],'',C.blue);q.dot([deg,arc(theta)],'',C.gold);
      }
      q.curve(x=>total(x*Math.PI/180),lo*180/Math.PI,30,{stroke:C.target,width:3.5});
      q.line([deg,ymin],[deg,total(theta)],{stroke:C.target,dash:'6 4',width:1.3,opacity:.7});
      q.line([best,ymin],[best,total(optimum)],{stroke:C.target,dash:'2 4',width:1.2,opacity:.7});
      const minimum=q.to([best,total(optimum)]);
      q.add(`<circle cx="${minimum[0]}" cy="${minimum[1]}" r="6" fill="var(--canvas)" stroke="${C.target}" stroke-width="2"/>`);
      q.dot([deg,total(theta)],'',C.target);
      q.screenText(bestX,axisBottom+23,`最低 ${Lab.fmt(best,3)}°`,{size:14,anchor:'middle',color:C.target});
      const current=q.to([deg,total(theta)]), atMinimum=theta===optimum, nearMinimum=Math.abs(deg-best)<1.5;
      const currentDx=nearMinimum?0:deg>best?-9:9, currentDy=nearMinimum?-58:current[1]<94?25:-17;
      q.screenText(current[0]+currentDx,current[1]+currentDy,atMinimum?'当前 = 最低':`当前 ${Lab.fmt(deg,3)}°`,{size:15,anchor:nearMinimum?'middle':deg>best?'end':'start',color:C.target});
      q.screenText(16,24,zoom?'总费用 / 万元':'费用 / 万元',{size:17});
      if(zoom){
        q.screenText(16,45,'局部纵轴 15.5–16.1，不从 0 开始',{size:13,color:C.gray});
        // A visible break mark makes the nonzero vertical origin explicit.
        q.add(`<path d="M${axisLeft-5},${axisBottom-13}l10,-5m-10,11l10,-5" fill="none" stroke="${C.gray}" stroke-width="1.6"/>`);
      }else{
        q.screenText(16,45,'总费用',{color:C.target,size:14});q.screenText(98,45,'直线段',{color:C.blue,size:14});q.screenText(180,45,'圆弧',{color:C.gold,size:14});
      }
      q.screenText(q.w-12,q.h-9,'坡角 / °',{size:14,anchor:'end',color:C.gray});
      cost.setAttribute('aria-label',zoom?'总费用局部放大图，纵轴15.5至16.1万元，不从零开始；实心点是当前坡角，空心点是最低费用坡角':'直线段、圆弧和总费用随坡角变化，纵轴从零开始');
      q.finish();
      }else{cost.replaceChildren();costPlot=null;}
      const straightLength=8/Math.tan(theta),arcLength=8*theta,deg=theta*180/Math.PI;
      host.querySelector('#q11-readout').innerHTML=`<div class="q11-cost-summary">
        <div class="q11-cost-model"><b>费用函数</b><span class="target">${M.inline(String.raw`C(\theta)=\frac{16}{5}\cot\theta+20\theta`)}</span><small>θ 用弧度 · 费用单位：万元</small><button type="button" data-q11-explain aria-controls="q11-proof">查看计算过程</button></div>
        <div class="q11-current-cost"><span>当前 ${M.inline(String.raw`\theta=${Lab.fmt(deg,3)}^\circ\approx${Lab.fmt(theta,4)}\,\mathrm{rad}`)}</span><span class="blue">直桥：${M.inline(`0.4\\times${Lab.fmt(straightLength,3)}\\approx${Lab.fmt(straight(theta),3)}`)}</span><span class="gold">圆弧：${M.inline(`2.5\\times${Lab.fmt(arcLength,3)}\\approx${Lab.fmt(arc(theta),3)}`)}</span><span class="target">合计 ${M.inline(Lab.fmt(total(theta),3))} 万元</span></div>
      </div>${M.answer(`${M.inline(String.raw`\theta=\arcsin\frac25\approx23.578^\circ`)}；最低费用 ${M.inline(String.raw`C_{\min}=\frac{8\sqrt{21}}5+20\arcsin\frac25\approx${Lab.fmt(total(optimum),3)}`)} 万元。`)}`;
      host.querySelector('#q11-worked').innerHTML=`<p>先把输入的角度转成弧度：</p>${M.block(String.raw`\theta\approx${Lab.fmt(deg,4)}\cdot\frac\pi{180}\approx${Lab.fmt(theta,5)}`)}
        <p>两类长度（米）：</p>${M.block(String.raw`\begin{aligned}L_{\text{直}}&=8\cot\theta\approx${Lab.fmt(straightLength,4)}\\L_{\text{弧}}&=8\theta\approx${Lab.fmt(arcLength,4)}\end{aligned}`)}
        <p>乘单价并相加（万元）：</p>${M.block(String.raw`\begin{aligned}C_{\text{直}}&\approx0.4\cdot${Lab.fmt(straightLength,4)}\approx${Lab.fmt(straight(theta),4)}\\C_{\text{弧}}&\approx2.5\cdot${Lab.fmt(arcLength,4)}\approx${Lab.fmt(arc(theta),4)}\\C(\theta)&=C_{\text{直}}+C_{\text{弧}}\approx${Lab.fmt(total(theta),4)}\end{aligned}`)}<p class="note">显示值已四舍五入；曲线和合计使用未舍入的数据。拖动坡角，这里的计算同步更新。</p>`;
    }
    angle.oninput=()=>set(+angle.value);degrees.onchange=()=>set(+degrees.value*Math.PI/180);host.querySelector('#q11-best').onclick=()=>set(optimum);
    host.querySelector('#q11-view').onchange=e=>{view=e.target.value;render();};
    const showCalculation=e=>{if(!e.target.closest('[data-q11-explain]'))return;
      if(!document.body.classList.contains('show-key'))document.getElementById('keyButton').click();
      const proof=host.querySelector('#q11-proof');proof.scrollIntoView({block:'nearest'});proof.querySelector('.proof-toggle')?.focus({preventScroll:true});
    };
    host.addEventListener('click',showCalculation);
    bridge.onpointerdown=e=>{if(!show(1))return;dragging='bridge';bridge.setPointerCapture(e.pointerId);};bridge.onpointermove=e=>{if(dragging!=='bridge')return;const [x,y]=bridgePlot.fromEvent(e);set(Math.atan2(Math.abs(x),Math.max(.01,y)));};bridge.onpointerup=()=>dragging=null;bridge.onpointercancel=()=>dragging=null;
    cost.onpointerdown=e=>{if(!costPlot)return;dragging='cost';cost.setPointerCapture(e.pointerId);set(costPlot.fromEvent(e)[0]*Math.PI/180);};cost.onpointermove=e=>{if(dragging==='cost'&&costPlot)set(costPlot.fromEvent(e)[0]*Math.PI/180);};cost.onpointerup=()=>dragging=null;cost.onpointercancel=()=>dragging=null;
    render();return {render,destroy(){host.removeEventListener('click',showCalculation);},reset(){theta=lo;view='total';host.querySelector('#q11-view').value=view;if(constructionStep!==null)constructionStep=0;render();},getState(){return{theta,view,straight:straight(theta),arc:arc(theta),total:total(theta)};},getConstructionSteps:()=>constructionSteps,getConstructionStep:()=>constructionStep,setConstructionStep(index){constructionStep=index===null?null:Math.max(0,Math.min(constructionSteps.length-1,Math.trunc(index)));dragging=null;render();}};
  }
};
