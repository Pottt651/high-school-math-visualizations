Problems[20] = {
  title: '双曲线：最短切线与垂足定圆',
  statement: `双曲线 ${M.inline(String.raw`C:\frac{x^2}{a^2}-\frac{y^2}{b^2}=1\ (a,b>0)`)} 的离心率为 ${M.inline(String.raw`\sqrt2`)}，${M.inline('P(2,-1)')} 在其上。<br>（1）求标准方程。<br>（2）${M.inline('S')} 在 ${M.inline('C')} 上，${M.inline('T')} 在圆 ${M.inline(String.raw`E:(x-4)^2+y^2=1`)} 上，且 ${M.inline('ST')} 与圆相切，求 ${M.inline('|ST|')} 的最小值。<br>（3）${M.inline('A,B')} 是双曲线上两点，直线 ${M.inline('PA,PB')} 与 ${M.inline('y')} 轴分别交于 ${M.inline('M,N')}。${M.inline('Q')} 在直线 ${M.inline('AB')} 上，若 ${M.inline('M,N')} 关于原点对称，且 ${M.inline(String.raw`PQ\perp AB`)}，证明：存在定点 ${M.inline('R')}，使 ${M.inline('|QR|')} 为定值。〔原卷第 7 页〕`,
  mount(host) {
    const C=Lab.C,P=[2,-1],E=[4,0],F=[0,-3],R=[1,-2];
    let state={mode:'tangent',y:2,branch:1,tangent:1,m:.45,circle:true},constructionStep=null,plot=null,drag=null;
    const show=i=>constructionStep===null||constructionStep>=i;
    const num=(v,d=3)=>M.number(v,d);
    const pair=v=>`(${num(v[0])},${num(v[1])})`;
    function tangentModel(){
      const S=[state.branch*Math.sqrt(state.y**2+3),state.y],v=[S[0]-4,S[1]],d2=v[0]**2+v[1]**2,t=Math.sqrt(d2-1),s=state.tangent;
      const T=[4+v[0]/d2-s*v[1]*t/d2,v[1]/d2+s*v[0]*t/d2];
      return {S,T,d2,length:t};
    }
    function chordModel(){
      const m=state.m,excluded=[0,1,3].find(v=>Math.abs(m-v)<1e-9);
      if(excluded!==undefined)return {valid:false,m,reason:excluded===0?'M、N 重合，两条割线重合，A、B 不能确定不同的弦端点。':excluded===1?'一条直线平行于渐近线，除 P 外没有第二个有限交点。':'一条直线在 P 处相切，另一条平行于渐近线，不能得到题设的两个弦端点。'};
      const point=t=>{const d=(t-1)*(t+3);return[2*(t*t+3)/d,(t*t-6*t-3)/d];};
      const A=point(m),B=point(-m),k=2*(m*m-3)/(m*m+3),lambda=2*(1-k)/(1+k*k),Q=[2+k*lambda,-1-lambda];
      return {valid:true,m,A,B,M:[0,m],N:[0,-m],k,Q,qr:Math.hypot(Q[0]-1,Q[1]+2)};
    }
    const commonProof=`<section class="proof-step"><h3>① 离心率和已知点确定方程</h3>${M.block(String.raw`e^2=\frac{c^2}{a^2}=\frac{a^2+b^2}{a^2}=2\Rightarrow b^2=a^2.`)}<p>代入 ${M.inline('P(2,-1)')}，得 ${M.inline(String.raw`\frac{4-1}{a^2}=1`)}，所以 ${M.inline('a^2=b^2=3')}。</p><div class="target">${M.block(String.raw`C:\frac{x^2}{3}-\frac{y^2}{3}=1\quad\text{即}\quad x^2-y^2=3.`)}</div></section>`;
    function proof(){
      if(state.mode==='tangent')return commonProof+`<section class="proof-step"><h3>② 切线长度转成点到圆心的距离</h3><p>圆心为 ${M.inline('E(4,0)')}，半径 ${M.inline('ET=1')}。相切意味着 ${M.inline(String.raw`ET\perp ST`)}，故</p>${M.block(String.raw`ST^2=SE^2-ET^2=SE^2-1.`)}<p>因此让切线最短，等价于让双曲线上的点到圆心的距离最短。</p></section><section class="proof-step"><h3>③ 用双曲线约束消去一个变量</h3><p>设 ${M.inline('S(x,y)')}，由 ${M.inline('y^2=x^2-3')} 得</p>${M.block(String.raw`\begin{aligned}SE^2&=(x-4)^2+y^2\\&=(x-4)^2+x^2-3\\&=2(x-2)^2+5\ge5.\end{aligned}`)}<p>等号要求 ${M.inline('x=2')}，此时 ${M.inline(String.raw`y=\pm1`)}，确实在双曲线上。这个下界对左右两支上的所有点都成立，不是只比较图中采样点。</p></section><section class="proof-step"><h3>④ 回到切线长度，并核对取等点</h3><div class="target">${M.block(String.raw`ST^2\ge5-1=4\Rightarrow ST_{\min}=2.`)}</div><p>当 ${M.inline('S=(2,1)')} 或 ${M.inline('S=(2,-1)')} 时取到。所有 ${M.inline('S')} 都满足 ${M.inline(String.raw`SE\ge\sqrt5>1`)}，故始终在圆外，两条实切线均存在。</p></section>`;
      return commonProof+`<section class="proof-step"><h3>② 用对称截距表示两条割线</h3><p>设 ${M.inline('M=(0,m),N=(0,-m)')}。交换 ${M.inline('A,B')} 不影响结论，因此操作面板只需取 ${M.inline(String.raw`m\ge0`)}。两条直线分别是</p>${M.block(String.raw`PA:y=-\frac{m+1}{2}x+m,`)}${M.block(String.raw`PB:y=\frac{m-1}{2}x-m.`)}<p>与 ${M.inline('x^2-y^2=3')} 联立，已知其中一个交点是 ${M.inline('P')}，约去它后得到</p>${M.block(String.raw`\begin{aligned}x_A&=\frac{2(m^2+3)}{m^2+2m-3},\\y_A&=\frac{m^2-6m-3}{m^2+2m-3}.\end{aligned}`)}<p>${M.inline('B')} 的坐标只需把上式中的 ${M.inline('m')} 换成 ${M.inline('-m')}。</p><p class="proof-note">原题合法条件排除 ${M.inline(String.raw`m=0,\pm1,\pm3`)}：分别对应重合割线、渐近线方向或在 ${M.inline('P')} 处相切。${M.inline('PA,PB')} 还须与 ${M.inline('y')} 轴有有限交点，因此不存在未被此参数包含的竖直割线。</p></section><section class="proof-step"><h3>③ 对称条件使 AB 经过定点</h3><p>将两点式整理（合法参数下 ${M.inline(String.raw`x_A\ne x_B`)}），得</p>${M.block(String.raw`AB:y=\frac{2(m^2-3)}{m^2+3}x-3.`)}<p>无论 ${M.inline('m')} 怎样变化，${M.inline('y')} 轴截距始终为 ${M.inline('-3')}。所以所有合法弦所在直线都经过定点 <span class="gold">${M.inline('F=(0,-3)')}</span>。</p></section><section class="proof-step"><h3>④ 垂足落在以 PF 为直径的定圆上</h3><p>因为 ${M.inline('F,Q')} 都在 ${M.inline('AB')} 上，且 ${M.inline(String.raw`PQ\perp AB`)}，所以 ${M.inline(String.raw`\angle PQF=90^\circ`)}。点 ${M.inline('Q')} 在以 ${M.inline('PF')} 为直径的圆上。</p>${M.block(String.raw`\begin{aligned}R&=\frac{P+F}{2}=(1,-2),\\PF&=\sqrt{2^2+2^2}=2\sqrt2.\end{aligned}`)}<div class="target">${M.block(String.raw`|QR|=\frac{PF}{2}=\sqrt2.`)}</div><p class="proof-note">这里证明的是每个合法垂足都在这个定圆上；不声称原题的垂足能遍历整个圆。图中的虚线圆是承载轨迹的定圆，退化参数不属于原题。</p></section>`;
    }
    host.innerHTML=`<div class="controls"><label>分问 <select id="b20-mode"><option value="tangent">（2）切线最短</option><option value="locus">（3）垂足定圆</option></select></label><label id="b20-y-wrap">${M.inline('y_S')} <input id="b20-y" type="range" min="-4" max="4" step=".01" value="2"><output id="b20-y-value"></output></label><label id="b20-branch-wrap">双曲线 <select id="b20-branch"><option value="1">右支</option><option value="-1">左支</option></select></label><button id="b20-other">另一条切线</button><button id="b20-best">取最短位置</button><label id="b20-m-wrap" hidden>对称截距 ${M.inline(String.raw`\pm m`)} <input id="b20-m" type="range" min="0" max="6" step=".01" value=".45"><output id="b20-m-value"></output></label><label id="b20-circle-wrap" hidden><input id="b20-circle" type="checkbox" checked>显示定圆</label><button id="b20-horizontal" hidden>水平弦</button></div>
      <div class="figures"><svg id="b20-graph" class="main-figure" role="img" aria-label="双曲线的相切与垂足联动图"></svg></div><p class="caption" id="b20-caption"></p><div class="readout" id="b20-readout"></div><div class="explain" id="b20-proof"></div>`;
    const el=id=>host.querySelector('#b20-'+id);
    el('proof').innerHTML=proof();
    function getConstructionSteps(){
      return state.mode==='tangent'?[
        {title:'先由已知条件画双曲线',body:`由 ${M.inline(String.raw`e=\sqrt2`)} 和 ${M.inline('P(2,-1)')} 得到 ${M.inline('x^2-y^2=3')}。蓝色是双曲线落在当前局部窗口内的部分，可切换动点所在分支。`},
        {title:'画单位圆和曲线上的动点',body:`圆心为 ${M.inline('E(4,0)')}，半径为 ${M.inline('1')}。改变 ${M.inline('y_S')} 或切换分支，点 ${M.inline('S')} 始终满足双曲线方程。`},
        {title:'由垂直半径确定切点',body:`过 ${M.inline('S')} 作切线，半径 ${M.inline('ET')} 与 ${M.inline('ST')} 垂直。红线是所求切线段；可切换两条切线，它们的长度相等。`},
        {title:'勾股定理连接最短切线和最短距离',body:`补出 ${M.inline('SE')}，由直角三角形得到 ${M.inline('ST^2=SE^2-1')}。双曲线约束又使 ${M.inline('SE^2=2(x_S-2)^2+5')}，从而读出最小值。`}
      ]:[
        {title:'画双曲线与已知点',body:`蓝色双曲线为 ${M.inline('x^2-y^2=3')}，固定点为 ${M.inline('P(2,-1)')}。`},
        {title:'在 y 轴取对称的两个截点',body:`取 ${M.inline('M=(0,m),N=(0,-m)')}，这样 ${M.inline('OM=ON')}。改变 ${M.inline('m')} 时仍保持原点对称。`},
        {title:'画两条过 P 的割线',body:`连接 ${M.inline('PM,PN')}，分别与双曲线再交于 ${M.inline('A,B')}。退化参数 ${M.inline('m=0,1,3')} 不生成假交点。`},
        {title:'连弦并作垂线',body:`连接 ${M.inline('A,B')} 得到经过 ${M.inline('F(0,-3)')} 的直线，再从 ${M.inline('P')} 作垂线，垂足为 ${M.inline('Q')}。`},
        {title:'固定直径揭示不变距离',body:`连接 ${M.inline('PF')}，其中点是 ${M.inline('R(1,-2)')}。${M.inline('Q')} 落在以 ${M.inline('PF')} 为直径的圆上，因此红色半径 ${M.inline(String.raw`QR=\sqrt2`)} 不变。`}
      ];
    }
    function modeChanged(){if(constructionStep!==null)constructionStep=0;el('proof').innerHTML=proof();host.dispatchEvent(new Event('constructionchange'));}
    function clippedLine(p,A,B,b,opts){
      const dx=B[0]-A[0],dy=B[1]-A[1],hits=[];
      if(Math.abs(dx)>1e-12)for(const x of [b.xmin,b.xmax]){const t=(x-A[0])/dx,y=A[1]+t*dy;if(y>=b.ymin-1e-8&&y<=b.ymax+1e-8)hits.push([x,y]);}
      if(Math.abs(dy)>1e-12)for(const y of [b.ymin,b.ymax]){const t=(y-A[1])/dy,x=A[0]+t*dx;if(x>=b.xmin-1e-8&&x<=b.xmax+1e-8)hits.push([x,y]);}
      if(hits.length>=2)p.line(hits[0],hits.find(v=>Math.hypot(v[0]-hits[0][0],v[1]-hits[0][1])>1e-7)||hits[1],opts);
    }
    function conic(p,b){
      const yy=Math.max(Math.abs(b.ymin),Math.abs(b.ymax));
      for(const sign of [-1,1]){
        const pts=Array.from({length:321},(_,i)=>{const y=-yy+2*yy*i/320;return[sign*Math.sqrt(y*y+3),y];}).filter(v=>v[0]>=b.xmin&&v[0]<=b.xmax&&v[1]>=b.ymin&&v[1]<=b.ymax);
        p.add(`<polyline points="${pts.map(v=>p.to(v).join(',')).join(' ')}" fill="none" stroke="${C.blue}" stroke-width="2.3"/>`);
      }
    }
    function rightAngle(p,vertex,one,two){
      const l1=Math.hypot(...one),l2=Math.hypot(...two);if(l1<1e-8||l2<1e-8)return;
      const r=11/p.sx,u=one.map(v=>v/l1*r),v=two.map(v=>v/l2*r),a=[vertex[0]+u[0],vertex[1]+u[1]],b=[a[0]+v[0],a[1]+v[1]],c=[vertex[0]+v[0],vertex[1]+v[1]];
      p.line(a,b,{stroke:C.gray,width:1.2});p.line(b,c,{stroke:C.gray,width:1.2});
    }
    function render(){
      const tangent=state.mode==='tangent';el('mode').value=state.mode;
      for(const id of ['y-wrap','branch-wrap','other','best'])el(id).hidden=!tangent;
      for(const id of ['m-wrap','circle-wrap','horizontal'])el(id).hidden=tangent;
      el('y').value=state.y;el('y-value').textContent=Lab.fmt(state.y,2);el('branch').value=state.branch;
      el('m').value=state.m;el('m-value').textContent=Lab.fmt(state.m,3);el('circle').checked=state.circle;
      const currentS=tangent?tangentModel().S:null;
      // Keep the true y axis at x=0 while fitting the current point and circle.
      // This is a local window, not an assertion about the full hyperbola.
      const b=tangent?{xmin:Math.min(-.8,currentS[0]-.8),xmax:5.7,ymin:Math.min(-1.6,state.y-.9),ymax:Math.max(1.6,state.y+.9),pad:44}:{xmin:-6.6,xmax:5.1,ymin:-5.1,ymax:5.6,pad:54};
      const p=Lab.plot(el('graph'),b);plot=p;p.axes({stepX:2,stepY:2});conic(p,b);
      p.screenMath(16,31,'x^2-y^2=3',{size:18,color:C.blue});
      if(tangent){
        const g=tangentModel();
        if(show(1)){p.circle(E,1,{stroke:C.gold,width:2.3});p.dot(E,'E',C.gold,12,25);p.dot(g.S,'S',C.blue,-26,-15);}
        if(show(2)){
          p.line(g.S,g.T,{stroke:C.target,width:3.1});p.line(E,g.T,{stroke:C.gold,width:2});p.dot(g.T,'T',C.target,12,-17);
          rightAngle(p,g.T,[E[0]-g.T[0],E[1]-g.T[1]],[g.S[0]-g.T[0],g.S[1]-g.T[1]]);
        }
        if(show(3)){p.line(E,g.S,{stroke:C.gray,width:1.4,dash:'5 4'});p.math([(E[0]+g.S[0])/2,(E[1]+g.S[1])/2],'SE',{color:C.gray,dy:-16,size:18});}
        p.screenText(16,p.h-20,'红色 ST：从双曲线上的 S 向单位圆作切线',{size:16,color:C.target});
        el('caption').textContent=`当前为${state.branch>0?'右':'左'}支局部放大窗口，可切换另一支。拖动 S 观察切线长；滑杆范围 −4 ≤ yS ≤ 4，解析证明覆盖整条双曲线。`;
        el('readout').innerHTML=`<span>${M.inline(`S=${pair(g.S)}`)}</span><span>${M.inline(`SE^2\\approx${num(g.d2)}`)}</span><span class="target">${M.inline(`ST=\\sqrt{SE^2-1}\\approx${num(g.length)}`)}</span>${M.answer(`（1）${M.inline('x^2-y^2=3')}；（2）${M.inline(String.raw`ST_{\min}=2`)}，在 ${M.inline(String.raw`S=(2,\pm1)`)} 处取到。`)}`;
      }else{
        const g=chordModel();p.dot(P,'P',C.ink,12,-16);
        if(show(1)){p.dot([0,state.m],'M',C.green,12,-12);p.dot([0,-state.m],'N',C.green,-30,22);}
        if(!g.valid){
          p.screenText(16,67,'当前为退化参数：不绘制不存在的 A、B、Q',{size:16,color:C.target});
          el('readout').innerHTML=`<span class="warning">${M.inline(`m=${num(state.m)}`)}：${g.reason}请调整滑杆。</span>${M.answer(`原题合法构型中：${M.inline('R=(1,-2)')}，${M.inline(String.raw`|QR|=\sqrt2`)}。`)}`;
        }else{
          const outside=[];
          if(show(2)){
            clippedLine(p,P,g.A,b,{stroke:C.green,width:1.6,dash:'5 4'});clippedLine(p,P,g.B,b,{stroke:C.green,width:1.6,dash:'5 4'});
            for(const [name,v] of [['A',g.A],['B',g.B]]){
              if(v[0]>=b.xmin&&v[0]<=b.xmax&&v[1]>=b.ymin&&v[1]<=b.ymax)p.dot(v,name,C.blue,v[0]>0?12:-27,-12);else outside.push(name);
            }
          }
          if(show(3)){
            clippedLine(p,g.A,g.B,b,{stroke:C.gold,width:2.5});p.line(P,g.Q,{stroke:C.target,width:2.6});p.dot(F,'F',C.gold,-26,22);p.dot(g.Q,'Q',C.target,-26,-15);
            rightAngle(p,g.Q,[P[0]-g.Q[0],P[1]-g.Q[1]],[1,g.k]);
          }
          if(show(4)){
            if(state.circle)p.circle(R,Math.SQRT2,{stroke:C.target,width:1.4,dash:'4 5',opacity:.55});
            p.line(P,F,{stroke:C.gray,width:1.2,dash:'5 4'});p.line(R,g.Q,{stroke:C.target,width:3.4});p.dot(R,'R',C.target,12,22);
          }
          if(outside.length)p.screenText(16,65,`${outside.join('、')} 在绘图窗口外；割线方向仍按真实坐标绘制`,{size:15,color:C.gray});
          p.screenMath(16,p.h-23,`QR\\approx${num(g.qr,5)}`,{size:21,color:C.target});
          el('readout').innerHTML=`<span>${M.inline(`M=(0,${num(state.m)}),\\ N=(0,${num(-state.m)})`)}</span><span class="gold">${M.inline(`AB:y=(${num(g.k,4)})x-3`)}</span><span class="target">${M.inline(`Q=${pair(g.Q)},\\quad QR\\approx${num(g.qr,5)}`)}</span>${outside.length?`<small>${outside.map(name=>`${M.inline(`${name}=${pair(g[name])}`)}`).join('；')}；窗外点没有移动到边框上。</small>`:''}${M.answer(`（3）取定点 ${M.inline('R=(1,-2)')}，则 ${M.inline(String.raw`|QR|=\sqrt2`)}。`)}`;
        }
        el('caption').textContent='改变对称截距 m，看金色 AB 是否总过 F，再观察红色 QR。m = 0、1、3 为退化构型，不属于原题；负 m 只交换 A、B。虚线圆不表示所有圆周点都可达到。';
      }
      p.finish();
    }
    el('mode').onchange=e=>{state.mode=e.target.value;drag=null;modeChanged();render();};
    el('y').oninput=e=>{state.y=+e.target.value;render();};el('branch').onchange=e=>{state.branch=+e.target.value;render();};
    el('other').onclick=()=>{state.tangent*=-1;render();};el('best').onclick=()=>{state.branch=1;state.y=state.y<0?-1:1;render();};
    el('m').oninput=e=>{state.m=+e.target.value;render();};el('circle').onchange=e=>{state.circle=e.target.checked;render();};el('horizontal').onclick=()=>{state.m=Math.sqrt(3);render();};
    el('graph').onpointerdown=e=>{if(state.mode!=='tangent'||!show(1))return;const g=tangentModel(),v=plot.fromEvent(e);if(Math.hypot((v[0]-g.S[0])*plot.sx,(v[1]-g.S[1])*plot.sy)>25)return;drag='S';el('graph').setPointerCapture(e.pointerId);e.preventDefault();};
    el('graph').onpointermove=e=>{if(!drag)return;state.y=Math.max(-4,Math.min(4,plot.fromEvent(e)[1]));render();};el('graph').onpointerup=el('graph').onpointercancel=()=>drag=null;
    return{render,reset(){state={mode:'tangent',y:2,branch:1,tangent:1,m:.45,circle:true};modeChanged();render();},getState(){return{...state,...(state.mode==='tangent'?tangentModel():chordModel())};},getConstructionSteps,getConstructionStep:()=>constructionStep,setConstructionStep(i){constructionStep=i===null?null:Math.max(0,Math.min(getConstructionSteps().length-1,Math.trunc(i)));render();},destroy(){el('graph').onpointerdown=el('graph').onpointermove=el('graph').onpointerup=el('graph').onpointercancel=null;}};
  }
};
