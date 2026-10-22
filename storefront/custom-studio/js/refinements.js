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
 const section=document.querySelector('#templates'), bike=section.querySelector('.bk9'), tray=section.querySelector('.trayin');
 bike.dataset.family='tcr';
 const counts={tcr:3,propel:3,defy:1,trinity:3};let family='tcr',selected=1,request=0;
 const tabs=[...section.querySelectorAll('.tab9')];
 function selectPaint(n){
  selected=n;const token=++request,src=`img/templates-cut/${family}-type${n}.webp`,label=`${family.toUpperCase()} TYPE ${n}`;
  tray.querySelectorAll('.th9').forEach((el,i)=>{el.classList.toggle('on',i===n-1);el.setAttribute('aria-pressed',String(i===n-1));});
  const asset=new Image();asset.onload=()=>{if(token!==request)return;bike.src=src;bike.alt=label;bike.dataset.family=family;if(!reduced.matches)bike.animate([{opacity:0,translate:'24px 0'},{opacity:1,translate:'0 0'}],{duration:420,easing:'cubic-bezier(.16,1,.3,1)'});};asset.src=src;
 }
 function selectFamily(value){
  family=value;tabs.forEach(el=>{const active=el.textContent.trim().toLowerCase()===family;el.classList.toggle('on',active);el.setAttribute('aria-pressed',String(active));});
  tray.replaceChildren();
  for(let n=1;n<=counts[family];n++){const el=document.createElement('a');el.href='#templates';el.className='th9';el.setAttribute('role','button');el.setAttribute('aria-label',`${family.toUpperCase()} TYPE ${n}`);el.innerHTML=`<img src="img/templates-cut/${family}-type${n}.webp" alt="${family.toUpperCase()} TYPE ${n}"><b>${family.toUpperCase()} TYPE ${n}</b>`;el.addEventListener('click',e=>{e.preventDefault();selectPaint(n);});el.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();selectPaint(n);}});tray.append(el);}
  selectPaint(1);
 }
 tabs.forEach(el=>{el.setAttribute('role','button');el.addEventListener('click',e=>{e.preventDefault();selectFamily(el.textContent.trim().toLowerCase());});});
 selectFamily(family);
 models.querySelectorAll('.model-link').forEach(link=>link.addEventListener('click',()=>{
  const familyName=link.closest('[data-family]').dataset.family;
  selectFamily(familyName);
 }));
})();
