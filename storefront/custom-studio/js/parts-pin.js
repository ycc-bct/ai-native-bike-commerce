/* 六大零件規格 on narrow screens / zoomed desktop (<=900px CSS width), v2 2026-10-30, v3 scroll-only.
   The section is one pinned screen: its stage (.in) is sticky and scrolling steps through the six parts.
   Each step reuses the desktop interaction: it sends the part the same pointerenter the desktop hover sends,
   so the inline script highlights it (.hov / .has-focus), parts-draw.js shows its pencil sketch and
   refinements.js fills the info card (.pd-strip) with name, spec and description.
   The 1440x900 stage stays at one scale and position throughout the mobile sequence. */
(() => {
 const sec=document.getElementById('parts');if(!sec)return;
 const stage=sec.querySelector('.in'),items=[...sec.querySelectorAll('.pp10')],N=items.length;if(!stage||!N)return;
 const mq=matchMedia('(max-width:900px)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const tl=window.__timelines&&window.__timelines.parts;


 /* v3: no buttons; scrolling alone walks through the parts. A quiet, non-interactive progress cue (six dots)
    and one scroll-snap point per step (snap-stop: always, so a flick can't skip a part). */
 const steps=document.createElement('div');steps.className='pp-dots';steps.setAttribute('aria-hidden','true');
 items.forEach(()=>steps.append(document.createElement('i')));
 stage.append(steps);
 items.forEach((_,i)=>{const m=document.createElement('i');m.className='pp-snap';m.style.setProperty('--i',i);m.setAttribute('aria-hidden','true');sec.prepend(m);});
 {const e=document.createElement('i');e.className='pp-snap pp-end';e.setAttribute('aria-hidden','true');sec.append(e);} /* end of the pinned range = next section's start */
 let cur=-1,ready=!tl||tl.progress()===1,wrap=null;
 const stepLen=()=>Math.max(1,(sec.offsetHeight-stage.offsetHeight)/(N-1));
 const stepNow=()=>Math.max(0,Math.min(N-1,Math.round(-sec.getBoundingClientRect().top/stepLen())));

 /* frame extents in 1440x900 stage coordinates (wheels, saddle, bar) and each part's sketch box */
 const X0=300,X1=1135,Y0=118,Y1=712;
 function fit(w){
  wrap=w||wrap||sec.querySelector('.pd-stage');if(!wrap)return;
  if(!mq.matches){return;}
  const W=stage.clientWidth,head=sec.querySelector('.phd9');
  // Reserve a constant caption area so different text lengths never resize the bicycle.
  const top=head.offsetTop+head.offsetHeight+12,bottom=stage.clientHeight-168;
  const pad=16,k=Math.min(1,(W-2*pad)/(X1-X0),Math.max(80,bottom-top)/(Y1-Y0));
  let tx=W/2-k*(X0+X1)/2;
  const ty=top+((bottom-top)-k*(Y1-Y0))/2-k*Y0;
  wrap.style.transformOrigin='0 0';
  wrap.style.transform=`translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) scale(${k.toFixed(4)})`;
 }
 /* the info card lives in the sticky stage on narrow screens, back on the section on desktop */
 function place(){
  const strip=sec.querySelector('.pd-strip');if(!strip)return;
  if(mq.matches){if(strip.parentNode!==stage)stage.insertBefore(strip,steps);}
  else if(strip.parentNode!==sec){sec.appendChild(strip);}
 }
 function mark(s){[...steps.children].forEach((b,i)=>b.classList.toggle('on',i===s));}
 function apply(force){
  if(!mq.matches)return;
  if(!ready){ready=!tl||tl.progress()===1;if(!ready)return;}
  const s=stepNow();if(s===cur&&!force)return;cur=s;
  items[s].dispatchEvent(new PointerEvent('pointerenter'));mark(s);
 }
 function go(i){
  const y=sec.getBoundingClientRect().top+scrollY+i*stepLen();
  scrollTo({top:Math.round(y),behavior:reduced.matches?'auto':'smooth'});
 }
 /* taps on the drawing go to that part's step instead of the desktop pin/unpin toggle */
 sec.addEventListener('click',e=>{if(!mq.matches)return;const it=e.target.closest('.pp10');if(it){e.preventDefault();e.stopPropagation();go(items.indexOf(it));}},true);
 /* the desktop "click empty space = show all" resets focus; in pinned mode the current step stays highlighted */
 sec.addEventListener('partchange',e=>{if(mq.matches&&ready&&e.detail===-1){cur=-1;requestAnimationFrame(()=>apply(true));}});
 if(tl)tl.then(()=>{ready=true;apply(true);});
 /* Disable page snapping while the pinned range is visible, avoiding scroll corrections between parts. */
 const root=document.documentElement,phone=matchMedia('(max-width:600px)');
 function snapMode(){const r=sec.getBoundingClientRect(),vh=innerHeight;
  root.classList.toggle('pp-snapping',mq.matches&&(phone.matches?(r.top<vh-1&&r.bottom>1):(r.top<=1&&r.bottom>1)));}
 let raf=0;const onScroll=()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;snapMode();apply(false);});};
 addEventListener('scroll',onScroll,{passive:true});
 addEventListener('resize',()=>{place();fit();apply(true);});
 mq.addEventListener('change',()=>{place();cur=-1;if(mq.matches){fit();apply(true);}else{const w=sec.querySelector('.pd-stage');w&&dispatchEvent(new Event('resize'));}});
 /* Native scrolling owns position; no settling scrollTo corrections. */
 window.PartsPin={fit,go,step:()=>cur};
 place();fit();snapMode();apply(true);
})();
