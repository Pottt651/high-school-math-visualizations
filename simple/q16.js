Problems[16] = {
  title: '递推数列：下一项怎样从上一项得到',
  statement: '原卷第 2 页 · ' + M.inline(String.raw`a_{n+1}=ra_n(1-a_n),\quad a_1\in(0,1)`) + '。比较 ' + M.inline(String.raw`r=2,\,3,\,-3`) + ' 时的数列，判断四个命题。',
  mount(host) {
    host.innerHTML = `
      <div class="controls">
        <label>${M.inline('r')} <select id="q16-r"><option value="2">2</option><option value="3">3</option><option value="-3">−3</option></select></label>
        <label>${M.inline('a_1')} <input id="q16-initial" type="text" inputmode="decimal" value="1/4" size="6" aria-label="初值，可输入分数"><output id="q16-initial-math"></output></label>
        <span class="preset-group" role="group" aria-label="精确初值">${['1/4','1/2','2/3','1/3','3/4'].map(v=>`<button type="button" data-q16-preset="${v}" aria-label="初值 ${v}">${M.inline(M.rational(v))}</button>`).join('')}</span>
        <select id="q16-preset" hidden aria-hidden="true" tabindex="-1"><option value="1/4">1/4</option><option value="1/2">1/2</option><option value="2/3">2/3</option><option value="1/3">1/3</option><option value="3/4">3/4</option><option value="custom">自定</option></select>
        <button id="q16-next">计算下一项</button><button id="q16-restart">从 ${M.inline('a_1')} 重来</button>
        <label>项数 <input id="q16-count" type="range" min="1" max="30" step="1" value="1"><output id="q16-count-label">1</output></label>
      </div>
      <aside class="question-claims" aria-label="四个待判断命题">
        <div class="eyebrow">本题的四个命题</div>
        <p class="claims-intro">先判断，再用初值找例子或反例。展开关键关系可查看逐项证明。</p>
        <ol>
          <li><b>① 递增初值的个数</b><p>${M.inline('r=2')} 时，只有有限个初值使数列严格递增。</p></li>
          <li><b>② 差值最终变小</b><p>${M.inline('r=2')} 时，存在初值及正整数 ${M.inline('P')}，使所有 ${M.inline('n>P')} 满足 ${M.inline(String.raw`a_{n+1}-a_n<\frac1{2025}`)}。</p></li>
          <li><b>③ 最终精确相等</b><p>${M.inline('r=3')} 时，存在初值及正整数 ${M.inline('P')}，使所有 ${M.inline('n>P')} 满足 ${M.inline('a_{n+1}=a_n')}。</p></li>
          <li><b>④ 后续各项的正负</b><p>${M.inline('r=-3')} 时，不存在初值使所有 ${M.inline(String.raw`n\ge3`)} 的项均为正。</p></li>
        </ol>
      </aside>
      <div class="readout" id="q16-readout" aria-live="polite"></div>
      <div class="figures">
        <svg id="q16-web" class="figure" role="img" aria-label="递推蛛网图：从横坐标到函数图，再水平到对角线"></svg>
        <svg id="q16-sequence" class="figure" role="img" aria-label="数列的项数与项值图"></svg>
      </div>
      <p class="hint">左图：竖直到函数图，读出下一项；水平到 ${M.inline('y=x')}，把它变成新的横坐标。右图：每次只增加一项。可拖动左图横轴上的 ${M.inline('a_1')}。</p>
      <div class="explain">
        <section class="proof-step"><h3>① 假：递增初值不止有限个</h3><p>${M.inline('r=2')} 时，“只有有限个初值使数列严格递增”不成立。任取 ${M.inline(String.raw`a_1\in\left(0,\frac12\right)`)}，区间 ${M.inline(String.raw`\left(0,\frac12\right)`)} 在递推中保持，且 <span class="target">${M.inline(String.raw`a_{n+1}-a_n=a_n(1-2a_n)>0`)}</span>。</p>
        </section><section class="proof-step"><h3>② 真：不动点给出零差值</h3><p>命题：${M.inline('r=2')} 时，存在初值及正整数 ${M.inline('P')}，使 ${M.inline('n>P')} 时 <span class="target">${M.inline(String.raw`a_{n+1}-a_n<\frac1{2025}`)}</span>。取 ${M.inline(String.raw`a_1=\frac12`)}，则任意 ${M.inline('n')} 的差都是 ${M.inline('0')}，任取正整数 ${M.inline('P')} 即可。</p><p class="proof-note"><strong>原题差值没有绝对值。</strong></p>
        </section><section class="proof-step"><h3>③ 真：立即或一步后保持相等</h3><p>命题：${M.inline('r=3')} 时，存在初值及正整数 ${M.inline('P')}，使 ${M.inline('n>P')} 时 <span class="target">${M.inline('a_{n+1}=a_n')}</span>。取 ${M.inline(String.raw`a_1=\frac23`)}，所有项精确等于 ${M.inline(String.raw`\frac23`)}；取 ${M.inline(String.raw`a_1=\frac13`)}，也在一步后到达 ${M.inline(String.raw`\frac23`)}。这两种初值都满足命题。</p>
        </section><section class="proof-step"><h3>④ 假：用一个初值反驳</h3><p>${M.inline('r=-3')} 时，“不存在使 ${M.inline(String.raw`n\ge3`)} 的项全为正的初值”不成立：<span class="target">${M.inline(String.raw`a_1=\frac12\ \Rightarrow\ a_2=-\frac34\ \Rightarrow\ a_3=\frac{63}{16}>\frac43`)}</span>；${M.inline(String.raw`x\ge\frac43`)} 时，${M.inline(String.raw`3x(x-1)\ge x`)}，故后续各项始终为正。</p>
        </section><section class="proof-step"><h3>接近不等于最终相等</h3><p>${M.inline('r=2')} 时令 ${M.inline('b_n=1-2a_n')}，则 ${M.inline('b_{n+1}=b_n^2')}。若 ${M.inline(String.raw`a_1\ne\frac12`)}，则 ${M.inline(String.raw`b_1\ne0`)}，每个有限项的 ${M.inline('b_n')} 都不为 ${M.inline('0')}。</p><p class="proof-note">电脑显示相等可能仅仅是舍入。</p></section>
      </div>`;
    const $ = id => host.querySelector('#q16-' + id);
    const web = $('web'), seq = $('sequence'), C = Lab.C;
    let state = { r: 2, initial: .25, initialText: '1/4', rational: [1n,4n], n: 1 };
    let webPlot, dragging = false, error = '', constructionStep = null;
    const show = index => constructionStep === null || constructionStep >= index;
    function getConstructionSteps() {
      return [
        {title:'在横轴上放置初值',body:`由题设 ${M.inline(String.raw`a_1\in(0,1)`)}，在横轴上标出 ${M.inline('(a_1,0)')}；右侧项图同步标出 ${M.inline('(1,a_1)')}。初值仍可拖动或精确输入。`},
        {title:'把递推式画成函数',body:`由 ${M.inline('a_{n+1}=ra_n(1-a_n)')}，画出 ${M.inline('y=rx(1-x)')}。固定当前 ${M.inline('r')} 后，每个横坐标的函数值就是下一项。`},
        {title:'竖直到抛物线，得到第二项',body:`由 ${M.inline('a_2=ra_1(1-a_1)')}，从 ${M.inline('(a_1,0)')} 竖直到抛物线上的 ${M.inline('(a_1,a_2)')}；右图增加 ${M.inline('(2,a_2)')}。构造模式会用同一递推式预画所需项，控件中原有项数保持不变。`},
        {title:'水平到对角线，换成新横坐标',body:`要把高度 ${M.inline('a_2')} 变成下一次的横坐标，画 ${M.inline('y=x')}，再从 ${M.inline('(a_1,a_2)')} 水平到 ${M.inline('(a_2,a_2)')}。若 ${M.inline('a_2=a_1')}，两点重合，水平线段长为零；不另移点制造线段。`},
        {title:'重复两段路，继续迭代',body:`从 ${M.inline('(a_2,a_2)')} 竖直到 ${M.inline('(a_2,a_3)')}，再水平到 ${M.inline('(a_3,a_3)')}；此后重复。此步至少示意前三项，也可增加控件项数。若到达不动点，后续轨迹重合；图窗外的项仍由原递推式产生。`}
      ];
    }
    function restartConstruction() { if(constructionStep!==null) constructionStep=0; host.dispatchEvent(new Event('constructionchange')); }
    const gcd = (a,b) => { a = a < 0n ? -a : a; while (b) { const t=a%b; a=b; b=t; } return a; };
    function parseInitial(text) {
      const m = text.trim().match(/^([+]?(?:\d+(?:\.\d*)?|\.\d+))(?:\s*\/\s*(\d+(?:\.\d*)?|\.\d+))?$/);
      if (!m) return null;
      const value = Number(m[1]) / (m[2] === undefined ? 1 : Number(m[2]));
      if (!(value > 0 && value < 1)) return null;
      const decimal = x => { const z=x.replace('+','').split('.'); return [BigInt((z[0]||'0') + (z[1]||'')), 10n ** BigInt((z[1]||'').length)]; };
      const a = decimal(m[1]), b = decimal(m[2] || '1');
      let p = a[0]*b[1], q = a[1]*b[0]; const d=gcd(p,q); p/=d; q/=d;
      return {value, rational:[p,q]};
    }
    const exactInitial = (p,q) => state.rational && state.rational[0]*BigInt(q) === BigInt(p)*state.rational[1];
    function generate(count=state.n) {
      const values=[state.initial], exact=[];
      let rational=state.rational && [...state.rational], overflow=false;
      const fractionLabel = x => x ? (x[1]===1n ? String(x[0]) : String(x[0])+'/'+String(x[1])) : '';
      exact.push(rational && String(rational[1]).length<=10 ? fractionLabel(rational) : '');
      for(let i=1;i<count;i++) {
        const a=values[i-1]; let next=state.r*a*(1-a);
        if (!Number.isFinite(next)) { overflow=true; break; }
        if (rational && Math.max(String(rational[0]).length,String(rational[1]).length)<100) {
          let p=BigInt(state.r)*rational[0]*(rational[1]-rational[0]), q=rational[1]*rational[1];
          const d=gcd(p,q); rational=[p/d,q/d];
          next=Number(rational[0])/Number(rational[1]);
        } else rational=null;
        values.push(next);
        exact.push(rational && Math.max(String(rational[0]).length,String(rational[1]).length)<=10 ? fractionLabel(rational) : '');
      }
      return {values,exact,overflow};
    }
    function difference(data,n,delta) {
      if(n<2) return '';
      if(data.exact[n-1] && data.exact[n-2]) {
        const parse=s=>{const a=s.split('/');return [BigInt(a[0]),BigInt(a[1]||'1')];};
        const a=parse(data.exact[n-1]),b=parse(data.exact[n-2]);
        let p=a[0]*b[1]-b[0]*a[1],q=a[1]*b[1];const d=gcd(p,q);p/=d;q/=d;
        if(Math.max(String(p).length,String(q).length)<=12) return '= '+M.rational(p+'/'+q);
      }
      return String.raw`\approx `+M.number(delta,8);
    }
    function clippedLine(p,a,b,bounds,style) {
      const dx=b[0]-a[0], dy=b[1]-a[1]; let lo=0, hi=1;
      const edges=[[-dx,a[0]-bounds.xmin],[dx,bounds.xmax-a[0]],[-dy,a[1]-bounds.ymin],[dy,bounds.ymax-a[1]]];
      for(const [d,v] of edges) { if(d===0) { if(v<0) return; } else { const t=v/d; if(d<0) lo=Math.max(lo,t); else hi=Math.min(hi,t); } }
      if(lo<=hi) p.line([a[0]+lo*dx,a[1]+lo*dy],[a[0]+hi*dx,a[1]+hi*dy],style);
    }
    function render() {
      const savedData=generate(), previewCount=constructionStep===null?state.n:constructionStep<2?1:constructionStep<4?2:Math.max(3,state.n);
      const data=constructionStep===null?savedData:generate(previewCount), values=data.values, last=values[values.length-1], n=values.length;
      $('r').value=String(state.r); $('count').value=String(state.n); $('count-label').textContent=constructionStep===null?String(n):`${state.n}（本步图示 ${n} 项）`;
      $('next').disabled=savedData.overflow || state.n>=30;
      const delta=n>1 ? last-values[n-2] : null;
      const terms=values.slice(-Math.min(n,5)).map((a,j) => {const i=n-Math.min(n,5)+j; return M.inline(`a_{${i+1}} ${data.exact[i] ? '= '+M.rational(data.exact[i]) : String.raw`\approx `+M.number(a,8)}`);}).join('； ');
      $('initial-math').innerHTML=M.inline('= '+(data.exact[0] ? M.rational(data.exact[0]) : M.number(state.initial,8)));
      host.querySelectorAll('[data-q16-preset]').forEach(button=>{const [p,q]=button.dataset.q16Preset.split('/').map(Number);button.setAttribute('aria-pressed',String(!!exactInitial(p,q)));});
      let note='';
      if(state.r===2 && exactInitial(1,2)) note='当前使用精确初值 '+M.inline(String.raw`\frac12`)+'，代入可知每项都等于 '+M.inline(String.raw`\frac12`)+'。';
      else if(state.r===3 && exactInitial(2,3)) note='当前使用精确初值 '+M.inline(String.raw`\frac23`)+'，代入可知每项都等于 '+M.inline(String.raw`\frac23`)+'。';
      else if(state.r===3 && exactInitial(1,3)) note='当前使用精确初值 '+M.inline(String.raw`\frac13`)+'：下一项恰为 '+M.inline(String.raw`\frac23`)+'，此后保持不变。';
      else if(state.r===2 && n>=6) note='数值可能已经显示为 '+M.inline('0.5')+'；是否精确相等，要看“关键关系”中的代数推导。';
      else note='按“计算下一项”，观察同一次递推怎样对应两张图。';
      if(data.overflow) note='计算已停止：下一项超出浮点数范围。越界不是收敛，也不代表数学数列停止。';
      $('readout').innerHTML=`<span class="target">${terms}</span><span>${delta===null?'':`本次差值 <span class="target">${M.inline(`a_{${n}}-a_{${n-1}} `+difference(data,n,delta))}</span>。 `}${error || note}</span>${M.answer('B（②③正确；①④错误）')}`;
      const bounds=state.r<0 ? {xmin:-1.1,xmax:4.6,ymin:-1.1,ymax:4.6,equal:true,pad:38} : {xmin:-.05,xmax:1.05,ymin:-.05,ymax:1.05,equal:true,pad:38};
      const p=webPlot=Lab.plot(web,bounds); p.axes({y:''});
      if(show(1)) p.curve(x=>state.r*x*(1-x),bounds.xmin,bounds.xmax,{stroke:C.blue,width:3});
      if(show(3)) p.line([bounds.xmin,bounds.xmin],[bounds.xmax,bounds.xmax],{stroke:C.gray,width:1.8});
      p.screenText(16,23,'递推图',{color:C.blue,size:18});
      if(show(1)) p.screenMath(94,23,String.raw`x\mapsto rx(1-x)`,{color:C.blue,size:18});
      if(show(3)) p.math([bounds.xmax-.12*(bounds.xmax-bounds.xmin),bounds.ymax-.16*(bounds.ymax-bounds.ymin)],'y=x',{color:C.gray,size:16,anchor:'end'});
      const seen=new Map();
      for(let i=1;i<n;i++) {
        const a=values[i-1], b=values[i], start=[a,i===1?0:a];
        if(show(i===1?2:4)) clippedLine(p,start,[a,b],bounds,{stroke:C.red,width:i===n-1?3:1.6,opacity:i===n-1?1:.65});
        if(show(i===1?3:4)) clippedLine(p,[a,b],[b,b],bounds,{stroke:C.red,width:i===n-1?3:1.6,opacity:i===n-1?1:.65});
        if(show(i===1?2:4)&&a>=bounds.xmin&&a<=bounds.xmax&&b>=bounds.ymin&&b<=bounds.ymax) {
          const key=a.toFixed(3)+','+b.toFixed(3); if(!seen.has(key)) {p.dot([a,b],'',C.red);seen.set(key,true);}
        }
      }
      if(constructionStep!==null&&show(2)) {
        const a2=values[1], inView=a2>=bounds.ymin&&a2<=bounds.ymax;
        if(inView) p.math([state.initial,a2],'(a_1,a_2)',{color:C.target,size:17,dx:10,dy:-14});
        if(show(3)&&inView&&a2!==state.initial) {p.dot([a2,a2],'',C.target);p.math([a2,a2],'(a_2,a_2)',{color:C.target,size:17,dx:10,dy:23});}
        const fixed=state.r===2&&exactInitial(1,2)||state.r===3&&(exactInitial(2,3)||show(4)&&exactInitial(1,3));
        if(show(3)&&fixed) p.screenText(16,p.h-14,'到达不动点后，后续线段与点重合。',{color:C.gray,size:15});
      }
      p.dot([state.initial,0],'',C.target);
      p.math([state.initial,0],'a_1',{color:C.target,size:18,dy:25,anchor:'middle'});
      const clipped=values.some(x=>x<bounds.xmin||x>bounds.xmax);
      if(clipped) p.screenText(16,p.h-14,'轨迹已超出本图范围；右侧标出越界项。',{color:C.red,size:15});
      else if(n===1&&constructionStep===null) {
        const next=state.r*last*(1-last);
        clippedLine(p,[last,0],[last,next],bounds,{stroke:C.red,width:2,dash:'5 5',opacity:.5});
        clippedLine(p,[last,next],[next,next],bounds,{stroke:C.red,width:2,dash:'5 5',opacity:.5});
        p.screenText(16,p.h-14,'虚线预示下一次操作；按按钮后成为已算项。',{color:C.gray,size:15});
      }
      p.finish();
      const ymin=state.r<0?-1.1:-.05, ymax=state.r<0?4.6:1.05, xmax=Math.max(8,n+1);
      const s=Lab.plot(seq,{xmin:0,xmax,ymin,ymax,equal:false,pad:38}); s.axes({x:'n',y:''});
      s.screenText(16,23,'项图',{color:C.ink,size:18});
      s.screenMath(78,23,'(n,a_n)',{color:C.target,size:18});
      if(state.r>0&&show(4)) {
        const fixed=1-1/state.r; s.line([1,fixed],[xmax,fixed],{stroke:C.green,dash:'6 5',width:1.7});
        s.math([xmax-.25,fixed],state.r===2?String.raw`\frac12`:String.raw`\frac23`,{color:C.green,size:18,dy:-12,anchor:'end'});
      }
      let out=0;
      for(let i=0;i<n;i++) {
        const a=values[i];
        if(a>=ymin && a<=ymax) {
          s.line([i+1,0],[i+1,a],{stroke:C.red,opacity:.3,width:1});
          s.dot([i+1,a],'',C.target);
          if(i===n-1)s.math([i+1,a],`a_{${i+1}}`,{color:C.target,size:18,dx:7,dy:state.r>0&&Math.abs(a-(1-1/state.r))<.04?26:-10});
        } else {
          out++;
          s.text([i+1,a>ymax?ymax-.2:ymin+.2],a>ymax?'↑':'↓',{color:C.red,size:24,anchor:'middle'});
        }
      }
      if(out) s.screenText(16,s.h-14,constructionStep===null?`${out} 项超出纵轴范围；精确/近似项值见上方。`:data.overflow?`${out} 项越界；超出数值范围后停止显示。`:`${out} 项超出纵轴范围；箭头仅表示方向。`,{color:C.red,size:15});
      s.finish();
    }
    function setInitial(text) {
      const parsed=text.length<100 ? parseInitial(text) : null;
      if(!parsed) { error='初值须在 '+M.inline('0')+' 与 '+M.inline('1')+' 之间。分数在输入框中用斜杠键入，例如“1/4”。'; render(); return; }
      error=''; state.initial=parsed.value; state.initialText=text; state.rational=parsed.rational; state.n=1;
      $('initial').value=text;
      $('preset').value=['1/4','1/2','2/3','1/3','3/4'].includes(text)?text:'custom';
      render();
    }
    $('r').addEventListener('change',()=>{state.r=Number($('r').value);state.n=1;error='';restartConstruction();render();});
    $('initial').addEventListener('change',()=>setInitial($('initial').value));
    $('initial').addEventListener('keydown',e=>{if(e.key==='Enter')setInitial($('initial').value);});
    $('preset').addEventListener('change',()=>{if($('preset').value!=='custom')setInitial($('preset').value);});
    host.querySelectorAll('[data-q16-preset]').forEach(button=>button.addEventListener('click',()=>setInitial(button.dataset.q16Preset)));
    $('next').addEventListener('click',()=>{state.n=Math.min(30,state.n+1);render();});
    $('restart').addEventListener('click',()=>{state.n=1;render();});
    $('count').addEventListener('input',()=>{state.n=Number($('count').value);render();});
    web.style.touchAction='none';
    const onMove=e=>{if(!dragging||!webPlot)return;const [x]=webPlot.fromEvent(e);setInitial(String(Math.max(.001,Math.min(.999,Math.round(x*1000)/1000))));};
    web.addEventListener('pointerdown',e=>{if(!webPlot)return;const [x,y]=webPlot.fromEvent(e);const scale=state.r<0?5.7:1.1;if(Math.abs(x-state.initial)<.08*scale&&Math.abs(y)<.08*scale){dragging=true;web.setPointerCapture(e.pointerId);onMove(e);}});
    web.addEventListener('pointermove',onMove);
    web.addEventListener('pointerup',()=>{dragging=false;});
    web.addEventListener('pointercancel',()=>{dragging=false;});
    function reset(){state={r:2,initial:.25,initialText:'1/4',rational:[1n,4n],n:1};error='';$('initial').value='1/4';$('preset').value='1/4';restartConstruction();render();}
    render();
    return {render,reset,getConstructionSteps,getConstructionStep(){return constructionStep;},setConstructionStep(index){constructionStep=index===null?null:Math.max(0,Math.min(4,Math.trunc(index)));render();},getState(){const d=generate();return {r:state.r,initial:state.initial,n:state.n,values:d.values,overflow:d.overflow};},destroy(){dragging=false;}};
  }
};
