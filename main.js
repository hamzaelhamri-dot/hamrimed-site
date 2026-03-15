/**
 * HamriMed — main.js PREMIUM
 * Gère : curseur custom, scroll animations (fade + slide), header, hamburger, FAQ, langue, smooth scroll
 */

/* ============================================================
   1. CURSEUR PERSONNALISÉ
   ============================================================ */
const initCustomCursor = () => {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  // Détection touch — désactive sur mobile
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    cursor.style.display = 'none';
    return;
  }

  let mouseX = -100, mouseY = -100;
  let cursorX = -100, cursorY = -100;
  let rafId;

  // Déplace le curseur en suivant la souris avec lerp pour fluidité
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Boucle animation RAF pour interpolation douce
  const animateCursor = () => {
    // Lerp (interpolation linéaire) pour un suivi fluide
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;

    cursor.style.transform = `translate(${cursorX - cursor.offsetWidth / 2}px, ${cursorY - cursor.offsetHeight / 2}px)`;

    rafId = requestAnimationFrame(animateCursor);
  };

  animateCursor();

  // Agrandissement au hover sur éléments interactifs
  const interactiveEls = document.querySelectorAll('a, button, .product-card, .advantage-card, .review-card, .faq-question');
  interactiveEls.forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-enlarged'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-enlarged'));
  });

  // Masquer le curseur quand il quitte la fenêtre
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '0.7'; });
};

/* ============================================================
   2. INTERSECTION OBSERVER — fade-in + slide-left au scroll
   ============================================================ */
const initScrollAnimations = () => {
  // Éléments fade-in classiques
  const fadeElements  = document.querySelectorAll('.fade-in');
  // Éléments slide depuis la gauche (cartes produits)
  const slideElements = document.querySelectorAll('.slide-left');

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach((el)  => observer.observe(el));
  slideElements.forEach((el) => observer.observe(el));
};

/* ============================================================
   3. HEADER — Fond blanc + ombre au scroll
   ============================================================ */
const initHeaderScroll = () => {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
};

/* ============================================================
   4. MENU HAMBURGER MOBILE
   ============================================================ */
const initHamburger = () => {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('is-open');
    navLinks.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    hamburger.setAttribute('aria-label', isOpen ? 'Zamknij menu' : 'Otwórz menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('is-open');
      navLinks.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Otwórz menu');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.classList.contains('is-open')) {
      hamburger.classList.remove('is-open');
      navLinks.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Otwórz menu');
      document.body.style.overflow = '';
      hamburger.focus();
    }
  });
};

/* ============================================================
   5. FAQ ACCORDION
   ============================================================ */
const initFaqAccordion = () => {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isExpanded = question.getAttribute('aria-expanded') === 'true';

      // Ferme tous les autres
      faqItems.forEach((otherItem) => {
        const oQ = otherItem.querySelector('.faq-question');
        const oA = otherItem.querySelector('.faq-answer');
        if (oQ && oA && otherItem !== item) {
          oQ.setAttribute('aria-expanded', 'false');
          oA.setAttribute('hidden', '');
        }
      });

      if (isExpanded) {
        question.setAttribute('aria-expanded', 'false');
        answer.setAttribute('hidden', '');
      } else {
        question.setAttribute('aria-expanded', 'true');
        answer.removeAttribute('hidden');
      }
    });
  });
};

/* ============================================================
   6. SÉLECTEUR DE LANGUE
   ============================================================ */
const initLanguageSwitcher = () => {
  const langButtons = document.querySelectorAll('.lang-btn');

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang === 'PL') return;

      // REMPLACER PAR vraie redirection i18n plus tard
      const messages = {
        FR: 'La version française sera bientôt disponible. 🇫🇷',
        EN: 'The English version will be available soon. 🇬🇧',
        ES: 'La versión en español estará disponible pronto. 🇪🇸',
      };

      alert(messages[lang] || 'Bientôt disponible');
    });
  });
};

/* ============================================================
   7. SMOOTH SCROLL — offset header 68px
   ============================================================ */
const initSmoothScroll = () => {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const headerHeight = 68;
      const elementTop   = targetEl.getBoundingClientRect().top + window.scrollY;
      const offsetTop    = elementTop - headerHeight - 16;

      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  });
};

/* ============================================================
   8. PARALLAXE SUBTIL — hero image au scroll
   ============================================================ */
const initHeroParallax = () => {
  const heroImage = document.querySelector('.hero-image');
  if (!heroImage) return;

  // Désactiver sur mobile pour la performance
  if (window.matchMedia('(max-width: 768px)').matches) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const rate = scrolled * 0.08; // Intensité du parallaxe très léger
    heroImage.style.transform = `translateY(${rate}px)`;
  }, { passive: true });
};

/* ============================================================
   9. INITIALISATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initScrollAnimations();
  initHeaderScroll();
  initHamburger();
  initFaqAccordion();
  initLanguageSwitcher();
  initSmoothScroll();
  initHeroParallax();

  // Les mots .hero-word et éléments .hero-animate s'animent via CSS
  // (animation définie dans styles.css avec --delay, aucun JS requis)
});
