Problems[18] = {
  title:'区间内的极值',
  statement:`${M.inline(String.raw`f(x)=2\cos\left(\omega x+\frac{3\pi}4\right),\quad\omega>0`)}。已知 ${M.inline(String.raw`f\left(\frac\pi4\right)=0`)}，在开区间 ${M.inline(String.raw`\left(\frac\pi4,\frac\pi3\right)`)} 内有极小值、无极大值，求 <span class="target">${M.inline(String.raw`\omega`)}</span>。〔第 18 题第二问，原卷第 4 页〕`,
  mount(host) {
    const C=Lab.C;let mode='candidate',k=2,omega=7,plot,drag=false,constructionStep=null;
    const show=index=>constructionStep===null||constructionStep>=index;
    function getConstructionSteps(){return[
      {title:'先画当前余弦函数',body:`由 ${M.inline(String.raw`f(x)=2\cos(\omega x+\frac{3\pi}4),\ \omega>0`)}，先画当前参数的函数图像。横向窗口只用于观察，后续筛选仍依据题设的开区间。`},
      {title:'把题设开区间标在函数图上',body:`由 ${M.inline(String.raw`x\in(\frac\pi4,\frac\pi3)`)}，画两条端点竖线并标出中间区域；曲线端点画空心圆，说明端点处的极值不计入。`},
      {title:'把开区间映射到相位轴',body:`令 ${M.inline(String.raw`t=\omega x+\frac{3\pi}4`)}。因 ${M.inline(String.raw`\omega>0`)}，相位随横坐标增加；在相位图画 ${M.inline(String.raw`t\in(\frac{(\omega+3)\pi}4,\frac{(4\omega+9)\pi}{12})`)}，两端仍为空心，长度为 ${M.inline(String.raw`\frac{\omega\pi}{12}`)}。`},
      {title:'用左端零点限定合法候选',body:`由 ${M.inline(String.raw`f(\frac\pi4)=0`)}，左端相位必须是 ${M.inline(String.raw`(k+\frac12)\pi`)}，故 ${M.inline(String.raw`\omega=4k-1,\ k\in\mathbb N^*`)}。标出左端零点并逐个查看候选；连续模式若不满足此等式，图中会注明，不能作为合法候选。`},
      {title:'标极值并检查开区间内部',body:`在相位轴标出 ${M.inline(String.raw`t=n\pi`)}：奇数 ${M.inline('n')} 对应极小值，偶数对应极大值，再同步标到曲线上。合法候选须先遇极小值，因此 ${M.inline('k')} 为偶数，且 ${M.inline(String.raw`\frac\pi2<\frac{\omega\pi}{12}\le\frac{3\pi}2`)}；结合得 ${M.inline(String.raw`\omega=7\ \text{或}\ 15`)}。右端极大值可恰在端点，左端到极小值的距离必须严格小于区间长度。`}
    ];}
    function restartConstruction(){if(constructionStep!==null)constructionStep=0;host.dispatchEvent(new Event('constructionchange'));}
    host.innerHTML=`<div class="controls"><label>条件 <select id="q18-mode"><option value="candidate">满足左端零点条件</option><option value="free">连续改变 ω</option></select></label><label id="q18-label">k <input id="q18-range" type="range" min="1" max="12" step="1" value="2"></label><input id="q18-number" type="number" aria-label="频率参数" min="1" max="12" step="1" value="2"><span id="q18-value" style="color:${C.target}"></span><button id="q18-next">下一个候选</button></div><div class="figures"><svg id="q18-function" class="figure" role="img" aria-label="固定开区间内的余弦函数及极值点"></svg><svg id="q18-phase" class="figure" role="img" aria-label="相位轴上的开区间及极值位置"></svg></div><div class="readout" id="q18-readout"></div><div class="explain"><section class="proof-step"><h3>零点给出离散候选</h3><p>零点条件给出 ${M.inline(String.raw`\omega=4k-1,\quad k\in\mathbb N^*`)}。</p></section><section class="proof-step"><h3>按极值顺序筛选</h3><p>${M.inline('k')} 为奇数：先遇极大值，再遇极小值，不合题意。</p><p>${M.inline('k')} 为偶数：先遇极小值，再遇极大值，需</p>${M.block(String.raw`\frac\pi2<\frac{\omega\pi}{12}\le\frac{3\pi}2`)}<p>即 ${M.inline(String.raw`6<\omega\le18`)}，结合 ${M.inline('k')} 为偶数，得 <span style="color:${C.target}">${M.inline(String.raw`\omega=7\ \text{或}\ 15`)}</span>。</p></section><section class="proof-step"><h3>核对开区间边界</h3><p>右端点恰有极大值时不计入；极小值必须严格落在区间内部。图像用于观察，上述不等式负责排除全部其他候选。</p></section></div>`;
    const range=host.querySelector('#q18-range'),number=host.querySelector('#q18-number'),main=host.querySelector('#q18-function'),phase=host.querySelector('#q18-phase');
    const figures=host.querySelector('.figures');figures.classList.add('q18-figures');
    const phaseView=document.createElement('section');phaseView.className='phase-view';
    phase.replaceWith(phaseView);phaseView.innerHTML='<div class="phase-heading"></div><div class="phase-readout"></div>';
    phaseView.insertBefore(phase,phaseView.lastElementChild);
    function piFraction(n,d){let a=n,b=d;while(b){const r=a%b;a=b;b=r;}n/=a;d/=a;const term=n===1?String.raw`\pi`:`${n}\\pi`;return d===1?term:String.raw`\dfrac{${term}}{${d}}`;}
    function update(v){if(!Number.isFinite(v))return;if(mode==='candidate'){k=Math.max(1,Math.min(100,Math.round(v)));omega=4*k-1;}else omega=Math.max(.1,Math.min(80,v));render();}
    function render(){
      const candidate=mode==='candidate';range.min=candidate?1:.1;range.max=candidate?Math.max(12,k):80;range.step=candidate?1:.01;range.value=candidate?k:omega;number.min=range.min;number.max=candidate?100:80;number.step=candidate?1:.01;number.value=candidate?k:+omega.toFixed(3);
      host.querySelector('#q18-label').firstChild.textContent=candidate?'k ':'ω ';host.querySelector('#q18-value').innerHTML=M.inline(candidate?String.raw`\omega=4k-1=${omega}`:String.raw`\omega=${Lab.fmt(omega,2)}`);host.querySelector('#q18-next').hidden=!candidate;
      const t0=omega/4+.75,t1=omega/3+.75,inside=n=>12*n>3*omega+9+1e-9&&12*n<4*omega+9-1e-9;
      const minima=[],maxima=[];for(let n=Math.floor(t0)-1;n<=Math.ceil(t1)+1;n++){if(inside(n))(Math.abs(n)%2===1?minima:maxima).push(n);}
      const f=x=>2*Math.cos(omega*x+3*Math.PI/4),p=Lab.plot(main,{xmin:.53,xmax:1.27,ymin:-3,ymax:3.1,equal:false,pad:44});plot=p;
      if(show(1))p.poly([[Math.PI/4,-2.65],[Math.PI/3,-2.65],[Math.PI/3,2.65],[Math.PI/4,2.65]],{fill:C.blue,opacity:.09,stroke:'none'});p.axes({tickSize:14});
      p.curve(f,.53,1.27,{stroke:C.blue,width:2.8,n:Math.max(350,omega*25)});
      if(show(1))[Math.PI/4,Math.PI/3].forEach((x,i)=>{p.line([x,-2.6],[x,2.6],{stroke:C.gray,dash:'5 5',width:1});const z=p.to([x,f(x)]);p.add(`<circle cx="${z[0]}" cy="${z[1]}" r="6" fill="var(--canvas)" stroke="${C.ink}" stroke-width="2"/>`);p.math([x,-2.75],i?String.raw`\dfrac\pi3`:String.raw`\dfrac\pi4`,{anchor:'middle',size:18});});
      if(show(4))for(let n=Math.ceil(omega*.53/Math.PI+.75);n<=Math.floor(omega*1.27/Math.PI+.75);n++){
        const x=(n-.75)*Math.PI/omega,y=2*(n%2===0?1:-1),isMin=Math.abs(n)%2===1,color=isMin?C.green:C.gold;
        if(inside(n))p.dot([x,y],omega<60?(isMin?'极小':'极大'):'',color,-15,-13);
        else{const z=p.to([x,y]);p.add(`<circle data-excluded-extremum="${n}" cx="${z[0]}" cy="${z[1]}" r="5" fill="var(--canvas)" stroke="${color}" stroke-width="2"/>`);}
      }
      const zero=candidate||Number.isInteger((omega+1)/4);
      if(constructionStep!==null&&show(3))p.screenText(16,p.h-12,zero?'左端满足零点条件：当前为合法候选。':'左端不是零点：当前参数不属于合法候选。',{size:15,color:zero?C.target:C.gray});
      p.screenText(16,23,show(1)?'函数图 · 阴影为题设开区间':'当前函数：先观察曲线形状',{size:14,color:C.gray});p.finish();
      // Include the nearest exterior extrema, so rejected candidates have a visual reason.
      const first=Math.floor(t0+1e-9),last=Math.ceil(t1-1e-9);
      const q=Lab.plot(phase,{xmin:first-.3,xmax:last+.3,ymin:-1,ymax:1,equal:false,pad:34});
      const axisY=Math.round(q.h*.62),worldY=(q.h/2-axisY)/q.sy;
      const heading=phaseView.querySelector('.phase-heading'),readout=phaseView.querySelector('.phase-readout');
      heading.innerHTML=show(2)?M.inline(String.raw`\text{相位 }t=\omega x+\frac{3\pi}4`)+'<span>实心极值在区间内 · 空心点不计入</span>':'相位轴：将在区间建立后画出';
      readout.hidden=!show(2);
      if(show(2)){
        q.line([first-.2,worldY],[last+.2,worldY],{stroke:C.gray,width:1});q.line([t0,worldY],[t1,worldY],{stroke:C.blue,width:4});
        const endpoints=[];
        [t0,t1].forEach((t,i)=>{
          const x=q.to([t,worldY])[0];q.add(`<circle data-phase-end="${i}" cx="${x}" cy="${axisY}" r="6" fill="var(--canvas)" stroke="${C.blue}" stroke-width="2"/>`);
          // Split the short endpoint names outwards; exact values live in the shared readout.
          q.screenText(x+(i?9:-9),axisY+27,i?'右端':'左端',{anchor:i?'start':'end',size:14,color:C.blue,avoid:true});
          endpoints.push(candidate?(i?piFraction(4*omega+9,12):piFraction(omega+3,4)):String.raw`\approx${Lab.fmt(t,3)}\pi`);
        });
        readout.innerHTML=`<span>左端 ${M.inline(endpoints[0])}</span><span>右端 ${M.inline(endpoints[1])}</span><span>长度 ${M.inline(String.raw`\frac{\omega\pi}{12}${candidate?'='+piFraction(omega,12):String.raw`\approx${Lab.fmt(omega/12,3)}\pi`}`)}</span>`;
      }
      if(show(4))for(let n=first;n<=last;n++){
        const isMin=Math.abs(n)%2===1,color=isMin?C.green:C.gold,x=q.to([n,worldY])[0],included=inside(n),endpoint=Math.abs(n-t0)<1e-9||Math.abs(n-t1)<1e-9;
        q.add(`<circle data-phase-extremum="${n}" data-inside="${included}" cx="${x}" cy="${axisY}" r="5" fill="${included?color:'var(--canvas)'}" stroke="${color}" stroke-width="2"/>`);
        const every=Math.max(1,Math.ceil((last-first+1)*100/q.w));
        const edgeClearance=Math.min(x-q.to([first,worldY])[0],q.to([last,worldY])[0]-x);
        if(n===first||n===last||(n%every===0&&edgeClearance>=110)){
          q.screenText(x,19,(isMin?'极小':'极大')+(included?'':endpoint?'（端点）':'（外）'),{anchor:'middle',size:14,color,avoid:true});
          q.screenMath(x,44,n===0?'0':n===1?String.raw`\pi`:`${n}\\pi`,{anchor:'middle',size:15,color,avoid:true});
        }
      }
      if(constructionStep!==null&&show(3)&&!show(4))q.screenText(16,25,zero?'左端为零点：满足候选条件':'左端不是零点：不属于合法候选',{color:zero?C.target:C.gray,size:14});
      q.finish();
      host.querySelector('#q18-readout').innerHTML=`区间内：<b style="color:${C.green}">${minima.length} 个极小值</b>，<b style="color:${C.gold}">${maxima.length} 个极大值</b>。${zero?(minima.length>0&&maxima.length===0?' <b>满足本题条件。</b>':' 不满足极值要求。'):' 当前不满足左端零点条件。'}${M.answer(`第二问：${M.inline(String.raw`\omega=7\ \text{或}\ 15`)}。`)}`;
    }
    range.oninput=()=>update(+range.value);number.onchange=()=>update(+number.value);host.querySelector('#q18-mode').onchange=e=>{mode=e.target.value;if(mode==='candidate'){k=Math.max(1,Math.round((omega+1)/4));omega=4*k-1;}restartConstruction();render();};host.querySelector('#q18-next').onclick=()=>update(k+1);
    main.onpointerdown=e=>{if(mode!=='free')return;drag=true;main.setPointerCapture(e.pointerId);};main.onpointermove=e=>{if(!drag)return;const [x]=plot.fromEvent(e);update((x-.53)/(1.27-.53)*40+.1);};main.onpointerup=()=>drag=false;main.onpointercancel=()=>drag=false;
    render();return{render,getConstructionSteps,getConstructionStep(){return constructionStep;},setConstructionStep(index){constructionStep=index===null?null:Math.max(0,Math.min(4,Math.trunc(index)));render();},reset(){mode='candidate';k=2;omega=7;host.querySelector('#q18-mode').value=mode;restartConstruction();render();},getState(){return{mode,k,omega,leftPhase:omega/4+.75,rightPhase:omega/3+.75};}};
  }
};
