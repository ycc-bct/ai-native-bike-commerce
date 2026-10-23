(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const hero=document.querySelector('#hero'), video=hero.querySelector('video'), copy=hero.querySelector('.hx');
 const models=document.querySelector('#models'), cards=[...models.querySelectorAll('article')];
 const clamp=v=>Math.max(0,Math.min(1,v));
 let scheduled=false;
 function update(){
  scheduled=false;
  const hp=clamp(-hero.getBoundingClientRect().top/hero.offsetHeight);
  video.style.transform=reduced.matches?'none':`translateY(${hp*120}px) scale(${1+hp*.08})`;
  copy.style.opacity=reduced.matches?1:1-clamp(hp*1.8);
  copy.style.translate=reduced.matches?'none':`0 ${hp*-80}px`;
  /* 車款卡片的進場改由 screen-motion.js 一次性播放（同首頁的 .rv 進場），這裡不再跟著捲動推移 */
  /* 門市地圖與清單也改由 screen-motion.js 一次性淡入上浮，不再橫向推移 */
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',()=>{if(reduced.matches)video.pause();else video.play().catch(()=>{});schedule();});
 new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting&&!reduced.matches)video.play().catch(()=>{});else video.pause();});}).observe(hero);
 update();
 const section=document.querySelector('#templates'),bike=section.querySelector('.bk9'),tray=section.querySelector('.trayin');
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const families=['tcr','propel','defy','trinity'];
 const counts={tcr:3,propel:3,defy:1,trinity:3};
 const special={tcr:['giant-white','經典塗裝・捷安特白'],propel:['silver-green','幻綠耀銀'],defy:['phantom-red','幻影紅'],trinity:['chameleon','超級變色龍']};
 const catalog=Object.fromEntries(families.map(f=>[f,[...Array.from({length:counts[f]},(_,i)=>({src:`img/templates-cut/${f}-type${i+1}.webp`,label:`樣板 ${i+1}`})),{src:`img/templates-cut/${f}-${special[f][0]}.png`,label:special[f][1]}]]));
 catalog.propel[1]={src:'img/templates-cut/propel-team-jayco.webp',label:'Team Jayco 特仕塗裝'};
 const tabs=[...section.querySelectorAll('.tab9')];
 const caption=document.createElement('p');caption.className='paint-caption';section.querySelector('.in').append(caption);
 /* 原本的「選擇你的塗裝」改成主要按鈕：用目前選的車款開始客製，連到客製頁該車款的等級選擇 */
 const choosePaint=document.createElement('a');choosePaint.className='paint-choose-action paint-start';section.querySelector('.in').append(choosePaint);
 const ARROW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
 const setStart=f=>{const name=f.toUpperCase();choosePaint.href=`../../customized.html#levels/${f}`;choosePaint.innerHTML=`用 ${name} 開始客製${ARROW}`;choosePaint.setAttribute('aria-label',`用 ${name} 開始客製`);};
 section.classList.add('arc-showroom');
 const display=document.createElement('div');display.className='paint-display';bike.before(display);display.append(bike);
 const entrance=document.createElement('div');entrance.className='showroom-motion';section.querySelector('.in').append(entrance);entrance.append(display,section.querySelector('.tabs9'),section.querySelector('.tray9'),caption,choosePaint);
 let family='tcr',selected=0,request=0,timer,visible=false,holdUntil=0;
 let layout={},motion=null;
 const layoutReady=fetch('img/templates-cut/layout.json').then(r=>r.json()).then(data=>{layout=data;positionBike(bike.getAttribute('src'));});

 function positionBike(src){
  const box=layout[src.split('/').pop()];if(!box)return;
  const [w,h,x,y,right,bottom]=box,scale=100/(right-x);
  bike.style.setProperty('--paint-width',`${w*scale}%`);
  bike.style.setProperty('--paint-left',`${-x*scale}%`);
  bike.style.setProperty('--paint-bottom',`${-(h-bottom)*scale/0.7}%`);
 }
 function restart(){clearTimeout(timer);if(visible&&!document.hidden&&!reducedMotion.matches)timer=setTimeout(next,Math.max(4200,holdUntil-Date.now()));}
 function next(){if(selected+1<catalog[family].length)selectPaint(selected+1);else selectFamily(families[(families.indexOf(family)+1)%families.length]);}
 function selectPaint(index){
  clearTimeout(timer);selected=index;const token=++request,paint=catalog[family][index];
  tray.querySelectorAll('button').forEach((el,i)=>{el.classList.toggle('on',i===index);el.setAttribute('aria-pressed',String(i===index));});
  const targetFamily=family;
  const asset=new Image();asset.onload=async()=>{
   await layoutReady.catch(()=>{});if(token!==request)return;
   const changed=bike.dataset.family&&bike.dataset.family!==targetFamily;
   motion?.cancel();
   if(changed&&!reducedMotion.matches){
    motion=display.animate([{translate:'0 0'},{translate:`${innerWidth}px 0`}],{duration:380,easing:'cubic-bezier(.55,0,1,.45)',fill:'forwards'});
    try{await motion.finished;}catch{return;}
    if(token!==request)return;
   }
   bike.src=paint.src;bike.alt=`${targetFamily.toUpperCase()} ${paint.label}`;bike.dataset.family=targetFamily;positionBike(paint.src);caption.textContent=paint.label;
   motion?.cancel();
   if(changed&&!reducedMotion.matches){
    motion=display.animate([{translate:`${-innerWidth}px 0`},{translate:'0 0'}],{duration:620,easing:'cubic-bezier(.16,1,.3,1)'});
   }
   restart();
  };asset.onerror=()=>{if(token===request)restart();};asset.src=paint.src;
 }
 function selectFamily(value){
  family=value;setStart(family);
  tabs.forEach(el=>{const active=el.textContent.trim().toLowerCase()===family;el.classList.toggle('on',active);el.setAttribute('aria-pressed',String(active));});
  tray.replaceChildren();
  catalog[family].forEach((paint,index)=>{const el=document.createElement('button');el.type='button';el.className='th9';el.setAttribute('aria-label',`${family.toUpperCase()} ${paint.label}`);el.title=paint.label;const img=new Image();img.src=paint.src;img.alt='';const label=document.createElement('b');label.textContent=paint.label;el.append(img,label);el.addEventListener('click',()=>{holdUntil=Date.now()+12000;selectPaint(index);});tray.append(el);});
  selectPaint(0);
 }
 tabs.forEach(el=>{el.setAttribute('role','button');el.addEventListener('click',e=>{e.preventDefault();holdUntil=Date.now()+12000;selectFamily(el.textContent.trim().toLowerCase());});el.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();el.click();}});});
 models.querySelectorAll('.model-link').forEach(link=>link.addEventListener('click',()=>selectFamily(link.closest('[data-family]').dataset.family)));
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;restart();},{threshold:.2}).observe(section);


 document.addEventListener('visibilitychange',restart);reducedMotion.addEventListener('change',()=>{motion?.cancel();restart();});
 selectFamily('tcr');
})();

