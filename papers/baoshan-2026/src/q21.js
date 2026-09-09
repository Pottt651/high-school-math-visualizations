(() => {
  const exponential=x=>({f:16**x,g:4**x,F:16**x-4**x,inM:x>=0});
  const critical=t=>{const a=t*Math.exp(t),f=Math.exp(t)-a*Math.log(t),g=a-Math.exp(t);return {t,a,f,g,F:f-g,admissible:t>0&&t<1};};
  const concave=(x0,kind)=>{
    const offset=kind==='upper'?.75:kind==='lower'?-.75:0,tilt=kind==='tilt'?1:0;
    const slope=-2*x0+tilt,intercept=x0*x0-tilt*x0+offset,discriminant=tilt*tilt-4*offset;
    const roots=discriminant<0?[]:discriminant===0?[x0-tilt/2]:[x0+(-tilt-Math.sqrt(discriminant))/2,x0+(-tilt+Math.sqrt(discriminant))/2];
    return {x0,kind,offset,tilt,slope,intercept,roots,singletonAtX0:kind==='tangent'};
  };
  Problems[21]={
    title:'差函数与单点集合',model:{exponential,critical,concave},
    statement:`已知连续函数 ${M.inline('y=f(x)')} 和 ${M.inline('y=g(x)')}，设 ${M.inline('F(x)=f(x)-g(x)')}，集合 ${M.inline(String.raw`M=\{x\mid F(x)\ge0\}`)}。<p>（1）若指数函数 ${M.inline('y=g(x)')} 的图像过点 ${M.inline(String.raw`(\frac12,2)`)}，且 ${M.inline('f(x)=g(2x)')}，求 ${M.inline('M')}。</p><p>（2）若 ${M.inline(String.raw`f(x)=e^x-a\ln x`)}，${M.inline('g(x)=a-e^x')}，且 ${M.inline('y=f(x)')} 在区间 ${M.inline('(0,1)')} 上存在极值点 ${M.inline('t')}，求实数 ${M.inline('a')} 的取值范围，并判断 ${M.inline('t')} 是否属于 ${M.inline('M')}，请说明理由。</p><p>（3）若 ${M.inline(String.raw`f'(x)`)} 是 ${M.inline(String.raw`\mathbb R`)} 上的严格减函数，${M.inline(String.raw`g(x)=ax+b\ (a,b\in\mathbb R)`)}，且 ${M.inline('f(x)')} 在 ${M.inline('x=x_0')} 处的切线方程为 ${M.inline('y=h(x)')}。求证：${M.inline(String.raw`M=\{x_0\}`)} 的充要条件是 ${M.inline('h(x)=g(x)')}。〔原卷第 8 页〕</p>`,
    mount(host){
      const C=Lab.C;let part=1,x=.4,t=.5,x0=.4,lineKind='tangent',notice='',constructionStep=null,plot=null,dragging=false;
      const $=name=>host.querySelector('#b21-'+name),show=n=>constructionStep===null||constructionStep>=n;
      host.innerHTML=`<div class="controls"><label>分问 <select id="b21-part"><option value="1">（1）指数函数与集合</option><option value="2">（2）极值点与参数</option><option value="3">（3）单点集与切线</option></select></label><label id="b21-x-wrap">观察点 ${M.inline('x')} <input id="b21-x" type="range" min="-1.2" max=".9" step=".01" value=".4"><output id="b21-x-value"></output></label><label id="b21-t-wrap" hidden>极值点 ${M.inline('t')} <input id="b21-t" type="range" min=".01" max=".99" step=".01" value=".5"><input id="b21-t-number" aria-label="极值点 t，严格介于零与一" type="number" min=".0001" max=".9999" step=".01" value=".5"></label><label id="b21-x0-wrap" hidden>切点 ${M.inline('x_0')} <input id="b21-x0" type="range" min="-1.5" max="1.5" step=".05" value=".4"><output id="b21-x0-value"></output></label><label id="b21-line-wrap" hidden>直线 <select id="b21-line"><option value="tangent">与切线重合</option><option value="upper">切线上移 3/4</option><option value="lower">切线下移 3/4</option><option value="tilt">绕接点转动（斜率加 1）</option></select></label><button id="b21-special">取交点 x＝0</button></div><div class="figures"><svg id="b21-svg" class="main-figure" role="img" aria-label="原函数与比较函数的图像，红色标记对应差函数非负的集合"></svg></div><div class="readout" id="b21-readout"></div><div class="explain" id="b21-explain"></div>`;
      function getConstructionSteps(){return part===1?[
        {title:'由已知点确定指数底数',body:`设 ${M.inline('g(x)=c^x')}。由 ${M.inline(String.raw`c^{1/2}=2`)} 得 ${M.inline('c=4')}，先画 ${M.inline('g(x)=4^x')}。`},
        {title:'画横坐标变换后的函数',body:`由 ${M.inline('f(x)=g(2x)')}，得到 ${M.inline('f(x)=16^x')}。将两条曲线画在同一坐标系中。`},
        {title:'把竖直差读成 F(x)',body:`同一横坐标处的竖直差是 ${M.inline('F(x)=16^x-4^x')}。拖动观察点，检查哪条曲线更高。`},
        {title:'从差的符号读出完整集合',body:`${M.inline(String.raw`F(x)=4^x(4^x-1)\ge0\iff x\ge0`)}。集合从 ${M.inline('0')} 开始向右延伸，包含交点横坐标。`}
      ]:part===2?[
        {title:'用极值点确定当前参数',body:`${M.inline(String.raw`f'(t)=0\iff a=te^t`)}。滑动 ${M.inline(String.raw`t\in(0,1)`)} 时，参数随此关系变化，先画对应的 ${M.inline('f(x)')}。`},
        {title:'在同一参数下画比较函数',body:`用相同的 ${M.inline('a=te^t')} 画 ${M.inline('g(x)=a-e^x')}。两个函数不能分别调参。`},
        {title:'标出 f 的唯一极小值点',body:`${M.inline(String.raw`f'(x)=\frac{xe^x-a}{x}`)}。${M.inline('xe^x')} 在正半轴严格递增，因此 ${M.inline('f')} 在 ${M.inline('t')} 左减右增；水平虚线是极小值点处切线。`},
        {title:'用竖直差检验 t 是否属于 M',body:`标出 ${M.inline('F(t)')}。由 ${M.inline(String.raw`F(t)=e^t(2-t-t\ln t)>e^t(2-t)>0`)}，可知每个允许的 ${M.inline('t')} 都属于 ${M.inline('M')}。`}
      ]:[
        {title:'先看满足导数严格递减的一类例子',body:`图中取 ${M.inline('f(x)=-x^2')}，其导数 ${M.inline(String.raw`f'(x)=-2x`)} 严格递减。这只是代表性例子，一般证明仍须使用原题条件。`},
        {title:'在 x₀ 处画切线',body:`切线 ${M.inline(String.raw`h(x)=f(x_0)+f'(x_0)(x-x_0)`)}。例子中为 ${M.inline('h(x)=-2x_0x+x_0^2')}；图像在接点外严格位于切线下方。`},
        {title:'把直线 g 与切线比较',body:`用控件使 ${M.inline('g')} 与切线重合、上移、下移或绕接点转动。改变的是直线，不改变 ${M.inline('f')} 或给定接点。`},
        {title:'定位非负差的集合，再完成一般证明',body:`红色端点及区间表示 ${M.inline(String.raw`f(x)\ge g(x)`)} 的横坐标。切线重合时恰为 ${M.inline(String.raw`M=\{x_0\}`)}；下方解析分别证明必要性和充分性，不以该二次函数例子代替一般结论。`}
      ];}
      function restart(){if(constructionStep!==null)constructionStep=0;host.dispatchEvent(new Event('constructionchange'));}
      const writeProof=html=>{if($('explain').dataset.part!==String(part)){$('explain').innerHTML=html;$('explain').dataset.part=String(part);}};
      function render(){
        $('x-wrap').hidden=part!==1;$('t-wrap').hidden=part!==2;$('x0-wrap').hidden=part!==3;$('line-wrap').hidden=part!==3;
        $('x').value=x;$('x-value').textContent=Lab.fmt(x,2);$('t').value=t;$('t-number').value=t;$('x0').value=x0;$('x0-value').textContent=Lab.fmt(x0,2);
        $('special').textContent=part===1?'取交点 x＝0':part===2?'取 t＝1/2':'恢复切线重合';
        if(part===1){
          const data=exponential(x),xmin=-1.25,xmax=.98,ymin=-1.35,ymax=13.5,p=plot=Lab.plot($('svg'),{xmin,xmax,ymin,ymax,equal:false,pad:50});
          if(show(3))p.poly([[0,ymin],[xmax,ymin],[xmax,ymax],[0,ymax]],{fill:C.target,opacity:.07,stroke:'none'});
          p.axes({tickSize:14});p.curve(v=>4**v,xmin,xmax,{stroke:C.gold,width:2.5});
          p.math([.8,4**.8],'g(x)=4^x',{color:C.gold,size:19,dx:-18,dy:23,anchor:'end'});
          if(show(1)){p.curve(v=>16**v,xmin,xmax,{stroke:C.blue,width:2.8});p.math([.73,16**.73],'f(x)=16^x',{color:C.blue,size:19,dx:-15,dy:-17,anchor:'end'});p.dot([0,1],'交点',C.target,-58,-15);}
          if(show(2)){p.line([x,data.g],[x,data.f],{stroke:C.target,width:3});p.dot([x,data.f],'',C.blue);p.dot([x,data.g],'',C.gold);p.line([x,0],[x,Math.min(data.f,data.g)],{stroke:C.gray,dash:'3 5',width:1});p.math([x,0],'x',{color:C.target,size:19,dy:24,anchor:'middle'});}
          if(show(3))p.screenMath(18,29,String.raw`M=[0,+\infty)`,{size:21,color:C.target});
          p.screenText(18,p.h-16,'红色区域表示满足 f(x) ≥ g(x) 的横坐标，向右无限延伸。',{color:C.gray,size:14});p.finish();
          $('readout').innerHTML=`当前 ${M.inline('x='+Lab.fmt(x,2))}：${M.inline(String.raw`F(x)\approx${Lab.fmt(data.F,4)}`)}，${M.inline(data.inM?String.raw`x\in M`:String.raw`x\notin M`)}。${M.answer(String.raw`（1）${M.inline('g(x)=4^x')}，${M.inline('f(x)=16^x')}，${M.inline(String.raw`M=[0,+\infty)`)}。`)}`;
          writeProof(`<section class="proof-step"><h3>用已知点求底数</h3><p>设 ${M.inline(String.raw`g(x)=c^x\ (c>0,\ c\ne1)`)}。过点 ${M.inline(String.raw`(\frac12,2)`)} 给出 ${M.inline(String.raw`c^{1/2}=2`)}，所以 ${M.inline('c=4')}。</p></section><section class="proof-step"><h3>统一到同一底数</h3>${M.block(String.raw`\begin{aligned}f(x)&=g(2x)=4^{2x}=16^x,\\F(x)&=4^x(4^x-1).\end{aligned}`)}</section><section class="proof-step"><h3>正因子不改变符号</h3><p>对全部实数 ${M.inline('x')}，${M.inline('4^x>0')}，因此</p>${M.block(String.raw`F(x)\ge0\iff4^x\ge1\iff x\ge0.`)}<p>等号在 ${M.inline('x=0')} 取得，所以 ${M.inline(String.raw`M=[0,+\infty)`)} 左端闭合。</p></section>`);
        }else if(part===2){
          const data=critical(t),f=v=>Math.exp(v)-data.a*Math.log(v),g=v=>data.a-Math.exp(v),xmin=Math.min(.006,t/4),xmax=1.65,ymin=-5,ymax=Math.max(6,data.f+2),p=plot=Lab.plot($('svg'),{xmin,xmax,ymin,ymax,equal:false,pad:50});
          p.axes({tickSize:14});p.curve(f,xmin,xmax,{stroke:C.blue,width:2.8,n:600});
          p.screenMath(18,29,String.raw`a=te^t\approx${M.number(data.a,4)}`,{color:C.target,size:21});
          p.math([1.3,f(1.3)],'f(x)',{color:C.blue,size:20,dx:14,dy:-13});
          if(show(1)){p.curve(g,xmin,xmax,{stroke:C.gold,width:2.5});p.math([1.35,g(1.35)],'g(x)',{color:C.gold,size:20,dx:12,dy:22});}
          if(show(2)){p.line([xmin,data.f],[xmax,data.f],{stroke:C.green,width:1.2,dash:'6 5'});p.dot([t,data.f],'f 的极小值点',C.blue,12,-18);p.math([t,0],'t',{color:C.blue,size:19,dx:8,dy:25});}
          if(show(3)){p.line([t,data.g],[t,data.f],{stroke:C.target,width:3});p.dot([t,data.g],'',C.gold);p.math([t,(data.f+data.g)/2],'F(t)>0',{color:C.target,size:21,dx:17,dy:4});}
          p.screenText(18,p.h-16,'t 严格介于 0 与 1；只显示正半轴的一段，曲线在视窗外继续。',{color:C.gray,size:14});p.finish();
          $('readout').innerHTML=`${notice?`<p>${Lab.escape(notice)}</p>`:''}当前 ${M.inline(String.raw`t\approx${M.number(t,6)}`)}，${M.inline(String.raw`a\approx${M.number(data.a,5)}`)}，${M.inline(String.raw`F(t)\approx${Lab.fmt(data.F,5)}>0`)}。${M.answer(`（2）${M.inline(String.raw`a\in(0,e)`)}；${M.inline(String.raw`t\in M`)}，且 ${M.inline('F(t)>0')}。`)}`;
          writeProof(`<section class="proof-step"><h3>极值点给出参数关系</h3><p>函数 ${M.inline('f')} 的定义域为 ${M.inline(String.raw`(0,+\infty)`)}。因 ${M.inline(String.raw`t\in(0,1)`)} 是内点极值点，必有</p>${M.block(String.raw`f'(t)=e^t-\frac at=0\iff a=te^t.`)}</section><section class="proof-step"><h3>验证参数范围的必要性与充分性</h3><p>令 ${M.inline('H(x)=xe^x')}。对 ${M.inline('x>0')}，${M.inline(String.raw`H'(x)=(1+x)e^x>0`)}，因此 ${M.inline('H')} 把 ${M.inline('(0,1)')} 一一映到 ${M.inline('(0,e)')}。</p><p>反过来，任取 ${M.inline(String.raw`a\in(0,e)`)}，唯一的 ${M.inline(String.raw`t\in(0,1)`)} 满足 ${M.inline('H(t)=a')}。又</p>${M.block(String.raw`f'(x)=\frac{H(x)-a}{x}`)}<p>在 ${M.inline('t')} 左侧负、右侧正，所以确为极小值点。故精确范围是 ${M.inline(String.raw`a\in(0,e)`)}。</p><p class="proof-note">${M.inline('a=0')} 时正半轴内没有极值点；${M.inline('a=e')} 时极值点为 ${M.inline('1')}，不在题设开区间内。两端都不能取。</p></section><section class="proof-step"><h3>代回差函数，证明严格为正</h3>${M.block(String.raw`\begin{aligned}F(t)&=2e^t-a\ln t-a\\&=e^t(2-t-t\ln t).\end{aligned}`)}<p>因 ${M.inline('0<t<1')}，有 ${M.inline(String.raw`\ln t<0`)}，因此</p>${M.block(String.raw`F(t)>e^t(2-t)>0.`)}<p>所以 ${M.inline(String.raw`t\in M`)}；不仅是边界相等，而是严格满足非负条件。</p></section>`);
        }else{
          const data=concave(x0,lineKind),f=v=>-v*v,h=v=>-2*x0*v+x0*x0,g=v=>data.slope*v+data.intercept,xmin=-3,xmax=3,ymin=-9.6,ymax=4,p=plot=Lab.plot($('svg'),{xmin,xmax,ymin,ymax,equal:false,pad:50});
          if(show(3)&&data.roots.length===2)p.poly([[data.roots[0],ymin],[data.roots[1],ymin],[data.roots[1],ymax],[data.roots[0],ymax]],{fill:C.target,opacity:.08,stroke:'none'});
          p.axes({tickSize:14});p.curve(f,xmin,xmax,{stroke:C.blue,width:2.8});
          p.math([-2.1,-4.41],'f(x)=-x^2',{color:C.blue,size:19,dx:14,dy:-15});
          if(show(1)){p.curve(h,xmin,xmax,{stroke:C.green,width:1.8,dash:'6 5'});p.dot([x0,f(x0)],'给定接点',C.green,10,-23);p.math([x0,0],'x_0',{color:C.green,size:19,dy:25,dx:8});}
          if(show(2)){p.curve(g,xmin,xmax,{stroke:C.gold,width:2.8});p.math([2.3,g(2.3)],lineKind==='tangent'?'g=h':'g(x)',{color:C.gold,size:20,dx:-14,dy:-15,anchor:'end'});}
          if(show(3))for(const root of data.roots){p.dot([root,f(root)],'',C.target);p.line([root,0],[root,f(root)],{stroke:C.target,width:1.2,dash:'3 5'});}
          const mTex=lineKind==='tangent'?String.raw`M=\{x_0\}`:lineKind==='upper'?String.raw`M=\varnothing`:lineKind==='lower'?String.raw`M=[x_0-\frac{\sqrt3}2,x_0+\frac{\sqrt3}2]`:'M=[x_0-1,x_0]';
          if(show(3))p.screenMath(18,30,mTex,{color:C.target,size:20});
          p.screenText(18,p.h-16,'图示只是一类例子；一般结论由“导数严格递减”证明。',{color:C.gray,size:14});p.finish();
          $('readout').innerHTML=`<span style="color:${C.blue}">例子 ${M.inline('f(x)=-x^2')}</span>，${M.inline('x_0='+Lab.fmt(x0,2))}。<span style="color:${C.green}">切线 ${M.inline('h(x)=-2x_0x+x_0^2')}</span>。当前 ${M.inline(mTex)}。${M.answer(`（3）${M.inline(String.raw`M=\{x_0\}\iff h(x)=g(x)`)}。`)}`;
          writeProof(`<section class="proof-step"><h3>必要性：先证明接点差值等于零</h3><p>设 ${M.inline(String.raw`M=\{x_0\}`)}。则 ${M.inline(String.raw`F(x_0)\ge0`)}，其他位置均有 ${M.inline('F(x)<0')}。若 ${M.inline('F(x_0)>0')}，由连续性，在 ${M.inline('x_0')} 附近仍有 ${M.inline('F(x)>0')}，与单点集矛盾。因此 ${M.inline('F(x_0)=0')}，即 ${M.inline('f(x_0)=g(x_0)')}。</p></section><section class="proof-step"><h3>必要性：唯一最大点给出相同斜率</h3><p>${M.inline('x_0')} 是可导函数 ${M.inline('F')} 的全局最大值点，且是 ${M.inline(String.raw`\mathbb R`)} 的内点，所以</p>${M.block(String.raw`F'(x_0)=0\iff f'(x_0)=a.`)}<p>由同一点、同一斜率，</p>${M.block(String.raw`\begin{aligned}h(x)&=f(x_0)+f'(x_0)(x-x_0)\\&=ax+b=g(x).\end{aligned}`)}</section><section class="proof-step"><h3>充分性：严格减导数排除其他横坐标</h3><p>反过来，设 ${M.inline('g=h')}。则 ${M.inline('F(x_0)=0')}，${M.inline(String.raw`a=f'(x_0)`)}。因为 ${M.inline(String.raw`f'`)} 严格递减，</p>${M.block(String.raw`\begin{cases}F'(x)=f'(x)-f'(x_0)>0,&x<x_0,\\F'(x)=f'(x)-f'(x_0)<0,&x>x_0.\end{cases}`)}<p>故 ${M.inline('F')} 在 ${M.inline('x_0')} 左侧严格递增、右侧严格递减，唯一最大值为 ${M.inline('F(x_0)=0')}。于是其余横坐标全有 ${M.inline('F(x)<0')}，得到 ${M.inline(String.raw`M=\{x_0\}`)}。</p><p class="proof-note">图中的 ${M.inline('f(x)=-x^2')} 仅帮助观察。这里的必要性和充分性针对原题允许的全部函数，未假设它们一定是二次函数。</p></section>`);
        }
      }
      function setT(value){if(!Number.isFinite(value)||value<=0||value>=1){notice='极值点必须严格满足 0<t<1；端点不属于题设区间。';render();return;}t=value;notice='';render();}
      $('part').onchange=e=>{part=Number(e.target.value);notice='';restart();render();};
      $('x').oninput=e=>{x=Number(e.target.value);render();};$('t').oninput=e=>setT(Number(e.target.value));$('t-number').onchange=e=>setT(Number(e.target.value));
      $('x0').oninput=e=>{x0=Number(e.target.value);render();};$('line').onchange=e=>{lineKind=e.target.value;restart();render();};
      $('special').onclick=()=>{notice='';if(part===1)x=0;else if(part===2)t=.5;else{lineKind='tangent';$('line').value=lineKind;}render();};
      const svg=$('svg');svg.style.touchAction='none';svg.onpointerdown=e=>{if(part!==1||!plot)return;const [v]=plot.fromEvent(e);if(Math.abs(v-x)>.14)return;dragging=true;svg.setPointerCapture(e.pointerId);};svg.onpointermove=e=>{if(!dragging||part!==1)return;const [v]=plot.fromEvent(e);x=Math.max(-1.2,Math.min(.9,Math.round(v*100)/100));render();};svg.onpointerup=svg.onpointercancel=()=>dragging=false;
      render();return {render,getConstructionSteps,getConstructionStep:()=>constructionStep,setConstructionStep(index){constructionStep=index===null?null:Math.max(0,Math.min(3,Math.trunc(index)));render();},reset(){part=1;x=.4;t=.5;x0=.4;lineKind='tangent';notice='';$('part').value='1';$('line').value=lineKind;restart();render();},getState(){return {part,x,t,x0,lineKind,...(part===1?exponential(x):part===2?critical(t):concave(x0,lineKind))};},destroy(){dragging=false;}};
    }
  };
})();
