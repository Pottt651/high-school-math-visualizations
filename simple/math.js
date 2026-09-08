/* TeX is rendered locally; the build embeds KaTeX and its fonts. */
window.M = (() => {
  const htmlCache=new Map(),sizeCache=new Map();let probe;
  const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  function render(tex,display=false){
    const key=String(display)+tex;
    if(!htmlCache.has(key)){
      if(htmlCache.size>1800)htmlCache.clear();
      htmlCache.set(key,katex.renderToString(String(tex),{displayMode:display,throwOnError:true,strict:'ignore',trust:false,output:'htmlAndMathml'}));
    }
    return htmlCache.get(key);
  }
  function measure(tex,size){
    const key=size+':'+tex;if(sizeCache.has(key))return sizeCache.get(key);
    if(!probe){probe=document.createElement('div');probe.setAttribute('aria-hidden','true');probe.style.cssText='position:fixed;left:-20000px;top:0;visibility:hidden;white-space:nowrap;display:inline-block;pointer-events:none';document.body.appendChild(probe);}
    probe.style.fontSize=size+'px';probe.innerHTML=render(tex);const box=probe.getBoundingClientRect();
    const result={w:Math.ceil(box.width)+6,h:Math.ceil(box.height)+10};
    if(sizeCache.size>1200)sizeCache.clear();sizeCache.set(key,result);return result;
  }
  function svg(x,y,tex,o={}){
    const size=o.size||18,{w,h}=measure(tex,size),anchor=o.anchor||'start';
    const left=x+(o.dx||0)-(anchor==='middle'?w/2:anchor==='end'?w:0),top=y+(o.dy||0)-h*.72;
    return `<foreignObject class="plot-math" x="${left}" y="${top}" width="${w}" height="${h}" style="overflow:visible;pointer-events:none"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:${size}px;color:${esc(o.color||'var(--plot-ink)')};white-space:nowrap;padding:4px 3px;line-height:1.3;${o.weight?'font-weight:'+o.weight+';':''}">${render(tex)}</div></foreignObject>`;
  }
  const rational=value=>{const match=String(value).match(/^(-?)(\d+)\/(\d+)$/);return !match?String(value):match[3]==='1'?match[1]+match[2]:`${match[1]}\\dfrac{${match[2]}}{${match[3]}}`;};
  const number=(value,d=4)=>{
    if(!Number.isFinite(value))return String.raw`\text{未定义}`;
    if(value!==0&&(Math.abs(value)>=1e6||Math.abs(value)<10**(-d))){const [a,b]=value.toExponential(d).split('e');return `${a}\\times10^{${Number(b)}}`;}
    return (Math.abs(value)<.5*10**(-d)?0:value).toFixed(d).replace(/(\.\d*?[1-9])0+$|\.0+$/,'$1');
  };
  return {inline:tex=>`<span class="math-inline">${render(tex)}</span>`,block:tex=>`<div class="math-block">${render(tex,true)}</div>`,
    answer:html=>`<div class="answer"><b class="answer-label">答案</b><div>${html}</div></div>`,rational,number,svg,measure,clearMeasurements:()=>sizeCache.clear()};
})();
