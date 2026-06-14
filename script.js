/* ════════════════════════════════
   LIMIE.ARTS — script.js
════════════════════════════════ */

// ── Nav scroll + mobile toggle ──
const nav       = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ── Nav active highlight on scroll ──
document.querySelectorAll('section[id]').forEach(s => {
  new IntersectionObserver(entries => {
    entries.forEach(x => {
      if (x.isIntersecting)
        document.querySelectorAll('.nav-links a').forEach(a =>
          a.classList.toggle('active', a.getAttribute('href') === '#' + x.target.id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' }).observe(s);
});

// ── Currency toggle ──
function setCur(c, btn) {
  document.querySelectorAll('.cb').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  document.querySelectorAll('.price[data-eur]').forEach(el => {
    const v = c === 'eur' ? el.dataset.eur : el.dataset.usd;
    const s = c === 'eur' ? '€' : '$';
    el.innerHTML = v + '<span class="s">' + s + '</span>';
  });
}

// ── Commission tabs ──
function showTab(id, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.comm-tab').forEach(b => b.classList.remove('on'));
  const panel = document.getElementById('tp-' + id);
  if (panel) panel.classList.add('on');
  btn.classList.add('on');
  // re-init carousels on tab switch
  if (id === 'refs' || id === 'customs' || id === 'jellis') {
    setTimeout(() => initCarousel(id), 50);
  }
}

// ── Lightbox ──
function openLb(title, price, el) {
  document.getElementById('lb-t').textContent = title;
  const eur = document.querySelector('.cb.on') && document.querySelector('.cb.on').textContent.includes('EUR');
  if (price === 'Open to discuss') {
    document.getElementById('lb-p').textContent = 'Open to discuss 💬';
  } else {
    const v = parseFloat(price);
    if (!isNaN(v)) {
      document.getElementById('lb-p').textContent = eur ? v + '€' : Math.round(v * 1.1) + '$';
    } else {
      document.getElementById('lb-p').textContent = price || '';
    }
  }

  const wrap = document.getElementById('lb-img');
  wrap.innerHTML = '';

  const srcImg = el && el.querySelector && el.querySelector('img');
  if (srcImg && srcImg.complete && srcImg.naturalWidth > 0) {
    const img = document.createElement('img');
    img.src = srcImg.src; img.alt = title; img.loading = 'lazy';
    wrap.appendChild(img);
  } else {
    const ph = el && el.querySelector && el.querySelector('.art-ph');
    if (ph) {
      const c = ph.cloneNode(true);
      c.style.cssText = 'width:100%;min-height:220px;cursor:default;';
      wrap.appendChild(c);
    } else wrap.textContent = '🖼️';
  }

  document.getElementById('lb').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLb(e) {
  const lb = document.getElementById('lb');
  if (e && e.target !== lb && !e.target.classList.contains('lb-x')) return;
  lb.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('lb').classList.contains('open'))
    closeLb({ target: document.getElementById('lb') });
});

// ── Carousel ──
const carousels = {};
function initCarousel(id) {
  const track = document.getElementById('car-' + id);
  if (!track) return;
  const items = track.querySelectorAll('.car-item');
  const dotsWrap = document.getElementById('dots-' + id);
  if (!dotsWrap) return;
  dotsWrap.innerHTML = '';
  const getVisible = () => {
    const w = track.parentElement.parentElement.offsetWidth;
    if (w < 420) return 1; if (w < 700) return 2; return 3;
  };
  const totalDots = () => Math.ceil(items.length / getVisible());
  let cur = 0;
  const buildDots = () => {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalDots(); i++) {
      const d = document.createElement('button');
      d.className = 'car-dot' + (i === cur ? ' on' : '');
      d.onclick = () => goTo(i);
      dotsWrap.appendChild(d);
    }
  };
  const goTo = (idx) => {
    cur = Math.max(0, Math.min(idx, totalDots() - 1));
    const itemW = items[0].offsetWidth + 16;
    track.scrollTo({ left: cur * getVisible() * itemW, behavior: 'smooth' });
    buildDots();
  };
  track.addEventListener('scroll', () => {
    const itemW = items[0].offsetWidth + 16;
    cur = Math.round(track.scrollLeft / (getVisible() * itemW));
    buildDots();
  }, { passive: true });
  carousels[id] = goTo;
  buildDots();
}
function carMove(id, dir) {
  if (!carousels[id]) return;
  const track = document.getElementById('car-' + id);
  const items = track.querySelectorAll('.car-item');
  const getVisible = () => {
    const w = track.parentElement.parentElement.offsetWidth;
    if (w < 420) return 1; if (w < 700) return 2; return 3;
  };
  const dotsWrap = document.getElementById('dots-' + id);
  let cur = [...dotsWrap.querySelectorAll('.car-dot')].findIndex(d => d.classList.contains('on'));
  carousels[id](cur + dir);
}

// ── Init carousels on load ──
window.addEventListener('DOMContentLoaded', () => {
  initCarousel('refs');
  initCarousel('customs');
  initCarousel('jellis');
});

// ── Scroll-reveal ──
const revealEls = document.querySelectorAll(
  '.social-card, .pc, .will-panel, .gc, .tos-item, .trait, .spc, .addons-strip, .jelli-comm-intro'
);
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity  = '1';
        entry.target.style.transform = entry.target.style.transform.replace('translateY(22px)', 'translateY(0)');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07 });
  revealEls.forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = (el.style.transform || '') + ' translateY(22px)';
    el.style.transition = `opacity .5s ease ${(i % 5) * 60}ms, transform .5s ease ${(i % 5) * 60}ms`;
    io.observe(el);
  });
}
