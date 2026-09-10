(() => {
  const critical=3-2*Math.SQRT2;
  function model(m){
    const roots=[];
    for(const [a,b,c] of [[1,-3-m,2],[1,m-3,2]]){
      const d=b*b-4*a*c;if(d<-1e-10)continue;
      for(const x of [(-b-Math.sqrt(Math.max(0,d)))/(2*a),(-b+Math.sqrt(Math.max(0,d)))/(2*a)])
        if(Math.abs(Math.abs(x*x-3*x+2)-m*x)<1e-8&&!roots.some(t=>Math.abs(t-x)<1e-7))roots.push(x);
    }
    return {m,roots:roots.sort((a,b)=>a-b),critical};
  }
  Problems[9]={title:'绝对值曲线怎样恰有三个交点',model,
    statement:`关于 ${M.inline('x')} 的方程 ${M.inline(String.raw`|x^2-3x+2|=mx`)} 有三个不同实数解，求实数 ${M.inline('m')}。`,
    mount(host){let m=.1;const C=Lab.C,$=s=>host.querySelector('#jd24-9-'+s);
      host.innerHTML=`<div class="controls"><label>斜率 ${M.inline('m')} <input id="jd24-9-m" aria-label="斜率 m" type="range" min="-0.6" max="0.6" step="0.002" value="0.1"></label><button id="jd24-9-critical">相切：三个交点</button><button id="jd24-9-zero">m = 0</button></div><div class="figures"><svg id="jd24-9-svg" class="main-figure" role="img" aria-label="绝对值抛物线与过原点直线的交点"></svg></div><div class="readout" id="jd24-9-readout"></div><div class="explain"><section class="proof-step"><h3>① 先按参数符号排除不可能情形</h3><p>${M.inline('x=0')} 不是解。若 ${M.inline('m<0')}，解只能在 ${M.inline('x<0')}，此时绝对值内为正，方程化为一个二次方程，至多两解。${M.inline('m=0')} 时只有 ${M.inline('x=1,2')}。</p></section><section class="proof-step"><h3>② 正斜率下，两侧各有一个交点</h3><p>令 ${M.inline('m>0')}。在 ${M.inline('0<x<1')} 与 ${M.inline('x>2')} 上，方程为</p>${M.block(String.raw`x^2-(3+m)x+2=0.`)}<p>左端在 ${M.inline('x=0')} 时为正，在 ${M.inline('1,2')} 时为负，且向右趋于正无穷；因此两侧各有一个根。</p></section><section class="proof-step"><h3>③ 中间一段相切时，多出恰好一个解</h3><p>在 ${M.inline('1<x<2')} 上，方程变为</p>${M.block(String.raw`x^2-(3-m)x+2=0.`)}<p>恰有一个不同实根要求判别式为零：</p>${M.block(String.raw`(3-m)^2-8=0.`)}<p>重根必须在 ${M.inline('(1,2)')}，故 ${M.inline('3-m>0')}，得到</p><div class="target">${M.block(String.raw`m=3-2\sqrt2,\qquad x=\sqrt2.`)}</div><p>另一候选 ${M.inline(String.raw`3+2\sqrt2`)} 的重根为负，不属于中间分段。此时两侧两根和中间重根共三个不同实根。</p><p class="proof-note">滑杆仅显示一段参数窗口；负斜率的全部情形由第一步排除。</p></section></div>`;
      function render(){const s=model(m),p=Lab.plot($('svg'),{xmin:-.3,xmax:3.1,ymin:-.35,ymax:2.1,equal:false,pad:50});p.axes({stepX:1,stepY:.5});p.curve(x=>Math.abs(x*x-3*x+2),-.3,3.1,{stroke:C.blue,width:2.5});p.curve(x=>m*x,-.3,3.1,{stroke:C.target,width:2.3});for(const x of s.roots)p.dot([x,m*x],'',C.target);p.screenMath(20,28,String.raw`y=|x^2-3x+2|`,{color:C.blue,size:18});p.screenMath(p.w-20,28,'y=mx',{color:C.target,size:18,anchor:'end'});p.finish();$('m').value=m;$('readout').innerHTML=`${M.inline(String.raw`m\approx${m.toFixed(5)}`)}；不同实根 ${s.roots.length} 个。${s.roots.length?`根约为 ${s.roots.map(x=>M.inline(x.toFixed(4))).join('，')}。`:''}${M.answer(M.inline(String.raw`m=3-2\sqrt2`))}`;}
      $('m').oninput=e=>{m=+e.target.value;render();};$('critical').onclick=()=>{m=critical;render();};$('zero').onclick=()=>{m=0;render();};render();return{render,reset(){m=.1;render();},getState:()=>model(m)};
    }};
})();
