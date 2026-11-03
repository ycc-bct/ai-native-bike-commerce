/* Dial geometry for the custom landing page (the mobile menu lives in storefront/js/header.js). */
(() => {
 const dial=document.querySelector('.arc-showroom .tabs9');
 if(dial){
  const align=()=>{const r=dial.clientWidth/2;dial.querySelectorAll('.tab9').forEach((tab,i)=>{const angle=[-54,-18,18,54][i]*Math.PI/180;tab.style.setProperty('--dial-x',`${r+r*Math.sin(angle)}px`);tab.style.setProperty('--dial-y',`${r-r*Math.cos(angle)}px`);});};
  new ResizeObserver(align).observe(dial);align();
 }
})();
