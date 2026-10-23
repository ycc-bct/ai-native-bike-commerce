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
