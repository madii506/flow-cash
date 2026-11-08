// FLOW: the first memecoins with cash flow. Everything on this page is read live: Raydium (coins), Jupiter (prices, trades), Solana (wallets, profiles, payout rounds).
(() => {
  const $ = (s, e = document) => e.querySelector(s), $$ = (s, e = document) => [...e.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, DPR = Math.min(2, devicePixelRatio || 1), JUP = 'https://lite-api.jup.ag', SOL = 'So11111111111111111111111111111111111111112';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const usd = (x, d) => x == null || !isFinite(x) ? '—' : '$' + (+x).toLocaleString('en-US', { minimumFractionDigits: d ?? (Math.abs(x) >= 1 ? 2 : 4), maximumFractionDigits: d ?? (Math.abs(x) >= 1 ? 2 : 6) });
  const big = x => x == null || !isFinite(x) ? '—' : x >= 1e6 ? '$' + (x / 1e6).toFixed(2) + 'M' : x >= 1e3 ? '$' + (x / 1e3).toFixed(1) + 'K' : usd(x, 0);
  const spct = x => x == null || !isFinite(x) ? '—' : (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(2) + '%', cls = x => x == null ? '' : x < 0 ? 'dn' : 'up';
  const num = (x, d = 4) => x == null || !isFinite(x) ? '—' : (+x).toLocaleString('en-US', { maximumFractionDigits: x >= 1000 ? 2 : d });
  const short = a => a ? a.slice(0, 4) + '…' + a.slice(-4) : '', clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ago = t => { const s = Date.now() / 1000 - t; return s < 60 ? 'just now' : s < 3600 ? Math.floor(s / 60) + 'm ago' : s < 86400 ? Math.floor(s / 3600) + 'h ago' : Math.floor(s / 86400) + 'd ago'; };
  const setT = (sel, v, c) => { const el = $(sel); if (!el) return; el.textContent = v; if (c !== undefined) el.className = c; };
  function toast(m) { const t = $('#toast'); t.innerHTML = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 4200); }
  async function api(a, q = '') { const r = await fetch('/api/flow?a=' + a + q); const j = await r.json().catch(() => ({ error: 'bad response' })); if (!r.ok || j.error) throw new Error(j.error || r.statusText); return j; }
  async function post(a, b) { const r = await fetch('/api/flow?a=' + a, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) }); const j = await r.json().catch(() => ({ error: 'bad response' })); if (!r.ok || j.error) throw new Error(j.error || r.statusText); return j; }
  const b64 = u => { let s = ''; u.forEach(c => s += String.fromCharCode(c)); return btoa(s); }, unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  let w3 = null; const web3 = () => w3 || (w3 = new Promise((ok, no) => { if (window.solanaWeb3) return ok(window.solanaWeb3); const s = document.createElement('script'); s.src = '/assets/web3.min.js'; s.onload = () => ok(window.solanaWeb3); s.onerror = () => no(new Error('could not load the signer')); document.head.append(s); }));
  const S = { b: null, coins: null, profiles: null, rounds: null, me: null, stocks: [] };
  const avatarHtml = (p, w) => p && p.avatar ? `<img src="${esc(p.avatar)}" alt="" onerror="this.remove()">` : esc(((p && p.name) || w || '?').replace(/[^A-Za-z0-9]/g, '').slice(0, 1).toUpperCase() || '?');
  const tsx = sig => `<a href="https://solscan.io/tx/${sig}" target="_blank" rel="noopener">${short(sig)} ↗</a>`;

  // ---------------------------------------------------------------- the river: cash flows left to right, faster when you scroll
  function river() { const c = $('#cv'), g = c.getContext('2d'); let W, H, sp = 1, last = scrollY; const LO = innerWidth < 700;
    const size = () => { W = innerWidth; H = innerHeight; c.width = W * DPR; c.height = H * DPR; g.setTransform(DPR, 0, 0, DPR, 0, 0); }; size(); addEventListener('resize', size);
    const L = Array.from({ length: LO ? 46 : 90 }, (_, i) => ({ k: i, y: Math.random(), a: 8 + Math.random() * 30, f: .6 + Math.random() * 1.4, ph: Math.random() * 6.28, al: .03 + Math.random() * .05 }));
    const P = Array.from({ length: LO ? 40 : 90 }, () => ({ l: Math.floor(Math.random() * (LO ? 46 : 90)), x: Math.random(), v: .0006 + Math.random() * .0016, r: .8 + Math.random() * 1.8 }));
    addEventListener('scroll', () => { sp = Math.min(6, 1 + Math.abs(scrollY - last) * .05); last = scrollY; }, { passive: true });
    const yAt = (l, u, t) => { const conv = Math.exp(-Math.pow((u - .5) / .23, 2)); return H * (.5 + (l.y - .5) * (1 - .82 * conv)) + l.a * Math.sin(u * 6.28 * l.f + l.ph + t * .35) * (1 - .7 * conv); };
    let skip = false; function frame(now) { requestAnimationFrame(frame); if (document.hidden || (skip = !skip)) return; const t = RM ? 3 : now / 1000; sp += (1 - sp) * .04;
      const bg = g.createRadialGradient(W / 2, H * .45, 10, W / 2, H * .5, Math.max(W, H) * .75); bg.addColorStop(0, '#0d2a22'); bg.addColorStop(.5, '#05120e'); bg.addColorStop(1, '#020504'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'lighter'; g.lineWidth = .8;
      for (const l of L) { g.beginPath(); for (let x = -10; x <= W + 10; x += LO ? 14 : 9) { const y = yAt(l, x / W, t); x < -9 ? g.moveTo(x, y) : g.lineTo(x, y); } g.strokeStyle = `rgba(121,243,189,${l.al})`; g.stroke(); }
      for (const p of P) { if (!RM) p.x += p.v * sp; if (p.x > 1.02) { p.x = -.02; p.l = Math.floor(Math.random() * L.length); } const x = p.x * W, y = yAt(L[p.l], p.x, t); g.beginPath(); g.arc(x, y, p.r, 0, 6.3); g.fillStyle = `rgba(160,250,210,${.25 + .55 * Math.sin(Math.PI * clamp(p.x))})`; g.fill(); }
      g.globalCompositeOperation = 'source-over'; }
    requestAnimationFrame(frame); }

  // ---------------------------------------------------------------- wallet: connect, live balance, profile
  const WL = { pk: null, p: null, name: '', view: null };
  const providers = () => [['Phantom', window.phantom && window.phantom.solana], ['Solflare', window.solflare && window.solflare.isSolflare && window.solflare], ['Backpack', window.backpack]].filter(([, p]) => p);
  async function connect() { if (WL.pk) return WL.pk; const ps = providers(); if (!ps.length) { toast('No Solana wallet found. Open this page in Phantom, Solflare or Backpack.'); throw new Error('no wallet'); }
    const [name, p] = ps[0]; const r = await p.connect(); onConnect(((r && r.publicKey) || p.publicKey).toString(), p, name); return WL.pk; }
  function onConnect(pk, p, name) { WL.pk = pk; WL.p = p; WL.name = name; $('#connect').hidden = true; $('#wbtn').hidden = false; $('#dAddr').textContent = short(pk); $('#dProfile').href = '#/u/' + pk;
    if (p.on && !p._flow) { p._flow = 1; p.on('accountChanged', k => { if (k) { onConnect(k.toString(), p, name); toast('Switched to ' + short(k.toString())); } else disconnect(); }); }
    refreshWallet(); loadMe(); render(); }
  async function disconnect() { try { await WL.p.disconnect(); } catch (e) { } WL.pk = null; WL.view = null; S.me = null; $('#connect').hidden = false; $('#wbtn').hidden = true; $('#drop').classList.remove('on'); render(); }
  function countTo(el, v, fmt) { if (!el || v == null) return; const from = el._v ?? v; el._v = v; if (RM || from === v) { el.textContent = fmt(v); return; } const t0 = performance.now(); cancelAnimationFrame(el._r); const st = n => { const k = clamp((n - t0) / 800); el.textContent = fmt(from + (v - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) el._r = requestAnimationFrame(st); }; el._r = requestAnimationFrame(st); }
  async function refreshWallet() { if (!WL.pk) return; try { const v = await api('wallet', '&addr=' + WL.pk); if (v.wallet !== WL.pk) return; const prev = WL.view; WL.view = v;
      countTo($('#wSol'), v.sol, x => x.toFixed(3) + ' SOL'); countTo($('#dTot'), v.totalUsd, x => usd(x, 2));
      $('#dToks').innerHTML = `<div class="tok">${'<span class="ph"></span>'}<span><b>SOL</b><small>Solana</small></span><span class="v">${num(v.sol)}<small>${usd(v.solValue, 2)}</small></span></div>` + v.tokens.slice(0, 30).map(t => `<div class="tok">${t.icon ? `<img src="${esc(t.icon)}" alt="" onerror="this.outerHTML='<span class=ph></span>'">` : '<span class="ph"></span>'}<span><b>${esc(t.symbol)}${t.stock ? '<span class="tag">stock</span>' : ''}</b><small>${esc(t.name)}</small></span><span class="v">${num(t.amount)}<small>${usd(t.usd, 2)}</small></span></div>`).join('');
      if (prev && Math.abs(prev.sol - v.sol) > 1e-9) toast(`Balance updated: ${v.sol >= prev.sol ? '+' : '−'}${Math.abs(v.sol - prev.sol).toFixed(4)} SOL`);
      $$('[data-live="bal"]').forEach(el => el.dispatchEvent(new Event('bal'))); } catch (e) { } }
  async function loadMe() { if (!WL.pk) return; try { const r = await api('profile', '&wallet=' + WL.pk); S.me = r.profile; } catch (e) { S.me = null; } $('#wAv').innerHTML = avatarHtml(S.me, WL.pk); }
  function walletInit() { $('#connect').onclick = () => connect().catch(() => { }); $('#wbtn').onclick = e => { e.stopPropagation(); $('#drop').classList.toggle('on'); }; $('#dOut').onclick = disconnect;
    document.addEventListener('click', e => { if (!e.target.closest('#acct')) $('#drop').classList.remove('on'); }); $('#dProfile').onclick = () => $('#drop').classList.remove('on');
    const ps = providers(); if (ps.length && ps[0][1].connect) ps[0][1].connect({ onlyIfTrusted: true }).then(r => { if (r && r.publicKey) onConnect(r.publicKey.toString(), ps[0][1], ps[0][0]); }).catch(() => { });
    setInterval(refreshWallet, 10000); }
  async function signSend(list, st, versioned) { const W = await web3(); const txs = list.map(t => versioned ? W.VersionedTransaction.deserialize(unb64(t)) : W.Transaction.from(unb64(t)));
    st('check your wallet…'); const signed = WL.p.signAllTransactions && txs.length > 1 ? await WL.p.signAllTransactions(txs) : [await WL.p.signTransaction(txs[0])];
    st('sending…'); const r = await post('send', { txs: signed.map(t => b64(t.serialize())) }); setTimeout(refreshWallet, 1500); setTimeout(refreshWallet, 6000); return r; }
  const stat = sel => (m, c = '') => { const el = $(sel); if (!el) return; el.className = 'stat2 ' + c; el.innerHTML = m; };

  // ---------------------------------------------------------------- data
  async function loadBasket() { try { S.b = await api('basket'); S.stocks = (S.b.stocks || []).filter(s => s.mint); } catch (e) { } }
  async function loadCoins() { try { S.coins = await api('coins'); } catch (e) { S.coins = { open: false, coins: [], error: true }; } }
  async function loadSocial() { try { const [p, r] = await Promise.all([api('profiles'), api('rounds')]); S.profiles = p.profiles; S.rounds = r.rounds; } catch (e) { S.profiles = S.profiles || []; S.rounds = S.rounds || []; } }
  const stockBy = sym => S.stocks.find(s => s.symbol === String(sym || '').toUpperCase());
  const profileOf = w => (S.profiles || []).find(p => p.wallet === w) || null;

  // ---------------------------------------------------------------- views
  const app = () => $('#app');
  function home() { const m = window.FLOWMARK; return `<div class="view">
  <section class="hero" id="hero"><div class="wrap">
    <div class="mark">${m}</div>
    <h1>The first memecoins<br>with <span class="g">cash flow.</span></h1>
    <p class="lede">Launch a coin on Raydium LaunchLab. 100% of its 1% launchpad fee goes to the people holding it, paid out in real stocks. Every payout is a public transaction.</p>
    <div class="cta"><a class="btn go" href="#/launch">Launch a coin →</a><a class="btn" href="#/trade">Trade</a><a class="btn" href="#/people">Make a profile</a></div>
    <div class="stats"><div class="stat"><small>coins on FLOW</small><b id="sCoins">—</b></div><div class="stat"><small>payout rounds sent</small><b id="sRounds">—</b></div><div class="stat"><small>profiles on-chain</small><b id="sPeople">—</b></div><div class="stat"><small>S&amp;P 500 · 24h</small><b id="sSpy">—</b></div></div>
  </div></section>
  <div class="tape" aria-label="live stock prices"><div class="tape-in" id="tape"><span>loading live prices…</span></div></div>
  <section class="sec" id="how"><div class="wrap pipe">
    <div class="pipe-l"><span class="eye"><i></i>how it flows</span><h2>Trades in.<br>Stocks out.</h2>
      <div class="psteps"><div class="ps on" data-i="0"><em>01</em><h3>Launch a coin</h3><p>Pick the stock its holders are paid in. One signature on Raydium LaunchLab.</p></div><div class="ps" data-i="1"><em>02</em><h3>Every trade pays 1%</h3><p>The launchpad fee on every buy and sell. The creator takes 0%, FLOW takes 0%.</p></div><div class="ps" data-i="2"><em>03</em><h3>Holders get paid</h3><p>Each round buys the coin's stock and sends it to every holder by balance.</p></div></div></div>
    <div class="pipe-r"><div class="card pp on" data-i="0"><canvas id="pp0"></canvas></div><div class="card pp" data-i="1"><div class="bigq"><b class="g">1%</b><span>of every buy and sell, 100% to holders</span></div></div><div class="card pp" data-i="2"><canvas id="pp2"></canvas></div></div>
  </div></section>
  <section class="sec" id="board"><div class="wrap">
    <div class="head c rv"><span class="eye"><i></i>yield board</span><h2>Every coin has a yield.</h2><p class="sub">24h volume × 1% × 365, over market cap: what a coin's holders are on pace to be paid in a year. Live from Raydium.</p></div>
    <div class="btool"><button class="chip on" data-s="yield">highest yield</button><button class="chip" data-s="new">newest</button><button class="chip" data-s="mcap">market cap</button></div>
    <div class="card board rv" id="boardList"><div class="empty">reading the launchpad…</div></div>
  </div></section>
  <section class="sec" id="trade"><div class="wrap">
    <div class="head rv"><span class="eye"><i></i>trade</span><h2>Buy coins. Buy stocks.</h2><p class="sub">Swap SOL for any FLOW coin or any real stock on Solana, routed by Jupiter, signed in your wallet. Your balance updates live.</p></div>
    ${tradeHtml('home')}
  </div></section>
  <section class="sec" id="launch"><div class="wrap">
    <div class="head c rv"><span class="eye"><i></i>launch</span><h2>Launch a coin with cash flow.</h2><p class="sub">Pick the stock, name the coin, sign once.</p></div>
    <div class="card lgrid rv">
      <div class="lc"><h3>1 · the stock holders are paid in</h3><div class="stocks" id="stocks"><div class="empty">reading prices…</div></div></div>
      <div class="lc"><h3>2 · the coin</h3>
        <label class="fld"><span>Name</span><input id="cName" maxlength="32" placeholder="Cash Cow" autocomplete="off"></label>
        <label class="fld"><span>Ticker</span><input id="cSym" maxlength="10" placeholder="MOO" autocomplete="off"></label>
        <div class="fld"><span>Image</span><div class="imgs" id="imgs"></div><input id="cImg" placeholder="or paste an https image link" autocomplete="off"></div>
        <label class="fld"><span>First buy, SOL (optional)</span><input id="cBuy" type="number" min="0" max="20" step="0.1" placeholder="0"></label>
        <div class="padst" id="padSt"><i></i>reading the launchpad…</div><div class="prev" id="prev"></div>
        <button class="btn go wide" id="launchBtn">Connect wallet</button><div class="stat2" id="lStat"></div>
        <ul class="facts"><li>1,000,000,000 supply, no mint or freeze authority</li><li>graduates to a Raydium pool at 85 SOL</li><li>1% of every trade to holders · creator 0% · FLOW 0%</li></ul></div>
    </div>
  </div></section>
  <section class="sec" id="rounds"><div class="wrap">
    <div class="head rv"><span class="eye"><i></i>payouts</span><h2>Every payout, on-chain.</h2><p class="sub">Each round buys a coin's stock and sends it to its holders. Every line is a Solana transaction you can open.</p></div>
    <div class="rounds" id="roundList"><div class="card empty">reading the chain…</div></div>
  </div></section>
  <section class="sec" id="people"><div class="wrap">
    <div class="head c rv"><span class="eye"><i></i>people</span><h2>Your profile lives on Solana.</h2><p class="sub">Connect, pick a name, sign once. It's written to the chain as a memo, so no one can edit it but your wallet.</p><div class="cta"><button class="btn go" id="mkProfile">Make my profile</button></div></div>
    <div class="people" id="peopleList"></div>
  </div></section>
  <section class="sec" id="faq"><div class="wrap">
    <div class="head c rv"><span class="eye"><i></i>faq</span><h2>Questions, answered.</h2></div>
    <div class="faq">
      <details><summary>What is FLOW?</summary><p>A launchpad on Raydium LaunchLab. Every coin pays its holders: 100% of the 1% launchpad fee on every trade goes to them, paid out in a real stock the creator picks at launch.</p></details>
      <details><summary>Who sends the payouts?</summary><p>The FLOW payout wallet, in rounds: it claims the launchpad fees, buys each coin's stock through Jupiter and sends it to holders by balance. Every round is listed above with its transaction.</p></details>
      <details><summary>How is the yield worked out?</summary><p>24h trading volume × 1% × 365, divided by market cap. It's a pace, not a promise: it moves every time volume moves.</p></details>
      <details><summary>Where does my profile live?</summary><p>On Solana, as a memo in a transaction your wallet signs. It costs a network fee, about 0.000005 SOL. The newest one you sign is your profile.</p></details>
      <details><summary>Is my balance really live?</summary><p>Yes. It's read from Solana every 10 seconds, and right after any trade or launch you sign here. Prices come from Jupiter.</p></details>
      <details><summary>What can go wrong?</summary><p>Coins can go to zero. Tokenized stocks are issued by third parties that can pause them. Payout rounds only send what trading has paid in fees. Not financial advice.</p></details>
    </div>
  </div></section></div>`; }

  function tradeHtml(id, mint) { return `<div class="card trade rv" data-trade="${id}" data-mint="${esc(mint || '')}" data-live="bal">
    <div class="tr-l"><div class="picker"><input class="tq" placeholder="paste a token address, or pick one below" autocomplete="off" value="${esc(mint || '')}"></div><div class="picks"></div><div class="tinfo"></div><div class="tstat"></div></div>
    <div class="tr-r"><div class="side"><button class="buy on" data-side="buy">Buy</button><button class="sell" data-side="sell">Sell</button></div>
      <div class="box"><small><span class="pay-l">You pay</span><a class="max">balance —</a></small><div class="r"><input class="amt" inputmode="decimal" placeholder="0.0"><span class="tsel tin">SOL</span></div><div class="pct"><button data-p=".25">25%</button><button data-p=".5">50%</button><button data-p="1">MAX</button></div></div>
      <div class="box"><small><span>You get</span><span class="outusd"></span></small><div class="r"><input class="out" readonly placeholder="0.0"><span class="tsel tout">—</span></div></div>
      <div class="qinfo"><div>price impact<b class="qi">—</b></div><div>route<b class="qr">—</b></div><div>slippage<b>1%</b></div></div>
      <button class="btn go wide tgo">Connect wallet</button><div class="stat2 tst"></div></div></div>`; }

  // ---------------------------------------------------------------- the trade widget
  const TI = {}; async function tokInfo(m) { if (TI[m]) return TI[m]; if (m === SOL) return TI[m] = { id: SOL, symbol: 'SOL', name: 'Solana', decimals: 9, icon: '' };
    const j = await fetch(`${JUP}/tokens/v2/search?query=${m}`).then(r => r.json()).catch(() => []); const t = (j || []).find(x => x.id === m); if (!t) throw new Error('Jupiter does not know this token'); return TI[m] = t; }
  function tradeInit(el) { if (!el || el._on) return; el._on = 1; const T = { side: 'buy', mint: el.dataset.mint || '', q: null, t: null, seq: 0 };
    const picks = $('.picks', el), q = $('.tq', el), amt = $('.amt', el), st = (m, c = '') => { const s = $('.tst', el); s.className = 'stat2 tst ' + c; s.innerHTML = m; };
    const list = () => [...((S.coins && S.coins.coins) || []).slice(0, 6).map(c => ({ mint: c.mint, sym: c.symbol, img: c.image })), ...S.stocks.slice(0, 10).map(s => ({ mint: s.mint, sym: s.symbol + 'x', img: '' }))];
    picks.innerHTML = list().map(p => `<button data-m="${p.mint}">${p.img ? `<img src="${esc(p.img)}" alt="">` : '<img alt="">'}${esc(p.sym)}</button>`).join('');
    picks.onclick = e => { const b = e.target.closest('button'); if (!b) return; q.value = b.dataset.m; pick(b.dataset.m); };
    q.addEventListener('input', () => { const v = q.value.trim(); if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(v)) pick(v); });
    $('.side', el).onclick = e => { const b = e.target.closest('button'); if (!b) return; T.side = b.dataset.side; $$('.side button', el).forEach(x => x.classList.toggle('on', x === b)); labels(); amt.value = ''; quote(); };
    $('.pct', el).onclick = e => { const b = e.target.closest('button'); if (!b) return; const bal = balOf(); if (bal == null) return; const f = +b.dataset.p; amt.value = String(+(T.side === 'buy' ? Math.max(0, bal * f - (f === 1 ? .01 : 0)) : bal * f).toFixed(T.side === 'buy' ? 4 : 6)); quote(); };
    let deb; amt.addEventListener('input', () => { clearTimeout(deb); deb = setTimeout(quote, 350); });
    el.addEventListener('bal', labels);
    $('.tgo', el).onclick = go;
    function balOf() { if (!WL.view) return null; if (T.side === 'buy') return WL.view.sol; const t = WL.view.tokens.find(x => x.mint === T.mint); return t ? t.amount : 0; }
    function labels() { const bal = balOf(); $('.max', el).textContent = 'balance ' + (bal == null ? '—' : num(bal)); const sym = T.t ? T.t.symbol : '—';
      $('.tin', el).innerHTML = T.side === 'buy' ? 'SOL' : (T.t && T.t.icon ? `<img src="${esc(T.t.icon)}" alt="">` : '') + esc(sym); $('.tout', el).innerHTML = T.side === 'buy' ? (T.t && T.t.icon ? `<img src="${esc(T.t.icon)}" alt="">` : '') + esc(sym) : 'SOL';
      $('.tgo', el).textContent = !WL.pk ? 'Connect wallet' : !T.t ? 'Pick a token' : (T.side === 'buy' ? 'Buy ' : 'Sell ') + sym; $$('.picks button', el).forEach(b => b.classList.toggle('on', b.dataset.m === T.mint)); }
    async function pick(m) { T.mint = m; T.t = null; labels(); $('.tinfo', el).innerHTML = '<small>reading the token…</small>'; try { const t = await tokInfo(m); if (T.mint !== m) return; T.t = t;
        const mc = t.mcap ?? t.fdv, ch = t.stats24h && t.stats24h.priceChange; $('.tinfo', el).innerHTML = `${t.icon ? `<img src="${esc(t.icon)}" alt="">` : '<img alt="">'}<b>${esc(t.name || t.symbol)} <span class="g">$${esc(t.symbol)}</span></b><small>${esc(m)}</small>`;
        $('.tstat', el).innerHTML = `<div><small>price</small><b>${usd(t.usdPrice)}</b></div><div><small>24h</small><b class="${cls(ch)}">${spct(ch)}</b></div><div><small>market cap</small><b>${big(mc)}</b></div>`; labels(); quote(); }
      catch (e) { $('.tinfo', el).innerHTML = `<small class="dn">${esc(e.message)}</small>`; $('.tstat', el).innerHTML = ''; } }
    async function quote() { const a = +amt.value; $('.out', el).value = ''; $('.qi', el).textContent = '—'; $('.qr', el).textContent = '—'; $('.outusd', el).textContent = ''; T.q = null; if (!T.t || !(a > 0)) return;
      const inM = T.side === 'buy' ? SOL : T.mint, outM = T.side === 'buy' ? T.mint : SOL, inD = T.side === 'buy' ? 9 : T.t.decimals, outD = T.side === 'buy' ? T.t.decimals : 9, my = ++T.seq;
      try { const r = await fetch(`${JUP}/swap/v1/quote?inputMint=${inM}&outputMint=${outM}&amount=${Math.floor(a * 10 ** inD)}&slippageBps=100`).then(x => x.json()); if (my !== T.seq) return; if (!r.outAmount) throw new Error(r.error || 'no route right now');
        T.q = r; const o = r.outAmount / 10 ** outD; $('.out', el).value = num(o, 6); $('.qi', el).textContent = (+r.priceImpactPct * 100).toFixed(2) + '%'; $('.qr', el).textContent = (r.routePlan || []).map(x => x.swapInfo.label).join(' → ');
        const px = T.side === 'buy' ? T.t.usdPrice : (WL.view && WL.view.solUsd); if (px) $('.outusd', el).textContent = '≈ ' + usd(o * px, 2); st(''); } catch (e) { if (my === T.seq) st(esc(e.message), 'err'); } }
    async function go() { try { if (!WL.pk) { await connect(); return; } if (!T.q) throw new Error('enter an amount first'); st('building the swap…');
        const s = await fetch(`${JUP}/swap/v1/swap`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ quoteResponse: T.q, userPublicKey: WL.pk, wrapAndUnwrapSol: true, dynamicComputeUnitLimit: true, prioritizationFeeLamports: { priorityLevelWithMaxLamports: { maxLamports: 400000, priorityLevel: 'high' } } }) }).then(r => r.json());
        if (!s.swapTransaction) throw new Error('Jupiter returned no swap'); const r = await signSend([s.swapTransaction], st, true); st(`done. ${tsx(r.sigs[0])}`, 'ok'); toast(`Swap confirmed · ${tsx(r.sigs[0])}`); amt.value = ''; quote(); }
      catch (e) { if (e.message !== 'no wallet') st(esc(e.message || String(e)), 'err'); } }
    labels(); if (T.mint) pick(T.mint); }

  // ---------------------------------------------------------------- the launcher
  const LN = { stock: 'SPY', img: '1', busy: false };
  function launchInit() { const box = $('#stocks'); if (!box || box._on || !S.stocks.length) return; box._on = 1;
    box.innerHTML = S.stocks.map(s => { const p = s.price || {}; return `<button class="sk" data-s="${s.symbol}"><b>${esc(s.symbol)}x</b><small>${esc(s.name)}</small><em class="${cls(p.ch24)}">${usd(p.usd)} · ${spct(p.ch24)}</em></button>`; }).join('');
    box.onclick = e => { const b = e.target.closest('.sk'); if (!b) return; LN.stock = b.dataset.s; renderLaunch(); };
    $('#imgs').innerHTML = [1, 2, 3, 4, 5, 6].map(i => `<button data-i="${i}" aria-label="image ${i}"><img src="/coins/${i}.png" alt=""></button>`).join('');
    $('#imgs').onclick = e => { const b = e.target.closest('button'); if (!b) return; LN.img = b.dataset.i; $('#cImg').value = ''; renderLaunch(); };
    ['#cName', '#cSym', '#cImg', '#cBuy'].forEach(id => $(id).addEventListener('input', () => { if (id === '#cSym') $(id).value = $(id).value.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (id === '#cImg') LN.img = $('#cImg').value.trim() || '1'; renderLaunch(); }));
    $('#launchBtn').onclick = doLaunch; renderLaunch(); }
  function renderLaunch() { if (!$('#launchBtn')) return; $$('.sk').forEach(b => b.classList.toggle('on', b.dataset.s === LN.stock)); const custom = /^https:\/\//.test(LN.img); $$('#imgs button').forEach(b => b.classList.toggle('on', !custom && b.dataset.i === LN.img));
    const st = stockBy(LN.stock) || { name: LN.stock }, name = $('#cName').value.trim() || 'Your coin', sym = $('#cSym').value.trim() || 'TICKER', src = custom ? LN.img : `/coins/${/^[1-6]$/.test(LN.img) ? LN.img : 1}.png`;
    $('#prev').innerHTML = `<img src="${esc(src)}" alt="" onerror="this.src='/coins/1.png'"><b>${esc(name)} <span class="g">$${esc(sym)}</span></b><small>holders paid in ${esc(st.name)} (${esc(LN.stock)}x)</small>`;
    const open = S.b && S.b.pad, ps = $('#padSt'); ps.className = 'padst' + (open ? ' open' : ''); ps.innerHTML = `<i></i>${open ? 'launchpad open · ' + short(S.b.pad) : 'launchpad opening soon'}`;
    if (LN.busy) return; const b = $('#launchBtn'); if (!WL.pk) { b.textContent = 'Connect wallet'; b.disabled = false; return; } b.textContent = open ? 'Launch on Raydium →' : 'Launchpad opening soon'; b.disabled = !open; }
  async function doLaunch() { const st = stat('#lStat'); if (LN.busy) return; try { if (!WL.pk) { await connect(); return; } if (!(S.b && S.b.pad)) { st('The FLOW launchpad isn’t open yet. This button lights up the moment it is.'); return; }
      const name = $('#cName').value.trim(), symbol = $('#cSym').value.trim(); if (name.length < 2) throw new Error('Give your coin a name.'); if (symbol.length < 2) throw new Error('Give your coin a ticker.');
      LN.busy = true; $('#launchBtn').disabled = true; st('building your launch on Raydium LaunchLab…');
      const r = await post('buildLaunch', { wallet: WL.pk, pad: S.b.pad, name, symbol, image: LN.img, payout: LN.stock, buySol: +$('#cBuy').value || 0 }); const s = await signSend(r.txs, st, false);
      st(`$${esc(symbol)} is live.\nmint <b>${esc(r.mint)}</b>\n<a href="#/c/${r.mint}">open its page</a> · ${tsx(s.sigs[0])}`, 'ok'); setTimeout(async () => { await loadCoins(); renderBoard(); }, 5000); }
    catch (e) { if (e.message !== 'no wallet') st(esc(e.message || String(e)), 'err'); } finally { LN.busy = false; renderLaunch(); } }

  // ---------------------------------------------------------------- board, rounds, people, tape, stats
  let SORT = 'yield';
  function boardRows(list) { return `<div class="brow h"><span></span><span>coin</span><span>paid in</span><span class="hide-s">market cap</span><span class="hide-m hide-s">24h volume</span><span class="hide-m hide-s">to curve</span><span>yield</span></div>` + list.map(c => { const st = stockBy(c.payout);
      return `<a class="brow" href="#/c/${c.mint}"><img src="${esc(c.image || '/coins/1.png')}" alt="" onerror="this.src='/coins/1.png'"><span><b>${esc(c.name)}</b><small>$${esc(c.symbol)}</small></span><span class="n">${st ? esc(st.symbol) + 'x' : '—'}</span><span class="n hide-s">${big(c.mcapUsd)}</span><span class="n hide-m hide-s">${big(c.volumeUsd)}</span><span class="n hide-m hide-s">${c.progress != null ? Math.round(clamp(c.progress > 1 ? c.progress / 100 : c.progress) * 100) + '%' : '—'}</span><span class="yield g">${c.yieldPct != null ? c.yieldPct.toFixed(0) + '%' : '—'}</span></a>`; }).join(''); }
  function renderBoard() { const el = $('#boardList'); if (!el || !S.coins) return; const c = S.coins;
    if (!c.open) { el.innerHTML = '<div class="empty">The FLOW launchpad opens soon. The first coin with cash flow shows up here, with its live yield.</div>'; return; }
    if (!c.coins.length) { el.innerHTML = '<div class="empty">No coins yet. Launch the first one below.</div>'; return; }
    const list = [...c.coins].sort((a, b) => SORT === 'yield' ? (b.yieldPct || 0) - (a.yieldPct || 0) : SORT === 'mcap' ? (b.mcapUsd || 0) - (a.mcapUsd || 0) : (b.created || 0) > (a.created || 0) ? 1 : -1); el.innerHTML = boardRows(list); }
  function renderRounds() { const el = $('#roundList'); if (!el || !S.rounds) return; if (!S.rounds.length) { el.innerHTML = '<div class="card empty">No payout rounds yet. The first one appears here the moment it lands on-chain.</div>'; return; }
    el.innerHTML = S.rounds.slice(0, 30).map(r => { const coin = ((S.coins && S.coins.coins) || []).find(c => c.mint === r.coin), st = S.stocks.find(s => s.mint === r.stock); return `<div class="card round"><small>${ago(r.time)}</small><span><b>${coin ? '$' + esc(coin.symbol) : short(r.coin)}</b> holders paid in <b>${st ? esc(st.symbol) + 'x' : short(r.stock)}</b></span><small>${r.holders} wallets</small>${tsx(r.sig)}</div>`; }).join(''); }
  function personCard(p) { return `<a class="card pc" href="#/u/${p.wallet}"><span class="av">${avatarHtml(p, p.wallet)}</span><b>${esc(p.name)}</b><small>${p.x ? '@' + esc(p.x) + ' · ' : ''}${short(p.wallet)}</small>${p.bio ? `<p>${esc(p.bio)}</p>` : ''}</a>`; }
  function renderPeople() { const el = $('#peopleList'); if (!el || !S.profiles) return; el.innerHTML = S.profiles.length ? S.profiles.slice(0, 24).map(personCard).join('') : '<div class="card empty" style="grid-column:1/-1">No profiles yet. Be the first: it takes one signature.</div>'; }
  function renderTape() { const el = $('#tape'); if (!el || !S.b) return; const items = [S.b.benchmark && { s: 'S&P 500', p: S.b.benchmark.price }, ...S.stocks.map(s => ({ s: s.symbol + 'x', p: s.price }))].filter(x => x && x.p);
    const one = items.map(x => `<span><b>${esc(x.s)}</b>${usd(x.p.usd)}<em class="${cls(x.p.ch24)}">${spct(x.p.ch24)}</em></span>`).join(''); el.innerHTML = one + one; }
  function renderStats() { if (S.coins) setT('#sCoins', S.coins.open ? String(S.coins.coins.length) : '0'); if (S.rounds) setT('#sRounds', String(S.rounds.length)); if (S.profiles) setT('#sPeople', String(S.profiles.length)); const spy = S.b && S.b.benchmark && S.b.benchmark.price; if (spy) setT('#sSpy', spct(spy.ch24), cls(spy.ch24)); }

  // ---------------------------------------------------------------- the "how it flows" panels
  function pipeInit() { const panels = $$('.pp'), steps = $$('.ps'); if (!panels.length) return; const on = i => { panels.forEach(p => p.classList.toggle('on', +p.dataset.i === i)); steps.forEach(s => s.classList.toggle('on', +s.dataset.i === i)); };
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) on(+e.target.dataset.i); }), { rootMargin: '-45% 0px -45% 0px' }); panels.forEach(p => io.observe(p));
    steps.forEach(s => s.onclick = () => panels[+s.dataset.i].scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' }));
    const flowCv = (id, draw) => { const c = $('#' + id); if (!c) return; const g = c.getContext('2d'); let vis = false; new IntersectionObserver(e => vis = e[0].isIntersecting).observe(c); const D = Array.from({ length: 34 }, () => ({ t: Math.random(), v: .004 + Math.random() * .006, k: Math.random() }));
      const fr = now => { if (!c.isConnected) return; requestAnimationFrame(fr); if (!vis || document.hidden) return; const w = c.clientWidth, h = c.clientHeight; if (c.width !== w * DPR) { c.width = w * DPR; c.height = h * DPR; } g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, w, h); draw(g, w, h, D, now / 1000); }; requestAnimationFrame(fr); };
    flowCv('pp0', (g, w, h, D, t) => { const cx = w / 2, cy = h / 2; g.strokeStyle = 'rgba(121,243,189,.12)'; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(10, 30 + i * (h - 60) / 8); g.bezierCurveTo(w * .3, 30 + i * (h - 60) / 8, w * .35, cy, cx - 50, cy); g.stroke(); }
      D.forEach(d => { if (!RM) d.t += d.v; if (d.t > 1) { d.t = 0; d.k = Math.random(); } const y0 = 30 + d.k * (h - 60), u = d.t, x = 10 + (cx - 60) * u, y = y0 + (cy - y0) * (u * u * (3 - 2 * u)); g.beginPath(); g.arc(x, y, 3, 0, 6.3); g.fillStyle = `rgba(160,250,210,${.3 + .6 * u})`; g.fill(); });
      g.beginPath(); g.arc(cx, cy, 46, 0, 6.3); g.lineWidth = 5; g.strokeStyle = '#79f3bd'; g.shadowColor = 'rgba(121,243,189,.7)'; g.shadowBlur = 24; g.stroke(); g.shadowBlur = 0; g.lineWidth = 1; g.fillStyle = '#eafff6'; g.font = '700 18px ID, sans-serif'; g.textAlign = 'center'; g.fillText('$COIN', cx, cy + 6); g.fillStyle = '#7f9a90'; g.font = '500 12px IN, sans-serif'; g.fillText('buys and sells', w * .2, h - 12); });
    flowCv('pp2', (g, w, h, D, t) => { const cx = w * .28, cy = h / 2, H = Array.from({ length: 7 }, (_, i) => ({ x: w * .82, y: 34 + i * (h - 68) / 6 })); g.strokeStyle = 'rgba(121,243,189,.14)'; H.forEach(p => { g.beginPath(); g.moveTo(cx + 40, cy); g.bezierCurveTo(w * .55, cy, w * .6, p.y, p.x - 22, p.y); g.stroke(); });
      D.forEach((d, i) => { if (!RM) d.t += d.v * .9; if (d.t > 1) d.t = 0; const p = H[i % 7], u = d.t, x = cx + 40 + (p.x - 22 - cx - 40) * u, y = cy + (p.y - cy) * (u * u * (3 - 2 * u)); g.beginPath(); g.arc(x, y, 3, 0, 6.3); g.fillStyle = `rgba(160,250,210,${.9 - .5 * u})`; g.fill(); });
      g.fillStyle = 'rgba(121,243,189,.1)'; g.strokeStyle = '#79f3bd'; g.lineWidth = 2; g.beginPath(); g.roundRect(cx - 52, cy - 36, 104, 72, 18); g.fill(); g.stroke(); g.lineWidth = 1; g.fillStyle = '#eafff6'; g.font = '700 16px ID, sans-serif'; g.textAlign = 'center'; g.fillText('SPYx', cx, cy + 6);
      H.forEach((p, i) => { const pulse = .5 + .5 * Math.sin(t * 2 + i); g.beginPath(); g.arc(p.x, p.y, 16, 0, 6.3); g.fillStyle = `rgba(121,243,189,${.12 + .18 * pulse})`; g.fill(); g.fillStyle = '#eafff6'; g.font = '600 11px JB, monospace'; g.fillText('holder', p.x + 0, p.y + 32 > h ? p.y - 22 : p.y + 30); }); }); }

  // ---------------------------------------------------------------- profile + coin + console pages
  async function profilePage(w) { app().innerHTML = `<div class="view page"><div class="wrap"><div class="card empty">reading the profile…</div></div></div>`; let p = null; try { p = (await api('profile', '&wallet=' + w)).profile; } catch (e) { app().innerHTML = `<div class="view page"><div class="wrap"><div class="card empty">${esc(e.message)}</div></div></div>`; return; }
    const mine = WL.pk === w; app().innerHTML = `<div class="view page"><div class="wrap">
      <div class="card phead rv"><span class="ph-av">${avatarHtml(p, w)}</span><div><h1>${esc(p ? p.name : short(w))}</h1>${p && p.bio ? `<p>${esc(p.bio)}</p>` : `<p>${mine ? 'No profile yet. Make one: it takes one signature.' : 'This wallet has no profile yet.'}</p>`}
        <div class="meta"><span class="mono">${esc(w)}</span>${p && p.x ? `<a href="https://x.com/${esc(p.x)}" target="_blank" rel="noopener">@${esc(p.x)} ↗</a>` : ''}<a href="https://solscan.io/account/${w}" target="_blank" rel="noopener">solscan ↗</a>${p ? `<span>updated ${ago(p.time)}</span>` : ''}</div></div>
        ${mine ? `<button class="btn go" id="edit">${p ? 'Edit profile' : 'Make my profile'}</button>` : ''}</div>
      <div class="pgrid"><div class="card pbox rv"><h3>wallet · live</h3><div class="bigbal"><b id="pTot">—</b><small id="pSol">—</small></div><div class="toks" id="pToks" style="max-height:none"></div></div>
        <div class="card pbox rv"><h3>stocks earned and held</h3><div class="toks" id="pStocks" style="max-height:none"><div class="empty">reading…</div></div></div></div></div></div>`;
    if (mine) $('#edit').onclick = () => editProfile(p); reveals();
    const fill = v => { setT('#pTot', usd(v.totalUsd, 2)); setT('#pSol', `${num(v.sol)} SOL · ${usd(v.solValue, 2)}`); const row = t => `<div class="tok">${t.icon ? `<img src="${esc(t.icon)}" alt="">` : '<span class="ph"></span>'}<span><b>${esc(t.symbol)}${t.stock ? '<span class="tag">stock</span>' : ''}</b><small>${esc(t.name)}</small></span><span class="v">${num(t.amount)}<small>${usd(t.usd, 2)}</small></span></div>`;
      $('#pToks').innerHTML = v.tokens.slice(0, 20).map(row).join('') || '<div class="empty">no tokens</div>'; const sk = v.tokens.filter(t => t.stock); $('#pStocks').innerHTML = sk.map(row).join('') || '<div class="empty">No stock tokens yet. Hold a FLOW coin and payouts land here.</div>'; };
    const load = async () => { try { const v = mine && WL.view ? WL.view : await api('wallet', '&addr=' + w); if (location.hash === '#/u/' + w) fill(v); } catch (e) { } }; load(); clearInterval(profilePage.t); profilePage.t = setInterval(() => { if (location.hash === '#/u/' + w) load(); else clearInterval(profilePage.t); }, 10000); }
  function editProfile(p) { const m = $('#modal'); $('#mCard').innerHTML = `<h3>Your profile, on Solana</h3><label class="fld"><span>Name</span><input id="eName" maxlength="24" value="${esc(p ? p.name : '')}" placeholder="satoshi"></label><label class="fld"><span>Bio</span><textarea id="eBio" maxlength="140" rows="3" placeholder="what you hold, what you build">${esc(p ? p.bio : '')}</textarea></label><label class="fld"><span>Avatar (https image link)</span><input id="eAv" value="${esc(p ? p.avatar : '')}" placeholder="https://…"></label><label class="fld"><span>X handle</span><input id="eX" maxlength="16" value="${esc(p ? p.x : '')}" placeholder="@handle"></label><button class="btn go wide" id="eSave">Save on-chain</button><div class="stat2" id="eStat"></div>`;
    m.classList.add('on'); m.onclick = e => { if (e.target === m) m.classList.remove('on'); };
    $('#eSave').onclick = async () => { const st = stat('#eStat'); try { await connect(); st('building the memo…'); const r = await post('buildProfile', { wallet: WL.pk, name: $('#eName').value, bio: $('#eBio').value, avatar: $('#eAv').value.trim(), x: $('#eX').value });
        const s = await signSend(r.txs, st, false); st(`saved on-chain. ${tsx(s.sigs[0])}`, 'ok'); toast('Profile saved on Solana.'); setTimeout(async () => { m.classList.remove('on'); await loadMe(); await loadSocial(); if (location.hash.startsWith('#/u/')) profilePage(WL.pk); }, 2200); } catch (e) { if (e.message !== 'no wallet') st(esc(e.message), 'err'); } }; }
  async function coinPage(mint) { const c = ((S.coins && S.coins.coins) || []).find(x => x.mint === mint), st = c && stockBy(c.payout);
    app().innerHTML = `<div class="view page"><div class="wrap"><div class="card phead rv"><span class="ph-av">${c && c.image ? `<img src="${esc(c.image)}" alt="">` : '$'}</span><div><h1>${c ? esc(c.name) + ' <span class="g">$' + esc(c.symbol) + '</span>' : 'Trade ' + short(mint)}</h1><p>${c ? `Holders are paid in ${st ? esc(st.name) + ' (' + esc(st.symbol) + 'x)' : 'its stock'}. Yield on pace: <b class="g">${c.yieldPct != null ? c.yieldPct.toFixed(0) + '%' : '—'}</b>` : 'This token is not on the FLOW launchpad, but you can still trade it here.'}</p>
      <div class="meta"><span class="mono">${esc(mint)}</span><a href="https://raydium.io/launchpad/token/?mint=${mint}" target="_blank" rel="noopener">raydium ↗</a><a href="https://solscan.io/token/${mint}" target="_blank" rel="noopener">solscan ↗</a><span id="hCount"></span></div></div></div>
      <div style="margin-top:14px">${tradeHtml('coin', mint)}</div></div></div>`; tradeInit($('[data-trade="coin"]')); reveals();
    try { const h = await api('holders', '&mint=' + mint); setT('#hCount', `${h.count}${h.full ? '' : '+'} holders`); } catch (e) { } }
  function consolePage() { app().innerHTML = `<div class="view page"><div class="wrap"><div class="head"><span class="eye"><i></i>console</span><h2>Run the payouts.</h2><p class="sub">For the wallet that runs FLOW. Every step is a transaction you sign. The wallet that creates the launchpad receives the 1% fees.</p></div>
    <div class="con">
      <div class="card cstep"><h3><span>01</span>Create the FLOW launchpad</h3><p>One transaction on Raydium LaunchLab: a 1% fee to this wallet, 0% creator fee, half the LP burned at graduation and half kept as a fee key.</p><div class="crow"><button class="btn go sm" id="kPad">Create the launchpad</button><span class="mono" id="kPadInfo"></span></div><div class="stat2" id="kPadSt"></div></div>
      <div class="card cstep"><h3><span>02</span>Claim the fees</h3><p>Moves what every coin has paid from LaunchLab's vault to this wallet.</p><div class="crow"><button class="btn sm" id="kClaim">Claim</button><span class="mono" id="kVault"></span></div><div class="stat2" id="kClaimSt"></div></div>
      <div class="card cstep"><h3><span>03</span>Run a payout round</h3><p>Pick a coin, spend SOL on its stock through Jupiter, then send the stock to every holder by balance. Holders owed less than the minimum roll over to the next round.</p>
        <div class="crow"><select id="kCoin"><option value="">loading coins…</option></select><input id="kSol" type="number" min="0" step="0.05" value="0.1" style="width:110px"> SOL <button class="btn sm" id="kBuy">1 · buy the stock</button><input id="kMin" type="number" min="0" step="0.05" value="0.25" style="width:90px"> $ min <button class="btn go sm" id="kPay">2 · pay holders</button></div><div class="stat2" id="kSt"></div></div>
    </div></div></div>`;
    const ref = async () => { if (!WL.pk) { setT('#kPadInfo', 'connect the wallet that runs FLOW'); return; } try { const p = await api('pad', '&admin=' + WL.pk); setT('#kPadInfo', p.exists ? `launchpad ${short(p.id)} · ${p.feePct}% fee` : 'no launchpad on this wallet yet'); setT('#kVault', p.exists ? `${(+p.unclaimedSol).toFixed(4)} SOL waiting` : ''); } catch (e) { setT('#kPadInfo', e.message); } }; ref();
    const coins = (S.coins && S.coins.coins) || []; $('#kCoin').innerHTML = coins.length ? coins.map(c => `<option value="${c.mint}">$${esc(c.symbol)} · paid in ${esc(c.payout || '?')}x</option>`).join('') : '<option value="">no coins on the launchpad yet</option>';
    $('#kPad').onclick = async () => { const st = stat('#kPadSt'); try { await connect(); st('building…'); const r = await post('buildPad', { wallet: WL.pk, feePct: 1, burnPct: 50, web: location.origin, img: location.origin + '/coin.png' }); const s = await signSend(r.txs, st, false); st(`the FLOW launchpad is live: <b>${esc(r.pad)}</b> ${tsx(s.sigs[0])}\nsend this address over so the site can open the launcher.`, 'ok'); ref(); } catch (e) { st(esc(e.message), 'err'); } };
    $('#kClaim').onclick = async () => { const st = stat('#kClaimSt'); try { await connect(); st('building the claim…'); const r = await post('claim', { wallet: WL.pk }); const s = await signSend(r.txs, st, false); st(`claimed. ${tsx(s.sigs[0])}`, 'ok'); ref(); } catch (e) { st(esc(e.message), 'err'); } };
    const K = { got: 0n, dec: 0, price: 0 };
    $('#kBuy').onclick = async () => { const st = stat('#kSt'); try { await connect(); const c = coins.find(x => x.mint === $('#kCoin').value), sk = c && stockBy(c.payout); if (!sk) throw new Error('pick a coin with a payout stock'); const sol = +$('#kSol').value; if (!(sol > 0)) throw new Error('enter SOL to spend');
        const before = await api('bal', `&wallet=${WL.pk}&mint=${sk.mint}`), b0 = (before.accounts || []).reduce((a, x) => a + BigInt(x.raw), 0n); st('getting a Jupiter route…');
        const q = await fetch(`${JUP}/swap/v1/quote?inputMint=${SOL}&outputMint=${sk.mint}&amount=${Math.floor(sol * 1e9)}&slippageBps=150`).then(r => r.json()); if (!q.outAmount) throw new Error('no route for ' + sk.symbol + 'x right now');
        const s = await fetch(`${JUP}/swap/v1/swap`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ quoteResponse: q, userPublicKey: WL.pk, wrapAndUnwrapSol: true, dynamicComputeUnitLimit: true }) }).then(r => r.json()); const r = await signSend([s.swapTransaction], st, true);
        await new Promise(r => setTimeout(r, 2500)); const after = await api('bal', `&wallet=${WL.pk}&mint=${sk.mint}`); K.got = (after.accounts || []).reduce((a, x) => a + BigInt(x.raw), 0n) - b0; K.dec = (after.accounts[0] || {}).decimals || 8; K.price = (sk.price && sk.price.usd) || 0;
        st(`bought ${(Number(K.got) / 10 ** K.dec).toFixed(6)} ${sk.symbol}x. ${tsx(r.sigs[0])}\nnow pay the holders.`, 'ok'); } catch (e) { st(esc(e.message), 'err'); } };
    $('#kPay').onclick = async () => { const st = stat('#kSt'); try { await connect(); const c = coins.find(x => x.mint === $('#kCoin').value), sk = c && stockBy(c.payout); if (!sk) throw new Error('pick a coin'); if (K.got <= 0n) throw new Error('buy the stock first (step 1)');
        const minRaw = K.price ? BigInt(Math.floor((+$('#kMin').value || 0) / K.price * 10 ** K.dec)) : 0n; let offset = 0, n = 0, sigs = [];
        do { st(`building payouts from holder ${offset + 1}…`); const r = await post('buildPayout', { wallet: WL.pk, coin: c.mint, stock: sk.mint, amountRaw: K.got.toString(), minRaw: minRaw.toString(), offset }); if (!r.txs.length) break; const s = await signSend(r.txs, st, false); sigs.push(...s.sigs); n += r.txs.length; offset = r.next; } while (offset != null);
        st(`round sent to holders in ${n} transaction${n === 1 ? '' : 's'}. ${sigs.slice(0, 3).map(tsx).join(' · ')}`, 'ok'); K.got = 0n; await loadSocial(); } catch (e) { st(esc(e.message), 'err'); } }; }

  // ---------------------------------------------------------------- router + glue
  function reveals() { if (RM) { $$('.rv').forEach(e => e.classList.add('in')); return; } const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' }); $$('.rv:not(.in)').forEach(e => io.observe(e)); }
  function tilt() { if (matchMedia('(pointer: coarse)').matches || RM) return; document.addEventListener('pointermove', e => { const el = e.target.closest('.pc, .sk, .stat'); $$('.tilted').forEach(x => { if (x !== el) { x.style.transform = ''; x.classList.remove('tilted'); } }); if (!el) return; const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.classList.add('tilted'); el.style.transform = `perspective(700px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-3px)`; }); }
  const SECTIONS = ['how', 'board', 'trade', 'launch', 'rounds', 'people', 'faq'];
  let homeOn = false;
  function render() { const h = location.hash || '#/', [, view, arg] = h.split('/');
    $$('#links a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === h));
    if (view === 'u' && arg) { homeOn = false; return profilePage(arg); } if (view === 'c' && arg) { homeOn = false; return coinPage(arg); } if (view === 'console') { homeOn = false; return consolePage(); }
    if (!homeOn) { homeOn = true; app().innerHTML = home(); pipeInit(); reveals(); $$('.btool .chip').forEach(b => b.onclick = () => { SORT = b.dataset.s; $$('.btool .chip').forEach(x => x.classList.toggle('on', x === b)); renderBoard(); }); $('#mkProfile').onclick = async () => { try { await connect(); editProfile(S.me); } catch (e) { } }; fillHome(); }
    else { $$('[data-trade]').forEach(el => el.dispatchEvent(new Event('bal'))); renderLaunch(); }
    if (SECTIONS.includes(view)) { const el = $('#' + view); if (el) setTimeout(() => el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }), 30); } else if (view === '' || view == null) scrollTo({ top: 0, behavior: 'smooth' }); }
  function fillHome() { renderTape(); renderStats(); renderBoard(); renderRounds(); renderPeople(); launchInit(); renderLaunch(); tradeInit($('[data-trade="home"]')); }
  function navInit() { const top = $('#top'); addEventListener('scroll', () => top.classList.toggle('sc', scrollY > 20), { passive: true }); addEventListener('hashchange', render); }
  river(); walletInit(); navInit(); tilt(); render();
  Promise.all([loadBasket(), loadCoins(), loadSocial()]).then(() => { if (homeOn) fillHome(); else render(); });
  setInterval(async () => { await loadBasket(); if (homeOn) { renderTape(); renderStats(); } }, 45000); setInterval(async () => { await Promise.all([loadCoins(), loadSocial()]); if (homeOn) { renderBoard(); renderRounds(); renderPeople(); renderStats(); } }, 60000);
})();
