Problems[18] = {
  title:'区间内的极值',
  statement:`${M.inline(String.raw`f(x)=2\cos\left(\omega x+\frac{3\pi}4\right),\quad\omega>0`)}。已知 ${M.inline(String.raw`f\left(\frac\pi4\right)=0`)}，在开区间 ${M.inline(String.raw`\left(\frac\pi4,\frac\pi3\right)`)} 内有极小值、无极大值，求 <span class="target">${M.inline(String.raw`\omega`)}</span>。〔第 18 题第二问，原卷第 4 页〕`,
  mount(host) {
    const C=Lab.C;let mode='candidate',k=2,omega=7,plot,drag=false;
    host.innerHTML=`<div class="controls"><label>条件 <select id="q18-mode"><option value="candidate">满足左端零点条件</option><option value="free">连续改变 ω</option></select></label><label id="q18-label">k <input id="q18-range" type="range" min="1" max="12" step="1" value="2"></label><input id="q18-number" type="number" aria-label="频率参数" min="1" max="12" step="1" value="2"><span id="q18-value" style="color:${C.target}"></span><button id="q18-next">下一个候选</button></div><div class="figures"><svg id="q18-function" class="figure" role="img" aria-label="固定开区间内的余弦函数及极值点"></svg><svg id="q18-phase" class="figure" role="img" aria-label="相位轴上的开区间及极值位置"></svg></div><div class="readout" id="q18-readout"></div><div class="explain"><section class="proof-step"><h3>零点给出离散候选</h3><p>零点条件给出 ${M.inline(String.raw`\omega=4k-1,\quad k\in\mathbb N^*`)}。</p></section><section class="proof-step"><h3>按极值顺序筛选</h3><p>${M.inline('k')} 为奇数：先遇极大值，再遇极小值，不合题意。</p><p>${M.inline('k')} 为偶数：先遇极小值，再遇极大值，需</p>${M.block(String.raw`\frac\pi2<\frac{\omega\pi}{12}\le\frac{3\pi}2`)}<p>即 ${M.inline(String.raw`6<\omega\le18`)}，结合 ${M.inline('k')} 为偶数，得 <span style="color:${C.target}">${M.inline(String.raw`\omega=7\ \text{或}\ 15`)}</span>。</p></section><section class="proof-step"><h3>核对开区间边界</h3><p>右端点恰有极大值时不计入；极小值必须严格落在区间内部。图像用于观察，上述不等式负责排除全部其他候选。</p></section></div>`;
    const range=host.querySelector('#q18-range'),number=host.querySelector('#q18-number'),main=host.querySelector('#q18-function'),phase=host.querySelector('#q18-phase');
    function piFraction(n,d){let a=n,b=d;while(b){const r=a%b;a=b;b=r;}n/=a;d/=a;const term=n===1?String.raw`\pi`:`${n}\\pi`;return d===1?term:String.raw`\dfrac{${term}}{${d}}`;}
    function update(v){if(!Number.isFinite(v))return;if(mode==='candidate'){k=Math.max(1,Math.min(100,Math.round(v)));omega=4*k-1;}else omega=Math.max(.1,Math.min(80,v));render();}
    function render(){
      const candidate=mode==='candidate';range.min=candidate?1:.1;range.max=candidate?Math.max(12,k):80;range.step=candidate?1:.01;range.value=candidate?k:omega;number.min=range.min;number.max=candidate?100:80;number.step=candidate?1:.01;number.value=candidate?k:+omega.toFixed(3);
      host.querySelector('#q18-label').firstChild.textContent=candidate?'k ':'ω ';host.querySelector('#q18-value').innerHTML=M.inline(candidate?String.raw`\omega=4k-1=${omega}`:String.raw`\omega=${Lab.fmt(omega,2)}`);host.querySelector('#q18-next').hidden=!candidate;
      const t0=omega/4+.75,t1=omega/3+.75,inside=n=>12*n>3*omega+9+1e-9&&12*n<4*omega+9-1e-9;
      const minima=[],maxima=[];for(let n=Math.floor(t0)-1;n<=Math.ceil(t1)+1;n++){if(inside(n))(Math.abs(n)%2===1?minima:maxima).push(n);}
      const f=x=>2*Math.cos(omega*x+3*Math.PI/4),p=Lab.plot(main,{xmin:.53,xmax:1.27,ymin:-3,ymax:3.1,equal:false,pad:44});plot=p;
      p.poly([[Math.PI/4,-2.65],[Math.PI/3,-2.65],[Math.PI/3,2.65],[Math.PI/4,2.65]],{fill:C.blue,opacity:.055,stroke:'none'});p.axes();
      p.curve(f,.53,1.27,{stroke:C.blue,width:2.8,n:Math.max(350,omega*25)});
      [Math.PI/4,Math.PI/3].forEach((x,i)=>{p.line([x,-2.6],[x,2.6],{stroke:C.gray,dash:'5 5',width:1});const z=p.to([x,f(x)]);p.add(`<circle cx="${z[0]}" cy="${z[1]}" r="6" fill="var(--canvas)" stroke="${C.ink}" stroke-width="2"/>`);p.math([x,-2.75],i?String.raw`\dfrac\pi3`:String.raw`\dfrac\pi4`,{anchor:'middle',size:18});});
      for(let n=Math.ceil(omega*.53/Math.PI+.75);n<=Math.floor(omega*1.27/Math.PI+.75);n++){const x=(n-.75)*Math.PI/omega,y=2*(n%2===0?1:-1),isMin=Math.abs(n)%2===1;p.dot([x,y],inside(n)&&omega<60?(isMin?'极小':'极大'):'',isMin?C.green:C.gold,-15,-13);}
      p.screenText(16,23,'固定 x 窗口：阴影为题设开区间',{size:17});p.finish();
      const q=Lab.plot(phase,{xmin:t0-.25,xmax:t1+.25,ymin:-1.65,ymax:1.55,equal:false,pad:44});
      q.line([t0-.2,0],[t1+.2,0],{stroke:C.gray,width:1});q.line([t0,0],[t1,0],{stroke:C.blue,width:5});
      [t0,t1].forEach((t,i)=>{const z=q.to([t,0]);q.add(`<circle cx="${z[0]}" cy="${z[1]}" r="7" fill="var(--canvas)" stroke="${C.blue}" stroke-width="2"/>`);q.text([t,-.48],i?'右端（不含）':'左端（不含）',{anchor:'middle',size:16});const label=candidate?(i?piFraction(4*omega+9,12):piFraction(omega+3,4)):String.raw`\approx${Lab.fmt(t,3)}\pi`;q.math([t,-.84],label,{anchor:'middle',size:16,color:C.gray});});
      for(let n=Math.ceil(t0-.2);n<=Math.floor(t1+.2);n++){const isMin=Math.abs(n)%2===1;q.line([n,-.08],[n,.2],{stroke:isMin?C.green:C.gold,width:2});q.dot([n,0],'',isMin?C.green:C.gold);if(omega<100){q.math([n,.52],`${n}\\pi`,{anchor:'middle',size:17,color:isMin?C.green:C.gold});q.text([n,.85],isMin?'极小':'极大',{anchor:'middle',size:16,color:isMin?C.green:C.gold});}}
      q.screenMath(16,27,String.raw`\text{相位 }t=\omega x+\frac{3\pi}4`,{size:17});q.screenMath(18,q.h-24,String.raw`\text{相位区间长度：}\frac{\omega\pi}{12}${candidate?'='+piFraction(omega,12):String.raw`\approx${Lab.fmt(omega/12,3)}\pi`}`,{size:17});q.finish();
      const zero=candidate||Number.isInteger((omega+1)/4);
      host.querySelector('#q18-readout').innerHTML=`区间内：<b style="color:${C.green}">${minima.length} 个极小值</b>，<b style="color:${C.gold}">${maxima.length} 个极大值</b>。${zero?(minima.length>0&&maxima.length===0?' <b>满足本题条件。</b>':' 不满足极值要求。'):' 当前不满足左端零点条件。'}${M.answer(`第二问：${M.inline(String.raw`\omega=7\ \text{或}\ 15`)}。`)}`;
    }
    range.oninput=()=>update(+range.value);number.onchange=()=>update(+number.value);host.querySelector('#q18-mode').onchange=e=>{mode=e.target.value;if(mode==='candidate'){k=Math.max(1,Math.round((omega+1)/4));omega=4*k-1;}render();};host.querySelector('#q18-next').onclick=()=>update(k+1);
    main.onpointerdown=e=>{if(mode!=='free')return;drag=true;main.setPointerCapture(e.pointerId);};main.onpointermove=e=>{if(!drag)return;const [x]=plot.fromEvent(e);update((x-.53)/(1.27-.53)*40+.1);};main.onpointerup=()=>drag=false;main.onpointercancel=()=>drag=false;
    render();return{render,reset(){mode='candidate';k=2;omega=7;host.querySelector('#q18-mode').value=mode;render();},getState(){return{mode,k,omega,leftPhase:omega/4+.75,rightPhase:omega/3+.75};}};
  }
};

