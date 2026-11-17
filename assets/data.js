/* Akash Tyagi — projects, disciplines, timeline.
   Featured projects hang in the 3D hall; frames live in assets/p/ (full size) and assets/p/gl/ (textures). */
window.AT = (function () {
  const P = 'assets/p/', G = 'assets/p/gl/', S = 'assets/work/';
  const frames = (slug, n) => Array.from({ length: n }, (_, i) => `${slug}-${i}.webp`);

  const projects = [
    {
      slug: 'rosso', name: 'Rosso', kind: 'Real-time 3D', label: 'Concept, automotive', year: '2026', n: 6,
      line: '458 Italia, a 3D scroll experience.',
      what: 'A pitch-ready concept for a premium car site built around a real-time 3D 458 Italia: a studio light rig, a paint-sweep shader, flames at the limiter and an exploded anatomy view.',
      how: 'The Engine chapter is a procedural, component-separated V8 of 22 assemblies with exact slider-crank and cam kinematics, teardown poses and an x-ray mode, plus a Web Audio engine note driven by rpm.',
      stack: 'three.js · GLSL · GSAP · Lenis · Web Audio · Vite', note: 'Unofficial concept, not affiliated with Ferrari.',
      repo: 'car-3d', live: 'https://car-3d-zeta.vercel.app/'
    },
    {
      slug: 'cafe', name: 'Corner Café', kind: 'Real-time 3D', label: 'Concept, specialty coffee', year: '2026', n: 5,
      line: 'A New York corner café you fly into, from the skyline to the counter.',
      what: 'One room on one corner of New York. The page opens over a low-poly city, drops down the avenue to the storefront and walks in to the counter, the menu board and the espresso machine.',
      how: 'A scroll-driven three.js scene under real HTML copy: the camera flies a path from the skyline to the bar, the brew numbers (18 g, 93 °C, 28 s) sit beside the machine, and the shot pours as you read.',
      stack: 'three.js · scroll-driven camera path · HTML over WebGL',
      live: 'https://corner-cafe-3d-scroll-site.vercel.app/'
    },
    {
      slug: 'lusso', name: 'Lusso di Firenze', kind: '3D commerce', label: 'Concept, fragrance', year: '2026', n: 6,
      line: 'Ten perfume bottles, modelled live from product photography.',
      what: 'A concept homepage built to the Lusso di Firenze brand guidelines. All ten bottles are real-time models with transmissive glass, refracting liquid and printed labels on a travertine turntable.',
      how: 'A scroll story from hero to notes orbiting an open bottle, the collection turntable, brand pillars and a 3D gift box whose lid opens as three chosen bottles drop in. Drag to turn, click to spritz.',
      stack: 'three.js · Lenis · physical glass materials', note: 'Built at BE YOUR OWN.',
      repo: 'akash-tyagi', live: 'https://beyourown-portfolio.vercel.app'
    },
    {
      slug: 'onfinity', name: 'Onfinity', kind: '3D commerce', label: 'Concept, electronics', year: '2026', n: 5,
      line: 'A WebGL-first showroom for an Indian TV maker.',
      what: 'A procedurally modelled TV whose screen is a live shader, sized from 32 to 98 inches beside a person for scale, then an infinite corridor of screens, a shop with cart, and a true-to-scale 3D room.',
      how: 'A power-on gate with a CRT flash and synthesised hum, 4K, QLED and OLED screen wipes, a CRT post pass in the showroom, AR through Quick Look and WebXR, and a small Node server for leads and analytics.',
      stack: 'three.js · GLSL · WebXR · Node',
      repo: 'NaariCare/onfinity-3d', live: 'https://onfinity-3d.vercel.app'
    },
    {
      slug: 'uniques', name: 'The Uniques', kind: 'Real-time 3D', label: 'Concept, community', year: '2026', n: 5,
      line: 'A community homepage you fly through.',
      what: 'A spatial re-imagining of the Uniques homepage: a poster corridor out through a neon portal, extruded numbers in lacquer and chrome, a helix of events and a drum of photos you can spin.',
      how: 'Twelve HTML chapters scroll over one WebGL world. Each chapter’s centre maps to a station on a Catmull-Rom camera rail, with bloom on desktop and a re-framed rail on phones.',
      stack: 'React · three.js · Catmull-Rom camera rail · bloom',
      repo: 'uniques-sample/uniques-3d', live: 'https://theuniques.vercel.app'
    },
    {
      slug: 'skillcures', name: 'SkillCures', kind: 'Cinematic landing', label: 'Landing page, pharma careers', year: '2026', n: 6,
      line: 'One continuous 3D world. Every chapter is a different camera move.',
      what: 'A real-time 3D rebuild of the SkillCures landing page: a dashboard, a live prescription, a patent journey, a network globe and a mentor table, with the four pill mascots rebuilt as 3D models.',
      how: 'Dolly, truck, dive, sweep and crane moves between chapters, adaptive quality that steps resolution and bloom down when frames drop, and a static fallback with the same content.',
      stack: 'three.js · Vite · adaptive quality',
      repo: 'skillcures-3d', live: 'https://skillcure.vercel.app/'
    },
    {
      slug: 'cricketlive', name: 'CricketLive', kind: 'Product platform', label: 'Platform, sports', year: '2026', n: 4,
      line: 'Live cricket scores, built for 10k+ concurrent users.',
      what: 'Live and completed matches, scorecards, players and teams, with real data from Cricsheet and Wikidata and a complete simulated T20 for demos.',
      how: 'A Next.js App Router site with SSR and ISR, a Fastify API with passwordless login and sessions, a Drizzle schema on Postgres, Redis caching, load tests and a release gate on the browser bundles.',
      stack: 'Next.js · Fastify · Postgres · Drizzle · Redis · Docker',
      repo: 'cricket-site'
    },
    {
      slug: 'futureed', name: 'Future Education', kind: 'Product platform', label: 'Platform, education', year: '2026', img: S + 'lms.webp', thumb: S + 'lms-sm.webp',
      line: 'Admission counselling platform with its own admin CMS.',
      what: 'Course finder, course matcher, college directory with compare, scholarship eligibility checker, application tracker and success stories, plus a lead management system fed by Meta Lead Ads.',
      how: 'Next.js 16 and React 19 on Postgres through Prisma, NextAuth for admins, a 15-resource admin CMS with audit logging, first-party analytics and lead capture.',
      stack: 'Next.js · React 19 · Prisma · Postgres · NextAuth · Tailwind 4',
      repo: 'future-education-web'
    },
    {
      slug: 'ledger', name: 'Ledger Go Digitify', kind: 'Product platform', label: 'Platform, finance', year: '2026',
      line: 'A company finance and ledger management system.',
      what: 'Ledgers, payments and expenses for a company, with scheduled daily and expense jobs.',
      how: 'A layered Next.js 16 app: server actions and route handlers over services that own transactions, repositories as the only layer touching the database, with import rules enforced in lint.',
      stack: 'Next.js 16 · MongoDB · Mongoose · Vercel cron',
      repo: 'ledgergodigitify', live: 'https://ledgergodigitify.vercel.app'
    },
    {
      slug: 'sorvine', name: 'Sorvine', kind: 'Cinematic landing', label: 'Landing page, AI', year: '2026',
      line: 'Two particle hands reach for a spark.',
      what: 'A scroll-driven landing page where particle hands rise, part and dissolve into rings, then collapse into a brain before becoming a data field behind the content.',
      how: 'Everything moves with scroll position and reverses on the way back up: a React Three Fiber particle scene with Lenis and GSAP ScrollTrigger.',
      stack: 'Next.js · React Three Fiber · GSAP · Lenis',
      repo: 'sorvine-2'
    },
    {
      slug: 'naaricare', name: 'NaariCare', kind: 'Product platform', label: 'Platform, wellness', year: '2026', n: 2,
      line: 'A women’s wellness companion, from periods to parenthood.',
      what: 'Cycle tracker, pregnancy care, mental wellness, nutrition guides and an AI chatbot for emotional support.',
      how: 'A multi-page site with scroll animations, Firebase authentication and a chatbot.',
      stack: 'HTML · CSS · JavaScript · Firebase',
      repo: 'NaariCare'
    }
  ];
  projects.forEach((p) => {
    p.frames = p.n ? frames(p.slug, p.n).map((f) => P + f) : (p.img ? [p.img] : []);
    p.gl = p.n ? frames(p.slug, p.n).map((f) => G + f) : [];
    p.img = p.img || p.frames[0] || null;
    p.thumb = p.thumb || (p.n ? P + p.slug + '-sm.webp' : null);
    p.code = p.repo ? 'https://github.com/Akash12Tyagi/' + p.repo.split('/')[0] : null;
    p.host = p.live ? p.live.replace(/^https?:\/\//, '').replace(/\/$/, '') : null;
  });
  const by = Object.fromEntries(projects.map((p) => [p.slug, p]));
  const featured = ['rosso', 'cafe', 'lusso', 'onfinity', 'uniques', 'skillcures', 'cricketlive'].map((s) => by[s]);

  const studio = [
    { slug: 'abrocare', name: 'AbroCare', label: 'Fintech platform', img: S + 'abrocare.webp', thumb: S + 'abrocare-sm.webp', url: 'https://www.beyourown.in/work/abrocare' },
    { slug: 'liiaroma', name: 'LIIAROMA', label: 'Fragrance, brand + web', img: S + 'liiaroma.webp', thumb: S + 'liiaroma-sm.webp', url: 'https://www.beyourown.in/work/liiaroma' },
    { slug: 'bobochi', name: 'BoBoChi Kids', label: 'Kidswear e-commerce', img: S + 'bobochi.webp', thumb: S + 'bobochi-sm.webp', url: 'https://www.beyourown.in/work/bobochi' },
    { slug: 'sviet', name: 'SVIET', label: 'Placements page', img: S + 'sviet.webp', thumb: S + 'sviet-sm.webp', url: 'https://www.beyourown.in/work/sviet' },
    { slug: 'alliance', name: 'Alliance', label: 'School communication software', img: S + 'alliance.webp', thumb: S + 'alliance-sm.webp', url: 'https://www.beyourown.in/work/alliance' },
    { slug: 'evren', name: 'Evren', label: 'Haircare e-commerce', img: S + 'evren.webp', thumb: S + 'evren-sm.webp', url: 'https://www.beyourown.in/work/evren' }
  ];

  const make = [
    { k: 'Real-time 3D experiences', text: 'Scroll-directed WebGL worlds: modelled in code, lit like a studio, timed like an edit.', refs: ['rosso', 'cafe', 'uniques'] },
    { k: '3D product and commerce', text: 'Products you can turn, open and size up: glass that refracts, TVs that light the room, configurators and AR.', refs: ['lusso', 'onfinity'] },
    { k: 'Cinematic landing pages', text: 'One continuous world where every section is a camera move, with fallbacks that keep the content readable.', refs: ['skillcures', 'uniques', 'sorvine'] },
    { k: 'Product platforms', text: 'The systems behind the screen: Next.js apps, Fastify APIs, Postgres and Redis, admin consoles and release gates.', refs: ['cricketlive', 'futureed', 'ledger'] },
    { k: 'Motion and sound', text: 'Timelines, transitions and sound designed together: engine notes and showroom hums synthesised with Web Audio.', refs: ['rosso', 'onfinity'] },
    { k: 'Studio work', text: 'Sites and platforms for clients of BE YOUR OWN, the brand, digital and growth studio in Banur.', refs: ['futureed', 'lusso'], studio: true }
  ];

  const timeline = [
    { y: '2024', t: 'First full-stack builds', d: 'Educational web and a first backend: the start of shipping things people use.', tags: ['Educational web', 'Backend'] },
    { y: '2025', t: 'Products and dashboards', d: 'TechLearns, a dashboard app and cloud work on AWS.', tags: ['TechLearns', 'Dashboard app', 'AWS'] },
    { y: '2026', t: 'Platforms in production', d: 'Task management, seat allocation, a finance and ledger system and admissions platforms.', tags: ['Ledger Go Digitify', 'Future Education', 'Seat allocation'] },
    { y: 'Oct', t: 'Into real-time 3D', d: 'Perfume bottles modelled from photography, particle hands that become a brain, and a community you fly through.', tags: ['Lusso di Firenze', 'Sorvine', 'The Uniques'] },
    { y: 'Nov', t: 'Worlds you can walk into', d: 'A procedural V8, a café on a New York corner, a TV showroom with AR, a pharma careers world and a live-scores platform for 10k users.', tags: ['Rosso', 'Corner Café', 'Onfinity', 'SkillCures', 'CricketLive'] },
    { y: 'Now', t: 'Building with BE YOUR OWN', d: 'Real-time 3D, motion and product work for brands, from Banur, Punjab.', tags: ['Open to projects'] }
  ];

  const words = ['3D', 'WebGL', 'Shaders', 'Motion', 'Sound', 'Scroll', 'Commerce', 'Products', 'Next.js', 'APIs', 'Data', 'Sites'];

  return { projects, featured, by, studio, make, timeline, words };
})();
