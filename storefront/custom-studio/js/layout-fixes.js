/* Responsive footer accordions and paint-dial geometry.
   The mobile mega menu is shared by storefront/js/header.js. */
(() => {
 const mobile=matchMedia('(max-width:900px)');
 const footer=document.getElementById('siteFooter');
 if(footer){
  [...footer.querySelectorAll('.foot-col,.foot-sub')].forEach(column=>{
   if(column.tagName==='DETAILS')return;
   const details=document.createElement('details');details.className=`foot-group ${column.classList.contains('foot-sub')?'foot-sub':'foot-col'}`;
   const summary=document.createElement('summary');summary.textContent=column.querySelector('b')?.textContent||'';
   const body=document.createElement('div');body.className='foot-group-body';
   [...column.children].forEach(child=>{if(child.tagName!=='B')body.append(child);});
   details.append(summary,body);column.replaceWith(details);
  });
  const syncFooter=()=>footer.querySelectorAll('.foot-group').forEach(group=>group.open=!mobile.matches);
  syncFooter();if(mobile.addEventListener)mobile.addEventListener('change',syncFooter);else if(mobile.addListener)mobile.addListener(syncFooter);
 }

 const dial=document.querySelector('.arc-showroom .tabs9');
 if(dial){
  const align=()=>{const radius=dial.clientWidth/2;dial.querySelectorAll('.tab9').forEach((tab,index)=>{const angle=[-54,-18,18,54][index]*Math.PI/180;tab.style.setProperty('--dial-x',`${radius+radius*Math.sin(angle)}px`);tab.style.setProperty('--dial-y',`${radius-radius*Math.cos(angle)}px`);});};
  if(window.ResizeObserver)new ResizeObserver(align).observe(dial);else addEventListener('resize',align);align();
 }
})();
