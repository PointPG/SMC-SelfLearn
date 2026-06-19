// ════════════════════════════════════════════════════════════════
//  SMC INTERACTIVE CANDLESTICK ENGINE  (pure canvas, offline)
//  candles: [open, high, low, close]
//  annotations:
//    { type:'zone',  x1, x2, p1, p2, kind, label }
//    { type:'hline', x1, x2, p, label, kind }
//    { type:'marker',x, p, label, dir:'up'|'down', kind }
// ════════════════════════════════════════════════════════════════

const C = {
  bull:   '#00ff9f',
  bear:   '#ff3860',
  grid:   'rgba(0,240,255,0.05)',
  axis:   'rgba(0,240,255,0.18)',
  text:   '#7fe9ff',
  cyan:   '#00f0ff',
  gold:   '#ffb300',
  magenta:'#ff2e97',
};
function kindStyle(kind) {
  switch (kind) {
    case 'fvg-bull': return { fill: 'rgba(0,255,159,0.13)',  stroke: '#00ff9f' };
    case 'fvg-bear': return { fill: 'rgba(255,56,96,0.13)',  stroke: '#ff3860' };
    case 'ob-bull':  return { fill: 'rgba(0,240,255,0.12)',  stroke: '#00f0ff' };
    case 'ob-bear':  return { fill: 'rgba(255,46,151,0.12)', stroke: '#ff2e97' };
    case 'premium':  return { fill: 'rgba(255,56,96,0.09)',  stroke: '#ff3860' };
    case 'discount': return { fill: 'rgba(0,255,159,0.09)',  stroke: '#00ff9f' };
    case 'accum':    return { fill: 'rgba(255,179,0,0.08)',  stroke: '#ffb300' };
    case 'liquidity':return { fill: 'none', stroke: '#ffb300' };
    case 'sweep':    return { fill: 'none', stroke: '#ffb300' };
    case 'bos':      return { fill: 'none', stroke: '#00f0ff' };
    case 'mss':      return { fill: 'none', stroke: '#00f0ff' };
    case 'target':   return { fill: 'none', stroke: '#00ff9f' };
    default:         return { fill: 'rgba(0,240,255,0.10)', stroke: '#00f0ff' };
  }
}

