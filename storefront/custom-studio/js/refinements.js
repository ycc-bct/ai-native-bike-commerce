(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const hero=document.querySelector('#hero'), video=hero.querySelector('video'), copy=hero.querySelector('.hx');
 const models=document.querySelector('#models'), cards=[...models.querySelectorAll('article')];
 const stores=document.querySelector('#stores'), map=stores.querySelector('.mapc'), list=stores.querySelector('.slist');
 const clamp=v=>Math.max(0,Math.min(1,v));
 let scheduled=false;
 function update(){
  scheduled=false;
  const h=innerHeight;
  const hp=clamp(-hero.getBoundingClientRect().top/hero.offsetHeight);
  video.style.transform=reduced.matches?'none':`translateY(${hp*120}px) scale(${1+hp*.08})`;
  copy.style.opacity=reduced.matches?1:1-clamp(hp*1.8);
  copy.style.translate=reduced.matches?'none':`0 ${hp*-80}px`;
  const r=models.getBoundingClientRect();
  cards.forEach((card,i)=>{const t=reduced.matches?1:clamp((h-r.top-140)/(h*.55));card.style.translate=`0 ${(1-t)*220}px`;card.style.opacity=clamp(t*2);});
  const sr=stores.getBoundingClientRect();
  const t=reduced.matches?1:clamp((h*.7-sr.top)/(h*.48));
  const offset=(stores.querySelector('.smap').clientWidth-map.offsetWidth)/2;
  map.style.transform=`translateX(${offset*(1-t)}px)`;
  list.style.transform=`translateX(${180*(1-t)}px)`;
  list.style.opacity=t;
  list.style.visibility=t===0?'hidden':'visible';
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
 const choosePaint=document.createElement('button');choosePaint.type='button';choosePaint.className='paint-choose-action';choosePaint.textContent='選擇你的塗裝';section.querySelector('.in').append(choosePaint);
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
  family=value;
  tabs.forEach(el=>{const active=el.textContent.trim().toLowerCase()===family;el.classList.toggle('on',active);el.setAttribute('aria-pressed',String(active));});
  tray.replaceChildren();
  catalog[family].forEach((paint,index)=>{const el=document.createElement('button');el.type='button';el.className='th9';el.setAttribute('aria-label',`${family.toUpperCase()} ${paint.label}`);el.title=paint.label;const img=new Image();img.src=paint.src;img.alt='';const label=document.createElement('b');label.textContent=paint.label;el.append(img,label);el.addEventListener('click',()=>{holdUntil=Date.now()+12000;selectPaint(index);});tray.append(el);});
  selectPaint(0);
 }
 tabs.forEach(el=>{el.setAttribute('role','button');el.addEventListener('click',e=>{e.preventDefault();holdUntil=Date.now()+12000;selectFamily(el.textContent.trim().toLowerCase());});el.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();el.click();}});});
 models.querySelectorAll('.model-link').forEach(link=>link.addEventListener('click',()=>selectFamily(link.closest('[data-family]').dataset.family)));
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;restart();},{threshold:.2}).observe(section);


 document.addEventListener('visibilitychange',restart);reducedMotion.addEventListener('change',()=>{motion?.cancel();restart();});
 choosePaint.addEventListener('click',()=>{
  const paint=catalog[family][selected];
  choosePaint.textContent=`已選擇 ${family.toUpperCase()}・${paint.label}`;
  choosePaint.classList.add('is-selected');
  clearTimeout(choosePaint._reset);
  choosePaint._reset=setTimeout(()=>{choosePaint.textContent='選擇你的塗裝';choosePaint.classList.remove('is-selected');},2200);
 });
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
 const section=document.querySelector('#parts'),parts=[...section.querySelectorAll('.pp10')];
 const panel=document.createElement('div');panel.className='parts-live-detail';panel.setAttribute('aria-live','polite');panel.innerHTML='<strong></strong><p></p>';section.querySelector('.phd9').append(panel);
 function update(){
  const part=parts.find(item=>item.classList.contains('hov'))||parts[0];
  const key=[...part.classList].find(name=>details[name]);
  panel.querySelector('strong').textContent=part.querySelector('.dc b').textContent;
  panel.querySelector('p').textContent=details[key];
  panel.classList.toggle('is-visible',parts.some(item=>item.classList.contains('hov')));
 }
 const observer=new MutationObserver(update);parts.forEach(part=>observer.observe(part,{attributes:true,attributeFilter:['class']}));update();
})();
