Problems[20]={
  title:'椭圆中的定面积',
  statement:`椭圆 ${M.inline(String.raw`\frac{x^2}{5}+\frac{y^2}{4}=1`)}，${M.inline('M')} 为弦 ${M.inline('AB')} 的中点。若 ${M.inline('k_{OM}k_{AB}=k_{OA}k_{OB}')}，求证 <span class="target">${M.inline('S_{\\triangle OAB}')}</span> 为定值，并求此值。（第 3 问）`,
  mount(host){
    const {C,fmt}=Lab;
    let state={theta:31,rho:Math.SQRT1_2,locked:true,circle:false},p,drag=null,g;
    host.innerHTML=`<div class="controls"><label>方向 ${M.inline('\\theta')} <input id="q20-angle" type="range" min="0" max="180" step=".1" value="31"><output id="q20-angle-value"></output></label><label><input id="q20-lock" type="checkbox" checked>保持题设条件</label><label id="q20-position-wrap" hidden>位置 <input id="q20-position" type="range" min="-.98" max=".98" step=".001" value=".707"><output id="q20-position-value"></output></label><label><input id="q20-circle" type="checkbox">看对应的单位圆</label></div>
    <div class="figures"><div class="q20-figure"><svg id="q20-ellipse" aria-label="椭圆和可拖动的弦"></svg></div><div class="q20-figure" id="q20-unit-wrap" hidden><svg id="q20-unit" aria-label="对应的单位圆"></svg><p class="caption">右图单独放大；数值按真实坐标计算</p></div></div><p class="caption">拖动 A、B 转动弦；取消题设条件后，可以拖动 M 平移。</p><div id="q20-readout" class="readout"></div>
    <div class="explain"><section class="proof-step"><h3>由斜率得到位置约束</h3><p>设 ${M.inline('AB:y=kx+b')}，韦达定理给出</p>${M.block(String.raw`k_{OM}k_{AB}=-\frac45,\quad k_{OA}k_{OB}=\frac{4(b^2-5k^2)}{5(b^2-4)}.`)}
    <p>两式相等，得到 ${M.inline('2b^2=4+5k^2')}；各斜率必须有定义。</p>
    </section><section class="proof-step"><h3>单位圆解释定面积</h3><p>令 ${M.inline(String.raw`x=\sqrt5u,\ y=2v`)}，弦心距与半弦长分别为</p>
    ${M.block(String.raw`d=\frac{|b|}{\sqrt{4+5k^2}}=\frac1{\sqrt2},`)}${M.block(String.raw`h=\sqrt{1-d^2}=\frac1{\sqrt2}.`)}
    <p>圆上三角形面积 ${M.inline(String.raw`dh=\frac12`)}。横纵伸缩倍数相乘，得到原面积：</p><div class="target">${M.block(String.raw`S=\sqrt5\cdot2\cdot\frac12=\sqrt5.`)}</div>
    </section><section class="proof-step"><h3>解析法直接求面积</h3>${M.block(String.raw`S=\frac{2\sqrt5|b|\sqrt{4+5k^2-b^2}}{4+5k^2}.`)}<p>代入相同约束即得 ${M.inline(String.raw`\sqrt5`)}。解除条件并平移弦，可验证定值依赖于题设约束。</p></section></div>`;
    const el=id=>host.querySelector('#q20-'+id),svg=el('ellipse'),unit=el('unit');
    function draw(which,isCircle){
      const q=Lab.plot(which,isCircle?{xmin:-1.35,xmax:1.35,ymin:-1.3,ymax:1.3}:{xmin:-2.8,xmax:2.8,ymin:-2.5,ymax:2.5});
      if(!isCircle)p=q;
      const a=isCircle?1:Math.sqrt(5),b=isCircle?1:2,pts=isCircle?g.unit:g.ellipse;
      const A=[pts.A.x,pts.A.y],B=[pts.B.x,pts.B.y],M=[pts.M.x,pts.M.y],O=[0,0];
      q.axes(isCircle?{stepX:1,stepY:1}:{});
      q.poly(Array.from({length:160},(_,i)=>[a*Math.cos(i*Math.PI/80),b*Math.sin(i*Math.PI/80)]),{stroke:C.ink,width:2});
      q.poly([O,A,B],{fill:'var(--plot-target-fill)',stroke:'none'});
      q.line(O,A,{stroke:C.blue});q.line(O,B,{stroke:C.green});q.line(A,B,{stroke:C.ink,width:2.6});q.line(O,M,{stroke:C.gold,dash:isCircle?'':'5 4'});
      q.math([(A[0]+B[0])/3,(A[1]+B[1])/3],isCircle?"S'":'S',{color:C.target,size:24,anchor:'middle',dy:8,region:[O,A,B],priority:10,leader:false});
      if(isCircle&&g.half>1e-6&&Math.abs(g.rho)>1e-6){
        const r=10/q.sx,dir=[(A[0]-M[0])/g.half,(A[1]-M[1])/g.half],n=[-M[0]/Math.abs(g.rho),-M[1]/Math.abs(g.rho)];
        const v=[M[0]+n[0]*r,M[1]+n[1]*r],w=[v[0]+dir[0]*r,v[1]+dir[1]*r],u=[M[0]+dir[0]*r,M[1]+dir[1]*r];
        q.line(v,w,{stroke:C.gold,width:1.4});q.line(w,u,{stroke:C.gold,width:1.4});
        q.text([M[0]/2,M[1]/2],'d',{color:C.gold,dx:-15,dy:14,size:20});
        q.text([(M[0]+A[0])/2,(M[1]+A[1])/2],'h',{color:C.blue,dx:-16,dy:-9,size:20});
        q.screenMath(16,30,`d \\approx ${fmt(Math.abs(g.rho))},\\quad h \\approx ${fmt(g.half)}`,{size:17,color:C.gold});
      }
      q.dot(A,isCircle?'A′':'A',C.blue,-24,-10);q.dot(B,isCircle?'B′':'B',C.green,10,-12);
      q.dot(M,Math.abs(g.rho)<1e-8?'':isCircle?'M′':'M',C.gold,M[0]<0?-29:11,M[1]>=0?-12:24);
      q.dot(O,Math.abs(g.rho)<1e-8?(isCircle?'O = M′':'O = M'):'O',C.ink,8,19);
      if(!isCircle)q.screenMath(16,34,String.raw`\frac{x^2}{5}+\frac{y^2}{4}=1`,{size:18});
      q.screenMath(16,q.h-18,`${isCircle?"S'":"S_{\\triangle OAB}"} \\approx ${fmt(isCircle?g.unitArea:g.area,4)}`,{color:C.target,size:23});
      q.finish();
    }
    function render(){
      g=MathModel.geometry(state.theta,state.rho);
      el('angle').value=state.theta;el('angle-value').textContent=fmt(state.theta,1)+'°';
      el('position').value=state.rho;el('position-value').textContent=fmt(state.rho);
      el('lock').checked=state.locked;el('circle').checked=state.circle;el('position-wrap').hidden=state.locked;el('unit-wrap').hidden=!state.circle;
      draw(svg,false);if(state.circle)draw(unit,true);
      el('readout').innerHTML=(g.valid?`<span>${M.inline(`k_{OM}k_{AB}\\approx ${M.number(g.product1,4)}`)}</span><span>${M.inline(`k_{OA}k_{OB}\\approx ${M.number(g.product2,4)}`)}</span><small>${g.satisfies?'当前满足题设条件':'当前不满足题设条件'}</small>`:`<span class="warning">${g.issues.join('；')}，此构型不属于原题。</span>`)+M.answer(`第（3）问：${M.inline(String.raw`S_{\triangle OAB}=\sqrt5`)}<small>（在原题条件下）</small>`);
    }
    el('angle').oninput=e=>{state.theta=+e.target.value;render();};
    el('position').oninput=e=>{state.rho=+e.target.value;render();};
    el('lock').onchange=e=>{state.locked=e.target.checked;if(state.locked)state.rho=Math.sign(state.rho||1)*Math.SQRT1_2;render();};
    el('circle').onchange=e=>{state.circle=e.target.checked;render();};
    svg.onpointerdown=e=>{
      const xy=p.fromEvent(e),dist=point=>Math.hypot((xy[0]-point.x)*p.sx,(xy[1]-point.y)*p.sy);
      if(!state.locked&&dist(g.ellipse.M)<23)drag='position';else if(Math.min(dist(g.ellipse.A),dist(g.ellipse.B))<27)drag='angle';else return;
      svg.setPointerCapture(e.pointerId);e.preventDefault();
    };
    svg.onpointermove=e=>{if(!drag)return;const xy=p.fromEvent(e);if(drag==='position')state.rho=Math.max(-.98,Math.min(.98,xy[0]/Math.sqrt(5)*g.n.x+xy[1]/2*g.n.y));else state.theta=((Math.atan2(xy[1]-g.ellipse.M.y,xy[0]-g.ellipse.M.x)*180/Math.PI)%180+180)%180;render();};
    svg.onpointerup=svg.onpointercancel=()=>drag=null;
    return{render,reset(){state={theta:31,rho:Math.SQRT1_2,locked:true,circle:false};render();},getState:()=>({...state,area:g.area,valid:g.valid,satisfies:g.satisfies}),destroy(){svg.onpointerdown=svg.onpointermove=svg.onpointerup=svg.onpointercancel=null;}};
  }
};
