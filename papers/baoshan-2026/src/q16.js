(() => {
  const arithmetic = (units, n) => ({d:units/20, margin:((units-20)*n-units)/20,
    sum:-n+units*n*(n-1)/40, bound:(n*n-2*n)/2,
    firstFailure:Math.ceil(units/(units-20))});
  const geometric = (family, n) => {
    const first=family==='three'?1:2,ratio=family==='three'?3:2;
    const delta=first*Math.pow(ratio,n-1)*(ratio-1);
    const numerator=first*Math.pow(ratio,n)*((ratio-1)*n+ratio-2),denominator=(n+1)*(n+2);
    return {first,ratio,delta,halfDelta:delta/2,transformedDelta:numerator/denominator,numerator,denominator};
  };
  Problems[16]={
    title:'“增长”数列的全称条件',model:{arithmetic,geometric},
    statement:`对任意正整数 ${M.inline('n')}，数列 ${M.inline(String.raw`\{a_n\}`)} 满足 ${M.inline('a_{n+1}-a_n>1')}，则称该数列为“增长”数列。<p>命题①：存在 ${M.inline('a_1=-1')} 的等差数列 ${M.inline(String.raw`\{a_n\}`)} 为“增长”数列，且其前 ${M.inline('n')} 项和满足 ${M.inline(String.raw`S_n<\frac{n^2-2n}{2}`)}。</p><p>命题②：存在各项均为正整数的等比数列 ${M.inline(String.raw`\{a_n\}`)} 为“增长”数列，且 ${M.inline(String.raw`\{\frac{a_n}{2}\}`)} 不是“增长”数列，使得 ${M.inline(String.raw`\{\frac{a_{n+1}}{n+1}\}`)} 为“增长”数列。</p><p>判断两个命题的真假：A．①真②真；B．①真②假；C．①假②真；D．①假②假。〔原卷第 3 页〕</p>`,
    mount(host){
      const C=Lab.C;let part='arithmetic',units=30,count=6,family='three',constructionStep=null;
      const $=name=>host.querySelector('#b16-'+name),show=step=>constructionStep===null||constructionStep>=step;
      const fraction=(n,d)=>{let a=Math.abs(n),b=d;while(b){const r=a%b;a=b;b=r;}return d/a===1?String(n/a):String.raw`\frac{${n/a}}{${d/a}}`;};
      host.innerHTML=`<div class="controls"><label>命题 <select id="b16-part"><option value="arithmetic">① 等差数列</option><option value="geometric">② 等比构造</option></select></label><label id="b16-d-wrap">公差 ${M.inline('d')} <input id="b16-d" type="range" min="1.05" max="3" step=".05" value="1.5"><output id="b16-d-value"></output></label><label id="b16-family-wrap" hidden>例子 <select id="b16-family"><option value="three">取 aₙ＝3ⁿ⁻¹（证明构造）</option><option value="two">取 aₙ＝2ⁿ（对照）</option></select></label><label>显示前 <input id="b16-count" type="range" min="1" max="30" step="1" value="6"><output id="b16-count-value">6</output> 个差值／检验点</label><button id="b16-failure">看到首次失败</button></div><div class="figures"><svg id="b16-svg" class="main-figure" role="img" aria-label="有限检验点与严格阈值的比较，完整结论需全称证明"></svg></div><div class="readout" id="b16-readout"></div><div class="explain" id="b16-explain"></div>`;
      function getConstructionSteps(){return part==='arithmetic'?[
        {title:'增长意味着公差大于 1',body:`等差数列的相邻差恒为 ${M.inline('d')}，因此必须 ${M.inline('d>1')}。图中横轴只取正整数。`},
        {title:'把和的不等式化为同一阈值',body:`设 ${M.inline(String.raw`E_n=\frac2n(S_n-\frac{n^2-2n}{2})=(d-1)n-d`)}。题设的严格不等式等价于 ${M.inline('E_n<0')}；画出零线和下方区域。`},
        {title:'逐个标出有限检验点',body:`用同一个公差计算 ${M.inline('(n,E_n)')}。位于零线上也算失败；画出的有限前项只辅助观察。`},
        {title:'定位失败，再排除所有公差',body:`因 ${M.inline('d-1>0')}，当 ${M.inline(String.raw`n\ge\lceil\frac d{d-1}\rceil`)} 时必有 ${M.inline(String.raw`E_n\ge0`)}。每个允许的公差都有失败的正整数，命题①假。`}
      ]:[
        {title:'先画原数列的相邻差',body:`证明取 ${M.inline(String.raw`a_n=3^{n-1}`)}。各项均为正整数，且 ${M.inline(String.raw`a_{n+1}-a_n=2\cdot3^{n-1}>1`)}。对照例子 ${M.inline('a_n=2^n')} 另行标明，不替代此构造。`},
        {title:'严格阈值不包含 1',body:`画出 ${M.inline(String.raw`\Delta=1`)}。半数列的首个差恰为 ${M.inline('1')}，不满足严格大于 ${M.inline('1')}，因此它不是“增长”数列。`},
        {title:'再画变换后的差值',body:`令 ${M.inline(String.raw`b_n=\frac{a_{n+1}}{n+1}`)}。计算并标出 ${M.inline('b_{n+1}-b_n')}；越出上界的箭头只表示差值更大。`},
        {title:'用全称不等式完成存在性证明',body:`证明构造中 ${M.inline(String.raw`b_n=\frac{3^n}{n+1}`)}，且 ${M.inline(String.raw`\frac{b_{n+1}}{b_n}=\frac{3(n+1)}{n+2}\ge2`)}。故 ${M.inline(String.raw`b_{n+1}-b_n\ge b_n\ge b_1=\frac32>1`)}，对所有正整数成立。命题②真。`}
      ];}
      function restart(){if(constructionStep!==null)constructionStep=0;host.dispatchEvent(new Event('constructionchange'));}
      function render(){
        const arith=part==='arithmetic';$('d-wrap').hidden=!arith;$('family-wrap').hidden=arith;$('failure').hidden=!arith;
        $('d').value=units/20;$('d-value').innerHTML=M.inline(fraction(units,20));$('count').max=arith?30:8;$('count').value=count;$('count-value').textContent=count;
        if(arith){
          const data=arithmetic(units,count),xmin=.4,xmax=Math.max(5,count+.6),ymin=-1.65,ymax=Math.max(1.5,data.margin+1),p=Lab.plot($('svg'),{xmin,xmax,ymin,ymax,equal:false,pad:50});
          if(show(1)){p.poly([[xmin,ymin],[xmax,ymin],[xmax,0],[xmin,0]],{fill:C.green,opacity:.09,stroke:'none'});p.line([xmin,0],[xmax,0],{stroke:C.target,width:2,dash:'6 5'});}
          p.axes({x:'n',y:'',stepX:count>16?5:count>8?2:1,tickSize:14});
          p.screenMath(18,29,String.raw`E_n=(d-1)n-d`,{size:21,color:C.target});
          if(show(2))for(let n=1;n<=count;n++){
            const e=arithmetic(units,n).margin;
            if(n>1)p.line([n-1,arithmetic(units,n-1).margin],[n,e],{stroke:C.gray,width:1,opacity:.4,dash:'3 5'});
            p.dot([n,e],'',e<0?C.green:C.target);
            if(n===count&&n!==data.firstFailure)p.math([n,e],`E_{${n}}=${fraction((units-20)*n-units,20)}`,{color:e<0?C.green:C.target,size:18,dx:-8,dy:-15,anchor:'end'});
          }
          if(show(3)&&data.firstFailure<=count){const n=data.firstFailure,e=arithmetic(units,n).margin;p.dot([n,e],'首次不满足',C.target,9,-18);p.line([n,ymin],[n,e],{stroke:C.target,width:1.2,dash:'3 5'});}
          p.screenText(18,p.h-15,'只有离散点代表数列；零线上的点也不满足严格不等式。',{color:C.gray,size:14});p.finish();
          $('readout').innerHTML=`当前 ${M.inline(String.raw`d=${fraction(units,20)},\ n=${count}`)}，${M.inline(String.raw`E_n=${fraction((units-20)*count-units,20)}`)}。${count<data.firstFailure?'目前画出的前项均满足；尚不能推出对所有正整数成立。':`首次失败在 ${M.inline('n='+data.firstFailure)}，因为此时 ${M.inline(String.raw`E_n\ge0`)}。`}${M.answer('C：命题①假，命题②真。')}`;
          $('explain').innerHTML=`<section class="proof-step"><h3>先处理“任意正整数”的量词</h3><p>“增长”要求每步差都大于 ${M.inline('1')}。等差数列相邻差为 ${M.inline('d')}，所以必须 ${M.inline('d>1')}。</p></section><section class="proof-step"><h3>把前 n 项和化简</h3>${M.block(String.raw`\begin{aligned}S_n&=-n+\frac{n(n-1)d}{2},\\S_n<\frac{n^2-2n}{2}&\iff(d-1)n<d.\end{aligned}`)}<p>这里 ${M.inline('n>0')}，除以它不改变不等号方向。</p></section><section class="proof-step"><h3>对每个公差构造失败位置</h3><p>任给 ${M.inline('d>1')}，取正整数</p>${M.block(String.raw`n\ge\left\lceil\frac d{d-1}\right\rceil`)}<p>便有 ${M.inline(String.raw`(d-1)n\ge d`)}，与严格小于矛盾。因此不存在满足全部要求的公差，命题①是假命题。</p><p class="proof-note">公差接近 1 时，失败可以出现得很晚。看过再多有限前项，也不能代替这一步全称论证。</p></section>`;
        }else{
          const data=geometric(family,count),p=Lab.plot($('svg'),{xmin:.4,xmax:Math.max(4.6,count+.6),ymin:-.35,ymax:4.6,equal:false,pad:50});
          p.axes({x:'n',y:'相邻差',stepX:1,stepY:1,tickSize:14});
          if(show(1))p.line([.4,1],[Math.max(4.6,count+.6),1],{stroke:C.target,width:2,dash:'5 5'});
          p.screenMath(18,29,family==='three'?String.raw`a_n=3^{n-1}`:'a_n=2^n',{color:C.blue,size:21});
          const series=[{key:'delta',color:C.blue,offset:-.12,step:0},{key:'halfDelta',color:C.gold,offset:0,step:1},{key:'transformedDelta',color:C.green,offset:.12,step:2}];
          for(const item of series)if(show(item.step))for(let n=1;n<=count;n++){
            const value=geometric(family,n)[item.key],x=n+item.offset;
            if(value<=4.25)p.dot([x,value],'',item.color);
            else p.text([x,4.08],'↑',{color:item.color,size:23,anchor:'middle',avoid:false});
          }
          if(show(3)){p.math([1,1],String.raw`\Delta\frac{a_n}{2}=1`,{color:C.gold,size:18,dx:12,dy:28});p.text([1.15,family==='three'?1.5:2/3],family==='three'?'变换后首差 > 1':'对照首差 < 1',{color:C.green,size:17,dx:15,dy:-25});}
          p.screenText(18,p.h-15,'↑ 表示差值超出纵轴上界；当前精确差值见读数。',{color:C.gray,size:14});p.finish();
          $('readout').innerHTML=`在 ${M.inline('n='+count)}：<span style="color:${C.blue}">原数列差 ${M.inline(String(data.delta))}</span>；<span style="color:${C.gold}">半数列差 ${M.inline(fraction(data.delta,2))}</span>；<span style="color:${C.green}">变换后差 ${M.inline(fraction(data.numerator,data.denominator))}</span>。<p>${family==='three'?'这是满足命题②全部要求的构造，完整证明如下。':'这是对照例子：变换后首差为 2/3，不是“增长”数列；一个失败例子不能否定存在性命题。'}</p>${M.answer('C：命题①假，命题②真。')}`;
          $('explain').innerHTML=`<section class="proof-step"><h3>存在性只需一个完整构造</h3><p>取 ${M.inline(String.raw`a_n=3^{n-1}`)}，各项均为正整数，且</p>${M.block(String.raw`a_{n+1}-a_n=2\cdot3^{n-1}\ge2>1.`)}</section><section class="proof-step"><h3>半数列首差等于 1，已构成反例</h3>${M.block(String.raw`\frac{a_2}{2}-\frac{a_1}{2}=\frac32-\frac12=1.`)}<p>新定义要求严格大于 ${M.inline('1')}，所以半数列不是“增长”数列。</p></section><section class="proof-step"><h3>证明变换后每一步都增长</h3><p>设 ${M.inline(String.raw`b_n=\frac{a_{n+1}}{n+1}=\frac{3^n}{n+1}`)}。对任意正整数 ${M.inline('n')}，</p>${M.block(String.raw`\frac{b_{n+1}}{b_n}=\frac{3(n+1)}{n+2}\ge2.`)}<p>因此 ${M.inline(String.raw`b_n\ge b_1=\frac32`)}，并且</p>${M.block(String.raw`b_{n+1}-b_n\ge b_n\ge\frac32>1.`)}<p>三项条件对同一数列同时成立，命题②真。</p><p class="proof-note">图中只有有限个差值；全体正整数上的结论由上述不等式保证。</p></section>`;
        }
      }
      $('part').onchange=e=>{part=e.target.value;count=part==='arithmetic'?6:3;restart();render();};
      $('d').oninput=e=>{units=Math.round(Number(e.target.value)*20);render();};
      $('count').oninput=e=>{count=Number(e.target.value);render();};
      $('family').onchange=e=>{family=e.target.value;restart();render();};
      $('failure').onclick=()=>{count=Math.max(count,arithmetic(units,1).firstFailure);render();};
      render();return {render,getConstructionSteps,getConstructionStep:()=>constructionStep,setConstructionStep(index){constructionStep=index===null?null:Math.max(0,Math.min(3,Math.trunc(index)));render();},reset(){part='arithmetic';units=30;count=6;family='three';$('part').value=part;$('family').value=family;restart();render();},getState(){return {part,d:units/20,count,family,...(part==='arithmetic'?arithmetic(units,count):geometric(family,count))};}};
    }
  };
})();
