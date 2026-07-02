/* ════════════════════════════════════════
   FALLING STARS (Welcome Canvas)
════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let animId;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function createStar() {
    return {
      x:    Math.random() * canvas.width,
      y:    -10,
      len:  Math.random() * 14 + 6,
      spd:  Math.random() * 2.5 + 1.5,
      opac: Math.random() * 0.6 + 0.3,
      dx:   (Math.random() - 0.5) * 1.2,
    };
  }

  for (let i = 0; i < 60; i++) {
    stars.push({ ...createStar(), y: Math.random() * canvas.height });
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      ctx.save();
      ctx.globalAlpha = s.opac;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth   = 1.5;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + s.dx * s.len * 0.4, s.y + s.len);
      ctx.stroke();
      ctx.restore();

      s.y   += s.spd;
      s.x   += s.dx;
      s.opac -= 0.003;

      if (s.y > canvas.height + 10 || s.opac <= 0) {
        Object.assign(s, createStar());
      }
    });
    animId = requestAnimationFrame(drawStars);
  }
  drawStars();

  // Stop & hide when welcome ends
  window._stopStars = function() {
    cancelAnimationFrame(animId);
    canvas.style.transition = 'opacity 1s';
    canvas.style.opacity = '0';
    setTimeout(() => canvas.style.display = 'none', 1200);
  };
})();


/* ════════════════════════════════════════
   WELCOME → MAIN TRANSITION
════════════════════════════════════════ */
const openBtn     = document.getElementById('open-btn');
const welcome     = document.getElementById('welcome-screen');
const main        = document.getElementById('main-screen');
const audio       = document.getElementById('bg-music');
const speakerBtn  = document.getElementById('speaker-btn');

openBtn.addEventListener('click', function () {
  // 1. Fade out welcome
  welcome.classList.add('hidden');

  // 2. Stop stars
  window._stopStars && window._stopStars();

  // 3. Play audio (summer slime / lagu.mp3)
  audio.volume = 0.55;
  audio.play().catch(() => {/* autoplay blocked — user already clicked, should be fine */});

  // 4. Show main screen
  setTimeout(() => {
    main.classList.add('visible');
  }, 200);

  // 5. Show speaker button
  setTimeout(() => {
    speakerBtn.style.display = 'flex';
    speakerBtn.classList.add('playing');
  }, 600);

  // 6. Start falling particles
  startParticles();
});


/* ════════════════════════════════════════
   SPEAKER TOGGLE
════════════════════════════════════════ */
let isMuted = false;
speakerBtn.addEventListener('click', function () {
  isMuted = !isMuted;
  if (isMuted) {
    audio.pause();
    speakerBtn.textContent = '🔇';
    speakerBtn.classList.add('muted');
    speakerBtn.classList.remove('playing');
  } else {
    audio.play();
    speakerBtn.textContent = '🔊';
    speakerBtn.classList.remove('muted');
    speakerBtn.classList.add('playing');
  }
});


/* ════════════════════════════════════════
   FALLING PARTICLES (Main Screen)
════════════════════════════════════════ */
const PARTICLES = ['🌸', '💖', '🌷', '✨', '💕', '🎀', '🩷', '🌺', '⭐', '💗'];

function createParticle() {
  const el = document.createElement('span');
  el.className = 'particle';
  el.textContent = PARTICLES[Math.floor(Math.random() * PARTICLES.length)];

  const left    = Math.random() * 100;
  const dur     = Math.random() * 6 + 6;   // 6–12s
  const delay   = Math.random() * 10;
  const size    = Math.random() * 0.9 + 0.7;

  el.style.cssText = `
    left: ${left}%;
    font-size: ${size}rem;
    animation-duration: ${dur}s;
    animation-delay: ${-delay}s;
  `;
  document.body.appendChild(el);
}

function startParticles() {
  for (let i = 0; i < 28; i++) createParticle();
}


/* ════════════════════════════════════════
   WISH CAROUSEL
════════════════════════════════════════ */
(function () {
  const inner  = document.getElementById('wish-inner');
  const dotsEl = document.getElementById('wish-dots');
  const slides = inner.querySelectorAll('.wish-slide');
  let current  = 0;
  let autoTimer;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'wish-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(idx) {
    slides[current].style.opacity = '0.3';
    inner.style.transform = `translateX(-${idx * 100}%)`;
    dotsEl.querySelectorAll('.wish-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });
    current = idx;
  }

  function autoPlay() {
    autoTimer = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 3500);
  }

  // Pause on hover
  inner.parentElement.addEventListener('mouseenter', () => clearInterval(autoTimer));
  inner.parentElement.addEventListener('mouseleave', () => autoPlay());

  // Touch swipe
  let touchX = 0;
  inner.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  inner.addEventListener('touchend', e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0
        ? Math.min(current + 1, slides.length - 1)
        : Math.max(current - 1, 0));
    }
  });

  autoPlay();
})();


/* ════════════════════════════════════════
   PHOTO LIGHTBOX
════════════════════════════════════════ */
(function () {
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lightbox-img');
  const lbClose   = document.getElementById('lightbox-close');
  const photos    = document.querySelectorAll('.photo-wrap');
  const srcs      = ['foto1.jpg','foto2.jpg','foto3.jpg','foto4.jpg','foto5.jpg'];

  photos.forEach((wrap, i) => {
    wrap.addEventListener('click', () => {
      lbImg.src = srcs[i];
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  lbClose.addEventListener('click', closeLb);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

  function closeLb() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
})();


/* ════════════════════════════════════════
   SCROLL PROGRESS BAR
════════════════════════════════════════ */
window.addEventListener('scroll', function () {
  const scrollTop = document.documentElement.scrollTop;
  const scrollH   = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const pct       = scrollH > 0 ? (scrollTop / scrollH) * 100 : 0;
  document.getElementById('progress-bar').style.width = pct + '%';
}, { passive: true });


/* ════════════════════════════════════════
   FADE-IN ON SCROLL (Intersection Observer)
════════════════════════════════════════ */
(function () {
  const els = document.querySelectorAll('.card, .gallery, .wishes-section');
  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity  = '1';
        e.target.style.transform = 'translateY(0)';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
})();
