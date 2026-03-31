/* ====================================================
   BIRTHDAY WEBSITE — script.js
   Pure vanilla JS — no dependencies — works on GitHub Pages
   ==================================================== */

'use strict';

/* ──────────────────────────────────────
   UTILITIES
────────────────────────────────────── */
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr   => arr[Math.floor(Math.random() * arr.length)];
const isMob = ()   => window.matchMedia('(hover: none)').matches;
const $     = id   => document.getElementById(id);

/* ──────────────────────────────────────
   CANVAS
────────────────────────────────────── */
const cvs = $('fx-canvas');
const ctx = cvs.getContext('2d');
let W, H;
function resize() { W = cvs.width = window.innerWidth; H = cvs.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

/* ──────────────────────────────────────
   STATE
────────────────────────────────────── */
let rafId      = null;
let canvasMode = 'stars';
let particles  = [];
let floatTimer = null;
let lbImages   = [];
let lbIndex    = 0;
let lbTouchX   = 0;

/* ──────────────────────────────────────
   STAR BACKGROUND
────────────────────────────────────── */
const stars = Array.from({ length: 130 }, () => ({
  x:  rand(0, window.innerWidth),
  y:  rand(0, window.innerHeight),
  r:  rand(0.5, 2.2),
  vy: rand(0.1, 0.35),
  tw: rand(0, Math.PI * 2),
  ts: rand(0.01, 0.035),
}));

function drawStars() {
  ctx.clearRect(0, 0, W, H);
  for (const s of stars) {
    s.y -= s.vy;
    if (s.y < -4) { s.y = H + 4; s.x = rand(0, W); }
    s.tw += s.ts;
    const alpha = 0.3 + 0.7 * Math.abs(Math.sin(s.tw));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }
}

/* ──────────────────────────────────────
   CONFETTI + FIREWORKS PARTICLES
────────────────────────────────────── */
const C_COLORS = [
  '#ff4fa0','#9b59f5','#ffd700','#00e5c8',
  '#ff6b6b','#f7c59f','#a8edea','#fed6e3','#c471ed'
];

function mkConf(x, y) {
  return {
    k:'c', x, y,
    vx: rand(-6,6), vy: rand(-9,-2),
    sz: rand(6,13),
    col: pick(C_COLORS),
    sh: pick(['r','o','s']),   // rect, oval, star
    ang: rand(0, Math.PI*2),
    sp:  rand(-0.15, 0.15),
    gv: 0.22, dr: 0.98,
    op: 1, fd: rand(0.008,0.014),
  };
}

function fireWork(x, y) {
  const hue = rand(0, 360);
  const n   = Math.floor(rand(50, 80));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const sp = rand(2.5, 9.5);
    particles.push({
      k:'s', x, y,
      vx: Math.cos(a)*sp, vy: Math.sin(a)*sp,
      col: `hsl(${hue},100%,68%)`,
      sz: rand(2,5.5), gv:0.12, dr:0.94,
      op:1, fd: rand(0.018, 0.03),
    });
  }
  for (let i = 0; i < 20; i++) {
    particles.push({
      k:'s', x: x+rand(-12,12), y: y+rand(-12,12),
      vx: rand(-1.2,1.2), vy: rand(-1.2,1.2),
      col: `hsl(${hue+50},100%,82%)`,
      sz: rand(1,3), gv:0, dr:0.99,
      op:1, fd: rand(0.02, 0.04),
    });
  }
}

function drawStar5(cx, cy, r, col, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const o = (i/5)*Math.PI*2 - Math.PI/2;
    const inn = o + Math.PI/5;
    if (i===0) ctx.moveTo(cx+r*Math.cos(o), cy+r*Math.sin(o));
    else        ctx.lineTo(cx+r*Math.cos(o), cy+r*Math.sin(o));
    ctx.lineTo(cx+r*0.42*Math.cos(inn), cy+r*0.42*Math.sin(inn));
  }
  ctx.closePath(); ctx.fill(); ctx.restore();
}

function updateParticles() {
  ctx.clearRect(0, 0, W, H);
  particles = particles.filter(p => p.op > 0.015);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy;
    p.vy += p.gv; p.vx *= p.dr; p.vy *= p.dr;
    p.op -= p.fd;
    const a = Math.max(0, p.op);
    if (p.k === 'c') {
      p.ang += p.sp;
      if (p.sh === 's') { drawStar5(p.x, p.y, p.sz/2, p.col, a); continue; }
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = p.col;
      ctx.translate(p.x, p.y); ctx.rotate(p.ang);
      if (p.sh === 'o') { ctx.beginPath(); ctx.arc(0,0,p.sz/2,0,Math.PI*2); ctx.fill(); }
      else               { ctx.fillRect(-p.sz/2,-p.sz/4,p.sz,p.sz/2); }
      ctx.restore();
    } else {
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = p.col;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.sz, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }
}