/* Official GIANT component highlights: compact detail appears only for the active part. */
(() => {
 const details={
  'p-saddle':'DCF 適配 Forward、Neutral、Upright 三種騎姿；高彈泡棉提升支撐與吸震。',
  'p-cassette':'12 速 11–34T 齒比，兼顧高速巡航與陡坡節奏。',
  'p-crank-ring':'36/52T 盤片搭配車架尺寸選用曲柄長度，並可整合功率計追蹤輸出。',
  'p-stem':'Advanced SL 碳纖維結構整合內走線，80–140 mm 長度提供精準設定。',
  'p-bar-drop':'全碳纖維、短 Reach 與淺 Drop；外擴幾何兼顧空力、操控與長途舒適。',
  'p-wheel':'40 mm 碳纖維輪框、空力碳纖維輻條與無內胎設定，兼顧速度與穩定。'
 };
 /* 說明直接放進零件旁的標籤裡（選到時展開成小卡），不再另外放在標題下方 */
 const section=document.querySelector('#parts'),parts=[...section.querySelectorAll('.pp10')];
 parts.forEach(part=>{const key=[...part.classList].find(name=>details[name]),dc=part.querySelector('.dc');if(key&&dc&&!dc.querySelector('.pd-desc'))dc.insertAdjacentHTML('beforeend','<small class="pd-desc">'+details[key]+'</small>');});
 /* 桌機：說明不再展開在標籤上（會擋住零件），改放在車子下方的說明列，選到哪個零件就換成它的名稱、規格與說明 */
 const strip=document.createElement('div');strip.className='pd-strip';strip.setAttribute('aria-live','polite');section.appendChild(strip);
 const fill=i=>{
  const part=parts[i];
  if(!part){strip.innerHTML='<b class="pd-strip-nm">六大零件</b><span class="pd-strip-txt"><span class="pd-strip-ds">滑到或點選零件，看規格與說明</span></span>';return;}
  const b=part.querySelector('.dc b'),name=b?b.childNodes[0].textContent.trim():'',spec=[...part.querySelectorAll('.dc .chip')].map(c=>c.textContent.trim()).join('・'),key=[...part.classList].find(n=>details[n]);
  strip.innerHTML=`<b class="pd-strip-nm">${name}</b><span class="pd-strip-txt"><span class="pd-strip-sp">${spec}</span><span class="pd-strip-ds">${key?details[key]:''}</span></span>`;
 };
 fill(-1);
 /* 說明列：放在尺寸線正下方、左右輪之間置中；固定寬度 640（不超過兩輪外緣），每個零件一樣寬 */
 const alignStrip=()=>{const rear=section.querySelector('.rear-wheel:not(.pd-sk)'),front=section.querySelector('.p-wheel img:not(.pd-sk)'),wrap=section.querySelector('.pd-stage');if(!rear||!front||!wrap||!matchMedia('(min-width:901px)').matches)return;const S=section.getBoundingClientRect(),W=wrap.getBoundingClientRect(),l=rear.getBoundingClientRect().left-S.left,r=front.getBoundingClientRect().right-S.left;if(r-l<200)return;strip.style.left=(l+r)/2+'px';strip.style.width=Math.min(640,r-l)+'px';strip.style.maxWidth='';strip.style.top=(W.top-S.top+784*W.height/900)+'px';strip.style.bottom='auto';};
 alignStrip();addEventListener('resize',alignStrip);addEventListener('load',alignStrip);
 section.addEventListener('partchange',e=>{strip.classList.add('swap');clearTimeout(strip._t);strip._t=setTimeout(()=>{fill(e.detail);strip.classList.remove('swap');},140);});
})();
