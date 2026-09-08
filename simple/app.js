(() => {
  const ids=Object.keys(Problems).map(Number).sort((a,b)=>a-b);
  const pages={10:1,11:1,12:2,16:2,17:3,18:4,20:6,21:7};
  const nav=document.getElementById('questionNav'),host=document.getElementById('module');
  let mounted=null,current=null,resizeFrame=0;
  const figureObserver=new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>mounted?.render());});
  nav.innerHTML=ids.map(id=>`<button data-question="${id}">第 ${id} 题</button>`).join('');
  function select(id){
    if(!Problems[id])id=ids[0];
    figureObserver.disconnect();mounted?.destroy?.();current=Number(id);const entry=Problems[id];host.innerHTML='';
    document.body.classList.remove('show-key');
    document.getElementById('keyButton').setAttribute('aria-pressed','false');document.getElementById('keyButton').textContent='显示关键关系';
    document.getElementById('questionTitle').textContent=`第 ${id} 题 · ${entry.title}`;
    document.getElementById('statement').innerHTML=entry.statement||'';
    document.getElementById('lessonGuide').innerHTML='<b>看图思路</b><span>'+LessonGuides[id]+'</span>';
    document.getElementById('sourceLine').textContent=`2024—2025 上海嘉定高三一模 · 原卷第 ${pages[id]??''} 页`;
    nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',String(+b.dataset.question===+id)));
    mounted=entry.mount(host);mounted.render();
    const figures=host.querySelector('.figures');if(figures)figureObserver.observe(figures);
    if(location.hash!==`#q${id}`)history.replaceState(null,'',`#q${id}`);
  }
  nav.addEventListener('click',e=>{const b=e.target.closest('[data-question]');if(b)select(+b.dataset.question);});
  document.getElementById('keyButton').onclick=()=>{const shown=document.body.classList.toggle('show-key');document.getElementById('keyButton').setAttribute('aria-pressed',String(shown));document.getElementById('keyButton').textContent=shown?'隐藏关键关系':'显示关键关系';mounted.render();};
  document.getElementById('resetButton').onclick=()=>mounted.reset();
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{document.getElementById('fullscreenButton').textContent='请按 F11';}}
  document.getElementById('fullscreenButton').onclick=fullscreen;
  document.addEventListener('fullscreenchange',()=>{document.getElementById('fullscreenButton').textContent=document.fullscreenElement?'退出全屏':'全屏';});
  document.addEventListener('keydown',e=>{if(e.target.closest('input,select,textarea,[contenteditable=true]')||e.ctrlKey||e.metaKey||e.altKey)return;const i=ids.indexOf(current);if(e.key==='ArrowRight'){e.preventDefault();select(ids[(i+1)%ids.length]);}if(e.key==='ArrowLeft'){e.preventDefault();select(ids[(i-1+ids.length)%ids.length]);}if(e.key.toLowerCase()==='f')fullscreen();if(e.key.toLowerCase()==='r')mounted.reset();});
  new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>mounted?.render());}).observe(host);
  window.addEventListener('hashchange',()=>{const id=Number(location.hash.replace('#q',''));if(ids.includes(id)&&id!==current)select(id);});
  window.Lesson={select,getState:()=>({question:current,revealed:document.body.classList.contains('show-key'),...mounted?.getState?.()}),questions:ids};
  const requested=Number(location.hash.replace('#q',''));
  select(ids.includes(requested)?requested:decodeURIComponent(location.pathname).includes('第20题')?20:ids[0]);
  function fontsReady(){M.clearMeasurements();cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>mounted?.render());}
  document.fonts.ready.then(fontsReady);
  document.fonts.addEventListener('loadingdone',fontsReady);
})();
