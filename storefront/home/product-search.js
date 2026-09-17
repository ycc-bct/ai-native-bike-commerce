(()=>{

const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString('en-US');
const SPARK = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M16.0667 9.53333C16.0667 13.1416 13.1416 16.0667 9.53333 16.0667C5.92507 16.0667 3 13.1416 3 9.53333C3 5.92507 5.92507 3 9.53333 3M14.1057 14.2L17 17" stroke="white" stroke-width="1.3" stroke-linecap="round"/><path d="M13.5131 2.61095C13.7292 2.02272 13.8373 1.72861 14.0031 1.65806C14.1073 1.61374 14.2251 1.61374 14.3293 1.65806C14.4952 1.72861 14.6032 2.02272 14.8194 2.61095L15.1748 3.57829C15.2185 3.69722 15.2403 3.75668 15.2768 3.80545C15.3007 3.8373 15.3289 3.86558 15.3608 3.88941C15.4096 3.9259 15.469 3.94775 15.5879 3.99145L16.5553 4.34688C17.1435 4.56301 17.4376 4.67108 17.5082 4.83693C17.5525 4.94114 17.5525 5.0589 17.5082 5.16311C17.4376 5.32896 17.1435 5.43703 16.5553 5.65316L15.5879 6.00859C15.469 6.05229 15.4096 6.07413 15.3608 6.11063C15.3289 6.13446 15.3007 6.16274 15.2768 6.19459C15.2403 6.24336 15.2185 6.30282 15.1748 6.42175L14.8194 7.38909C14.6032 7.97732 14.4952 8.27143 14.3293 8.34198C14.2251 8.3863 14.1073 8.3863 14.0031 8.34198C13.8373 8.27143 13.7292 7.97732 13.5131 7.38909L13.1576 6.42175C13.114 6.30282 13.0921 6.24336 13.0556 6.19459C13.0318 6.16274 13.0035 6.13446 12.9716 6.11063C12.9229 6.07413 12.8634 6.05229 12.7445 6.00859L11.7771 5.65316C11.1889 5.43703 10.8948 5.32896 10.8243 5.16311C10.7799 5.0589 10.7799 4.94114 10.8243 4.83693C10.8948 4.67108 11.1889 4.56301 11.7771 4.34688L12.7445 3.99145C12.8634 3.94775 12.9229 3.9259 12.9716 3.88941C13.0035 3.86558 13.0318 3.8373 13.0556 3.80545C13.0921 3.75668 13.114 3.69722 13.1576 3.57829L13.5131 2.61095Z" fill="white"/></svg>';

/* ---------- 熱門車款：車名與價格沿用 02 的車款資料；色點為示意 ---------- */
const BIKES = [
  {k:'fastroad', n:'FastRoad AR Advanced 1',   pr:62800,  cat:'road',   dots:['#C9B79A','#1B1F26','#2A3340','#1D3C7A'], badge:'NEW'},
  {k:'revolt',   n:'Revolt Advanced SL 0',     pr:308000, cat:'gravel', dots:['#3B3F2C','#5E6470','#1B1F26','#474B52']},
  {k:'talon',    n:'Talon E+',                 pr:79800,  cat:'mtb',    dots:['#2B3F6E','#7C858F','#C8CDD3','#5A6068']},
  {k:'escape',   n:'Escape Disc 2',            pr:16800,  cat:'city',   dots:['#1B1F26','#2E5AA8','#D8D3C4'], badge:'BEST SELLER'},
  {k:'explore',  n:'Explore E+',               pr:78000,  cat:'ebike',  dots:['#2B3F6E','#1B1F26','#474B52']},
  {k:'trance',   n:'Trance X Advanced Pro 29', pr:178000, cat:'mtb',    dots:['#1B1F26','#7FA3A0','#8C7A4E','#474B52']},
];
const BY = Object.fromEntries(BIKES.map(b => [b.k, b]));
/* 對話裡用到的重點（不寫官方沒有的規格數字） */
const WHY = {
  explore: ['電動輔助車款','先確認預計騎乘的路況','尺寸與配備請以官方商品資料為準'],
  revolt:  ['Gravel 車款：柏油、碎石路都能騎','寬胎設計，碎石路面更穩定','長距離騎乘姿勢較舒適'],
  talon:   ['電動輔助，林道爬坡更省力','前避震硬尾，保養相對單純','29 吋輪組，越過坑洞更穩'],
  trance:  ['前後全避震，下坡與碎石路更有信心','碳纖車架，爬坡不吃力','適合進階山路與越野挑戰'],
  escape:  ['平把直立姿勢，通勤好上手','碟煞設計，雨天煞車更穩','入門價位，日常代步剛好'],
  fastroad:['輕量車架，平路巡航更快','平把操控，城市與河濱都好騎','想從通勤進階到運動騎乘的選擇'],
};

const heart = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 20.3S3.5 15.1 3.5 9.1A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8.5 2.5c0 6-8.5 11.2-8.5 11.2z"/></svg>';
/* ---------- 瀏覽紀錄：在卡片上停一下或點下去，才算「看過」 ---------- */
const CAT_LABEL = {city:'城市車', road:'公路車', gravel:'Gravel', mtb:'登山車', ebike:'電輔車'};
const VIEWED = ['gravel'];
function markView(cat){
  if (VIEWED.includes(cat)) return;
  VIEWED.push(cat);
  $('assistCopy').textContent = promptCopy();
  // 瀏覽只整理上下文；由使用者主動開啟協助。
}
document.querySelectorAll('.scene,.pc').forEach(el => {
  let t;
  el.addEventListener('mouseenter', () => { t = setTimeout(() => markView(el.dataset.cat), 700); });
  el.addEventListener('mouseleave', () => clearTimeout(t));
  el.addEventListener('click', e => { markView(el.dataset.cat); if (el.getAttribute('href') === '#') e.preventDefault(); });
});
function promptCopy(){
  return '我可以幫你快速比較你正在看的車款，或依照你的騎乘情境推薦合適的選擇。';
}

/* 提示不是偏好判斷：本次進頁最多一次，背景分頁不觸發。 */
const assist = $('assist');
const A = {shown:false, chat:false, terrain:null};
let nudgeTimer, nudgeConsumed = false, assistReturnFocus = null;
$('assistCopy').textContent = promptCopy();
let clickedSinceArrival=false;
function stopGlow(){ $('searchToggle').classList.remove('search-glow'); }
function scheduleNudge(){
  clearTimeout(nudgeTimer);
  if(nudgeConsumed || clickedSinceArrival || document.hidden || assist.classList.contains('on')) return;
  nudgeTimer=setTimeout(()=>{
    if(document.hidden || nudgeConsumed || clickedSinceArrival || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    nudgeConsumed=true;
    assist.setAttribute('role','region');assist.classList.add('on');
    $('searchToggle').classList.add('search-glow');
  },5000);
}
function openAssist(){
  stopGlow();
  assistReturnFocus=document.activeElement;
  clearTimeout(nudgeTimer);nudgeConsumed=true;A.shown=true;
  assist.setAttribute('role','dialog');assist.classList.add('on');
  $('searchToggle').setAttribute('aria-expanded','true');
  startChat();fitChat();$('chatInput').focus();
}
function closeAssist(){
  stopGlow();
  clearTimeout(nudgeTimer);nudgeConsumed=true;
  const focusInside=assist.contains(document.activeElement);
  assist.classList.remove('on');
  $('searchToggle').setAttribute('aria-expanded','false');
  if(focusInside){
    const target=assistReturnFocus && !assist.contains(assistReturnFocus) && assistReturnFocus.isConnected ? assistReturnFocus : $('searchToggle');
    target.focus({preventScroll:true});
  }
}
$('assistClose').onclick=closeAssist;
$('assistNo').onclick=closeAssist;
$('assistYes').onclick=openAssist;
$('searchToggle').onclick=openAssist;
function fitChat(){assist.style.height='';}
document.addEventListener('click',()=>{clickedSinceArrival=true;clearTimeout(nudgeTimer);stopGlow();},{capture:true});
document.addEventListener('visibilitychange',scheduleNudge);
document.addEventListener('keydown',e=>{if(e.key==='Escape' && assist.classList.contains('on')){e.preventDefault();closeAssist();}});
scheduleNudge();

/* ---------- 對話 ---------- */
const log = $('chatLog');
function add(html, who){
  const m = document.createElement('div');
  m.className = 'msg ' + (who || 'ai');
  m.innerHTML = who === 'me' ? '<div class="bubble">' + html + '</div>' : '<span class="av">' + SPARK + '</span><div class="body">' + html + '</div>';
  log.appendChild(m);
  log.scrollTop = log.scrollHeight;
  return m;
}
/* AI 回覆一律排隊：先顯示輸入中，再出現內容，避免連點時訊息交錯 */
let queue = Promise.resolve();
function ai(html, delay, bind){
  queue = queue.then(() => new Promise(res => {
    const t = add('<div class="typing"><i></i><i></i><i></i></div>');
    setTimeout(() => {
      t.remove();
      const m = add(html);
      if (bind) bind(m);
      requestAnimationFrame(() => { log.scrollTop = log.scrollHeight; });
      res(m);
    }, delay || 700);
  }));
  return queue;
}
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* 還沒回答的選項，一旦改用打字或點了別的，就收起來 */
function lockOpen(){ log.querySelectorAll('.opts:not(.done),.chips:not(.done)').forEach(g => g.classList.add('done')); }
function chips(list){ return '<div class="chips">' + list.map(([v, t]) => '<button class="chip" type="button" data-v="' + v + '">' + t + '</button>').join('') + '</div>'; }
function bindChips(m, handler){
  const g = m.querySelector('.chips'); if (!g) return;
  g.querySelectorAll('.chip').forEach(c => c.onclick = () => {
    lockOpen(); c.classList.add('on');
    add(c.textContent, 'me');
    handler(c.dataset.v);
  });
}

const CMP = [
  {k:'revolt', img:'img/scenes/gravel.webp',  d:'柏油碎石都能騎<br>長距離更舒適'},
  {k:'talon',  img:'img/scenes/mtb.webp',     d:'林道坑洞更好過<br>電輔爬坡省力'},
  {k:'trance', img:'img/scenes/descent.webp', d:'前後全避震<br>適合進階山路'},
];
const ICON = {
  city:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M4 28h24M7 28V12l7-4v20M14 28V5l9 4v19M23 28V15h4v13"/><path d="M10 15h1M10 19h1M10 23h1M17.5 11h1M17.5 15h1M17.5 19h1M17.5 23h1"/></svg>',
  gravel:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"><path d="M3 22l8-11 5 6 4-4 9 9"/><path d="M11 11l2 4M20 13l1.5 3"/><path d="M5 27h.1M10 26h.1M15 27h.1M20 26h.1M25 27h.1"/></svg>',
  trail:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"><path d="M3 26l9-15 4 6 3-4 10 13z"/><path d="M12 11l2.5 4M19 13l2 3"/><path d="M7 26v-3M25 26v-3"/></svg>',
  unsure:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 28c0-4 12-4 12-8s-12-4-12-8 7-4 7-8"/><path d="M17 4h5M8 28h5"/></svg>',
};
const OPTS = [['city','城市 / 河濱','平坦的柏油路'],['gravel','柏油 + 碎石','偶爾非鋪裝路'],['trail','林道 / 山路','較多起伏地形'],['unsure','還不確定','幫我再看看']];

function startChat(){
  if(A.chat) return;
  A.chat=true;assist.classList.add('chat');$('chat').hidden=false;
  const welcome=document.createElement('div');welcome.className='welcome';welcome.id='searchWelcome';
  welcome.innerHTML='<p class="eyebrow">一起找到想騎的那一台</p><h2>想怎麼騎，我們一起看看。</h2><p>不用先懂規格。輸入車名、預算或騎乘想法，也可以從下面開始。</p><div class="welcome-options"><button type="button" data-start="compare">幫我比較這裡的車款<span>↗</span></button><button type="button" data-start="budget">依預算找車<span>↗</span></button><button type="button" data-start="begin">第一台車，不知道怎麼挑<span>↗</span></button></div>';
  log.append(welcome);
  welcome.querySelectorAll('button').forEach(button=>button.onclick=()=>{
    const kind=button.dataset.start, label=button.childNodes[0].textContent;
    welcome.remove();add(esc(label),'me');
    if(kind==='compare') compareBrowsing();
    else if(kind==='budget') ai('<h4>先從預算開始。</h4><p>大約想控制在多少？也可以直接輸入金額。</p>'+chips([['30000','3 萬以內'],['60000','6 萬以內'],['100000','10 萬以內']]),400,m=>bindChips(m,v=>budgetFlow(Number(v))));
    else ai('<h4>先看想怎麼用，不急著選規格。</h4><p>可以從通勤、河濱休閒或探索山路開始。你也可以先回到頁面逛車，喜歡的再一起聊。</p>'+chips([['city','通勤、河濱騎騎'],['trail','想探索山路']]),400,m=>bindChips(m,answerTerrain));
  });
}
function compareBrowsing(){
  const contextual=BIKES.filter(b=>VIEWED.includes(b.cat));
  const candidates=(contextual.length>=2?contextual:BIKES).slice(0,3);
  const context=contextual.length>=2?'依你剛逛過的情境，先放這幾台一起看。':'先用本頁三款不同方向的車，一起看差異。';
  ai('<h4>這幾台，可以這樣看。</h4><p>'+context+' 點一台看看細節。</p><div class="cmp">'+candidates.map(b=>'<button class="cmp-card" type="button" data-k="'+b.k+'"><img src="img/bikes/'+b.k+'.webp" alt="'+b.n+'"><span class="t"><b>'+b.n+'</b><small>'+CAT_LABEL[b.cat]+' · NT$ '+fmt(b.pr)+'</small></span></button>').join('')+'</div>',500,m=>m.querySelectorAll('[data-k]').forEach(button=>button.onclick=()=>{add('看看 '+esc(BY[button.dataset.k].n),'me');recommend(button.dataset.k,'<p>這台的選購重點整理給你：</p>',[],'一起看看');}));
}

function askTerrain(){
  ai('<h4>你平常主要會騎在哪種路況？</h4><p>選擇後，我會為你推薦最適合的車款。</p>' +
     '<div class="opts">' + OPTS.map(([v, t, s]) => '<button class="opt" type="button" data-v="' + v + '">' + ICON[v] + '<b>' + t + '</b><small>' + s + '</small></button>').join('') + '</div>',
     650, m => m.querySelectorAll('.opt').forEach(o => o.onclick = () => {
       lockOpen(); o.classList.add('on');
       add(o.querySelector('b').textContent, 'me');
       answerTerrain(o.dataset.v);
     }));
}

function answerTerrain(v){
  A.terrain = v;
  if (v === 'gravel') return recommend('revolt', '<p>以柏油加碎石的路況，可以先看看 <b>Revolt Advanced SL 0</b>。</p><p>這類車款兼顧公路與非鋪裝路面的探索，實際適配仍可到店試騎確認。</p>');
  if (v === 'trail') return askTrail();
  if (v === 'city') return recommend('escape', '<p>如果主要在城市和河濱，可以先從平把、適合日常騎乘的車款看起。</p><p>平路通勤我會建議看看 <b>Escape Disc 2</b>。</p>', [['fastroad','想騎快一點']]);
  ai('<p>沒關係，我換個方式問。你週末通常會想去哪裡？</p>' + chips([['city','河濱或市區'],['gravel','郊外，偶爾走土路'],['trail','山上的步道']]), 700, m => bindChips(m, answerTerrain));
}

function askTrail(){
  A.terrain = 'trail';
  ai('<p>山路的話，<b>Talon E+</b> 和 <b>Trance X</b> 都合適，差在騎起來的感覺。你比較在意哪一點？</p>' +
     chips([['climb','爬坡想省力'],['descent','下坡想更有信心'],['budget','預算控制在 10 萬內']]), 700,
     m => bindChips(m, v => {
       if (v === 'climb') recommend('talon', '<p>想爬坡省力，<b>Talon E+</b> 的電動輔助會很有感。</p>');
       else if (v === 'descent') recommend('trance', '<p>想要下坡更有信心，前後全避震的 <b>Trance X Advanced Pro 29</b> 會比較適合。</p>');
       else budgetFlow(100000);
     }));
}

function recommend(k, intro, extra, tag){
  const b = BY[k];
  ai((intro || '') +
     '<div class="rec"><div class="ph"><span class="tag">' + (tag || '可以先看看') + '</span><img src="img/bikes/' + k + '.webp" alt=""></div>' +
     '<div class="in"><h5>' + b.n + '</h5><p class="pr">NT$ ' + fmt(b.pr) + '</p><ul>' + WHY[k].map(w => '<li>' + w + '</li>').join('') + '</ul>' +
     '<div class="acts"><button class="yes" type="button" data-act="view">看這台車款</button><button class="no" type="button" data-act="size">我適合的尺寸</button></div></div></div>' +
     chips((extra || []).concat([['again','換個條件']])),
     850, m => {
       log.querySelectorAll('.cmp-card').forEach(c => c.classList.toggle('pick', c.dataset.k === k));
       m.querySelector('[data-act="view"]').onclick = () => showInGrid(k);
       m.querySelector('[data-act="size"]').onclick = () => { lockOpen(); add('我適合的尺寸？', 'me'); sizeFlow(k); };
       bindChips(m, v => {
         if (v === 'again') askTerrain();
         else recommend(v, '<p>想騎快一點的話，可以看看 <b>' + BY[v].n + '</b>。</p>');
       });
     });
}

/* 尺寸只給通用示意值，正式版需接官方 Size Guide */
function sizeFlow(k){
  ai('<p>你的身高大概落在哪個範圍？</p>' + chips([['XS','160 cm 以下'],['S','160–170 cm'],['M','170–180 cm'],['L','180 cm 以上']]), 600,
     m => bindChips(m, s => ai('<p>' + (k ? BY[k].n + ' ' : '') + '建議先試 <b>' + s + '</b> 號車架。</p><p>這是通用的示意值，實際還是建議到門市試騎確認。</p>' + chips([['again','換個條件']]), 700, m2 => bindChips(m2, () => askTerrain()))));
}

function budgetFlow(n){
  const pool = A.terrain === 'city' ? ['fastroad','escape'] : A.terrain === 'gravel' ? ['revolt','fastroad','escape'] : A.terrain === 'trail' ? ['trance','talon'] : ['trance','revolt','talon','fastroad','escape'];
  const fit = pool.filter(k => BY[k].pr <= n).sort((a, b) => BY[b].pr - BY[a].pr);
  const over = pool.filter(k => BY[k].pr > n);
  if (!fit.length) return ai('<p>NT$ ' + fmt(n) + ' 以內，這幾台都會超出預算。最入門的是 <b>Escape Disc 2</b>（NT$ ' + fmt(BY.escape.pr) + '）。</p>' + chips([['again','換個條件']]), 700, m => bindChips(m, () => askTerrain()));
  recommend(fit[0], '<p>預算 NT$ ' + fmt(n) + ' 以內，我推薦 <b>' + BY[fit[0]].n + '</b>（NT$ ' + fmt(BY[fit[0]].pr) + '）。</p>' +
    (over.length ? '<p>' + over.map(k => BY[k].n).join('、') + ' 會超出預算，先不列入。</p>' : ''));
}

function parseBudget(s){
  const zh = {一:1,二:2,兩:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10,十五:15,二十:20};
  let m = s.match(/(\d+(?:\.\d+)?)\s*萬/); if (m) return Math.round(parseFloat(m[1]) * 10000);
  m = s.match(/(十五|二十|[一二兩三四五六七八九十])\s*萬/); if (m) return zh[m[1]] * 10000;
  m = s.match(/(\d{4,6})/); if (m) return parseInt(m[1], 10);
  return 0;
}

/* 打字：示範版只聽得懂路況、預算與尺寸 */
function route(t){
  const s = t.toLowerCase();
  if (/比較|差異|差在哪/.test(s)) return compareBrowsing();
  const named=BIKES.find(b=>s.includes(b.k));
  if(named) return recommend(named.k,'<p>先看看這台的重點：</p>',[],'你想了解的車');
  const n = parseBudget(s);
  if (n) return budgetFlow(n);
  if (/尺寸|身高|多高|size/.test(s)) return sizeFlow();
  if (/爬坡|省力|電輔|電動/.test(s)) { A.terrain = 'trail'; return recommend('talon', '<p>想爬坡省力的話，<b>Talon E+</b> 的電動輔助會很有感。</p>'); }
  if (/下坡|避震|挑戰|進階|技術/.test(s)) { A.terrain = 'trail'; return recommend('trance', '<p>想要下坡更有信心，前後全避震的 <b>Trance X Advanced Pro 29</b> 會比較適合。</p>'); }
  if (/林道|山路|越野|登山|步道|上山|山上/.test(s)) return answerTerrain('trail');
  if (/碎石|gravel|長途|環島|郊外|土路|一日/.test(s)) return answerTerrain('gravel');
  if (/城市|通勤|河濱|上班|上學|市區|代步/.test(s)) return answerTerrain('city');
  if (/不確定|不知道|都可以|沒想法/.test(s)) return answerTerrain('unsure');
  ai('<p>這句我還沒辦法判斷，這個示範版本目前只聽得懂路況、預算與尺寸。</p><p>可以說說你最常騎的地方，例如「河濱通勤」或「週末上山」。</p>', 650);
}
const input = $('chatInput'), send = $('chatSend');
input.addEventListener('input', () => send.classList.toggle('ready', !!input.value.trim()));
$('chatForm').onsubmit = e => {
  e.preventDefault();
  const t = input.value.trim(); if (!t) return;
  $('searchWelcome')?.remove();
  input.value = ''; send.classList.remove('ready');
  lockOpen();
  add(esc(t), 'me');
  route(t);
};
$('chatPic').onclick = () => ai('<p>之後可以拍一張你常騎的路線照片，我會依路面判斷適合的車款。這個示範版本還沒接上照片辨識。</p>', 600);

/* 「看這台車款」：先收起小幫手，捲到熱門車款並把那一台亮一下 */
function showInGrid(k){
  if(k==='revolt'){closeAssist();window.scrollTo({top:0,behavior:'smooth'});return;}
  location.href='bikes.html';
}

})();