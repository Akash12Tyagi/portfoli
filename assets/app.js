/* BE YOUR OWN — UI, scroll choreography and overlays.
   Talks to the WebGL hall (assets/hall.js) through window.BYO_BUS. */
(function () {
  'use strict';
  const D = window.BYO;
  const html = document.documentElement;
  const STILL = html.classList.contains('is-still');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- shared bus with hall.js ---------- */
  const BUS = window.BYO_BUS = window.BYO_BUS || {};
  Object.assign(BUS, {
    still: STILL, hallP: 0, hallVisible: true, entered: false, mouse: { x: 0, y: 0 },
    tabEl: $('#hallTab'), canvas: $('#gl'),
    onActive: setActive, openCase: (i) => openCase(D.featured[i].slug), onHover: setCursor,
    setProgress, onReady: gateReady, noGL
  });

  /* ---------- clock ---------- */
  (function clock() {
    const el = $('#clock');
    const f = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    const t = () => { try { el.textContent = 'Banur ' + f.format(new Date()) + ' IST'; } catch (e) {} };
    t(); setInterval(t, 20000);
  })();

  /* ---------- motion toggle ---------- */
  const mBtn = $('#motionBtn');
  mBtn.setAttribute('aria-pressed', String(!STILL));
  $('.mo__t', mBtn).textContent = STILL ? 'Motion off' : 'Motion on';
  mBtn.addEventListener('click', () => {
    try { localStorage.setItem('byo-motion', STILL ? 'on' : 'off'); } catch (e) {}
    const u = new URL(location.href); u.searchParams.delete('still'); location.replace(u.toString());
  });

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!STILL && window.Lenis) {
    try {
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
      if (hasGsap) {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
      } else {
        const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
      }
    } catch (e) { lenis = null; }
  }
  BUS.lenis = lenis;
  function scrollToEl(target, offset = 0) {
    const el = typeof target === 'string' ? (target === '#top' ? null : $(target)) : target;
    if (lenis) lenis.scrollTo(el || 0, { offset, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + offset, behavior: STILL ? 'auto' : 'smooth' });
    else window.scrollTo({ top: 0, behavior: STILL ? 'auto' : 'smooth' });
  }
  function scrollToY(y) { if (lenis) lenis.scrollTo(y, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) }); else window.scrollTo({ top: y, behavior: STILL ? 'auto' : 'smooth' }); }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const h = a.getAttribute('href'); if (h.length < 2) return;
    e.preventDefault(); scrollToEl(h);
  });

  /* ---------- text splitting ---------- */
  function split(el) {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((p) => `<span class="ln"><span>${p.trim()}</span></span>`).join('');
    return $$('.ln > span', el);
  }

  /* ---------- gate ---------- */
  const gate = $('#gate'), gateGo = $('#gateGo'), pct = $('#gatePct'), prog = $('#ringProg');
  const ticks = $('#ringTicks');
  if (ticks) {
    let s = '';
    for (let i = 0; i < 120; i++) {
      const a = (i / 120) * Math.PI * 2, maj = i % 10 === 0;
      const r1 = 446, r2 = maj ? 470 : 458;
      s += `<line class="${maj ? 'maj' : ''}" x1="${500 + Math.cos(a) * r1}" y1="${500 + Math.sin(a) * r1}" x2="${500 + Math.cos(a) * r2}" y2="${500 + Math.sin(a) * r2}"/>`;
    }
    ticks.innerHTML = s;
  }
  let shownP = 0, ready = false, entering = false;
  function setProgress(p) {
    shownP = Math.max(shownP, Math.min(1, p));
    const v = Math.round(shownP * 100);
    if (pct) pct.textContent = String(v).padStart(3, '0');
    if (prog) prog.style.strokeDasharray = `${v} 100`;
  }
  function gateReady() {
    if (ready) return; ready = true; setProgress(1);
    gate.classList.add('is-ready');
    gateGo.disabled = false;
    $('#gateLabel').innerHTML = 'Click to enter';
  }
  const heroLines = split($('.hall__h'));
  if (!STILL) {
    document.body.classList.add('gate-on');
    if (lenis) lenis.stop();
    if (hasGsap) gsap.set([heroLines, '.hall__intro .eyebrow', '.hall__lead', '.hall__hint'], { opacity: 0 });
    // fail-safe: never trap a visitor behind the gate
    setTimeout(() => { if (!ready) gateReady(); }, 9000);
  }
  function enter() {
    if (entering || STILL) return; entering = true;
    BUS.entered = true;
    if (BUS.enter) BUS.enter();
    if (!hasGsap) { gate.classList.add('is-gone'); document.body.classList.remove('gate-on'); if (lenis) lenis.start(); return; }
    const tl = gsap.timeline({ defaults: { ease: 'expo.inOut' } });
    tl.to('.gate__ring', { scale: 1.9, opacity: 0, duration: 1.7 }, 0)
      .to('.gate__core,.gate__foot', { opacity: 0, y: -24, duration: .9, ease: 'power3.in' }, 0)
      .add(() => { gate.classList.add('is-gone'); document.body.classList.remove('gate-on'); if (lenis) lenis.start(); ScrollTrigger.refresh(); }, 1.1)
      .fromTo(heroLines, { yPercent: 110, opacity: 1 }, { yPercent: 0, duration: 1.4, stagger: .1, ease: 'expo.out' }, 1.15)
      .fromTo(['.hall__intro .eyebrow', '.hall__lead', '.hall__hint'], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, stagger: .08, ease: 'expo.out' }, 1.35);
    setTimeout(() => gateGo.blur(), 0);
  }
  gateGo.addEventListener('click', enter);
  gateGo.addEventListener('mouseenter', () => { BUS.irisHover = 1; });
  gateGo.addEventListener('mouseleave', () => { BUS.irisHover = 0; });
  addEventListener('keydown', (e) => { if (!entering && ready && (e.key === 'Enter' || e.key === ' ') && document.body.classList.contains('gate-on')) { e.preventDefault(); enter(); } });

  function noGL() {
    html.classList.add('no-gl');
    document.body.classList.remove('gate-on');
    if (lenis) lenis.start();
    if (hasGsap) gsap.set([heroLines, '.hall__intro .eyebrow', '.hall__lead', '.hall__hint'], { opacity: 1, clearProps: 'transform' });
    buildStill();
    if (hasGsap) ScrollTrigger.refresh();
  }

  /* ---------- pointer ---------- */
  addEventListener('pointermove', (e) => { BUS.mouse.x = (e.clientX / innerWidth) * 2 - 1; BUS.mouse.y = -(e.clientY / innerHeight) * 2 + 1; }, { passive: true });

  /* ---------- hall ---------- */
  const N = D.featured.length;
  const dots = $('#hallDots'), tabName = $('#tabName'), tabMeta = $('#tabMeta'), count = $('#hallCount');
  D.featured.forEach((c, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', c.name);
    b.addEventListener('click', () => goHall(i)); dots.appendChild(b);
  });
  let hallST = null, active = -2;
  function setActive(i) {
    if (i === active) return; active = i;
    const on = i >= 0;
    if (hasGsap) gsap.to([count, dots], { opacity: on ? 1 : 0, duration: .5 });
    $$('button', dots).forEach((d, k) => d.classList.toggle('on', k === i));
    if (!on) return;
    const c = D.featured[i];
    count.innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b> / ${String(N).padStart(2, '0')}`;
    if (hasGsap) {
      gsap.timeline().to('#tabBtn', { opacity: 0, x: -8, duration: .18, ease: 'power2.in' })
        .add(() => { tabName.textContent = c.name; tabMeta.textContent = c.sector + ' · ' + c.scope; })
        .to('#tabBtn', { opacity: 1, x: 0, duration: .5, ease: 'expo.out' });
    } else { tabName.textContent = c.name; tabMeta.textContent = c.sector + ' · ' + c.scope; }
  }
  function goHall(i) {
    if (!hallST) return;
    const stops = N + 1; // intro + screens
    const p = (i + 1) / stops;
    scrollToY(hallST.start + (hallST.end - hallST.start) * p + 2);
  }
  $('#tabBtn').addEventListener('click', () => { if (active >= 0) openCase(D.featured[active].slug); });
  $('#tabGo').addEventListener('click', () => { if (active >= 0) openCase(D.featured[active].slug); });

  if (!STILL && hasGsap) {
    hallST = ScrollTrigger.create({
      trigger: '.hall', start: 'top top', end: () => '+=' + (innerHeight * (N + 1.2)),
      pin: '.hall__pin', pinSpacing: true, anticipatePin: 1,
      onUpdate: (st) => { BUS.hallP = st.progress; },
      onToggle: (st) => { BUS.hallVisible = st.isActive || st.progress < 1; }
    });
    ScrollTrigger.create({ trigger: '.hall', start: 'top top', end: () => '+=' + (innerHeight * (N + 2.2)),
      onLeave: () => { BUS.hallVisible = false; }, onEnterBack: () => { BUS.hallVisible = true; } });
    gsap.to('#hallIntro', { opacity: 0, y: -60, ease: 'none',
      scrollTrigger: { trigger: '.hall', start: 'top top', end: () => '+=' + innerHeight * .55, scrub: true } });
  }
  function buildStill() {
    const host = $('#hallStill'); if (host.childElementCount) return;
    host.innerHTML = D.featured.map((c) => `<button class="still-card" type="button" data-case="${c.slug}">
      <span class="im"><img src="${c.img}" alt="${c.name} website" loading="lazy" width="1600" height="1000"></span>
      <span><b>${c.name}</b> <span>${c.sector} · ${c.scope}</span></span></button>`).join('');
  }
  if (STILL) buildStill();
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-case]'); if (b) openCase(b.dataset.case, b); });

  /* ---------- canvas cursor label ---------- */
  const cur = $('#cur');
  let cx = 0, cy = 0, tx = 0, ty = 0;
  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  function setCursor(on, label) { cur.classList.toggle('on', !!on); if (label) cur.firstElementChild.textContent = label; }
  (function loop() { cx += (tx - cx) * .2; cy += (ty - cy) * .2; cur.style.translate = `${cx}px ${cy}px`; requestAnimationFrame(loop); })();

  /* ---------- what we do ---------- */
  const doList = $('#doList'), frame = $('#doFrame'), doTab = $('#doTab'), doStep = $('#doStep');
  D.pillars.forEach((p, i) => {
    const li = document.createElement('li'); li.className = 'do__item' + (i === 0 ? ' on' : '');
    li.innerHTML = `<button class="do__b" type="button" aria-expanded="${i === 0}"><span class="do__n">0${i + 1}</span><span class="do__t">${p.k}</span></button>
      <div class="do__more"><div><p class="do__line">${p.line}</p><p class="do__text">${p.text}</p>
      <ul class="tags">${p.tags.map((t) => `<li>${t}</li>`).join('')}</ul>
      <button class="do__ref" type="button" data-case="${p.ref}">See ${p.refLabel} →</button></div></div>`;
    doList.appendChild(li);
    const img = new Image(); img.src = p.img; img.alt = p.refLabel; img.loading = i ? 'lazy' : 'eager'; img.decoding = 'async';
    img.style.opacity = i === 0 ? 1 : 0; frame.appendChild(img);
  });
  const items = $$('.do__item'), imgs = $$('img', frame);
  let pIdx = 0, doST = null;
  function setPillar(i, fromUser) {
    if (i === pIdx && !fromUser) return;
    const prev = pIdx; pIdx = i;
    items.forEach((it, k) => { it.classList.toggle('on', k === i); $('.do__b', it).setAttribute('aria-expanded', String(k === i)); });
    const p = D.pillars[i], c = D.bySlug[p.ref];
    doTab.innerHTML = `<b>${c.name}</b><span>${p.k}</span>`; doTab.dataset.case = p.ref;
    doStep.textContent = '0' + (i + 1);
    if (hasGsap && !STILL) {
      gsap.killTweensOf(imgs);
      imgs.forEach((im, k) => { if (k !== i && k !== prev) gsap.set(im, { opacity: 0 }); });
      gsap.set(imgs[i], { zIndex: 2 }); gsap.set(imgs[prev], { zIndex: 1 });
      gsap.fromTo(imgs[i], { opacity: 1, clipPath: i > prev ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)', scale: 1.08 },
        { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1.1, ease: 'expo.out', onComplete: () => { if (prev !== i) gsap.set(imgs[prev], { opacity: 0 }); } });
      gsap.fromTo(doStep, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .8, ease: 'expo.out' });
    } else { imgs.forEach((im, k) => { im.style.opacity = k === i ? 1 : 0; }); }
  }
  doTab.dataset.case = D.pillars[0].ref;
  items.forEach((it, i) => $('.do__b', it).addEventListener('click', () => {
    if (doST && doST.isActive !== undefined && innerWidth > 900) {
      scrollToY(doST.start + (doST.end - doST.start) * ((i + .5) / 4));
    } else setPillar(i, true);
  }));
  if (!STILL && hasGsap) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      doST = ScrollTrigger.create({
        trigger: '.do', start: 'top top', end: () => '+=' + innerHeight * 2.6, pin: '.do__pin', pinSpacing: true,
        onUpdate: (st) => setPillar(Math.min(3, Math.floor(st.progress * 4 * .999)))
      });
      return () => { doST = null; };
    });
    // parallax tilt on the media frame
    const media = $('#doMedia');
    media.addEventListener('pointermove', (e) => {
      const r = media.getBoundingClientRect();
      gsap.to(frame, { rotateY: ((e.clientX - r.left) / r.width - .5) * 6, rotateX: -((e.clientY - r.top) / r.height - .5) * 6, transformPerspective: 1200, duration: .8, ease: 'power3.out' });
    });
    media.addEventListener('pointerleave', () => gsap.to(frame, { rotateX: 0, rotateY: 0, duration: 1, ease: 'expo.out' }));
  }

  /* ---------- archive ---------- */
  const groups = { Fintech: 'Fintech', Education: 'Education', Streetwear: 'Fashion', Kidswear: 'Fashion', 'Modest fashion': 'Fashion', 'Hair care': 'Wellness', Ayurveda: 'Wellness', Fragrance: 'Fragrance', Mobility: 'Mobility', 'Pet accessories': 'Lifestyle' };
  const rows = $('#rows'), chips = $('#chips');
  const ARR = '<svg class="ar" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  rows.innerHTML = D.cases.map((c, i) => `<li class="row${c.img ? '' : ' is-text'}" data-g="${groups[c.sector] || 'Other'}">
    <button type="button" data-case="${c.slug}" ${c.thumb ? `data-thumb="${c.thumb}"` : ''}>
      <span class="n">${String(i + 1).padStart(2, '0')}</span><span class="nm">${c.name}</span>
      <span class="sc">${c.sector} <i>· ${c.scope}</i></span><span class="rs">${c.result ? c.result.v + ' ' + c.result.l.toLowerCase() : ''}</span>${ARR}</button></li>`).join('');
  const counts = {}; D.cases.forEach((c) => { const g = groups[c.sector] || 'Other'; counts[g] = (counts[g] || 0) + 1; });
  const order = ['All', 'Fashion', 'Education', 'Wellness', 'Fintech', 'Fragrance', 'Mobility', 'Lifestyle'];
  chips.innerHTML = order.map((g) => `<button class="chip" type="button" data-g="${g}" aria-pressed="${g === 'All'}">${g}<sup>${g === 'All' ? D.cases.length : counts[g] || 0}</sup></button>`).join('');
  chips.addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    $$('.chip', chips).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const g = b.dataset.g;
    const list = $$('.row', rows);
    list.forEach((r) => { r.hidden = !(g === 'All' || r.dataset.g === g); });
    if (hasGsap && !STILL) gsap.fromTo(list.filter((r) => !r.hidden), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .6, stagger: .035, ease: 'expo.out', onComplete: () => ScrollTrigger.refresh() });
    else if (hasGsap) ScrollTrigger.refresh();
  });

  // floating preview that follows the cursor
  const peek = $('#peek'), peekIn = $('#peekIn');
  if (!STILL && hasGsap && matchMedia('(hover: hover)').matches) {
    gsap.set(peek, { scale: .8 });
    let px = 0, py = 0, vx = 0, lastX = 0, shown = false, curSrc = '';
    addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; }, { passive: true });
    let qx = 0, qy = 0;
    const setX = gsap.quickSetter(peek, 'x', 'px'), setY = gsap.quickSetter(peek, 'y', 'px'), setR = gsap.quickSetter(peek, 'rotation', 'deg');
    gsap.ticker.add(() => {
      qx += (px - qx) * .14; qy += (py - qy) * .14; vx += ((px - lastX) - vx) * .1; lastX = px;
      const w = peek.offsetWidth, h = peek.offsetHeight;
      setX(Math.min(qx + 28, innerWidth - w - 16)); setY(Math.max(16, Math.min(qy - h / 2, innerHeight - h - 16)));
      setR(Math.max(-8, Math.min(8, vx * .25)));
    });
    rows.addEventListener('pointerover', (e) => {
      const b = e.target.closest('button[data-case]');
      if (!b) return;
      const src = b.dataset.thumb;
      if (!src) { if (shown) { shown = false; gsap.to(peek, { opacity: 0, scale: .8, duration: .35 }); } return; }
      if (src !== curSrc) {
        curSrc = src; const im = new Image(); im.src = src; im.alt = '';
        peekIn.appendChild(im);
        gsap.fromTo(im, { clipPath: 'inset(0 0 100% 0)', scale: 1.15 }, { clipPath: 'inset(0 0 0% 0)', scale: 1, duration: .7, ease: 'expo.out',
          onComplete: () => { while (peekIn.children.length > 1) peekIn.removeChild(peekIn.firstChild); } });
      }
      if (!shown) { shown = true; gsap.to(peek, { opacity: 1, scale: 1, duration: .5, ease: 'expo.out' }); }
    });
    rows.addEventListener('pointerleave', () => { shown = false; gsap.to(peek, { opacity: 0, scale: .8, duration: .35 }); });
  }

  /* ---------- voices ---------- */
  const qText = $('#quoteText'), qWho = $('#quoteWho'), qBars = $('#qBars');
  qBars.innerHTML = D.quotes.map((q, i) => `<button type="button" aria-label="Quote ${i + 1}, ${q.who}"><i></i></button>`).join('');
  const bars = $$('button', qBars);
  let qi = -1, qTimer = null, qT0 = 0; const QDUR = 8000; let qPaused = false;
  function showQuote(i) {
    qi = (i + D.quotes.length) % D.quotes.length;
    const q = D.quotes[qi];
    const words = q.q.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ');
    const go = () => {
      qText.innerHTML = '“' + words + '”'; qWho.textContent = q.who;
      if (hasGsap && !STILL) gsap.fromTo($$('.w', qText), { opacity: 0, y: 18, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .9, stagger: .018, ease: 'expo.out' });
    };
    if (hasGsap && !STILL && qText.childElementCount) gsap.to($$('.w', qText), { opacity: 0, y: -10, filter: 'blur(6px)', duration: .35, stagger: .006, ease: 'power2.in', onComplete: go });
    else go();
    bars.forEach((b, k) => b.style.setProperty('--p', k < qi ? 1 : 0));
    qT0 = performance.now();
  }
  bars.forEach((b, i) => b.addEventListener('click', () => showQuote(i)));
  $('#qPrev').addEventListener('click', () => showQuote(qi - 1));
  $('#qNext').addEventListener('click', () => showQuote(qi + 1));
  $('#quote').addEventListener('pointerenter', () => { qPaused = true; });
  $('#quote').addEventListener('pointerleave', () => { qPaused = false; qT0 = performance.now() - (parseFloat(bars[qi].style.getPropertyValue('--p')) || 0) * QDUR; });
  showQuote(0);
  if (!STILL) {
    (function tick() {
      if (!qPaused) {
        const p = (performance.now() - qT0) / QDUR;
        if (bars[qi]) bars[qi].style.setProperty('--p', Math.min(1, p).toFixed(3));
        if (p >= 1) showQuote(qi + 1);
      }
      qTimer = requestAnimationFrame(tick);
    })();
  } else bars.forEach((b, k) => b.style.setProperty('--p', k === 0 ? 1 : 0));

  /* ---------- reveals ---------- */
  if (!STILL && hasGsap) {
    $$('[data-split]').forEach((el) => {
      if (el.classList.contains('hall__h')) return;
      const lines = split(el);
      gsap.from(lines, { yPercent: 110, duration: 1.3, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });
    gsap.from('.outro__name > span', { yPercent: 40, opacity: 0, duration: 1.4, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.outro', start: 'top 70%', once: true } });
    ScrollTrigger.batch('.row, .facts > div, .socials li, .outro__lead, .outro__cta, .archive__meta > *', {
      start: 'top 92%', once: true,
      onEnter: (els) => gsap.from(els, { opacity: 0, y: 28, duration: 1, stagger: .05, ease: 'expo.out', overwrite: true })
    });
    // section nav highlight
    [['#work', '.hall'], ['#what', '.do'], ['#archive', '.archive'], ['#contact', '.outro']].forEach(([h, s]) => {
      ScrollTrigger.create({ trigger: s, start: 'top 50%', end: 'bottom 50%', onToggle: (st) => { const a = $(`.bar__nav a[href="${h}"]`); if (a) a.classList.toggle('on', st.isActive); } });
    });
  } else { $$('[data-split]').forEach((el) => { if (!el.classList.contains('hall__h')) split(el); }); }

  /* ---------- case overlay ---------- */
  const cs = $('#case'), csIn = $('.case__in', cs);
  let lastFocus = null, csOpen = false;
  function openCase(slug, fromEl) {
    const c = D.bySlug[slug]; if (!c) return;
    lastFocus = document.activeElement;
    $('#caseKicker').innerHTML = `<span class="pt"></span>${c.sector} · ${c.scope}`;
    $('#caseName').textContent = c.name;
    $('#caseTitle').textContent = c.title;
    const meta = [['Client', c.name], ['Timeline', c.timeline], ['Our role', c.role], ['Stack', c.stack]].filter((m) => m[1]);
    $('#caseMeta').innerHTML = meta.map((m) => `<div><dt>${m[0]}</dt><dd>${m[1]}</dd></div>`).join('');
    $('#caseCh').textContent = c.challenge || '';
    $('#caseAp').textContent = c.approach || '';
    $('#caseRes').innerHTML = c.result ? `<b>${c.result.v}</b><span>${c.result.l}</span>` : '';
    $('#caseRes').hidden = !c.result;
    const links = [];
    if (c.url) links.push(`<a class="btn btn--o" href="${c.url}" target="_blank" rel="noopener"><span class="pt"></span><span class="roll"><span>Visit ${c.urlLabel}</span><span aria-hidden="true">Visit ${c.urlLabel}</span></span></a>`);
    links.push(`<a class="btn btn--g" href="https://www.beyourown.in/work/${c.slug}" target="_blank" rel="noopener"><span class="roll"><span>Full case study ↗</span><span aria-hidden="true">Full case study ↗</span></span></a>`);
    $('#caseLinks').innerHTML = links.join('');
    const main = $('#caseMain'), th = $('#caseThumbs');
    if (c.gallery.length) {
      main.innerHTML = `<img src="${c.gallery[0]}" alt="${c.name}, screen 1">`;
      th.innerHTML = c.gallery.length > 1 ? c.gallery.map((g, k) => `<button type="button" aria-label="Show screen ${k + 1}" aria-current="${k === 0}"><img src="${g}" alt=""></button>`).join('') : '';
    } else { main.innerHTML = `<div class="ph">${c.name}</div>`; th.innerHTML = ''; }
    cs.hidden = false; csOpen = true; csIn.scrollTop = 0;
    if (lenis) lenis.stop();
    BUS.paused = true;
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
    if (hasGsap && !STILL) gsap.to(cs, { clipPath: 'inset(0px 0px 100% 0px round 0px)', duration: .7, ease: 'expo.inOut', onComplete: done });
    else done();
  }
  $('#caseX').addEventListener('click', closeCase);
  addEventListener('keydown', (e) => {
    if (!csOpen) return;
    if (e.key === 'Escape') closeCase();
    if (e.key === 'Tab') { // keep focus inside
      const f = $$('button, a[href]', cs).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  $('#caseThumbs').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const k = $$('button', b.parentElement).indexOf(b);
    const src = $('img', b).getAttribute('src');
    $$('button', b.parentElement).forEach((x) => x.setAttribute('aria-current', String(x === b)));
    const main = $('#caseMain'); const im = new Image(); im.src = src; im.alt = `screen ${k + 1}`; main.appendChild(im);
    if (hasGsap && !STILL) gsap.fromTo(im, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: .8, ease: 'expo.inOut', onComplete: () => { while (main.children.length > 1) main.removeChild(main.firstChild); } });
    else while (main.children.length > 1) main.removeChild(main.firstChild);
  });

  /* ---------- copy ---------- */
  $$('.copy').forEach((b) => b.addEventListener('click', () => {
    const v = b.dataset.copy, spans = $$('.roll > span', b), orig = spans[1].textContent;
    const ok = () => { spans[1].textContent = 'Copied'; setTimeout(() => { spans[1].textContent = orig; }, 1600); };
    try { navigator.clipboard.writeText(v).then(ok, () => {}); } catch (e) {}
  }));

  if (hasGsap) addEventListener('load', () => ScrollTrigger.refresh());
})();
