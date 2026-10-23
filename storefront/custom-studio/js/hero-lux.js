/* Turns the title drums one face at a time: 專屬 holds longest, then 塗裝, 車架, 零件, 簽名 and back. The count keeps
   increasing so the drums always roll the same way; five faces at 72° make a full turn. */
(() => {
 const drums=[...document.querySelectorAll('.hero-lux .drum')]; if(!drums.length||matchMedia('(prefers-reduced-motion: reduce)').matches) return;
 let k=0;
 const next=()=>{k++;drums.forEach(d=>d.style.setProperty('--k',k));setTimeout(next,k%5===0?3200:1800);};
 setTimeout(next,3200);
})();
