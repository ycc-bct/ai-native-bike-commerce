/* Mobile parts: one screen, one fixed bicycle, explicit part selection. */
(() => {
 const sec=document.getElementById('parts');if(!sec)return;
 const stage=sec.querySelector('.in'),items=[...sec.querySelectorAll('.pp10')];if(!stage||!items.length)return;
 const mq=matchMedia('(max-width:900px)'),tl=window.__timelines?.parts;
 const controls=document.createElement('div');controls.className='parts-selector';controls.setAttribute('role','group');controls.setAttribute('aria-label','選擇零件');
 const names=['坐墊','飛輪','大齒盤','豎桿','車把手','前後輪組'];
 [-1,1].forEach(direction=>{const b=document.createElement('button');b.type='button';b.dataset.direction=direction;b.addEventListener('click',e=>{e.stopPropagation();select((cur+direction+items.length)%items.length);});controls.append(b);});
 stage.append(controls);
 let cur=0,wrap=null;
 function select(i){
  cur=Math.max(0,Math.min(items.length-1,i));if(!mq.matches)return;
  items.forEach((item,k)=>item.classList.toggle('hov',k===cur));
  sec.classList.add('has-focus');sec.classList.toggle('wheel-on',items[cur].classList.contains('p-wheel'));
  [...controls.children].forEach(b=>{const d=Number(b.dataset.direction),name=names[(cur+d+items.length)%items.length],label=d<0?'上一個':'下一個';b.setAttribute('aria-label',`${label}零件：${name}`);b.innerHTML=`<span class="part-neighbor">${label}・${name}</span><span class="part-arrow" aria-hidden="true">${d<0?'←':'→'}</span>`;});
  sec.dispatchEvent(new CustomEvent('partchange',{detail:cur}));
 }
 function fit(w){
  wrap=w||wrap||sec.querySelector('.pd-stage');if(!wrap||!mq.matches)return;
  const head=sec.querySelector('.phd9'),top=head.offsetTop+head.offsetHeight+16;
  const bottom=sec.querySelector('.pd-strip').offsetTop-16,W=stage.clientWidth;
  const X0=300,X1=1135,Y0=118,Y1=712;
  const k=Math.min(1,(W-32)/(X1-X0),Math.max(80,bottom-top)/(Y1-Y0));
  const tx=W/2-k*(X0+X1)/2,ty=top+((bottom-top)-k*(Y1-Y0))/2-k*Y0;
  wrap.style.transformOrigin='0 0';wrap.style.transform=`translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) scale(${k.toFixed(4)})`;
 }
 function place(){
  const strip=sec.querySelector('.pd-strip');if(!strip)return;
  if(mq.matches){if(strip.parentNode!==stage)stage.append(strip);}
  else if(strip.parentNode!==sec)sec.append(strip);
 }
 // Prevent the desktop blank-area click handler from resetting mobile selection.
 sec.addEventListener('click',e=>{if(mq.matches&&!e.target.closest('.parts-selector'))e.stopPropagation();},true);
 const resize=()=>{place();fit();};
 addEventListener('resize',resize);document.fonts?.ready.then(resize);
 mq.addEventListener('change',()=>{resize();if(mq.matches)select(cur);else dispatchEvent(new Event('resize'));});
 if(tl)tl.then(()=>{if(mq.matches){fit();select(cur);}});
 window.PartsPin={fit,go:select,step:()=>cur};
 place();fit();select(cur);
})();
