(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const model = window.MathModel;
  const ROOT_HALF = Math.SQRT1_2;
  const defaults = { stage: 0, theta: 31, rho: .35, locked: false, morph: 0, structure: 0,
    path: 'analytic', proofCount: 1, focus: '', trace: false, choice: '', migration: false,
    migrationAnswer: false, samples: [], trails: [], sweep: false, morphing: false, zoom:1, locus:false };
  let state = structuredClone(defaults);
  let geometry = model.geometry(state.theta, state.rho);
  let drag = null, lastFrame = 0, sweepDistance = 0, sampleAngle = -100, toastTimer, lastFocus;
  const fmt = (n, precision = 4) => n === null || !Number.isFinite(n) ? '未定义' : (Math.abs(n) < .5 * 10 ** -precision ? 0 : n).toFixed(precision).replace('-', '−');
  const frac = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const title = ['让弦动起来，先不要猜答案', '同一条件，许多不同的三角形', '同一组点，用两种坐标来看', '每一个等式，都应找得到图形', '固定方向，是否足够？'];
  const label = ['施加条件 →', '换个视角 →', '进入证明 →', '迁移检验 →', '回到自由探索 ↺'];
  const proof = {
    analytic: [
      { title: '01 · 把一条弦写进方程', focus: 'chord', formula: 'y = kx + b<span class="eq-line">D = 4 + 5k²</span><span class="eq-line">Dx² + 10kbx + 5b² − 20 = 0</span>', text: '由直线与椭圆联立。原题合法构型中，直线不竖直，各斜率均有定义。A、B 的横坐标就是这个二次方程的两个根。' },
      { title: '02 · 中点关系让左边先固定', focus: 'midpoint', formula: `x<sub>M</sub> = ${frac('−5kb','D')}，y<sub>M</sub> = ${frac('4b','D')}<span class="eq-line">k<sub>OM</sub> · k<sub>AB</sub> = −${frac('4','5')}</span>`, text: '先由韦达定理求中点，再求斜率。这里 k≠0、b≠0；水平弦或过原点的弦会使题设中的 OM 斜率无定义。' },
      { title: '03 · 右边相等，位置就受限制', focus: 'slopes', formula: `k<sub>OA</sub>k<sub>OB</sub> = ${frac('4(b² − 5k²)','5(b² − 4)')} = −${frac('4','5')}<span class="eq-line">2b² = 4 + 5k² = D</span>`, text: '先确认 x_A x_B≠0，才允许相除与交叉相乘。条件不是固定弦的方向，而是将截距与斜率绑在一起。' },
      { title: '04 · 用弦的两个端点计算面积', focus: 'area', formula: `S = ${frac('1','2')}|x<sub>A</sub>y<sub>B</sub> − x<sub>B</sub>y<sub>A</sub>|<span class="eq-line">= ${frac('|b|','2')}|x<sub>A</sub> − x<sub>B</sub>|</span><span class="eq-line">= ${frac('2√5 |b| √(D − b²)','D')}</span>`, text: '判别式为 80(D−b²)，所以横坐标差为 4√5√(D−b²)/D。这一步适用于任意非退化弦，不先假设面积固定。' },
      { title: '05 · 代入约束，参数消失', focus: 'area', formula: `b² = ${frac('D','2')}<span class="eq-line">S = ${frac('2√5 · √(D/2) · √(D/2)','D')} = √5</span>`, text: '所有原题合法构型都得到同一个结果。数值观察提出猜想，参数消去解释了为什么必然如此。' }
    ],
    transform: [
      { title: '01 · 先把题设条件翻译出来', focus: 'slopes', formula: `k<sub>OM</sub>k<sub>AB</sub> = −${frac('4','5')}<span class="eq-line">${frac('4(b²−5k²)','5(b²−4)')} = −${frac('4','5')}</span><span class="eq-line">2b² = 4 + 5k²</span>`, text: '沿用解析法前三步的韦达关系。变换法不跳过题设条件的推导；它进一步解释这个代数关系的几何意义。所有分母均须有定义。' },
      { title: '02 · 椭圆变成单位圆', focus: 'stretch', formula: 'x = √5 u，y = 2v<span class="eq-line">u² + v² = 1</span><span class="eq-line">−√5 ku + 2v = b</span>', text: '相应的 A′、B′、M′ 使用同色标记。直线与中点关系保留，普通长度和角度通常不保留。用下方进度条跟踪对应。' },
      { title: '03 · 原来锁住的是弦心距', focus: 'distance', formula: `d = ${frac('|b|','√(5k² + 4)')} = ${frac('1','√2')}`, text: '单位圆中，从圆心到对应弦的距离固定。原椭圆中的 OM 通常不是弦的垂线；垂直关系出现在单位圆里。' },
      { title: '04 · 圆上的三角形变得简单', focus: 'triangle', formula: `h = √(1 − d²) = ${frac('1','√2')}<span class="eq-line">S<sub>圆</sub> = ${frac('1','2')} · 2h · d = ${frac('1','2')}</span>`, text: 'M′ 为弦的中点，OM′ 与 A′B′ 垂直。半弦长与弦心距都为 1/√2，△OA′B′ 在 O 处还是一个直角三角形。' },
      { title: '05 · 把面积还给原椭圆', focus: 'stretch', formula: `S<sub>椭圆</sub> = √5 × 2 × S<sub>圆</sub><span class="eq-line">= 2√5 × ${frac('1','2')} = √5</span>`, text: '横向伸缩 √5 倍，纵向伸缩 2 倍，面积扩大 2√5 倍。可以暂停变换，检查中间图形的面积比例。' }
    ]
  };

  function toast(message) {
    $('toast').textContent = message; $('toast').classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2400);
  }
  function stopMotion() { state.sweep = false; state.morphing = false; }
  function setStage(stage) {
    stopMotion(); state.stage = Math.max(0, Math.min(4, stage)); state.choice = ''; state.focus = '';
    state.structure = 0; state.morph = 0; state.proofCount = 1; state.migration = false; state.migrationAnswer = false;
    state.samples = []; state.trails = []; state.trace = false; state.locus=false;state.zoom=stage===2?1.8:1;
    if (stage === 0) { state.locked = false; state.rho = .35; }
    if (stage === 1) state.locked = false;
    if (stage >= 2) { state.locked = true; state.rho = Math.sign(state.rho || 1) * ROOT_HALF; }
    state.path = 'analytic';
    renderAll(); $('sideContent').scrollTop = 0;
  }
  function resetStage() {
    const stage = state.stage; state = structuredClone(defaults); state.stage = stage; setStage(stage);
    toast('当前幕已复位');
  }
  function toggleLock() {
    state.locked = !state.locked;
    if (state.locked) state.rho = Math.sign(state.rho || 1) * ROOT_HALF;
    state.trails = []; renderAll();
    if (state.locked) toast('位置由题设条件确定；可以继续转动弦');
    else toast('位置约束已解除：试着平移同一方向的弦');
  }
  function setTheta(value) {
    if (!Number.isFinite(value)) return;
    state.theta = Math.max(0, Math.min(180, value)); renderLive();
  }
  function setRho(value) {
    if (!Number.isFinite(value)) return;
    state.rho = Math.max(-1, Math.min(1, value)); renderLive();
  }
  function capture() {
    const g = geometry;
    state.samples.push({ theta: state.theta, rho: state.rho, area: g.area, valid: g.valid, satisfies: g.satisfies });
    if (state.samples.length > 6) state.samples.shift();
    renderSide(); toast('已记录当前构型；记录不是证明');
  }
  function samplesHTML() {
    if (!state.samples.length) return '<p class="note">先选两个不同构型，记录并比较。每次记录保留方向、位置与面积。</p>';
    const xs = state.samples.map(s => 12 + s.theta / 180 * 264);
    const ys = state.samples.map(s => 54 - s.area / Math.sqrt(5) * 44);
    return `<svg class="record-chart" viewBox="0 0 290 65" role="img" aria-label="记录构型的方向与面积"><line x1="12" y1="54" x2="276" y2="54" stroke="#cbd8cd"/><line x1="12" y1="10" x2="276" y2="10" stroke="#d2ded5" stroke-dasharray="3 4"/>${state.samples.map((s,i)=>`<circle cx="${xs[i]}" cy="${ys[i]}" r="4" fill="${s.valid ? '#007e80':'#b07d16'}"/>`).join('')}<text x="14" y="64" font-size="8" fill="#647378">0°</text><text x="255" y="64" font-size="8" fill="#647378">180°</text></svg><table class="sample-table"><thead><tr><th>方向 θ</th><th>位置 ρ</th><th>面积</th></tr></thead><tbody>${state.samples.map(s=>`<tr class="${s.valid?'':'invalid'}"><td>${s.theta.toFixed(1)}°</td><td>${s.rho.toFixed(3)}</td><td>${fmt(s.area)}${s.valid?'':' *'}</td></tr>`).join('')}</tbody></table><p class="note">最多保留 6 组。* 表示不是原题合法构型。记录只能支持猜想。</p>`;
  }
  function specialsHTML() {
    return '<details class="specials"><summary>检验特殊位置</summary><div class="button-row"><button class="small" data-special="horizontal">水平弦</button><button class="small" data-special="vertical">竖直弦</button><button class="small" data-special="radius">竖直半径</button><button class="small" data-special="center">经过原点</button><button class="small" data-special="tangent">退化切线</button><button class="small" data-special="regular">回到合法示例</button></div></details>';
  }
  function areaCurveSVG(){
    const width=280,height=108,px=r=>20+(r+1)*120,py=s=>86-s/Math.sqrt(5)*65;
    const points=Array.from({length:161},(_,i)=>{const r=-1+i/80;return `${i?'L':'M'}${px(r)},${py(2*Math.sqrt(5)*Math.abs(r)*Math.sqrt(Math.max(0,1-r*r)))}`;}).join(' ');
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="三角形面积随弦位置变化的曲线" style="width:100%;height:108px"><line x1="20" y1="86" x2="265" y2="86" stroke="#a8b8ad"/><line x1="140" y1="90" x2="140" y2="14" stroke="#ccd8ce"/><path d="${points}" fill="none" stroke="#007e80" stroke-width="2"/><line x1="${px(state.rho)}" y1="86" x2="${px(state.rho)}" y2="${py(geometry.area)}" stroke="#da663e" stroke-dasharray="3 3"/><circle cx="${px(state.rho)}" cy="${py(geometry.area)}" r="4.5" fill="#da663e" stroke="#fffefa" stroke-width="2"/><text x="17" y="102" font-size="11" fill="#647378">−1</text><text x="138" y="102" font-size="11" fill="#647378">0</text><text x="257" y="102" font-size="11" fill="#647378">1</text><text x="150" y="15" font-size="12" fill="#647378">S</text><text x="267" y="82" font-size="12" fill="#647378">ρ</text>${state.migrationAnswer?`<line x1="20" y1="21" x2="263" y2="21" stroke="#b07d16" stroke-dasharray="3 5"/><text x="23" y="16" font-size="11" fill="#9c6b0b">最大面积 √5</text>`:''}</svg>`;
  }
  function renderSide() {
    let html = '';
    if (state.stage === 0) html = `<div class="stage-kicker">01 / 先预测，再动手</div><h2>形状变了，<br>面积一定会变吗？</h2><p class="lead">A、B 都在同一个椭圆上。先固定方向平移弦，再试试转动弦。</p><div class="choice-list"><button data-choice="change" class="${state.choice==='change'?'selected':''}">只要三角形变形，面积就会变</button><button data-choice="maybe" class="${state.choice==='maybe'?'selected':''}">某些变化可能保持面积不变</button><button data-choice="unsure" class="${state.choice==='unsure'?'selected':''}">先看哪些量被固定</button></div>${state.choice?'<div class="feedback">保留这个判断。现在做两个对照实验，再说明理由。</div>':''}<div class="prompt"><strong>实验 A</strong>：方向保持不变，只移动中点 M。<br><strong>实验 B</strong>：保留位置参数，改变弦的方向。<br>两次实验，面积变化一样吗？</div><div class="button-row"><button class="small" data-action="capture">＋ 记录构型</button><button class="small" data-action="trace">${state.trace?'隐藏':'显示'}运动残影</button></div>${samplesHTML()}${specialsHTML()}`;
    if (state.stage === 1) html = `<div class="stage-kicker">02 / 从自由到约束</div><h2>条件究竟<br>拿走了什么自由？</h2><p class="lead">原题要求两个斜率乘积相等。施加条件后，转动弦，再比较面积。</p><div class="proof-formula">k<sub>OM</sub>k<sub>AB</sub> = k<sub>OA</sub>k<sub>OB</sub></div><div class="prompt">${state.locked?'位置已经随方向受到约束。<br><strong>三角形没有保持全等，面积为什么却不变？</strong>':'先点击下方<strong>“施加题设条件”</strong>。<br>注意：位置不能再自由选择，方向仍然可以改变。'}</div><div class="button-row"><button class="small" data-action="sweep">${state.sweep?'Ⅱ 暂停转动':'▶ 连续转动弦'}</button><button class="small" data-action="capture">＋ 记录构型</button><button class="small" data-action="locus">${state.locus?'隐藏':'显示'}中点轨迹</button><button class="small" data-action="trace">${state.trace?'隐藏':'显示'}运动残影</button></div>${samplesHTML()}<div class="divider"></div><p class="note">可以随时解除条件，重新平移弦。相同方向下，比较“符合条件”与“不符合条件”的两个位置。</p>${specialsHTML()}`;
    if (state.stage === 2) html = `<div class="stage-kicker">03 / 对应、变形与不变量</div><h2>椭圆背后，<br>藏着一个圆。</h2><p class="lead">同色点一一对应。拖动下方进度条，观察一个圆如何被横向、纵向拉成原椭圆。</p><div class="proof-formula">x = √5 u，y = 2v</div><div class="prompt">先预测：这个变换会保留<br><strong>直线？中点？长度？角度？面积？</strong></div><div id="structureContent">${structureHTML()}</div><button class="reveal-step primary" data-action="structure" ${state.structure>=3?'disabled':''}>${['显示弦心距与半弦 →','揭示圆上的关系 →','揭示面积如何伸缩 →','关键关系已展开'][state.structure]}</button><p class="note">第一步把右图复位到圆，便于看清垂直关系。条件到弦心距的推导将在下一幕给出。</p><div class="button-row"><button class="small" data-action="morph-start">回到圆</button><button class="small" data-action="morph-end">查看原椭圆</button></div>`;
    if (state.stage === 3) {
      const cards = proof[state.path];
      html = `<div class="stage-kicker">04 / 从现象到必然</div><h2>一个定值，<br>两种理解。</h2><div class="proof-tabs"><button data-path="analytic" class="${state.path==='analytic'?'active':''}">解析法</button><button data-path="transform" class="${state.path==='transform'?'active':''}">变换法</button></div><p class="note">点击已展开的卡片，让对应的图形关系突出显示。每条路径都需遵守原题的斜率定义域。</p>${cards.slice(0,state.proofCount).map((card,i)=>`<article class="proof-card ${state.focus===card.focus?'active':''}" data-proof="${i}" tabindex="0" role="button" aria-label="突出图形：${card.title}"><h3>${card.title}</h3><div class="proof-formula">${card.formula}</div><p>${card.text}</p></article>`).join('')}<button class="primary reveal-step" data-action="proof-next" ${state.proofCount>=cards.length?'disabled':''}>${state.proofCount>=cards.length?'这条证明已完成':'展开下一步 →'}</button>${state.proofCount===cards.length?'<div class="prompt">尝试不用面积读数，用一句话解释：<strong>题设究竟固定了什么？</strong></div>':''}${specialsHTML()}`;
    }
    if (state.stage === 4) html = `<div class="stage-kicker">05 / 用一个变式检验理解</div><h2>只固定弦的方向，<br>还能锁住面积吗？</h2><p class="lead">方向现在已固定。先预测，再解除位置约束，沿同一方向平移弦。</p><div class="choice-list"><button data-choice="yes" class="${state.choice==='yes'?'selected':''}">能，方向不变就足够</button><button data-choice="no" class="${state.choice==='no'?'selected':''}">不能，还需要约束弦的位置</button></div><button class="accent reveal-step" data-action="migration">${state.migration?'位置已解锁 · 继续平移弦':'解除位置约束，开始验证 →'}</button><div class="prompt">${state.migration?'拖动 M 或位置滑杆。<br>找两个<strong>方向相同而面积不同</strong>的构型，说明原判断。':'先记住当前构型。解除约束后，方向仍然保持不变。'}</div><div class="button-row"><button class="small" data-action="capture">＋ 记录反例</button><button class="small" data-action="migration-answer">${state.migrationAnswer?'收起解释':'展开解释'}</button></div>${samplesHTML()}${state.migrationAnswer?`<div class="proof-card"><h3>方向不是决定面积的唯一因素</h3><div class="proof-formula">S = 2√5 d√(1−d²)</div><p>这里 d 是对应单位圆中的弦心距。固定方向仍可改变 d，因此面积可以改变。原题条件固定 d²=1/2，恰好使面积达到所有弦对应三角形中的最大值。</p></div><div class="prompt"><strong>再向前一步</strong><br>若椭圆半轴换成 a、b，同样的“单位圆弦心距为 1/√2”条件下，面积应是多少？</div>`:''}`;
    $('sideContent').innerHTML = html;
    if(state.stage===4&&state.migration){
      const host=document.createElement('div');host.id='positionCurve';host.innerHTML=areaCurveSVG();
      $('sideContent').querySelector('.prompt').after(host);
    }
  }
  function structureHTML() {
    if (!state.structure) return '';
    const g = geometry;
    const eligible = g.valid && g.satisfies;
    let html = '<div class="process-ribbon"><div><b>01 · 垂直关系在圆上显现</b><br>OM′ 是弦心距 d，M′A′ 是半弦 h。<br>圆上 d² + h² = 1。</div>';
    if (state.structure >= 2) html += eligible ? '<div><b>02 · 条件变成一个固定距离</b><br>d² = 1/2，所以 d = h = 1/√2。<br>圆上三角形面积 dh = 1/2。</div>' : '<div><b>02 · 先检查当前条件</b><br>当前不是满足题设的合法构型，不能套用 d=h=1/√2。施加条件并回到合法方向后再观察。</div>';
    if (state.structure >= 3) html += `<div><b>03 · 面积乘以横纵伸缩倍数</b><br>S<sub>椭圆</sub> = √5 × 2 × S<sub>圆</sub>${eligible?'<br>因此 S<sub>椭圆</sub> = √5。':'<br>这个比例仍成立，但当前面积不套用定值。'}</div>`;
    return html + '</div>';
  }

  function makeScene(svg, isRight) {
    const width = svg.clientWidth || 500, height = svg.clientHeight || 350;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const unit = Math.min((width - 66) / 5.65, (height - 66) / 4.8)*(isRight?state.zoom:1);
    const ox = width / 2, oy = height / 2 + 3;
    const point = p => ({ x: ox + p.x * unit, y: oy - p.y * unit });
    const P = p => `${point(p).x.toFixed(2)},${point(p).y.toFixed(2)}`;
    const line = (p,q,attrs='') => `<line x1="${point(p).x}" y1="${point(p).y}" x2="${point(q).x}" y2="${point(q).y}" ${attrs}/>`;
    const text = (p, content, attrs='') => `<text x="${point(p).x}" y="${point(p).y}" ${attrs}>${content}</text>`;
    const g = geometry, transformed = model.transform(g, state.morph);
    const shape = isRight ? { a: transformed.sx, b: transformed.sy, ...transformed } : { a: model.A, b: model.B, ...g.ellipse };
    const o = {x:0,y:0}, active = state.focus;
    const aux = isRight && (state.structure > 0 || ['distance','triangle','stretch'].includes(active));
    let s = `<defs><pattern id="dots-${isRight}" x="${ox}" y="${oy}" width="${unit/2}" height="${unit/2}" patternUnits="userSpaceOnUse"><circle cx="0" cy="0" r="1" fill="#dce4de"/></pattern><marker id="arrow-${isRight}" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 1 L7 4 L0 7" fill="none" stroke="#95a8a6"/></marker></defs><rect width="${width}" height="${height}" fill="url(#dots-${isRight})"/>`;
    if (isRight) {
      if(state.zoom===1)
      s += `<ellipse cx="${ox}" cy="${oy}" rx="${model.A*unit}" ry="${model.B*unit}" fill="none" stroke="#dce4de" stroke-width="1.5" stroke-dasharray="5 5"/>`;
      if (state.morph > .01 && state.morph < .99) {
        for (const value of [-1,-.5,0,.5,1]) {
          s += line({x:value*shape.a,y:-1.1*shape.b},{x:value*shape.a,y:1.1*shape.b},'stroke="#bad5c9" stroke-width="1" opacity=".45"');
          s += line({x:-1.1*shape.a,y:value*shape.b},{x:1.1*shape.a,y:value*shape.b},'stroke="#bad5c9" stroke-width="1" opacity=".45"');
        }
      }
    }
    const xEnd=Math.min(2.88,(width/2-20)/unit),yEnd=Math.min(2.36,(height/2-28)/unit);
    s += line({x:-xEnd,y:0},{x:xEnd,y:0},`stroke="#a8b8b3" stroke-width="1" marker-end="url(#arrow-${isRight})"`);
    s += line({x:0,y:-yEnd},{x:0,y:yEnd},`stroke="#a8b8b3" stroke-width="1" marker-end="url(#arrow-${isRight})"`);
    for (const value of [-2,-1,1,2]) {
      if(isRight&&state.zoom>1.5&&Math.abs(value)>1)continue;
      s += line({x:value,y:-.04},{x:value,y:.04},'stroke="#9cafaa"');
      s += text({x:value,y:-.23},String(value),'font-size="11" fill="#8a9d97" text-anchor="middle"');
    }
    s += text({x:xEnd-.05,y:.13},isRight&&state.morph===0?'u':'x','font-size="14" fill="#78938c" font-style="italic"');
    s += text({x:.12,y:yEnd-.06},isRight&&state.morph===0?'v':'y','font-size="14" fill="#78938c" font-style="italic"');
    if (state.trace && !isRight) for (const tr of state.trails) s += `<path d="M${P(o)} L${P(tr.A)} L${P(tr.B)} Z" fill="none" stroke="#007e80" stroke-width="1" opacity=".10"/>`;
    const areaFocus = ['area','triangle','stretch'].includes(active);
    s += `<path d="M${P(o)} L${P(shape.A)} L${P(shape.B)} Z" fill="${areaFocus?'#c7e6d8':'#dceee3'}" fill-opacity=".87" stroke="none"/>`;
    s += `<ellipse cx="${ox}" cy="${oy}" rx="${shape.a*unit}" ry="${shape.b*unit}" fill="none" stroke="#496769" stroke-width="2.1"/>`;
    if(state.locus||aux)s+=`<ellipse cx="${ox}" cy="${oy}" rx="${shape.a*Math.abs(g.rho)*unit}" ry="${shape.b*Math.abs(g.rho)*unit}" fill="none" stroke="#b07d16" stroke-width="1.2" stroke-dasharray="4 5" opacity=".55"/>`;
    const dirRaw = {x:shape.B.x-shape.A.x,y:shape.B.y-shape.A.y};
    let length = Math.hypot(dirRaw.x,dirRaw.y);
    const dir = length>1e-8?{x:dirRaw.x/length,y:dirRaw.y/length}:{x:Math.cos(g.theta),y:Math.sin(g.theta)};
    const ext1 = {x:shape.A.x-dir.x*.36,y:shape.A.y-dir.y*.36};
    const ext2 = {x:shape.B.x+dir.x*.36,y:shape.B.y+dir.y*.36};
    s += line(ext1,ext2,`stroke="#273f45" stroke-width="${active==='chord'?3.5:2.2}"`);
    s += line(o,shape.A,`stroke="#007e80" stroke-width="${active==='slopes'?3:2}"`);
    s += line(o,shape.B,`stroke="#da663e" stroke-width="${active==='slopes'?3:2}"`);
    s += line(o,shape.M,`stroke="#b07d16" stroke-width="${active==='midpoint'||active==='distance'?3:1.7}" stroke-dasharray="${aux?'0':'5 4'}"`);
    if (active==='midpoint' && !isRight) {
      s += line({x:shape.M.x,y:0},shape.M,'stroke="#b07d16" stroke-dasharray="3 4" opacity=".8"');
      s += line({x:0,y:shape.M.y},shape.M,'stroke="#b07d16" stroke-dasharray="3 4" opacity=".8"');
    }
    if (active==='slopes' && !isRight && g.valid) {
      for (const [p,color] of [[shape.A,'#007e80'],[shape.B,'#da663e']]) {
        s += line(o,{x:p.x,y:0},`stroke="${color}" stroke-width="1.3" stroke-dasharray="3 4" opacity=".7"`);
        s += line({x:p.x,y:0},p,`stroke="${color}" stroke-width="1.3" stroke-dasharray="3 4" opacity=".7"`);
      }
    }
    if (aux && g.half>1e-8 && Math.abs(g.rho)>1e-8) {
      const moLength = Math.hypot(shape.M.x,shape.M.y);
      const u = {x:-shape.M.x/moLength,y:-shape.M.y/moLength};
      const v = {x:(shape.A.x-shape.M.x)/Math.hypot(shape.A.x-shape.M.x,shape.A.y-shape.M.y),y:(shape.A.y-shape.M.y)/Math.hypot(shape.A.x-shape.M.x,shape.A.y-shape.M.y)};
      if (Math.abs(model.dot(u,v))<1e-6) {
        const size=10/unit;
        const p={x:shape.M.x+u.x*size,y:shape.M.y+u.y*size}, q={x:p.x+v.x*size,y:p.y+v.y*size},r={x:shape.M.x+v.x*size,y:shape.M.y+v.y*size};
        s += `<polyline points="${P(p)} ${P(q)} ${P(r)}" fill="none" stroke="#b07d16" stroke-width="1.5"/>`;
      }
      const isCircle = state.morph < 1e-8;
      const distanceLabel = isCircle ? 'd' : '';
      const halfLabel = isCircle ? 'h' : '';
      s += text({x:shape.M.x*.5-dir.x*.19,y:shape.M.y*.5-dir.y*.19},distanceLabel,'font-size="18" fill="#9c6b0b" text-anchor="middle" paint-order="stroke" stroke="#fffefa" stroke-width="4" stroke-linejoin="round"');
      s += text({x:(shape.M.x+shape.A.x)/2+g.n.x*.25,y:(shape.M.y+shape.A.y)/2+g.n.y*.25},halfLabel,'font-size="18" fill="#007e80" text-anchor="middle" paint-order="stroke" stroke="#fffefa" stroke-width="4"');
      if (isCircle && g.satisfies && (state.structure>=2||active==='triangle')) {
        const lenA=Math.hypot(shape.A.x,shape.A.y),lenB=Math.hypot(shape.B.x,shape.B.y),size=10/unit;
        const p={x:shape.A.x/lenA*size,y:shape.A.y/lenA*size},r={x:shape.B.x/lenB*size,y:shape.B.y/lenB*size},q={x:p.x+r.x,y:p.y+r.y};
        s+=`<polyline points="${P(p)} ${P(q)} ${P(r)}" fill="none" stroke="#55756c" stroke-width="1.3"/>`;
      }
    }
    const labelPoint = (p,name,color,offset=0) => {
      const coord=point(p),norm=Math.hypot(p.x,p.y)||1;
      let dx=p.x/norm*17,dy=-p.y/norm*18;
      if(name==='B'&&!isRight){dx=-Math.sin(g.theta)*24;dy=-Math.cos(g.theta)*24;}
      if(offset){dx+=offset;dy-=4;}
      if(Math.abs(dx)<9)dx=dx<0?-10:10;
      return `<circle cx="${coord.x}" cy="${coord.y}" r="5.4" fill="${color}" stroke="#fffefa" stroke-width="2.5"/><text x="${coord.x+dx}" y="${coord.y+dy+5}" font-size="17" font-weight="600" fill="${color}" text-anchor="${dx<0?'end':'start'}" paint-order="stroke" stroke="#fffefa" stroke-width="4" stroke-linejoin="round">${name}</text>`;
    };
    const near = Math.hypot(shape.A.x-shape.B.x,shape.A.y-shape.B.y)*unit < 35;
    s += labelPoint(shape.A,isRight?'A′':'A','#007e80',near?-18:0);
    s += labelPoint(shape.B,isRight?'B′':'B','#da663e',near?18:0);
    const mp=point(shape.M);
    const centerCoincides=Math.hypot(shape.M.x,shape.M.y)<1e-8;
    s += `<circle cx="${mp.x}" cy="${mp.y}" r="5" fill="#b07d16" stroke="#fffefa" stroke-width="2"/>${centerCoincides?'':`<text x="${mp.x+10}" y="${mp.y+(isRight&&aux?-13:21)}" font-size="16" fill="#996d18" paint-order="stroke" stroke="#fffefa" stroke-width="4">${isRight?'M′':'M'}</text>`}<circle cx="${ox}" cy="${oy}" r="3" fill="#182e35"/><text x="${ox+9}" y="${oy+18}" font-size="15" fill="#405d61" paint-order="stroke" stroke="#fffefa" stroke-width="3">${centerCoincides?'O = '+(isRight?'M′':'M'):'O'}</text>`;
    if (!isRight) {
      if (!state.locked) s += `<circle data-drag="move" cx="${mp.x}" cy="${mp.y}" r="18" fill="transparent" stroke="#b07d16" stroke-width="1" stroke-dasharray="2 4" style="cursor:grab"><title>拖动中点平移弦</title></circle>`;
      if (state.stage !==4) {
        const h=point(ext2);
        s += `<circle data-drag="rotate" cx="${h.x}" cy="${h.y}" r="12" fill="#fffefa" stroke="#687f7f" stroke-width="1.5" stroke-dasharray="3 3" style="cursor:grab"><title>拖动圆柄旋转弦</title></circle><circle cx="${h.x}" cy="${h.y}" r="2" fill="#687f7f" pointer-events="none"/>`;
      }
    }
    if (isRight && state.morph>.02) {
      const bw=27*shape.a,bh=27*shape.b,bx=width-30-bw,by=height-29-bh;
      s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#deeee1" stroke="#769a85" stroke-width="1.1"/><text x="${bx+bw/2}" y="${by-7}" font-size="11" fill="#577a65" text-anchor="middle">单位方格的像</text><text x="${bx+bw/2}" y="${by+bh/2+4}" font-size="12" fill="#386451" text-anchor="middle">×${shape.factor.toFixed(2)}</text>`;
    }
    if (areaFocus) {
      const value = isRight ? transformed.area : g.area;
      if(value>.15) s += `<text x="22" y="${height-32}" font-size="17" fill="#166957" font-weight="600" paint-order="stroke" stroke="#fffefa" stroke-width="4">S = ${fmt(value,3)}</text>`;
    }
    svg.innerHTML = s;
    svg._mapping = { ox,oy,unit,width,height };
  }

  function renderLive() {
    geometry = model.geometry(state.theta,state.rho);
    const g=geometry, paired=state.stage===2 || (state.stage===3 && state.path==='transform');
    $('graphArea').classList.toggle('paired',paired);
    $('transformControls').classList.toggle('visible',paired);
    $('angle').value=state.theta; $('angleNumber').value=Number(state.theta.toFixed(4));
    $('position').value=state.rho; $('positionNumber').value=Number(state.rho.toFixed(6));
    $('angle').disabled=$('angleNumber').disabled=state.stage===4;
    $('position').disabled=$('positionNumber').disabled=state.locked;
    $('lockBtn').classList.toggle('hidden',state.stage===0 || state.stage===4);
    $('lockBtn').classList.toggle('on',state.locked);
    $('lockBtn').textContent=state.locked?'✓ 条件已施加':'施加题设条件';
    $('lockBtn').title=state.locked?'点击解除条件，恢复自由移动':'让位置满足斜率条件的约束';
    $('lockBtn').setAttribute('aria-pressed',String(state.locked));
    $('modeBadge').textContent=!g.valid?'特殊构型 · 非原题情形':g.satisfies?'满足题设条件':state.stage===4?'方向固定 · 位置自由':'自由弦';
    $('modeBadge').className=`badge ${!g.valid?'invalid':g.satisfies?'locked':''}`;
    const message = !g.valid ? g.issues.join('；')+'。图形仍可观察，但不能代入原题斜率等式。' : g.satisfies ? '当前各斜率均有定义，两个乘积相等。面积读数只用于观察。' : '各斜率均有定义，但当前不满足题设等式。位置与方向可以分别探索。';
    if($('conditionMessage').textContent!==message)$('conditionMessage').textContent=message;
    $('conditionMessage').classList.toggle('error',!g.valid);
    if(paired){
      const tr=model.transform(g,state.morph);
      $('metricLabel1').textContent='左图 · 原椭圆三角形面积';
      $('metricLabel2').textContent='右图 · 当前三角形面积';
      $('metricLabel3').textContent='横向 × 纵向 · 面积缩放系数';
      $('product1').textContent=fmt(g.area); $('product2').textContent=fmt(tr.area);
      $('areaValue').innerHTML=fmt(tr.factor)+' <small>倍</small>';
      $('morph').value=state.morph;
      $('morphPlay').textContent=state.morphing?'Ⅱ 暂停变换':'▶ 播放变换';
      $('scaleLabel').textContent=`横向 ×${tr.sx.toFixed(2)} · 纵向 ×${tr.sy.toFixed(2)}`;
      $('rightLabel').innerHTML=state.morph<.001?`<strong>对应单位圆${state.zoom>1?' · 放大观察':''}</strong>　u² + v² = 1`:state.morph>.999?'<strong>伸缩完成</strong>　与左侧原椭圆重合':'<strong>伸缩进行中</strong>　跟踪同色点';
      $('rightTip').textContent=state.zoom>1?'右图已放大；屏幕面积不能直接比较':state.morph>.001?'直线与中点保留；长度与角度通常改变':'左右同尺度 · 圆上的弦心距垂直于弦';
      $('zoomCircle').textContent=state.zoom>1?'同尺度':'放大圆';
    }else{
      $('metricLabel1').innerHTML='斜率乘积 k<sub>OM</sub> · k<sub>AB</sub>';
      $('metricLabel2').innerHTML='斜率乘积 k<sub>OA</sub> · k<sub>OB</sub>';
      $('metricLabel3').textContent='△OAB 面积 · 实测值';
      $('product1').textContent=fmt(g.product1); $('product2').textContent=fmt(g.product2);
      $('areaValue').innerHTML=state.stage===3 &&state.proofCount>=5&&g.valid&&g.satisfies?'√5 <small>≈ '+fmt(g.area)+'</small>':fmt(g.area);
    }
    $('dragTip').textContent=state.stage===4?'方向已固定 · 拖动中点 M 平移弦':state.locked?'位置由条件确定 · 拖动虚线圆柄旋转弦':'拖动金色中点平移弦 · 拖动虚线圆柄旋转弦';
    makeScene($('ellipseSvg'),false); if(paired)makeScene($('transformSvg'),true);
    const structure=$('structureContent');if(structure&&state.structure)structure.innerHTML=structureHTML();
    if($('positionCurve'))$('positionCurve').innerHTML=areaCurveSVG();
    const sweepButton=document.querySelector('[data-action="sweep"]');
    if(sweepButton)sweepButton.textContent=state.sweep?'Ⅱ 暂停转动':'▶ 连续转动弦';
  }
  function renderAll() {
    $('labTitle').textContent=title[state.stage];
    document.querySelectorAll('[data-stage]').forEach(b=>{if(+b.dataset.stage===state.stage)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    $('prevStage').disabled=state.stage===0; $('nextStage').textContent=label[state.stage];
    geometry=model.geometry(state.theta,state.rho);
    renderSide(); renderLive();
  }
  $('stages').addEventListener('click',e=>{const b=e.target.closest('[data-stage]');if(b)setStage(+b.dataset.stage);});
  $('prevStage').onclick=()=>setStage(state.stage-1);
  $('nextStage').onclick=()=>setStage((state.stage+1)%5);
  $('resetBtn').onclick=resetStage;
  $('lockBtn').onclick=toggleLock;
  $('angle').oninput=e=>{stopMotion();setTheta(+e.target.value);};
  $('angleNumber').onchange=e=>{stopMotion();setTheta(+e.target.value);};
  $('position').oninput=e=>{stopMotion();setRho(+e.target.value);};
  $('positionNumber').onchange=e=>{stopMotion();setRho(+e.target.value);};
  $('morph').oninput=e=>{state.morphing=false;state.zoom=1;state.morph=+e.target.value;renderLive();};
  $('morphPlay').onclick=()=>{state.sweep=false;state.zoom=1;state.morphing=!state.morphing;if(state.morph>=.999)state.morph=0;renderLive();};
  $('zoomCircle').onclick=()=>{stopMotion();state.morph=0;state.zoom=state.zoom>1?1:1.8;renderLive();};
  $('sideContent').addEventListener('click',e=>{
    const action=e.target.closest('[data-action]')?.dataset.action;
    if(action==='capture')capture();
    if(action==='trace'){state.trace=!state.trace;state.trails=[];renderAll();}
    if(action==='locus'){state.locus=!state.locus;renderAll();}
    if(action==='sweep'){state.morphing=false;state.sweep=!state.sweep;sweepDistance=0;renderSide();}
    if(action==='structure'){state.structure=Math.min(3,state.structure+1);if(state.structure===1){state.morph=0;state.zoom=1.8;state.morphing=false;}renderAll();}
    if(action==='morph-start'){state.morphing=false;state.morph=0;state.zoom=1.8;renderLive();}
    if(action==='morph-end'){state.morphing=false;state.morph=1;state.zoom=1;renderLive();}
    if(action==='proof-next'){
      state.proofCount=Math.min(5,state.proofCount+1);state.focus=proof[state.path][state.proofCount-1].focus;
      if(state.path==='transform'&&['distance','triangle'].includes(state.focus)){state.morph=0;state.zoom=1.8;state.morphing=false;}
      renderAll();$('sideContent').scrollTop=$('sideContent').scrollHeight;
    }
    if(action==='migration'){state.migration=true;state.locked=false;renderAll();toast('方向保持不变。现在可以平移弦了。');}
    if(action==='migration-answer'){state.migrationAnswer=!state.migrationAnswer;renderSide();}
    const choice=e.target.closest('[data-choice]')?.dataset.choice;
    if(choice){state.choice=choice;renderSide();}
    const path=e.target.closest('[data-path]')?.dataset.path;
    if(path){state.path=path;state.proofCount=1;state.focus=proof[path][0].focus;state.morph=0;state.zoom=path==='transform'?1.8:1;stopMotion();renderAll();}
    const card=e.target.closest('[data-proof]');
    if(card){state.focus=proof[state.path][+card.dataset.proof].focus;if(state.path==='transform'&&['distance','triangle'].includes(state.focus)){state.morph=0;state.zoom=1.8;state.morphing=false;}renderAll();}
    const special=e.target.closest('[data-special]')?.dataset.special;
    if(special){
      stopMotion();
      if(special==='horizontal')state.theta=0;
      if(special==='vertical')state.theta=90;
      if(special==='radius'){state.theta=Math.atan(2/Math.sqrt(5))*180/Math.PI;state.rho=ROOT_HALF;}
      if(special==='center'){state.locked=false;state.rho=0;}
      if(special==='tangent'){state.locked=false;state.rho=1;}
      if(special==='regular'){state.theta=31;state.rho=state.locked?ROOT_HALF:.35;}
      renderAll();
    }
  });
  $('sideContent').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-proof]')){e.preventDefault();e.target.click();}});
  const graph=$('ellipseSvg');
  graph.addEventListener('pointerdown',e=>{
    const target=e.target.closest('[data-drag]');if(!target)return;
    if(target.dataset.drag==='move'&&state.locked)return;
    stopMotion();drag={kind:target.dataset.drag};graph.setPointerCapture(e.pointerId);e.preventDefault();
  });
  graph.addEventListener('pointermove',e=>{
    if(!drag)return;
    const box=graph.getBoundingClientRect(),map=graph._mapping;
    const p={x:(e.clientX-box.left-map.ox)/map.unit,y:-(e.clientY-box.top-map.oy)/map.unit};
    if(drag.kind==='move'){
      const rho=p.x/model.A*geometry.n.x+p.y/model.B*geometry.n.y;
      state.rho=Math.max(-.999,Math.min(.999,rho));
    }else{
      let theta=Math.atan2(p.y-geometry.ellipse.M.y,p.x-geometry.ellipse.M.x)*180/Math.PI;
      theta=(theta%180+180)%180;state.theta=theta;
    }
    if(state.trace&&Math.abs(sampleAngle-state.theta)>2){state.trails.push({...geometry.ellipse});state.trails=state.trails.slice(-22);sampleAngle=state.theta;}
    renderLive();
  });
  graph.addEventListener('pointerup',()=>drag=null);graph.addEventListener('pointercancel',()=>drag=null);graph.addEventListener('lostpointercapture',()=>drag=null);
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('请使用浏览器的全屏功能（F11）');}}
  $('fullBtn').onclick=fullscreen;
  document.addEventListener('fullscreenchange',()=>{$('fullBtn').textContent=document.fullscreenElement?'退出全屏 ↙':'全屏 ↗';});
  function modal(id){stopMotion();lastFocus=document.activeElement;$(id).classList.add('open');$(id).querySelector('[data-close]').focus();}
  function closeModal(){document.querySelectorAll('.overlay').forEach(el=>el.classList.remove('open'));lastFocus?.focus();}
  $('sourceBtn').onclick=()=>modal('sourceModal');$('teacherBtn').onclick=()=>modal('teacherModal');
  document.querySelectorAll('.overlay').forEach(el=>el.addEventListener('click',e=>{if(e.target===el||e.target.closest('[data-close]'))closeModal();}));
  document.addEventListener('keydown',e=>{
    const open=document.querySelector('.overlay.open');
    if(open){if(e.key==='Escape')closeModal();if(e.key==='Tab'){const nodes=[...open.querySelectorAll('button,[href],input,[tabindex="0"]')];const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}return;}
    if(e.target.matches('input,textarea,select,[contenteditable="true"]')||e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.key===' '&&e.target.matches('button,[role="button"]'))return;
    if(e.key==='ArrowRight'){e.preventDefault();setStage(Math.min(4,state.stage+1));}
    if(e.key==='ArrowLeft'){e.preventDefault();setStage(Math.max(0,state.stage-1));}
    if(e.key.toLowerCase()==='f')fullscreen();
    if(e.key.toLowerCase()==='r')resetStage();
    if(e.key===' '){e.preventDefault();stopMotion();renderAll();}
  });
  new ResizeObserver(()=>renderLive()).observe($('graphArea'));
  function frame(now){
    const dt=Math.min((now-(lastFrame||now))/1000,.05);lastFrame=now;
    let changed=false;
    if(state.sweep){state.theta=(state.theta+dt*15)%180;sweepDistance+=dt*15;changed=true;if(state.trace&&Math.abs(sampleAngle-state.theta)>3){state.trails.push({...geometry.ellipse});state.trails=state.trails.slice(-22);sampleAngle=state.theta;}if(sweepDistance>=180){state.sweep=false;renderSide();}}
    if(state.morphing){state.morph=Math.min(1,state.morph+dt/5);changed=true;if(state.morph>=1)state.morphing=false;}
    if(changed)renderLive();requestAnimationFrame(frame);
  }
  window.MathLab = { getState:()=>structuredClone(state), getGeometry:()=>model.geometry(state.theta,state.rho), setStage,
    inspect:()=>({geometry,transform:model.transform(geometry,state.morph),paired:$('graphArea').classList.contains('paired')}) };
  renderAll();requestAnimationFrame(frame);
})();
