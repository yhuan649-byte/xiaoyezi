/* ═══════════════════════════════════════════════════════════
   AETHERIA · 萌叶幻想物语集 — Interaction Engine
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ─────────── 数据（来自 data.js，多页面共享） ─────────── */
  const DATA = window.AETHERIA_DATA || {};
  const CHARACTERS = DATA.characters || [];
  const TIMELINE   = DATA.timeline   || [];
  const ARCHIVE    = DATA.archive    || [];
  const FILTERS    = DATA.filters    || [];
  const FILMS      = DATA.films      || [];

  /* ─────────── 卡膜预设（收藏室切换，全站生效并记住选择） ─────────── */
  const FILM_KEY = 'aetheria-film';
  let currentFilm = 'classic';

  function applyFilm(key) {
    const k = FILMS.some(f => f.key === key) ? key : 'classic';
    if (k === 'classic') delete root.dataset.film;
    else root.dataset.film = k;
    currentFilm = k;
    return k;
  }
  try { applyFilm(localStorage.getItem(FILM_KEY) || 'classic'); } catch (e) { applyFilm('classic'); }

  /* ─────────── 主题 ─────────── */
  const THEME_KEY = 'aetheria-theme';
  const themeBtn = $('#themeToggle');
  let cachedAccent = '#48725e';   // 画布用色，随主题切换刷新（避免每帧 getComputedStyle）

  function refreshAccent() {
    cachedAccent = getComputedStyle(root).getPropertyValue('--accent').trim() || '#48725e';
  }

  function applyTheme(t) {
    root.dataset.theme = t;
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#080d0b' : '#f4f7f4');
    themeBtn.setAttribute('aria-label', t === 'dark' ? '切换浅色模式' : '切换深色模式');
    requestAnimationFrame(refreshAccent);
  }

  (function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    applyTheme(saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  })();

  themeBtn.addEventListener('click', (e) => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || reduceMotion) { applyTheme(next); return; }
    const x = e.clientX || innerWidth / 2;
    const y = e.clientY || innerHeight / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const t = document.startViewTransition(() => applyTheme(next));
    t.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 620, easing: 'cubic-bezier(.16,1,.3,1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => {});
  });

  /* ─────────── 预加载 / 启动幕 ─────────── */
  const preloader = $('#preloader');
  const preBar = $('#preBar');
  const prePct = $('#prePct');

  function runPreloader() {
    const imgs = CHARACTERS.map(c => c.image);
    const total = imgs.length;
    let done = 0, shown = 0, raf = null;

    const tick = () => {
      shown += (done / total * 100 - shown) * 0.16;
      if (done === total && 100 - shown < 0.6) shown = 100;
      preBar.style.width = shown + '%';
      prePct.textContent = Math.round(shown);
      if (shown < 99.4) raf = requestAnimationFrame(tick);
      else finish();
    };

    const finish = () => {
      cancelAnimationFrame(raf);
      preBar.style.width = '100%';
      prePct.textContent = '100';
      setTimeout(() => {
        preloader.classList.add('done');
        root.style.overflow = '';
        document.body.classList.remove('is-locked');
        startHeroIntro();
      }, reduceMotion ? 0 : 260);
    };

    root.style.overflow = 'hidden';
    document.body.classList.add('is-locked');
    raf = requestAnimationFrame(tick);

    imgs.forEach(src => {
      const im = new Image();
      const ok = () => { done++; };
      im.onload = ok; im.onerror = ok;
      im.src = src;
    });

    // 兜底：网络异常 / 图床超时时不卡死（最长 3.5s），并确保 hero 一定会入场
    setTimeout(() => {
      if (done < total) done = total;
      if (!$('.hero .reveal.in')) startHeroIntro();
    }, 3500);
  }

  /* ─────────── Hero 入场 ─────────── */
  function startHeroIntro() {
    $$('.hero .reveal').forEach(el => {
      const d = parseInt(el.dataset.delay || 0, 10);
      setTimeout(() => {
        el.classList.add('in');
        $$('.num', el).forEach(animateCount);
      }, reduceMotion ? 0 : 120 + d * 110);
    });
  }

  /* ─────────── 数字滚动 ─────────── */
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const dur = 1100;
    const t0 = performance.now();
    (function step(t) {
      const p = clamp((t - t0) / dur, 0, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ─────────── 揭示动画 (IntersectionObserver) ─────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const d = parseInt(el.dataset.delay || 0, 10);
      setTimeout(() => el.classList.add('in'), reduceMotion ? 0 : d * 90);
      $$('.num', el).forEach(animateCount);
      if (el.classList.contains('num')) animateCount(el);
      io.unobserve(el);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  function observeReveals(scope = document) {
    $$('.reveal:not(.in)', scope).forEach(el => {
      if (el.closest('.hero')) return; // hero 由 intro 控制
      io.observe(el);
    });
  }

  /* ─────────── 画廊 ─────────── */
  const grid = $('#galleryGrid');
  const filtersEl = $('#filters');
  let activeFilter = 'all';

  function hueStyle(c) {
    return `background:linear-gradient(150deg, ${c.hue[0]}, ${c.hue[1]})`;
  }

  function renderFilters() {
    filtersEl.innerHTML = FILTERS.map((f, i) => `
      <button class="chip" role="tab" data-key="${f.key}" aria-selected="${i === 0}">${f.label}</button>
    `).join('');
    $$('.chip', filtersEl).forEach(chip => {
      chip.addEventListener('click', () => {
        activeFilter = chip.dataset.key;
        $$('.chip', filtersEl).forEach(c => c.setAttribute('aria-selected', String(c === chip)));
        $$('.card', grid).forEach(card => {
          const hit = activeFilter === 'all' || card.dataset.tags.includes(activeFilter);
          card.classList.toggle('is-out', !hit);
          if (hit) card.classList.add('in');
        });
      });
    });
  }

  function renderCards() {
    grid.innerHTML = CHARACTERS.map((c, i) => `
      <article class="card reveal" data-index="${i}" data-tags="${c.tags.join(' ')}" data-cursor="OPEN"
               tabindex="0" role="button" aria-label="查看 ${c.nameZh} 的物语">
        <div class="card-foil"></div>
        <div class="card-sheen"></div>
        <div class="card-glare"></div>
        <div class="card-media">
          <span class="card-badge">${c.tag}</span>
          <span class="card-idx mono">${String(i + 1).padStart(2, '0')}</span>
          <div class="skeleton" data-skel></div>
          <div class="img-fallback" style="${hueStyle(c)}">
            <div><div class="fb-char">${c.nameZh}</div><div class="fb-sub">${c.nameEn}</div></div>
          </div>
          <img class="card-img" src="${c.image}" alt="${c.nameZh} 立绘" loading="lazy" decoding="async" draggable="false">
        </div>
        <div class="card-body">
          <div class="card-row">
            <span class="card-zh">${c.nameZh}</span>
            <span class="card-en">${c.nameEn}</span>
          </div>
          <p class="card-quote">“${c.quote}”</p>
          <div class="card-foot">
            <span class="card-tag">${c.personality.split('·')[0].trim()}</span>
            <span class="card-more">展开物语
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 12h13M12 5.5 18.5 12 12 18.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
          </div>
        </div>
      </article>
    `).join('');

    $$('.card', grid).forEach(card => {
      const img = $('.card-img', card);
      const skel = $('[data-skel]', card);
      const fb = $('.img-fallback', card);

      const settle = (okFlag) => {
        skel.classList.add('off');
        if (okFlag) { img.classList.add('ready'); }
        else { fb.classList.add('on'); img.style.display = 'none'; }
      };
      if (img.complete && img.naturalWidth > 0) settle(true);
      else {
        img.addEventListener('load', () => settle(true), { once: true });
        img.addEventListener('error', () => settle(false), { once: true });
      }

      if (!isTouch) {
        card.addEventListener('pointermove', (e) => tilt(e, card));
        card.addEventListener('pointerleave', () => resetTilt(card));
      }
      // 有展厅的页面就地在展厅打开；无展厅的页面（首页）跳转到该角色独立页
      const enter = () => {
        const i = +card.dataset.index;
        const it = CHARACTERS[i];
        if (pav) openPavilion(i, card);
        else if (it) location.href = 'character.html?id=' + encodeURIComponent(it.id);
      };
      card.addEventListener('click', enter);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enter(); }
      });
    });

    observeReveals(grid);
  }

  /* 3D 倾斜 + 全息流光（rAF 节流） */
  let tiltQueued = false, tiltCard = null, tiltEv = null;
  function tilt(e, card) {
    tiltCard = card; tiltEv = e;
    if (tiltQueued) return;
    tiltQueued = true;
    requestAnimationFrame(() => {
      tiltQueued = false;
      const c = tiltCard, ev = tiltEv;
      if (!c || !ev) return;
      c.dataset.hovering = '1';       // 告知重力引擎：这张卡交给指针
      const r = c.getBoundingClientRect();
      const px = clamp((ev.clientX - r.left) / r.width, 0, 1);
      const py = clamp((ev.clientY - r.top) / r.height, 0, 1);
      const rx = (0.5 - py) * 13;
      const ry = (px - 0.5) * 15;
      c.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
      const ang = Math.atan2(py - 0.5, px - 0.5) * 180 / Math.PI + 90;
      const foil = $('.card-foil', c);
      if (foil) {
        foil.style.setProperty('--foil-angle', ang + 'deg');
        foil.style.opacity = '0.62';
      }
      // 镭射三层：彩虹膜角度 + 扫光带位移/旋转 + 高光斑位置（写在这张卡上，覆盖全局重力值）
      c.style.setProperty('--foil-x', px * 100 + '%');
      c.style.setProperty('--foil-y', py * 100 + '%');
      c.style.setProperty('--sheen-x', ((px - 0.5) * 46).toFixed(1) + '%');
      c.style.setProperty('--sheen-y', ((py - 0.5) * 46).toFixed(1) + '%');
      c.style.setProperty('--sheen-rot', (ry * 0.5).toFixed(1) + 'deg');
      c.style.setProperty('--sheen-opacity', '0.5');
    });
  }
  function resetTilt(c) {
    delete c.dataset.hovering;
    c.style.transform = '';
    const foil = $('.card-foil', c);
    if (foil) foil.style.opacity = '0';
    c.style.setProperty('--sheen-opacity', '0');
  }

  /* ─────────── 时间线 / 档案 ─────────── */
  function renderTimeline() {
    $('#timeline').innerHTML = TIMELINE.map(t => `
      <li class="tl-item reveal">
        <div class="tl-time mono">${t.time}</div>
        <h3 class="tl-title">${t.title}</h3>
        <p class="tl-desc">${t.desc}</p>
      </li>
    `).join('');
  }

  function renderArchive() {
    $('#archiveGrid').innerHTML = ARCHIVE.map(a => `
      <div class="arc-card holo reveal" data-tilt>
        <div class="card-foil"></div>
        <div class="card-sheen"></div>
        <div class="arc-key mono">${a.key}</div>
        <div class="arc-val">${a.val}</div>
        <p class="arc-note">${a.note}</p>
      </div>
    `).join('');
    refreshTiltNodes();
  }

  /* ─────────── 音频引擎（真实频谱） ─────────── */
  const Audio_ = {
    ctx: null, master: null, analyser: null, data: null,
    pad: null, enabled: false,

    ensure() {
      if (this.ctx) return this.ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.0;
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.82;
      this.data = new Uint8Array(this.analyser.fftSize);
      this.master.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
      return this.ctx;
    },

    resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },

    setEnabled(on) {
      this.enabled = on;
      if (on) {
        this.ensure();
        this.resume();
        this.master.gain.cancelScheduledValues(this.ctx.currentTime);
        this.master.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.6);
        this.startPad();
      } else if (this.ctx) {
        this.master.gain.cancelScheduledValues(this.ctx.currentTime);
        this.master.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 0.4);
        this.stopPad();
      }
    },

    /** 环境 pad：三层柔和正弦 + 缓慢起伏 */
    startPad() {
      if (this.pad || !this.ctx) return;
      const t = this.ctx.currentTime;
      const bus = this.ctx.createGain();
      bus.gain.value = 0.055;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1100; lp.Q.value = 0.6;
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.09; lfoGain.gain.value = 90;
      lfo.connect(lfoGain); lfoGain.connect(lp.frequency); lfo.start(t);

      const oscs = [196, 261.63, 329.63].map((f, i) => {
        const o = this.ctx.createOscillator();
        o.type = i === 2 ? 'triangle' : 'sine';
        o.frequency.value = f;
        const g = this.ctx.createGain();
        g.gain.value = i === 0 ? 1 : 0.42;
        o.connect(g); g.connect(bus); o.start(t);
        return o;
      });
      bus.connect(lp); lp.connect(this.master);
      this.pad = { oscs, lfo, bus };
    },

    stopPad() {
      if (!this.pad || !this.ctx) return;
      const t = this.ctx.currentTime;
      this.pad.oscs.forEach(o => o.stop(t + 0.5));
      this.pad.lfo.stop(t + 0.5);
      this.pad = null;
    },

    /** 单次角色音（琶音上行） */
    chime(freq) {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      const t = this.ctx.currentTime;
      [1, 1.5, 2].forEach((mult, i) => {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq * mult;
        const start = t + i * 0.07;
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(0.16 / (i + 1), start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);
        o.connect(g); g.connect(this.master);
        o.start(start); o.stop(start + 1.0);
      });
    }
  };

  const soundBtn = $('#soundToggle');
  soundBtn.addEventListener('click', () => {
    const on = soundBtn.getAttribute('aria-pressed') !== 'true';
    Audio_.setEnabled(on);
    soundBtn.setAttribute('aria-pressed', String(on));
    soundBtn.setAttribute('aria-label', on ? '关闭环境音' : '开启环境音');
    if (on) Audio_.chime(CHARACTERS[pavIndex].freq);
  });

  /* ─────────── 波形绘制 ─────────── */
  const waveCanvas = $('#waveCanvas');                 // 仅展厅页 / 角色页存在
  const wctx = waveCanvas ? waveCanvas.getContext('2d') : null;
  let wavePhase = 0, waveEnergy = 0;

  function sizeWave() {
    if (!waveCanvas || !wctx) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = waveCanvas.clientWidth || 560;
    const h = 46;
    waveCanvas.width = w * dpr;
    waveCanvas.height = h * dpr;
    wctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawWave() {
    if (!waveCanvas || !wctx) return;
    const w = waveCanvas.clientWidth || 560;
    const h = 46;
    wctx.clearRect(0, 0, w, h);

    const accent = cachedAccent;
    let pts = null;

    const analyser = Audio_.analyser;
    if (Audio_.enabled && analyser && typeof analyser.getByteTimeDomainData === 'function') {
      analyser.getByteTimeDomainData(Audio_.data);
      pts = Audio_.data;
    }

    wctx.beginPath();
    wctx.lineWidth = 1.6;
    wctx.strokeStyle = accent;
    wctx.globalAlpha = 0.9;

    for (let x = 0; x <= w; x += 2) {
      let v;
      if (pts) {
        const idx = Math.floor(x / w * (pts.length - 1));
        v = (pts[idx] - 128) / 128;
        waveEnergy += (Math.abs(v) - waveEnergy) * 0.08;
      } else {
        v = Math.sin(x * 0.012 + wavePhase) * 0.34 + Math.sin(x * 0.031 - wavePhase * 1.6) * 0.16;
        v *= 1 + Math.sin(wavePhase * 0.7) * 0.25;
      }
      const y = h / 2 + v * (h / 2 - 4);
      x === 0 ? wctx.moveTo(x, y) : wctx.lineTo(x, y);
    }
    wctx.stroke();

    // 镜像回响
    wctx.globalAlpha = 0.18 + waveEnergy * 0.5;
    wctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const src = pts
        ? (pts[Math.floor(x / w * (pts.length - 1))] - 128) / 128
        : Math.sin(x * 0.012 + wavePhase + 1.1) * 0.34;
      const y = h / 2 - src * (h / 2 - 4) * 0.45;
      x === 0 ? wctx.moveTo(x, y) : wctx.lineTo(x, y);
    }
    wctx.stroke();
    wctx.globalAlpha = 1;

    wavePhase += 0.045;
  }

  /* ─────────── 星尘粒子 ─────────── */
  const dust = $('#stardust');
  const dctx = dust.getContext('2d');
  let particles = [], dpr = 1, dustRunning = true;
  const pointer = { x: -9999, y: -9999 };

  function sizeDust() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    dust.width = innerWidth * dpr;
    dust.height = innerHeight * dpr;
    dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = innerWidth < 700 ? 34 : 64;
    if (particles.length !== count) {
      particles = Array.from({ length: count }, () => makeParticle());
    }
  }

  function makeParticle() {
    return {
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -(Math.random() * 0.34 + 0.06),
      r: Math.random() * 1.7 + 0.6,
      a: Math.random() * 0.45 + 0.15
    };
  }

  function drawDust() {
    const w = innerWidth, h = innerHeight;
    dctx.clearRect(0, 0, w, h);
    const accent = cachedAccent;

    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -12 || p.x < -20 || p.x > w + 20) { Object.assign(p, makeParticle()); p.y = h + 10; }

      // 指针附近的轻微排斥
      const dx = p.x - pointer.x, dy = p.y - pointer.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 13000) {
        const f = (1 - d2 / 13000) * 0.5;
        p.x += dx * f * 0.03;
        p.y += dy * f * 0.03;
      }

      dctx.globalAlpha = p.a;
      dctx.fillStyle = accent;
      dctx.beginPath();
      dctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      dctx.fill();
    }

    // 邻近连线（星座感）
    dctx.globalAlpha = 1;
    dctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < 108) {
          dctx.globalAlpha = (1 - d / 108) * 0.16;
          dctx.strokeStyle = accent;
          dctx.beginPath();
          dctx.moveTo(a.x, a.y); dctx.lineTo(b.x, b.y);
          dctx.stroke();
        }
      }
    }
    dctx.globalAlpha = 1;
  }

  /* 单一主循环：粒子 + 波形 */
  let lastDust = 0;
  function mainLoop(t) {
    if (dustRunning) {
      if (t - lastDust > (reduceMotion ? 120 : 33)) { drawDust(); lastDust = t; }
    }
    if (pavOpen || onCharPage) drawWave();
    applyGyroTilt();     // 与波形并存：镭射变量是全站共享的，任何页面都要刷新
    applyManualTilt();   // 收藏室手动拨卡
    requestAnimationFrame(mainLoop);
  }

  document.addEventListener('visibilitychange', () => {
    dustRunning = !document.hidden;
  });

  /* ─────────── 视差（鼠标 / 陀螺仪） ─────────── */
  const parallaxEls = $$('[data-depth]');
  let targetPX = 0, targetPY = 0, curPX = 0, curPY = 0;

  function parallaxTick() {
    curPX += (targetPX - curPX) * 0.07;
    curPY += (targetPY - curPY) * 0.07;
    parallaxEls.forEach(el => {
      const d = parseFloat(el.dataset.depth) || 10;
      el.style.translate = `${(curPX * d).toFixed(2)}px ${(curPY * d).toFixed(2)}px`;
    });
    requestAnimationFrame(parallaxTick);
  }
  if (!reduceMotion) parallaxTick();

  addEventListener('pointermove', (e) => {
    pointer.x = e.clientX; pointer.y = e.clientY;
    targetPX = (e.clientX / innerWidth - 0.5) * 2;
    targetPY = (e.clientY / innerHeight - 0.5) * 2;
    moveCursor(e.clientX, e.clientY);
  }, { passive: true });

  /* ─────────── 自定义光标 ─────────── */
  const cursorDot = $('#cursorDot'), cursorRing = $('#cursorRing'), cursorLabel = $('#cursorLabel');
  let cx = 0, cy = 0, rx = 0, ry = 0;

  function moveCursor(x, y) {
    cursorDot.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`;
  }
  function cursorLoop() {
    rx += (cx - rx) * 0.16;
    ry += (cy - ry) * 0.16;
    cursorRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(cursorLoop);
  }
  if (!isTouch) {
    addEventListener('pointermove', (e) => { cx = e.clientX; cy = e.clientY; }, { passive: true });
    cursorLoop();
    document.addEventListener('pointerleave', () => {
      cursorDot.classList.add('is-hidden'); cursorRing.classList.add('is-hidden');
    });
    document.addEventListener('pointerenter', () => {
      cursorDot.classList.remove('is-hidden'); cursorRing.classList.remove('is-hidden');
    });
    $$('a, button, .card, .chip, [role="button"]').forEach(el => {
      const label = el.dataset.cursor || '';
      el.addEventListener('pointerenter', () => {
        if (label) { cursorLabel.textContent = label; cursorRing.classList.add('is-active'); }
        else cursorRing.style.transform += '';
      });
      el.addEventListener('pointerleave', () => {
        cursorLabel.textContent = ''; cursorRing.classList.remove('is-active');
      });
    });
  }

  /* ─────────── 导航 / 滚动进度 ─────────── */
  const nav = $('#nav'), progress = $('#scrollProgress'), toTop = $('#toTop');

  function onScroll() {
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 24);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  }
  addEventListener('scroll', onScroll, { passive: true });
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  const navLinks = $$('.nav-link');
  const pageName = document.body.dataset.page || '';

  // 多页面站点：按 data-page 高亮（角色页归入「绘卷」）；单页锚点滚动时再交给 IntersectionObserver
  const NAV_MAP = { character: 'gallery' };
  const activeNav = NAV_MAP[pageName] || pageName;
  navLinks.forEach(l => l.classList.toggle('active', l.dataset.nav === activeNav));

  if (!pageName) {
    const sectionIO = new IntersectionObserver((ens) => {
      ens.forEach(en => {
        if (!en.isIntersecting) return;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
      });
    }, { threshold: 0.4 });
    ['gallery', 'chronicle', 'archive'].forEach(id => { const s = $('#' + id); if (s) sectionIO.observe(s); });
  }

  /* ─────────── 展厅 ─────────── */
  const pav = $('#pavilion');
  const pavShift = $('#pavShift');
  const pavImg = $('#pavImg');
  const pavDots = $('#pavDots');
  const pavDrag = $('#pavDrag');
  let pavIndex = 0, pavOpen = false, lastFocus = null;

  const el = {
    zh: $('#pavNameZh'), en: $('#pavNameEn'),
    per: $('#metaPersonality'), birth: $('#metaBirthday'),
    elemV: $('#metaElement'), freq: $('#metaFreq'),
    quote: $('#pavQuote'), story: $('#pavStory'),
    counter: $('#pavCounter'), caption: $('#pavCaption')
  };

  function renderDots() {
    pavDots.innerHTML = CHARACTERS.map((c, i) =>
      `<button class="pav-dot" role="tab" data-i="${i}" aria-selected="${i === pavIndex}" aria-label="${c.nameZh}"></button>`
    ).join('');
    $$('.pav-dot', pavDots).forEach(d => {
      d.addEventListener('click', () => goTo(+d.dataset.i));
    });
  }

  function syncDots() {
    $$('.pav-dot', pavDots).forEach(d => d.setAttribute('aria-selected', String(+d.dataset.i === pavIndex)));
  }

  function paintPavilion(animateText) {
    const c = CHARACTERS[pavIndex];
    pavImg.classList.remove('ready');
    const im = new Image();
    im.onload = () => { pavImg.src = c.image; pavImg.classList.add('ready'); };
    im.onerror = () => { pavImg.src = c.image; pavImg.classList.add('ready'); };
    im.src = c.image;
    pavImg.alt = c.nameZh + ' 立绘全景';

    el.zh.textContent = c.nameZh;
    el.en.textContent = c.nameEn;
    el.per.textContent = c.personality;
    el.birth.textContent = c.birthday;
    el.elemV.textContent = c.element;
    el.freq.textContent = c.freq.toFixed(2) + ' Hz';
    el.quote.textContent = '“' + c.quote + '”';
    el.story.textContent = c.story;
    el.counter.textContent = `${String(pavIndex + 1).padStart(2, '0')} / ${String(CHARACTERS.length).padStart(2, '0')}`;
    el.caption.innerHTML = `<span>${c.chapter} · ${c.nameEn}</span><span>${c.tag}</span>`;
    const deep = $('#pavDeep');
    if (deep) deep.href = 'character.html?id=' + encodeURIComponent(c.id);
    syncDots();

    if (animateText && !reduceMotion) {
      [el.zh, el.en, el.quote, el.story].forEach((node, i) => {
        node.animate(
          [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }],
          { duration: 520, delay: i * 60, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }
        );
      });
    }
  }

  function openPavilion(i, fromEl) {
    lastFocus = fromEl || document.activeElement;
    pavIndex = ((i % CHARACTERS.length) + CHARACTERS.length) % CHARACTERS.length;
    paintPavilion(false);
    pav.classList.add('active');
    pav.setAttribute('aria-hidden', 'false');
    pav.scrollTop = 0;
    pavOpen = true;
    document.body.classList.add('is-locked');
    root.style.overflow = 'hidden';
    sizeWave();
    Audio_.chime(CHARACTERS[pavIndex].freq);
    if (navigator.vibrate) navigator.vibrate(14);
    setTimeout(() => $('#pavClose').focus(), 420);
  }

  function closePavilion() {
    pav.classList.remove('active');
    pav.setAttribute('aria-hidden', 'true');
    pavOpen = false;
    pavShift.style.transform = '';
    pavDrag.classList.remove('armed');
    document.body.classList.remove('is-locked');
    root.style.overflow = '';
    if (navigator.vibrate) navigator.vibrate(10);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function goTo(i) {
    pavIndex = ((i % CHARACTERS.length) + CHARACTERS.length) % CHARACTERS.length;
    paintPavilion(true);
    pav.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    Audio_.chime(CHARACTERS[pavIndex].freq);
    if (navigator.vibrate) navigator.vibrate(12);
  }
  const nextChar = () => goTo(pavIndex + 1);
  const prevChar = () => goTo(pavIndex - 1);

  $('#pavClose')?.addEventListener('click', closePavilion);
  $('#pavNext')?.addEventListener('click', nextChar);
  $('#pavPrev')?.addEventListener('click', prevChar);
  $('#pavZoom')?.addEventListener('click', (e) => { e.stopPropagation(); openLightbox(); });
  $('.pav-frame')?.addEventListener('click', () => openLightbox());

  addEventListener('keydown', (e) => {
    if (lightboxOpen) { if (e.key === 'Escape') closeLightbox(); return; }
    if (!pavOpen) {
      if (e.key === 't' || e.key === 'T') themeBtn.click();
      if (e.key === 's' || e.key === 'S') soundBtn.click();
      return;
    }
    if (e.key === 'Escape') closePavilion();
    if (e.key === 'ArrowRight') nextChar();
    if (e.key === 'ArrowLeft') prevChar();
  });

  /* 展厅手势：顶部下拉关闭 + 左右滑切换 */
  let sx = 0, sy = 0, dx = 0, dy = 0, atTop = false, pulling = false;
  pav?.addEventListener('touchstart', (e) => {
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    dx = dy = 0;
    atTop = pav.scrollTop <= 0;
    pulling = false;
  }, { passive: true });

  pav?.addEventListener('touchmove', (e) => {
    dx = e.touches[0].clientX - sx;
    dy = e.touches[0].clientY - sy;
    if (atTop && dy > 0 && dy > Math.abs(dx) * 1.3) {
      pulling = true;
      const shift = Math.min(dy * 0.34, 130);
      pavShift.style.transform = `translateY(${shift}px)`;
      const armed = dy > 80;
      pavDrag.classList.toggle('armed', armed);
      $('#dragHint').textContent = armed ? '松手返回画廊' : '向下拉动返回画廊';
    }
  }, { passive: true });

  pav?.addEventListener('touchend', () => {
    if (pulling) {
      if (dy > 90) { closePavilion(); }
      else { pavShift.style.transform = ''; pavDrag.classList.remove('armed'); $('#dragHint').textContent = '向下拉动返回画廊'; }
      return;
    }
    if (Math.abs(dx) > 52 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      dx < 0 ? nextChar() : prevChar();
    }
  }, { passive: true });

  pavDrag?.addEventListener('click', closePavilion);

  /* ─────────── 放大查看 ─────────── */
  const lb = $('#lightbox'), lbImg = $('#lbImg');
  let lightboxOpen = false, lbScale = 1, lbX = 0, lbY = 0, lbDrag = false, lbSX = 0, lbSY = 0, pinchBase = 0;

  function applyLb() {
    lbImg.style.transform = `translate(${lbX}px, ${lbY}px) scale(${lbScale})`;
  }

  function openLightbox() {
    lbImg.src = CHARACTERS[pavIndex].image;
    lbScale = 1; lbX = 0; lbY = 0; applyLb();
    lb.classList.add('active');
    lb.setAttribute('aria-hidden', 'false');
    lightboxOpen = true;
  }
  function closeLightbox() {
    lb.classList.remove('active');
    lb.setAttribute('aria-hidden', 'true');
    lightboxOpen = false;
  }
  $('#lbClose')?.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
  lb?.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

  lb?.addEventListener('wheel', (e) => {
    if (!lightboxOpen) return;
    e.preventDefault();
    lbScale = clamp(lbScale * (e.deltaY > 0 ? 0.92 : 1.08), 0.6, 6);
    applyLb();
  }, { passive: false });

  lb?.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.lb-close')) return;
    lbDrag = true; lbSX = e.clientX - lbX; lbSY = e.clientY - lbY;
    lb.classList.add('dragging');
  });
  addEventListener('pointermove', (e) => {
    if (!lbDrag) return;
    lbX = e.clientX - lbSX; lbY = e.clientY - lbSY; applyLb();
  }, { passive: true });
  addEventListener('pointerup', () => { lbDrag = false; lb.classList.remove('dragging'); });

  lb?.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      pinchBase = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });
  lb?.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && pinchBase) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lbScale = clamp(lbScale * (d / pinchBase), 0.6, 6);
      pinchBase = d;
      applyLb();
    }
  }, { passive: true });
  lb?.addEventListener('touchend', () => { pinchBase = 0; });

  /* ─────────── 陀螺仪（移动端静默授权 + 卡片 3D 立体） ─────────── */
  let sensorsBound = false;
  let gyroActive = false, gyroGamma = 0, gyroBeta = 45;
  let curRx = 0, curRy = 0;   // 当前平滑角度（逐帧逼近目标，消除传感器原始抖动）

  // 卡片重力倾斜只交给真·触摸设备；桌面端仍归指针 hover 控制，二者不打架
  const canTiltByGyro = isTouch || (navigator.maxTouchPoints || 0) > 0;

  // 除画廊网格外，任何页面只要给元素打上 data-tilt，就一起参与重力倾斜
  let tiltNodes = $$('[data-tilt]');
  function refreshTiltNodes() { tiltNodes = $$('[data-tilt]'); }

  /** 由主循环每帧统一应用，避免 deviceorientation 高频回调里反复写样式 */
  function applyGyroTilt() {
    if (!gyroActive) return;

    // gamma 左右倾斜 (-90~90)，beta 前后倾斜 (平持约 45°)
    const tRy = clamp(gyroGamma * 0.3, -16, 16);
    const tRx = clamp(-(gyroBeta - 45) * 0.3, -14, 14);
    curRy += (tRy - curRy) * 0.12;
    curRx += (tRx - curRx) * 0.12;

    // 镭射卡面：反射角、扫光带位置与强度全部跟随倾角（倾角越大，彩虹与白光越强）
    const strength = clamp((Math.abs(curRy) + Math.abs(curRx)) / 20, 0, 1);
    root.style.setProperty('--foil-angle', ((curRy * 2 - curRx * 2 + 180) % 360).toFixed(1) + 'deg');
    root.style.setProperty('--foil-x', clamp(50 + curRy * 2.2, 0, 100).toFixed(1) + '%');
    root.style.setProperty('--foil-y', clamp(50 + curRx * 2.2, 0, 100).toFixed(1) + '%');
    root.style.setProperty('--foil-opacity', (0.34 + strength * 0.36).toFixed(3));
    root.style.setProperty('--foil-glow', (0.22 + strength * 0.33).toFixed(3));
    root.style.setProperty('--sheen-x', (curRy * 1.6).toFixed(1) + '%');
    root.style.setProperty('--sheen-y', (curRx * 1.6).toFixed(1) + '%');
    root.style.setProperty('--sheen-rot', (curRy * 0.8).toFixed(1) + 'deg');
    root.style.setProperty('--sheen-opacity', (0.16 + strength * 0.44).toFixed(3));

    if (pavOpen) return;             // 展厅打开时不写卡片样式（变量照常刷新）
    const t = `perspective(1100px) rotateY(${curRy.toFixed(2)}deg) rotateX(${curRx.toFixed(2)}deg)`;
    if (grid) {
      for (const c of grid.children) {        // live 集合，零查询开销
        if (c.classList.contains('is-out')) continue;
        if (c.dataset.hovering) continue;     // 鼠标悬停中的卡片交给指针控制
        c.style.transform = t;
      }
    }
    for (const c of tiltNodes) {              // 其他页面标记的镭射卡（角色页立绘框等）
      if (c.dataset.hovering) continue;
      c.style.transform = t;
    }
  }

  function bindSensors() {
    if (sensorsBound) return;
    sensorsBound = true;
    const onOrient = (e) => {
      if (e.gamma == null && e.beta == null) return;   // 设备没有真实传感器
      const gamma = e.gamma || 0, beta = e.beta || 0;
      gyroGamma = gamma;
      gyroBeta = beta;

      // 极光视差：任何有传感器的设备都生效
      targetPX = clamp(gamma / 35, -1, 1);
      targetPY = clamp((beta - 45) / 35, -1, 1);

      if (canTiltByGyro) gyroActive = true;   // 仅触摸设备启用卡片 3D 倾斜 + 流光
    };
    if ('DeviceOrientationEvent' in window) {
      addEventListener('deviceorientation', onOrient, { passive: true });
    }

    // 摇一摇 → 随机相遇
    let lx = 0, ly = 0, lz = 0, lt = 0;
    addEventListener('devicemotion', (e) => {
      const now = Date.now();
      if (now - lt < 900) return;
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const delta = Math.abs(a.x - lx) + Math.abs(a.y - ly) + Math.abs(a.z - lz);
      if (delta > 42) {
        lt = now;
        if (navigator.vibrate) navigator.vibrate([24, 40, 24]);
        const r = Math.floor(Math.random() * CHARACTERS.length);
        if (pavOpen) goTo(r);
        else if (pav) openPavilion(r);
        else if (CHARACTERS[r]) location.href = 'character.html?id=' + encodeURIComponent(CHARACTERS[r].id);
      }
      lx = a.x; ly = a.y; lz = a.z;
    }, { passive: true });
  }

  function initSensors() {
    if (sensorsBound) return;
    const DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      DOE.requestPermission().then(res => { if (res === 'granted') bindSensors(); }).catch(() => {});
    } else {
      bindSensors();
    }
  }
  // iOS 13+ 必须在真实用户手势里申请授权；Android / 桌面无需授权，直接绑定，
  // 这样用户一进页面倾斜手机就有效果，不必先点一下屏幕。
  const DOE = window.DeviceOrientationEvent;
  const needsPermission = !!(DOE && typeof DOE.requestPermission === 'function');

  if (needsPermission) {
    ['touchstart', 'pointerdown', 'click'].forEach(ev =>
      addEventListener(ev, initSensors, { once: true, passive: true })
    );
  } else {
    initSensors();
  }

  /* ─────────── 角色详情页（character.html?id=haanye） ─────────── */
  let onCharPage = false, charIdx = 0;

  function initCharacterPage() {
    if (!$('#charRoot')) return;
    onCharPage = true;

    const qid = new URLSearchParams(location.search).get('id');
    let idx = CHARACTERS.findIndex(c => c.id === qid);
    if (idx < 0) idx = 0;

    const C = {
      img: $('#charImg'), no: $('#charNo'), zh: $('#charNameZh'), en: $('#charNameEn'),
      tag: $('#charTag'), quote: $('#charQuote'), meta: $('#charMeta'), skills: $('#charSkills'),
      story: $('#charStory'), line: $('#charLine'), others: $('#charOthers')
    };

    function paint(i) {
      charIdx = i;
      const c = CHARACTERS[i];
      document.title = `${c.nameZh} ${c.nameEn} · AETHERIA 萌叶幻想物语集`;

      if (C.img) {
        C.img.classList.remove('ready');
        const im = new Image();
        im.onload = im.onerror = () => { C.img.src = c.image; C.img.classList.add('ready'); };
        im.src = c.image;
        C.img.alt = c.nameZh + ' 立绘全景';
      }
      if (C.no)    C.no.textContent = `${c.chapter} · ${String(i + 1).padStart(2, '0')} / ${String(CHARACTERS.length).padStart(2, '0')}`;
      if (C.zh)    C.zh.textContent = c.nameZh;
      if (C.en)    C.en.textContent = c.nameEn;
      if (C.tag)   C.tag.textContent = c.tag;
      if (C.quote) C.quote.textContent = '“' + c.quote + '”';
      if (C.line)  C.line.textContent = c.line;
      if (C.story) C.story.textContent = c.story;

      if (C.meta) {
        C.meta.innerHTML = [
          ['PERSONALITY', c.personality], ['BIRTH MARK', c.birthday],
          ['ELEMENT', c.element],         ['RESONANCE', c.freq.toFixed(2) + ' Hz'],
          ['SCENE', c.scene],             ['LIKES', c.likes]
        ].map(([k, v]) => `<div class="meta-win"><div class="meta-title mono">${k}</div><div class="meta-val">${v}</div></div>`).join('');
      }
      if (C.skills) {
        C.skills.innerHTML = c.skills.map(s => `<span class="chip-skill">${s}</span>`).join('');
      }
      if (C.others) {
        C.others.innerHTML = CHARACTERS.map((o, j) => j === i ? '' : `
          <a class="other-card" href="character.html?id=${encodeURIComponent(o.id)}">
            <div class="other-thumb" style="background:linear-gradient(150deg,${o.hue[0]},${o.hue[1]})">
              <img src="${o.image}" alt="${o.nameZh}" loading="lazy">
            </div>
            <div class="other-name"><b>${o.nameZh}</b><span class="mono">${o.nameEn}</span></div>
          </a>`).join('');
      }

      if (!reduceMotion) {
        [C.zh, C.en, C.quote, C.story].forEach((n, k) => n && n.animate(
          [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }],
          { duration: 520, delay: k * 60, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }
        ));
      }

      history.replaceState(null, '', 'character.html?id=' + encodeURIComponent(c.id));
      sizeWave();
      Audio_.chime(c.freq);
      if (navigator.vibrate) navigator.vibrate(12);
    }

    const step = (d) => {
      paint((charIdx + d + CHARACTERS.length) % CHARACTERS.length);
      scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    $('#charPrev')?.addEventListener('click', () => step(-1));
    $('#charNext')?.addEventListener('click', () => step(1));

    addEventListener('keydown', (e) => {
      if (!onCharPage || lightboxOpen) return;
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });

    paint(idx);
  }

  /* 共鸣按钮（展厅页与角色页共用同一个 id） */
  (function bindResonance() {
    const rb = $('#resoBtn');
    if (!rb) return;
    rb.addEventListener('click', () => {
      if (!Audio_.enabled) {
        Audio_.setEnabled(true);
        soundBtn.setAttribute('aria-pressed', 'true');
        soundBtn.setAttribute('aria-label', '关闭环境音');
      }
      const c = CHARACTERS[onCharPage ? charIdx : pavIndex];
      if (c) Audio_.chime(c.freq);
      rb.classList.add('playing');
      setTimeout(() => rb.classList.remove('playing'), 900);
    });
  })();

  /* ─────────── 镭射收藏室（collection.html） ─────────── */
  let lab = null;   // { card, rx, ry, auto, gyro }

  function initCollectionPage() {
    const stage = $('#labStage');
    if (!stage) return;

    const card = $('#labCard'), img = $('#labImg'), picker = $('#labPicker');
    const filmsBox = $('#labFilms'), note = $('#labFilmNote');
    const zh = $('#labNameZh'), en = $('#labNameEn'), no = $('#labNo');
    const boost = $('#labBoost'), boostVal = $('#labBoostVal');
    const btnAuto = $('#labAuto'), btnGyro = $('#labGyro'), btnReset = $('#labReset');
    const outRx = $('#labRx'), outRy = $('#labRy'), outAng = $('#labAng');

    let idx = 0, tick = 0;
    lab = { card, rx: -6, ry: 10, auto: false, gyro: true };

    /* 卡膜预设 */
    if (filmsBox) {
      filmsBox.innerHTML = FILMS.map(f =>
        `<button class="lab-chip" data-film="${f.key}" aria-pressed="false">${f.label}</button>`).join('');
      const paintFilm = () => {
        $$('.lab-chip', filmsBox).forEach(b =>
          b.setAttribute('aria-pressed', String(b.dataset.film === currentFilm)));
        const f = FILMS.find(x => x.key === currentFilm);
        if (note && f) note.textContent = f.note;
      };
      filmsBox.addEventListener('click', (e) => {
        const b = e.target.closest('.lab-chip');
        if (!b) return;
        applyFilm(b.dataset.film);
        try { localStorage.setItem(FILM_KEY, currentFilm); } catch (err) {}
        paintFilm();
        if (CHARACTERS[idx]) Audio_.chime(CHARACTERS[idx].freq);
        if (navigator.vibrate) navigator.vibrate(10);
      });
      paintFilm();
    }

    /* 光强度 */
    if (boost) {
      const syncBoost = () => {
        root.style.setProperty('--foil-boost', boost.value);
        if (boostVal) boostVal.textContent = (+boost.value).toFixed(1) + '×';
      };
      boost.addEventListener('input', syncBoost);
      syncBoost();
    }

    /* 角色选择 */
    if (picker) {
      picker.innerHTML = CHARACTERS.map((c, i) => `
        <button class="lab-thumb" data-i="${i}" aria-label="选择 ${c.nameZh}">
          <span class="lab-thumb-box" style="background:linear-gradient(150deg,${c.hue[0]},${c.hue[1]})">
            <img src="${c.image}" alt="${c.nameZh}" loading="lazy">
          </span>
          <span class="lab-thumb-name">${c.nameZh}</span>
        </button>`).join('');
      picker.addEventListener('click', (e) => {
        const b = e.target.closest('.lab-thumb');
        if (b) paint(+b.dataset.i);
      });
    }

    function paint(i) {
      idx = i;
      const c = CHARACTERS[i];
      if (!c) return;
      card.style.setProperty('--card-hue-a', c.hue[0]);
      card.style.setProperty('--card-hue-b', c.hue[1]);
      img.classList.remove('ready');
      const pre = new Image();
      pre.onload = pre.onerror = () => { img.src = c.image; img.classList.add('ready'); };
      pre.src = c.image;
      img.alt = c.nameZh + ' 镭射卡面';
      if (zh) zh.textContent = c.nameZh;
      if (en) en.textContent = c.nameEn.toUpperCase();
      if (no) no.textContent = `${String(i + 1).padStart(2, '0')} / ${String(CHARACTERS.length).padStart(2, '0')}`;
      $$('.lab-thumb', picker).forEach(b => b.classList.toggle('on', +b.dataset.i === i));
      Audio_.chime(c.freq);
      if (navigator.vibrate) navigator.vibrate(12);
    }

    /* 拖动 / 滑动转卡 */
    let sx = 0, sy = 0, brx = 0, bry = 0, dragId = null;
    stage.addEventListener('pointerdown', (e) => {
      dragId = e.pointerId; sx = e.clientX; sy = e.clientY;
      brx = lab.rx; bry = lab.ry;
      stage.classList.add('dragging');
      if (stage.setPointerCapture) { try { stage.setPointerCapture(dragId); } catch (err) {} }
    });
    stage.addEventListener('pointermove', (e) => {
      if (dragId === null || e.pointerId !== dragId) return;
      lab.ry = clamp(bry + (e.clientX - sx) * 0.32, -38, 38);
      lab.rx = clamp(brx - (e.clientY - sy) * 0.26, -28, 28);
    });
    const endDrag = () => { dragId = null; stage.classList.remove('dragging'); };
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('pointerleave', endDrag);

    /* 自动摇曳 / 重力跟随 / 复位 */
    if (btnAuto) btnAuto.addEventListener('click', () => {
      lab.auto = !lab.auto;
      btnAuto.setAttribute('aria-pressed', String(lab.auto));
      btnAuto.classList.toggle('on', lab.auto);
    });
    if (btnGyro) btnGyro.addEventListener('click', () => {
      lab.gyro = !lab.gyro;
      btnGyro.setAttribute('aria-pressed', String(lab.gyro));
      btnGyro.classList.toggle('on', lab.gyro);
      if (lab.gyro) initSensors();
    });
    if (btnGyro) btnGyro.classList.toggle('on', lab.gyro);
    if (btnReset) btnReset.addEventListener('click', () => { lab.rx = -6; lab.ry = 10; });

    /* 姿态读数（每 6 帧刷一次，避免频繁写文本） */
    lab.readout = () => {
      if (++tick % 6) return;
      if (outRx) outRx.textContent = 'X ' + lab.rx.toFixed(1) + '°';
      if (outRy) outRy.textContent = 'Y ' + lab.ry.toFixed(1) + '°';
      if (outAng) outAng.textContent = 'FOIL ' + Math.round((lab.ry * 2 - lab.rx * 2 + 540) % 360) + '°';
    };

    addEventListener('keydown', (e) => {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') paint((idx + 1) % CHARACTERS.length);
      if (e.key === 'ArrowLeft') paint((idx - 1 + CHARACTERS.length) % CHARACTERS.length);
    });

    paint(0);
  }

  /** 收藏室大卡的姿态：手动拖动 + 自动摇曳 + 重力叠加，并把镭射变量写到卡自身 */
  function applyManualTilt() {
    if (!lab) return;
    let rx = lab.rx, ry = lab.ry;

    if (lab.auto && !reduceMotion) {
      const t = performance.now() / 1000;
      ry += Math.sin(t * 0.65) * 20;
      rx += Math.sin(t * 0.45 + 1.1) * 11;
    }
    if (lab.gyro && gyroActive) { ry += curRy * 1.8; rx += curRx * 1.8; }

    ry = clamp(ry, -46, 46); rx = clamp(rx, -34, 34);
    lab.card.style.transform = `perspective(1200px) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;

    // 卡膜跟随这张卡自己的姿态（桌面拖动、自动摇曳时同样能看到镭射流动）
    const strength = clamp((Math.abs(rx) + Math.abs(ry)) / 34, 0.18, 1);
    const s = lab.card.style;
    s.setProperty('--foil-angle', ((ry * 2 - rx * 2 + 540) % 360).toFixed(1) + 'deg');
    s.setProperty('--foil-x', clamp(50 + ry * 1.4, 0, 100).toFixed(1) + '%');
    s.setProperty('--foil-y', clamp(50 + rx * 1.6, 0, 100).toFixed(1) + '%');
    s.setProperty('--foil-opacity', (0.34 + strength * 0.46).toFixed(3));
    s.setProperty('--foil-glow', (0.20 + strength * 0.42).toFixed(3));
    s.setProperty('--sheen-x', (ry * 1.1).toFixed(1) + '%');
    s.setProperty('--sheen-y', (rx * 1.1).toFixed(1) + '%');
    s.setProperty('--sheen-rot', (ry * 0.7).toFixed(1) + 'deg');
    s.setProperty('--sheen-opacity', (0.14 + strength * 0.5).toFixed(3));

    if (lab.readout) lab.readout();
  }

  /* ─────────── 随机相遇 ─────────── */
  $('#surpriseBtn')?.addEventListener('click', (e) => {
    const i = Math.floor(Math.random() * CHARACTERS.length);
    if (pav) openPavilion(i, e.currentTarget);
    else if (CHARACTERS[i]) location.href = 'character.html?id=' + encodeURIComponent(CHARACTERS[i].id);
  });

  /* ─────────── 尺寸 / 启动 ─────────── */
  function onResize() {
    sizeDust();
    sizeWave();
  }
  addEventListener('resize', onResize, { passive: true });

  { const ys = $('#yearSpan'); if (ys) ys.textContent = new Date().getFullYear(); }

  if ($('#filters')) renderFilters();
  if ($('#galleryGrid')) renderCards();
  if ($('#timeline')) renderTimeline();
  if ($('#archiveGrid')) renderArchive();
  if (pavDots) renderDots();
  initCharacterPage();
  initCollectionPage();
  sizeWave();
  observeReveals();
  onResize();
  onScroll();
  requestAnimationFrame(mainLoop);
  runPreloader();
})();
