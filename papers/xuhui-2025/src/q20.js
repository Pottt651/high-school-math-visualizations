Problems[20]={
  title:'焦点弦：等角与定圆心角',
  statement:`双曲线过 ${M.inline(String.raw`P(3,\sqrt2)`)}，渐近线为 ${M.inline(String.raw`x\pm\sqrt3y=0`)}。过右焦点 ${M.inline('F')} 的直线 ${M.inline('l')} 与两坐标轴都不垂直，并交右支于 ${M.inline('A,B')}。<span class="statement-part">（1）求标准方程；（2）设 ${M.inline(String.raw`Q(\frac32,0)`)}，证明 <span class="target">${M.inline(String.raw`\angle AQF=\angle BQF`)}</span>；（3）以 ${M.inline('AB')} 为直径的圆被 ${M.inline(String.raw`x=\frac32`)} 截得劣弧 ${M.inline('MN')}，求其<span class="target">圆心角是否为定值</span>。</span>`,
  mount(host){
    const C=Lab.C;let angle=65,mode='circle',step=null,plot,drag=false;
    const show=n=>step===null||step>=n;
    const steps=()=>[
      {title:'由点和渐近线确定双曲线',body:`渐近线给出 ${M.inline(String.raw`a^2=3b^2`)}；代入 ${M.inline(String.raw`P(3,\sqrt2)`)} 得 ${M.inline(String.raw`\frac{x^2}{3}-y^2=1`)}，先画曲线与两条渐近线。`},
      {title:'过焦点作弦，标出 Q',body:`由 ${M.inline(String.raw`c=\sqrt{3+1}=2`)} 标出 ${M.inline('F(2,0)')}。直线过 ${M.inline('F')} 与右支相交于 ${M.inline('A,B')}，再标 ${M.inline(String.raw`Q(\frac32,0)`)}。倾角须在 ${M.inline(String.raw`(30^\circ,150^\circ)\setminus\{90^\circ\}`)} 内。`},
      {title:'连接 QA、QB，比较两个角',body:`连接 ${M.inline('QA,QB')}，以水平射线 ${M.inline('QF')} 为共同边。转动弦时比较红色的两个角；${M.inline('A,B')} 始终在 ${M.inline('Q')} 的右侧。`},
      ...(mode==='circle'?[
        {title:'以 AB 为直径画圆',body:`取 ${M.inline('AB')} 中点 ${M.inline('K')} 为圆心，${M.inline(String.raw`R=\frac{|AB|}{2}`)} 为半径画圆。弦转动时，圆心位置与半径一起变化。`},
        {title:'画截线与圆心到截线的垂线',body:`画 ${M.inline(String.raw`x=\frac32`)}，与圆交于 ${M.inline('M,N')}。作 ${M.inline(String.raw`KH\perp MN`)}，于是直角三角形 ${M.inline('KHM')} 的斜边是半径 ${M.inline('R')}，邻边是距离 ${M.inline('d')}。`},
        {title:'缩放到单位半径，显出不变比例',body:`把圆心移到原点并按半径统一缩放，右图半径变成 ${M.inline('1')}。${M.inline(String.raw`\frac dR=\frac{\sqrt3}{2}`)} 保持不变，所以 ${M.inline(String.raw`\cos\frac\theta2=\frac{\sqrt3}{2}`)}，红色劣弧圆心角固定为 ${M.inline(String.raw`\theta=\frac\pi3`)}。`}
      ]:[])
    ];
    host.innerHTML=`<div class="controls"><label>观察 <select id="x20-mode"><option value="circle">（3）圆心角为何不变</option><option value="angles">（2）两个角为何相等</option></select></label><label>直线倾角 <input id="x20-angle" aria-label="直线倾角" type="range" min="31" max="149" step="1" value="65"><output id="x20-angle-value"></output></label><button id="x20-near">靠近渐近线</button><button id="x20-vertical">检查 90°</button><label id="x20-normal-label"><input type="checkbox" id="x20-normal">对照单位半径</label></div><div class="figures"><svg id="x20-main" class="main-figure" role="img" aria-label="双曲线焦点弦、直径圆与截线"></svg><svg id="x20-unit" class="figure" role="img" aria-label="按半径缩放后的固定弦心距" hidden></svg></div><div class="readout" id="x20-readout"></div><div class="explain">
      <section class="proof-step"><h3>先确定曲线与合法直线</h3><p>由渐近线和已知点解得 ${M.inline(String.raw`a^2=3,b^2=1`)}，故 ${M.inline('F(2,0)')}。写直线为 ${M.inline('x=2+ty')}，代入曲线：</p>${M.block(String.raw`(3-t^2)y^2-4ty-1=0`)}<p>两交点同在右支且不垂直坐标轴，充要为 ${M.inline(String.raw`0<|t|<\sqrt3`)}。${M.inline('t=0')} 虽有两个右支交点，但直线竖直，被原题排除；${M.inline(String.raw`|t|=\sqrt3`)} 时退化为一次方程。</p></section>
      <section class="proof-step"><h3>韦达关系解释等角</h3><p>令 ${M.inline('D=3-t^2>0')}，则</p>${M.block(String.raw`y_A+y_B=\frac{4t}{D},\qquad y_Ay_B=-\frac1D`)}${M.block(String.raw`k_{QA}=\frac{y_A}{\frac12+ty_A}`)}<p>两斜率相加后，分母非零，分子为</p>${M.block(String.raw`\frac12(y_A+y_B)+2ty_Ay_B=0`)}<p>由于 ${M.inline(String.raw`x_A,x_B\ge\sqrt3>\frac32`)}，两个点都在 ${M.inline('Q')} 的右侧，斜率互为相反数就给出 ${M.inline(String.raw`\angle AQF=\angle BQF`)}。</p></section>
      <section class="proof-step"><h3>半径与距离同时变化</h3>${M.block(String.raw`K=\left(\frac6D,\frac{2t}D\right)`)}${M.block(String.raw`R=\frac{\sqrt3(1+t^2)}D,\quad d=\frac{3(1+t^2)}{2D}`)}<p>两者共同含有 ${M.inline(String.raw`\frac{1+t^2}{D}`)}，相除后参数消去：</p>${M.block(String.raw`\frac dR=\frac{\sqrt3}{2}<1`)}<p>因此截线始终与圆交于两点。统一缩放保留角度及长度比例。</p></section>
      <section class="proof-step"><h3>用半个圆心角完成证明</h3><p>在直角三角形 ${M.inline('KHM')} 中，</p>${M.block(String.raw`\cos\frac\theta2=\frac{KH}{KM}=\frac dR=\frac{\sqrt3}{2}`)}<p>因 ${M.inline(String.raw`0<\theta<\pi`)} 是劣弧圆心角，故 <span class="target">${M.inline(String.raw`\theta=\frac\pi3=60^\circ`)}</span>。观察数值只提出猜想，这个比例才解释了定值。</p></section></div>`;
    const svg=host.querySelector('#x20-main'),unit=host.querySelector('#x20-unit'),range=host.querySelector('#x20-angle'),normal=host.querySelector('#x20-normal');
    function arc(p,center,r,a,b,color,width=2){const pts=Array.from({length:61},(_,i)=>[center[0]+r*Math.cos(a+(b-a)*i/60),center[1]+r*Math.sin(a+(b-a)*i/60)]);p.add(`<polyline points="${pts.map(z=>p.to(z).join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}"/>`);}
    const minorSegments=(center,r)=>Array.from({length:48},(_,i)=>{const point=n=>[center[0]+r*Math.cos((5/6+n/144)*Math.PI),center[1]+r*Math.sin((5/6+n/144)*Math.PI)];return [point(i),point(i+1)];});
    function render(){
      const z=XuhuiMath.chord(angle),circle=mode==='circle',unitVisible=circle?((step===null&&normal.checked)||(step!==null&&show(5))):show(2);
      unit.toggleAttribute('hidden',!unitVisible);host.querySelector('#x20-normal-label').hidden=!circle;range.value=angle;host.querySelector('#x20-angle-value').textContent=`${angle}°`;
      const wide=step===0;const xs=wide?[-2.6,3]:[1.2,2.8,z.A[0],z.B[0]],ys=wide?[-2.3,2.3]:[-.45,.45,z.A[1],z.B[1]];
      if(circle&&show(3)){xs.push(z.K[0]-z.R,z.K[0]+z.R);ys.push(z.K[1]-z.R,z.K[1]+z.R);}
      const minx=Math.min(...xs),maxx=Math.max(...xs),miny=Math.min(...ys),maxy=Math.max(...ys),margin=Math.max(.22,(maxx-minx)*.09);
      const p=Lab.plot(svg,{xmin:minx-margin,xmax:maxx+margin,ymin:miny-margin,ymax:maxy+margin,pad:40});plot=p;
      if(wide)p.axes();else{p.line([minx-margin,0],[maxx+margin,0],{stroke:C.gray,width:1});p.text([maxx+margin,0],'x',{color:C.gray,dy:20,anchor:'end'});}
      p.curve(x=>x/Math.sqrt(3),minx-margin,maxx+margin,{stroke:C.gray,dash:'5 6',width:1});p.curve(x=>-x/Math.sqrt(3),minx-margin,maxx+margin,{stroke:C.gray,dash:'5 6',width:1});
      const limit=Math.max(Math.abs(miny),Math.abs(maxy))+margin;
      for(const sign of [-1,1]){const pts=Array.from({length:501},(_,i)=>{const y=miny-margin+(maxy-miny+2*margin)*i/500;return[sign*Math.sqrt(3*(1+y*y)),y];}).filter(a=>a[0]>=minx-margin&&a[0]<=maxx+margin);p.add(`<polyline points="${pts.map(a=>p.to(a).join(',')).join(' ')}" fill="none" stroke="${C.blue}" stroke-width="2.5" />`);}
      if(show(1)){
        p.line(z.A,z.B,{stroke:C.ink,width:2.4});p.dot([2,0],'F',C.gold);p.dot([1.5,0],circle&&show(4)&&(angle===60||angle===120)?(angle===60?'Q = N':'Q = M'):'Q',C.green,-23,21);p.dot(z.A,'A',C.blue);p.dot(z.B,'B',C.blue);
      }
      if(show(2)){
        p.line([1.5,0],z.A,{stroke:circle?C.gray:C.target,width:1.8,opacity:circle?.28:1,dash:circle?'5 5':undefined});p.line([1.5,0],z.B,{stroke:circle?C.gray:C.target,width:1.8,opacity:circle?.28:1,dash:circle?'5 5':undefined});
        if(!circle||!show(3)){arc(p,[1.5,0],.32,0,z.angleA,C.target);arc(p,[1.5,0],.42,-z.angleB,0,C.target);}
      }
      if(circle&&show(3)){p.circle(z.K,z.R,{stroke:C.green,width:2});p.dot(z.K,'K',C.green,8,19);}
      if(circle&&show(4)){
        p.line([1.5,miny-margin/2],[1.5,maxy+margin/2],{stroke:C.gray,dash:'6 6',width:1.4});p.line(z.M,z.N,{stroke:C.ink,width:2});p.line(z.K,z.H,{stroke:C.gold,width:2,dash:'5 4'});p.line(z.K,z.M,{stroke:C.green,width:2});p.line(z.K,z.N,{stroke:C.green,width:1.5});
        p.dot(z.M,angle===120?'':'M',C.ink,-22,-12);p.dot(z.N,angle===60?'':'N',C.ink,-23,19);p.dot(z.H,'',C.gold);p.math(z.H,'H',{color:C.gold,dx:-30,dy:-18,size:18,priority:6,avoidSegments:minorSegments(z.K,z.R)});
        const a=5*Math.PI/6,b=7*Math.PI/6;arc(p,z.K,z.R,a,b,C.target,4);arc(p,z.K,Math.min(z.R*.3,(maxx-minx)*.09),a,b,C.target,2);
        p.math([(z.K[0]+z.H[0])/2,z.K[1]],'d',{color:C.gold,dy:23,anchor:'middle'});p.math([(z.K[0]+z.M[0])/2,(z.K[1]+z.M[1])/2],'R',{color:C.green,dy:-12});
        p.math([z.K[0]-Math.min(z.R*.46,(maxx-minx)*.15),z.K[1]],String.raw`\theta`,{color:C.target,dy:-12});
      }
      p.screenText(14,25,!z.valid?'90°：当前直线不符合原题条件':step!==null?steps()[step].title:circle?'右支局部：比较距离 d 与半径 R':'连接 QA、QB：观察水平线两侧的两个角',{size:16,color:z.valid?C.ink:C.target});
      p.finish();
      if(unitVisible&&circle){
        const q=Lab.plot(unit,{xmin:-1.5,xmax:1.45,ymin:-1.35,ymax:1.45,pad:32}),d=Math.sqrt(3)/2;
        q.circle([0,0],1,{stroke:C.green,width:2});q.line([-d,-1.15],[-d,1.15],{stroke:C.gray,dash:'5 5',width:1.4});q.poly([[0,0],[-d,0],[-d,.5]],{fill:C.gold,opacity:.10,stroke:'none'});q.line([0,0],[-d,.5],{stroke:C.green,width:2.5});q.line([0,0],[-d,-.5],{stroke:C.green,width:2});q.line([0,0],[-d,0],{stroke:C.gold,dash:'5 4',width:2});arc(q,[0,0],1,5*pi/6,7*pi/6,C.target,4);arc(q,[0,0],.28,5*pi/6,7*pi/6,C.target);
        q.dot([0,0],'K′',C.green,10,20);q.dot([-d,.5],'M′',C.ink,-25,-15);q.dot([-d,-.5],'N′',C.ink,-25,23);q.dot([-d,0],'',C.gold);q.math([-d,0],String.raw`H'`,{color:C.gold,dx:-30,dy:-18,size:18,priority:6,avoidSegments:minorSegments([0,0],1)});q.math([-.36,.34],'1',{color:C.green,size:21});q.math([-.45,-.20],String.raw`\frac{\sqrt3}{2}`,{color:C.gold,size:20,anchor:'middle'});q.math([-.18,.06],String.raw`\theta`,{color:C.target,dx:20,size:21});q.screenText(14,25,'圆心归零，所有长度同除以 R',{size:16});q.screenMath(14,q.h-14,String.raw`\cos\frac\theta2=\frac dR=\frac{\sqrt3}{2}`,{size:19,color:C.target});q.finish();
      }
      if(unitVisible&&!circle){
        const q=Lab.plot(unit,{xmin:-.35,xmax:1.55,ymin:-1.3,ymax:1.3,pad:38}),Q=[0,0];
        const upper=[1.17*Math.cos(z.angleA),1.17*Math.sin(z.angleA)],lower=[1.17*Math.cos(z.angleB),-1.17*Math.sin(z.angleB)];
        q.line(Q,[1.3,0],{stroke:C.gray,width:1.4});q.line(Q,upper,{stroke:C.target,width:2.5});q.line(Q,lower,{stroke:C.target,width:2.5});
        arc(q,Q,.36,0,z.angleA,C.target);arc(q,Q,.46,-z.angleB,0,C.target);
        q.dot(Q,'Q',C.green,-22,8);q.text(upper,'沿 QA 的方向',{color:C.blue,dx:8,dy:-13,size:16});q.text(lower,'沿 QB 的方向',{color:C.blue,dx:8,dy:26,size:16});q.text([1.3,0],'QF',{color:C.gray,dy:22,anchor:'end'});
        q.screenText(14,25,'Q 附近：截取两条射线比较角度',{size:16});q.screenText(14,q.h-16,'射线方向来自左图；这里的线端不是 A、B。',{size:14,color:C.gray});q.finish();
      }
      host.querySelector('#x20-readout').innerHTML=`${!z.valid?'<span class="warning">当前竖直弦被题设排除，请转离 90°。</span>':''}${circle?`<span>${M.inline(String.raw`R\approx${M.number(z.R,3)}`)}</span><span>${M.inline(String.raw`d\approx${M.number(z.d,3)}`)}</span><span class="target">${M.inline(String.raw`\theta\approx${M.number(z.theta*180/pi,2)}^\circ`)}</span>`:`<span class="target">${M.inline(String.raw`\angle AQF\approx${M.number(z.angleA*180/pi,2)}^\circ`)}</span><span class="target">${M.inline(String.raw`\angle BQF\approx${M.number(z.angleB*180/pi,2)}^\circ`)}</span>`}${M.answer(`（1）${M.inline(String.raw`\frac{x^2}{3}-y^2=1`)}；（2）两角相等；（3）${M.inline(String.raw`\theta=\frac\pi3`)}。`)}<small>倾角接近 30° 或 150° 时交点远离，图形自动扩大观察范围；角度和长度比例保持真实。</small>`;
    }
    const pi=Math.PI;
    function changeMode(){mode=host.querySelector('#x20-mode').value;if(step!==null)step=0;host.dispatchEvent(new Event('constructionchange'));render();}
    range.oninput=()=>{angle=+range.value;render();};host.querySelector('#x20-mode').onchange=changeMode;normal.onchange=render;host.querySelector('#x20-near').onclick=()=>{angle=angle<90?31:149;render();};host.querySelector('#x20-vertical').onclick=()=>{angle=90;render();};
    svg.onpointerdown=e=>{if(!show(1))return;const pt=plot.fromEvent(e),z=XuhuiMath.chord(angle),screen=plot.to(pt),near=[z.A,z.B].some(a=>Math.hypot(...plot.to(a).map((v,i)=>v-screen[i]))<24);if(!near)return;drag=true;svg.setPointerCapture(e.pointerId);};
    svg.onpointermove=e=>{if(!drag)return;const p=plot.fromEvent(e);let a=Math.atan2(p[1],p[0]-2)*180/pi;if(a<0)a+=180;angle=Math.max(31,Math.min(149,Math.round(a)));render();};svg.onpointerup=()=>drag=false;svg.onpointercancel=()=>drag=false;
    render();return {render,getConstructionSteps:steps,getConstructionStep:()=>step,setConstructionStep(i){step=i===null?null:Math.max(0,Math.min(steps().length-1,i));render();},reset(){angle=65;mode='circle';normal.checked=false;host.querySelector('#x20-mode').value=mode;if(step!==null)step=0;host.dispatchEvent(new Event('constructionchange'));render();},getState(){const z=XuhuiMath.chord(angle);return {angle,mode,normalized:normal.checked,valid:z.valid,A:z.A,B:z.B,K:z.K,radius:z.R,distance:z.d,theta:z.theta};}};
  }
};
