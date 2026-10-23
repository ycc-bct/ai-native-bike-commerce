/* Scroll entrances preserve each screen's composition and existing GSAP transforms. */
(() => {
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const animations=new Set();
 const groups={
  hero:['.hx'],
  models:['.sh'],
  templates:['.sh9','.showroom-motion'],
  colors:['.stg','.cp'],
  parts:['.phd9'],
  stores:['.sh'],
  cta:['.tx','.cta>img']
 };
 /* 可選客製車款：跟首頁一樣淡入上浮、四張依序錯開；卡片裡的車圖從微放大回正、車名再晚一拍浮出 */
 function revealModels(section){
  const cards=[...section.querySelectorAll('.model-showcase')];
  const play=(el,frames,opts)=>{const a=el.animate(frames,{easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards',...opts});animations.add(a);a.onfinish=a.oncancel=()=>animations.delete(a);};
  cards.forEach((card,i)=>{
   const d=i*110;
   play(card,[{opacity:0,translate:'0 64px'},{opacity:1,translate:'0 0'}],{duration:900,delay:d});
   const art=card.querySelector('.model-art');if(art)play(art,[{scale:1.14},{scale:1}],{duration:1400,delay:d});
   const name=card.querySelector('.model-name');if(name)play(name,[{opacity:0,translate:'0 18px'},{opacity:1,translate:'0 0'}],{duration:700,delay:d+260});
  });
 }
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   observer.unobserve(entry.target);
   if(preference.matches)return;
   const selectors=groups[entry.target.id]||[];
   const targets=[...entry.target.querySelectorAll(selectors.join(','))];
   targets.forEach((target,index)=>{
    const animation=target.animate([
     {opacity:0,translate:target.classList.contains('showroom-motion')?'0 72px':'0 36px',scale:target.classList.contains('showroom-motion')?.86:1},
     {opacity:1,translate:'0 0',scale:1}
    ],{duration:target.classList.contains('showroom-motion')?850:680,delay:Math.min(index*65,260),easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
    animations.add(animation);
    animation.onfinish=animation.oncancel=()=>animations.delete(animation);
   });
  });
 },{rootMargin:'0px 0px -8% 0px',threshold:0});
 document.querySelectorAll('main>section').forEach(section=>observer.observe(section));
 /* 門市地圖與清單：留在原位，跟全頁一樣淡入上浮一次；地圖先、清單晚 0.15 秒 */
 const storeMap=document.querySelector('#stores .smap');
 if(storeMap){
  const storeIO=new IntersectionObserver(es=>es.forEach(e=>{
   if(!e.isIntersecting)return;storeIO.disconnect();if(preference.matches)return;
   [storeMap.querySelector('.mapc'),storeMap.querySelector('.slist')].forEach((el,i)=>{
    if(!el)return;
    const a=el.animate([{opacity:0,translate:'0 40px'},{opacity:1,translate:'0 0'}],{duration:800,delay:i*150,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
    animations.add(a);a.onfinish=a.oncancel=()=>animations.delete(a);
   });
  }),{threshold:.15});
  storeIO.observe(storeMap);
 }
 /* 車款卡片那一列本身露出 25% 才播，不跟著 section 標題一起提早觸發 */
 const modelRow=document.querySelector('#models .model-row');
 if(modelRow){
  const rowIO=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;rowIO.disconnect();if(!preference.matches)revealModels(document.getElementById('models'));}),{threshold:.25});
  rowIO.observe(modelRow);
 }
 preference.addEventListener('change',()=>{
  if(preference.matches){animations.forEach(animation=>animation.cancel());window.__timelines?.parts?.progress(1);}
 });
 document.querySelectorAll('a[href^="#"]').forEach(link=>{
  if(link.closest('.tabs9,.tray9'))return;
  const id=link.getAttribute('href').slice(1);
  if(!id)return;
  const target=document.getElementById(id);
  if(!target)return;
  link.addEventListener('click',event=>{
   event.preventDefault();
   target.scrollIntoView({behavior:preference.matches?'instant':'smooth',block:'start'});
   history.replaceState(null,'','#'+id);
  });
 });
})();

/* Parts labels become visible on the same timeline, after every part settles. */
(() => {
 const section=document.querySelector('#parts');
 const timeline=window.__timelines?.parts;
 if(!section||!timeline)return;
 timeline.call(()=>section.classList.add('parts-ready'));
})();
