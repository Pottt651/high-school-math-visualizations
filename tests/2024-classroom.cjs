const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{pathToFileURL}=require('node:url');
const {launchBrowser,reportFailure}=require('./browser-runtime.cjs');
const root=path.resolve(__dirname,'..'),catalog=JSON.parse(fs.readFileSync(path.join(root,'papers/catalog.json'),'utf8'));
const papers=catalog.filter(p=>p.year===2024&&(!process.env.PAPER_2024||p.id===process.env.PAPER_2024));
(async()=>{
 assert.ok(papers.length);if(!process.env.PAPER_2024||process.env.REQUIRE_ALL_2024){assert.equal(papers.length,7);assert.equal(papers.reduce((n,p)=>n+p.questions.length,0),43);}
 const browser=await launchBrowser(),errors=[],external=[],issues=[],shots=path.join(__dirname,'screenshots/2024');fs.mkdirSync(shots,{recursive:true});
 for(const paper of papers){
  const context=await browser.newContext({viewport:{width:1280,height:720}});await context.setOffline(true);const page=await context.newPage();let current='';page.on('pageerror',e=>errors.push({paper:paper.id,current,error:String(e)}));page.on('console',m=>{if(m.type()==='error')errors.push({paper:paper.id,current,error:m.text()});});page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url());});
  const settle=()=>page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
  for(const size of [{width:1280,height:720},{width:1920,height:1080}]){
   await page.setViewportSize(size);await page.goto(pathToFileURL(path.join(root,paper.href)).href);await settle();
   if(await page.locator('#layoutButton').getAttribute('aria-pressed')!=='true')await page.locator('#layoutButton').click();
   for(const q of paper.questions){
    current=`q${q.id}/${size.width}`;await page.locator(`#questionNav [data-question="${q.id}"]`).click();await settle();
    assert.equal(await page.evaluate(()=>Lesson.getState().question),q.id);
    await page.screenshot({path:path.join(shots,`${paper.id}-q${q.id}-${size.width}.png`)});
    const bad=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+2,katex:document.querySelectorAll('.katex-error, .katex svg .plot-label').length,svg:[...document.querySelectorAll('#module svg')].some(e=>/NaN|\[object Object\]/.test(e.innerHTML)),figures:[...document.querySelectorAll('#module .figures > svg, #module .figure-wrap > svg')].filter(e=>e.getBoundingClientRect().width>0).map(e=>({w:e.clientWidth,h:e.clientHeight,drawn:e.viewBox.baseVal.width}))}));
    if(bad.overflow||bad.katex||bad.svg||!bad.figures.length||bad.figures.some(f=>f.w<180||f.h<180||Math.abs(f.w-f.drawn)>2))issues.push({paper:paper.id,current,bad});
    if(size.width===1280){
     const selects=await page.locator('#module .controls select').evaluateAll(es=>es.map(e=>({id:e.id,options:[...e.options].filter(o=>!o.disabled).map(o=>o.value)})));
     for(const select of selects)for(const option of select.options){if(!await page.locator('#'+select.id).isVisible())continue;await page.locator('#'+select.id).selectOption(option);await settle();if(await page.locator('.katex-error').count())issues.push({paper:paper.id,current,select:select.id,option,katex:true});await page.screenshot({path:path.join(shots,`${paper.id}-q${q.id}-${select.id}-${option}.png`)});if(await page.locator('#keyButton').getAttribute('aria-pressed')!=='true')await page.locator('#keyButton').click();await settle();const wide=await page.locator('.explain .math-block').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>({w:e.clientWidth,sw:e.scrollWidth,tex:e.querySelector('annotation')?.textContent})));if(wide.length)issues.push({paper:paper.id,current,option,wide});await page.locator('#keyButton').click();}
     // Exercise actual visible sliders at both ends and middle, without moving mathematical constraints by DOM injection.
     const sliders=await page.locator('#module .controls input[type=range]').evaluateAll(es=>es.map(e=>e.id).filter(Boolean));
     for(const id of sliders){const input=page.locator('#'+id);if(!await input.isVisible()||!await input.isEnabled())continue;await input.focus();for(const key of ['Home','End','ArrowLeft']){await input.press(key);await settle();}}
     await page.locator('#resetButton').click();await settle();
     if(await page.locator('#keyButton').getAttribute('aria-pressed')!=='true')await page.locator('#keyButton').click();await settle();
     const wide=await page.locator('.explain .math-block').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>({w:e.clientWidth,sw:e.scrollWidth,tex:e.querySelector('annotation')?.textContent})));
     if(wide.length)issues.push({paper:paper.id,current,wide});
     if(await page.locator('.explain').count()){await page.locator('.explain').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(shots,`${paper.id}-q${q.id}-proof.png`)});}
     await page.locator('#keyButton').click();
     const before=await page.evaluate(()=>Lesson.getState());for(const button of ['#navigationButton','#layoutButton','#focusButton']){await page.locator(button).click();await settle();await page.locator(button).click();await settle();}
     assert.deepEqual(await page.evaluate(()=>Lesson.getState()),before,`${paper.id} q${q.id}: display toggles changed mathematical state`);
    }
   }
  }
  // Copy ONLY the portable HTML into a new empty temporary directory; verify the isolated file offline.
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'math2024-portable-')),filename=paper.build.legacyOutputs[0],destination=path.join(temp,filename);fs.copyFileSync(path.join(root,filename),destination);
  await page.goto(pathToFileURL(destination).href);await settle();assert.equal(await page.evaluate(()=>PaperMeta.id),paper.id);await page.locator(`#questionNav [data-question="${paper.questions.at(-1).id}"]`).click();await settle();assert.equal(await page.locator('.katex-error').count(),0);fs.unlinkSync(destination);fs.rmdirSync(temp);await context.close();console.log('CHECKED '+paper.id);
 }
 fs.writeFileSync(path.join(shots,'classroom-report.json'),JSON.stringify({errors,external,issues},null,2));await browser.close();assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(issues,[]);console.log('PASS: 2024 classroom controls, math rendering, layout preservation, 720p/1080p, and isolated offline single-file use.');
})().catch(reportFailure);
