/**
 * HamriMed — main.js
 * GSAP 3.12 + ScrollTrigger + Lenis smooth scroll
 * Scroll-journey: 3-stage pinned hero with image crossfade
 */

/* ============================================================
   UTILITIES
   ============================================================ */
const lerp  = (a, b, t) => a + (b - a) * t;
const clamp = (v, mn, mx) => Math.min(Math.max(v, mn), mx);
const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
const isTouch  = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;
const qs  = (s, ctx = document) => ctx.querySelector(s);
const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ============================================================
   1. LENIS + GSAP SYNC
   ============================================================ */
const initLenis = () => {
  const lenis = new Lenis({
    duration: 1.3,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1.0,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
};

/* ============================================================
   2. SCROLL JOURNEY — pinned hero with image crossfade
   ============================================================ */
const initScrollJourney = () => {
  const scene = qs('#scene');
  if (!scene) return;

  // Elements
  const imgA  = qs('#jimg-a');
  const imgB  = qs('#jimg-b');
  const imgC  = qs('#jimg-c');
  const st0   = qs('#jstage-0');
  const st1   = qs('#jstage-1');
  const st2   = qs('#jstage-2');
  const pills = qsa('.pill');
  const dots  = qsa('.jdot');
  const cue   = qs('#scroll-cue');

  // Hero text elements
  const badge = qs('#s0-badge');
  const dl1   = qs('#dl-1');
  const dl2   = qs('#dl-2');
  const dl3   = qs('#dl-3');
  const sub   = qs('#s0-sub');

  // ── SET initial GSAP states (overrides CSS for GSAP-managed elements) ──
  gsap.set([badge, dl1, dl2, dl3, sub], { opacity: 0, y: 40 });
  gsap.set(cue, { opacity: 0, y: 12 });
  gsap.set([imgB, imgC], { opacity: 0 });
  gsap.set([st1, st2], { opacity: 0 });
  gsap.set(pills, { opacity: 0, x: 36 });
  gsap.set(st1.querySelector('.jstage__left'), { opacity: 0, x: -24 });

  // ── HERO ENTRANCE (time-based, fires on load) ──
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', clearProps: 'all' } });

  heroTl
    .to(badge, { opacity: 1, y: 0, duration: .7 }, .5)
    .to(dl1,  { opacity: 1, y: 0, duration: .9 }, .75)
    .to(dl2,  { opacity: 1, y: 0, duration: .9 }, .88)
    .to(dl3,  { opacity: 1, y: 0, duration: .9 }, 1.0)
    .to(sub,  { opacity: 1, y: 0, duration: .7 }, 1.1)
    .to(cue,  { opacity: 1, y: 0, duration: .7 }, 1.3);

  // ── SCROLL-PINNED TIMELINE ──
  // scene is pinned for 3 × 100vh of scroll distance
  const main = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: scene,
      start: 'top top',
      end: '+=300%',
      pin: true,
      pinSpacing: true,
      scrub: 1.1,
      onUpdate: self => {
        // progress dots
        const p      = self.progress;
        const active = p < 0.35 ? 0 : p < 0.68 ? 1 : 2;
        dots.forEach((d, i) => d.classList.toggle('is-active', i === active));
      },
    },
  });

  /* ─── PHASE 1 (0 → 0.22): stage-0 exits ─── */
  main
    .to([badge, sub], { opacity: 0, y: -24, duration: .12 }, 0)
    .to([dl1, dl2, dl3], { opacity: 0, y: -44, stagger: .03, duration: .15 }, 0)
    .to(cue, { opacity: 0, duration: .08 }, 0)

  /* ─── PHASE 2 (0.18 → 0.42): image A → image B ─── */
    .to(imgA, { opacity: .0, duration: .22, ease: 'power1.inOut' }, 0.18)
    .to(imgB, { opacity: 1, duration: .22, ease: 'power1.inOut' }, 0.18)
    .fromTo(imgB, { scale: 1.1 }, { scale: 1, duration: .28 }, 0.18)

  /* ─── PHASE 3 (0.24 → 0.52): stage-1 content in ─── */
    .to(st1, {
      opacity: 1, duration: .18,
      onStart()          { st1.style.pointerEvents = 'auto'; },
      onReverseComplete(){ st1.style.pointerEvents = 'none'; },
    }, 0.24)
    .to(st1.querySelector('.jstage__left'), {
      opacity: 1, x: 0, duration: .2, ease: 'power2.out',
    }, 0.27);

  // Pills stagger in
  pills.forEach((pill, i) => {
    main.to(pill, {
      opacity: 1, x: 0, duration: .16, ease: 'power2.out',
    }, 0.31 + i * 0.04);
  });

  /* ─── PHASE 4 (0.58 → 0.70): stage-1 exits ─── */
  main
    .to(st1, {
      opacity: 0, duration: .12, ease: 'power2.in',
      onStart()          { st1.style.pointerEvents = 'none'; },
    }, 0.58)

  /* ─── PHASE 5 (0.64 → 0.82): image B → image C ─── */
    .to(imgB, { opacity: 0, duration: .2, ease: 'power1.inOut' }, 0.64)
    .to(imgC, { opacity: 1, duration: .22, ease: 'power1.inOut' }, 0.65)
    .fromTo(imgC, { scale: 1.08 }, { scale: 1, duration: .26 }, 0.65)

  /* ─── PHASE 6 (0.72 → 0.95): stage-2 CTA ─── */
    .to(st2, {
      opacity: 1, duration: .2,
      onStart()          { st2.style.pointerEvents = 'auto'; },
      onReverseComplete(){ st2.style.pointerEvents = 'none'; },
    }, 0.72)
    .from(st2.querySelector('.jstage__center'), {
      y: 28, duration: .22, ease: 'power2.out',
    }, 0.72);
};