// ── SCENARIOS ──────────────────────────────────────────────────
const CHART_SCENARIOS = {
  bos: {
    title: 'BREAK_OF_STRUCTURE',
    candles: [
      [100,104,99,103],[103,106,102,105],[105,109,104,108],[108,109,103,104],
      [104,107,103,106],[106,108,105,107],[107,113,106,112],[112,114,108,110],
      [110,113,109,112],
    ],
    annotations: [
      { type:'hline', x1:2, x2:8, p:109, kind:'bos', label:'STRUCTURE HIGH' },
      { type:'marker', x:6, p:109, dir:'up', kind:'bos', label:'BOS' },
    ],
  },
  mss: {
    title: 'MARKET_STRUCTURE_SHIFT',
    candles: [
      [112,113,108,109],[109,110,104,105],[105,106,102,103],[103,107,102,106],
      [106,108,104,105],[105,106,99,104],[104,110,103,109],[109,113,108,112],
      [112,115,111,114],
    ],
    annotations: [
      { type:'hline', x1:2, x2:7, p:102, kind:'liquidity', label:'SELL-SIDE LIQ' },
      { type:'marker', x:5, p:99, dir:'down', kind:'sweep', label:'SWEEP' },
      { type:'hline', x1:3, x2:8, p:108, kind:'mss', label:'MSS LEVEL' },
      { type:'marker', x:7, p:108, dir:'up', kind:'mss', label:'MSS' },
    ],
  },
  sweep: {
    title: 'LIQUIDITY_SWEEP / MANIPULATION',
    candles: [
      [110,111,107,108],[108,109,104,105],[105,106,103,104],[104,105,103,104],
      [104,105,99,103],[103,109,102,108],[108,112,107,111],[111,113,109,110],
    ],
    annotations: [
      { type:'hline', x1:1, x2:6, p:103, kind:'liquidity', label:'EQUAL LOWS (LIQ)' },
      { type:'marker', x:4, p:99, dir:'down', kind:'sweep', label:'SWEEP' },
      { type:'marker', x:5, p:109, dir:'up', kind:'bos', label:'REVERSAL' },
    ],
  },
  fvg: {
    title: 'FAIR_VALUE_GAP',
    candles: [
      [100,102,99,101],[101,103,100,102],[102,103,101,102],[102,109,102,108],
      [108,110,104,109],[109,110,106,107],[107,108,103,104],[104,108,103,107],
      [107,110,106,109],
    ],
    annotations: [
      { type:'zone', x1:2.5, x2:8.5, p1:103, p2:104, kind:'fvg-bull', label:'FVG' },
      { type:'marker', x:3, p:109, dir:'up', kind:'bos', label:'DISPLACEMENT' },
      { type:'marker', x:6, p:103.5, dir:'down', kind:'mss', label:'FILL' },
    ],
  },
  ob: {
    title: 'ORDER_BLOCK',
    candles: [
      [106,107,103,104],[104,105,101,102],[102,110,101,109],[109,112,108,111],
      [111,113,109,110],[110,111,104,105],[105,111,103,110],[110,113,109,112],
    ],
    annotations: [
      { type:'zone', x1:1, x2:7.5, p1:102, p2:104, kind:'ob-bull', label:'BULLISH OB' },
      { type:'marker', x:2, p:110, dir:'up', kind:'bos', label:'DISPLACEMENT' },
      { type:'marker', x:5, p:104, dir:'down', kind:'mss', label:'RETEST' },
    ],
  },
  premdisc: {
    title: 'PREMIUM / DISCOUNT',
    candles: [
      [100,104,100,103],[103,108,102,107],[107,112,106,111],[111,118,110,117],
      [117,120,115,116],[116,117,110,111],[111,113,104,105],[105,106,100,101],
      [101,107,100,106],[106,110,105,109],
    ],
    annotations: [
      { type:'zone', x1:0, x2:9.5, p1:110, p2:120, kind:'premium', label:'PREMIUM // SELL' },
      { type:'zone', x1:0, x2:9.5, p1:100, p2:110, kind:'discount', label:'DISCOUNT // BUY' },
      { type:'hline', x1:0, x2:9.5, p:110, kind:'bos', label:'EQ 50%' },
    ],
  },
  expansion: {
    title: 'EXPANSION / DISPLACEMENT',
    candles: [
      [100,101,99,100],[100,101,99,100],[100,102,99,101],[101,102,99,100],
      [100,108,100,107],[107,113,106,112],[112,118,111,117],[117,119,114,115],
    ],
    annotations: [
      { type:'zone', x1:-0.4, x2:3.5, p1:99, p2:102, kind:'accum', label:'ACCUMULATION' },
      { type:'marker', x:4, p:108, dir:'up', kind:'bos', label:'EXPANSION' },
    ],
  },
  buySetup: {
    title: 'BUY_SETUP // FULL_SEQUENCE',
    candles: [
      [115,116,112,113],[113,114,109,110],[110,111,107,108],[108,112,107,111],
      [111,112,108,109],[109,110,104,108],[108,115,107,114],[114,117,113,116],
      [116,118,111,112],[112,119,111,118],[118,123,117,122],[122,124,120,121],
    ],
    annotations: [
      { type:'hline', x1:2, x2:7, p:107, kind:'liquidity', label:'LIQUIDITY' },
      { type:'marker', x:5, p:104, dir:'down', kind:'sweep', label:'SWEEP' },
      { type:'hline', x1:5, x2:9, p:112, kind:'mss', label:'MSS' },
      { type:'zone', x1:6, x2:11.5, p1:112, p2:114, kind:'fvg-bull', label:'FVG ENTRY' },
      { type:'hline', x1:9, x2:11.5, p:122, kind:'target', label:'TP TARGET' },
    ],
  },
  sellSetup: {
    title: 'SELL_SETUP // FULL_SEQUENCE',
    candles: [
      [105,108,104,107],[107,111,106,110],[110,113,109,112],[112,113,108,109],
      [109,112,108,111],[111,116,110,112],[112,113,105,106],[106,107,103,104],
      [104,109,103,108],[108,109,101,102],[102,103,97,98],[98,100,96,97],
    ],
    annotations: [
      { type:'hline', x1:2, x2:7, p:113, kind:'liquidity', label:'LIQUIDITY' },
      { type:'marker', x:5, p:116, dir:'up', kind:'sweep', label:'SWEEP' },
      { type:'hline', x1:5, x2:9, p:108, kind:'mss', label:'MSS' },
      { type:'zone', x1:6, x2:11.5, p1:106, p2:108, kind:'fvg-bear', label:'FVG ENTRY' },
      { type:'hline', x1:9, x2:11.5, p:98, kind:'target', label:'TP TARGET' },
    ],
  },
};

