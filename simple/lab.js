window.Problems = {};
window.Lab = (() => {
  const C={ink:'var(--plot-ink)',blue:'var(--plot-blue)',red:'var(--plot-target)',target:'var(--plot-target)',green:'var(--plot-green)',gold:'var(--plot-gold)',gray:'var(--plot-gray)'};
  const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  // Retain integer zeros; decimal trimming should never change 10 into 1.
  const number=(n,d=3)=>!Number.isFinite(n)?'未定义':(Math.abs(n)<.5*10**(-d)?0:n).toFixed(d).replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1').replace('-','−');
  // One projection weight for both 2D and 3D, preserving each figure's hierarchy.
  const lineWidth=width=>Math.round(width*1.45*1000)/1000;
  const dashPattern=pattern=>String(pattern).replace(/\d*\.?\d+/g,value=>lineWidth(Number(value)));
  function projectionLines(markup){
    // Only diagram primitives: text/KaTeX strokes and point halos stay unchanged.
    return markup.replace(/<(?:line|path|polyline|polygon|ellipse|rect)\b[^>]*>/g,tag=>{
      if(!/\sstroke="(?!none")[^"]+"/.test(tag))return tag;
      const width=tag.match(/\sstroke-width="([^"]+)"/);
      if(width&&!Number.isFinite(Number(width[1])))return tag;
      tag=width?tag.replace(width[0],` stroke-width="${lineWidth(Number(width[1]))}"`):tag.replace(/\s*\/?>$/,end=>` stroke-width="${lineWidth(1)}"${end}`);
      return tag.replace(/stroke-dasharray="([^"]+)"/g,(_,pattern)=>`stroke-dasharray="${dashPattern(pattern)}"`);
    });
  }
  let uid=0;
  const textCanvas=document.createElement('canvas'),textContext=textCanvas.getContext('2d');
  function plot(svg,b){
    const w=Math.max(svg.clientWidth||800,100),h=Math.max(svg.clientHeight||430,100),pad=b.pad??34;
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    let sx=(w-2*pad)/(b.xmax-b.xmin),sy=(h-2*pad)/(b.ymax-b.ymin);
    if(b.equal!==false)sx=sy=Math.min(sx,sy);
    const ox=(w-sx*(b.xmax-b.xmin))/2-b.xmin*sx,oy=(h-sy*(b.ymax-b.ymin))/2+b.ymax*sy;
    const to=p=>[ox+p[0]*sx,oy-p[1]*sy];
    const chunks=[],labels=[],points=[],clipId='plot-'+(++uid);
    const lo=to([b.xmin,b.ymax]),hi=to([b.xmax,b.ymin]);
    chunks.push(`<defs><clipPath id="${clipId}"><rect x="${lo[0]}" y="${lo[1]}" width="${hi[0]-lo[0]}" height="${hi[1]-lo[1]}"/></clipPath></defs>`);
    const coords=points=>points.map(p=>to(p).join(',')).join(' ');
    const style=(o={},fill='none')=>`fill="${escape(o.fill??fill)}" stroke="${escape(o.stroke??C.ink)}" stroke-width="${o.width??2}"${o.dash?` stroke-dasharray="${escape(o.dash)}"`:''}${o.opacity!=null?` opacity="${o.opacity}"`:''}`;
    const finite=p=>p&&p.every(Number.isFinite);
    // Put object labels near their mathematical anchors, while reserving tick
    // labels and figure headings. The solver only changes annotation position.
    function label(x,y,value,o={},math=false){
      const size=o.size||18,anchor=o.anchor||'start';
      textContext.font=`${o.weight||400} ${size}px ${getComputedStyle(svg).fontFamily}`;
      const measure=math?M.measure(value,size):{w:Math.ceil(textContext.measureText(String(value)).width)+2,h:Math.ceil(size*1.2)};
      const left=x+(o.dx||0)-(anchor==='middle'?measure.w/2:anchor==='end'?measure.w:0);
      const top=y+(o.dy||0)-measure.h*(math?.72:.8);
      const item={x,y,value,o,math,size,left,top,w:measure.w,h:measure.h,movable:!!o.avoid,
        priority:o.priority??(math?2:3),index:labels.length,region:o.region?.map(to)};
      labels.push(item);chunks.push(item);
    }
    const screenText=(x,y,t,o={})=>label(x,y,t,o,false);
    const overlap=(a,b)=>Math.max(0,Math.min(a.left+a.w,b.left+b.w)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.top+a.h,b.top+b.h)-Math.max(a.top,b.top));
    // An area annotation must belong to its polygon. If the region becomes
    // too thin for the lettering, the separate numeric readout remains visible.
    function insideRegion(box,polygon){
      const area=polygon.reduce((sum,a,i)=>{const b=polygon[(i+1)%polygon.length];return sum+a[0]*b[1]-a[1]*b[0];},0);
      if(Math.abs(area)<1e-6)return false;
      const sign=Math.sign(area);
      return [[box.left,box.top],[box.left+box.w,box.top],[box.left,box.top+box.h],[box.left+box.w,box.top+box.h]].every(p=>polygon.every((a,i)=>{
        const b=polygon[(i+1)%polygon.length];return sign*((b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]))>=0;
      }));
    }
    function arrange(){
      const placed=labels.filter(item=>!item.movable).map(item=>({...item}));
      const reserved=points.map(([x,y])=>({left:x-7,top:y-7,w:14,h:14}));
      for(const item of labels.filter(item=>item.movable).sort((a,b)=>b.priority-a.priority||a.index-b.index)){
        const candidates=[[0,0]];
        for(const d of [14,26,40,58])candidates.push([0,-d],[0,d],[-d,0],[d,0],[-d,-d],[d,-d],[-d,d],[d,d]);
        if(item.region){
          const xs=item.region.map(p=>p[0]),ys=item.region.map(p=>p[1]);
          for(let y=Math.min(...ys)+3;y<=Math.max(...ys)-item.h-3;y+=6)
            for(let x=Math.min(...xs)+3;x<=Math.max(...xs)-item.w-3;x+=6)candidates.push([x-item.left,y-item.top]);
        }
        let best=null,bestScore=Infinity;
        for(const [dx,dy] of candidates){
          const candidate={left:Math.max(4,Math.min(w-item.w-4,item.left+dx)),top:Math.max(4,Math.min(h-item.h-4,item.top+dy)),w:item.w,h:item.h};
          if(item.region&&!insideRegion(candidate,item.region))continue;
          const padded={left:candidate.left-3,top:candidate.top-2,w:candidate.w+6,h:candidate.h+4};
          const collision=placed.reduce((sum,box)=>sum+overlap(padded,box),0)+reserved.reduce((sum,box)=>sum+overlap(candidate,box),0);
          const distance=Math.hypot(candidate.left-item.left,candidate.top-item.top);
          const score=collision*100+distance;
          if(score<bestScore){best=candidate;bestScore=score;}
          if(score===0)break;
        }
        if(best){item.shiftX=best.left-item.left;item.shiftY=best.top-item.top;placed.push(best);}else item.hidden=true;
      }
    }
    function renderLabel(item){
      if(item.hidden)return '';
      const {o,size,value,math}=item,dx=item.shiftX||0,dy=item.shiftY||0;
      const color=escape(o.color||C.ink),x=item.x+dx,y=item.y+dy;
      const left=item.left+dx,top=item.top+dy;
      let leader='';
      if(item.movable&&o.leader!==false&&Math.hypot(dx,dy)>18){
        const endX=Math.max(left,Math.min(left+item.w,item.x)),endY=Math.max(top,Math.min(top+item.h,item.y));
        leader=`<line class="label-leader" x1="${item.x}" y1="${item.y}" x2="${endX}" y2="${endY}" stroke="${color}" stroke-width="${lineWidth(.8)}" opacity=".6"/>`;
      }
      const markup=math?M.svg(x,y,value,o):`<text x="${x+(o.dx||0)}" y="${y+(o.dy||0)}" font-size="${size}" fill="${color}" text-anchor="${o.anchor||'start'}"${o.weight?` font-weight="${o.weight}"`:''} paint-order="stroke" stroke="var(--canvas)" stroke-width="3" stroke-linejoin="round">${escape(value)}</text>`;
      return `<g class="plot-label" data-label="${escape(value)}" data-label-movable="${item.movable}" data-label-box="${left},${top},${item.w},${item.h}" pointer-events="none">${leader}${markup}</g>`;
    }
    function line(a,c,o={}){if(!finite(a)||!finite(c))return;const p=to(a),q=to(c);chunks.push(`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" ${style(o)}/>`);}
    const nice=(span)=>{const raw=span/7,p=10**Math.floor(Math.log10(raw)),r=raw/p;return(r<=1?1:r<=2?2:r<=5?5:10)*p;};
    const api={w,h,sx,sy,to,
      fromEvent:e=>{const r=svg.getBoundingClientRect();return[(e.clientX-r.left-ox)/sx,(oy-(e.clientY-r.top))/sy];},
      add:s=>chunks.push(s),
      line,
      poly:(points,o={})=>{if(points.every(finite))chunks.push(`<polygon points="${coords(points)}" ${style(o)}/>`);},
      circle:(p,r,o={})=>{if(!finite(p)||!Number.isFinite(r))return;const q=to(p);chunks.push(`<ellipse cx="${q[0]}" cy="${q[1]}" rx="${Math.abs(r*sx)}" ry="${Math.abs(r*sy)}" ${style(o)}/>`);},
      dot:(p,label='',color=C.blue,dx=10,dy=-10)=>{if(!finite(p))return;const q=to(p);points.push(q);chunks.push(`<circle cx="${q[0]}" cy="${q[1]}" r="5" fill="${escape(color)}" stroke="var(--canvas)" stroke-width="2"/>`);if(label)screenText(q[0],q[1],label,{color,size:18,dx,dy,avoid:true,priority:4});},
      text:(p,t,o={})=>{if(finite(p)){const q=to(p);screenText(q[0],q[1],t,{avoid:true,...o});}},
      screenText,
      screenMath:(x,y,tex,o={})=>label(x,y,tex,o,true),
      math:(point,tex,o={})=>{if(finite(point)){const q=to(point);label(q[0],q[1],tex,{avoid:true,...o},true);}},
      axes:(labels={})=>{
        const color='var(--plot-axis)',zeroY=Math.max(b.ymin,Math.min(b.ymax,0)),zeroX=Math.max(b.xmin,Math.min(b.xmax,0));
        line([b.xmin,zeroY],[b.xmax,zeroY],{stroke:color,width:1});line([zeroX,b.ymin],[zeroX,b.ymax],{stroke:color,width:1});
        const stepX=labels.stepX||nice(b.xmax-b.xmin),stepY=labels.stepY||nice(b.ymax-b.ymin);
        for(let x=Math.ceil(b.xmin/stepX)*stepX;x<=b.xmax+stepX/100;x+=stepX){if(Math.abs(x)<1e-9)continue;const q=to([x,zeroY]);chunks.push(`<line x1="${q[0]}" y1="${q[1]-3}" x2="${q[0]}" y2="${q[1]+3}" stroke="${color}"/>`);screenText(q[0],q[1]+20,number(x,4),{size:12,anchor:'middle',color:C.gray});}
        for(let y=Math.ceil(b.ymin/stepY)*stepY;y<=b.ymax+stepY/100;y+=stepY){if(Math.abs(y)<1e-9)continue;const q=to([zeroX,y]);screenText(q[0]-8,q[1]+4,number(y,4),{size:12,anchor:'end',color:C.gray});}
        api.text([b.xmax,zeroY],labels.x??'x',{dy:-8,size:15,color:C.gray,avoid:false});api.text([zeroX,b.ymax],labels.y??'y',{dx:8,size:15,color:C.gray,avoid:false});
      },
      curve:(fn,xmin,xmax,o={})=>{
        let d='',prev=null;const n=o.n||320;
        for(let i=0;i<=n;i++){const x=xmin+(xmax-xmin)*i/n;let y;try{y=fn(x);}catch{y=NaN;}if(!Number.isFinite(y)||Math.abs(y)>(Math.max(Math.abs(b.ymin),Math.abs(b.ymax))+1)*100){prev=null;continue;}const p=to([x,y]);const connected=prev&&Math.abs(y-prev[1])<(b.ymax-b.ymin)*1.5;d+=`${connected?'L':'M'}${p[0]},${p[1]}`;prev=[x,y];}
        chunks.push(`<path d="${d}" ${style(o)} clip-path="url(#${clipId})"/>`);
      },
      finish:()=>{arrange();svg.innerHTML=chunks.map(item=>typeof item==='string'?projectionLines(item):renderLabel(item)).join('');}
    };
    return api;
  }
  return {C,fmt:number,plot,escape,lineWidth,dashPattern};
})();
