Problems[21] = {
  title:'理解「A 值」',
  statement:`若存在 ${M.inline('x_0')}，使定义域内任意 ${M.inline('x')} 都满足 ${M.inline('f(x)-f(x_0)\\in A')}，则称 ${M.inline('f(x_0)')} 为函数的一个“${M.inline('A')} 值”。拖动候选点，观察整条差值曲线是否落在 ${M.inline('A')} 中。〔原卷第 7 页〕`,
  mount(host){
    const C=Lab.C;let kind='sin',x0=0,a=-.5,atOpt=false,sinK=null,sinShift=0,viewMax=6,leftPlot,drag=false,notice='',constructionStep=null;
    const show=index=>constructionStep===null||constructionStep>=index;
    const formulaTex=()=>kind==='sin'?String.raw`\sin x`:kind==='line'?'-x':kind==='quad'?'x^2+x+1':String.raw`\ln x+ax^2`;
    const domainTex=()=>kind==='log'?'(0,+\\infty)':String.raw`\mathbb R`;
    const setTex=()=>kind==='sin'?'[-2,0]':kind==='line'||kind==='quad'?'[0,+\\infty)':'(-\\infty,0]';
    function getConstructionSteps(){
      const rangeCheck=kind==='sin'?`由 ${M.inline(String.raw`\sin x\in[-1,1]`)}，完整差值值域为 ${M.inline(String.raw`[-1-\sin x_0,\,1-\sin x_0]`)}。它包含于 ${M.inline('[-2,0]')} 当且仅当 ${M.inline(String.raw`\sin x_0=1`)}。`:
        kind==='line'?`完整差值值域仍为 ${M.inline(String.raw`\mathbb R`)}，不能包含于 ${M.inline(String.raw`[0,+\infty)`)}。任给候选 ${M.inline('x_0')}，取 ${M.inline('x=x_0+1')}，差值恒为 ${M.inline('-1')}。`:
        kind==='quad'?`由配方 ${M.inline(String.raw`f(x)=(x+\frac12)^2+\frac34`)}，完整差值值域为 ${M.inline(String.raw`[-(x_0+\frac12)^2,+\infty)`)}。它包含于 ${M.inline(String.raw`[0,+\infty)`)} 当且仅当 ${M.inline(String.raw`x_0=-\frac12`)}。`:
        a<0?`当前 ${M.inline('a<0')}。由 ${M.inline(String.raw`f'(x)=\frac1x+2ax`)}，函数先增后减，完整值域为 ${M.inline(String.raw`(-\infty,H]`)}，其中 ${M.inline(String.raw`H=-\frac{\ln(-2a)+1}{2}`)}。差值值域为 ${M.inline(String.raw`(-\infty,H-f(x_0)]`)}，须有 ${M.inline('f(x_0)=H')}，即 ${M.inline(String.raw`x_0=\sqrt{-\frac1{2a}}`)}。`:
        `当前 ${M.inline(String.raw`a\ge0`)}。函数严格递增，且两端极限分别为 ${M.inline(String.raw`-\infty`)}、${M.inline(String.raw`+\infty`)}，完整差值值域为 ${M.inline(String.raw`\mathbb R`)}。取 ${M.inline('x=2x_0')}，差值 ${M.inline(String.raw`\ln2+3ax_0^2>0`)}，否决任意候选。`;
      return[
        {title:'从当前函数和定义域开始',body:`由当前小问，画 ${M.inline(`f(x)=${formulaTex()}`)}；定义域为 ${M.inline(domainTex())}。视窗只显示其中一部分，不能据视窗判断全局最大值或最小值。`},
        {title:'选定候选点和候选值',body:`定义中的“存在 ${M.inline('x_0')}”允许先选一个候选。在原曲线上标出 ${M.inline('(x_0,f(x_0))')}，再画高度 ${M.inline('f(x_0)')} 的水平线；此时尚未断定它是 ${M.inline('A')} 值。`},
        {title:'整体减去候选函数值',body:`由 ${M.inline('g(x)=f(x)-f(x_0)')}，把原曲线整体竖直平移 ${M.inline('-f(x_0)')}，在右图画差值曲线。候选点对应 ${M.inline('g(x_0)=0')}；每个横坐标仍来自原定义域。`},
        {title:'把允许集合画成水平区域',body:`当前 ${M.inline(`A=${setTex()}`)}。在右图涂出允许的纵坐标区域并画出边界；定义要求 ${M.inline(String.raw`\forall x\in D,\ g(x)\in A`)}，因此要检查完整差值值域是否包含于 ${M.inline('A')}。`},
        {title:'用完整值域核对全称条件',body:`${rangeCheck} 最后标出当前候选的反例点（若存在）；反例可能在图窗外。完整域上的判断来自上述解析关系，不能由当前窗口或采样代替。`}
      ];
    }
    function restartConstruction(){if(constructionStep!==null)constructionStep=0;host.dispatchEvent(new Event('constructionchange'));}
    const sinPoint=k=>Math.PI/2+2*k*Math.PI, minMagnitude=1e-6;
    host.innerHTML=`<div class="controls"><label>函数 <select id="q21-function"><option value="sin">正弦函数（第一问）</option><option value="line">一次函数（第二问①）</option><option value="quad">二次函数（第二问②）</option><option value="log">对数与二次项（第三问）</option></select></label><label id="q21-a-label" hidden>${M.inline('a')} <input id="q21-a" type="number" step="any" min="-2" max="1" value="-.5"></label><label>${M.inline('x_0')} <input id="q21-x" type="range" min="${-Math.PI}" max="${3*Math.PI}" step=".001" value="0"></label><input id="q21-number" type="number" aria-label="候选点横坐标" step="any" value="0"><button id="q21-opt">取最大值点</button></div><div class="figures"><svg id="q21-original" class="figure" role="img" aria-label="原函数图像，可拖动候选点"></svg><svg id="q21-shift" class="figure" role="img" aria-label="整条函数减去候选函数值后的图像，阴影是允许集合 A"></svg></div><div class="readout" id="q21-readout"></div><div class="explain" id="q21-explain"></div>`;
    const selector=host.querySelector('#q21-function'),range=host.querySelector('#q21-x'),number=host.querySelector('#q21-number'),left=host.querySelector('#q21-original'),right=host.querySelector('#q21-shift'),opt=host.querySelector('#q21-opt'),aInput=host.querySelector('#q21-a');
    function fn(x){return kind==='sin'?Math.sin(x):kind==='line'?-x:kind==='quad'?x*x+x+1:Math.log(x)+a*x*x;}
    function optimum(){return kind==='sin'?sinPoint(Math.round((x0-Math.PI/2)/(2*Math.PI))):kind==='quad'?-.5:kind==='log'&&a<0?Math.sqrt(-1/(2*a)):null;}
    function extValue(){return kind==='sin'?1:kind==='quad'?.75:kind==='log'&&a<0?-(Math.log(-2*a)+1)/2:null;}
    function bounds(){return kind==='sin'?[sinShift-Math.PI,sinShift+3*Math.PI]:kind==='log'?[Math.max(1e-4,viewMax/1000),viewMax]:[-3,3];}
    function inputBounds(){return kind==='sin'?[sinPoint(-15),sinPoint(15)]:kind==='log'?[1e-4,1000]:[-3,3];}
    function keepSinVisible(){if(kind!=='sin')return;const [lo,hi]=bounds();if(x0<lo||x0>hi)sinShift=2*Math.PI*Math.round((x0-Math.PI/2)/(2*Math.PI));}
    function setX(v){
      const [lo,hi]=inputBounds();
      if(!Number.isFinite(v)||v<lo||v>hi){notice=kind==='sin'?`候选点最多查看最大值点左右各 15 个周期；这是显示范围，数学定义域仍为 ${M.inline(String.raw`\mathbb R`)}。`:kind==='log'?`候选点显示范围：${M.inline(String.raw`0.0001\le x_0\le1000`)}；数学定义域仍为 ${M.inline('x>0')}。`:`候选点显示范围：${M.inline(String.raw`-3\le x_0\le3`)}；数学定义域仍为 ${M.inline(String.raw`\mathbb R`)}。`;render();return;}
      x0=v;notice='';sinK=null;
      if(kind==='sin'){const k=Math.round((v-Math.PI/2)/(2*Math.PI));if(v===sinPoint(k))sinK=k;atOpt=sinK!==null;keepSinVisible();}
      else atOpt=x0===optimum();
      render();
    }
    function render(){
      const [xmin,xmax]=bounds(),optimal=optimum(),fv=atOpt?extValue():fn(x0),isMin=kind==='line'||kind==='quad',valid=atOpt,lower=kind==='sin'?-1-fv:kind==='quad'?.75-fv:-Infinity,upper=kind==='sin'?1-fv:kind==='log'&&a<0?extValue()-fv:Infinity;
      const [inputMin,inputMax]=inputBounds();range.min=Math.max(xmin,inputMin);range.max=Math.min(xmax,inputMax);range.step=(xmax-xmin)/1500;range.value=x0;number.min=inputMin;number.max=inputMax;number.value=atOpt?String(x0):Number(x0.toPrecision(8));aInput.value=a;host.querySelector('#q21-a-label').hidden=kind!=='log';opt.textContent=isMin?'取最小值点':'取最大值点';opt.disabled=optimal===null;
      let witness=valid?null:kind==='sin'?optimal:kind==='line'?x0+1:kind==='quad'?-.5:a<0?optimal:2*x0;
      let diff=witness===null?null:(kind==='line'?-1:kind==='log'&&a>=0?Math.LN2+3*a*x0*x0:fn(witness)-fv);
      const witnessVisible=show(4)&&(constructionStep===null||Math.abs(diff)>=1e-6);
      const sample=Array.from({length:241},(_,i)=>fn(xmin+(xmax-xmin)*i/240));let ymin=Math.min(-.7,fv,...sample,...sample.map(v=>v-fv)),ymax=Math.max(.7,fv,...sample,...sample.map(v=>v-fv));
      if(kind==='sin'){ymin=-2.7;ymax=2.1;}const margin=(ymax-ymin)*.12;ymin-=margin;ymax+=margin;
      const formula=formulaTex(),candidateRelation=constructionStep!==null&&!atOpt?String.raw`\approx`:'=';
      const p=Lab.plot(left,{xmin,xmax,ymin,ymax,equal:false,pad:46});leftPlot=p;p.axes();p.curve(fn,xmin,xmax,{stroke:C.blue,width:2.8,n:500});if(show(1))p.line([xmin,fv],[xmax,fv],{stroke:C.target,dash:'6 4',width:2.3});
      if(show(1)&&x0>=xmin&&x0<=xmax){p.dot([x0,fv],'',C.target);p.math([x0,fv],'x_0',{color:C.target,dx:8,dy:-12,size:18});p.line([x0,0],[x0,fv],{stroke:C.target,dash:'4 4',width:1});}
      if(witnessVisible&&witness!==null&&witness>=xmin&&witness<=xmax)p.dot([witness,fn(witness)],'反例点',C.gold,8,-14);
      p.screenMath(16,27,`f(x)=${formula}`,{size:19});if(show(1))p.screenMath(16,p.h-18,String.raw`\text{候选值 }f(x_0)${candidateRelation}${Lab.fmt(fv,4)}`,{size:18,color:C.target});else p.screenMath(16,p.h-18,`D=${domainTex()}`,{size:18,color:C.gray});p.finish();
      const q=Lab.plot(right,{xmin,xmax,ymin,ymax,equal:false,pad:46});const low=kind==='sin'?Math.max(ymin,-2):isMin?0:ymin,high=kind==='sin'?0:isMin?ymax:0;
      if(show(3))q.poly([[xmin,low],[xmax,low],[xmax,high],[xmin,high]],{fill:C.green,opacity:.11,stroke:'none'});q.axes();if(show(2))q.curve(x=>fn(x)-fv,xmin,xmax,{stroke:C.blue,width:2.8,n:500});if(show(3)){q.line([xmin,0],[xmax,0],{stroke:C.green,width:1.8});if(kind==='sin')q.line([xmin,-2],[xmax,-2],{stroke:C.green,width:1.5,dash:'4 4'});}
      if(show(2)&&x0>=xmin&&x0<=xmax){q.dot([x0,0],'',C.target);q.math([x0,0],'x_0',{color:C.target,dx:8,dy:-12,size:18});}if(witnessVisible&&witness!==null&&witness>=xmin&&witness<=xmax)q.dot([witness,diff],'不在 A 中',C.gold,8,diff>0?-15:24);
      if(show(2))q.screenMath(16,27,String.raw`\text{差值 }f(x)-f(x_0)`,{size:19});else q.screenText(16,27,'差值图：选好候选值后画出',{size:17,color:C.gray});
      if(show(3))q.screenMath(16,q.h-18,`A=${setTex()}`,{size:18,color:C.green});
      if(constructionStep!==null&&show(4))q.screenText(16,52,valid?'当前候选通过完整值域检查':Math.abs(diff)<1e-6?'接近极值点：请用解析条件核对':witness<xmin||witness>xmax?'当前候选不通过：反例点在图窗外':'当前候选不通过：已标出反例',{size:15,color:valid?C.green:C.gold});
      q.finish();
      const rangeTex=kind==='sin'?(!valid&&Math.abs(diff)<1e-6?String.raw`[-1-\sin x_0,\,1-\sin x_0]`:String.raw`[${Lab.fmt(lower,4)},\,${Lab.fmt(upper,4)}]`):kind==='quad'?String.raw`[${Lab.fmt(lower,4)},+\infty)`:(kind==='log'&&a<0)?String.raw`(-\infty,${Lab.fmt(upper,4)}]`:String.raw`\mathbb R`;
      let verdict=valid?`<b style="color:${C.green}">整个差值值域都在 ${M.inline('A')} 中，所选点符合定义。</b>`:`<b>这个候选点不符合定义。</b> 取 ${M.inline(`x=${Lab.fmt(witness,5)}`)}，差值为 ${M.inline(Lab.fmt(diff,6))}，不属于 ${M.inline('A')}。`;
      if(!valid&&Math.abs(diff)<1e-6)verdict=`<b>还未取到精确极值点。</b> 差值与 ${M.inline('0')} 很接近；用“取${isMin?'最小':'最大'}值点”可选中解析极值点。`;
      if(witness!==null&&(witness<xmin||witness>xmax))verdict+=' 该反例点在当前视窗之外。';if(kind==='log'&&a<0&&optimal>xmax)verdict+=` 最大值点仍然存在：${M.inline(`x^*=${Lab.fmt(optimal,4)}`)}；点击“取最大值点”定位。`;
      const analyticPosition=kind==='sin'&&atOpt?`${M.inline(String.raw`x_0=\frac\pi2+2k\pi\quad(k=${sinK})`)}。`:'';
      const answer=kind==='sin'?`第一问：${M.inline('A')} 值为 ${M.inline('1')}。`:kind==='line'?`第二问①：不存在 ${M.inline('A')} 值。`:kind==='quad'?`第二问②：${M.inline('A')} 值为 ${M.inline(String.raw`\frac34`)}。`:`第三问：${M.inline('a<0')} 时，${M.inline('A')} 值为 ${M.inline(String.raw`-\frac{\ln(-2a)+1}{2}`)}；${M.inline(String.raw`a\ge0`)} 时不存在。`;
      host.querySelector('#q21-readout').innerHTML=`<span style="color:${C.target}">${M.inline(String.raw`f(x_0)=${Lab.fmt(fv,4)}`)}</span>${analyticPosition}差值的完整值域：${M.inline(rangeTex)}。${verdict}${notice?`<br><span class="note" role="status">${notice}</span>`:''}${M.answer(answer)}`;
      host.querySelector('#q21-explain').innerHTML=kind==='sin'?`<section class="proof-step"><h3>把值域整体下移</h3><p>${M.inline(String.raw`\sin x`)} 的值域为 ${M.inline('[-1,1]')}。整体减去 ${M.inline('1')} 后恰为 ${M.inline('[-2,0]')}，故 ${M.inline('A')} 值为 ${M.inline('1')}。</p></section><section class="proof-step"><h3>找到取值位置</h3><p>取值位置为</p>${M.block(String.raw`x_0=\frac\pi2+2k\pi,\quad k\in\mathbb Z`)}</section>`:kind==='line'?`<section class="proof-step"><h3>条件要求全局最小值</h3><p>${M.inline(String.raw`A=[0,+\infty)`)} 要求 ${M.inline(String.raw`f(x)\ge f(x_0)`)}，即取到全局最小值。</p></section><section class="proof-step"><h3>构造更小的函数值</h3><p>对 ${M.inline('-x')}，任给 ${M.inline('x_0')}，令 ${M.inline('x=x_0+1')}，差值恒为 ${M.inline('-1')}，所以不存在 ${M.inline('A')} 值。</p></section>`:kind==='quad'?`<section class="proof-step"><h3>配方寻找最小值</h3><p>${M.inline(String.raw`A=[0,+\infty)`)} 要求全局最小值。</p>${M.block(String.raw`x^2+x+1=\left(x+\frac12\right)^2+\frac34`)}</section><section class="proof-step"><h3>验证所有差值非负</h3><p>取 ${M.inline(String.raw`x_0=-\frac12`)} 后，差值变为 ${M.inline(String.raw`\left(x+\frac12\right)^2\ge0`)}，所以 ${M.inline('A')} 值为 ${M.inline(String.raw`\frac34`)}。</p></section>`:`<section class="proof-step"><h3>条件要求全局最大值</h3><p>${M.inline(String.raw`A=(-\infty,0]`)} 要求全局最大值。</p></section><section class="proof-step"><h3>非负参数：反驳任意候选</h3><p>${M.inline(String.raw`a\ge0`)} 时取 ${M.inline('x=2x_0')}，差值为 ${M.inline(String.raw`\ln2+3ax_0^2>0`)}，任一候选点都可被否决。</p></section><section class="proof-step"><h3>负参数：求唯一最大值</h3><p>${M.inline('a<0')} 时，</p>${M.block(String.raw`f'(x)=\frac1x+2ax`)}<p>在 ${M.inline(String.raw`x^*=\sqrt{-\frac1{2a}}`)} 左侧为正、右侧为负，唯一最大值为</p>${M.block(String.raw`-\frac{\ln(-2a)+1}{2}`)}<p class="proof-note">${M.inline(String.raw`a\to0^-`)} 时极值点趋于 ${M.inline(String.raw`+\infty`)}，不等于不存在最大值。</p></section>`;
    }
    selector.onchange=()=>{kind=selector.value;atOpt=false;sinK=null;sinShift=0;notice='';viewMax=6;x0=kind==='log'?1.6:0;restartConstruction();render();};range.oninput=()=>setX(+range.value);number.onchange=()=>setX(number.value.trim()===''?NaN:+number.value);aInput.onchange=()=>{
      const raw=aInput.value.trim(),v=raw===''?NaN:+raw,writtenNonzero=/[1-9]/.test(raw.split(/[eE]/)[0]);
      if(!Number.isFinite(v)||v<-2||v>1||(v!==0&&Math.abs(v)<minMagnitude)||(v===0&&writtenNonzero)){notice=`参数显示范围：${M.inline(String.raw`-2\le a\le1`)}；非零 ${M.inline('a')} 的 ${M.inline(String.raw`|a|\ge0.000001`)}，也可直接取 ${M.inline('0')}。这是显示范围，不改变数学结论。`;render();return;}
      a=v;notice='';if(atOpt&&a<0){x0=optimum();viewMax=Math.max(6,x0*1.8);}else atOpt=false;render();host.dispatchEvent(new Event('constructionchange'));
    };
    opt.onclick=()=>{const x=optimum();if(x===null)return;x0=x;atOpt=true;notice='';if(kind==='sin'){sinK=Math.round((x0-Math.PI/2)/(2*Math.PI));keepSinVisible();}if(kind==='log')viewMax=Math.max(6,x0*1.8);render();};left.onpointerdown=e=>{drag=true;left.setPointerCapture(e.pointerId);setX(leftPlot.fromEvent(e)[0]);};left.onpointermove=e=>{if(drag)setX(Math.max(Math.max(bounds()[0],inputBounds()[0]),Math.min(Math.min(bounds()[1],inputBounds()[1]),leftPlot.fromEvent(e)[0])));};left.onpointerup=()=>drag=false;left.onpointercancel=()=>drag=false;
    render();return{render,getConstructionSteps,getConstructionStep(){return constructionStep;},setConstructionStep(index){constructionStep=index===null?null:Math.max(0,Math.min(4,Math.trunc(index)));render();},reset(){kind='sin';x0=0;a=-.5;atOpt=false;sinK=null;sinShift=0;notice='';viewMax=6;selector.value=kind;restartConstruction();render();},getState(){return{kind,x0,a,atOpt,sinK,analyticPosition:kind==='sin'&&atOpt?{formula:'π/2+2kπ',k:sinK}:null,viewMax,optimalX:optimum(),f0:atOpt?extValue():fn(x0),notice};}};
  }
};
