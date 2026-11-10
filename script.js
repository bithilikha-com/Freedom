(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const bn = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
  const num = n => bn(n.toLocaleString('en-US'));
  const fmt = n => '৳ ' + num(n);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const set = (sel, html) => { const e = $(sel); if (e) e.innerHTML = html; };
  const empty = m => `<p class="notice">${m}</p>`;
  const av = i => `<span class="avatar ${['', 'alt', 'gold'][i % 3]}"></span>`;
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } }
  };
  let timer;
  const toast = m => {
    const t = $('#toast');
    t.textContent = m;
    t.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => t.classList.remove('show'), 2400);
  };

  /* ---------- data ---------- */
  const followed = new Set();
  let years = 0, isLive = false;
  const posts = [
    { n: 'সাদিয়া', t: '১২ মিনিট আগে', b: 'ঢাকায় বিকেলের কফি, নতুন জায়গা খুঁজছি...', l: 348, c: 24, s: 8, g: 0 },
    { n: 'ইশতিয়াক', t: '১ দিন আগে', b: 'প্রিয় খাবার বেছে নিতে গিয়ে শিখলাম...', l: 560, c: 18, s: 12, g: 1 }
  ];
  const feedPosts = [{ n: 'ফারহানা', t: '১ ঘণ্টা আগে', b: 'আজকের দিনটি সুন্দর কাটুক! 🌿', l: 120, c: 9, s: 3, g: 1 }];
  const people = [
    { n: 'নাহিদ রহমান', u: 'nahid', t: 'মানুষ' }, { n: 'সাবিহা আক্তার', u: 'sabiha', t: 'মানুষ' },
    { n: 'বাংলা ফুড কর্নার', u: 'foodcorner', t: 'পেজ' }, { n: 'মৌসুমী', u: 'mausumi', t: 'মানুষ' }
  ];
  const friends = ['ফারহানা', 'ইমরান', 'রিতা'];
  const products = [
    { p: 18000, n: 'ওয়েবক্যাম', c: 'ইলেকট্রনিক্স', a: 'ঢাকা' }, { p: 2800, n: 'স্যুট', c: 'ফ্যাশন', a: 'ঢাকা' },
    { p: 5600, n: 'স্ট্যান্ড লাইট', c: 'ইলেকট্রনিক্স', a: 'ঢাকা' }, { p: 28000, n: 'সাইকেল', c: 'অন্যান্য', a: 'ঢাকা' }
  ];
  const users = [{ n: 'সামিয়া', u: 'samiya', ok: 1 }, { n: 'নাঈম', u: 'naim', ok: 1 }];
  const reports = [{ post: 'ছবির পোস্ট', why: 'ভুয়া তথ্য', by: 'hasan' }, { post: 'ভিডিও', why: 'স্প্যাম', by: 'mita' }];
  const pays = [{ u: 'সুজা', plan: 'বার্ষিক', amt: 1800, ok: 1 }, { u: 'তারেক', plan: 'মাসিক', amt: 200, ok: 0 }];
  const mypay = [{ d: '১২ জানু', plan: 'বার্ষিক', amt: 1800, ok: 1 }, { d: '৮ জানু', plan: 'মাসিক', amt: 200, ok: 0 }];
  const cfg = { twofa: true, alert: true, saver: false, notif: true, dark: false, vis: 'বন্ধুরা', see: 'সর্বজনীন', ...store.get('freedom-settings', {}) };

  /* ---------- renderers ---------- */
  const postHtml = (p, i) => `<article class="post"><div class="post-head">${av(i)}<div><strong>${esc(p.n)}</strong><small>${esc(p.t)}</small></div></div><p>${esc(p.b)}</p>${p.g === undefined ? '' : `<div class="photo${p.g ? ' green' : ''}"></div>`}<div class="metrics"><button class="act" data-action="like" data-n="${p.l}" aria-pressed="false">♡ ${num(p.l)}</button><span>💬 ${num(p.c)}</span><span>↻ ${num(p.s)}</span></div></article>`;
  const personRow = (p, i) => { const f = followed.has(p.u); return `<div class="person-row">${av(i)}<div class="details"><strong>${esc(p.n)}</strong><small>@${esc(p.u)}</small></div><button class="mini-btn${f ? ' following' : ''}" data-action="follow" data-k="${p.u}">${f ? 'ফলো করছেন' : 'ফলো করুন'}</button></div>`; };
  const renderPosts = () => set('[data-list=posts]', posts.map(postHtml).join(''));
  const renderPeople = () => {
    const q = $('#people-search').value.trim().toLowerCase(), t = $('[data-chips=people] .active').dataset.v;
    const r = people.filter(p => (!t || p.t === t) && (p.n + p.u).toLowerCase().includes(q));
    set('[data-list=people]', r.length ? r.map(personRow).join('') : empty('কোনো ফলাফল পাওয়া যায়নি'));
  };
  const renderFriends = () => {
    const q = $('#friend-search').value.trim(), r = friends.filter(f => f.includes(q));
    set('[data-list=friends]', r.length ? r.map((f, i) => `<button class="person-row" data-action="chat" data-n="${f}">${av(i)}<span class="details"><strong>${f}</strong></span></button>`).join('') : empty('কোনো বন্ধু পাওয়া যায়নি'));
  };
  const renderMarket = () => {
    const q = $('#market-search').value.trim(), c = $('[data-chips=market] .active').dataset.v;
    const r = products.filter(p => (!c || p.c === c) && p.n.includes(q));
    set('[data-list=market]', r.length ? r.map((p, i) => `<div class="product"><div class="photo${i % 2 ? ' green' : ''}"></div><strong>${fmt(p.p)}</strong><br><small>${esc(p.n)} · ${esc(p.a)}</small></div>`).join('') : empty('কোনো পণ্য পাওয়া যায়নি'));
  };
  const renderMyPay = () => set('#history', mypay.map(p => `<div class="person-row"><span>${p.d}</span><span class="details">${p.plan} · ${fmt(p.amt)}</span><span class="status${p.ok ? '' : ' fail'}">${p.ok ? 'সফল' : 'ব্যর্থ'}</span></div>`).join(''));
  const renderUsers = () => {
    const q = $('#user-search').value.trim().toLowerCase(), r = users.filter(u => (u.n + u.u).toLowerCase().includes(q));
    set('[data-list=users]', r.length ? r.map(u => `<tr><td>${u.n}</td><td>@${u.u}</td><td class="status${u.ok ? '' : ' fail'}">${u.ok ? 'সক্রিয়' : 'ব্লক'}</td><td><button class="mini-btn" data-action="block" data-u="${u.u}">${u.ok ? 'ব্লক করুন' : 'আনব্লক'}</button></td></tr>`).join('') : '<tr><td colspan="4">কোনো ব্যবহারকারী পাওয়া যায়নি</td></tr>');
  };
  const renderReports = () => set('[data-list=reports]', reports.length ? reports.map((r, i) => `<tr><td>${r.post}</td><td>${r.why}</td><td>@${r.by}</td><td>${r.done ? '<span class="status">সরানো হয়েছে</span>' : `<button class="mini-btn" data-action="remove" data-i="${i}">সরিয়ে দিন</button> <button class="mini-btn" data-action="dismiss" data-i="${i}">বাতিল</button>`}</td></tr>`).join('') : '<tr><td colspan="4">কোনো রিপোর্ট বাকি নেই</td></tr>');
  const renderPays = () => {
    const ok = pays.filter(p => p.ok);
    set('#pay-stats', `<div class="metric-card"><small>মোট আয়</small><strong>${fmt(ok.reduce((s, p) => s + p.amt, 0))}</strong></div><div class="metric-card"><small>সফল</small><strong>${num(ok.length)}</strong></div><div class="metric-card"><small>ব্যর্থ</small><strong>${num(pays.length - ok.length)}</strong></div>`);
    set('[data-list=pays]', pays.map((p, i) => `<tr><td>${p.u}</td><td>${p.plan}</td><td>${fmt(p.amt)}</td><td>${p.ok ? '<span class="status">সফল</span>' : `<span class="status fail">ব্যর্থ</span> <button class="mini-btn" data-action="retry" data-i="${i}">আবার চেষ্টা</button>`}</td></tr>`).join(''));
  };
  const applyCfg = () => {
    document.documentElement.dataset.theme = cfg.dark ? 'dark' : 'light';
    $$('[data-setting]').forEach(e => {
      const v = cfg[e.dataset.setting];
      if (e.tagName === 'SELECT') e.value = v;
      else { e.classList.toggle('on', !!v); e.setAttribute('aria-checked', !!v); }
    });
  };

  /* ---------- click actions ---------- */
  const A = {
    follow(b) { const on = b.classList.toggle('following'); b.textContent = on ? 'ফলো করছেন' : 'ফলো করুন'; if (on) followed.add(b.dataset.k); else followed.delete(b.dataset.k); },
    like(b) { const on = b.classList.toggle('on'); b.setAttribute('aria-pressed', on); b.textContent = '♡ ' + num(+b.dataset.n + (on ? 1 : 0)); },
    toast(b) { toast(b.dataset.msg); },
    copy() { (navigator.clipboard ? navigator.clipboard.writeText(location.href) : Promise.reject()).then(() => toast('লিংক কপি হয়েছে'), () => toast('লিংক কপি করা যায়নি')); },
    pick(b) { const on = b.classList.toggle('on'); b.setAttribute('aria-pressed', on); $('#interest-note').textContent = ''; },
    next() {
      const n = $$('#interests .on').length;
      $('#interest-note').textContent = n < 3 ? `কমপক্ষে ৩টি আগ্রহ বাছুন (এখন ${bn(n)}টি)` : '';
      if (n >= 3) toast(`${bn(n)}টি আগ্রহ সংরক্ষিত হয়েছে`);
    },
    chip(b) {
      const g = b.parentElement;
      $$('.chip', g).forEach(c => { c.classList.toggle('active', c === b); c.setAttribute('aria-pressed', c === b); });
      ({ people: renderPeople, market: renderMarket })[g.dataset.chips]();
    },
    chat(b) { $('#chat-to').textContent = b.dataset.n; set('#chat', '<p class="bubble">হ্যালো!</p>'); $('#msg') && $('#msg').focus(); },
    renew() {
      years++;
      $('#expiry').textContent = 'মেয়াদ শেষ: ২০ ডিসেম্বর ' + bn(2026 + years);
      mypay.unshift({ d: 'আজ', plan: 'বার্ষিক', amt: 1800, ok: 1 });
      renderMyPay();
      toast('প্রিমিয়াম নবায়ন হয়েছে');
    },
    history(b) { b.setAttribute('aria-expanded', $('#history').classList.toggle('hidden') === false); },
    live(b) {
      const i = $('#live-title');
      if (!isLive && !i.value.trim()) { i.classList.add('invalid'); return toast('লাইভের শিরোনাম লিখুন'); }
      isLive = !isLive;
      i.disabled = isLive;
      b.textContent = isLive ? 'লাইভ বন্ধ করুন' : 'লাইভ শুরু করুন';
      $('#live-state').textContent = isLive ? '🔴 লাইভ চলছে: ' + i.value.trim() : '';
      toast(isLive ? 'লাইভ শুরু হয়েছে' : 'লাইভ শেষ হয়েছে');
    },
    toggle(b) { const k = b.dataset.setting; cfg[k] = !cfg[k]; applyCfg(); },
    save() { store.set('freedom-settings', cfg); toast('সেটিংস সংরক্ষিত হয়েছে'); },
    block(b) { const u = users.find(x => x.u === b.dataset.u); u.ok = u.ok ? 0 : 1; renderUsers(); },
    remove(b) { reports[b.dataset.i].done = 1; renderReports(); toast('পোস্ট সরিয়ে দেওয়া হয়েছে'); },
    dismiss(b) { reports.splice(+b.dataset.i, 1); renderReports(); toast('রিপোর্ট বাতিল করা হয়েছে'); },
    retry(b) { pays[b.dataset.i].ok = 1; renderPays(); toast('পেমেন্ট সফল হয়েছে'); }
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-action]');
    if (b && A[b.dataset.action]) A[b.dataset.action](b);
  });

  /* ---------- inputs & forms ---------- */
  const searches = { 'people-search': renderPeople, 'market-search': renderMarket, 'friend-search': renderFriends, 'user-search': renderUsers };
  document.addEventListener('input', e => {
    e.target.classList.remove('invalid');
    if (searches[e.target.id]) searches[e.target.id]();
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.tagName === 'SELECT' && t.dataset.setting) cfg[t.dataset.setting] = t.value;
  });
  const H = {
    chat(d) { const p = document.createElement('p'); p.className = 'bubble me'; p.textContent = d.msg.trim(); $('#chat').append(p); p.scrollIntoView({ block: 'nearest' }); },
    feed(d) { $('#feed').insertAdjacentHTML('afterbegin', postHtml({ n: 'আপনি', t: 'এইমাত্র', b: d.ftext.trim(), l: 0, c: 0, s: 0 }, 0)); },
    page(d) { $('#page-name').textContent = d.pname.trim(); },
    listing(d) { products.unshift({ p: +d.lprice, n: d.ltitle.trim(), c: d.lcat, a: d.larea.trim() }); renderMarket(); }
  };
  document.addEventListener('submit', e => {
    const f = e.target, k = f.dataset.form;
    if (!k) return;
    e.preventDefault();
    let ok = true;
    $$('[required]', f).forEach(i => {
      const bad = !i.value.trim() || (i.type === 'number' && +i.value <= 0);
      i.classList.toggle('invalid', bad);
      i.setAttribute('aria-invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) return toast('চিহ্নিত ঘরগুলো পূরণ করুন');
    H[k](Object.fromEntries(new FormData(f)));
    f.reset();
    if (f.dataset.ok) toast(f.dataset.ok);
  });

  /* ---------- screen filter ---------- */
  $$('.filter').forEach(b => b.addEventListener('click', () => {
    $$('.filter').forEach(x => { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b); });
    $$('.screen-card').forEach(c => c.classList.toggle('hidden', b.dataset.filter !== 'all' && c.dataset.category !== b.dataset.filter));
  }));

  /* ---------- static pieces & start ---------- */
  $$('[data-nav]').forEach(a => {
    a.innerHTML = '<strong>Freedom Admin</strong>' + ['ব্যবহারকারী', 'রিপোর্ট', 'পেমেন্ট'].map(i => `<div class="side-item${i === a.dataset.nav ? ' active' : ''}">${i}</div>`).join('');
  });
  $$('[data-tiles]').forEach(g => {
    const pick = g.hasAttribute('data-pick');
    g.innerHTML = g.dataset.tiles.split(',').map(t => pick ? `<button class="tile" data-action="pick" aria-pressed="false">${t}</button>` : `<span class="tile">${t}</span>`).join('');
  });
  applyCfg();
  renderPosts(); renderPeople(); renderFriends(); renderMarket(); renderMyPay();
  renderUsers(); renderReports(); renderPays();
  set('#feed', feedPosts.map(postHtml).join(''));
})();
