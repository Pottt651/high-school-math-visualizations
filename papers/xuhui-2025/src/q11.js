Problems[11]={
 title:'双圆台：同角展开与母线',
 statement:`上圆台的上、下底面直径为 ${M.inline('30,26\\ \\mathrm{cm}')}，下圆台为 ${M.inline('24,18\\ \\mathrm{cm}')}。两侧面展开圆弧的圆心角相等；上圆台高 ${M.inline('8\\ \\mathrm{cm}')}。求两部分母线长之和。〔原卷第2页〕`,
 mount(host){
  const C=Lab.C,alpha=2*Math.PI/Math.sqrt(17);let turn=.55,step=null;const show=n=>step===null||step>=n;
  const steps=[
   {title:'直径减半，画两个轴截面',body:`上部分半径为 ${M.inline('15,13')}，下部分为 ${M.inline('12,9')}。先画两个等腰梯形轴截面；圆台的母线就是斜边，不是竖直高。`},
   {title:'用直角三角形求上母线',body:`上部分半径差为 ${M.inline('15-13=2')}，高为 ${M.inline('8')}。补出直角三角形，得 ${M.inline(String.raw`l_1=\sqrt{8^2+2^2}=2\sqrt{17}`)}。`},
   {title:'画上部分扇环，使用弧长关系',body:`展开外、内半径分别为 ${M.inline(String.raw`15\sqrt{17}`)}、${M.inline(String.raw`13\sqrt{17}`)}；同一半径上的宽度是 ${M.inline('l_1')}。外弧减内弧满足 ${M.inline(String.raw`\alpha l_1=2\pi(15-13)=4\pi`)}，故 ${M.inline(String.raw`\alpha=\frac{2\pi}{\sqrt{17}}`)}。`},
   {title:'按同一个角画下部分扇环',body:`下部分使用相同的 ${M.inline('\\alpha')}，因此 ${M.inline(String.raw`\alpha l_2=2\pi(12-9)=6\pi`)}，得 ${M.inline(String.raw`l_2=3\sqrt{17}`)}。下扇环外、内半径是 ${M.inline(String.raw`12\sqrt{17}`)}、${M.inline(String.raw`9\sqrt{17}`)}。右图同心对齐并按相同比例缩小，不把原底面半径当作展开半径。`},
   {title:'比较径向宽度并求和',body:`转动右图同一条半径，两条红线始终分别是 ${M.inline(String.raw`2\sqrt{17}`)} 与 ${M.inline(String.raw`3\sqrt{17}`)}。母线比等于半径差之比 ${M.inline('2:3')}，故总长 ${M.inline(String.raw`l_1+l_2=5\sqrt{17}\ \mathrm{cm}`)}。`}
  ];
  host.innerHTML=`<div class="controls"><label>共同半径的位置 <input id="q11-turn" type="range" min="0" max="1" step=".005" value=".55"></label><span class="hint">转动同一条半径，比较两个扇环的宽度</span></div><div class="figures"><svg id="q11-section" class="figure" role="img" aria-label="两个圆台的轴截面及母线"></svg><svg id="q11-sector" class="figure" role="img" aria-label="同角同心对齐的两个扇环展开图"></svg></div><div class="readout">${M.inline(String.raw`l_1=2\sqrt{17}\ \mathrm{cm},\quad l_2=3\sqrt{17}\ \mathrm{cm}`)}${M.answer(M.inline(String.raw`5\sqrt{17}\ \mathrm{cm}`))}</div><div class="explain"><section class="proof-step"><h3>上母线来自勾股定理</h3>${M.block(String.raw`l_1=\sqrt{8^2+(15-13)^2}=2\sqrt{17}`)}</section><section class="proof-step"><h3>同角给出母线比例</h3><p>设展开扇环外、内半径为 ${M.inline('L,R')}。由弧长 ${M.inline('\\alpha L=2\\pi r_1')}、${M.inline('\\alpha R=2\\pi r_2')}，相减得 ${M.inline('\\alpha(L-R)=2\\pi(r_1-r_2)')}，而 ${M.inline('L-R=l')}。</p>${M.block(String.raw`\frac{l_1}{l_2}=\frac{15-13}{12-9}=\frac23`)}<p class="target">${M.inline(String.raw`l_1+l_2=5\sqrt{17}\ \mathrm{cm}`)}</p></section></div>`;
  function render(){
   const p=Lab.plot(host.querySelector('#q11-section'),{xmin:-19,xmax:19,ymin:-3,ymax:25,equal:true,pad:35});
   p.poly([[-15,20],[15,20],[13,12],[-13,12]],{stroke:C.blue,fill:C.blue,opacity:.15,width:2});p.poly([[-12,12],[12,12],[9,0],[-9,0]],{stroke:C.gold,fill:C.gold,opacity:.15,width:2});
   p.line([0,0],[0,20],{stroke:C.gray,dash:'5 5'});[[15,20,'15'],[13,12,'13'],[-12,12,'12'],[-9,0,'9']].forEach(([x,y,label])=>{p.line([0,y],[x,y],{stroke:x>0?C.blue:C.gold,width:1.5});p.math([x/2,y],label,{color:x>0?C.blue:C.gold,size:18,dy:y===12?23:-14});});
   if(show(1)){p.line([13,12],[13,20],{stroke:C.green,dash:'4 4'});p.math([13,16],'8',{color:C.green,dx:-12,size:18});p.line([13,20],[15,20],{stroke:C.green,width:2.4});p.line([13,19.5],[13.5,19.5],{stroke:C.green,width:1.6});p.line([13.5,19.5],[13.5,20],{stroke:C.green,width:1.6});p.math([14,20],'2',{color:C.green,dy:-20,size:18});p.line([13,12],[15,20],{stroke:C.target,width:3.5});p.math([14,16],String.raw`l_1=2\sqrt{17}`,{color:C.target,dx:12,size:18});}
   if(show(4)){p.line([9,0],[12,12],{stroke:C.target,width:3.5});p.math([10.5,6],String.raw`l_2=3\sqrt{17}`,{color:C.target,dx:10,size:18});}
   p.screenText(16,24,'轴截面 · 长度单位 cm',{size:18});p.finish();
   const q=Lab.plot(host.querySelector('#q11-sector'),{xmin:-1,xmax:17,ymin:-1,ymax:17,equal:true,pad:35});
   const point=(r,t)=>[r*Math.cos(t),r*Math.sin(t)],band=(inner,outer,color)=>{const vs=[];for(let i=0;i<=80;i++)vs.push(point(outer,alpha*i/80));for(let i=80;i>=0;i--)vs.push(point(inner,alpha*i/80));q.poly(vs,{stroke:color,fill:color,opacity:.18,width:2});};
   if(show(2)){band(13,15,C.blue);q.line([0,0],point(15,0),{stroke:C.gray,dash:'4 4'});q.line([0,0],point(15,alpha),{stroke:C.gray,dash:'4 4'});for(let i=1;i<=30;i++)q.line(point(3,alpha*(i-1)/30),point(3,alpha*i/30),{stroke:C.green,width:2});q.math(point(4.4,alpha/2),'\\alpha',{color:C.green,anchor:'middle',size:21});q.dot([0,0],'O',C.gray,-12,20);}
   if(show(3))band(9,12,C.gold);
   if(show(4)){const t=alpha*turn;q.line([0,0],point(15,t),{stroke:C.gray,dash:'3 4'});q.line(point(13,t),point(15,t),{stroke:C.target,width:4});q.line(point(9,t),point(12,t),{stroke:C.target,width:4});q.math(point(14,t),String.raw`2\sqrt{17}`,{color:C.target,size:18,dx:9,dy:-14});q.math(point(10.5,t),String.raw`3\sqrt{17}`,{color:C.target,size:18,dx:9,dy:22});}
   q.screenText(16,24,show(2)?'两展开图按相同比例缩小':'先在轴截面中求上母线',{size:17});if(show(3))q.screenMath(16,q.h-14,String.raw`\alpha=\frac{2\pi}{\sqrt{17}}`,{color:C.green,size:18});q.finish();
  }
  host.querySelector('#q11-turn').oninput=e=>{turn=+e.target.value;render();};render();return{render,reset(){turn=.55;host.querySelector('#q11-turn').value=turn;if(step!==null)step=0;render();host.dispatchEvent(new Event('constructionchange'));},getState(){return{turn,l1:2*Math.sqrt(17),l2:3*Math.sqrt(17),angle:alpha};},getConstructionSteps(){return steps;},getConstructionStep(){return step;},setConstructionStep(n){step=n===null?null:Math.max(0,Math.min(4,Math.trunc(Number(n)||0)));render();}};
 }
};
