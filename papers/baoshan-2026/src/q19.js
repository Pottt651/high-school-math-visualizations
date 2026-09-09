Problems[19] = {
  title: '摩天轮：位置怎样变成函数？',
  statement: `摩天轮上点 ${M.inline('P')} 离地高度（米）为 ${M.inline(String.raw`y=A\sin(\omega t+\varphi)+b`)}，其中 ${M.inline(String.raw`A>0,\ \omega>0,\ |\varphi|\le\pi`)}，时间 ${M.inline('t')} 的单位是分钟。半径为 30 米，中心 ${M.inline('O')} 离地 40 米，每 12 分钟匀速转一圈，${M.inline('P')} 从最低点出发。<br>（1）求函数表达式；（2）转动一圈内，${M.inline('P')} 离地<span class="target">超过 55 米</span>有多长时间？〔原卷第 6 页〕`,
  mount(host) {
    const C=Lab.C;
    let t=0,playing=false,frame=0,last=0,constructionStep=null,curvePlot;
    const height=x=>40-30*Math.cos(Math.PI*x/6);
    const steps=[
      {title:'半径与中心高度 → 圆的大小和位置',body:`以离地 40 米的 ${M.inline('O')} 为圆心、30 米为半径画圆。最低处 10 米，最高处 70 米。`},
      {title:'从最低点出发 → 确定初相',body:`${M.inline('t=0')} 时位于最低点，故 ${M.inline(String.raw`\sin\varphi=-1`)}。结合 ${M.inline(String.raw`|\varphi|\le\pi`)} 得 ${M.inline(String.raw`\varphi=-\pi/2`)}。`},
      {title:'一圈 12 分钟 → 建立高度函数',body:`${M.inline(String.raw`\omega=2\pi/12=\pi/6`)}。拖动时间，把圆周上点的高度对应到右侧函数图的同一时刻。`},
      {title:'超过 55 米 → 高度区间变成时间区间',body:`画水平线 ${M.inline('y=55')}。高于它的红色圆弧与红色函数段对应 ${M.inline('4<t<8')}，两个端点处恰好 55 米，不计入。`}
    ];
    const show=n=>constructionStep===null||constructionStep>=n;
    host.innerHTML=`<div class="controls"><label>时间 ${M.inline('t')} <input id="b19-time" aria-label="时间（分钟）" type="range" min="0" max="12" step="0.05" value="0"></label><output id="b19-time-label"></output><button id="b19-play">播放一圈</button><button data-b19-time="4">到达 55 米</button><button data-b19-time="6">最高点</button><button data-b19-time="8">降回 55 米</button></div>
    <div class="figures"><svg id="b19-wheel" class="figure" role="img" aria-label="摩天轮上点的位置、离地高度及55米水平线"></svg><svg id="b19-curve" class="figure" role="img" aria-label="一圈内高度与时间的函数图，可拖动时间"></svg></div>
    <div class="readout" id="b19-readout"></div>
    <div class="explain">
      <section class="proof-step"><h3>① 半径、周期和起点 → 四个参数</h3><p>振幅等于半径，中心高度决定竖直平移量：</p>${M.block(String.raw`A=30,\quad b=40`)}${M.block(String.raw`T=\frac{2\pi}{\omega}=12\ \Rightarrow\ \omega=\frac\pi6`)}<p>开始在最低处，所以 ${M.inline('y(0)=40-30=10')}：</p>${M.block(String.raw`30\sin\varphi+40=10`)}${M.block(String.raw`\sin\varphi=-1,\quad |\varphi|\le\pi`)}${M.block(String.raw`\therefore\ \varphi=-\frac\pi2`)}</section>
      <section class="proof-step"><h3>② 写出高度函数，核对一圈的位置</h3><div class="target">${M.block(String.raw`y=30\sin\left(\frac\pi6t-\frac\pi2\right)+40`)}${M.block(String.raw`=40-30\cos\frac{\pi t}{6}`)}</div><p>一圈取 ${M.inline(String.raw`0\le t\le12`)}。开始和结束高度均为 10 米，${M.inline('t=6')} 时高度为 70 米，符合题设。</p></section>
      <section class="proof-step"><h3>③ 超过 55 米 → 解严格不等式</h3>${M.block(String.raw`40-30\cos\frac{\pi t}{6}>55`)}${M.block(String.raw`\cos\frac{\pi t}{6}<-\frac12`)}<p>一圈内 ${M.inline(String.raw`0\le\pi t/6\le2\pi`)}，故</p>${M.block(String.raw`\frac{2\pi}{3}<\frac{\pi t}{6}<\frac{4\pi}{3}`)}${M.block(String.raw`4<t<8`)}<p class="target">持续时间为 ${M.inline('8-4=4')} 分钟。</p><p class="proof-note">${M.inline('t=4,8')} 时恰为 55 米，所以是开端点。端点不计入不会改变区间的时长。</p></section>
    </div>`;
    const slider=host.querySelector('#b19-time'),wheel=host.querySelector('#b19-wheel'),curve=host.querySelector('#b19-curve'),play=host.querySelector('#b19-play');
    function stop(){playing=false;cancelAnimationFrame(frame);frame=0;last=0;play.textContent='播放一圈';}
    function set(x){if(!Number.isFinite(x))return;t=Math.max(0,Math.min(x,12));render();}
    function render(){
      slider.value=t;host.querySelector('#b19-time-label').textContent=`${Lab.fmt(t,2)} 分钟`;
      curve.hidden=!show(2);
      const y=height(t),above=t>4&&t<8,X=show(2)?[30*Math.sin(Math.PI*t/6),y]:[0,10];
      const p=Lab.plot(wheel,{xmin:-42,xmax:42,ymin:-5,ymax:86,pad:34});
      p.line([-40,0],[40,0],{stroke:C.gray,width:1.7});p.text([-38,0],'地面',{color:C.gray,dy:25,size:16});
      p.line([-8,0],[0,40],{stroke:C.gray,width:1});p.line([8,0],[0,40],{stroke:C.gray,width:1});
      p.circle([0,40],30,{stroke:C.blue,width:2.5});
      for(let n=0;n<12;n++){const a=Math.PI*n/6;p.line([0,40],[30*Math.sin(a),40-30*Math.cos(a)],{stroke:C.gray,width:.65,opacity:.35});}
      p.dot([0,40],'O',C.ink,-17,6);
      p.line([-35,0],[-35,40],{stroke:C.gray,width:1,dash:'4 5'});p.text([-35,20],'40 m',{color:C.gray,dx:-4,size:16});
      if(show(3)){
        p.line([-39,55],[39,55],{stroke:C.gold,dash:'5 5',width:1.4});p.text([32,55],'55 m',{color:C.gold,dx:0,dy:-14,size:16});
        const points=Array.from({length:81},(_,i)=>{const a=2*Math.PI/3+2*Math.PI/3*i/80;return p.to([30*Math.sin(a),40-30*Math.cos(a)]).join(',');});
        p.add(`<polyline points="${points.join(' ')}" fill="none" stroke="${C.target}" stroke-width="3.2"/>`);
        for(const x of [-15*Math.sqrt(3),15*Math.sqrt(3)])p.circle([x,55],.8,{stroke:C.target,fill:'var(--canvas)',width:1.3});
      }
      if(show(1)){
        p.line([0,40],X,{stroke:C.blue,width:2.2});
        p.line(X,[X[0],0],{stroke:C.target,dash:'5 5',width:1.3});
        p.dot(X,'P',C.target,12,-12);
        p.text([X[0],Math.max(8,X[1]/2)],`${Lab.fmt(X[1],1)} m`,{color:C.target,size:18,dx:14});
      }
      p.screenText(16,24,'圆周上的位置',{size:17});p.finish();
      if(show(2)){
        const q=Lab.plot(curve,{xmin:0,xmax:12,ymin:0,ymax:80,equal:false,pad:49});curvePlot=q;
        q.axes({stepX:2,stepY:20,x:'',y:'',tickSize:13});
        q.screenText(q.w-10,q.h-8,'t / min',{size:13,color:C.gray,anchor:'end'});
        q.screenText(48,45,'y / m',{size:13,color:C.gray});
        q.curve(height,0,12,{stroke:C.blue,width:2.7});
        if(show(3)){
          q.poly([[4,0],[8,0],[8,80],[4,80]],{fill:C.target,opacity:.06,stroke:'none'});
          q.line([0,55],[12,55],{stroke:C.gold,dash:'5 5',width:1.3});q.text([.1,55],'55',{color:C.gold,size:16,dx:0,dy:-10});
          q.curve(height,4,8,{stroke:C.target,width:3.5});
          for(const x of [4,8]){q.line([x,0],[x,55],{stroke:C.target,dash:'4 5',width:1});const [px,py]=q.to([x,55]);q.add(`<circle cx="${px}" cy="${py}" r="5" fill="var(--canvas)" stroke="${C.target}" stroke-width="2"/>`);}
          q.text([6,26],'超过 55 米',{color:C.target,anchor:'middle',size:16});q.math([6,13],'4<t<8',{color:C.target,anchor:'middle',size:18});
        }
        q.line([t,0],[t,y],{stroke:C.gray,dash:'3 5',width:1});q.dot([t,y],'P′',C.target,10,-14);
        q.screenText(16,24,'同一时刻的高度',{size:17});q.finish();
      }else {curve.replaceChildren();curvePlot=null;}
      host.querySelector('#b19-readout').innerHTML=`<div>${M.inline(String.raw`y(t)=40-30\cos\frac{\pi t}{6}`)}</div><p>当前 ${M.inline(`t=${Lab.fmt(t,2)}`)} 分钟，${M.inline(String.raw`y\approx${Lab.fmt(y,2)}`)} 米。<span class="target">${above?'高于 55 米':Math.abs(y-55)<1e-8?'恰好 55 米（不计入）':'未超过 55 米'}</span></p>${M.answer(`高度函数如上；超过 55 米的时间为 ${M.inline('4<t<8')}，共 ${M.inline('4')} 分钟。`)}`;
    }
    function tick(now){if(!playing)return;if(last)t=Math.min(12,t+(now-last)/1000);last=now;render();if(t>=12)stop();else frame=requestAnimationFrame(tick);}
    slider.oninput=()=>{stop();set(+slider.value);};
    play.onclick=()=>{if(playing){stop();return;}if(t>=12)t=0;playing=true;play.textContent='暂停';last=0;frame=requestAnimationFrame(tick);};
    host.querySelectorAll('[data-b19-time]').forEach(b=>b.onclick=()=>{stop();set(+b.dataset.b19Time);});
    let dragging=false;
    curve.onpointerdown=e=>{if(!curvePlot)return;stop();dragging=true;curve.setPointerCapture(e.pointerId);set(curvePlot.fromEvent(e)[0]);};
    curve.onpointermove=e=>{if(dragging&&curvePlot)set(curvePlot.fromEvent(e)[0]);};curve.onpointerup=curve.onpointercancel=()=>dragging=false;
    render();return{render,reset(){stop();t=0;if(constructionStep!==null)constructionStep=0;render();},destroy:stop,getState:()=>({t,height:height(t),above:t>4&&t<8,playing}),getConstructionSteps:()=>steps,getConstructionStep:()=>constructionStep,setConstructionStep(i){stop();constructionStep=i===null?null:Math.max(0,Math.min(Math.trunc(i),steps.length-1));render();}};
  }
};
