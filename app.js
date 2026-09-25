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

  /* ─────────── 数据 ─────────── */
  const CHARACTERS = [
    {
      id: 'haanye',
      nameZh: '幻叶', nameEn: 'Haanye',
      tag: 'Green Leaf Dream',
      personality: '活泼 · 开朗 · 温柔',
      tags: ['活泼', '温柔'],
      birthday: '11月23日 · 初春之叶',
      element: '风 · 嫩芽',
      chapter: '第一叶',
      quote: '像风一样，把快乐吹进每一片叶子里。',
      story: '幻叶诞生于初春嫩芽萌发的瞬间，身着荧光嫩绿的潮流外套。她热爱踏着晨曦露水漫游在各地森林，把收集落叶作为独一无二的宝物。那双清澈的眼睛闪烁着自然的生机，把风的温度带给旅途中的每个人。',
      image: 'https://picui.ogmua.cn/s1/2026/09/13/6aa6a9fba2fc6.webp',
      freq: 523.25,
      hue: ['#a8d5b5', '#5c9c78']
    },
    {
      id: 'xiaoyezi',
      nameZh: '小叶子', nameEn: 'Xiaoyezi',
      tag: 'Pure Natural',
      personality: '温柔 · 腼腆 · 细腻',
      tags: ['温柔'],
      birthday: '10月12日 · 碧水微澜',
      element: '水 · 微光',
      chapter: '第二叶',
      quote: '一片叶子，一份温柔。很高兴认识你~',
      story: '小叶子宛如春日微风拂落的柔光。坐在石栏旁的她总是安静翻阅着画册，青翠长发旁缀着两片嫩芽发饰。她虽然不善张扬言语，却能用最纯净的目光与无声陪伴，治愈每一个平凡疲惫的日常。',
      image: 'https://picui.ogmua.cn/s1/2026/09/13/6aa6acb082068.webp',
      freq: 587.33,
      hue: ['#bfe0d0', '#4f8f8b']
    },
    {
      id: 'twins',
      nameZh: '小白 & 小黑', nameEn: 'Little Black & White',
      tag: 'Two Souls, One World',
      personality: '小白(软萌傲娇) · 小黑(活泼粘人)',
      tags: ['双生', '活泼'],
      birthday: '双生同栖 · 永恒晨曦',
      element: '光 · 影',
      chapter: '第三叶',
      quote: '有你在的地方，就是最温暖的角落 ♡',
      story: '依偎在暖阳里的猫耳双生少女。戴着十字发夹的白猫小白略带害羞，黑猫小黑则总是开心地紧紧环抱对方。黑白相依，是彼此无可替代的纯洁羁绊，在安静的角落构筑起最坚实的避风港。',
      image: 'https://picui.ogmua.cn/s1/2026/09/13/6aa6ae2bbc8c3.webp',
      freq: 659.25,
      hue: ['#e8e4dc', '#5a5f66']
    },
    {
      id: 'daidai',
      nameZh: '呆呆', nameEn: 'Daidai',
      tag: 'Big Dreamer',
      personality: '天真 · 呆萌 · 温柔',
      tags: ['天真', '温柔'],
      birthday: '猫尾星纪 · 晴空倒影',
      element: '海 · 倒影',
      chapter: '第四叶',
      quote: '虽然有点呆，但我一直都在努力变可爱！',
      story: '拥有一头如澄澈海浪般微卷蓝发的猫尾女孩呆呆。戴着宽大的魔法兜帽，脚踩厚底运动鞋坐在水镜倒影中。她是一个很普通但又无比特别的小小存在，时刻期待着与你一同出发去看更大的世界。',
      image: 'https://picui.ogmua.cn/s1/2026/09/13/6aa6ad2c1965f.webp',
      freq: 783.99,
      hue: ['#a9c8e8', '#4a6fa5']
    }
  ];

  const TIMELINE = [
    { time: 'AE · 0001', title: '第一片叶落下', desc: 'AETHERIA 的世界以落叶计时。当第一片嫩芽脱离枝头，风便学会了说话 —— 那是幻叶第一次听见自己的名字。' },
    { time: 'AE · 0007', title: '碧水微澜之日', desc: '小叶子坐在石栏上翻完了一整本画册。她没有说话，只是把书签夹进风里，从此每一页都能被风读懂。' },
    { time: 'AE · 0013', title: '双生的晨曦', desc: '光与影在同一刻醒来。小白与小黑共享一次呼吸，也共享同一个避风港 —— 从此所有的角落都不再空旷。' },
    { time: 'AE · 0021', title: '倒影里的远方', desc: '呆呆在水镜中看见比天空更大的世界。她握紧兜帽的边角，决定要亲眼去看一次 —— 哪怕路很长，哪怕有点呆。' },
    { time: 'AE · NOW', title: '你推开了这扇门', desc: '绘卷在你眼前展开。每一次停留，都会有一片叶子记住你的名字。' }
  ];

  const ARCHIVE = [
    { key: 'WORLD',   val: '以落叶计时的世界', note: 'AETHERIA 没有钟表。人们以叶子的飘落次数记录相遇，因此每一次重逢都被精确地记得。' },
    { key: 'MEDIUM',  val: '绘卷 · 数字立绘',   note: '全部立绘以数字绘画完成，保留手绘笔触与柔光叠层，长图不做裁切，完整呈现角色比例。' },
    { key: 'SOUND',   val: '共鸣频率',          note: '每位角色拥有一段专属基频。开启环境音后，波形会随真实音频起伏 —— 那是她们的呼吸。' },
    { key: 'GESTURE', val: '左右滑 · 下拉返回', note: '展厅内左右轻扫切换角色；页面滚到顶部后继续下拉，即可返回画廊。桌面端支持方向键与 Esc。' }
  ];

  const FILTERS = [
    { key: 'all',   label: '全部绘卷' },
    { key: '活泼', label: '活泼' },
    { key: '温柔', label: '温柔' },
    { key: '天真', label: '天真' },
    { key: '双生', label: '双生' }
  ];

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
      card.addEventListener('click', () => openPavilion(+card.dataset.index, card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPavilion(+card.dataset.index, card); }
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
      const r = c.getBoundingClientRect();
      const px = clamp((ev.clientX - r.left) / r.width, 0, 1);
      const py = clamp((ev.clientY - r.top) / r.height, 0, 1);
      const rx = (0.5 - py) * 13;
      const ry = (px - 0.5) * 15;
      c.dataset.hovering = '1';   // 鼠标优先：悬停中的卡片不受陀螺仪接管
      c.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
      const ang = Math.atan2(py - 0.5, px - 0.5) * 180 / Math.PI + 90;
      const foil = $('.card-foil', c);
      foil.style.setProperty('--foil-angle', ang + 'deg');
      foil.style.opacity = '0.62';
      c.style.setProperty('--foil-x', px * 100 + '%');
      c.style.setProperty('--foil-y', py * 100 + '%');
    });
  }
  function resetTilt(c) {
    delete c.dataset.hovering;
    c.style.transform = '';
    const foil = $('.card-foil', c);
    if (foil) foil.style.opacity = '0';
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
      <div class="arc-card reveal">
        <div class="arc-key mono">${a.key}</div>
        <div class="arc-val">${a.val}</div>
        <p class="arc-note">${a.note}</p>
      </div>
    `).join('');
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
  const waveCanvas = $('#waveCanvas');
  const wctx = waveCanvas.getContext('2d');
  let wavePhase = 0, waveEnergy = 0;

  function sizeWave() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = waveCanvas.clientWidth || 560;
    const h = 46;
    waveCanvas.width = w * dpr;
    waveCanvas.height = h * dpr;
    wctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawWave() {
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
    if (pavOpen) drawWave();
    else applyGyroTilt();
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
  const sectionIO = new IntersectionObserver((ens) => {
    ens.forEach(en => {
      if (!en.isIntersecting) return;
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
    });
  }, { threshold: 0.4 });
  ['gallery', 'chronicle', 'archive'].forEach(id => { const s = $('#' + id); if (s) sectionIO.observe(s); });

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

  $('#pavClose').addEventListener('click', closePavilion);
  $('#pavNext').addEventListener('click', nextChar);
  $('#pavPrev').addEventListener('click', prevChar);
  $('#pavZoom').addEventListener('click', (e) => { e.stopPropagation(); openLightbox(); });
  $('.pav-frame').addEventListener('click', () => openLightbox());

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
  pav.addEventListener('touchstart', (e) => {
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    dx = dy = 0;
    atTop = pav.scrollTop <= 0;
    pulling = false;
  }, { passive: true });

  pav.addEventListener('touchmove', (e) => {
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

  pav.addEventListener('touchend', () => {
    if (pulling) {
      if (dy > 90) { closePavilion(); }
      else { pavShift.style.transform = ''; pavDrag.classList.remove('armed'); $('#dragHint').textContent = '向下拉动返回画廊'; }
      return;
    }
    if (Math.abs(dx) > 52 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      dx < 0 ? nextChar() : prevChar();
    }
  }, { passive: true });

  pavDrag.addEventListener('click', closePavilion);

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
  $('#lbClose').addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

  lb.addEventListener('wheel', (e) => {
    if (!lightboxOpen) return;
    e.preventDefault();
    lbScale = clamp(lbScale * (e.deltaY > 0 ? 0.92 : 1.08), 0.6, 6);
    applyLb();
  }, { passive: false });

  lb.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.lb-close')) return;
    lbDrag = true; lbSX = e.clientX - lbX; lbSY = e.clientY - lbY;
    lb.classList.add('dragging');
  });
  addEventListener('pointermove', (e) => {
    if (!lbDrag) return;
    lbX = e.clientX - lbSX; lbY = e.clientY - lbSY; applyLb();
  }, { passive: true });
  addEventListener('pointerup', () => { lbDrag = false; lb.classList.remove('dragging'); });

  lb.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      pinchBase = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });
  lb.addEventListener('touchmove', (e) => {
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
  lb.addEventListener('touchend', () => { pinchBase = 0; });

  /* ─────────── 陀螺仪（移动端静默授权 + 卡片 3D 立体） ─────────── */
  let sensorsBound = false;
  let gyroActive = false, gyroGamma = 0, gyroBeta = 45;
  let curRx = 0, curRy = 0;   // 当前平滑角度（逐帧逼近目标，消除传感器原始抖动）

  /** 由主循环每帧统一应用，避免 deviceorientation 高频回调里反复写样式 */
  function applyGyroTilt() {
    if (!gyroActive) return;
    const tRy = clamp(gyroGamma * 0.3, -16, 16);
    const tRx = clamp(-(gyroBeta - 45) * 0.3, -14, 14);
    curRy += (tRy - curRy) * 0.12;
    curRx += (tRx - curRx) * 0.12;
    if (pavOpen) return;
    const t = `perspective(1100px) rotateY(${curRy.toFixed(2)}deg) rotateX(${curRx.toFixed(2)}deg)`;
    for (const c of grid.children) {          // live 集合，零查询开销
      if (c.classList.contains('is-out')) continue;
      if (c.dataset.hovering) continue;       // 鼠标悬停中的卡片交给指针控制
      c.style.transform = t;
    }
  }

  function bindSensors() {
    if (sensorsBound) return;
    sensorsBound = true;
    const onOrient = (e) => {
      if (e.gamma == null && e.beta == null) return;   // 设备没有真实传感器
      const gamma = e.gamma || 0, beta = e.beta || 0;
      gyroActive = true;
      gyroGamma = gamma;
      gyroBeta = beta;

      targetPX = clamp(gamma / 35, -1, 1);
      targetPY = clamp((beta - 45) / 35, -1, 1);

      // 全息反光：手机倾斜时整页共享一个反射角，卡片随之流光（首次传感器数据到达即点亮）
      root.style.setProperty('--foil-angle', ((gamma * 2 + beta * 2 + 180) % 360) + 'deg');
      root.style.setProperty('--foil-x', clamp((gamma + 30) / 60 * 100, 0, 100) + '%');
      root.style.setProperty('--foil-y', clamp((beta - 20) / 50 * 100, 0, 100) + '%');
      root.style.setProperty('--foil-opacity', '0.5');
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
        if (pavOpen) goTo(Math.floor(Math.random() * CHARACTERS.length));
        else openPavilion(Math.floor(Math.random() * CHARACTERS.length));
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
  ['touchstart', 'click'].forEach(ev =>
    addEventListener(ev, initSensors, { once: true, passive: true })
  );

  /* ─────────── 随机相遇 ─────────── */
  $('#surpriseBtn').addEventListener('click', () => {
    openPavilion(Math.floor(Math.random() * CHARACTERS.length), $('#surpriseBtn'));
  });

  /* ─────────── 尺寸 / 启动 ─────────── */
  function onResize() {
    sizeDust();
    sizeWave();
  }
  addEventListener('resize', onResize, { passive: true });

  $('#yearSpan').textContent = new Date().getFullYear();

  renderFilters();
  renderCards();
  renderTimeline();
  renderArchive();
  renderDots();
  observeReveals();
  onResize();
  onScroll();
  requestAnimationFrame(mainLoop);
  runPreloader();
})();
