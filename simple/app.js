(() => {
  const ids=Object.keys(Problems).map(Number).sort((a,b)=>a-b);
  const paper=window.PaperMeta;
  const pages=Object.fromEntries(paper.questions.map(q=>[q.id,q.page]));
  const topics=Object.fromEntries(paper.questions.map(q=>[q.id,q.topic]));
  const nav=document.getElementById('questionNav'),host=document.getElementById('module');
  let mounted=null,current=null,resizeFrame=0,restoreKey=false;
  const drawButton=document.getElementById('drawButton'),constructionBar=document.getElementById('constructionBar');
  const previousStep=document.getElementById('constructionPrev'),nextStep=document.getElementById('constructionNext');
  const constructionStep=()=>mounted?.getConstructionStep?.()??null;
  function setKey(shown){document.body.classList.toggle('show-key',shown);const button=document.getElementById('keyButton');button.setAttribute('aria-pressed',String(shown));button.textContent=shown?'隐藏关键关系':'显示关键关系';}
  function syncConstruction(){
    const steps=mounted?.getConstructionSteps?.()||[],index=constructionStep(),active=index!==null;
    drawButton.hidden=!steps.length;drawButton.setAttribute('aria-pressed',String(active));
    drawButton.textContent=active?'重新画图':'按条件画图';constructionBar.hidden=!active;
    document.body.classList.toggle('building',active);
    document.getElementById('keyboardHint').textContent=active?'← → 画图步骤 · F 全屏 · R 重画':'← → 切题 · F 全屏 · R 重置';
    if(!active)return;
    const step=steps[index];if(!step)return;
    document.getElementById('constructionCount').textContent=`${index+1} / ${steps.length}`;
    document.getElementById('constructionTitle').textContent=step.title;
    const body=document.getElementById('constructionBody');if(body.innerHTML!==step.body)body.innerHTML=step.body;
    previousStep.disabled=index===0;nextStep.disabled=index===steps.length-1;
  }
  function setConstruction(index){mounted?.setConstructionStep?.(index);syncConstruction();}
  function startConstruction(){
    if(!mounted?.getConstructionSteps?.().length)return;
    if(constructionStep()===null)restoreKey=document.body.classList.contains('show-key');
    setKey(false);document.body.classList.add('building');setConstruction(0);
  }
  function finishConstruction(){
    document.body.classList.remove('building');setKey(restoreKey);setConstruction(null);
  }
  function moveConstruction(delta){const index=constructionStep(),steps=mounted?.getConstructionSteps?.()||[];if(index!==null)setConstruction(Math.max(0,Math.min(steps.length-1,index+delta)));}
  drawButton.onclick=startConstruction;previousStep.onclick=()=>moveConstruction(-1);nextStep.onclick=()=>moveConstruction(1);
  document.getElementById('constructionFull').onclick=finishConstruction;
  for(const event of ['constructionchange','input','change','click'])host.addEventListener(event,syncConstruction);
  const figureObserver=new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>mounted?.render());});
  nav.innerHTML=ids.map(id=>`<button data-question="${id}" aria-label="第 ${id} 题：${topics[id]}"><span class="nav-number">${id}</span><span>${topics[id]}</span></button>`).join('');
  const themeButton=document.getElementById('themeButton');
  function updateThemeButton(){const dark=document.documentElement.dataset.theme==='dark';themeButton.textContent=dark?'深色':'浅色';themeButton.setAttribute('aria-label',`当前${dark?'深色':'浅色'}模式，切换为${dark?'浅色':'深色'}`);}
  updateThemeButton();
  themeButton.onclick=()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('math-visualizations-theme',theme);}catch{}updateThemeButton();};
  function select(id){
    if(!Problems[id])id=ids[0];
    figureObserver.disconnect();mounted?.destroy?.();current=Number(id);const entry=Problems[id];host.innerHTML='';
    document.body.classList.remove('show-key','building');constructionBar.hidden=true;restoreKey=false;
    document.getElementById('keyButton').setAttribute('aria-pressed','false');document.getElementById('keyButton').textContent='显示关键关系';
    document.getElementById('questionTitle').innerHTML=`<span class="question-number" aria-label="第 ${id} 题">${id}</span><span>${Lab.escape(entry.title)}</span>`;
    document.getElementById('statement').innerHTML=entry.statement||'';
    document.getElementById('lessonGuide').innerHTML='<b>看图思路</b><span>'+LessonGuides[id]+'</span>';
    document.getElementById('sourceLine').textContent=paper.source+(pages[id]?` · 原卷第 ${pages[id]} 页`:'');
    nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',String(+b.dataset.question===+id)));
    mounted=entry.mount(host);mounted.render();syncConstruction();
    const figures=host.querySelector('.figures');if(figures)figureObserver.observe(figures);
    if(location.hash!==`#q${id}`)history.replaceState(null,'',`#q${id}`);
  }
  nav.addEventListener('click',e=>{const b=e.target.closest('[data-question]');if(b)select(+b.dataset.question);});
  document.getElementById('keyButton').onclick=()=>{if(constructionStep()!==null){restoreKey=false;finishConstruction();}setKey(!document.body.classList.contains('show-key'));mounted.render();};
  function reset(){const active=constructionStep()!==null;mounted.reset();if(active)setConstruction(0);else syncConstruction();}
  document.getElementById('resetButton').onclick=reset;
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{document.getElementById('fullscreenButton').textContent='请按 F11';}}
  document.getElementById('fullscreenButton').onclick=fullscreen;
  document.addEventListener('fullscreenchange',()=>{document.getElementById('fullscreenButton').textContent=document.fullscreenElement?'退出全屏':'全屏';});
  document.addEventListener('keydown',e=>{if(e.target.closest('input,select,textarea,[contenteditable=true]')||e.ctrlKey||e.metaKey||e.altKey)return;const i=ids.indexOf(current);if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const direction=e.key==='ArrowRight'?1:-1;if(constructionStep()!==null)moveConstruction(direction);else select(ids[(i+direction+ids.length)%ids.length]);}if(e.key.toLowerCase()==='f')fullscreen();if(e.key.toLowerCase()==='r')reset();});
  new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>mounted?.render());}).observe(host);
  window.addEventListener('hashchange',()=>{const id=Number(location.hash.replace('#q',''));if(ids.includes(id)&&id!==current)select(id);});
  window.Lesson={select,getState:()=>({question:current,revealed:document.body.classList.contains('show-key'),...mounted?.getState?.()}),getConstruction:()=>({step:constructionStep(),steps:mounted?.getConstructionSteps?.()||[]}),questions:ids};
  const requested=Number(location.hash.replace('#q',''));
  select(ids.includes(requested)?requested:decodeURIComponent(location.pathname).includes('第20题')?20:ids[0]);
  function fontsReady(){M.clearMeasurements();cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>mounted?.render());}
  document.fonts.ready.then(fontsReady);
  document.fonts.addEventListener('loadingdone',fontsReady);
})();
