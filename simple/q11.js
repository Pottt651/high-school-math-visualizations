Problems[11] = {
  title: '拱桥费用',
  statement: `半径为 ${M.inline('4\\,\\mathrm m')} 的圆弧桥面 ${M.inline('ACB')}，两端接与圆相切的直线段 ${M.inline('AD,BE')}。直线段每米 0.4 万元，圆弧每米 2.5 万元。坡角 ${M.inline(String.raw`\theta\in\left[\arcsin\frac13,\frac\pi6\right]`)}，求使总费用最少的<span class="target">坡角</span>。〔原卷第 1 页〕`,
  mount(host) {
    const lo = Math.asin(1/3), hi = Math.PI/6, optimum = Math.asin(.4), C = Lab.C;
    let theta = lo, view = 'total', bridgePlot, costPlot, dragging = null;
    host.innerHTML = `<div class="controls"><label style="color:${C.target}">坡角 ${M.inline(String.raw`\theta`)} <input id="q11-angle" type="range" min="${lo}" max="${hi}" step="0.0001" value="${lo}"></label><input id="q11-degrees" type="number" aria-label="坡角（度）" min="${lo*180/Math.PI}" max="30" step="0.01" value="${lo*180/Math.PI}"><span>°</span><label>右图 <select id="q11-view"><option value="total">总费用局部放大</option><option value="parts">费用构成</option></select></label><button id="q11-best" class="aux">取费用最低的坡角</button></div><div class="figures"><svg id="q11-bridge" class="figure" role="img" aria-label="圆弧及两端切线构成的拱桥；拖动切点调整坡角"></svg><svg id="q11-cost" class="figure" role="img" aria-label="直线段、圆弧和总费用随坡角变化的曲线"></svg></div><div class="readout" id="q11-readout"></div><div class="explain"><section class="proof-step"><h3>把桥形写成费用</h3><p>每段切线长 ${M.inline(String.raw`4\cot\theta`)}，圆弧圆心角为 ${M.inline(String.raw`2\theta`)}，故弧长为 ${M.inline(String.raw`8\theta`)}（${M.inline(String.raw`\theta`)} 用弧度）。</p>${M.block(String.raw`C(\theta)=\frac{16}{5}\cot\theta+20\theta`)}</section><section class="proof-step"><h3>用变化率找最优坡角</h3>${M.block(String.raw`C'(\theta)=20-\frac{16}{5\sin^2\theta}`)}<p>令导数为零，得 ${M.inline(String.raw`\sin\theta=\frac25`)}。导数由负变正，最优角为 <span style="color:${C.target}">${M.inline(String.raw`\arcsin\frac25\approx23.578^\circ`)}</span>。</p><p>坡角增大时，直线段费用减少，圆弧费用增加。</p></section></div>`;
    const angle = host.querySelector('#q11-angle'), degrees = host.querySelector('#q11-degrees'), bridge = host.querySelector('#q11-bridge'), cost = host.querySelector('#q11-cost');
    const straight = t => 3.2/Math.tan(t), arc = t => 20*t, total = t => straight(t)+arc(t);
    function set(t) { if (!Number.isFinite(t)) return; theta = Math.max(lo, Math.min(hi,t)); render(); }
    function render() {
      angle.value=theta; degrees.value=+(theta*180/Math.PI).toFixed(3);
      const A=[-4*Math.sin(theta),4*Math.cos(theta)], B=[-A[0],A[1]], D=[-4/Math.sin(theta),0], E=[-D[0],0];
      const p = Lab.plot(bridge,{xmin:-13,xmax:13,ymin:-1.2,ymax:6.1,pad:30}); bridgePlot=p;
      p.line([-12.5,0],[12.5,0],{stroke:C.gray,width:1});
      p.curve(x=>Math.sqrt(16-x*x),A[0],B[0],{stroke:C.gold,width:4});
      p.line(D,A,{stroke:C.blue,width:4}); p.line(B,E,{stroke:C.blue,width:4});
      p.line([0,0],A,{stroke:C.gray,dash:'5 5'});p.line([0,0],B,{stroke:C.gray,dash:'5 5'});
      p.add(`<polyline points="${Array.from({length:31},(_,i)=>{const a=Math.PI/2-theta+2*theta*i/30;return p.to([1.15*Math.cos(a),1.15*Math.sin(a)]).join(',');}).join(' ')}" fill="none" stroke="${C.target}" stroke-width="2.5"/>`);
      p.math([0,1.3],String.raw`2\theta`,{color:C.target,anchor:'middle',size:18});
      p.add(`<polyline points="${Array.from({length:21},(_,i)=>p.to([D[0]+1.7*Math.cos(theta*i/20),1.7*Math.sin(theta*i/20)]).join(',')).join(' ')}" fill="none" stroke="${C.target}" stroke-width="2.5"/>`);
      p.math([D[0]+2.15,.33],String.raw`\theta`,{color:C.target,size:20});
      p.dot(D,'D',C.blue,-10,24);p.dot(E,'E',C.blue,5,24);p.dot(A,'A',C.blue,-22,-11);p.dot(B,'B',C.blue,10,-11);p.dot([0,4],'C',C.gold,0,-16);p.dot([0,0],'O',C.ink,-6,24);
      p.text([A[0]/2,A[1]/2],'4 m',{color:C.gray,dx:-32,size:16});
      p.screenText(18,25,'桥形：拖动 A 或 B 改变坡角',{size:17,color:C.ink});
      p.screenText(18,p.h-18,`直线段总长 ${Lab.fmt(8/Math.tan(theta),2)} m　圆弧长 ${Lab.fmt(8*theta,2)} m`,{size:17,color:C.ink});p.finish();
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
      host.querySelector('#q11-readout').innerHTML=`<span style="color:${C.target}">${M.inline(String.raw`\theta=${Lab.fmt(theta*180/Math.PI,3)}^\circ`)}</span>直线段 <b style="color:${C.blue}">${Lab.fmt(straight(theta),3)}</b> + 圆弧 <b style="color:${C.gold}">${Lab.fmt(arc(theta),3)}</b> = 总费用 <b style="color:${C.target}">${Lab.fmt(total(theta),3)}</b> 万元${M.answer(`${M.inline(String.raw`\theta=\arcsin\frac25\approx23.578^\circ`)}；最低费用 ${M.inline(String.raw`C_{\min}=\frac{8\sqrt{21}}5+20\arcsin\frac25\approx${Lab.fmt(total(optimum),3)}`)} 万元。`)}`;
    }
    angle.oninput=()=>set(+angle.value);degrees.onchange=()=>set(+degrees.value*Math.PI/180);host.querySelector('#q11-best').onclick=()=>set(optimum);
    host.querySelector('#q11-view').onchange=e=>{view=e.target.value;render();};
    bridge.onpointerdown=e=>{dragging='bridge';bridge.setPointerCapture(e.pointerId);};bridge.onpointermove=e=>{if(dragging!=='bridge')return;const [x,y]=bridgePlot.fromEvent(e);set(Math.atan2(Math.abs(x),Math.max(.01,y)));};bridge.onpointerup=()=>dragging=null;bridge.onpointercancel=()=>dragging=null;
    cost.onpointerdown=e=>{dragging='cost';cost.setPointerCapture(e.pointerId);set(costPlot.fromEvent(e)[0]*Math.PI/180);};cost.onpointermove=e=>{if(dragging==='cost')set(costPlot.fromEvent(e)[0]*Math.PI/180);};cost.onpointerup=()=>dragging=null;cost.onpointercancel=()=>dragging=null;
    render();return {render,reset(){theta=lo;view='total';host.querySelector('#q11-view').value=view;render();},getState(){return{theta,view,straight:straight(theta),arc:arc(theta),total:total(theta)};}};
  }
};


