Problems[15] = {
  title: '冷却塔：截面半径怎样确定双曲线？',
  statement: `双曲线型自然冷却通风塔的外形，是双曲线的一部分绕其虚轴所在直线旋转一周形成的曲面。下口直径为 ${M.inline(String.raw`20\sqrt{10}`)} 米，上口直径为 ${M.inline(String.raw`20\sqrt2`)} 米，最小直径为 20 米，高为 80 米。求此双曲线的<span class="target">焦距</span>。选项：A. ${M.inline(String.raw`10\sqrt3`)}；B. ${M.inline(String.raw`10\sqrt5`)}；C. ${M.inline(String.raw`20\sqrt3`)}；D. ${M.inline(String.raw`20\sqrt5`)}。〔原卷第 2—3 页〕`,
  mount(host) {
    const C=Lab.C, a=10, b=20, c=Math.sqrt(500);
    let height=36,constructionStep=null;
    const show=i=>constructionStep===null||constructionStep>=i;
    const steps=[
      {title:'在最细处建立坐标系',body:`以最细圆的圆心为原点，旋转轴为 ${M.inline('y')} 轴。纵截面为 ${M.inline(String.raw`\frac{x^2}{a^2}-\frac{y^2}{b^2}=1`)}，最小直径为 ${M.inline('2a=20')}，故 ${M.inline('a=10')}。`},
      {title:'把上下口的直径改成半径',body:`下口和上口的横坐标分别是 ${M.inline(String.raw`10\sqrt{10}`)}、${M.inline(String.raw`10\sqrt2`)}。代入方程，得到纵坐标 ${M.inline('-3b')} 和 ${M.inline('b')}。图示最细处在两口之间。`},
      {title:'用总高度确定纵半轴',body:`上下口之间的竖直距离为 ${M.inline('b-(-3b)=4b=80')}，所以 ${M.inline('b=20')}。下口在 ${M.inline('y=-60')}，上口在 ${M.inline('y=20')}。`},
      {title:'水平切片连接双曲线和圆',body:`拖动离地高度 ${M.inline('h')}。在 ${M.inline('y=h-60')} 处，双曲线的横坐标就是该水平圆截面的半径 ${M.inline(String.raw`r=10\sqrt{1+\frac{(h-60)^2}{400}}`)}。两幅图使用相同的米制长度单位。`},
      {title:'由半轴求双曲线的焦距',body:`双曲线满足 ${M.inline('c^2=a^2+b^2')}，故 ${M.inline(String.raw`c=10\sqrt5`)}。红色两焦点间的距离是 ${M.inline(String.raw`2c=20\sqrt5`)}，不是 ${M.inline('c')}。`}
    ];
    host.innerHTML=`<div class="controls"><label>离下口高度 ${M.inline('h')} <input id="b15-height" type="range" min="0" max="80" step=".1" value="36"><output id="b15-height-value"></output></label><button id="b15-bottom">下口</button><button id="b15-waist">最细处</button><button id="b15-top">上口</button></div>
      <div class="figures"><svg id="b15-profile" class="figure" role="img" aria-label="冷却塔双曲线纵截面与水平切片位置"></svg><svg id="b15-section" class="figure" role="img" aria-label="当前高度的真实圆形水平截面"></svg></div>
      <div class="readout" id="b15-readout"></div>
      <div class="explain"><section class="proof-step"><h3>① 最小直径确定实半轴</h3><p>以最细处为原点，旋转轴为虚轴所在直线，纵截面的双曲线方程设为</p>${M.block(String.raw`\frac{x^2}{a^2}-\frac{y^2}{b^2}=1\quad(a,b>0).`)}<p>最小直径为 ${M.inline('2a=20')}，所以 ${M.inline('a=10')}。注意题目给的是直径，代入双曲线方程要用半径。</p></section>
      <section class="proof-step"><h3>② 两个口径确定上下口高度</h3><p>下口半径为 ${M.inline(String.raw`10\sqrt{10}`)}，故</p>${M.block(String.raw`\frac{(10\sqrt{10})^2}{100}-\frac{y_{\mathrm{下}}^2}{b^2}=1\Rightarrow y_{\mathrm{下}}^2=9b^2.`)}<p>上口半径为 ${M.inline(String.raw`10\sqrt2`)}，同理 ${M.inline(String.raw`y_{\mathrm{上}}^2=b^2`)}。由原图最细处在两口之间，取 ${M.inline(String.raw`y_{\mathrm{下}}=-3b`)}、${M.inline(String.raw`y_{\mathrm{上}}=b`)}。</p></section>
      <section class="proof-step"><h3>③ 总高度确定虚半轴</h3>${M.block(String.raw`80=y_{\mathrm{上}}-y_{\mathrm{下}}=b+3b=4b.`)}<p>所以 ${M.inline('b=20')}，双曲线为</p>${M.block(String.raw`\frac{x^2}{100}-\frac{y^2}{400}=1.`)}<p>最细处离下口 ${M.inline('3b=60')} 米，离上口 ${M.inline('b=20')} 米，并不在塔高的中点。</p></section>
      <section class="proof-step"><h3>④ 焦距是两焦点之间的距离</h3>${M.block(String.raw`c^2=a^2+b^2=100+400=500.`)}<div class="target">${M.block(String.raw`2c=20\sqrt5\ \text{米，选 D}.`)}</div><p class="proof-note">${M.inline('c')} 是半焦距；双曲线使用加号 ${M.inline('c^2=a^2+b^2')}。水平截面半径随高度改变，焦点则属于同一条固定的双曲线，不随切片移动。</p></section></div>`;
    const el=id=>host.querySelector('#b15-'+id);
    const radius=h=>10*Math.sqrt(1+(h-60)**2/400);
    function render(){
      const y=height-60,r=radius(height);el('height').value=height;el('height-value').textContent=Lab.fmt(height,1)+' m';
      const p=Lab.plot(el('profile'),{xmin:-44,xmax:44,ymin:-69,ymax:33,pad:36});
      p.screenText(16,27,'纵截面：沿旋转轴切开',{size:17});
      p.line([0,-65],[0,27],{stroke:C.gray,width:1,dash:'5 4'});p.text([0,31],'y（旋转轴）',{dx:12,size:15});
      p.line([-37,0],[37,0],{stroke:C.gray,width:1});p.text([37,0],'x',{dx:6,dy:18,size:16});
      for(const sign of [-1,1]){
        const pts=Array.from({length:161},(_,i)=>{const yy=-60+80*i/160;return[sign*10*Math.sqrt(1+yy*yy/400),yy];});
        p.add(`<polyline points="${pts.map(v=>p.to(v).join(',')).join(' ')}" fill="none" stroke="${C.blue}" stroke-width="2.6"/>`);
      }
      p.dot([0,0],'O',C.ink,-27,-12);p.dot([10,0],'',C.blue);p.dot([-10,0],'',C.blue);
      if(!show(4))p.math([11,0],'a=10',{dx:8,dy:-14,size:15,color:C.blue});
      if(show(1)){
        for(const [yy,rr,tex] of [[-60,10*Math.sqrt(10),String.raw`20\sqrt{10}`],[20,10*Math.sqrt(2),String.raw`20\sqrt2`]]){
          p.line([-rr,yy],[rr,yy],{stroke:C.ink,width:2});
          if(yy>0){const xy=p.to([0,yy]);p.screenMath(xy[0],xy[1]-24,tex,{anchor:'middle',size:17});}
          else p.math([0,yy],tex,{anchor:'middle',dy:28,size:17});
        }
      }
      if(show(2)){
        p.line([38,-60],[38,20],{stroke:C.gray,width:1.3});p.line([35,-60],[40,-60],{stroke:C.gray,width:1.3});p.line([35,20],[40,20],{stroke:C.gray,width:1.3});
        p.text([38,-20],'80 m',{dx:8,dy:0,size:16});
        p.math([0,20],'y=20',{dx:-94,dy:-9,size:15,color:C.gray});p.math([0,-60],'y=-60',{dx:-104,dy:-9,size:15,color:C.gray});
      }
      if(show(3)){
        p.line([-r,y],[r,y],{stroke:C.green,width:3.5});p.dot([r,y],'',C.green);p.math([r,y],'r',{dx:12,dy:-10,size:20,color:C.green});
        p.line([0,y],[r,y],{stroke:C.green,width:4});
      }
      if(show(4)){p.dot([-c,0],'F₁',C.target,-14,-19);p.dot([c,0],'F₂',C.target,6,-19);p.line([-c,0],[c,0],{stroke:C.target,width:2.6});p.math([0,0],String.raw`2c=20\sqrt5`,{dy:32,anchor:'middle',size:18,color:C.target});}
      p.finish();
      el('section').hidden=!show(3);
      if(show(3)){
        const q=Lab.plot(el('section'),{xmin:-38,xmax:38,ymin:-40,ymax:40,pad:38});
        q.screenText(16,27,'水平截面：垂直旋转轴切开',{size:17});
        q.circle([0,0],r,{stroke:C.green,width:2.6,fill:'var(--plot-green-fill, transparent)'});q.line([0,0],[r,0],{stroke:C.green,width:3.5});q.dot([0,0],'圆心',C.gray,-24,29);q.dot([r,0],'',C.green);
        q.math([r/2,0],`r\\approx ${M.number(r,2)}\\,\\mathrm m`,{dy:-20,anchor:'middle',size:19,color:C.green});
        q.screenMath(16,q.h-22,`h=${M.number(height,1)}\\,\\mathrm m`,{color:C.green,size:19});q.finish();
      }
      el('readout').innerHTML=`<span>当前 ${M.inline(`y=h-60=${M.number(y,1)}`)} 米</span><span class="green">${M.inline(String.raw`r=10\sqrt{1+\frac{(h-60)^2}{400}}\approx${M.number(r,3)}`)} 米</span>${M.answer(`焦距 ${M.inline(String.raw`2c=20\sqrt5`)} 米，选 D。`)}`;
    }
    const set=h=>{height=Math.max(0,Math.min(80,h));render();};
    el('height').oninput=e=>set(+e.target.value);el('bottom').onclick=()=>set(0);el('waist').onclick=()=>set(60);el('top').onclick=()=>set(80);
    return{render,reset(){height=36;if(constructionStep!==null)constructionStep=0;render();},getState:()=>({height,y:height-60,radius:radius(height),a,b,c,focalDistance:2*c}),getConstructionSteps:()=>steps,getConstructionStep:()=>constructionStep,setConstructionStep(i){constructionStep=i===null?null:Math.max(0,Math.min(steps.length-1,Math.trunc(i)));render();}};
  }
};
