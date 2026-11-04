/* Dial geometry for the custom landing page (the mobile menu lives in storefront/js/header.js). */
(() => {
 const dial=document.querySelector('.arc-showroom .tabs9');
 if(dial){
  const align=()=>{const radius=dial.clientWidth/2;dial.querySelectorAll('.tab9').forEach((tab,index)=>{const angle=[-54,-18,18,54][index]*Math.PI/180;tab.style.setProperty('--dial-x',`${radius+radius*Math.sin(angle)}px`);tab.style.setProperty('--dial-y',`${radius-radius*Math.cos(angle)}px`);});};
  if(window.ResizeObserver)new ResizeObserver(align).observe(dial);else addEventListener('resize',align);align();
 }
})();
