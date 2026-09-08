Problems[12] = {
  title: '绝对值：两段距离的和',
  statement: `已知 ${M.inline('x_1^2+y_1^2=x_2^2+y_2^2=1')}，${M.inline(String.raw`x_1x_2+y_1y_2=\dfrac12`)}。求 <span class="target">${M.inline(String.raw`\dfrac{|x_1+y_1-1|+|x_2+y_2-1|}{\sqrt2}`)} 的最小值</span>。`,
  mount(host) {
    const initial={angle:24,sign:1};let state={...initial},plot,drag=false;
    host.innerHTML=`<div class="controls"><label>${M.inline('P')} 的转角 <input id="q12-angle" type="range" min="0" max="360" step="0.2" value="24"> <output id="q12-angle-value"></output></label><label>${M.inline('Q')} 相对 ${M.inline('P')} <select id="q12-sign"><option value="1">逆时针 60°</option><option value="-1">顺时针 60°</option></select></label><button id="q12-boundary">一个点落在线上</button><span class="hint">拖动圆周改变两点位置</span></div><div class="figures"><svg id="q12-svg" class="main-figure" role="img" aria-label="单位圆上夹角固定的两点及它们到直线的距离"></svg></div><div class="readout" id="q12-readout"></div><div class="explain"><section class="proof-step"><h3>把绝对值读成距离</h3><p>${M.inline('P,Q')} 在单位圆上，${M.inline(String.raw`\overrightarrow{OP}\cdot\overrightarrow{OQ}=\cos\angle POQ=\dfrac12`)}，因此较小夹角为 ${M.inline(String.raw`60^\circ`)}。两项分别是 ${M.inline('P,Q')} 到直线 ${M.inline('x+y=1')} 的距离：</p>${M.block(String.raw`\begin{aligned}d_P&=\dfrac{|x_1+y_1-1|}{\sqrt2},\\d_Q&=\dfrac{|x_2+y_2-1|}{\sqrt2}.\end{aligned}`)}</section><section class="proof-step"><h3>先找临界位置</h3><p>一个点刚好在线上时，一项绝对值变号。点击“一个点落在线上”，可见另一点到直线的距离为 <span class="target">${M.inline(String.raw`\dfrac{\sqrt6-\sqrt2}{4}\approx0.259`)}</span>。仅找到此位置还不够，需要证明没有更小值。</p></section><section class="proof-step"><h3>证明没有更小值</h3><p>以直线法向为基准，设两点的方向角分别为 ${M.inline(String.raw`\gamma-\dfrac\pi6`)}、${M.inline(String.raw`\gamma+\dfrac\pi6`)}。利用</p>${M.block(String.raw`|u+v|+|u-v|=2\max\{|u|,|v|\}`)}<p>可将距离和写成</p><div class="target">${M.block(String.raw`\begin{aligned}F(\gamma)&=d_P+d_Q\\&=\max\bigl\{|\sqrt3\cos\gamma-\sqrt2|,\\&\qquad\qquad |\sin\gamma|\bigr\}.\end{aligned}`)}</div><p>利用对称只需考察 ${M.inline(String.raw`\gamma\in[0,\pi]`)}；${M.inline(String.raw`\gamma\ge\dfrac\pi2`)} 时第一项 ${M.inline(String.raw`\ge\sqrt2`)}。若 ${M.inline(String.raw`0\le\gamma\le\dfrac\pi{12}`)}，则第一项 ${M.inline(String.raw`\ge\sin\dfrac\pi{12}`)}；若 ${M.inline(String.raw`\dfrac\pi{12}\le\gamma\le\dfrac\pi2`)}，则第二项 ${M.inline(String.raw`\ge\sin\dfrac\pi{12}`)}。</p><p>当 ${M.inline(String.raw`\gamma=\dfrac\pi{12}`)} 时两项相等，因此 <span class="target">${M.inline(String.raw`\min F=\sin\dfrac\pi{12}=\dfrac{\sqrt6-\sqrt2}{4}`)}</span>。</p><p>这个证明统一了两点在直线同侧与异侧的分类。</p></section></div>`;
    const svg=host.querySelector('#q12-svg'),angle=host.querySelector('#q12-angle'),sign=host.querySelector('#q12-sign');
    function model(){
      const point=degrees=>{let t=degrees%360;if(t<0)t+=360;return t===0?[1,0]:t===90?[0,1]:t===180?[-1,0]:t===270?[0,-1]:[Math.cos(t*Math.PI/180),Math.sin(t*Math.PI/180)];};
      const a=state.angle*Math.PI/180,b=a+state.sign*Math.PI/3,P=point(state.angle),Q=point(state.angle+state.sign*60);
      const foot=X=>{const d=(X[0]+X[1]-1)/2;return [X[0]-d,X[1]-d];};
      const d1=Math.abs(P[0]+P[1]-1)/Math.sqrt(2),d2=Math.abs(Q[0]+Q[1]-1)/Math.sqrt(2);
      return {a,b,P,Q,H1:foot(P),H2:foot(Q),d1,d2,sum:d1+d2,dot:P[0]*Q[0]+P[1]*Q[1]};
    }
    function distanceRuler(p,m,C){
      if(p.w<660)return;
      const x=p.w-236,y=43,start=x+18,width=178,step=Math.max(m.d1,m.d2)<=.5?.1:Math.max(m.d1,m.d2)<=1?.2:.5;
      const maximum=Math.ceil(Math.max(m.d1,m.d2)/step)*step;
      p.add('<g data-q12-ruler="true">');
      p.add(`<rect x="${x-8}" y="${y-22}" width="228" height="178" fill="transparent" pointer-events="all"/>`);
      p.screenText(x,y,'两段距离 · 共用刻度',{color:C.ink,size:15});
      p.add(`<line x1="${start}" y1="${y+31}" x2="${start+width}" y2="${y+31}" stroke="${C.gray}" stroke-width="1"/>`);
      [0,maximum/2,maximum].forEach(value=>{const sx=start+width*value/maximum;p.add(`<line x1="${sx}" y1="${y+28}" x2="${sx}" y2="${y+34}" stroke="${C.gray}"/>`);p.screenText(sx,y+22,Lab.fmt(value,2),{color:C.gray,size:12,anchor:'middle'});});
      [[m.d1,'PH₁',C.blue,''],[m.d2,'QH₂',C.gold,'4 3']].forEach(([distance,label,color,dash],index)=>{
        const lineY=y+68+index*51,end=start+width*distance/maximum;
        p.screenText(x,lineY-12,label,{color,size:16,weight:600});
        p.screenText(x+210,lineY-12,distance===0?'= 0':'≈ '+Lab.fmt(distance,3),{color:C.target,size:16,anchor:'end'});
        p.add(`<line x1="${start}" y1="${lineY}" x2="${start+width}" y2="${lineY}" stroke="${C.gray}" stroke-width="1" opacity=".3"/>`);
        if(distance>0)p.add(`<line x1="${start}" y1="${lineY}" x2="${end}" y2="${lineY}" stroke="${C.target}" stroke-width="3"${dash?` stroke-dasharray="${dash}"`:''}/>`);
        p.add(`<circle cx="${start}" cy="${lineY}" r="3" fill="${color}"/><rect x="${end-3}" y="${lineY-3}" width="6" height="6" fill="var(--canvas)" stroke="${color}" stroke-width="1.5"/>`);
      });
      p.add('</g>');
    }
    function render(){const m=model(),C=Lab.C;angle.value=state.angle;sign.value=state.sign;host.querySelector('#q12-angle-value').textContent=Lab.fmt(state.angle,1)+'°';
      const p=Lab.plot(svg,{xmin:-1.32,xmax:1.65,ymin:-1.25,ymax:1.45,pad:38});plot=p;p.axes();p.circle([0,0],1,{stroke:C.ink,width:2});p.line([-0.6,1.6],[1.6,-0.6],{stroke:C.gray,width:2.5});p.math([1.3,-.3],'x+y=1',{color:C.ink,size:18,dx:8,dy:23});
      p.line([0,0],m.P,{stroke:C.blue,width:1.5,opacity:.6});p.line([0,0],m.Q,{stroke:C.gold,width:1.5,opacity:.6});
      const arc=[];for(let i=0;i<=24;i++){const t=m.a+state.sign*Math.PI/3*i/24;arc.push([.28*Math.cos(t),.28*Math.sin(t)]);}for(let i=1;i<arc.length;i++)p.line(arc[i-1],arc[i],{stroke:C.gray,width:1.5});const mid=(m.a+m.b)/2;p.text([.40*Math.cos(mid),.40*Math.sin(mid)],'60°',{color:C.gray,anchor:'middle',size:17,dy:6});
      [[m.P,m.H1,m.d1,'H₁',C.blue,''],[m.Q,m.H2,m.d2,'H₂',C.gold,'4 3']].forEach(([X,H,distance,label,color,dash],index)=>{
        if(distance===0)return;
        p.line(X,H,{stroke:C.target,width:3.5,dash});
        const h=p.to(H);p.add(`<rect x="${h[0]-3}" y="${h[1]-3}" width="6" height="6" fill="var(--canvas)" stroke="${color}" stroke-width="1.6"/>`);
        const sg=Math.sign(X[0]+X[1]-1),u=[sg/Math.sqrt(2),sg/Math.sqrt(2)],v=[1/Math.sqrt(2),-1/Math.sqrt(2)],r=Math.min(.055,distance*.45);
        const corner=[[H[0]+u[0]*r,H[1]+u[1]*r],[H[0]+(u[0]+v[0])*r,H[1]+(u[1]+v[1])*r],[H[0]+v[0]*r,H[1]+v[1]*r]];
        p.line(corner[0],corner[1],{stroke:color,width:1.1});p.line(corner[1],corner[2],{stroke:color,width:1.1});
        p.text(H,label,{color,size:17,dx:index?-18:16,dy:sg>0?22:-17,anchor:index?'end':'start'});
      });
      p.dot([0,0],'O',C.ink,-21,20);
      p.dot(m.P,m.d1===0?'P=H₁':'P',C.blue,m.P[0]<0?-24:11,m.P[1]<0?22:-11);
      p.dot(m.Q,m.d2===0?'Q=H₂':'Q',C.gold,m.Q[0]<0?-25:11,m.Q[1]<0?22:-11);
      distanceRuler(p,m,C);p.finish();
      const where=X=>X[0]+X[1]===1?'在线上':M.inline(X[0]+X[1]-1>0?'x+y-1>0':'x+y-1<0');
      const distanceTex=(symbol,distance)=>`${symbol}${distance===0?'=0':String.raw`\approx${M.number(distance,3)}`}`;
      host.querySelector('#q12-readout').innerHTML=`<span class="target"><span style="color:${C.blue}">${M.inline('PH_1')}</span>${M.inline('='+distanceTex('d_P',m.d1))}</span><span class="target"><span style="color:${C.gold}">${M.inline('QH_2')}</span>${M.inline('='+distanceTex('d_Q',m.d2))}</span><strong class="target">距离和 ${M.inline(String.raw`F=d_P+d_Q\approx${Lab.fmt(m.sum)}`)}</strong>${M.answer(M.inline(String.raw`\min F=\dfrac{\sqrt6-\sqrt2}{4}`))}<small>${M.inline('P')}：${where(m.P)}；${M.inline('Q')}：${where(m.Q)}。${M.inline('P,H_1')} 同为蓝色，${M.inline('Q,H_2')} 同为金色；红实线、红虚线分别表示两段距离，方框为垂足。</small>`;
    }
    angle.oninput=()=>{state.angle=+angle.value;render();};sign.onchange=()=>{state.sign=+sign.value;render();};host.querySelector('#q12-boundary').onclick=()=>{state.angle=state.sign===1?0:60;render();};
    function update(e){const [x,y]=plot.fromEvent(e);state.angle=(Math.atan2(y,x)*180/Math.PI+360)%360;render();}
    svg.style.touchAction='none';svg.style.cursor='grab';svg.addEventListener('pointerdown',e=>{if(e.target.closest('[data-q12-ruler]'))return;drag=true;svg.setPointerCapture(e.pointerId);update(e);});svg.addEventListener('pointermove',e=>{if(drag)update(e);});svg.addEventListener('pointerup',()=>drag=false);svg.addEventListener('pointercancel',()=>drag=false);
    render();return {render,reset(){state={...initial};render();},getState(){return {...state,...model()};},destroy(){drag=false;}};
  }
};
