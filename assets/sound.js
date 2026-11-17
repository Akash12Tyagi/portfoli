/* Procedural sound for the portfolio. Nothing is downloaded: a low ambient bed, a dial tick and a
   filtered whoosh, all synthesised with Web Audio. Starts only after the visitor clicks. */
window.ATSound = (function () {
  let ctx = null, master = null, bed = null, noiseBuf = null;
  let on = true;
  try { on = localStorage.getItem('at-sound') !== 'off'; } catch (e) {}

  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { ctx = new AC(); } catch (e) { return false; }
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.connect(master);
    // white noise buffer, reused
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // ambient bed: detuned low partials through a slowly breathing low-pass
    bed = ctx.createGain(); bed.gain.value = 0.22;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.7;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07; const lfoG = ctx.createGain(); lfoG.gain.value = 180;
    lfo.connect(lfoG); lfoG.connect(lp.frequency); lfo.start();
    [[55, 'sine', .5], [55.4, 'sine', .4], [82.4, 'triangle', .14], [110.2, 'sine', .1], [164.8, 'sine', .04]].forEach(([f, t, g]) => {
      const o = ctx.createOscillator(); o.type = t; o.frequency.value = f; const og = ctx.createGain(); og.gain.value = g; o.connect(og); og.connect(lp); o.start();
    });
    const air = ctx.createBufferSource(); air.buffer = noiseBuf; air.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.6;
    const ag = ctx.createGain(); ag.gain.value = 0.018; air.connect(bp); bp.connect(ag); ag.connect(lp); air.start();
    lp.connect(bed); bed.connect(comp);
    window.__atComp = comp;
    return true;
  }
  function out() { return window.__atComp || master; }
  function fade(to, t = 1.2) { if (!ctx) return; const now = ctx.currentTime; master.gain.cancelScheduledValues(now); master.gain.setValueAtTime(master.gain.value, now); master.gain.linearRampToValueAtTime(to, now + t); }

  function start() { if (!on) return; if (!init()) return; if (ctx.state === 'suspended') ctx.resume(); fade(0.55, 2.4); }
  function set(v) {
    on = v; try { localStorage.setItem('at-sound', v ? 'on' : 'off'); } catch (e) {}
    if (v) { if (init()) { if (ctx.state === 'suspended') ctx.resume(); fade(0.55, .8); } }
    else fade(0, .5);
    document.querySelectorAll('.snd').forEach((b) => { b.setAttribute('aria-pressed', String(v)); b.querySelector('.snd__t').textContent = v ? 'Sound on' : 'Sound off'; });
    document.documentElement.classList.toggle('snd-off', !v);
    if (window.ATSoundChanged) window.ATSoundChanged(v);
  }
  function tick(pitch = 1) {
    if (!ctx || !on) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.setValueAtTime(1800 * pitch, t); o.frequency.exponentialRampToValueAtTime(900 * pitch, t + .03);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + .003); g.gain.exponentialRampToValueAtTime(0.0001, t + .05);
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 600;
    o.connect(hp); hp.connect(g); g.connect(out()); o.start(t); o.stop(t + .06);
  }
  function whoosh(dur = 1.1, up = true) {
    if (!ctx || !on) return;
    const t = ctx.currentTime, s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.4;
    f.frequency.setValueAtTime(up ? 200 : 2400, t); f.frequency.exponentialRampToValueAtTime(up ? 2400 : 200, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + dur * .45); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(out()); s.start(t); s.stop(t + dur + .05);
  }
  function boom() {
    if (!ctx || !on) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(32, t + 1.6);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + .04); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    o.connect(g); g.connect(out()); o.start(t); o.stop(t + 1.9);
    whoosh(1.6, true);
  }
  return { start, set, tick, whoosh, boom, get on() { return on; } };
})();