/* ──────────────────────────────────────
   MAIN RAF LOOP
────────────────────────────────────── */
function loop() {
  if (canvasMode === 'stars') drawStars();
  else updateParticles();
  rafId = requestAnimationFrame(loop);
}
function stopLoop() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  ctx.clearRect(0, 0, W, H);
}

/* ──────────────────────────────────────
   CELEBRATION FX
────────────────────────────────────── */
function launchFX() {
  stopLoop(); canvasMode = 'fx'; particles = [];
  for (let i = 0; i < 160; i++) particles.push(mkConf(rand(0,W), rand(-30, H*0.3)));

  let fw = 0;
  const fwIv = setInterval(() => { fireWork(rand(W*.15,W*.85), rand(H*.05,H*.45)); if(++fw>=10) clearInterval(fwIv); }, 450);
  let cf = 0;
  const cfIv = setInterval(() => { for(let i=0;i<45;i++) particles.push(mkConf(rand(0,W),-20)); if(++cf>=7) clearInterval(cfIv); }, 700);

  loop();
  setTimeout(() => { clearInterval(fwIv); clearInterval(cfIv); setTimeout(()=>stopLoop(), 2500); }, 8000);
}

/* ──────────────────────────────────────
   SCREEN TRANSITIONS
────────────────────────────────────── */
const selScreen = $('selection-screen');
const celScreen = $('celebration-screen');

function showCelebration(key) {
  selScreen.classList.add('exit');
  selScreen.classList.remove('active');
  setTimeout(() => {
    selScreen.classList.remove('exit');
    celScreen.classList.add('active');
    $('cel-sman').classList.remove('visible');
    $('cel-bruh').classList.remove('visible');
    $('cel-' + key).classList.add('visible');
    celScreen.scrollTop = 0;
    launchFX();
    startTypewriter(key);
    startFloatingEmojis();
    setupLightbox('grid-' + key);
    buildScrollDots('grid-' + key);
  }, 450);
}

function goBack() {
  stopLoop();
  stopFloatingEmojis();
  celScreen.classList.add('exit');
  celScreen.classList.remove('active');
  setTimeout(() => {
    celScreen.classList.remove('exit');
    selScreen.classList.add('active');
    ['tw-sman','tw-bruh'].forEach(id => {
      const el = $(id);
      if (el) { el.textContent = ''; el.classList.remove('done'); }
    });
    canvasMode = 'stars';
    loop();
  }, 450);
}

/* ──────────────────────────────────────
   TYPEWRITER
────────────────────────────────────── */
const TW_TEXT = {
  sman: '🎂 عيد ميلاد سعيد، sman man! 🎂',
  bruh: '🎂 عيد ميلاد سعيد، bruh man! 🎂',
};

function startTypewriter(key) {
  const el = $('tw-' + key);
  if (!el) return;
  el.textContent = ''; el.classList.remove('done');
  const text = TW_TEXT[key];
  let i = 0;
  setTimeout(() => {
    const iv = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) { clearInterval(iv); el.classList.add('done'); }
    }, 70);
  }, 300);
}

/* ──────────────────────────────────────
   ALTERNATING "HAPPY BIRTHDAY" TITLE
────────────────────────────────────── */
function startHBSwitch() {
  const en = $('hb-en');
  const ar = $('hb-ar');
  let showEn = true;
  setInterval(() => {
    showEn = !showEn;
    en.classList.toggle('active',  showEn);
    ar.classList.toggle('active', !showEn);
  }, 2800);
}

/* ──────────────────────────────────────
   FLOATING EMOJIS
────────────────────────────────────── */
const CELEB_EM = ['🎊','🎈','🎉','✨','⭐','💫','🌟','🎁','🥳','🎀','💝','🎂'];

function startFloatingEmojis() {
  const wrap = $('floating-emojis');
  wrap.innerHTML = '';
  floatTimer = setInterval(() => {
    const span = document.createElement('span');
    span.textContent = pick(CELEB_EM);
    const dur = rand(4, 8);
    span.style.cssText = `left:${rand(2,96)}%; font-size:${rand(1.1,2.6)}rem; animation-duration:${dur}s;`;
    wrap.appendChild(span);
    setTimeout(() => span.remove(), dur * 1000 + 200);
  }, 550);
}

function stopFloatingEmojis() {
  if (floatTimer) { clearInterval(floatTimer); floatTimer = null; }
  const wrap = $('floating-emojis');
  if (wrap) wrap.innerHTML = '';
}

