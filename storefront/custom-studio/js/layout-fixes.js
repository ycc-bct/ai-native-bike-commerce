/* Responsive navigation and dial geometry for the custom landing page. */
(() => {
 const host=document.getElementById('siteHeader');
 if(host){
  const button=document.createElement('button');button.className='studio-menu-toggle';button.type='button';button.setAttribute('aria-label','開啟主選單');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','studio-mobile-menu');button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  const panel=document.createElement('nav');panel.id='studio-mobile-menu';panel.setAttribute('aria-label','手機主選單');panel.hidden=true;
  host.querySelectorAll('.links .top').forEach(link=>{
   const a=link.cloneNode(true);a.removeAttribute('style');a.removeAttribute('data-top');
   const dropdown=host.querySelector('.dd[data-dd="'+link.dataset.top+'"]');
   if(dropdown){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=link.textContent;details.append(summary);dropdown.querySelectorAll('.dd-list a').forEach(item=>details.append(item.cloneNode(true)));panel.append(details);}
   else {if(link.dataset.top==='stores')a.href='#stores';panel.append(a);}
  });
  ['搜尋','會員'].forEach(label=>{const original=host.querySelector('.icons [aria-label="'+label+'"]');if(!original)return;const proxy=document.createElement('button');proxy.type='button';proxy.textContent=label;proxy.addEventListener('click',()=>{close();original.click();});panel.append(proxy);});
  host.prepend(button);host.append(panel);
  function close(){panel.hidden=true;button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','開啟主選單');}
  button.addEventListener('click',()=>{const open=panel.hidden;panel.hidden=!open;button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'關閉主選單':'開啟主選單');});
  panel.addEventListener('click',e=>{if(e.target.closest('a'))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){close();button.focus();}});
  document.addEventListener('click',e=>{if(!host.contains(e.target))close();});
 }
 const dial=document.querySelector('.arc-showroom .tabs9');
 if(dial){
  const align=()=>{const r=dial.clientWidth/2;dial.querySelectorAll('.tab9').forEach((tab,i)=>{const angle=[-54,-18,18,54][i]*Math.PI/180;tab.style.setProperty('--dial-x',`${r+r*Math.sin(angle)}px`);tab.style.setProperty('--dial-y',`${r-r*Math.cos(angle)}px`);});};
  new ResizeObserver(align).observe(dial);align();
 }
})();