// ── ENGINE ─────────────────────────────────────────────────────
class SMCChart {
  constructor(canvas, scn, readout) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scn = scn;
    this.readout = readout;
    this.candles = scn.candles.map(c => ({ o: c[0], h: c[1], l: c[2], c: c[3] }));
    this.n = this.candles.length;
    this.reveal = this.n;
    this.mouse = null;
    this.raf = null;
    this.pad = { top: 20, right: 56, bottom: 24, left: 14 };

    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      this.mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
      this.draw();
    });
    canvas.addEventListener('mouseleave', () => {
      this.mouse = null; this.draw();
      if (this.readout) this.readout.innerHTML = '<span class="ro-dim">— hover เพื่อดูราคา —</span>';
    });
    this.resize();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.clientWidth || 600;
    const h = this.canvas.clientHeight || 300;
    this.canvas.width = w * dpr; this.canvas.height = h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = w; this.H = h;
    this._scale();
    this.draw();
  }

  _scale() {
    let min = Infinity, max = -Infinity;
    this.candles.forEach(c => { min = Math.min(min, c.l); max = Math.max(max, c.h); });
    (this.scn.annotations || []).forEach(a => {
      [a.p, a.p1, a.p2].forEach(v => { if (v != null) { min = Math.min(min, v); max = Math.max(max, v); } });
    });
    const pad = (max - min) * 0.10 || 1;
    this.pMin = min - pad; this.pMax = max + pad;
    this.plotL = this.pad.left; this.plotR = this.W - this.pad.right;
    this.plotT = this.pad.top;  this.plotB = this.H - this.pad.bottom;
    this.step = (this.plotR - this.plotL) / (this.n + 1);
    this.cw = Math.max(3, Math.min(26, this.step * 0.62));
  }

  x(i) { return this.plotL + this.step * (i + 1); }
  y(p) { return this.plotB - (p - this.pMin) / (this.pMax - this.pMin) * (this.plotB - this.plotT); }
  priceAt(yy) { return this.pMin + (this.plotB - yy) / (this.plotB - this.plotT) * (this.pMax - this.pMin); }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    this._grid();
    this._zones();
    this._hlines();
    for (let i = 0; i < this.reveal; i++) this._candle(i);
    this._markers();
    this._crosshair();
  }

  _grid() {
    const ctx = this.ctx;
    ctx.lineWidth = 1;
    ctx.strokeStyle = C.grid;
    ctx.fillStyle = C.text;
    ctx.font = "10px 'Share Tech Mono', monospace";
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const p = this.pMin + (this.pMax - this.pMin) * (i / steps);
      const yy = this.y(p);
      ctx.beginPath(); ctx.moveTo(this.plotL, yy); ctx.lineTo(this.plotR, yy); ctx.stroke();
      ctx.globalAlpha = 0.6;
      ctx.fillText(p.toFixed(1), this.plotR + 6, yy + 3);
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = C.axis;
    ctx.beginPath(); ctx.moveTo(this.plotR, this.plotT); ctx.lineTo(this.plotR, this.plotB); ctx.stroke();
  }

  _zones() {
    const ctx = this.ctx;
    (this.scn.annotations || []).filter(a => a.type === 'zone').forEach(a => {
      const s = kindStyle(a.kind);
      const xa = this.x(a.x1), xb = this.x(a.x2);
      const ya = this.y(Math.max(a.p1, a.p2)), yb = this.y(Math.min(a.p1, a.p2));
      ctx.fillStyle = s.fill;
      ctx.fillRect(xa, ya, xb - xa, yb - ya);
      ctx.strokeStyle = s.stroke; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
      ctx.strokeRect(xa, ya, xb - xa, yb - ya);
      ctx.setLineDash([]);
      if (a.label) {
        ctx.fillStyle = s.stroke;
        ctx.font = "9px 'Share Tech Mono', monospace";
        ctx.fillText(a.label, xa + 4, ya + 11);
      }
    });
  }

  _hlines() {
    const ctx = this.ctx;
    (this.scn.annotations || []).filter(a => a.type === 'hline').forEach(a => {
      const s = kindStyle(a.kind);
      const yy = this.y(a.p);
      ctx.strokeStyle = s.stroke; ctx.lineWidth = 1.3; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(this.x(a.x1), yy); ctx.lineTo(this.x(a.x2), yy); ctx.stroke();
      ctx.setLineDash([]);
      if (a.label) {
        ctx.fillStyle = s.stroke;
        ctx.font = "9px 'Share Tech Mono', monospace";
        ctx.fillText(a.label, this.x(a.x1) + 2, yy - 4);
      }
    });
  }

  _candle(i) {
    const ctx = this.ctx;
    const c = this.candles[i];
    const up = c.c >= c.o;
    const col = up ? C.bull : C.bear;
    const cx = this.x(i);
    ctx.strokeStyle = col; ctx.fillStyle = col;
    ctx.shadowColor = col; ctx.shadowBlur = 6;
    // wick
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(cx, this.y(c.h)); ctx.lineTo(cx, this.y(c.l)); ctx.stroke();
    // body
    const yo = this.y(c.o), yc = this.y(c.c);
    const top = Math.min(yo, yc);
    const hgt = Math.max(2, Math.abs(yo - yc));
    if (up) {
      ctx.fillStyle = 'rgba(0,255,159,0.22)';
      ctx.fillRect(cx - this.cw / 2, top, this.cw, hgt);
      ctx.strokeRect(cx - this.cw / 2, top, this.cw, hgt);
    } else {
      ctx.fillRect(cx - this.cw / 2, top, this.cw, hgt);
    }
    ctx.shadowBlur = 0;
  }

  _markers() {
    const ctx = this.ctx;
    (this.scn.annotations || []).filter(a => a.type === 'marker').forEach(a => {
      if (a.x >= this.reveal) return;
      const s = kindStyle(a.kind);
      const cx = this.x(a.x), cy = this.y(a.p);
      const up = a.dir === 'up';
      const ty = up ? cy + 14 : cy - 14;
      ctx.fillStyle = s.stroke; ctx.shadowColor = s.stroke; ctx.shadowBlur = 8;
      ctx.beginPath();
      if (up) { ctx.moveTo(cx, cy + 4); ctx.lineTo(cx - 5, ty); ctx.lineTo(cx + 5, ty); }
      else    { ctx.moveTo(cx, cy - 4); ctx.lineTo(cx - 5, ty); ctx.lineTo(cx + 5, ty); }
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      // label chip
      ctx.font = "bold 9px 'Share Tech Mono', monospace";
      const tw = ctx.measureText(a.label).width;
      const lx = cx - tw / 2 - 4, ly = up ? ty + 3 : ty - 15;
      ctx.fillStyle = 'rgba(5,8,15,0.85)';
      ctx.fillRect(lx, ly, tw + 8, 13);
      ctx.strokeStyle = s.stroke; ctx.lineWidth = 1; ctx.strokeRect(lx, ly, tw + 8, 13);
      ctx.fillStyle = s.stroke;
      ctx.fillText(a.label, lx + 4, ly + 10);
    });
  }

  _crosshair() {
    if (!this.mouse) return;
    const ctx = this.ctx;
    const { x: mx, y: my } = this.mouse;
    if (mx < this.plotL || mx > this.plotR || my < this.plotT || my > this.plotB) return;
    ctx.strokeStyle = 'rgba(0,240,255,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(mx, this.plotT); ctx.lineTo(mx, this.plotB);
    ctx.moveTo(this.plotL, my); ctx.lineTo(this.plotR, my); ctx.stroke();
    ctx.setLineDash([]);
    // price tag
    const price = this.priceAt(my);
    ctx.fillStyle = C.cyan;
    ctx.fillRect(this.plotR, my - 7, this.pad.right, 14);
    ctx.fillStyle = '#05080f';
    ctx.font = "10px 'Share Tech Mono', monospace";
    ctx.fillText(price.toFixed(1), this.plotR + 5, my + 3);
    // nearest candle
    let idx = Math.round((mx - this.plotL) / this.step - 1);
    idx = Math.max(0, Math.min(this.reveal - 1, idx));
    const c = this.candles[idx];
    if (c) {
      const cx = this.x(idx);
      ctx.strokeStyle = 'rgba(0,240,255,0.5)';
      ctx.strokeRect(cx - this.cw / 2 - 2, this.plotT, this.cw + 4, this.plotB - this.plotT);
      if (this.readout) {
        const up = c.c >= c.o;
        const col = up ? C.bull : C.bear;
        this.readout.innerHTML =
          `<span class="ro-i">#${idx + 1}</span>` +
          `O <b>${c.o.toFixed(1)}</b>  H <b>${c.h.toFixed(1)}</b>  L <b>${c.l.toFixed(1)}</b>  ` +
          `C <b style="color:${col}">${c.c.toFixed(1)}</b>`;
      }
    }
  }

  run() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.reveal = 0;
    let frame = 0;
    const tick = () => {
      frame++;
      if (frame % 4 === 0 && this.reveal < this.n) this.reveal++;
      this.draw();
      if (this.reveal < this.n) this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }
}