/* ──────────────────────────────────────
   SCROLL HINT DOTS (mobile gallery)
────────────────────────────────────── */
function buildScrollDots(gridId) {
  const grid = $(gridId);
  if (!grid) return;

  // Remove old hint if exists
  const old = grid.parentElement.querySelector('.scroll-hint');
  if (old) old.remove();

  const cards = grid.querySelectorAll('.photo-card');
  if (cards.length <= 1) return;

  const hint = document.createElement('div');
  hint.className = 'scroll-hint';
  for (let i = 0; i < cards.length; i++) {
    const d = document.createElement('div');
    d.className = 'scroll-hint-dot' + (i === 0 ? ' active' : '');
    hint.appendChild(d);
  }
  grid.parentElement.appendChild(hint);

  // Update active dot on scroll
  grid.addEventListener('scroll', () => {
    const cardW = grid.querySelector('.photo-card').offsetWidth + 16; // gap ~16px
    const idx   = Math.round(grid.scrollLeft / cardW);
    hint.querySelectorAll('.scroll-hint-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });
  }, { passive: true });
}

/* ──────────────────────────────────────
   LIGHTBOX  (reads data-caption)
────────────────────────────────────── */
function setupLightbox(gridId) {
  const grid = $(gridId);
  if (!grid) return;

  const realCards = [...grid.querySelectorAll('.photo-card:not(.photo-ph)')];
  lbImages = realCards.map(c => ({
    src:     c.querySelector('img')?.src || '',
    alt:     c.querySelector('img')?.alt || '',
    caption: c.dataset.caption || c.querySelector('.photo-caption')?.textContent?.trim() || '',
  })).filter(x => x.src);

  // Build dots
  const dots = $('lb-dots');
  dots.innerHTML = lbImages.map((_,i) => `<button class="lb-dot" onclick="lbGoto(${i})" aria-label="صورة ${i+1}"></button>`).join('');

  // Arrows visibility
  const hide = lbImages.length <= 1;
  document.querySelector('.lb-prev').style.display = hide ? 'none' : '';
  document.querySelector('.lb-next').style.display = hide ? 'none' : '';

  // Wire click events
  realCards.forEach((card, i) => {
    card.addEventListener('click', () => openLightbox(i));
  });
}

function openLightbox(i) {
  if (!lbImages.length) return;
  lbIndex = i;
  $('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderLightbox();
}

function renderLightbox() {
  const img = $('lb-img');
  img.style.opacity = '0';
  img.src = lbImages[lbIndex].src;
  img.alt = lbImages[lbIndex].alt;
  img.onload = () => { img.style.opacity = '1'; };

  // Caption
  const cap = $('lb-caption');
  cap.textContent = lbImages[lbIndex].caption || '';

  // Counter
  $('lb-counter').textContent = `${lbIndex + 1} / ${lbImages.length}`;

  // Dots
  document.querySelectorAll('.lb-dot').forEach((d, i) => d.classList.toggle('active', i === lbIndex));
}

function closeLightbox() {
  $('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function lbNav(dir) {
  lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
  renderLightbox();
}

function lbGoto(i) { lbIndex = i; renderLightbox(); }

// Touch swipe for lightbox
$('lightbox').addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, { passive: true });
$('lightbox').addEventListener('touchend',   e => {
  const diff = lbTouchX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 45) lbNav(diff > 0 ? 1 : -1);
});

/* ──────────────────────────────────────
   SHARE
────────────────────────────────────── */
function sharePage(name) {
  const url  = window.location.href;
  const text = `🎂 عيد ميلاد سعيد ${name}! تفقد هذا!`;
  if (navigator.share) {
    navigator.share({ title: text, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url)
      .then(()  => showToast('🔗 تم نسخ الرابط!'))
      .catch(()  => showToast('انسخ هذا الرابط: ' + url));
  }
}

/* ──────────────────────────────────────
   TOAST
────────────────────────────────────── */
let toastTimer = null;
function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ──────────────────────────────────────
   CUSTOM CURSOR (desktop mouse only)
────────────────────────────────────── */
if (!isMob()) {
  const dot  = $('cursor');
  const ring = $('cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    if (Math.random() < 0.32) spawnSpark(mx, my);
  });
  document.addEventListener('mousedown', () => dot.classList.add('clicked'));
  document.addEventListener('mouseup',   () => dot.classList.remove('clicked'));

  ;(function follow() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(follow);
  })();

  function wireHover() {
    document.querySelectorAll('button, a, .photo-card').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    });
  }
  wireHover();
  document.addEventListener('click', () => setTimeout(wireHover, 500));
}

const SPARKS = ['✦','·','✧','⁺','✸','*'];
function spawnSpark(x, y) {
  const el = document.createElement('div');
  el.className = 'c-spark';
  el.textContent = pick(SPARKS);
  el.style.left  = (x + rand(-14, 14)) + 'px';
  el.style.top   = (y + rand(-14, 14)) + 'px';
  el.style.color = pick(['#ffd700','#ff4fa0','#9b59f5','#00e5c8','#fff']);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

/* ──────────────────────────────────────
   KEYBOARD
────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if ($('lightbox').classList.contains('open')) {
    if (e.key === 'Escape')     closeLightbox();
    // RTL: right key → previous, left key → next (natural reading direction)
    if (e.key === 'ArrowRight') lbNav(-1);
    if (e.key === 'ArrowLeft')  lbNav(1);
  }
});

/* ──────────────────────────────────────
   INIT
────────────────────────────────────── */
startHBSwitch();   // start alternating title
canvasMode = 'stars';
loop();
