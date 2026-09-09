const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url'),{launchBrowser,reportFailure}=require('./browser-runtime.cjs');
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
(async()=>{
  const browser=await launchBrowser(),page=await browser.newPage(),errors=[],network=[];
  page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
  await page.context().setOffline(true);
  const shots=path.resolve(__dirname,'simple-shots/baoshan-conics');fs.mkdirSync(shots,{recursive:true});
  const url=pathToFileURL(path.resolve(__dirname,'../papers/baoshan-2026/index.html')).href;
  const settle=()=>page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
  const set=async(id,value)=>{await page.locator(id).evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},String(value));await settle();};
  await page.goto(url+'#q15');await settle();
  for(const h of [0,20,36,60,80]){
    await set('#b15-height',h);const g=await page.evaluate(()=>Lesson.getState());near(g.height,h);near(g.radius**2/100-g.y**2/400,1);near(g.focalDistance,20*Math.sqrt(5));
  }
  await page.locator('#b15-bottom').click();near((await page.evaluate(()=>Lesson.getState())).radius,10*Math.sqrt(10));
  await page.locator('#b15-waist').click();near((await page.evaluate(()=>Lesson.getState())).radius,10);
  await page.locator('#b15-top').click();near((await page.evaluate(()=>Lesson.getState())).radius,10*Math.sqrt(2));
  await page.locator('[data-question="20"]').click();await settle();
  for(const branch of [-1,1]){
    await page.locator('#b20-branch').selectOption(String(branch));
    for(const y of [-4,-1,0,1,4]){
      await set('#b20-y',y);
      for(let n=0;n<2;n++){
        const g=await page.evaluate(()=>Lesson.getState()),[x,sy]=g.S,[tx,ty]=g.T;
        near(x*x-sy*sy,3);near((tx-4)**2+ty*ty,1);near((tx-4)*(x-tx)+ty*(sy-ty),0);near(Math.hypot(x-tx,sy-ty),g.length);assert.ok(g.length>=2-1e-10);
        await page.locator('#b20-other').click();
      }
    }
  }
  await page.locator('#b20-best').click();near((await page.evaluate(()=>Lesson.getState())).length,2);
  await page.locator('#b20-mode').selectOption('locus');await settle();
  for(const m of [.01,.45,.99,1.01,1.7,2.99,3.01,4,6]){
    await set('#b20-m',m);const g=await page.evaluate(()=>Lesson.getState());assert.equal(g.valid,true);
    for(const [x,y] of [g.A,g.B]){near(x*x-y*y,3,1e-6);near(y-g.k*x,-3,1e-7);}
    near(g.A[1]+(m+1)/2*g.A[0],m,1e-7);near(g.B[1]-(m-1)/2*g.B[0],-m,1e-7);
    near(g.Q[1]-g.k*g.Q[0],-3);near((2-g.Q[0])+g.k*(-1-g.Q[1]),0);near(g.qr,Math.SQRT2);
  }
  for(const m of [0,1,3]){await set('#b20-m',m);assert.equal((await page.evaluate(()=>Lesson.getState())).valid,false);assert.match(await page.locator('#b20-readout').textContent(),/调整滑杆/);assert.equal(await page.locator('#b20-graph [data-label="Q"]').count(),0);}
  await page.locator('#b20-horizontal').click();near((await page.evaluate(()=>Lesson.getState())).k,0);
  for(const [width,height] of [[1280,720],[1920,1080]]){
    await page.setViewportSize({width,height});
    for(const q of [15,20])for(const side of [false,true]){
      await page.locator(`[data-question="${q}"]`).click();await settle();
      if((await page.locator('body').evaluate(e=>e.classList.contains('side-layout')))!==side)await page.locator('#layoutButton').click();
      await settle();
      const modes=q===20?['tangent','locus']:['profile'];
      for(const mode of modes){
        if(q===20)await page.locator('#b20-mode').selectOption(mode);await settle();
        await page.screenshot({path:path.join(shots,`${width}-q${q}-${mode}-${side?'side':'normal'}.png`)});
        assert.equal(await page.locator('.katex-error').count(),0);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth)<=width+1);
      }
    }
  }
  assert.deepEqual(errors,[]);assert.deepEqual(network,[]);await browser.close();
  console.log('PASS: Baoshan Q15 section geometry and Q20 tangent, conic, fixed-point, perpendicular-foot invariants; exceptional parameters; offline desktop layouts.');
})().catch(reportFailure);