/* ============================================================
   3. CUSTOM CURSOR (lerp RAF)
   ============================================================ */
const initCursor = () => {
  const dot  = qs('#cursor');
  const ring = qs('#cursor-ring');
  if (!dot || !ring || isTouch()) {
    dot?.style  && (dot.style.display  = 'none');
    ring?.style && (ring.style.display = 'none');
    return;
  }

  let mx = -200, my = -200;
  let dx = -200, dy = -200;
  let rx = -200, ry = -200;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function loop() {
    dx = lerp(dx, mx, 0.22);
    dy = lerp(dy, my, 0.22);
    rx = lerp(rx, mx, 0.09);
    ry = lerp(ry, my, 0.09);
    dot.style.transform  = `translate(${dx - 4}px, ${dy - 4}px)`;
    ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
    requestAnimationFrame(loop);
  })();

  const targets = qsa('a, button, .pcard, .tcard, .pill, .step');
  targets.forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('is-hover'); ring.classList.add('is-hover'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('is-hover'); ring.classList.remove('is-hover'); });
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
};

/* ============================================================
   4. SCROLL PROGRESS BAR
   ============================================================ */
const initScrollBar = () => {
  const bar = qs('#scroll-bar');
  if (!bar) return;

  const update = () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = docH > 0 ? `${(window.scrollY / docH) * 100}%` : '0%';
  };

  window.addEventListener('scroll', update, { passive: true });
};

/* ============================================================
   5. HEADER SCROLL STATE
   ============================================================ */
const initHeader = () => {
  const header = qs('#header');
  if (!header) return;

  const update = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', update, { passive: true });
};

/* ============================================================
   6. HAMBURGER MENU
   ============================================================ */
const initHamburger = () => {
  const btn   = qs('#hamburger');
  const links = qs('#nav-links');
  if (!btn || !links) return;

  const close = () => {
    btn.classList.remove('is-open');
    links.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('is-open');
    links.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  qsa('a', links).forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
};

/* ============================================================
   7. FADE-UP (Intersection Observer, for below-fold sections)
   ============================================================ */
const initFadeUp = () => {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.09, rootMargin: '0px 0px -36px 0px' });

  qsa('.fade-up').forEach(el => io.observe(el));
};

/* ============================================================
   8. ANIMATED COUNTERS
   ============================================================ */
const initCounters = () => {
  const els = qsa('.stat__n[data-target]');
  if (!els.length) return;

  const ease = t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.target, 10);
      const start  = performance.now();
      const dur    = 1800;

      (function tick(now) {
        const t = clamp((now - start) / dur, 0, 1);
        el.textContent = Math.round(ease(t) * target);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      })(start);

      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  els.forEach(el => io.observe(el));
};

/* ============================================================
   9. SMOOTH SCROLL (offset for pinned header)
   ============================================================ */
const initSmoothLinks = () => {
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = qs(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
};

/* ============================================================
   10. LANGUAGE SWITCHER
   ============================================================ */
const initLang = () => {
  const msgs = { EN: 'English version – Coming soon 🇬🇧', FR: 'Version française – Bientôt disponible 🇫🇷' };
  qsa('.lang-btn').forEach(btn => {
    if (btn.dataset.lang === 'PL') btn.classList.add('active');
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang !== 'PL') alert(msgs[lang] || 'Bientôt disponible');
    });
  });
};

/* ============================================================
   11. PRODUCT CARD TILT (desktop)
   ============================================================ */
const initTilt = () => {
  if (isMobile()) return;
  qsa('.pcard').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
      const rx = clamp(-dy * 5, -5, 5);
      const ry = clamp( dx * 5, -5, 5);
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
      card.style.transform  = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
      setTimeout(() => (card.style.transition = ''), 520);
    });
  });
};

/* ============================================================
   INIT — DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  initLenis();         // MUST be before ScrollTrigger animations
  initScrollJourney(); // Core scroll effect
  initCursor();
  initScrollBar();
  initHeader();
  initHamburger();
  initFadeUp();
  initCounters();
  initSmoothLinks();
  initLang();
  initTilt();
});
