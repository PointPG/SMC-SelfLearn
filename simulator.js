// ════════════════════════════════════════════════════════════════
//  SMC TRADING SIMULATOR  (pure JS + canvas, offline)
//  - Manual Bar-Replay practice
//  - Auto SMC strategy Backtest
//  - Combined Stats Dashboard (localStorage)
// ════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  const SC = {
    bull: '#00ff9f', bear: '#ff3860',
    grid: 'rgba(0,240,255,0.05)', axis: 'rgba(0,240,255,0.18)',
    text: '#7fe9ff', cyan: '#00f0ff', gold: '#ffb300',
    magenta: '#ff2e97', green: '#00ff9f', red: '#ff3860',
    bg: '#05080f', muted: '#5d7e92',
  };
  const TVUP = '#26a69a';   // TradingView-style candle colors
  const TVDN = '#ef5350';

  const VIEW = 72;            // visible candles window in replay
  const START_BAL = 10000;    // base account balance
  const SYMBOL = 'XAUUSD';

  // ── seedable RNG (mulberry32) ──────────────────────────────────
  function rngFrom(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const r2 = x => Math.round(x * 100) / 100;

  // ── synthetic OHLC generator (random-walk + regimes + sweeps) ──
  function genSeries(seed, n, start) {
    n = n || 220; start = start || 2000;
    const rnd = rngFrom(seed);
    const out = [];
    let price = start;
    let drift = (rnd() - 0.5) * 0.5;
    let vol = 1.4 + rnd() * 1.1;
    let biasDir = 0, biasLeft = 0;     // post-sweep reversal tendency (SMC-like edge)
    for (let i = 0; i < n; i++) {
      if (rnd() < 0.045) drift = (rnd() - 0.5) * 1.0;     // trend regime change
      if (rnd() < 0.03) vol = 0.9 + rnd() * 2.0;          // volatility change
      const o = price;
      let change = drift + (rnd() - 0.5) * vol * 2;
      if (biasLeft > 0) { change += biasDir * vol * 0.95; biasLeft--; }  // reversal follow-through
      let c = o + change;
      const range = Math.abs(change) + rnd() * vol * 1.4 + 0.3;
      let h = Math.max(o, c) + rnd() * range * 0.55;
      let l = Math.min(o, c) - rnd() * range * 0.55;
      if (rnd() < 0.06) {                                  // liquidity sweep spike → arm reversal
        if (rnd() < 0.5) { l -= vol * (1 + rnd() * 2.2); biasDir = 1; biasLeft = 4 + Math.floor(rnd() * 4); }
        else { h += vol * (1 + rnd() * 2.2); biasDir = -1; biasLeft = 4 + Math.floor(rnd() * 4); }
      }
      out.push([r2(o), r2(h), r2(l), r2(c)]);
      price = c;
      if (price < 50) { price = 50; drift = Math.abs(drift); }
    }
    return out;
  }

  // ── stats engine (R-based, source-agnostic) ────────────────────
  function computeStats(trades) {
    let wins = 0, losses = 0, sumR = 0, winR = 0, lossR = 0;
    let grossW = 0, grossL = 0, netPnl = 0;
    let cum = 0, peak = 0, maxdd = 0;
    let curWin = 0, curLoss = 0, bestWin = 0, worstLoss = 0;
    const eq = [0];
    trades.forEach(t => {
      const r = t.rMultiple;
      sumR += r; netPnl += (t.pnl || 0);
      if (r >= 0) {
        wins++; winR += r; grossW += r;
        curWin++; curLoss = 0; bestWin = Math.max(bestWin, curWin);
      } else {
        losses++; lossR += r; grossL += Math.abs(r);
        curLoss++; curWin = 0; worstLoss = Math.max(worstLoss, curLoss);
      }
      cum += r; eq.push(cum);
      peak = Math.max(peak, cum); maxdd = Math.max(maxdd, peak - cum);
    });
    const n = trades.length;
    return {
      n, wins, losses,
      winRate: n ? wins / n * 100 : 0,
      netR: sumR, netPnl,
      pf: grossL ? grossW / grossL : (grossW > 0 ? Infinity : 0),
      avgWinR: wins ? winR / wins : 0,
      avgLossR: losses ? lossR / losses : 0,
      expectancyR: n ? sumR / n : 0,
      maxDDR: maxdd,
      bestWin, worstLoss,
      equity: eq,
    };
  }

  // ── SMC strategy backtest (causal sweep + reversal) ────────────
  function runBacktest(series, p) {
    const risk = p.risk, rr = p.rr, L = p.lookback;
    let bal = START_BAL;
    const trades = [];
    let pos = null;
    const atrAt = i => {
      let s = 0, k = 0;
      for (let j = Math.max(1, i - L); j < i; j++) { s += series[j][1] - series[j][2]; k++; }
      return k ? s / k : 1;
    };
    for (let i = L; i < series.length; i++) {
      const c = series[i];           // [o,h,l,c]
      // resolve open position first (intrabar; SL assumed first if both)
      if (pos) {
        let exit = null, hitSL = false;
        if (pos.dir === 'long') {
          if (c[2] <= pos.sl) { exit = pos.sl; hitSL = true; }
          else if (c[1] >= pos.tp) { exit = pos.tp; }
        } else {
          if (c[1] >= pos.sl) { exit = pos.sl; hitSL = true; }
          else if (c[2] <= pos.tp) { exit = pos.tp; }
        }
        if (exit != null) {
          const pnl = (pos.dir === 'long' ? exit - pos.entry : pos.entry - exit) * pos.size;
          bal += pnl;
          trades.push({
            source: 'backtest', dir: pos.dir, entry: pos.entry, exit,
            rMultiple: pnl / pos.riskAmt, pnl, reason: hitSL ? 'SL' : 'TP', t: i,
          });
          pos = null;
        }
      }
      if (pos) continue;
      // rolling extremes over prior window
      let recLow = Infinity, recHigh = -Infinity;
      for (let j = i - L; j < i; j++) { recLow = Math.min(recLow, series[j][2]); recHigh = Math.max(recHigh, series[j][1]); }
      const atr = atrAt(i);
      // SL anchored to ATR (just past entry), not the deep sweep wick — keeps risk tight & TP reachable
      const dist = Math.max(0.2, atr * 1.3);
      const bull = c[3] > c[0], bear = c[3] < c[0];
      // bullish: swept below recent low then closed back above
      if (c[2] < recLow && c[3] > recLow && bull) {
        const entry = c[3], riskAmt = bal * risk, size = riskAmt / dist;
        pos = { dir: 'long', entry, sl: entry - dist, tp: entry + rr * dist, size, riskAmt };
      } else if (c[1] > recHigh && c[3] < recHigh && bear) {
        const entry = c[3], riskAmt = bal * risk, size = riskAmt / dist;
        pos = { dir: 'short', entry, sl: entry + dist, tp: entry - rr * dist, size, riskAmt };
      }
    }
    return { trades, finalBal: bal };
  }

  // ── formatting ─────────────────────────────────────────────────
  const f$ = v => (v < 0 ? '-$' : '$') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fR = v => (v >= 0 ? '+' : '') + v.toFixed(2) + 'R';
  const fPx = v => v.toFixed(2);

  // ── persistence ────────────────────────────────────────────────
  const LS = { acct: 'smc_sim_acct', hist: 'smc_sim_hist', bt: 'smc_sim_bt' };
  function loadHist() { try { return JSON.parse(localStorage.getItem(LS.hist) || '[]'); } catch { return []; } }
  function saveHist(h) { localStorage.setItem(LS.hist, JSON.stringify(h)); }
  function loadBal() { const v = parseFloat(localStorage.getItem(LS.acct)); return isFinite(v) ? v : START_BAL; }
  function saveBal(v) { localStorage.setItem(LS.acct, String(v)); }
  function loadBT() { try { return JSON.parse(localStorage.getItem(LS.bt) || 'null'); } catch { return null; } }
  function saveBT(o) { localStorage.setItem(LS.bt, JSON.stringify(o)); }

  // ════════════════════════════════════════════════════════════════
  //  STATE
  // ════════════════════════════════════════════════════════════════
  const S = {
    built: false,
    tab: 'replay',
    series: [], seed: 0, cursor: 0,
    pos: null,              // open position {dir,entry,sl,tp,size,riskAmt,openBar}
    balance: START_BAL,
    chartTrades: [],        // resolved trades on current chart (for markers)
    playing: false, timer: null, speed: 1,
    statsFilter: 'all',
    // ── chart view / drawing ──
    view: 72,               // visible bars (zoom)
    follow: true,           // auto-track latest bar
    rightEdge: 0,           // absolute bar index at right edge when not following
    scaleMin: null, scaleMax: null,  // manual vertical price scale (null = auto-fit)
    tool: 'cursor',         // active drawing tool
    drawColor: '#00f0ff',
    drawings: [],           // committed drawings (data coords) — reset per chart
    _draft: null,           // in-progress drawing
    _pan: null,             // pan drag state
    _vdrag: null,           // price-axis vertical-scale drag
    _hdrag: null,           // time-axis horizontal-scale drag
    _lvldrag: null,         // dragging a TP/SL handle of the open position
    hover: null, hoverIdx: null,
    _geo: null,
  };
  let el = {};             // cached DOM refs

  // ════════════════════════════════════════════════════════════════
  //  BUILD UI
  // ════════════════════════════════════════════════════════════════
  function build() {
    const root = document.getElementById('simView');
    root.innerHTML = `
      <div class="sim-wrap">
        <div class="sim-head">
          <div class="sim-titleblock">
            <div class="sim-title">⚡ SMC TRADING_SIMULATOR</div>
            <div class="sim-sub">// practice · backtest · analyse — offline sandbox</div>
          </div>
          <div class="sim-tabs">
            <button data-tab="replay" class="active">▶ REPLAY</button>
            <button data-tab="backtest">⚙ BACKTEST</button>
            <button data-tab="stats">📊 DASHBOARD</button>
          </div>
        </div>

        <!-- ── REPLAY ── -->
        <section class="sim-panel" data-panel="replay">
          <div class="sim-grid">
            <div class="sim-chart-col">
              <div class="sim-chart-card">
                <span class="corner tl"></span><span class="corner tr"></span>
                <span class="corner bl"></span><span class="corner br"></span>
                <div class="sim-chart-hd">
                  <span class="sim-sym">▮ ${SYMBOL} · SIM <span data-seed></span></span>
                  <span class="sim-barinfo" data-barinfo></span>
                </div>
                <div class="sim-chart-main">
                  <div class="sim-drawbar">
                    <button class="dtool active" data-tool="cursor" title="Cursor / ลากเพื่อเลื่อน">⤧</button>
                    <button class="dtool" data-tool="trend" title="Trend Line — ลากวาดเส้นเทรนด์">╱</button>
                    <button class="dtool" data-tool="ray" title="Ray — เส้นยิงไปขวา">⟋</button>
                    <button class="dtool" data-tool="hline" title="Horizontal Line — เส้นแนวนอน/ระดับราคา">─</button>
                    <button class="dtool" data-tool="rect" title="Rectangle — กล่องโซน OB/FVG">▭</button>
                    <button class="dtool" data-tool="arrow" title="Arrow — ลูกศรชี้">➜</button>
                    <button class="dtool eraser" data-tool="eraser" title="Eraser — คลิกลบเส้น">⌫</button>
                    <div class="dsep"></div>
                    <button class="dtool" data-act="undo" title="Undo">↶</button>
                    <button class="dtool" data-act="clear-draw" title="ลบทั้งหมด">🗑</button>
                    <div class="dsep"></div>
                    <button class="dcol active" data-color="#00f0ff" style="--c:#00f0ff" title="cyan"></button>
                    <button class="dcol" data-color="#00ff9f" style="--c:#00ff9f" title="green"></button>
                    <button class="dcol" data-color="#ff3860" style="--c:#ff3860" title="red"></button>
                    <button class="dcol" data-color="#ffb300" style="--c:#ffb300" title="gold"></button>
                    <button class="dcol" data-color="#e8eefc" style="--c:#e8eefc" title="white"></button>
                  </div>
                  <div class="sim-canvas-wrap">
                    <canvas class="sim-canvas" data-canvas title="ลากแกนราคา(ขวา) = ย่อ/ขยายแท่งแนวตั้ง · ลากแกนเวลา(ล่าง) = ซูมแนวนอน · ดับเบิลคลิกแกน = auto"></canvas>
                    <div class="sim-readout" data-readout></div>
                    <button class="sim-live" data-act="live" title="กลับไปแท่งล่าสุด">⊙ LIVE</button>
                  </div>
                </div>
              </div>

              <div class="sim-controls">
                <button class="simc-btn" data-ctl="restart" title="เริ่มชาร์ตนี้ใหม่">⏮</button>
                <button class="simc-btn" data-ctl="back" title="ถอยหลัง 1 แท่ง">◀</button>
                <button class="simc-btn play" data-ctl="play">▶ PLAY</button>
                <button class="simc-btn" data-ctl="step">STEP ▶</button>
                <label class="simc-speed">SPEED
                  <select data-speed>
                    <option value="0.5">0.5x</option>
                    <option value="1" selected>1x</option>
                    <option value="2">2x</option>
                    <option value="4">4x</option>
                  </select>
                </label>
                <button class="simc-btn new" data-ctl="new" title="สุ่มชาร์ตใหม่">↻ NEW CHART</button>
              </div>

              <div class="sim-minilog">
                <div class="sim-minilog-hd">▌ TRADES_THIS_CHART</div>
                <div class="sim-minilog-body" data-minilog></div>
              </div>
            </div>

            <div class="sim-side">
              <div class="sim-card sim-acct">
                <div class="sim-card-hd">ACCOUNT</div>
                <div class="acct-row"><span>Balance</span><b data-bal></b></div>
                <div class="acct-row"><span>Equity</span><b data-eq></b></div>
                <div class="acct-row"><span>Open P/L</span><b data-open></b></div>
                <div class="acct-bar"><div class="acct-bar-fill" data-balbar></div></div>
              </div>

              <div class="sim-card sim-pos" data-poswrap></div>

              <div class="sim-card sim-ticket" data-ticket>
                <div class="sim-card-hd">ORDER_TICKET</div>
                <div class="tk-field"><label>Risk %</label><input type="number" data-risk value="1" min="0.1" max="10" step="0.1"></div>
                <div class="tk-field"><label>SL (price)</label><input type="number" data-sl step="0.1" min="0.1"></div>
                <div class="tk-field"><label>R:R</label><input type="number" data-rr value="2" min="0.5" max="10" step="0.5"></div>
                <div class="tk-info" data-tkinfo></div>
                <div class="tk-btns">
                  <button class="tk-buy" data-act="buy">▲ BUY</button>
                  <button class="tk-sell" data-act="sell">▼ SELL</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── BACKTEST ── -->
        <section class="sim-panel" data-panel="backtest" hidden>
          <div class="sim-bt-config sim-card">
            <div class="sim-card-hd">STRATEGY_CONFIG // SMC SWEEP→REVERSAL</div>
            <div class="bt-params">
              <div class="tk-field"><label>Seed</label><input type="number" data-bt-seed value="1" min="1"></div>
              <div class="tk-field"><label>Bars</label><input type="number" data-bt-bars value="400" min="80" max="3000" step="20"></div>
              <div class="tk-field"><label>Risk %</label><input type="number" data-bt-risk value="1" min="0.1" max="10" step="0.1"></div>
              <div class="tk-field"><label>R:R</label><input type="number" data-bt-rr value="2" min="0.5" max="10" step="0.5"></div>
              <div class="tk-field"><label>Lookback</label><input type="number" data-bt-lb value="10" min="3" max="40"></div>
            </div>
            <div class="bt-actions">
              <button class="tk-buy" data-act="run-bt">▶ RUN BACKTEST</button>
              <button class="simc-btn" data-act="rand-bt" title="สุ่ม seed แล้วรัน">🎲 RANDOM</button>
              <span class="bt-note">ผลรันล่าสุดจะรวมเข้า Dashboard อัตโนมัติ</span>
            </div>
          </div>
          <div class="sim-bt-result" data-bt-result>
            <div class="sim-empty">⚙ ตั้งค่าแล้วกด RUN BACKTEST เพื่อดูผล strategy</div>
          </div>
        </section>

        <!-- ── DASHBOARD ── -->
        <section class="sim-panel" data-panel="stats" hidden>
          <div class="sim-statbar">
            <div class="sim-filter">
              <button data-filter="all" class="active">ALL</button>
              <button data-filter="manual">MANUAL</button>
              <button data-filter="backtest">BACKTEST</button>
            </div>
            <button class="simc-btn danger" data-act="clear">🗑 CLEAR HISTORY</button>
          </div>
          <div data-stats-body></div>
        </section>
      </div>`;

    el = {
      root,
      panels: {},
      tabBtns: root.querySelectorAll('.sim-tabs button'),
      canvas: root.querySelector('[data-canvas]'),
      readout: root.querySelector('[data-readout]'),
      seed: root.querySelector('[data-seed]'),
      barinfo: root.querySelector('[data-barinfo]'),
      minilog: root.querySelector('[data-minilog]'),
      bal: root.querySelector('[data-bal]'),
      eq: root.querySelector('[data-eq]'),
      open: root.querySelector('[data-open]'),
      balbar: root.querySelector('[data-balbar]'),
      poswrap: root.querySelector('[data-poswrap]'),
      risk: root.querySelector('[data-risk]'),
      sl: root.querySelector('[data-sl]'),
      rr: root.querySelector('[data-rr]'),
      tkinfo: root.querySelector('[data-tkinfo]'),
      playBtn: root.querySelector('[data-ctl="play"]'),
      speed: root.querySelector('[data-speed]'),
      btResult: root.querySelector('[data-bt-result]'),
      statsBody: root.querySelector('[data-stats-body]'),
      filterBtns: root.querySelectorAll('[data-filter]'),
    };
    root.querySelectorAll('.sim-panel').forEach(p => { el.panels[p.dataset.panel] = p; });

    bindEvents();
    S.balance = loadBal();
    S.built = true;
    newChart();
  }

  // ════════════════════════════════════════════════════════════════
  //  EVENTS
  // ════════════════════════════════════════════════════════════════
  function bindEvents() {
    el.tabBtns.forEach(b => b.onclick = () => switchTab(b.dataset.tab));

    el.root.querySelector('[data-ctl="restart"]').onclick = () => { stopPlay(); restartChart(); };
    el.root.querySelector('[data-ctl="back"]').onclick = () => { stopPlay(); stepBack(); };
    el.playBtn.onclick = () => togglePlay();
    el.root.querySelector('[data-ctl="step"]').onclick = () => { stopPlay(); step(); };
    el.root.querySelector('[data-ctl="new"]').onclick = () => { stopPlay(); newChart(); };
    el.speed.onchange = () => { S.speed = parseFloat(el.speed.value); if (S.playing) { stopPlay(); togglePlay(); } };

    el.root.querySelector('[data-act="buy"]').onclick = () => placeOrder('long');
    el.root.querySelector('[data-act="sell"]').onclick = () => placeOrder('short');
    [el.risk, el.sl, el.rr].forEach(inp => inp.oninput = updateTicketInfo);

    el.root.querySelector('[data-act="run-bt"]').onclick = () => runBT(false);
    el.root.querySelector('[data-act="rand-bt"]').onclick = () => runBT(true);

    el.filterBtns.forEach(b => b.onclick = () => {
      S.statsFilter = b.dataset.filter;
      el.filterBtns.forEach(x => x.classList.toggle('active', x === b));
      renderDashboard();
    });
    el.root.querySelector('[data-act="clear"]').onclick = clearHistory;

    // drawing toolbar
    el.root.querySelectorAll('[data-tool]').forEach(b => b.onclick = () => setTool(b.dataset.tool));
    el.root.querySelector('[data-act="undo"]').onclick = () => { S.drawings.pop(); drawReplay(); };
    el.root.querySelector('[data-act="clear-draw"]').onclick = () => { S.drawings = []; drawReplay(); };
    el.root.querySelectorAll('[data-color]').forEach(b => b.onclick = () => {
      S.drawColor = b.dataset.color;
      el.root.querySelectorAll('[data-color]').forEach(x => x.classList.toggle('active', x === b));
    });
    el.root.querySelector('[data-act="live"]').onclick = () => { S.follow = true; updateLiveBtn(); drawReplay(); };

    window.addEventListener('resize', () => { if (S.tab === 'replay') drawReplay(); });

    // keyboard replay control (sim mode only)
    window.addEventListener('keydown', e => {
      if (!document.body.classList.contains('sim-mode') || S.tab !== 'replay') return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'button') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); stopPlay(); step(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); stopPlay(); stepBack(); }
      else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    });
  }

  function setTool(t) {
    S.tool = t; S._draft = null;
    el.root.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('active', b.dataset.tool === t));
    if (el.canvas) el.canvas.style.cursor = t === 'cursor' ? 'grab' : t === 'eraser' ? 'pointer' : 'crosshair';
  }
  function updateLiveBtn() {
    const btn = el.root.querySelector('[data-act="live"]');
    if (btn) btn.classList.toggle('show', !S.follow);
  }

  function switchTab(tab) {
    S.tab = tab;
    el.tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    Object.entries(el.panels).forEach(([k, p]) => { p.hidden = (k !== tab); });
    if (tab === 'replay') drawReplay();
    if (tab === 'stats') renderDashboard();
  }

  // ════════════════════════════════════════════════════════════════
  //  REPLAY CONTROL
  // ════════════════════════════════════════════════════════════════
  function newChart() {
    S.seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
    S.series = genSeries(S.seed, 240);
    S.cursor = 44;            // initial revealed history
    S.pos = null;
    S.chartTrades = [];
    S.drawings = []; S._draft = null;
    S.view = 72; S.follow = true;
    S.scaleMin = S.scaleMax = null;
    updateLiveBtn();
    autoSL();
    refreshAll();
  }
  function restartChart() {
    S.cursor = 44; S.pos = null; S.chartTrades = [];
    S.drawings = []; S._draft = null;
    S.view = 72; S.follow = true; S.scaleMin = S.scaleMax = null;
    updateLiveBtn();
    autoSL();
    refreshAll();
  }
  function autoSL() {
    // suggest SL distance ~ 1.4 × recent ATR
    const i = S.cursor, L = 14;
    let s = 0, k = 0;
    for (let j = Math.max(1, i - L); j <= i; j++) { s += S.series[j][1] - S.series[j][2]; k++; }
    const atr = k ? s / k : 3;
    el.sl.value = (Math.max(0.5, atr * 1.4)).toFixed(2);
  }

  function step() {
    if (S.cursor >= S.series.length - 1) { stopPlay(); flashBar('— จบชาร์ตแล้ว · กด NEW CHART —'); return; }
    S.cursor++;
    if (S.pos) resolveIntrabar(S.series[S.cursor]);
    refreshAll();
  }
  function stepBack() {
    if (S.pos) return;                 // don't rewind through an open trade
    if (S.cursor <= 44) return;
    S.cursor--;
    refreshAll();
  }
  function togglePlay() {
    if (S.playing) { stopPlay(); return; }
    S.playing = true;
    el.playBtn.textContent = '⏸ PAUSE';
    el.playBtn.classList.add('on');
    const tick = () => {
      step();
      if (S.cursor >= S.series.length - 1) { stopPlay(); return; }
      S.timer = setTimeout(tick, 600 / S.speed);
    };
    S.timer = setTimeout(tick, 600 / S.speed);
  }
  function stopPlay() {
    S.playing = false;
    clearTimeout(S.timer); S.timer = null;
    if (el.playBtn) { el.playBtn.textContent = '▶ PLAY'; el.playBtn.classList.remove('on'); }
  }

  // ── trading ────────────────────────────────────────────────────
  function placeOrder(dir) {
    if (S.pos) { flashBar('มีออเดอร์เปิดอยู่แล้ว — ปิดก่อน'); return; }
    if (S.cursor >= S.series.length - 2) { flashBar('ใกล้จบชาร์ต — กด NEW CHART'); return; }
    const entry = S.series[S.cursor][3];
    const slDist = parseFloat(el.sl.value);
    const rr = parseFloat(el.rr.value);
    const riskPct = parseFloat(el.risk.value) / 100;
    if (!(slDist > 0) || !(rr > 0) || !(riskPct > 0)) { flashBar('ค่าใน ticket ไม่ถูกต้อง'); return; }
    const riskAmt = S.balance * riskPct;
    const size = riskAmt / slDist;
    const sl = dir === 'long' ? entry - slDist : entry + slDist;
    const tp = dir === 'long' ? entry + rr * slDist : entry - rr * slDist;
    S.pos = { dir, entry, sl, tp, size, riskAmt, openBar: S.cursor };
    refreshAll();
  }
  function resolveIntrabar(c) {
    const p = S.pos; if (!p) return;
    let exit = null, hitSL = false;
    if (p.dir === 'long') {
      if (c[2] <= p.sl) { exit = p.sl; hitSL = true; }
      else if (c[1] >= p.tp) { exit = p.tp; }
    } else {
      if (c[1] >= p.sl) { exit = p.sl; hitSL = true; }
      else if (c[2] <= p.tp) { exit = p.tp; }
    }
    if (exit != null) closeAt(exit, hitSL ? 'SL' : 'TP');
  }
  function closeManual() {
    if (!S.pos) return;
    closeAt(S.series[S.cursor][3], 'MANUAL');
  }
  function closeAt(price, reason) {
    const p = S.pos; if (!p) return;
    const pnl = (p.dir === 'long' ? price - p.entry : p.entry - price) * p.size;
    const rMultiple = pnl / p.riskAmt;
    S.balance = Math.max(0, S.balance + pnl);
    saveBal(S.balance);
    const rec = { source: 'manual', dir: p.dir, entry: p.entry, exit: price, rMultiple, pnl, reason, t: Date.now(), bar: S.cursor };
    const h = loadHist(); h.push(rec); saveHist(h);
    S.chartTrades.push(rec);
    S.pos = null;
    const tag = reason === 'TP' ? '🎯 TP HIT' : reason === 'SL' ? '🛑 SL HIT' : 'CLOSED';
    flashBar(`${tag} · ${fR(rMultiple)} · ${pnl >= 0 ? '+' : ''}${f$(pnl)}`, rMultiple >= 0);
    refreshAll();
  }

  // ════════════════════════════════════════════════════════════════
  //  RENDER (replay)
  // ════════════════════════════════════════════════════════════════
  function refreshAll() {
    el.seed.textContent = '#' + (S.seed % 100000).toString().padStart(5, '0');
    const open = openPnl();
    el.barinfo.textContent = `BAR ${S.cursor + 1}/${S.series.length}  ·  C ${S.series[S.cursor][3].toFixed(2)}`;
    el.bal.textContent = f$(S.balance);
    el.eq.textContent = f$(S.balance + open);
    el.open.textContent = (open >= 0 ? '+' : '') + f$(open);
    el.open.style.color = open > 0 ? SC.green : open < 0 ? SC.red : SC.text;
    const balPct = Math.max(0, Math.min(100, S.balance / (START_BAL * 2) * 100));
    el.balbar.style.width = balPct + '%';
    el.balbar.style.background = S.balance >= START_BAL ? SC.green : SC.red;
    renderPosition();
    renderMiniLog();
    updateTicketInfo();
    if (!S.hover) updateLegend(S.cursor);
    drawReplay();
  }
  function openPnl() {
    if (!S.pos) return 0;
    const c = S.series[S.cursor][3];
    return (S.pos.dir === 'long' ? c - S.pos.entry : S.pos.entry - c) * S.pos.size;
  }
  function renderPosition() {
    const p = S.pos;
    if (!p) {
      el.poswrap.innerHTML = `<div class="sim-card-hd">POSITION</div><div class="pos-empty">— ไม่มีออเดอร์เปิด —<br>ตั้งค่าแล้วกด BUY/SELL</div>`;
      el.poswrap.classList.remove('long', 'short');
      return;
    }
    const op = openPnl();
    const dirTxt = p.dir === 'long' ? '▲ LONG' : '▼ SHORT';
    el.poswrap.classList.toggle('long', p.dir === 'long');
    el.poswrap.classList.toggle('short', p.dir === 'short');
    el.poswrap.innerHTML = `
      <div class="sim-card-hd">POSITION <span class="pos-dir ${p.dir}">${dirTxt}</span></div>
      <div class="pos-grid">
        <div><span>Entry</span><b>${fPx(p.entry)}</b></div>
        <div><span>Size</span><b>${p.size.toFixed(2)}</b></div>
        <div><span>SL</span><b style="color:${SC.red}">${fPx(p.sl)}</b></div>
        <div><span>TP</span><b style="color:${SC.green}">${fPx(p.tp)}</b></div>
      </div>
      <div class="pos-pnl" style="color:${op >= 0 ? SC.green : SC.red}">
        Open P/L: ${op >= 0 ? '+' : ''}${f$(op)} <span class="pos-r">(${fR(op / p.riskAmt)})</span>
      </div>
      <button class="pos-close" data-act="close">✕ CLOSE AT MARKET</button>
      <div class="pos-hint">↕ ลากเส้น/ที่จับ SL · TP บนกราฟเพื่อปรับ</div>`;
    el.poswrap.querySelector('[data-act="close"]').onclick = () => { stopPlay(); closeManual(); };
  }
  function renderMiniLog() {
    if (!S.chartTrades.length) { el.minilog.innerHTML = '<span class="ro-dim">ยังไม่มีเทรดในชาร์ตนี้</span>'; return; }
    el.minilog.innerHTML = S.chartTrades.slice(-12).reverse().map(t => {
      const win = t.rMultiple >= 0;
      return `<span class="mini-trade ${win ? 'win' : 'loss'}">${t.dir === 'long' ? '▲' : '▼'} ${fR(t.rMultiple)} <i>${t.reason}</i></span>`;
    }).join('');
  }
  function updateTicketInfo() {
    if (!el.tkinfo) return;
    const slDist = parseFloat(el.sl.value), rr = parseFloat(el.rr.value), riskPct = parseFloat(el.risk.value);
    const riskAmt = S.balance * (riskPct / 100);
    if (slDist > 0 && rr > 0 && riskPct > 0) {
      el.tkinfo.innerHTML = `เสี่ยง <b>${f$(riskAmt)}</b> → ถ้าโดน TP ได้ <b style="color:${SC.green}">+${f$(riskAmt * rr)}</b> · size ${(riskAmt / slDist).toFixed(2)}`;
    } else el.tkinfo.textContent = '';
    const disabled = !!S.pos;
    el.root.querySelector('[data-act="buy"]').disabled = disabled;
    el.root.querySelector('[data-act="sell"]').disabled = disabled;
  }
  function flashBar(msg, good) {
    if (typeof window.showToast === 'function') window.showToast(msg, good === true);
  }
  // TradingView-style OHLC legend (top-left of chart)
  function updateLegend(i) {
    if (!el.readout) return;
    const c = S.series[i]; if (!c) return;
    const prev = S.series[i - 1];
    const ch = prev ? c[3] - prev[3] : 0;
    const chp = prev ? ch / prev[3] * 100 : 0;
    const up = c[3] >= c[0];
    const col = up ? TVUP : TVDN, dcol = ch >= 0 ? TVUP : TVDN;
    el.readout.innerHTML =
      `<span class="lg-sym">${SYMBOL}</span><span class="lg-i">#${i + 1}</span>` +
      `<span class="lg-k">O</span><b>${c[0].toFixed(2)}</b>` +
      `<span class="lg-k">H</span><b>${c[1].toFixed(2)}</b>` +
      `<span class="lg-k">L</span><b>${c[2].toFixed(2)}</b>` +
      `<span class="lg-k">C</span><b style="color:${col}">${c[3].toFixed(2)}</b>` +
      `<span class="lg-ch" style="color:${dcol}">${ch >= 0 ? '+' : ''}${ch.toFixed(2)} (${chp >= 0 ? '+' : ''}${chp.toFixed(2)}%)</span>`;
  }

  // ── geometry (reads S._geo, recomputed each draw) ──────────────
  function gx(bar) { const g = S._geo; return g.plotL + g.step * (bar - g.start + 1); }
  function gy(p) { const g = S._geo; return g.plotB - (p - g.min) / (g.max - g.min) * (g.plotB - g.plotT); }
  function gbar(px) { const g = S._geo; return (px - g.plotL) / g.step - 1 + g.start; }
  function gprice(py) { const g = S._geo; return g.min + (g.plotB - py) / (g.plotB - g.plotT) * (g.max - g.min); }

  // ── canvas drawing (TradingView-style) ─────────────────────────
  function drawReplay() {
    const cv = el.canvas; if (!cv) return;
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth || 600, h = cv.clientHeight || 360;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const padT = 10, padB = 22, padR = 64, padL = 10;
    const plotL = padL, plotR = w - padR, plotT = padT, plotB = h - padB;

    const rightIdx = S.follow ? S.cursor : Math.max(0, S.rightEdge);  // may exceed cursor → blank space on the right
    const start = rightIdx - S.view + 1;            // may be < 0 (blank space at left)
    const visStart = Math.max(0, start);
    const lastBar = Math.min(rightIdx, S.cursor);   // candles never drawn past the revealed cursor

    let amin = Infinity, amax = -Infinity;
    for (let b = visStart; b <= lastBar; b++) { amin = Math.min(amin, S.series[b][2]); amax = Math.max(amax, S.series[b][1]); }
    if (S.scaleMin == null && S.pos) [S.pos.entry, S.pos.sl, S.pos.tp].forEach(v => { amin = Math.min(amin, v); amax = Math.max(amax, v); });
    if (!isFinite(amin)) { amin = 0; amax = 1; }
    const pd = (amax - amin) * 0.10 || 1;
    let min, max;
    if (S.scaleMin != null && S.scaleMax != null && S.scaleMax > S.scaleMin) { min = S.scaleMin; max = S.scaleMax; }
    else { min = amin - pd; max = amax + pd; }

    const step = (plotR - plotL) / (S.view + 1);
    const cw = Math.max(1.5, Math.min(16, step * 0.7));
    S._geo = { start, view: S.view, rightIdx, visStart, step, plotL, plotR, plotT, plotB, padR, cw, min, max };
    const X = gx, Y = gy;

    // price grid + right-axis labels
    ctx.font = "10px 'Share Tech Mono', monospace"; ctx.lineWidth = 1;
    for (let g = 0; g <= 5; g++) {
      const p = min + (max - min) * (g / 5), yy = Y(p);
      ctx.strokeStyle = 'rgba(125,150,180,0.07)';
      ctx.beginPath(); ctx.moveTo(plotL, yy); ctx.lineTo(plotR, yy); ctx.stroke();
      ctx.fillStyle = SC.muted; ctx.fillText(p.toFixed(1), plotR + 7, yy + 3);
    }
    // time grid + bottom-axis labels
    const tickEvery = Math.max(1, Math.round(S.view / 8));
    for (let b = Math.ceil(visStart / tickEvery) * tickEvery; b <= lastBar; b += tickEvery) {
      const xx = X(b);
      ctx.strokeStyle = 'rgba(125,150,180,0.05)';
      ctx.beginPath(); ctx.moveTo(xx, plotT); ctx.lineTo(xx, plotB); ctx.stroke();
      ctx.fillStyle = SC.muted; ctx.fillText('#' + (b + 1), xx - 9, plotB + 14);
    }
    ctx.strokeStyle = SC.axis;
    ctx.beginPath(); ctx.moveTo(plotR, plotT); ctx.lineTo(plotR, plotB); ctx.moveTo(plotL, plotB); ctx.lineTo(plotR, plotB); ctx.stroke();

    // TradingView-style Long/Short position box
    if (S.pos) drawPosition(ctx, Y, plotL, plotR, padR);

    // candles
    for (let b = visStart; b <= lastBar; b++) drawCandle(ctx, X(b), S.series[b], Y, cw);

    // user drawings (clipped to plot area)
    ctx.save();
    ctx.beginPath(); ctx.rect(plotL, plotT, plotR - plotL, plotB - plotT); ctx.clip();
    S.drawings.forEach(d => drawOne(ctx, d, false));
    if (S._draft) drawOne(ctx, S._draft, true);
    ctx.restore();

    // trade markers
    S.chartTrades.forEach(t => {
      if (t.bar == null || t.bar < visStart || t.bar > rightIdx) return;
      const cx = X(t.bar), cy = Y(t.exit);
      ctx.fillStyle = t.rMultiple >= 0 ? SC.green : SC.red;
      ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.fill();
    });

    // last price line + right-axis tag (only when the latest bar is on-screen)
    if (S.cursor >= visStart && S.cursor <= rightIdx) {
      const lc = S.series[S.cursor], yL = Y(lc[3]);
      ctx.strokeStyle = 'rgba(255,179,0,0.45)'; ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(plotL, yL); ctx.lineTo(plotR, yL); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = SC.gold; ctx.fillRect(plotR, yL - 7, padR, 14);
      ctx.fillStyle = SC.bg; ctx.font = "bold 10px 'Share Tech Mono', monospace";
      ctx.fillText(lc[3].toFixed(2), plotR + 5, yL + 3);
    }

    // crosshair (hover)
    if (S.hover) drawCrosshair(ctx, plotL, plotR, plotT, plotB, padR);
  }
  function drawCandle(ctx, cx, c, Y, cw) {
    const up = c[3] >= c[0];
    const col = up ? TVUP : TVDN;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, Y(c[1])); ctx.lineTo(cx, Y(c[2])); ctx.stroke();
    const yo = Y(c[0]), yc = Y(c[3]);
    const top = Math.min(yo, yc), hgt = Math.max(1, Math.abs(yo - yc));
    ctx.fillRect(cx - cw / 2, top, cw, hgt);
  }
  // ── TradingView-style position box (green profit zone / red risk zone) ──
  function drawPosition(ctx, Y, plotL, plotR, padR) {
    const p = S.pos; if (!p) return;
    const g = S._geo;
    const xE = (p.openBar != null && p.openBar >= g.start) ? Math.max(plotL, gx(p.openBar)) : plotL;
    const yE = Y(p.entry), yS = Y(p.sl), yT = Y(p.tp);
    const rr = Math.abs((p.tp - p.entry) / (p.entry - p.sl)) || 0;
    const boxW = plotR - xE;
    const op = openPnl(), rNow = op / p.riskAmt;

    // profit zone (entry → TP) green, risk zone (entry → SL) red
    ctx.fillStyle = 'rgba(38,166,154,0.13)';
    ctx.fillRect(xE, Math.min(yE, yT), boxW, Math.abs(yE - yT));
    ctx.fillStyle = 'rgba(239,83,80,0.13)';
    ctx.fillRect(xE, Math.min(yE, yS), boxW, Math.abs(yE - yS));
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(38,166,154,0.5)';
    ctx.strokeRect(xE + 0.5, Math.min(yE, yT) + 0.5, boxW - 1, Math.max(1, Math.abs(yE - yT)));
    ctx.strokeStyle = 'rgba(239,83,80,0.5)';
    ctx.strokeRect(xE + 0.5, Math.min(yE, yS) + 0.5, boxW - 1, Math.max(1, Math.abs(yE - yS)));

    // entry / TP / SL guide lines + right-axis price tags
    posLine(ctx, xE, plotR, yT, 'rgba(38,166,154,0.85)');
    posLine(ctx, xE, plotR, yS, 'rgba(239,83,80,0.85)');
    posLine(ctx, xE, plotR, yE, 'rgba(216,230,255,0.7)');
    priceTag(ctx, plotR, yT, padR, TVUP, '#04130f', fPx(p.tp));
    priceTag(ctx, plotR, yS, padR, TVDN, '#1c0709', fPx(p.sl));
    priceTag(ctx, plotR, yE, padR, '#27374e', '#dfeaff', fPx(p.entry));

    // draggable grip handles on TP & SL lines
    const xMid = (xE + plotR) / 2;
    drawGrip(ctx, xMid, yT, TVUP);
    drawGrip(ctx, xMid, yS, TVDN);

    // zone labels (target / stop)
    ctx.font = "bold 9px 'Share Tech Mono', monospace";
    ctx.fillStyle = TVUP;
    ctx.fillText(`TARGET +${rr.toFixed(1)}R`, xE + 6, (Math.min(yE, yT) + Math.max(yE, yT)) / 2 + 3);
    ctx.fillStyle = TVDN;
    ctx.fillText('STOP -1.0R', xE + 6, (Math.min(yE, yS) + Math.max(yE, yS)) / 2 + 3);

    // direction badge anchored on the entry line
    const dirTxt = (p.dir === 'long' ? '▲ LONG ' : '▼ SHORT ') + rr.toFixed(1) + 'R';
    ctx.font = "bold 9px 'Share Tech Mono', monospace";
    const bw = ctx.measureText(dirTxt).width + 12;
    ctx.fillStyle = p.dir === 'long' ? TVUP : TVDN;
    ctx.fillRect(xE, yE - 9, bw, 18);
    ctx.fillStyle = '#03130d';
    ctx.fillText(dirTxt, xE + 6, yE + 3);

    // live P/L pill at right edge of the entry line
    const plTxt = `${rNow >= 0 ? '+' : ''}${rNow.toFixed(2)}R`;
    ctx.font = "bold 9px 'Share Tech Mono', monospace";
    const pw = ctx.measureText(plTxt).width + 10;
    ctx.fillStyle = rNow >= 0 ? 'rgba(38,166,154,0.92)' : 'rgba(239,83,80,0.92)';
    ctx.fillRect(plotR - pw - 2, yE - 9, pw, 18);
    ctx.fillStyle = '#03130d';
    ctx.fillText(plTxt, plotR - pw + 3, yE + 3);
  }
  function posLine(ctx, x1, x2, y, color) {
    ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); ctx.setLineDash([]);
  }
  function priceTag(ctx, plotR, y, padR, bg, fg, text) {
    ctx.fillStyle = bg; ctx.fillRect(plotR, y - 7, padR, 14);
    ctx.fillStyle = fg; ctx.font = "bold 10px 'Share Tech Mono', monospace";
    ctx.fillText(text, plotR + 4, y + 3);
  }
  function drawGrip(ctx, x, y, col) {
    const w = 16, h = 9;
    ctx.fillStyle = col; ctx.fillRect(x - w / 2, y - h / 2, w, h);
    ctx.fillStyle = 'rgba(3,19,13,0.85)';
    for (let i = -1; i <= 1; i++) ctx.fillRect(x + i * 3 - 0.5, y - 2.5, 1, 5);
  }
  // hit-test the open position's TP/SL grab lines → 'tp' | 'sl' | null
  function posHandleAt(x, y) {
    if (!S.pos || !S._geo) return null;
    const g = S._geo, p = S.pos;
    const xE = (p.openBar != null && p.openBar >= g.start) ? Math.max(g.plotL, gx(p.openBar)) : g.plotL;
    if (x < xE - 6 || x > g.plotR + 2) return null;
    if (Math.abs(y - gy(p.tp)) <= 6) return 'tp';
    if (Math.abs(y - gy(p.sl)) <= 6) return 'sl';
    return null;
  }
  function hexA(hex, a) {
    const m = hex.replace('#', '');
    return `rgba(${parseInt(m.slice(0, 2), 16)},${parseInt(m.slice(2, 4), 16)},${parseInt(m.slice(4, 6), 16)},${a})`;
  }

  // ── user drawings ──────────────────────────────────────────────
  function drawOne(ctx, d, preview) {
    const col = d.color || SC.cyan, g = S._geo;
    ctx.strokeStyle = col; ctx.fillStyle = col;
    ctx.lineWidth = preview ? 1 : 1.5;
    ctx.setLineDash(preview ? [4, 3] : []);
    ctx.globalAlpha = preview ? 0.85 : 1;
    if (d.type === 'hline') {
      const y = gy(d.a.price);
      ctx.beginPath(); ctx.moveTo(g.plotL, y); ctx.lineTo(g.plotR, y); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      ctx.fillStyle = col; ctx.fillRect(g.plotR, y - 7, g.padR, 13);
      ctx.fillStyle = SC.bg; ctx.font = "9px 'Share Tech Mono', monospace";
      ctx.fillText(d.a.price.toFixed(2), g.plotR + 4, y + 3);
      return;
    }
    const ax = gx(d.a.bar), ay = gy(d.a.price), bx = gx(d.b.bar), by = gy(d.b.price);
    if (d.type === 'rect') {
      ctx.fillStyle = hexA(col, 0.10);
      ctx.fillRect(Math.min(ax, bx), Math.min(ay, by), Math.abs(bx - ax), Math.abs(by - ay));
      ctx.strokeStyle = col;
      ctx.strokeRect(Math.min(ax, bx), Math.min(ay, by), Math.abs(bx - ax), Math.abs(by - ay));
    } else if (d.type === 'trend') {
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    } else if (d.type === 'ray') {
      let ex = g.plotR, ey = by;
      if (bx !== ax) ey = ay + (by - ay) / (bx - ax) * (ex - ax);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke();
    } else if (d.type === 'arrow') {
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      const ang = Math.atan2(by - ay, bx - ax), hl = 10;
      ctx.beginPath();
      ctx.moveTo(bx, by); ctx.lineTo(bx - hl * Math.cos(ang - 0.42), by - hl * Math.sin(ang - 0.42));
      ctx.moveTo(bx, by); ctx.lineTo(bx - hl * Math.cos(ang + 0.42), by - hl * Math.sin(ang + 0.42));
      ctx.stroke();
    }
    ctx.setLineDash([]); ctx.globalAlpha = 1;
  }
  function drawCrosshair(ctx, plotL, plotR, plotT, plotB, padR) {
    const { x, y } = S.hover;
    if (x < plotL || x > plotR || y < plotT || y > plotB) return;
    ctx.strokeStyle = 'rgba(150,170,200,0.4)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, plotT); ctx.lineTo(x, plotB); ctx.moveTo(plotL, y); ctx.lineTo(plotR, y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "10px 'Share Tech Mono', monospace";
    ctx.fillStyle = '#2a3a52'; ctx.fillRect(plotR, y - 8, padR, 16);
    ctx.fillStyle = '#dffaff'; ctx.fillText(gprice(y).toFixed(2), plotR + 5, y + 3);
    const lbl = '#' + (Math.round(gbar(x)) + 1), tw = ctx.measureText(lbl).width + 10;
    ctx.fillStyle = '#2a3a52'; ctx.fillRect(x - tw / 2, plotB, tw, 16);
    ctx.fillStyle = '#dffaff'; ctx.fillText(lbl, x - tw / 2 + 5, plotB + 12);
  }

  // ── canvas interaction (pan / zoom / draw / erase) ─────────────
  function bindCanvasInteraction() {
    const cv = el.canvas;
    const xy = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

    cv.addEventListener('mousedown', e => {
      if (!S._geo) return;
      const { x, y } = xy(e);
      const g = S._geo;
      // drag on price axis (right) → vertical scale candles
      if (x > g.plotR) { S._vdrag = { startY: y, min: g.min, max: g.max }; cv.style.cursor = 'ns-resize'; return; }
      // drag on time axis (bottom) → horizontal scale (zoom)
      if (y > g.plotB) { S._hdrag = { startX: x, view: S.view }; cv.style.cursor = 'ew-resize'; return; }
      // grab a TP/SL handle of the open position
      if (S.pos && S.tool === 'cursor') {
        const h = posHandleAt(x, y);
        if (h) { S._lvldrag = { which: h }; cv.style.cursor = 'ns-resize'; return; }
      }
      if (S.tool === 'cursor') { S._pan = { startX: x, startRight: g.rightIdx, startY: y, vEngaged: S.scaleMin != null, baseMin: g.min, baseMax: g.max }; cv.style.cursor = 'grabbing'; }
      else if (S.tool === 'eraser') { eraseAt(x, y); }
      else { const pt = { bar: gbar(x), price: gprice(y) }; S._draft = { type: S.tool, a: pt, b: { bar: pt.bar, price: pt.price }, color: S.drawColor }; }
    });

    window.addEventListener('mousemove', e => {
      if (!S._geo || !el.canvas || S.tab !== 'replay') return;
      const { x, y } = xy(e);
      // price-axis vertical scaling (drag up = stretch candles taller, down = compress)
      if (S._vdrag) {
        const center = (S._vdrag.min + S._vdrag.max) / 2;
        const half = (S._vdrag.max - S._vdrag.min) / 2 * Math.exp((y - S._vdrag.startY) / 180);
        S.scaleMin = center - half; S.scaleMax = center + half;
        drawReplay(); return;
      }
      // time-axis horizontal scaling (drag left = zoom in, right = zoom out)
      if (S._hdrag) {
        S.view = Math.max(16, Math.min(240, Math.round(S._hdrag.view * Math.exp((x - S._hdrag.startX) / 240))));
        drawReplay(); return;
      }
      // dragging a TP/SL handle of the open position
      if (S._lvldrag && S.pos) {
        const price = gprice(y), p = S.pos, tick = 0.1;
        if (S._lvldrag.which === 'tp') {
          p.tp = p.dir === 'long' ? Math.max(p.entry + tick, price) : Math.min(p.entry - tick, price);
        } else {
          p.sl = p.dir === 'long' ? Math.min(p.entry - tick, price) : Math.max(p.entry + tick, price);
          p.riskAmt = Math.abs(p.entry - p.sl) * p.size;   // stop stays exactly 1R
        }
        drawReplay(); return;
      }
      if (S._pan) {
        // horizontal pan — free in both directions, with blank space allowed on either side
        const bars = Math.round((x - S._pan.startX) / S._geo.step);
        const minR = Math.min(S.cursor, Math.max(2, Math.floor(S.view * 0.12)));
        const maxR = S.cursor + Math.floor(S.view * 0.6);   // push the latest bar left (blank on the right)
        const nr = Math.max(minR, Math.min(maxR, S._pan.startRight - bars));
        const curRight = S.follow ? S.cursor : S.rightEdge;
        if (nr !== curRight) { S.rightEdge = nr; S.follow = false; updateLiveBtn(); }
        // free vertical pan: any vertical intent locks the scale & moves price (TradingView-style)
        if (!S._pan.vEngaged && Math.abs(y - S._pan.startY) > 6) S._pan.vEngaged = true;
        if (S._pan.vEngaged) {
          const ppp = (S._pan.baseMax - S._pan.baseMin) / (S._geo.plotB - S._geo.plotT);
          const shift = (y - S._pan.startY) * ppp;
          S.scaleMin = S._pan.baseMin + shift; S.scaleMax = S._pan.baseMax + shift;
        }
        drawReplay(); return;
      }
      if (S._draft) { S._draft.b = { bar: gbar(x), price: gprice(y) }; drawReplay(); return; }
      const g = S._geo;
      // cursor feedback: price axis, time axis, or a TP/SL handle
      if (x > g.plotR && y <= g.plotB) el.canvas.style.cursor = 'ns-resize';
      else if (y > g.plotB) el.canvas.style.cursor = 'ew-resize';
      else if (S.pos && S.tool === 'cursor' && posHandleAt(x, y)) el.canvas.style.cursor = 'ns-resize';
      else resetCursor();
      if (x >= g.plotL && x <= g.plotR && y >= g.plotT && y <= g.plotB) {
        S.hover = { x, y };
        updateLegend(Math.max(0, Math.min(S.cursor, Math.round(gbar(x)))));
        drawReplay();
      } else if (S.hover) { S.hover = null; updateLegend(S.cursor); drawReplay(); }
    });

    window.addEventListener('mouseup', () => {
      if (S._lvldrag) { S._lvldrag = null; resetCursor(); refreshAll(); return; }
      if (S._vdrag) { S._vdrag = null; resetCursor(); return; }
      if (S._hdrag) { S._hdrag = null; resetCursor(); return; }
      if (S._pan) { S._pan = null; resetCursor(); return; }
      if (S._draft) {
        const d = S._draft; S._draft = null;
        if (d.type === 'hline') S.drawings.push(d);
        else { const dx = Math.abs(gx(d.b.bar) - gx(d.a.bar)), dy = Math.abs(gy(d.b.price) - gy(d.a.price)); if (dx + dy > 6) S.drawings.push(d); }
        drawReplay();
      }
    });

    cv.addEventListener('mouseleave', () => { if (!S._pan && !S._draft && S.hover) { S.hover = null; updateLegend(S.cursor); drawReplay(); } });
    // double-click an axis to reset it to auto
    cv.addEventListener('dblclick', e => {
      if (!S._geo) return;
      const { x, y } = xy(e), g = S._geo;
      if (x > g.plotR) { S.scaleMin = S.scaleMax = null; drawReplay(); }
      else if (y > g.plotB) { S.view = 72; drawReplay(); }
    });
    cv.addEventListener('wheel', e => {
      e.preventDefault();
      S.view = Math.max(16, Math.min(240, S.view + (e.deltaY > 0 ? 8 : -8)));
      drawReplay();
    }, { passive: false });

    cv.style.cursor = 'grab';
  }
  function resetCursor() {
    if (!el.canvas) return;
    el.canvas.style.cursor = S.tool === 'cursor' ? 'grab' : (S.tool === 'eraser' ? 'pointer' : 'crosshair');
  }
  function eraseAt(px, py) {
    let bestI = -1, bestD = 10;
    S.drawings.forEach((d, i) => { const dist = drawDist(d, px, py); if (dist < bestD) { bestD = dist; bestI = i; } });
    if (bestI >= 0) { S.drawings.splice(bestI, 1); drawReplay(); }
  }
  function drawDist(d, px, py) {
    if (d.type === 'hline') return Math.abs(gy(d.a.price) - py);
    const ax = gx(d.a.bar), ay = gy(d.a.price), bx = gx(d.b.bar), by = gy(d.b.price);
    if (d.type === 'rect') {
      const x1 = Math.min(ax, bx), x2 = Math.max(ax, bx), y1 = Math.min(ay, by), y2 = Math.max(ay, by);
      return Math.min(distSeg(px, py, x1, y1, x2, y1), distSeg(px, py, x2, y1, x2, y2),
        distSeg(px, py, x2, y2, x1, y2), distSeg(px, py, x1, y2, x1, y1));
    }
    return distSeg(px, py, ax, ay, bx, by);
  }
  function distSeg(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy || 1;
    let t = ((px - x1) * dx + (py - y1) * dy) / len2; t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  // ════════════════════════════════════════════════════════════════
  //  BACKTEST
  // ════════════════════════════════════════════════════════════════
  function runBT(randomize) {
    const seedInp = el.root.querySelector('[data-bt-seed]');
    if (randomize) seedInp.value = Math.floor(Math.random() * 99999) + 1;
    const seed = parseInt(seedInp.value) || 1;
    const bars = Math.max(80, Math.min(3000, parseInt(el.root.querySelector('[data-bt-bars]').value) || 400));
    const risk = (parseFloat(el.root.querySelector('[data-bt-risk]').value) || 1) / 100;
    const rr = parseFloat(el.root.querySelector('[data-bt-rr]').value) || 2;
    const lookback = Math.max(3, parseInt(el.root.querySelector('[data-bt-lb]').value) || 10);

    const series = genSeries(seed, bars);
    const { trades, finalBal } = runBacktest(series, { risk, rr, lookback });
    const meta = { seed, bars, risk: risk * 100, rr, lookback, finalBal, ts: Date.now() };
    saveBT({ trades, meta });

    if (!trades.length) {
      el.btResult.innerHTML = '<div class="sim-empty">ไม่เกิดสัญญาณเทรดเลย — ลองเพิ่ม Bars หรือเปลี่ยน Seed/Lookback</div>';
      return;
    }
    const st = computeStats(trades);
    const ret = (finalBal - START_BAL) / START_BAL * 100;
    el.btResult.innerHTML = `
      <div class="bt-summary sim-card">
        <div class="sim-card-hd">RESULT · seed #${seed} · ${bars} bars · RR ${rr} · risk ${(risk * 100)}%</div>
        <div class="bt-final">Final Balance <b style="color:${finalBal >= START_BAL ? SC.green : SC.red}">${f$(finalBal)}</b>
          <span class="bt-ret" style="color:${ret >= 0 ? SC.green : SC.red}">${ret >= 0 ? '+' : ''}${ret.toFixed(1)}%</span></div>
      </div>
      ${statsBlock(st)}`;
    drawEquity(el.btResult.querySelector('[data-equity]'), st.equity);
  }

  // ════════════════════════════════════════════════════════════════
  //  DASHBOARD
  // ════════════════════════════════════════════════════════════════
  function gatherTrades() {
    const hist = loadHist();
    const bt = loadBT();
    if (S.statsFilter === 'manual') return hist;
    if (S.statsFilter === 'backtest') return bt ? bt.trades : [];
    return hist.concat(bt ? bt.trades : []);
  }
  function renderDashboard() {
    const trades = gatherTrades();
    if (!trades.length) {
      el.statsBody.innerHTML = `<div class="sim-empty">📊 ยังไม่มีข้อมูลสถิติ<br>ไปเทรดใน REPLAY หรือรัน BACKTEST ก่อน</div>`;
      return;
    }
    const st = computeStats(trades);
    el.statsBody.innerHTML = statsBlock(st) + tradeTable(trades);
    drawEquity(el.statsBody.querySelector('[data-equity]'), st.equity);
  }
  function statsBlock(st) {
    const pf = st.pf === Infinity ? '∞' : st.pf.toFixed(2);
    const cards = [
      ['TRADES', st.n, SC.cyan],
      ['WIN RATE', st.winRate.toFixed(1) + '%', st.winRate >= 50 ? SC.green : SC.gold],
      ['NET', fR(st.netR), st.netR >= 0 ? SC.green : SC.red],
      ['PROFIT FACTOR', pf, st.pf >= 1 ? SC.green : SC.red],
      ['EXPECTANCY', fR(st.expectancyR) + '/t', st.expectancyR >= 0 ? SC.green : SC.red],
      ['MAX DRAWDOWN', '-' + st.maxDDR.toFixed(2) + 'R', SC.red],
      ['AVG WIN', '+' + st.avgWinR.toFixed(2) + 'R', SC.green],
      ['AVG LOSS', st.avgLossR.toFixed(2) + 'R', SC.red],
      ['BEST STREAK', st.bestWin + 'W', SC.green],
      ['WORST STREAK', st.worstLoss + 'L', SC.red],
    ];
    return `
      <div class="kpi-grid">
        ${cards.map(c => `<div class="kpi"><div class="kpi-label">${c[0]}</div><div class="kpi-val" style="color:${c[2]}">${c[1]}</div></div>`).join('')}
      </div>
      <div class="sim-card equity-card">
        <div class="sim-card-hd">EQUITY_CURVE <span class="eq-unit">(cumulative R)</span></div>
        <canvas class="equity-canvas" data-equity></canvas>
      </div>`;
  }
  function tradeTable(trades) {
    const rows = trades.slice().reverse().slice(0, 60).map((t, idx) => {
      const win = t.rMultiple >= 0;
      const src = t.source === 'manual' ? 'MAN' : 'BT';
      return `<tr class="${win ? 'win' : 'loss'}">
        <td>${trades.length - idx}</td>
        <td><span class="tt-src ${t.source}">${src}</span></td>
        <td>${t.dir === 'long' ? '▲ L' : '▼ S'}</td>
        <td>${fPx(t.entry)}</td>
        <td>${fPx(t.exit)}</td>
        <td>${t.reason || '—'}</td>
        <td style="color:${win ? SC.green : SC.red};font-weight:700">${fR(t.rMultiple)}</td>
      </tr>`;
    }).join('');
    return `
      <div class="sim-card trade-table-card">
        <div class="sim-card-hd">TRADE_LOG <span class="tt-count">(${trades.length} total · showing latest 60)</span></div>
        <div class="trade-table-wrap">
          <table class="trade-table">
            <thead><tr><th>#</th><th>SRC</th><th>DIR</th><th>ENTRY</th><th>EXIT</th><th>BY</th><th>R</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
  }
  function clearHistory() {
    if (!confirm('ล้างประวัติเทรดทั้งหมด (Manual + Backtest)? — ยอดเงินบัญชีจะรีเซ็ตเป็น $10,000')) return;
    localStorage.removeItem(LS.hist);
    localStorage.removeItem(LS.bt);
    S.balance = START_BAL; saveBal(START_BAL);
    renderDashboard();
    flashBar('ล้างประวัติแล้ว · บัญชีรีเซ็ต');
  }

  // ── equity curve renderer ──────────────────────────────────────
  function drawEquity(cv, eq) {
    if (!cv || !eq || eq.length < 2) {
      if (cv) cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
      return;
    }
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth || 600, h = cv.clientHeight || 180;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const padT = 10, padB = 16, padR = 44, padL = 8;
    const L = padL, R = w - padR, T = padT, B = h - padB;
    let min = Math.min(...eq, 0), max = Math.max(...eq, 0);
    if (max - min < 1) max = min + 1;
    const X = i => L + (R - L) * (i / (eq.length - 1));
    const Y = v => B - (v - min) / (max - min) * (B - T);
    // zero line
    const y0 = Y(0);
    ctx.strokeStyle = 'rgba(93,126,146,0.4)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, y0); ctx.lineTo(R, y0); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = SC.muted; ctx.font = "10px 'Share Tech Mono', monospace";
    ctx.fillText('0R', R + 5, y0 + 3);
    ctx.fillText(max.toFixed(1) + 'R', R + 5, Y(max) + 8);
    ctx.fillText(min.toFixed(1) + 'R', R + 5, Y(min));
    // area fill
    const last = eq[eq.length - 1];
    const lineCol = last >= 0 ? SC.green : SC.red;
    ctx.beginPath(); ctx.moveTo(X(0), Y(eq[0]));
    eq.forEach((v, i) => ctx.lineTo(X(i), Y(v)));
    ctx.lineTo(X(eq.length - 1), y0); ctx.lineTo(X(0), y0); ctx.closePath();
    const grad = ctx.createLinearGradient(0, T, 0, B);
    grad.addColorStop(0, last >= 0 ? 'rgba(0,255,159,0.25)' : 'rgba(255,56,96,0.25)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad; ctx.fill();
    // line
    ctx.beginPath(); ctx.moveTo(X(0), Y(eq[0]));
    eq.forEach((v, i) => ctx.lineTo(X(i), Y(v)));
    ctx.strokeStyle = lineCol; ctx.lineWidth = 1.8; ctx.shadowColor = lineCol; ctx.shadowBlur = 6;
    ctx.stroke(); ctx.shadowBlur = 0;
  }

  // ════════════════════════════════════════════════════════════════
  //  PUBLIC: toggle mode
  // ════════════════════════════════════════════════════════════════
  function toggleSim() {
    const on = document.body.classList.toggle('sim-mode');
    const btn = document.getElementById('simToggle');
    if (on) {
      if (!S.built) { build(); bindCanvasInteraction(); }
      if (btn) btn.innerHTML = '◀ LESSONS';
      if (S.tab === 'replay') drawReplay();
      if (S.tab === 'stats') renderDashboard();
      document.body.style.overflow = '';
    } else {
      stopPlay();
      if (btn) btn.innerHTML = '⚡ SIMULATOR';
    }
    window.scrollTo({ top: 0 });
  }

  if (typeof window !== 'undefined') {
    window.toggleSim = toggleSim;
    window.SMCSim = { build, runBacktest, genSeries, computeStats };
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { genSeries, runBacktest, computeStats };
  }
})();
