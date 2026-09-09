Problems[9]={
 title:'极值点与导数重根',
 statement:`设 ${M.inline(String.raw`a\in\mathbb R,\ f(x)=x^2+ax+\ln x`)}。若函数存在两个不同的极值点，求 ${M.inline('a')} 的取值范围。〔原卷第1页〕`,
 mount(host){
  const C=Lab.C,critical=-2*Math.sqrt(2);let a=-4,step=null;
  const show=n=>step===null||step>=n;
  const steps=[
   {title:'先确定定义域并画函数',body:`由 ${M.inline('\\ln x')} 得定义域 ${M.inline('x>0')}。在左图画当前 ${M.inline('f(x)=x^2+ax+\\ln x')}，所有极值点必须位于正半轴。`},
   {title:'求导，把符号转交给二次式',body:`${M.inline(String.raw`f'(x)=\frac{2x^2+ax+1}{x}`)}。因为 ${M.inline('x>0')}，导数与 ${M.inline('q(x)=2x^2+ax+1')} 同号；在右图画这个二次式。`},
   {title:'寻找两个不同的正根',body:`极值点只能来自导数零点。标出 ${M.inline('q(x)=0')} 的正根；两不同实根要求 ${M.inline(String.raw`\Delta=a^2-8>0`)}，且和 ${M.inline('-a/2>0')}、积 ${M.inline('1/2>0')}。`},
   {title:'检查每个零点两侧是否变号',body:`开口向上的二次式在两个单根处依次由正变负、由负变正。若 ${M.inline(String.raw`a=-2\sqrt2`)}，则 ${M.inline(String.raw`q(x)=2(x-\frac1{\sqrt2})^2\ge0`)}：只有重根，两侧不变号。`},
   {title:'把变号对应回原函数',body:`右图正负变化对应左图“增—减—增”，产生极大值点和极小值点。两条件合并为 ${M.inline(String.raw`a<-2\sqrt2`)}。临界参数的驻点不成为极值点；窗口只展示曲线，结论来自全部正半轴上的符号分析。`}
  ];
  host.innerHTML=`<div class="controls"><label>${M.inline('a')} <input id="q9-a" type="range" min="-7" max="2" step=".01" value="-4"><output id="q9-value"></output></label><button data-q9-a="-4">两个极值</button><button id="q9-critical">${M.inline(String.raw`a=-2\sqrt2`)}</button><button data-q9-a="0">无极值</button></div><div class="figures"><svg id="q9-f" class="figure" role="img" aria-label="正半轴上的原函数"></svg><svg id="q9-q" class="figure" role="img" aria-label="导数分子的零点与正负号"></svg></div><div id="q9-readout" class="readout"></div><div class="explain"><section class="proof-step"><h3>两个不同正根的条件</h3>${M.block(String.raw`f'(x)=\frac{2x^2+ax+1}{x},\quad x>0`)}<p>分子需有两个不同正根，故 ${M.inline(String.raw`a^2-8>0,\ -\frac a2>0,\ \frac12>0`)}，即 ${M.inline(String.raw`a<-2\sqrt2`)}。</p></section><section class="proof-step"><h3>单根变号，重根不变号</h3><p>两单根 ${M.inline('x_1<x_2')} 对应导数符号 ${M.inline('+,-,+')}，所以分别为极大值点、极小值点。临界时导数始终非负，仅在 ${M.inline(String.raw`x=\frac1{\sqrt2}`)} 为零，函数仍严格递增，不能把驻点当作极值点。</p></section></div>`;
  function render(){
   const isCritical=a===critical,two=a<critical,roots=two?[(-a-Math.sqrt(a*a-8))/4,(-a+Math.sqrt(a*a-8))/4]:isCritical?[1/Math.sqrt(2)]:[],f=x=>x*x+a*x+Math.log(x),q=x=>2*x*x+a*x+1;
   host.querySelector('#q9-a').value=a;host.querySelector('#q9-value').innerHTML=M.inline(isCritical?String.raw`=-2\sqrt2`:String.raw`\approx${M.number(a,2)}`);
   const p=Lab.plot(host.querySelector('#q9-f'),{xmin:0,xmax:4,ymin:Math.min(-3,f(.018),...roots.map(f))-1,ymax:Math.max(1,f(4))+1,equal:false,pad:43});p.axes();p.curve(f,.018,4,{stroke:C.blue,width:2.8,n:650});p.screenMath(16,25,'f(x)=x^2+ax+\\ln x',{size:19});
   if(show(4))roots.forEach((x,i)=>{p.dot([x,f(x)],two?(i?'极小值点':'极大值点'):'驻点，非极值',two?C.target:C.gold,8,i?24:-14);});
   p.screenText(16,p.h-13,isCritical?'重根处不改变增减趋势':'定义域为 x > 0',{color:isCritical?C.gold:C.gray,size:15});p.finish();
   const r=Lab.plot(host.querySelector('#q9-q'),{xmin:0,xmax:4,ymin:-7,ymax:12,equal:false,pad:43});r.axes();
   if(show(1)){r.curve(q,0,4,{stroke:C.green,width:2.8});r.screenMath(16,25,'q(x)=2x^2+ax+1',{size:19,color:C.green});}else r.screenText(16,25,'下一步：画与导数同号的二次式',{size:17,color:C.gray});
   if(show(2))roots.forEach((x,i)=>{r.dot([x,0],'',C.target);r.math([x,0],isCritical?String.raw`\frac1{\sqrt2}`:`x_${i+1}`,{color:C.target,dy:26,size:18});});
   if(show(3)){const cuts=[0,...roots,4];for(let i=1;i<cuts.length;i++){const lo=cuts[i-1],hi=cuts[i],positive=q((lo+hi)/2)>=0;r.line([lo,-4.5],[hi,-4.5],{stroke:positive?C.green:C.target,width:4});r.math([(lo+hi)/2,-4.5],positive?'+':'-',{color:positive?C.green:C.target,dy:25,size:22,anchor:'middle'});}r.screenText(16,r.h-13,isCritical?'正 → 0 → 正：不变号':two?'正 → 负 → 正：两次变号':'正半轴上没有变号零点',{size:15,color:C.gray});}r.finish();
   host.querySelector('#q9-readout').innerHTML=`当前：${two?'两个极值点':isCritical?'一个驻点，无极值点':'无极值点'}。${M.answer(M.inline(String.raw`a\in(-\infty,-2\sqrt2)`))}`;
  }
  host.querySelector('#q9-a').oninput=e=>{a=+e.target.value;render();};host.querySelectorAll('[data-q9-a]').forEach(b=>b.onclick=()=>{a=+b.dataset.q9A;render();});host.querySelector('#q9-critical').onclick=()=>{a=critical;render();};render();
  return{render,reset(){a=-4;if(step!==null)step=0;render();host.dispatchEvent(new Event('constructionchange'));},getState(){return{a,critical:a===critical,extrema:a<critical?2:0};},getConstructionSteps(){return steps;},getConstructionStep(){return step;},setConstructionStep(n){step=n===null?null:Math.max(0,Math.min(4,Math.trunc(Number(n)||0)));render();}};
 }
};
