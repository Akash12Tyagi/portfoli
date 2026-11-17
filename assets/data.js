/* BE YOUR OWN — case studies, testimonials and pillars.
   Copy is taken from beyourown.in. Images live in assets/work/. */
window.BYO = (function () {
  const W = 'assets/work/';
  const cases = [
    {
      slug: 'liiaroma', featured: true, name: 'LIIAROMA', sector: 'Fragrance', scope: 'Brand + Web',
      title: 'From a weak online presence to a completely redefined digital identity.',
      timeline: '2–3 months', role: 'Web development + brand identity', url: 'https://www.liiaroma.com', urlLabel: 'liiaroma.com',
      challenge: 'Fragrance is one of the hardest categories to sell online, because the product itself can’t be conveyed through a screen. LIIAROMA’s thin online presence and dated interface meant visitors judged the product off a site that didn’t match it.',
      approach: 'The rebuild was built around one idea: the site itself had to perform the confidence the brand claims. A full digital rebuild rather than a surface refresh, with new structure, new presentation and credibility signals throughout.',
      imgs: ['liiaroma', 'liiaroma-1', 'liiaroma-2']
    },
    {
      slug: 'bobochi', featured: true, name: 'BoBoChi Kids', sector: 'Kidswear', scope: 'Brand + E-Commerce',
      title: 'Brand identity and e-commerce platform for a premium kids’ fashion label.',
      timeline: '2–3 months', role: 'Brand identity + e-commerce website', url: 'https://www.instagram.com/bobochi.india', urlLabel: 'instagram.com/bobochi.india',
      challenge: 'BoBoChi was another name in a kids’ fashion market where almost nobody has a defined identity. A customer could like a product and still forget who sold it ten minutes later.',
      approach: 'The strategy started from who’s actually buying, not who’s wearing it. Every decision, from the palette to the navigation to the language that earns trust, was made for the parent making the purchase.',
      result: { v: '3x', l: 'Growth since launch' },
      imgs: ['bobochi', 'bobochi-1', 'bobochi-2']
    },
    {
      slug: 'abrocare', featured: true, name: 'AbroCare', sector: 'Fintech', scope: 'Study Abroad Platform',
      title: 'Financial services platform for international students.',
      timeline: '2–3 months', role: 'Fintech platform design + development', url: 'https://www.abrocare.com', urlLabel: 'abrocare.com',
      challenge: 'GIC accounts for Canada, Blocked Accounts for Germany, health cover for Australia and Forex: each a different product, partner bank and rulebook, where one wrong piece can derail a visa against a hard deadline.',
      approach: 'Organised around exact use case, with named, checkable partners (ICICI Bank Canada, RBC, Fintiba at Sutor Bank) instead of vague trust signals, and an agent commission track running alongside the student-facing services.',
      result: { v: '2x', l: 'Earnings growth, up to' },
      imgs: ['abrocare', 'abrocare-2', 'abrocare-1']
    },
    {
      slug: 'orveet', featured: true, name: 'Orveet', sector: 'Streetwear', scope: 'Brand + E-Commerce',
      title: 'Digital presence and e-commerce experience for a premium streetwear label.',
      timeline: '2–3 months', role: 'Digital presence + e-commerce experience', stack: 'Shopify', url: 'https://www.instagram.com/orveet.official', urlLabel: 'instagram.com/orveet.official',
      challenge: 'Minimalism reads as “premium and confident” only when every remaining detail is executed with precision. There is very little space between “elevated” and “empty”.',
      approach: 'Built to prove the “minimal, premium” claim rather than repeat it: deeper product architecture, naming in the same restrained voice, transparent pricing and a real trust layer.',
      imgs: ['orveet', 'orveet-1', 'orveet-2']
    },
    {
      slug: 'sviet', featured: true, name: 'SVIET', sector: 'Education', scope: 'Digital transformation',
      title: 'Placements page and outcomes presentation for a multi-disciplinary institute.',
      timeline: '2–3 months', role: 'Placements page + outcomes presentation', url: 'https://www.sviet.ac.in', urlLabel: 'sviet.ac.in',
      challenge: 'Indian higher-ed marketing is saturated with placement claims, and families have learned to discount them. A genuinely good number no longer reads as credible on its own.',
      approach: 'A placements page built to survive being checked, not just read: real trends, real students and the operational machinery behind the numbers, laid out for a skeptical parent to inspect.',
      imgs: ['sviet', 'sviet-2', 'sviet-1']
    },
    {
      slug: 'vyomrita', featured: true, name: 'Vyomrita', sector: 'Ayurveda', scope: 'Brand + Website + Social',
      title: 'Building an Ayurvedic brand from the ground up, from first idea to first sale.',
      role: 'Strategy, identity, website and social, end to end', stack: 'Shopify',
      challenge: 'Vyomrita began as a conviction, not a brand: no name people knew, no look, no website, no audience, in a market where established labels already own the premium shelf.',
      approach: 'Every piece tied to a single thought: Ayurveda you can trust, because it’s tested like medicine. If a word, colour or page didn’t serve that, it didn’t make it in.',
      imgs: ['vyomrita', 'vyomrita-1', 'vyomrita-2']
    },
    {
      slug: 'evren', featured: true, name: 'Evren', sector: 'Hair care', scope: 'Brand + Growth',
      title: 'E-commerce UX rebuild, brand enhancement and SEO for an Ayurvedic haircare label.',
      timeline: '2–3 months', role: 'Brand identity + e-commerce UX rebuild', stack: 'Shopify', url: 'https://www.instagram.com/the.evren.store', urlLabel: 'instagram.com/the.evren.store',
      challenge: 'Evren’s problem wasn’t demand, it was conversion. The site added friction exactly where shoppers compare products by concern, check trust signals and choose between bundles.',
      approach: 'Three fronts that reinforce each other: a UX redesign from problem to checkout, a sharper identity that earns first-time trust, and search visibility so the new store had traffic to convert.',
      result: { v: '₹1L', l: 'Sales in the first month' },
      imgs: ['evren', 'evren-1', 'evren-2']
    },
    {
      slug: 'alliance', featured: true, name: 'Alliance', sector: 'Education', scope: 'Communication software',
      title: 'Software that lets a school talk to its audience, conveniently.',
      role: 'Communication software design + development', url: 'https://www.ais.ac.in', urlLabel: 'ais.ac.in',
      challenge: 'A school speaks to many people at once: families deciding on admission, parents already in the school, candidates looking for a job. Alliance needed one convenient way to reach all of them.',
      approach: 'Built around how the school actually communicates: the admissions enquiry on every page, with educators, infrastructure, life at Alliance, a gallery and jobs, each easy for the school to keep current.',
      imgs: ['alliance']
    },
    {
      slug: 'lms', name: 'LMS FutureEd', sector: 'Education', scope: 'Lead management system',
      title: 'One system that makes running admissions easy for the institute.',
      role: 'Lead management system design + development', stack: 'Turborepo, Fastify, Next.js, Prisma, Redis/BullMQ, Cloudflare R2',
      challenge: 'An admissions counselling practice lives or dies on response time, and Meta Lead Ads deliver leads faster than a spreadsheet can absorb them.',
      approach: 'Leads arrive straight from Meta Lead Ads, move through the admissions workflow and end in a generated PDF admission form with files stored securely. Built across 18+ phases.',
      imgs: ['lms']
    },
    {
      slug: 'csawdrip', name: 'CSAWDRIP', sector: 'Streetwear', scope: 'Brand + E-Commerce',
      title: 'E-commerce and product-line presentation for a concept-driven streetwear label.',
      timeline: '2–3 months', role: 'E-commerce experience + product-line presentation', stack: 'Shopify', url: 'https://www.instagram.com/csaw_drip', urlLabel: 'instagram.com/csaw_drip',
      challenge: 'A clever concept like “seesaw” is either the sharpest thing about a streetwear brand or the thing that quietly disappears the moment someone starts browsing.',
      approach: 'The seesaw concept lives in specifics: in what products are actually called, and in a shopping experience simple enough that the personality sits in the naming.',
      imgs: ['csawdrip', 'csawdrip-1', 'csawdrip-2']
    },
    {
      slug: 'tailored-paw', name: 'Tailored Paw', sector: 'Pet accessories', scope: 'E-Commerce + Conversion',
      title: 'E-commerce experience for a personalization-first pet accessories brand.',
      timeline: '2–3 months', role: 'E-commerce experience + conversion design', url: 'https://www.instagram.com/tailoredpaw', urlLabel: 'instagram.com/tailoredpaw',
      challenge: 'Asking someone to upload a photo and commit to something custom-made raises the stakes of the purchase at exactly the moment they’re asked to do the most work.',
      approach: 'Answer “what if my custom order doesn’t turn out right” at the moment of decision, with a guarantee and a photo guide that close the most common failure point.',
      imgs: ['tailored-paw', 'tailored-paw-1', 'tailored-paw-2']
    },
    {
      slug: 'jcm', name: 'JCM', sector: 'Streetwear', scope: 'Meta + Branding + Website',
      title: 'Meta ads, branding and a rebuilt site for a premium 240 GSM tee.',
      role: 'Meta advertising + branding + website redesign', url: 'https://www.instagram.com/jcm.tshirts', urlLabel: 'instagram.com/jcm.tshirts',
      challenge: 'A 240 GSM tee costs more than the 180 GSM the category runs on, and that difference is invisible in a product photo.',
      approach: 'Branding gave “Be different in the world” a consistent voice, the site made the 51-piece range read clearly, and Meta ads took the same message to the people most likely to pay for it.',
      imgs: ['jcm']
    },
    {
      slug: 'evvo', name: 'EVVO', sector: 'Mobility', scope: 'Launch',
      title: 'From an app in development to a live digital product.',
      role: 'Launch + digital presence', url: 'https://evvoelectric.com', urlLabel: 'evvoelectric.com',
      challenge: 'EVVO came to us pre-launch, with the product still in development.',
      approach: 'We took EVVO from concept to an online launch, shaping its digital presence and bringing the product to market as a live, accessible platform.',
      imgs: ['evvo']
    },
    {
      slug: 'lusso', name: 'Lusso Di Firenze', sector: 'Fragrance', scope: 'Meta ad creative',
      title: 'Italian-inspired fragrance, assembled into a signature scent.',
      role: 'Meta ad campaign creative + audience targeting', url: 'https://www.instagram.com/lussodifirenze', urlLabel: 'instagram.com/lussodifirenze',
      challenge: 'Fragrance cannot be sampled online and an unknown house has no shelf to borrow trust from.',
      approach: 'Campaign creative built around the Rs176 tester and the Build Your Own Box, so a buyer can commit small before committing at full price.',
      imgs: ['lusso']
    },
    {
      slug: 'afterhabit', name: 'After Habit', sector: 'Streetwear', scope: 'Brand guidelines + Social',
      title: 'Brand guidelines and a social presence for a streetwear label built on everyday rituals.',
      role: 'Brand guidelines + social media presence', url: 'https://www.instagram.com/after.habit', urlLabel: 'instagram.com/after.habit',
      challenge: 'Each post, product shot and caption was decided on the day, so the feed looked like a handful of people talking about different things.',
      approach: 'First the rules, then the posts: a written system for how After Habit looks, how it talks and what it never does, with the social presence built on top.'
    },
    {
      slug: 'headtrixx', name: 'HeadTrixx', sector: 'Hair care', scope: 'Brand guidelines + Social',
      title: 'Brand guidelines and a social presence for a haircare brand fixing hard-water damage.',
      role: 'Brand guidelines + social media presence', url: 'https://www.instagram.com/headtrixx.co', urlLabel: 'instagram.com/headtrixx.co',
      challenge: 'Hardly anyone blames the water coming out of their shower for hairfall, and haircare is one of the noisiest shelves online.',
      approach: 'Name the problem people didn’t know they had, then show them the fix, in guidelines and a social presence that sound like an expert.'
    },
    {
      slug: 'modestee-label', name: 'Modestee Label', sector: 'Modest fashion', scope: 'E-Commerce',
      title: 'Premium hijabs and modest wear, priced for every day.',
      url: 'https://www.instagram.com/modesteelabel.in', urlLabel: 'instagram.com/modesteelabel.in',
      challenge: 'Eighty-nine products between Rs79 and Rs594 is a basket business, not a single-purchase one.',
      approach: 'COD at Rs999 and free shipping at Rs1,499 do the work of turning a Rs200 intent into a Rs1,500 order.'
    },
    {
      slug: 'vault-street', name: 'Vault Street', sector: 'Streetwear', scope: 'Brand consulting',
      title: 'From an inconsistent social presence to a stronger brand direction.',
      role: 'Brand consulting', url: 'https://www.instagram.com/vaultstreet.co.in', urlLabel: 'instagram.com/vaultstreet.co.in',
      challenge: 'Vault Street needed a social media makeover and a clearer brand presence.',
      approach: 'We refined their visual direction, communication and overall social presence into something cohesive enough to carry weight.'
    }
  ];
  cases.forEach(c => { c.img = c.imgs ? W + c.imgs[0] + '.webp' : null; c.thumb = c.imgs ? W + c.imgs[0] + '-sm.webp' : null; c.gallery = (c.imgs || []).map(n => W + n + '.webp'); });

  const pillars = [
    { k: 'Define', line: 'Find what’s worth owning.', text: 'Positioning, category strategy and the point of view you’ll be known for.', tags: ['Positioning', 'Category strategy', 'Point of view'], img: W + 'vyomrita-2.webp', ref: 'vyomrita', refLabel: 'Vyomrita, from a blank page' },
    { k: 'Express', line: 'Make it recognizable.', text: 'Naming, identity systems and the language that carries them.', tags: ['Naming', 'Identity systems', 'Language systems'], img: W + 'bobochi.webp', ref: 'bobochi', refLabel: 'BoBoChi Kids identity' },
    { k: 'Build', line: 'Make it real.', text: 'Websites, platforms and the product experience behind them.', tags: ['Websites', 'Platforms', 'Product experience'], img: W + 'abrocare-2.webp', ref: 'abrocare', refLabel: 'AbroCare platform' },
    { k: 'Grow', line: 'Make it compound.', text: 'Campaigns, search and the demand engine that keeps compounding.', tags: ['Campaigns', 'Search', 'Demand engine'], img: W + 'evren-1.webp', ref: 'evren', refLabel: 'Evren, ₹1L in month one' }
  ];

  const quotes = [
    { who: 'BoBoChi', q: 'We didn’t just get a logo, we got a business the market finally understood. We’ve grown roughly 3x since launch, and for the first time, people who’d never heard of us recognize what we stand for.' },
    { who: 'LIIAROMA', q: 'Our old site didn’t look like us at all. It looked like every other perfume seller online. Now it actually feels like the brand we built.' },
    { who: 'Evren', q: 'BE YOUR OWN rebuilt the experience, sharpened the brand, and got us actually found in search. The difference isn’t just new customers, it’s the same customers coming back.' },
    { who: 'SVIET', q: 'Parents don’t just want to hear “95% placement” anymore, they want to see it. This page finally lets them look for themselves instead of taking our word for it.' },
    { who: 'Tailored Paw', q: 'Now the guarantee and the photo guide answer that before anyone even asks it out loud.' },
    { who: 'CSAWDRIP', q: 'What made this work is that “seesaw” shows up in the actual product names now. You get the idea even if you never read a word of the brand copy.' },
    { who: 'Orveet', q: 'We wanted the site to feel as considered as the clothes themselves. Restrained, not empty. That’s exactly what came out of this.' }
  ];

  return { cases, featured: cases.filter(c => c.featured), pillars, quotes, bySlug: Object.fromEntries(cases.map(c => [c.slug, c])) };
})();
