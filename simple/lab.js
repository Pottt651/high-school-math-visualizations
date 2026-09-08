window.Problems = {};
window.Lab = (() => {
  const C={ink:'#293a40',blue:'#2471a3',red:'#b42318',target:'#b42318',green:'#167d61',gold:'#a27416',gray:'#819097'};
  const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  // Retain integer zeros; decimal trimming should never change 10 into 1.
  const number=(n,d=3)=>!Number.isFinite(n)?'未定义':(Math.abs(n)<.5*10**(-d)?0:n).toFixed(d).replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1').replace('-','−');
  let uid=0;
  function plot(svg,b){
    const w=Math.max(svg.clientWidth||800,100),h=Math.max(svg.clientHeight||430,100),pad=b.pad??34;
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    let sx=(w-2*pad)/(b.xmax-b.xmin),sy=(h-2*pad)/(b.ymax-b.ymin);
    if(b.equal!==false)sx=sy=Math.min(sx,sy);
    const ox=(w-sx*(b.xmax-b.xmin))/2-b.xmin*sx,oy=(h-sy*(b.ymax-b.ymin))/2+b.ymax*sy;
    const to=p=>[ox+p[0]*sx,oy-p[1]*sy];
    const chunks=[],clipId='plot-'+(++uid);
    const lo=to([b.xmin,b.ymax]),hi=to([b.xmax,b.ymin]);
    chunks.push(`<defs><clipPath id="${clipId}"><rect x="${lo[0]}" y="${lo[1]}" width="${hi[0]-lo[0]}" height="${hi[1]-lo[1]}"/></clipPath></defs>`);
    const coords=points=>points.map(p=>to(p).join(',')).join(' ');
    const style=(o={},fill='none')=>`fill="${escape(o.fill??fill)}" stroke="${escape(o.stroke??C.ink)}" stroke-width="${o.width??2}"${o.dash?` stroke-dasharray="${escape(o.dash)}"`:''}${o.opacity!=null?` opacity="${o.opacity}"`:''}`;
    const finite=p=>p&&p.every(Number.isFinite);
    function screenText(x,y,t,o={}){chunks.push(`<text x="${x+(o.dx||0)}" y="${y+(o.dy||0)}" font-size="${o.size||18}" fill="${escape(o.color||C.ink)}" text-anchor="${o.anchor||'start'}"${o.weight?` font-weight="${o.weight}"`:''} paint-order="stroke" stroke="white" stroke-width="3" stroke-linejoin="round">${escape(t)}</text>`);}
    function line(a,c,o={}){if(!finite(a)||!finite(c))return;const p=to(a),q=to(c);chunks.push(`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" ${style(o)}/>`);}
    const nice=(span)=>{const raw=span/7,p=10**Math.floor(Math.log10(raw)),r=raw/p;return(r<=1?1:r<=2?2:r<=5?5:10)*p;};
    const api={w,h,sx,sy,to,
      fromEvent:e=>{const r=svg.getBoundingClientRect();return[(e.clientX-r.left-ox)/sx,(oy-(e.clientY-r.top))/sy];},
      add:s=>chunks.push(s),
      line,
      poly:(points,o={})=>{if(points.every(finite))chunks.push(`<polygon points="${coords(points)}" ${style(o)}/>`);},
      circle:(p,r,o={})=>{if(!finite(p)||!Number.isFinite(r))return;const q=to(p);chunks.push(`<ellipse cx="${q[0]}" cy="${q[1]}" rx="${Math.abs(r*sx)}" ry="${Math.abs(r*sy)}" ${style(o)}/>`);},
      dot:(p,label='',color=C.blue,dx=10,dy=-10)=>{if(!finite(p))return;const q=to(p);chunks.push(`<circle cx="${q[0]}" cy="${q[1]}" r="5" fill="${escape(color)}" stroke="white" stroke-width="2"/>`);if(label)screenText(q[0]+dx,q[1]+dy,label,{color,size:18});},
      text:(p,t,o={})=>{if(finite(p)){const q=to(p);screenText(q[0],q[1],t,o);}},
      screenText,
      screenMath:(x,y,tex,o={})=>chunks.push(M.svg(x,y,tex,o)),
      math:(point,tex,o={})=>{if(finite(point)){const q=to(point);chunks.push(M.svg(q[0],q[1],tex,o));}},
      axes:(labels={})=>{
        const color='#b7c2c5',zeroY=Math.max(b.ymin,Math.min(b.ymax,0)),zeroX=Math.max(b.xmin,Math.min(b.xmax,0));
        line([b.xmin,zeroY],[b.xmax,zeroY],{stroke:color,width:1});line([zeroX,b.ymin],[zeroX,b.ymax],{stroke:color,width:1});
        const stepX=nice(b.xmax-b.xmin),stepY=nice(b.ymax-b.ymin);
        for(let x=Math.ceil(b.xmin/stepX)*stepX;x<=b.xmax+stepX/100;x+=stepX){if(Math.abs(x)<1e-9)continue;const q=to([x,zeroY]);chunks.push(`<line x1="${q[0]}" y1="${q[1]-3}" x2="${q[0]}" y2="${q[1]+3}" stroke="${color}"/>`);screenText(q[0],q[1]+20,number(x,4),{size:12,anchor:'middle',color:C.gray});}
        for(let y=Math.ceil(b.ymin/stepY)*stepY;y<=b.ymax+stepY/100;y+=stepY){if(Math.abs(y)<1e-9)continue;const q=to([zeroX,y]);screenText(q[0]-8,q[1]+4,number(y,4),{size:12,anchor:'end',color:C.gray});}
        api.text([b.xmax,zeroY],labels.x??'x',{dy:-8,size:15,color:C.gray});api.text([zeroX,b.ymax],labels.y??'y',{dx:8,size:15,color:C.gray});
      },
      curve:(fn,xmin,xmax,o={})=>{
        let d='',prev=null;const n=o.n||320;
        for(let i=0;i<=n;i++){const x=xmin+(xmax-xmin)*i/n;let y;try{y=fn(x);}catch{y=NaN;}if(!Number.isFinite(y)||Math.abs(y)>(Math.max(Math.abs(b.ymin),Math.abs(b.ymax))+1)*100){prev=null;continue;}const p=to([x,y]);const connected=prev&&Math.abs(y-prev[1])<(b.ymax-b.ymin)*1.5;d+=`${connected?'L':'M'}${p[0]},${p[1]}`;prev=[x,y];}
        chunks.push(`<path d="${d}" ${style(o)} clip-path="url(#${clipId})"/>`);
      },
      finish:()=>svg.innerHTML=chunks.join('')
    };
    return api;
  }
  return {C,fmt:number,plot,escape};
})();