// ── MOUNT ──────────────────────────────────────────────────────
let _activeChart = null;
function mountChart(container, name) {
  const scn = CHART_SCENARIOS[name];
  if (!scn) { container.innerHTML = ''; container.style.display = 'none'; _activeChart = null; return null; }
  container.style.display = '';
  container.innerHTML = `
    <div class="chart-card">
      <span class="corner tl"></span><span class="corner tr"></span>
      <span class="corner bl"></span><span class="corner br"></span>
      <div class="chart-hd">
        <span class="chart-title">▮ MARKET_REPLAY :: ${scn.title}</span>
        <button class="chart-btn" data-act="run">▶ RUN</button>
      </div>
      <div class="chart-canvas-wrap">
        <canvas class="smc-canvas"></canvas>
        <div class="chart-readout" data-readout><span class="ro-dim">— hover เพื่อดูราคา —</span></div>
      </div>
      <div class="chart-legend" data-legend></div>
    </div>`;
  const canvas = container.querySelector('canvas');
  const readout = container.querySelector('[data-readout]');
  const legendEl = container.querySelector('[data-legend]');

  const chart = new SMCChart(canvas, scn, readout);
  _activeChart = chart;

  // legend from annotation kinds
  const seen = {};
  (scn.annotations || []).forEach(a => {
    const key = a.label || a.kind;
    if (seen[key]) return; seen[key] = 1;
    const s = kindStyle(a.kind);
    legendEl.insertAdjacentHTML('beforeend',
      `<span class="legend-item"><span class="legend-dot" style="background:${s.stroke}"></span>${a.label || a.kind}</span>`);
  });
  legendEl.insertAdjacentHTML('beforeend',
    `<span class="legend-item"><span class="legend-dot" style="background:${C.bull}"></span>BULL</span>` +
    `<span class="legend-item"><span class="legend-dot" style="background:${C.bear}"></span>BEAR</span>`);

  container.querySelector('[data-act="run"]').onclick = () => chart.run();
  return chart;
}

window.addEventListener('resize', () => { if (_activeChart) _activeChart.resize(); });
window.mountChart = mountChart;
