Problems[21]={title:'极值点偏移：与两个零点的中点比较',statement:`设唯一极值点为 ${M.inline('x_0')}，仅有两个零点 ${M.inline('x_1<x_0<x_2')}。若 ${M.inline(String.raw`\frac{x_1+x_2}{2}>x_0`)} 称 <span class="target">左偏移</span>，反向不等式称 <span class="target">右偏移</span>。（1）${M.inline('x^2-1')}；（2）${M.inline('x^3-mx^2-x+m')}，${M.inline(String.raw`m>0,m\ne1`)}；（3）${M.inline(String.raw`\ln x-ax`)}，${M.inline(String.raw`0<a<e^{-1}`)}。后两问的定义域为 ${M.inline(String.raw`(0,+\infty)`)}。`,mount(host){
 const H=HuangpuMath,C=Lab.C;let state={kind:'quadratic',m:2,a:.2};
 const model=()=>H.offset(state.kind,state.kind==='cubic'?state.m:state.a);
 function steps(){if(state.kind==='log')return[
  {title:'缩放横轴，把极值位置固定为 1',body:`令 ${M.inline('t=ax')}。零点方程 ${M.inline(String.raw`\ln x-ax=0`)} 化为 ${M.inline(String.raw`\ln t-t=\ln a`)}；因 ${M.inline('a>0')}，横向次序和中点比较不变。先画 ${M.inline(String.raw`g(t)=\ln t-t`)}。`},
  {title:'把零点变成与水平线的交点',body:`画水平线 ${M.inline(String.raw`y=\ln a`)}。在 ${M.inline('0<a<e^{-1}')} 下它低于最高点，故左侧有交点 ${M.inline(String.raw`t_1\in(0,1)`)}，右侧也会有另一个交点。`},
  {title:'用导数标出唯一极大值点',body:`${M.inline(String.raw`g'(t)=\frac1t-1`)} 在 ${M.inline('t=1')} 两侧由正变负。标出唯一极值位置 ${M.inline('t_0=1')}；原横轴上对应 ${M.inline(String.raw`x_0=\frac1a`)}。`},
  {title:'将左根关于 t=1 镜像',body:`在右侧标出镜像 ${M.inline('t_*=2-t_1')}。${M.inline('g(t_*)>g(t_1)')}：镜像点仍在根的水平线上方，不能把它误当作右根。证明中用导数严格说明这个高度差。`},
  {title:'继续向右，才到真正的右根',body:`${M.inline('g')} 在 ${M.inline(String.raw`(1,+\infty)`)} 严格递减，所以需要走到 ${M.inline('t_2>2-t_1')} 才降回同一水平线。右侧距离更长，极大值点偏在两根中点的左边。`},
  {title:'用中点比较读出左偏移',body:`画出 ${M.inline(String.raw`\mu=\frac{t_1+t_2}{2}`)}，并在右图局部放大它与 ${M.inline('1')} 的位置。${M.inline(String.raw`\mu>1`)} 即 ${M.inline(String.raw`\frac{x_1+x_2}{2}>x_0`)}，正是题目定义的左偏移。`}
 ];const cubic=state.kind==='cubic';const result=[
  {title:cubic?'只画正半轴上的函数':'先画抛物线',body:cubic?`将 ${M.inline('f(x)')} 因式分解为 ${M.inline('(x-m)(x-1)(x+1)')}。图只讨论 ${M.inline('x>0')}；负根 ${M.inline('-1')} 不属于本问的两个零点。`:`第一问定义域是 ${M.inline(String.raw`\mathbf R`)}，先画 ${M.inline('y=x^2-1')}，它关于纵轴对称。`},
  {title:'标出定义域内的两个零点',body:cubic?`${M.inline(String.raw`m>0,m\ne1`)} 保证正根 ${M.inline('1,m')} 不同。按从左到右标为 ${M.inline(String.raw`x_1=\min\{1,m\},x_2=\max\{1,m\}`)}。`:`与横轴的两个交点分别是 ${M.inline('x_1=-1,x_2=1')}。`},
  {title:'由导数定位唯一极值点',body:cubic?`${M.inline(String.raw`f'(x)=3x^2-2mx-1`)} 在正半轴仅有一个零点 ${M.inline(String.raw`x_0=\frac{m+\sqrt{m^2+3}}3`)}，它是唯一极小值点。`:`${M.inline(String.raw`f'(x)=2x`)}，所以唯一极小值点位于 ${M.inline('x_0=0')}。`},
  {title:'再画两个零点的中点',body:`中点是两个零点横坐标的平均，${M.inline(cubic?String.raw`h=\frac{m+1}{2}`:String.raw`h=\frac{-1+1}{2}=0`)}。把它的竖线与极值点的竖线比较；不要把“左偏移”理解为图形整体向左平移。`}
 ];if(cubic)result.push({title:'检查中点处的斜率',body:`代入中点，${M.inline(String.raw`f'(h)=-\frac{(m-1)^2}{4}<0`)}。函数在中点还在下降，必先经过中点，之后才到唯一极小值点。因此 ${M.inline('h<x_0')}。`});result.push({title:cubic?'放大位置差，读出右偏移':'中点与极值点重合',body:cubic?`右图把 ${M.inline('h')} 与 ${M.inline('x_0')} 附近的真实横坐标局部放大。${M.inline('x_0>h')}，极值点在两根中点的右侧，故为右偏移。`:`两个位置都是 ${M.inline('0')}，没有严格不等式；因此既不是左偏移，也不是右偏移。`});return result;}
 const construction=H.construction(host,steps,render);
 host.innerHTML=`<div class="controls"><label>小问 <select id="q21-kind"><option value="quadratic">（1）对称抛物线</option><option value="cubic">（2）三次函数</option><option value="log">（3）对数函数</option></select></label><label id="q21-m-wrap">m <input id="q21-m" type="number" min=".2" max="4" step=".1" value="2"></label><label id="q21-a-wrap">a <input id="q21-a" type="number" min=".02" max=".4" step=".01" value=".2"></label><button id="q21-boundary">检查排除的边界</button><span class="hint">右图放大中点与极值点的横向位置</span></div><div class="figures"><svg id="q21-curve" class="figure" role="img" aria-label="函数、两个零点、唯一极值点和零点中点"></svg><svg id="q21-position" class="figure" role="img" aria-label="极值点与零点中点的真实横坐标局部放大"></svg></div><div id="q21-readout" class="readout"></div><div id="q21-explain" class="explain"></div>`;
 const el=id=>host.querySelector('#q21-'+id);
 function render(){const m=model(),log=state.kind==='log',cubic=state.kind==='cubic',finalIndex=steps().length-1,midStep=log?5:3,showMid=construction.show(midStep);el('kind').value=state.kind;el('m').value=state.m;el('a').value=state.a;el('m-wrap').hidden=!cubic;el('a-wrap').hidden=!log;el('boundary').hidden=state.kind==='quadratic';el('position').toggleAttribute('hidden',!construction.show(finalIndex));
  const p=Lab.plot(el('curve'),{xmin:m.xmin,xmax:m.xmax,ymin:m.ymin,ymax:m.ymax,equal:false,pad:52});p.axes({x:m.axis,y:'y'});p.curve(m.fn,m.xmin,m.xmax,{stroke:C.blue,width:2.8});p.screenMath(16,29,m.formula,{color:C.blue,size:20});
  if(log&&construction.show(1)){
    p.line([m.xmin,m.level],[m.xmax,m.level],{stroke:C.gold,width:1.8,dash:'5 4'});
    const curveSegments=Array.from({length:320},(_,i)=>{const a=m.xmin+(m.xmax-m.xmin)*i/320,b=m.xmin+(m.xmax-m.xmin)*(i+1)/320;return [[a,m.fn(a)],[b,m.fn(b)]];});
    p.math([m.xmax*.83,m.level],String.raw`y=\ln a`,{color:C.gold,anchor:'end',dy:-18,size:18,priority:8,avoidSegments:[...curveSegments,[[m.xmin,m.level],[m.xmax,m.level]]]});
  }
  if(construction.show(1)&&m.roots.length){for(let i=0;i<m.roots.length;i++){if(i===1&&(!m.valid||log&&!construction.show(4)))continue;const x=m.roots[i];p.dot([x,m.level],!m.valid?'唯一零点':log?'t'+(i?'₂':'₁'):'x'+(i?'₂':'₁'),C.gold,i?10:-22,27);}}
  if(construction.show(2)){p.line([m.x0,m.level],[m.x0,m.fn(m.x0)],{stroke:C.green,width:1.7,dash:'4 4'});p.dot([m.x0,m.fn(m.x0)],log?'t₀ = 1':'x₀',C.green,14,25);}
  if(log&&m.valid&&construction.show(3)){p.line([m.mirror,m.level],[m.mirror,m.fn(m.mirror)],{stroke:C.target,width:2.5});p.dot([m.mirror,m.fn(m.mirror)],'镜像点',C.target,10,-15);p.math([m.mirror,m.level],'2-t_1',{color:C.target,dx:10,dy:28,size:18});}
  if(showMid&&m.valid){p.line([m.h,m.ymin],[m.h,m.ymax*.85],{stroke:C.gold,width:1.4,dash:'2 5'});p.math([m.h,m.level],log?String.raw`\mu`:'h',{color:C.gold,dx:-17,dy:-25,size:20});}
  if(cubic&&m.valid&&construction.show(4)){const d=(m.roots[1]-m.roots[0])*.28;p.line([m.h-d,m.fn(m.h)-m.probe*d],[m.h+d,m.fn(m.h)+m.probe*d],{stroke:C.target,width:2.2});}
  if(!m.valid)p.screenText(16,p.h-20,cubic?'m = 1：只有一个正零点，不满足偏移定义':state.a===1/Math.E?'a = e⁻¹：仅一个重根，不满足偏移定义':'水平线高于最大值：没有两个零点',{color:C.target,size:16});p.finish();
  if(construction.show(finalIndex)){
    // Use a rationalized difference before translating/scaling the inset.
    // Direct subtraction of nearly equal x0 and h loses the very relation being taught.
    const delta=cubic?m.offsetDelta:m.x0-m.h;
    const resolved=m.valid&&(state.kind==='quadratic'||cubic&&delta>0||log&&delta<-1e-9);
    const localX=resolved&&delta!==0?Math.sign(delta):0,lo=Math.min(0,localX)-1.8,hi=Math.max(0,localX)+1.8;
    const q=Lab.plot(el('position'),{xmin:lo,xmax:hi,ymin:-.9,ymax:1.2,equal:false,pad:56});
    q.screenText(16,29,m.valid&&m.sign?'横坐标局部放大 · 以中点为原点':'比较横坐标位置',{color:C.ink,size:17});
    if(resolved){
      q.line([lo,0],[hi,0],{stroke:C.gray,width:1.5});
      if(state.kind==='quadratic')q.dot([0,0],'h = x₀',C.target,10,-22);
      else{
        q.line([0,-.1],[0,.1],{stroke:C.gold,width:2.2});q.line([localX,-.1],[localX,.1],{stroke:C.green,width:2.2});
        q.math([0,0],log?String.raw`\mu`:'h',{color:C.gold,dy:34,anchor:'middle',size:23});
        q.math([localX,0],log?'t_0=1':'x_0',{color:C.green,dy:-24,anchor:'middle',size:23});
        q.line([0,.55],[localX,.55],{stroke:C.target,width:3.2});
        q.line([localX,.55],[localX-Math.sign(delta)*.2,.63],{stroke:C.target,width:2});
        q.line([localX,.55],[localX-Math.sign(delta)*.2,.47],{stroke:C.target,width:2});
        q.screenMath(16,65,cubic?String.raw`\delta=x_0-h\approx${M.number(delta,3)}`:String.raw`\mu-1\approx${M.number(-delta,3)}`,{color:C.target,size:19});
      }
      q.screenMath(16,q.h-22,log?String.raw`\mu>1\quad\text{左偏移}`:cubic?String.raw`h<x_0\quad\text{右偏移}`:String.raw`h=x_0=0\quad\text{不偏移}`,{color:C.target,size:23});
    }else if(m.valid){
      q.screenText(16,q.h*.43,'偏移小于当前数值分辨能力',{color:C.target,size:18});
      q.screenText(16,q.h*.43+32,'此处不把相近读数画成精确重合',{color:C.gray,size:16});
      q.screenMath(16,q.h-22,String.raw`\text{证明保证}\ \mu>1`,{color:C.target,size:23});
    }else q.screenText(16,q.h/2,'未满足两个不同零点的前提',{color:C.target,size:18});
    q.finish();
  }else el('position').replaceChildren();
  el('readout').innerHTML=`${m.valid?`<span>${M.inline(log?String.raw`t_0=1,\ \mu\approx${M.number(m.h,5)}`:String.raw`x_0\approx${M.number(m.x0,5)},\ h\approx${M.number(m.h,5)}`)}</span>`:'<span class="warning">当前参数违反对应小问的前提。</span>'}${M.answer('（1）不偏移；（2）右偏移；（3）左偏移。')}`;
  el('explain').innerHTML=state.kind==='quadratic'?`<section class="proof-step"><h3>严格不等式不成立</h3><p>两根为 ${M.inline('-1,1')}，唯一极小值点为 ${M.inline('0')}。两根中点也为 ${M.inline('0')}，因此两种偏移都没有发生。</p></section>`:cubic?`<section class="proof-step"><h3>两个正根与唯一正极值点</h3>${M.block(String.raw`f(x)=(x-m)(x-1)(x+1)`)}<p>在正半轴上，两个根为 ${M.inline('1,m')}。导数 ${M.inline('3x^2-2mx-1')} 只有一个正根 ${M.inline(String.raw`x_0=\frac{m+\sqrt{m^2+3}}3`)}，其左侧函数下降、右侧上升。</p></section><section class="proof-step"><h3>中点处还在下降</h3>${M.block(String.raw`h=\frac{m+1}{2},\quad f'(h)=-\frac{(m-1)^2}{4}<0.`)}<p>所以 ${M.inline('h<x_0')}，即极值点右偏移。这个符号证明适用于所有 ${M.inline(String.raw`m>0,m\ne1`)}，无须从相近的近似读数判断大小。</p></section>`:`<section class="proof-step"><h3>先验证定义的前提</h3><p>${M.inline(String.raw`f'(x)=\frac1x-a`)}，唯一极大值点为 ${M.inline(String.raw`x_0=\frac1a`)}，最大值 ${M.inline(String.raw`-\ln a-1>0`)}。两端 ${M.inline(String.raw`x\to0^+,x\to+\infty`)} 时函数趋于 ${M.inline(String.raw`-\infty`)}，结合两侧严格单调，恰有两个零点。</p></section><section class="proof-step"><h3>镜像点仍在同一水平线上方</h3><p>令 ${M.inline('t=ax')}，${M.inline(String.raw`g(t)=\ln t-t`)}，根满足 ${M.inline(String.raw`g(t_1)=g(t_2)=\ln a`)}，且 ${M.inline('0<t_1<1<t_2')}。令 ${M.inline(String.raw`h=1-t_1\in(0,1)`)}，则</p>${M.block(String.raw`g(1+h)-g(1-h)=\ln\frac{1+h}{1-h}-2h=:H(h).`)}${M.block(String.raw`H(0)=0,\quad H'(h)=\frac{2h^2}{1-h^2}>0.`)}<p>故 ${M.inline('g(2-t_1)>g(t_1)=g(t_2)')}。由于 ${M.inline('g')} 在 ${M.inline(String.raw`(1,+\infty)`)} 严格递减，有 ${M.inline('t_2>2-t_1')}，于是 ${M.inline(String.raw`\frac{t_1+t_2}{2}>1`)}。除以正数 ${M.inline('a')} 即得 ${M.inline(String.raw`\frac{x_1+x_2}{2}>x_0`)}。</p></section>`;
 }
 el('kind').onchange=e=>{state.kind=e.target.value;construction.restart();render();};for(const k of ['m','a'])el(k).onchange=e=>{const v=+e.target.value;if(Number.isFinite(v))state[k]=Math.max(k==='m'?.2:.02,Math.min(k==='m'?4:.4,v));render();};el('boundary').onclick=()=>{if(state.kind==='cubic')state.m=1;else state.a=1/Math.E;render();};return{render,...construction.api,getState:()=>({...state,roots:model().roots,x0:model().x0,midpoint:model().h,valid:model().valid}),reset(){state={kind:'quadratic',m:2,a:.2};construction.restart();render();}};
}};
