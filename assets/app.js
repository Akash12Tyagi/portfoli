/* Akash Tyagi — UI, gate, scroll choreography and overlays.
   Talks to the WebGL hall (assets/hall.js) through window.AT_BUS and to sound through window.ATSound. */
(function () {
  'use strict';
  const D = window.AT, SND = window.ATSound;
  const html = document.documentElement;
  const STILL = html.classList.contains('is-still');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* hall screens: a showreel that cycles every project, then each featured project */
  const reel = { slug: null, name: 'Showreel', meta: '2026, seven projects', gl: D.featured.map((p) => p.gl[0]) };
  const screens = [reel, ...D.featured.map((p) => ({ slug: p.slug, name: p.name, meta: p.kind + ' · ' + p.year, gl: p.gl }))];

  /* ---------- bus ---------- */
  const BUS = window.AT_BUS = window.AT_BUS || {};
  Object.assign(BUS, {
    still: STILL, hallP: 0, hallVisible: true, entered: false, mouse: { x: 0, y: 0 }, screens,
    tabEl: $('#hallTab'), canvas: $('#gl'),
    onActive: setActive, openScreen: (i) => openScreen(i), onHover: setCursor,
    setProgress, onReady: gateReady, noGL
  });

  /* ---------- clock ---------- */
  (function clock() {
    const el = $('#clock');
    const f = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    const t = () => { try { el.textContent = 'Punjab ' + f.format(new Date()) + ' IST'; } catch (e) {} };
    t(); setInterval(t, 20000);
  })();

  /* ---------- sound + motion toggles ---------- */
  function syncSnd(v) {
    $$('.snd').forEach((b) => { b.setAttribute('aria-pressed', String(v)); $('.snd__t', b).textContent = v ? 'Sound on' : 'Sound off'; });
    const cta = v ? 'CLICK TO TUNE IN' : 'CLICK TO ENTER';
    const c = $('#dialCta'); if (c) c.textContent = cta;
    if (ready) $('#gateLoad').innerHTML = v ? 'Click to tune in' : 'Click to enter';
  }
  window.ATSoundChanged = syncSnd;
  $$('.snd').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); SND.set(!SND.on); }));
  const mBtn = $('#motionBtn');
  mBtn.textContent = STILL ? 'Motion off' : 'Motion on';
  mBtn.addEventListener('click', () => {
    try { localStorage.setItem('at-motion', STILL ? 'on' : 'off'); } catch (e) {}
    const u = new URL(location.href); u.searchParams.delete('still'); u.hash = ''; location.replace(u.toString());
  });
  $('#replay').addEventListener('click', () => { window.scrollTo(0, 0); const u = new URL(location.href); u.hash = ''; location.replace(u.toString()); });

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!STILL && window.Lenis) {
    try {
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
      if (hasGsap) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
      else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
    } catch (e) { lenis = null; }
  }
  BUS.lenis = lenis;
  const ease4 = (t) => 1 - Math.pow(1 - t, 4);
  function scrollToY(y, d = 1.4) { if (lenis) lenis.scrollTo(y, { duration: d, easing: ease4 }); else window.scrollTo({ top: y, behavior: STILL ? 'auto' : 'smooth' }); }
  function scrollToEl(h) {
    if (h === '#top') return scrollToY(0, 1.8);
    const el = $(h); if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.6, easing: ease4 }); else el.scrollIntoView({ behavior: STILL ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const h = a.getAttribute('href'); if (h.length < 2) return;
    e.preventDefault(); scrollToEl(h);
  });

  function split(el) {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((p) => `<span class="ln"><span>${p.trim()}</span></span>`).join('');
    return $$('.ln > span', el);
  }

  /* =====================================================================
     GATE — radial panes of real work around a tuning dial
     ===================================================================== */
  const gate = $('#gate'), panesEl = $('#panes'), lines = $('#gateLines'), hit = $('#gateHit');
  const WORDS = D.words, NW = WORDS.length, STEP = 360 / NW;
  const paneImgs = ['rosso-0', 'cafe-0', 'lusso-0', 'cafe-2', 'onfinity-0', 'uniques-0', 'skillcures-1', 'cricketlive-0', 'rosso-3', 'cafe-3', 'lusso-2', 'onfinity-1'].map((n) => 'assets/p/gl/' + n + '.webp');
  const panes = WORDS.map((w, i) => {
    const d = document.createElement('div'); d.className = 'pane';
    const im = document.createElement('i'); im.style.backgroundImage = `url("${paneImgs[i % paneImgs.length]}")`;
    d.appendChild(im); panesEl.appendChild(d); return d;
  });
  const angOf = (i) => -90 + i * STEP; // word i sits at this angle (degrees, 0 = right)
  function layoutGate() {
    const W = innerWidth, H = innerHeight, cx = W / 2, cy = H / 2, R = Math.hypot(W, H);
    const rIn = Math.min(W, H) * (W < 700 ? .47 : .4);
    let svg = '';
    panes.forEach((p, i) => {
      const a0 = (angOf(i) - STEP / 2) * Math.PI / 180, a1 = (angOf(i) + STEP / 2) * Math.PI / 180, am = angOf(i) * Math.PI / 180;
      const pt = (a) => `${(cx + Math.cos(a) * R).toFixed(1)}px ${(cy + Math.sin(a) * R).toFixed(1)}px`;
      p.style.clipPath = `polygon(${cx}px ${cy}px, ${pt(a0)}, ${pt(am)}, ${pt(a1)})`;
      p.dataset.ax = Math.cos(am); p.dataset.ay = Math.sin(am);
      svg += `<line x1="${cx + Math.cos(a0) * rIn}" y1="${cy + Math.sin(a0) * rIn}" x2="${cx + Math.cos(a0) * R}" y2="${cy + Math.sin(a0) * R}"/>`;
    });
    svg += `<circle cx="${cx}" cy="${cy}" r="${rIn}"/>`;
    lines.setAttribute('viewBox', `0 0 ${W} ${H}`); lines.innerHTML = svg;
  }
  layoutGate(); addEventListener('resize', layoutGate);

  // dial: ticks and words around the ring
  (function dial() {
    let t = '';
    for (let i = 0; i < 144; i++) {
      const a = (i / 144) * Math.PI * 2, maj = i % 12 === 0;
      const r1 = 392, r2 = maj ? 414 : 404;
      t += `<line class="${maj ? 'maj' : ''}" x1="${500 + Math.cos(a) * r1}" y1="${500 + Math.sin(a) * r1}" x2="${500 + Math.cos(a) * r2}" y2="${500 + Math.sin(a) * r2}"/>`;
    }
    $('#dialTicks').innerHTML = t;
    $('#dialWords').innerHTML = WORDS.map((w, i) => {
      const a = angOf(i), rad = a * Math.PI / 180, r = 452;
      const x = 500 + Math.cos(rad) * r, y = 500 + Math.sin(rad) * r;
      let rot = a + 90; if (a > 0 && a < 180) rot += 180; // keep lower words readable
      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${rot} ${x} ${y})">${w}</text>`;
    }).join('');
  })();
  let shownP = 0, ready = false, entered = false;
  const wordEls = $$('#dialWords text'), dot = $('#dialDot');
  let tuned = -1, dotAng = 0, gateMx = 0, gateMy = 0, lastMove = 0;
  function tune(i, fromUser) {
    if (i === tuned) return; tuned = i;
    panes.forEach((p, k) => p.classList.toggle('on', k === i));
    wordEls.forEach((w, k) => w.classList.toggle('on', k === i));
    // shortest rotation to the new word
    const target = angOf(i) + 90; let delta = ((target - dotAng) % 360 + 540) % 360 - 180;
    dotAng += delta;
    if (hasGsap && !STILL) gsap.to(dot, { rotation: dotAng, svgOrigin: '500 500', duration: .7, ease: 'expo.out' });
    else dot.setAttribute('transform', `rotate(${dotAng} 500 500)`);
    if (fromUser && entered === false && SND.on) SND.tick(1 + (i % 3) * .08);
  }
  tune(0);
  gate.addEventListener('pointermove', (e) => {
    const cx = innerWidth / 2, cy = innerHeight / 2;
    gateMx = (e.clientX - cx) / cx; gateMy = (e.clientY - cy) / cy; lastMove = performance.now();
    const a = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
    const i = ((Math.round((a + 90) / STEP) % NW) + NW) % NW;
    tune(i, true);
  });
  // idle drift: keep tuning slowly when nobody is pointing
  const idle = setInterval(() => { if (entered) return clearInterval(idle); if (performance.now() - lastMove > 2600) tune((tuned + 1) % NW); }, 1700);
  if (hasGsap && !STILL) {
    gsap.ticker.add(() => {
      if (entered) return;
      panes.forEach((p) => {
        const im = p.firstChild, ax = +p.dataset.ax, ay = +p.dataset.ay;
        const pull = p.classList.contains('on') ? 14 : 0;
        im.style.transform = `translate(${(gateMx * -18 + ax * pull).toFixed(1)}px, ${(gateMy * -18 + ay * pull).toFixed(1)}px) scale(1.02)`;
      });
    });
  }

  // loading
  const loadC = $('#dialLoad'), pct = $('#gatePct');
  function setProgress(p) {
    shownP = Math.max(shownP, Math.min(1, p));
    const v = Math.round(shownP * 100);
    if (pct) pct.textContent = String(v).padStart(3, '0');
    if (loadC) loadC.style.strokeDasharray = `${v} 100`;
  }
  function gateReady() {
    if (ready) return; ready = true; setProgress(1);
    hit.disabled = false; gate.classList.add('is-ready');
    $('#gateLoad').innerHTML = SND.on ? 'Click to tune in' : 'Click to enter';
    if (hasGsap) gsap.to(loadC, { opacity: 0, duration: .8, delay: .4 });
  }
  hit.disabled = true;
  syncSnd(SND.on);
  if (!STILL) {
    document.body.classList.add('gate-on');
    if (lenis) lenis.stop();
    setTimeout(() => { if (!ready) gateReady(); }, 10000);
  }
  function enter() {
    if (entered || STILL || !ready) return; entered = true;
    BUS.entered = true;
    SND.start(); if (SND.on) setTimeout(() => SND.boom(), 60);
    if (BUS.enter) BUS.enter();
    if (!hasGsap) { gate.classList.add('is-gone'); document.body.classList.remove('gate-on'); if (lenis) lenis.start(); return; }
    const W = innerWidth, H = innerHeight;
    const tl = gsap.timeline();
    const order = panes.map((p, k) => ({ p, d: Math.min((k - tuned + NW) % NW, (tuned - k + NW) % NW) }));
    order.forEach(({ p, d }) => {
      tl.to(p, { x: +p.dataset.ax * W * .55, y: +p.dataset.ay * H * .55, opacity: 0, duration: 1.3, ease: 'expo.inOut' }, d * .045);
    });
    tl.to('#gateLines', { opacity: 0, duration: .6 }, 0)
      .to('.dial', { scale: 1.6, opacity: 0, duration: 1.4, ease: 'expo.inOut' }, 0)
      .to('.gate__core', { scale: .92, opacity: 0, duration: .8, ease: 'power3.in' }, 0)
      .to('.gate__foot', { opacity: 0, y: 20, duration: .5 }, 0)
      .to(gate, { backgroundColor: 'rgba(8,9,11,0)', duration: 1.2, ease: 'power2.inOut' }, .25)
      .add(() => {
        gate.classList.add('is-gone'); document.body.classList.remove('gate-on');
        if (lenis) lenis.start(); ScrollTrigger.refresh();
      }, 1.45)
      .fromTo('#hallCap > *', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, stagger: .08, ease: 'expo.out' }, 1.5);
  }
  hit.addEventListener('click', enter);
  addEventListener('keydown', (e) => { if (!entered && ready && document.body.classList.contains('gate-on') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); enter(); } });

  function noGL() {
    html.classList.add('no-gl');
    document.body.classList.remove('gate-on');
    if (lenis) lenis.start();
    buildStill();
    if (hasGsap) ScrollTrigger.refresh();
  }
  addEventListener('pointermove', (e) => { BUS.mouse.x = (e.clientX / innerWidth) * 2 - 1; BUS.mouse.y = -(e.clientY / innerHeight) * 2 + 1; }, { passive: true });

  /* =====================================================================
     HALL
     ===================================================================== */
  const NS = screens.length;
  const dots = $('#hallDots'), tabName = $('#tabName'), tabMeta = $('#tabMeta'), count = $('#hallCount');
  screens.forEach((s, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', s.name);
    b.addEventListener('click', () => goHall(i)); dots.appendChild(b);
  });
  let hallST = null, active = -2;
  function setActive(i) {
    if (i === active) return;
    const first = active === -2; active = i;
    $$('button', dots).forEach((d, k) => d.classList.toggle('on', k === i));
    if (i < 0) return;
    const s = screens[i];
    count.innerHTML = i === 0 ? '' : `<b>${String(i).padStart(2, '0')}</b> / ${String(NS - 1).padStart(2, '0')}`;
    if (!first && BUS.entered) SND.whoosh(.9, true);
    const apply = () => { tabName.textContent = s.name; tabMeta.textContent = s.meta; };
    if (hasGsap && !first) gsap.timeline().to('#tabBtn', { opacity: 0, x: -8, duration: .16, ease: 'power2.in' }).add(apply).to('#tabBtn', { opacity: 1, x: 0, duration: .5, ease: 'expo.out' });
    else apply();
  }
  function goHall(i) {
    if (!hallST) return;
    const segs = NS; // stops = screens + end wall
    scrollToY(hallST.start + (hallST.end - hallST.start) * (i / segs) + 2);
  }
  function openScreen(i) { if (i === 0) goHall(1); else openCase(screens[i].slug); }
  $('#tabBtn').addEventListener('click', () => { if (active >= 0) openScreen(active); });
  $('#tabGo').addEventListener('click', () => { if (active >= 0) openScreen(active); });
  if (!STILL && hasGsap) {
    hallST = ScrollTrigger.create({
      trigger: '.hall', start: 'top top', end: () => '+=' + (innerHeight * (NS + .4)),
      pin: '.hall__pin', pinSpacing: true, anticipatePin: 1,
      onUpdate: (st) => { BUS.hallP = st.progress; }
    });
    ScrollTrigger.create({ trigger: '.hall', start: 'top top', end: () => '+=' + (innerHeight * (NS + 1.4)),
      onLeave: () => { BUS.hallVisible = false; }, onEnterBack: () => { BUS.hallVisible = true; } });
    gsap.to('#hallCap', { opacity: 0, y: -30, ease: 'none', scrollTrigger: { trigger: '.hall', start: 'top top', end: () => '+=' + innerHeight * .5, scrub: true } });
  }
  function buildStill() {
    const host = $('#hallStill'); if (host.childElementCount) return;
    const lead = $('.hall__lead'); if (lead) lead.textContent = 'I build real-time 3D, motion and the products behind them.';
    host.innerHTML = D.featured.map((p) => `<button class="still-card" type="button" data-case="${p.slug}">
      <span class="im"><img src="${p.img}" alt="${p.name}" loading="lazy" width="1600" height="1000"></span>
      <span><b>${p.name}</b> <span>${p.kind} · ${p.label}</span></span></button>`).join('');
  }
  if (STILL) buildStill();
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-case]'); if (b) { e.preventDefault(); openCase(b.dataset.case, b); } });

  /* cursor label for the canvas */
  const cur = $('#cur');
  let cx = 0, cy = 0, tx = 0, ty = 0;
  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  function setCursor(on, label) { cur.classList.toggle('on', !!on); if (label) cur.firstElementChild.textContent = label; }
  (function loop() { cx += (tx - cx) * .2; cy += (ty - cy) * .2; cur.style.translate = `${cx}px ${cy}px`; requestAnimationFrame(loop); })();

  /* =====================================================================
     WHAT I MAKE — pinned list, media cycles through example projects
     ===================================================================== */
  const mList = $('#makeList'), mFrame = $('#makeFrame'), mTab = $('#makeTab'), mGo = $('#makeGo');
  D.make.forEach((m, i) => {
    const li = document.createElement('li'); li.className = 'make__item' + (i === 0 ? ' on' : '');
    const ex = m.refs.map((s) => `<button type="button" data-case="${s}">${D.by[s].name}</button>`).join(', ');
    li.innerHTML = `<button class="make__b" type="button" aria-expanded="${i === 0}"><span class="make__n">0${i + 1}</span><span class="make__t">${m.k}</span></button>
      <div class="make__more"><div><p>${m.text}</p><p class="make__ex">${m.studio ? 'With the studio: ' : 'See '}${ex}</p></div></div>`;
    mList.appendChild(li);
  });
  const mItems = $$('.make__item');
  let mIdx = -1, mShow = { slug: null, k: 0 }, mTimer = null, makeST = null;
  function mFramesOf(i) {
    const m = D.make[i]; const out = [];
    m.refs.forEach((s) => { const p = D.by[s]; (p.frames.length ? p.frames.slice(0, 3) : []).forEach((f) => out.push({ s, f })); });
    if (m.studio) D.studio.slice(0, 4).forEach((s) => out.push({ s: null, f: s.img, name: s.name, label: s.label }));
    return out.length ? out : [{ s: m.refs[0], f: null }];
  }
  function showFrame(fr, dir = 1) {
    const p = fr.s ? D.by[fr.s] : null;
    mShow = fr;
    $('b', mTab).textContent = p ? p.name : fr.name; $('span', mTab).textContent = p ? p.kind : (fr.label || 'BE YOUR OWN');
    mGo.hidden = !p; mTab.dataset.case = p ? p.slug : '';
    if (!fr.f) return;
    const im = new Image(); im.src = fr.f; im.alt = (p ? p.name : fr.name) + ' frame'; im.decoding = 'async';
    mFrame.appendChild(im);
    if (hasGsap && !STILL) {
      gsap.fromTo(im, { clipPath: dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', scale: 1.08 },
        { clipPath: 'inset(0 0% 0 0%)', scale: 1, duration: 1.1, ease: 'expo.inOut', onComplete: () => { while (mFrame.children.length > 1) mFrame.removeChild(mFrame.firstChild); } });
    } else while (mFrame.children.length > 1) mFrame.removeChild(mFrame.firstChild);
  }
  function setMake(i) {
    if (i === mIdx) return;
    const prev = mIdx; mIdx = i;
    mItems.forEach((it, k) => { it.classList.toggle('on', k === i); $('.make__b', it).setAttribute('aria-expanded', String(k === i)); });
    const frs = mFramesOf(i); let k = 0;
    showFrame(frs[0], i >= prev ? 1 : -1);
    if (prev >= 0 && BUS.entered) SND.tick(.8);
    clearInterval(mTimer);
    if (!STILL && frs.length > 1) mTimer = setInterval(() => { k = (k + 1) % frs.length; showFrame(frs[k], 1); }, 2600);
  }
  setMake(0);
  mTab.addEventListener('click', () => { if (mTab.dataset.case) openCase(mTab.dataset.case, mTab); });
  mGo.addEventListener('click', () => { if (mTab.dataset.case) openCase(mTab.dataset.case, mGo); });
  mItems.forEach((it, i) => $('.make__b', it).addEventListener('click', () => {
    if (makeST && innerWidth > 900) scrollToY(makeST.start + (makeST.end - makeST.start) * ((i + .5) / D.make.length));
    else setMake(i);
  }));
  if (!STILL && hasGsap) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      makeST = ScrollTrigger.create({ trigger: '.make', start: 'top top', end: () => '+=' + innerHeight * 3.2, pin: '.make__pin', pinSpacing: true,
        onUpdate: (st) => setMake(Math.min(D.make.length - 1, Math.floor(st.progress * D.make.length * .999))) });
      return () => { makeST = null; };
    });
    const media = $('#makeMedia');
    media.addEventListener('pointermove', (e) => {
      const r = media.getBoundingClientRect();
      gsap.to(mFrame, { rotateY: ((e.clientX - r.left) / r.width - .5) * 6, rotateX: -((e.clientY - r.top) / r.height - .5) * 6, transformPerspective: 1200, duration: .8, ease: 'power3.out' });
    });
    media.addEventListener('pointerleave', () => gsap.to(mFrame, { rotateX: 0, rotateY: 0, duration: 1, ease: 'expo.out' }));
  }

  /* =====================================================================
     INDEX
     ===================================================================== */
  const groupOf = (p) => p.kind === 'Product platform' ? 'Platforms' : '3D and motion';
  const rows = $('#rows'), chips = $('#chips');
  const ARR = '<svg class="ar" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  let n = 0;
  rows.innerHTML = D.projects.map((p) => `<li class="row" data-g="${groupOf(p)}"><button type="button" data-case="${p.slug}" ${p.thumb ? `data-thumb="${p.thumb}"` : ''}>
      <span class="n">${String(++n).padStart(2, '0')}</span><span class="nm">${p.name}</span><span class="sc">${p.kind} <i>· ${p.label}</i></span><span class="yr">${p.year}</span>${ARR}</button></li>`).join('')
    + D.studio.map((s) => `<li class="row studio" data-g="Studio"><a href="${s.url}" target="_blank" rel="noopener" data-thumb="${s.thumb}">
      <span class="n">${String(++n).padStart(2, '0')}</span><span class="nm">${s.name}</span><span class="sc">Studio · <i>${s.label}</i></span><span class="yr">BYO</span>${ARR}</a></li>`).join('');
  const groups = ['All', '3D and motion', 'Platforms', 'Studio'];
  const cnt = (g) => g === 'All' ? n : $$('.row', rows).filter((r) => r.dataset.g === g).length;
  chips.innerHTML = groups.map((g) => `<button class="chip" type="button" aria-pressed="${g === 'All'}" data-g="${g}">${g}<sup>${cnt(g)}</sup></button>`).join('');
  chips.addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    $$('.chip', chips).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const g = b.dataset.g, list = $$('.row', rows);
    list.forEach((r) => { r.hidden = !(g === 'All' || r.dataset.g === g); });
    if (hasGsap && !STILL) gsap.fromTo(list.filter((r) => !r.hidden), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .6, stagger: .03, ease: 'expo.out', onComplete: () => ScrollTrigger.refresh() });
    else if (hasGsap) ScrollTrigger.refresh();
  });
  const peek = $('#peek'), peekIn = $('#peekIn');
  if (!STILL && hasGsap && fine) {
    gsap.set(peek, { scale: .8 });
    let px = 0, py = 0, vx = 0, lastX = 0, shown = false, curSrc = '', qx = 0, qy = 0;
    addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; }, { passive: true });
    const setX = gsap.quickSetter(peek, 'x', 'px'), setY = gsap.quickSetter(peek, 'y', 'px'), setR = gsap.quickSetter(peek, 'rotation', 'deg');
    gsap.ticker.add(() => {
      qx += (px - qx) * .14; qy += (py - qy) * .14; vx += ((px - lastX) - vx) * .1; lastX = px;
      const w = peek.offsetWidth, h = peek.offsetHeight;
      setX(Math.min(qx + 28, innerWidth - w - 16)); setY(Math.max(16, Math.min(qy - h / 2, innerHeight - h - 16))); setR(Math.max(-8, Math.min(8, vx * .25)));
    });
    rows.addEventListener('pointerover', (e) => {
      const b = e.target.closest('[data-thumb]');
      if (!b) { const any = e.target.closest('.row'); if (any && shown) { shown = false; gsap.to(peek, { opacity: 0, scale: .8, duration: .3 }); } return; }
      const src = b.dataset.thumb;
      if (src !== curSrc) {
        curSrc = src; const im = new Image(); im.src = src; im.alt = ''; peekIn.appendChild(im);
        gsap.fromTo(im, { clipPath: 'inset(0 0 100% 0)', scale: 1.15 }, { clipPath: 'inset(0 0 0% 0)', scale: 1, duration: .7, ease: 'expo.out', onComplete: () => { while (peekIn.children.length > 1) peekIn.removeChild(peekIn.firstChild); } });
      }
      if (!shown) { shown = true; gsap.to(peek, { opacity: 1, scale: 1, duration: .5, ease: 'expo.out' }); }
    });
    rows.addEventListener('pointerleave', () => { shown = false; gsap.to(peek, { opacity: 0, scale: .8, duration: .35 }); });
  }

  /* =====================================================================
     TIMELINE — pinned; a dot travels the rail, the year rolls over
     ===================================================================== */
  const T = D.timeline, tlCard = $('#tlCard'), tlYear = $('#tlYear'), tlDot = $('#tlDot');
  let tIdx = -1;
  function setTL(i, instant) {
    if (i === tIdx) return; const dir = i > tIdx ? 1 : -1; tIdx = i;
    const t = T[i];
    $('#tlStep').innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b>/${String(T.length).padStart(2, '0')} <span>${t.t}</span>`;
    const card = `<span class="k">${t.y === 'Oct' || t.y === 'Nov' ? t.y + ' 2026' : t.y}</span><h3>${t.t}</h3><p>${t.d}</p><ul>${t.tags.map((x) => `<li>${x}</li>`).join('')}</ul>`;
    const yr = `<span>${t.y}</span>`;
    if (hasGsap && !STILL && !instant) {
      gsap.timeline().to(tlCard.children, { opacity: 0, y: -16 * dir, duration: .25, stagger: .03, ease: 'power2.in' })
        .add(() => { tlCard.innerHTML = card; })
        .fromTo(() => tlCard.children, { opacity: 0, y: 24 * dir }, { opacity: 1, y: 0, duration: .8, stagger: .06, ease: 'expo.out' });
      const old = tlYear.firstElementChild;
      tlYear.insertAdjacentHTML('beforeend', yr); const nu = tlYear.lastElementChild;
      gsap.set(nu, { position: 'absolute', top: 0, right: 0 });
      gsap.fromTo(nu, { yPercent: 100 * dir }, { yPercent: 0, duration: .9, ease: 'expo.out', onComplete: () => { gsap.set(nu, { position: 'relative', clearProps: 'top,right' }); } });
      if (old) gsap.to(old, { yPercent: -100 * dir, duration: .9, ease: 'expo.out', onComplete: () => old.remove() });
      if (BUS.entered) SND.tick(.7);
    } else { tlCard.innerHTML = card; tlYear.innerHTML = yr; }
  }
  setTL(0, true);
  if (!STILL && hasGsap) {
    ScrollTrigger.create({
      trigger: '.tl', start: 'top top', end: () => '+=' + innerHeight * 3, pin: '.tl__pin', pinSpacing: true,
      onUpdate: (st) => {
        const p = st.progress; tlDot.style.top = (p * 100).toFixed(2) + '%';
        setTL(Math.min(T.length - 1, Math.floor(p * T.length * .999)));
      }
    });
  } else tlDot.style.top = '0%';

  /* =====================================================================
     REVEALS + NAV
     ===================================================================== */
  if (!STILL && hasGsap) {
    $$('[data-split]').forEach((el) => {
      const ls = split(el);
      gsap.from(ls, { yPercent: 110, duration: 1.3, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });
    gsap.from('.outro__name > span', { yPercent: 50, opacity: 0, duration: 1.4, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.outro', start: 'top 70%', once: true } });
    ScrollTrigger.batch('.row, .facts > div, .outro__lead, .outro__cta, .outro__foot, .index__meta > *', {
      start: 'top 92%', once: true, onEnter: (els) => gsap.from(els, { opacity: 0, y: 26, duration: 1, stagger: .045, ease: 'expo.out', overwrite: true })
    });
    [['#work', '.hall'], ['#make', '.make'], ['#index', '.index'], ['#about', '.tl'], ['#contact', '.outro']].forEach(([h, s]) => {
      ScrollTrigger.create({ trigger: s, start: 'top 50%', end: 'bottom 50%', onToggle: (st) => { const a = $(`.bar__nav a[href="${h}"]`); if (a) a.classList.toggle('on', st.isActive); } });
    });
  } else $$('[data-split]').forEach(split);

  /* =====================================================================
     PROJECT OVERLAY
     ===================================================================== */
  const cs = $('#case'), csIn = $('.case__in', cs);
  let lastFocus = null, csOpen = false;
  function openCase(slug, fromEl) {
    const p = D.by[slug]; if (!p) return;
    lastFocus = document.activeElement;
    $('#caseKicker').innerHTML = `<span class="pt"></span>${p.kind} · ${p.label}`;
    $('#caseName').textContent = p.name;
    $('#caseLine').textContent = p.line;
    $('#caseWhat').textContent = p.what; $('#caseHow').textContent = p.how;
    $('#caseMeta').innerHTML = [['Year', p.year], ['Type', p.kind], ['Built with', p.stack]].map((m) => `<div${m[0] === 'Built with' ? ' style="grid-column:1/-1"' : ''}><dt>${m[0]}</dt><dd>${m[1]}</dd></div>`).join('');
    $('#caseNote').textContent = p.note || ''; $('#caseNote').hidden = !p.note;
    const L = [];
    if (p.live) L.push(`<a class="btn btn--o" href="${p.live}" target="_blank" rel="noopener"><span class="pt"></span><span class="roll"><span>Visit the live site</span><span aria-hidden="true">${p.host} ↗</span></span></a>`);
    if (p.code) L.push(`<a class="btn ${p.live ? 'btn--g' : 'btn--o'}" href="${p.code}" target="_blank" rel="noopener">${p.live ? '' : '<span class="pt"></span>'}<span class="roll"><span>View the code</span><span aria-hidden="true">github.com/Akash12Tyagi</span></span></a>`);
    $('#caseLinks').innerHTML = L.join('');
    const main = $('#caseMain'), th = $('#caseThumbs');
    if (p.frames.length) {
      main.innerHTML = `<img src="${p.frames[0]}" alt="${p.name}, frame 1">`;
      th.innerHTML = p.frames.length > 1 ? p.frames.map((g, k) => `<button type="button" aria-label="Show frame ${k + 1}" aria-current="${k === 0}"><img src="${g}" alt=""></button>`).join('') : '';
    } else { main.innerHTML = `<div class="ph">${p.name}</div>`; th.innerHTML = ''; }
    cs.hidden = false; csOpen = true; csIn.scrollTop = 0;
    if (lenis) lenis.stop(); BUS.paused = true;
    if (BUS.entered) SND.whoosh(.7, false);
    if (hasGsap && !STILL) {
      const r = fromEl && fromEl.getBoundingClientRect ? fromEl.getBoundingClientRect() : null;
      const from = r && r.width ? `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 20px)` : 'inset(50% 50% 50% 50% round 20px)';
      gsap.fromTo(cs, { clipPath: from }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: .9, ease: 'expo.inOut' });
      gsap.fromTo('.case__txt > *', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, stagger: .05, ease: 'expo.out', delay: .45 });
      gsap.fromTo('#caseMain img', { scale: 1.15 }, { scale: 1, duration: 1.6, ease: 'expo.out', delay: .2 });
    }
    setTimeout(() => $('#caseX').focus(), 50);
  }
  function closeCase() {
    if (!csOpen) return; csOpen = false;
    const done = () => { cs.hidden = true; if (lenis) lenis.start(); BUS.paused = false; if (lastFocus && lastFocus.focus) lastFocus.focus(); };
    if (hasGsap && !STILL) gsap.to(cs, { clipPath: 'inset(0px 0px 100% 0px round 0px)', duration: .7, ease: 'expo.inOut', onComplete: done }); else done();
  }
  BUS.openCase = openCase;
  $('#caseX').addEventListener('click', closeCase);
  addEventListener('keydown', (e) => {
    if (!csOpen) return;
    if (e.key === 'Escape') closeCase();
    if (e.key === 'Tab') {
      const f = $$('button, a[href]', cs).filter((x) => x.offsetParent !== null); if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  $('#caseThumbs').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const src = $('img', b).getAttribute('src');
    $$('button', b.parentElement).forEach((x) => x.setAttribute('aria-current', String(x === b)));
    const main = $('#caseMain'), im = new Image(); im.src = src; im.alt = ''; main.appendChild(im);
    if (hasGsap && !STILL) gsap.fromTo(im, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: .8, ease: 'expo.inOut', onComplete: () => { while (main.children.length > 1) main.removeChild(main.firstChild); } });
    else while (main.children.length > 1) main.removeChild(main.firstChild);
  });

  if (hasGsap) addEventListener('load', () => ScrollTrigger.refresh());
})();
