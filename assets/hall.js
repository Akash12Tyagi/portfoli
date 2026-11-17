/* BE YOUR OWN — the hall.
   A dark gallery corridor of slatted walls and a reflective floor. Each featured project hangs as a lit screen;
   scroll walks the camera from screen to screen and each one lifts into the ceiling as you pass beneath it.
   A procedural aperture (iris) sits over the hall until the visitor enters. */
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';

const BUS = window.BYO_BUS, D = window.BYO;
if (!BUS.still) {
  try { init(); } catch (e) { console.error(e); BUS.noGL && BUS.noGL(); }
}

function init() {
  const canvas = BUS.canvas;
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) { BUS.noGL(); return; }

  const small = Math.min(innerWidth, innerHeight) < 700 || matchMedia('(pointer: coarse)').matches;
  const DPR = Math.min(devicePixelRatio || 1, small ? 1.5 : 2);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, powerPreference: 'high-performance' });
  renderer.setPixelRatio(DPR);
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.autoClear = false;

  const BG = new THREE.Color(0x0a0a09);
  const FOG_D = 0.052;
  const scene = new THREE.Scene();
  scene.background = BG;
  scene.fog = new THREE.FogExp2(BG, FOG_D);

  const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 220);

  /* ---------- layout ---------- */
  const F = D.featured, N = F.length;
  const SP = 13, Z0 = -6, SW = 4.2, SH = 2.625, SY = 2.08, CEIL = 4.7, HALF = 2.95;
  const zs = F.map((_, i) => Z0 - i * SP);
  const zEnd = zs[N - 1] - SP * 0.95;
  const zFar = zEnd - 14, zNear = 14, LEN = zNear - zFar, MID = (zNear + zFar) / 2;

  const manager = new THREE.LoadingManager();
  manager.onProgress = (_, l, t) => BUS.setProgress(0.08 + (l / t) * 0.82);
  const loader = new THREE.TextureLoader(manager);

  /* ---------- floor ---------- */
  function floorTexture(alpha) {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = `rgba(9,9,8,${alpha})`; g.fillRect(0, 0, 256, 256);
    g.fillStyle = `rgba(36,36,33,${Math.min(1, alpha + .08)})`; g.fillRect(0, 0, 256, 2); g.fillRect(0, 0, 2, 256);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12 / 1.3, LEN / 1.3); t.anisotropy = 8;
    t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  let reflector = null;
  if (!small) {
    reflector = new Reflector(new THREE.PlaneGeometry(HALF * 2, LEN), {
      clipBias: 0.003, textureWidth: innerWidth * DPR * 0.5, textureHeight: innerHeight * DPR * 0.5, color: 0x9a9a96
    });
    reflector.rotation.x = -Math.PI / 2; reflector.position.set(0, 0, MID); scene.add(reflector);
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, LEN),
    new THREE.MeshBasicMaterial({ map: floorTexture(small ? 1 : 0.8), transparent: true, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.004, MID); scene.add(floor);
  // two faint runway lines
  const runMat = new THREE.MeshBasicMaterial({ color: 0xff5c00, transparent: true, opacity: 0.28, toneMapped: false });
  [-1, 1].forEach((s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.012, LEN), runMat); m.rotation.x = -Math.PI / 2; m.position.set(s * 1.75, 0.008, MID); scene.add(m); });

  /* ---------- ceiling ---------- */
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(12, LEN), new THREE.MeshStandardMaterial({ color: 0x0b0b0a, roughness: 1 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, CEIL, MID); scene.add(ceil);
  const slotMat = new THREE.MeshBasicMaterial({ color: 0x3a3a36 });
  for (let z = zNear; z > zFar; z -= 6.5) { const m = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 1.6, 0.05), slotMat); m.rotation.x = Math.PI / 2; m.position.set(0, CEIL - 0.01, z); scene.add(m); }

  /* ---------- slatted walls ---------- */
  const STEP = 0.72, finsPerSide = Math.ceil(LEN / STEP);
  const fins = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x22221f, roughness: 0.42, metalness: 0.3 }), finsPerSide * 2);
  const dummy = new THREE.Object3D();
  let k = 0, rs = 11;
  const rnd = () => { rs = (rs * 16807) % 2147483647; return (rs - 1) / 2147483646; };
  const ledSpots = [];
  for (let s of [-1, 1]) {
    for (let i = 0; i < finsPerSide; i++) {
      const z = zNear - i * STEP, depth = 0.9 + rnd() * 0.7 + (i % 6 === 0 ? 0.35 : 0);
      dummy.position.set(s * (HALF + depth / 2), CEIL / 2, z); dummy.scale.set(depth, CEIL, 0.06); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
      fins.setMatrixAt(k++, dummy.matrix);
      if (rnd() < 0.22) ledSpots.push([s * (HALF - 0.02 + (depth > 1.5 ? -0.0 : 0)), 0.5 + rnd() * 3.6, z + 0.035, rnd()]);
    }
  }
  scene.add(fins);
  const leds = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 0.03, 0.012), new THREE.MeshBasicMaterial({ toneMapped: false }), ledSpots.length);
  const cO = new THREE.Color(0xff5c00), cW = new THREE.Color(0x9a9a92);
  ledSpots.forEach((l, i) => { dummy.position.set(l[0], l[1], l[2]); dummy.scale.setScalar(1); dummy.updateMatrix(); leds.setMatrixAt(i, dummy.matrix); leds.setColorAt(i, l[3] < 0.55 ? cO : cW); });
  scene.add(leds);
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  const camLight = new THREE.PointLight(0xffe2c8, 7, 10, 1.5); scene.add(camLight);

  /* ---------- screens ---------- */
  const vert = `varying vec2 vUv; varying float vDepth;
    void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`;
  const frag = `uniform sampler2D map; uniform vec2 uSize; uniform float uR, uHover, uFade, uFogD, uSolid; uniform vec3 uFogC, uCol;
    varying vec2 vUv; varying float vDepth;
    float sdR(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q,0.0)) + min(max(q.x,q.y),0.0) - r; }
    void main(){
      vec2 p = (vUv - 0.5) * uSize;
      float d = sdR(p, uSize * 0.5, uR);
      float a = 1.0 - smoothstep(-0.006, 0.004, d);
      vec3 c;
      if (uSolid > 0.5) { c = uCol; }
      else {
        vec2 uv = (vUv - 0.5) / (1.0 + uHover * 0.045) + 0.5;
        c = texture2D(map, uv).rgb;
        c *= 0.9 + 0.1 * smoothstep(0.9, 0.0, length(p / uSize));
      }
      float f = 1.0 - exp(-pow(uFogD * vDepth, 2.0));
      c = mix(c, uFogC, f);
      gl_FragColor = vec4(c * uFade, a);
      #include <colorspace_fragment>
    }`;
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); return t;
  })();
  const cableMat = new THREE.MeshBasicMaterial({ color: 0x2e2e2b });
  const screens = F.map((c, i) => {
    const g = new THREE.Group(); g.position.set(0, SY, zs[i]);
    const tex = loader.load(c.img, (t) => {
      const tint = tintOf(t.image); s.light.color.copy(tint); s.glow.material.color.copy(tint);
    });
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); tex.generateMipmaps = true;
    const mk = (solid, col) => new THREE.ShaderMaterial({
      uniforms: { map: { value: tex }, uSize: { value: new THREE.Vector2(SW + (solid ? .07 : 0), SH + (solid ? .07 : 0)) }, uR: { value: solid ? .11 : .08 }, uHover: { value: 0 }, uFade: { value: 1 },
        uFogD: { value: FOG_D }, uFogC: { value: BG.clone() }, uSolid: { value: solid ? 1 : 0 }, uCol: { value: new THREE.Color(col || 0) } },
      vertexShader: vert, fragmentShader: frag, transparent: true
    });
    const bezel = new THREE.Mesh(new THREE.PlaneGeometry(SW + .07, SH + .07), mk(true, 0x050505)); bezel.position.z = -0.01; g.add(bezel);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), mk(false)); screen.userData.i = i; g.add(screen);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(SW * 2.7, SH * 3.0), new THREE.MeshBasicMaterial({ map: glowTex, color: 0xff7a2e, transparent: true, opacity: .42, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.position.z = -0.08; g.add(glow);
    const cables = [-1, 1].map((sx) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 1, 6), cableMat); m.position.x = sx * SW * .34; g.add(m); return m; });
    scene.add(g);
    const light = new THREE.PointLight(0xff7a2e, small ? 30 : 40, 15, 1.3); light.position.set(0, SY + .1, zs[i] + 1.4); scene.add(light);
    const s = { g, screen, bezel, glow, cables, light, lift: 0, hover: 0 };
    return s;
  });
  function tintOf(img) {
    try {
      const c = document.createElement('canvas'); c.width = 24; c.height = 15; const g = c.getContext('2d');
      g.drawImage(img, 0, 0, 24, 15); const d = g.getImageData(0, 0, 24, 15).data;
      let r = 0, gg = 0, b = 0, w = 0;
      for (let i = 0; i < d.length; i += 4) { const R = d[i], G = d[i + 1], B = d[i + 2]; const mx = Math.max(R, G, B), mn = Math.min(R, G, B); const wt = 0.2 + (mx - mn) / 255 * 3; r += R * wt; gg += G * wt; b += B * wt; w += wt; }
      const col = new THREE.Color(r / w / 255, gg / w / 255, b / w / 255);
      const hsl = {}; col.getHSL(hsl); col.setHSL(hsl.h, Math.min(1, hsl.s * 1.6 + 0.18), 0.56);
      return col;
    } catch (e) { return new THREE.Color(0xff7a2e); }
  }

  /* ---------- end wall ---------- */
  const endTex = (() => {
    const c = document.createElement('canvas'); c.width = 2048; c.height = 1152; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const draw = () => {
      const g = c.getContext('2d'); g.clearRect(0, 0, 2048, 1152);
      g.fillStyle = '#FF5C00'; g.beginPath(); g.arc(150, 300, 16, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#C9C9C6'; g.font = '500 40px "Geist Mono", monospace'; g.fillText('THE ARCHIVE', 190, 314);
      g.fillStyle = '#FAFAF8'; g.font = '700 300px "Bricolage Grotesque", Arial, sans-serif'; g.fillText('Ten more', 132, 640);
      g.fillStyle = '#5E5E5A'; g.fillText('below.', 132, 930);
      g.fillStyle = '#FF5C00'; g.font = '700 300px "Bricolage Grotesque", Arial, sans-serif'; g.fillText('↓', 1100, 930);
      t.needsUpdate = true;
    };
    draw(); if (document.fonts) document.fonts.ready.then(draw);
    return t;
  })();
  const endWall = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.6), new THREE.MeshBasicMaterial({ map: endTex, transparent: true, toneMapped: false }));
  endWall.position.set(0, SY + .1, zEnd); scene.add(endWall);
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(12, CEIL), new THREE.MeshStandardMaterial({ color: 0x0e0e0d, roughness: .9 }));
  backWall.position.set(0, CEIL / 2, zEnd - 0.05); scene.add(backWall);
  const endLight = new THREE.PointLight(0xff5c00, 10, 9, 1.4); endLight.position.set(0, 1.2, zEnd + 2.4); scene.add(endLight);

  /* ---------- iris (procedural aperture over everything until entry) ---------- */
  const iris = {
    open: 0, active: true,
    mat: new THREE.ShaderMaterial({
      uniforms: { uRes: { value: new THREE.Vector2() }, uOpen: { value: 0 }, uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() }, uHover: { value: 0 } },
      vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: `precision highp float;
        uniform vec2 uRes, uMouse; uniform float uOpen, uTime, uHover;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main(){
          float mn = min(uRes.x, uRes.y);
          vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / mn;
          float r = length(p);
          float a = atan(p.y, p.x);
          const float NB = 9.0;
          float sector = 6.2831853 / NB;
          float o = uOpen;
          float twist = 0.6 + uTime * 0.035 + uMouse.x * 0.1 + o * 1.6;
          float aa = a + twist;
          float m = mod(aa, sector) - 0.5 * sector;
          float ap = mix(0.105 + uHover * 0.035 + 0.008 * sin(uTime * 0.9), 1.3, o);
          float edge = ap / cos(m);
          float d = r - edge;
          float blade = smoothstep(0.0, 1.6 / mn, d);
          float s = aa / sector - d * 1.4;
          float f = fract(s);
          float id = floor(s);
          float shade = 0.86 + 0.14 * sin(id * 1.7 + 0.5);
          vec3 col = vec3(0.075, 0.073, 0.069) * (0.5 + 0.8 * f) * shade;
          col *= mix(0.3, 1.0, smoothstep(0.0, 0.03, f));
          col += vec3(0.05) * smoothstep(0.96, 1.0, f);
          col *= 1.0 + 0.7 * exp(-d * 5.0);
          col += vec3(1.0, 0.36, 0.0) * exp(-d * 70.0) * 0.6 * (1.0 - o);
          col += 0.035 * max(0.0, dot(normalize(p + 1e-4), normalize(vec2(-0.6, 0.8))));
          col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.03;
          col *= 1.0 - 0.4 * smoothstep(0.55, 1.15, r);
          float alpha = blade * (1.0 - smoothstep(0.8, 1.0, o));
          gl_FragColor = vec4(col, alpha);
        }`,
      transparent: true, depthTest: false, depthWrite: false
    })
  };
  const irisScene = new THREE.Scene(), irisCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  irisScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), iris.mat));

  /* ---------- camera rig ---------- */
  let dist = 4.6, push = 3.2;
  function fit() {
    const asp = innerWidth / innerHeight;
    camera.fov = asp < 0.8 ? 54 : asp < 1.2 ? 46 : 40;
    camera.aspect = asp; camera.updateProjectionMatrix();
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    dist = Math.min(10, Math.max(4.4, SW / (0.74 * 2 * t * asp)));
    renderer.setSize(innerWidth, innerHeight, false);
    iris.mat.uniforms.uRes.value.set(innerWidth * DPR, innerHeight * DPR);
    if (reflector) reflector.getRenderTarget().setSize(innerWidth * DPR * 0.5, innerHeight * DPR * 0.5);
  }
  fit();
  addEventListener('resize', fit);
  const stops = () => [zs[0] + dist + 9.5, ...zs.map((z) => z + dist), zEnd + dist * 1.15 + 1];
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const ramp = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };

  BUS.enter = () => {
    const t0 = performance.now(), dur = 2200;
    const ease = (t) => t < .5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
    (function step(now) {
      const t = Math.min(1, (now - t0) / dur), e = ease(t);
      iris.open = e; push = 3.2 * (1 - e);
      if (t < 1) requestAnimationFrame(step); else { iris.active = false; push = 0; }
    })(t0);
  };

  /* ---------- pointer / picking ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let hovered = -1, pointerIn = false;
  canvas.addEventListener('pointermove', (e) => { pointerIn = true; ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); });
  canvas.addEventListener('pointerleave', () => { pointerIn = false; });
  canvas.addEventListener('click', () => { if (hovered >= 0 && BUS.entered) BUS.openCase(hovered); });

  /* ---------- loop ---------- */
  const clock = new THREE.Clock();
  let u = 0, t = 0, lastActive = -3, rollV = 0, prevU = 0;
  const v3 = new THREE.Vector3(), look = new THREE.Vector3();
  const tab = BUS.tabEl;
  let shown = true;

  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05); t += dt;
    const live = !BUS.paused && (BUS.hallVisible || iris.active);
    if (live !== shown) { shown = live; canvas.style.visibility = live ? 'visible' : 'hidden'; }
    if (!live) return;

    // scroll → position along the hall
    const S = stops(), segs = S.length - 1;
    const target = clamp(BUS.hallP, 0, 1) * segs;
    u += (target - u) * (1 - Math.exp(-dt * 4.2));
    if (BUS.snap) u = target;
    const i0 = Math.min(segs - 1, Math.floor(u)), fr = u - i0;
    const e = ramp(0.16, 0.84, fr);
    const camZ = S[i0] + (S[i0 + 1] - S[i0]) * e + push;
    const vel = (u - prevU) / Math.max(dt, 1e-3); prevU = u;
    rollV += (clamp(vel * 0.012, -0.03, 0.03) - rollV) * 0.08;

    const mx = BUS.mouse.x, my = BUS.mouse.y;
    // at the opening stop, frame the first screen to the right of the headline (landscape only)
    const intro = camera.aspect > 1.1 ? 1 - ramp(0, 1, u) : 0;
    camera.position.set(mx * 0.32 - intro * 1.1, 1.72 + my * 0.16, camZ);
    look.set(mx * 0.12 - intro * 2.6, SY - 0.02 + my * 0.06 + intro * 0.25, camZ - 9);
    camera.lookAt(look);
    camera.rotateZ(rollV);
    camLight.position.set(0, 2.6, camZ - 1.5);

    // active screen
    const kk = Math.round(u);
    const active = kk >= 1 && kk <= N ? kk - 1 : -1;
    if (active !== lastActive) { lastActive = active; BUS.onActive(active); }

    // screens: lift as the camera passes beneath, idle sway, hover zoom
    if (pointerIn && BUS.entered) {
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(screens.map((s) => s.screen), false)[0];
      const hi = hit ? hit.object.userData.i : -1;
      if (hi !== hovered) { hovered = hi; canvas.style.cursor = hi >= 0 ? 'pointer' : ''; BUS.onHover(hi >= 0, 'View'); }
    } else if (hovered !== -1) { hovered = -1; canvas.style.cursor = ''; BUS.onHover(false); }

    screens.forEach((s, i) => {
      const z = zs[i];
      const lift = ramp(z + 3.0, z + 0.1, camZ);
      s.lift = lift;
      const y = SY + lift * 3.2;
      s.g.position.y = y;
      s.g.position.x = Math.sin(t * 0.45 + i * 1.3) * 0.015;
      s.g.rotation.x = -lift * 0.35;
      s.g.rotation.z = Math.sin(t * 0.6 + i) * 0.004;
      const top = y + SH / 2, len = Math.max(0.01, CEIL - top);
      s.cables.forEach((c) => { c.scale.y = len; c.position.y = SH / 2 + len / 2; });
      s.hover += ((hovered === i ? 1 : 0) - s.hover) * (1 - Math.exp(-dt * 8));
      s.screen.material.uniforms.uHover.value = s.hover;
      const near = 1 - lift;
      s.light.intensity = (small ? 30 : 40) * (0.35 + 0.65 * near) * (i === active ? 1.15 : 0.85);
      s.glow.material.opacity = 0.42 * near;
    });

    // blinking status lights
    if ((t * 10 | 0) % 2 === 0) {
      ledSpots.forEach((l, i) => { const on = Math.sin(t * (0.6 + l[3] * 2.2) + l[3] * 40) > -0.2; dummy.position.set(l[0], l[1], l[2]); dummy.scale.setScalar(on ? 1 : 0.001); dummy.updateMatrix(); leds.setMatrixAt(i, dummy.matrix); });
      leds.instanceMatrix.needsUpdate = true;
    }

    // tab follows the bottom edge of the active screen
    if (tab) {
      let op = 0;
      if (active >= 0 && BUS.entered) {
        const s = screens[active];
        v3.set(0, s.g.position.y - SH / 2 - 0.14, zs[active]).project(camera);
        const x = (v3.x * 0.5 + 0.5) * innerWidth, y = (-v3.y * 0.5 + 0.5) * innerHeight;
        op = (1 - ramp(0.2, 0.42, Math.abs(u - kk))) * (v3.z < 1 ? 1 : 0);
        const tw = tab.offsetWidth || 300, xc = Math.max(tw / 2 + 12, Math.min(innerWidth - tw / 2 - 12, x));
        tab.style.transform = `translate3d(${xc.toFixed(1)}px, ${Math.min(y, innerHeight - 140).toFixed(1)}px, 0) translateX(-50%)`;
      }
      tab.style.opacity = op.toFixed(3);
      tab.style.pointerEvents = op > 0.3 ? 'auto' : 'none';
    }

    renderer.clear();
    renderer.render(scene, camera);
    if (iris.active) {
      const im = iris.mat.uniforms;
      im.uOpen.value = iris.open; im.uTime.value = t;
      im.uMouse.value.x += (mx - im.uMouse.value.x) * 0.05;
      im.uHover.value += ((BUS.irisHover || 0) - im.uHover.value) * 0.08;
      renderer.render(irisScene, irisCam);
    }
  }

  // wait for textures, compile, then open the gate
  BUS.setProgress(0.05);
  manager.onLoad = () => {
    try { renderer.compile(scene, camera); } catch (e) {}
    BUS.setProgress(1);
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1500))]).then(() => BUS.onReady());
  };
  requestAnimationFrame(frame);
}
