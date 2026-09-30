/* 情境式問卷共用資料：五軸為示意分數（爬坡／舒適／操控／效率／多用途），gid 是 scenario-2 認得的 id，
   cat 是車種（road 公路／gravel 礫石／mtb 登山／city 城市／ebike 電輔），問卷推薦與結果頁的配件都依它挑。
   gnd 是去背圖上前後輪的觸地點 [後輪中心 x%, 前輪中心 x%, 觸地 y%]，事先算好（file:// 打開時 canvas 讀不到像素，不能靠即時計算）。
   ride.html、quiz.html、result.html 一起用；路徑以 storefront 根目錄為準。 */
window.RIDE = (function () {
  const AXES = ['爬坡','舒適','操控','效率','多用途'];
  const BIKES = {
  fast:      {n:'FastRoad AR 2',          pr:23800,  img:'img/bikes/fastroad.webp',            gid:'fast',      cat:'city', gnd:[21.4, 78.5, 85.2],   ax:[70,82,78,74,88], t:'柏油路、河濱與市區通勤；平把騎姿輕鬆，偶爾產業道路也能應付。'},
  escape:    {n:'Escape Disc 2',          pr:16800,  img:'img/bikes/escape.webp',              gid:null,        cat:'city', gnd:[21.1, 78.7, 84.1],   ax:[62,86,76,66,84], t:'市區與河濱的日常代步，直立騎姿最不費力，碟煞雨天也安心。'},
  explore:   {n:'Explore E+',             pr:78000,  img:'img/bikes/explore.webp',             gid:null,        cat:'ebike', gnd:[21.3, 78.8, 85.4],  ax:[90,88,72,70,86], t:'通勤與長距離休閒，電動輔助讓上坡與逆風都輕鬆。'},
  advanced2: {n:'Revolt Advanced 2',      pr:68800,  img:'img/bikes/revolt.webp',              gid:'advanced2', cat:'gravel', gnd:[22.0, 78.0, 87.0], ax:[78,84,80,76,92], t:'柏油到碎石都能騎，週末郊外探索的入門碳纖 Gravel。'},
  pro1:      {n:'Revolt Advanced Pro 1',  pr:128000, img:'img/bikes/revolt-lg.webp',           gid:'pro1',      cat:'gravel', gnd:[22.1, 78.0, 87.1], ax:[86,84,84,82,93], t:'混合路面與長途，寬胎在碎石路面更穩定。'},
  sl0:       {n:'Revolt Advanced SL 0',   pr:308000, img:'scenario-2/img/product-sl0.webp',    gid:'sl0',       cat:'gravel', gnd:[21.9, 78.0, 87.2], ax:[94,78,88,92,90], t:'長距離礫石賽事與快速穿越，柏油、碎石都能全速。'},
  sl1:       {n:'Revolt Advanced SL 1',   pr:208000, img:'img/pdp/rel-revolt-sl1.webp',        gid:null,        cat:'gravel', gnd:[24.6, 75.3, 84.9], ax:[92,78,87,90,90], t:'同一支 SL 車架，長距離礫石與柏油混合路線。'},
  talon:     {n:'Talon 0',                pr:26800,  img:'img/bikes/talon.webp',               gid:'talon',     cat:'mtb', gnd:[20.9, 79.1, 85.6],    ax:[74,80,88,62,78], t:'山徑與林道入門，前叉吸震讓越障更穩。'},
  ebike:     {n:'Talon E+',               pr:79800,  img:'scenario-2/img/product-ebike.webp',  gid:'ebike',     cat:'ebike', gnd:[20.9, 79.0, 85.5],  ax:[97,90,84,72,81], t:'適合山路爬坡、林道與土路，電動輔助讓起伏地形的騎乘更省力。'},
  trance:    {n:'Trance X 1',             pr:108000, img:'scenario-2/img/product-trance.webp', gid:'trance',    cat:'mtb', gnd:[20.3, 79.2, 83.9],    ax:[80,88,96,64,76], t:'技術型山徑與下坡，前後避震吃掉大落差。'},
  propelpro: {n:'Propel Advanced Pro',    pr:188000, img:'img/ride/propel-pro0.webp',          gid:null,        cat:'road', gnd:[26.3, 73.3, 87.8],   ax:[82,72,88,96,70], t:'平路衝刺與河濱長直線，空力車架最省力。'},
  propelsl:  {n:'Propel Advanced SL',     pr:258000, img:'img/ride/propel-sl1.webp',           gid:null,        cat:'road', gnd:[26.3, 73.7, 88.3],   ax:[86,70,90,98,68], t:'競速取向的空力公路車，河濱與平路巡航效率最高。'},
  tcr:       {n:'TCR Advanced',           pr:0,      img:'img/ride/tcr.webp',                  gid:null,        cat:'road', gnd:[24.9, 75.4, 88.5],   ax:[90,76,86,90,72], t:'全能公路車，爬坡與長距離都均衡。'},
};
  /* 從去背圖的透明邊找兩個輪胎的著地點，把接地影子放在正下方；算過的圖記起來 */
  const SH = {};   /* 算過的圖記起來 */
  function groundShadows(pic){   /* pic：包住 <img> 的容器，裡面放兩組 .sh/.sk */
    const img = pic.querySelector('img'), src = img.getAttribute('src');
    const known = Object.keys(BIKES).find(k => BIKES[k].img === src);
    if (known && BIKES[known].gnd) { const g = BIKES[known].gnd; SH[src] = [{cx: g[0], w: 5, y: g[2]}, {cx: g[1], w: 5, y: g[2]}]; }   /* 事先算好的觸地點優先 */
    const apply = sh => {
      pic.querySelectorAll('.sh').forEach((el, i) => { const t = sh[i]; el.style.left = t.cx + '%'; el.style.top = t.y + '%'; el.style.width = '30%'; });   /* 官方產品照的影子寬度約是車寬的三成 */
      pic.querySelectorAll('.sk').forEach((el, i) => { const t = sh[i]; el.style.left = t.cx + '%'; el.style.top = t.y + '%'; el.style.width = Math.max(t.w * 1.0, 10) + '%'; });
      pic.style.setProperty('--gy', Math.max(sh[0].y, sh[1].y) + '%');
      pic.style.transform = 'translateY(' + (100 - Math.max(sh[0].y, sh[1].y)).toFixed(2) + '%)';   /* 去背圖底下的透明邊：整台往下推到著地 */
    };
    if (SH[src]) return apply(SH[src]);
    const go = () => {
      let out;
      try {
        const W = img.naturalWidth, H = img.naturalHeight, c = document.createElement('canvas'); c.width = W; c.height = H;
        const g = c.getContext('2d'); g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, W, H).data, bot = new Int32Array(W).fill(-1);
        let maxB = -1;
        for (let x = 0; x < W; x++) for (let y = H - 1; y >= 0; y--) if (d[(y * W + x) * 4 + 3] > 40) { bot[x] = y; if (y > maxB) maxB = y; break; }
        const tol = H * 0.012, runs = []; let cur = null;
        for (let x = 0; x < W; x++) if (bot[x] >= maxB - tol) { if (cur && x - cur.end <= 4) cur.end = x; else runs.push(cur = {start: x, end: x}); }
        runs.sort((a, b) => (b.end - b.start) - (a.end - a.start));
        const two = runs.slice(0, 2).sort((a, b) => a.start - b.start);
        if (two.length === 2) out = two.map(r => { let b = 0; for (let x = r.start; x <= r.end; x++) if (bot[x] > b) b = bot[x]; return {cx: (r.start + r.end) / 2 / W * 100, w: (r.end - r.start) / W * 100, y: (b + 1) / H * 100}; });
      } catch (e) { /* file:// 下 canvas 不能讀，退回預設位置 */ }
      SH[src] = out || [{cx: 22, w: 5, y: 100}, {cx: 78, w: 5, y: 100}];
      apply(SH[src]);
    };
    if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go, {once: true});
  }
  return {AXES: AXES, BIKES: BIKES, groundShadows: groundShadows};
})();
