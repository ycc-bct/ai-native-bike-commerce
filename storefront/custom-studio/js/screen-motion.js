/* Scroll entrances preserve each screen's composition and existing GSAP transforms. */
(() => {
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const animations=new Set();
 const groups={
  hero:['.hx'],
  models:['.sh'],
  templates:['.sh9','.paint-craft'],
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
 /* 車款客製化塗裝：車子淡入上升 → 弧線從 TCR 那端往右畫出、車款名稱依序出現 → 色票由小變大跳出 → 最後「開始客製」 */
 try{CSS.registerProperty({name:'--sweep',syntax:'<angle>',inherits:true,initialValue:'360deg'})}catch(e){}
 function revealArc(section){
  const play=(el,frames,opts)=>{if(!el)return null;const a=el.animate(frames,{easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards',...opts});animations.add(a);a.onfinish=a.oncancel=()=>animations.delete(a);return a;};
  const arc=section.querySelector('.tabs9');
  play(section.querySelector('.paint-display'),[{opacity:0,translate:'0 28px'},{opacity:1,translate:'0 0'}],{duration:750,delay:80});
  if(arc){arc.classList.add('arc-draw');const d=play(arc,[{'--sweep':'0deg'},{'--sweep':'180deg'}],{duration:900,delay:300,easing:'cubic-bezier(.45,0,.2,1)'});
   const done=()=>arc.classList.remove('arc-draw');if(d){d.addEventListener('finish',done);d.addEventListener('cancel',done)}else done();}
  /* 車款名稱沿著弧線的弧度，從左側滑到定位並淡入；時間跟弧線畫到該位置同步 */
  if(arc){const A=arc.getBoundingClientRect(),R=A.width/2,cx=A.left+R,cy=A.top+R;
   section.querySelectorAll('.tab9').forEach(t=>{const r=t.getBoundingClientRect(),x=r.left+r.width/2-cx,y=r.top+r.height/2-cy,dist=Math.hypot(x,y),ang=Math.atan2(y,x);
    const sweep=Math.min(1,Math.max(0,(ang*180/Math.PI+180)/180)),back=16*Math.PI/180,frames=[];
    /* 名稱本身已有 CSS translate（沿弧線擺位），動畫要在它上面加，不能蓋掉 */
    const base=(getComputedStyle(t).translate||'0px 0px').split(' ').map(v=>parseFloat(v)||0),bx=base[0],by=base[1]||0;
    for(let k=0;k<=8;k++){const p=k/8,a=ang-back*(1-p);frames.push({opacity:Math.min(1,p*1.6),translate:`${(bx+Math.cos(a)*dist-x).toFixed(1)}px ${(by+Math.sin(a)*dist-y).toFixed(1)}px`})}
    play(t,frames,{duration:620,delay:240+sweep*820,easing:'cubic-bezier(.22,1,.36,1)'});});}
  section.querySelectorAll('.tray9 .th9').forEach(b=>play(b,[{opacity:0},{opacity:1}],{duration:500,delay:1150}));
  play(section.querySelector('.paint-start'),[{opacity:0,translate:'-50% 8px'},{opacity:1,translate:'-50% 0'}],{duration:450,delay:1400});
 }
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   observer.unobserve(entry.target);
   if(preference.matches)return;
   if(entry.target.id==='templates')revealArc(entry.target);
   if(entry.target.id==='cta'){const c=entry.target.querySelector('.cta');if(c)requestAnimationFrame(()=>c.classList.add('lit'));}
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
 /* 「從碳纖維車架開始」：車架先藏在黑暗裡（.pre），捲到時加 .lit 由上往下打亮；減少動態就直接顯示 */
 {const c=document.querySelector('#cta .cta');if(c&&!preference.matches)c.classList.add('pre');}
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
