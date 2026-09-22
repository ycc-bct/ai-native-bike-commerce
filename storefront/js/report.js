
'use strict';
const $=id=>document.getElementById(id),money=n=>'NT$ '+n.toLocaleString('en-US');
const gear=[{id:'revolt',name:'Revolt Advanced SL 0',price:308000,reason:'',image:'img/bikes/revolt-lg.webp'},{id:'cage',name:'AIRWAY LITE 超輕量碳纖維水壺架',price:1100,reason:'固定水壺，方便途中補水。'},{id:'bottle',name:'氣閥水壺 750 C.C.',price:300,reason:'山路與碎石路段的隨身補水。'},{id:'toptube',name:'Scout 大容量上管袋',price:1580,reason:'收納補給與隨身小物。'}];
gear.push(
 {id:'pump',name:'CONTROL MINI COMBO 迷你打氣筒',price:600,reason:'途中補氣，便於調整胎壓。',reserve:true},
 {id:'ratchet',name:'迷你棘輪工具 MULTI-TOOL WITH RATCHET SYSTEM',price:600,reason:'攜帶工具，處理途中簡單調整。',reserve:true},
 {id:'sealant',name:'GIANT TIRE SEALANT 補胎液 16OZ',price:1100,reason:'無內胎保養補給，使用前確認輪胎需求。',reserve:true},
 {id:'light',name:'RECON HL 1400 智能充電前燈',price:3280,reason:'為光線較暗的路段準備照明。',reserve:true},
 {id:'radar',name:'Garmin Varia RTL515 智慧雷達尾燈',price:6990,reason:'留意後方來車，使用前確認配對裝置。',reserve:true},
 {id:'lock',name:'Flex Combo+ 號碼鎖',price:550,reason:'短暫停留時的隨車鎖具。',reserve:true}
);
const quantities=Object.fromEntries(gear.map(g=>[g.id,1])),selected=new Set(['revolt']);let cart={},step=0,pickup='門市取貨',payment='門市付款',toastTimer;
function save(){try{localStorage.setItem('giant-report-cart',JSON.stringify(cart));}catch{}$('cartCount').textContent=Object.values(cart).reduce((a,b)=>a+b,0);}
function toast(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,2600);}
function renderGear(){const focus=document.activeElement?.dataset.focus;
 $('equipmentGrid').innerHTML=gear.filter(g=>!g.reserve||selected.has(g.id)).map(g=>`<article class="${selected.has(g.id)?'selected':''}"><div class="image"><img src="${g.image||`img/pdp/acc-${g.id}.webp`}" alt="${g.name}"><label><input type="checkbox" data-select="${g.id}" data-focus="select-${g.id}" ${selected.has(g.id)?'checked':''}>加入清單</label></div><div class="info"><h3>${g.name}</h3><p class="reason">${g.reason}</p><div class="price-line"><strong>${money(g.price)}</strong><div class="quantity"><button type="button" data-qty="${g.id}" data-delta="-1" data-focus="minus-${g.id}" aria-label="減少${g.name}數量" ${quantities[g.id]===1?'disabled':''}>−</button><span>${quantities[g.id]}</span><button type="button" data-qty="${g.id}" data-delta="1" data-focus="plus-${g.id}" aria-label="增加${g.name}數量" ${quantities[g.id]===9?'disabled':''}>+</button></div></div></div></article>`).join('');
 const total=gear.reduce((sum,g)=>sum+(selected.has(g.id)?g.price*quantities[g.id]:0),0),count=[...selected].reduce((sum,id)=>sum+quantities[id],0);
 $('selectionCount').textContent='已選 '+count+' 件商品';$('selectionTotal').textContent=money(total);$('addToCart').disabled=$('checkoutSelected').disabled=!count;$('selectAll').textContent=gear.filter(g=>!g.reserve).every(g=>selected.has(g.id))?'取消全選':'全選商品';if(focus)document.querySelector(`[data-focus="${focus}"]`)?.focus({preventScroll:true});}
$('equipmentGrid').addEventListener('change',e=>{const id=e.target.dataset.select;if(id){e.target.checked?selected.add(id):selected.delete(id);renderGear();}});
$('equipmentGrid').addEventListener('click',e=>{const b=e.target.closest('[data-qty]');if(b){quantities[b.dataset.qty]=Math.max(1,Math.min(9,quantities[b.dataset.qty]+Number(b.dataset.delta)));renderGear();}});
$('selectAll').onclick=()=>{if(gear.filter(g=>!g.reserve).every(g=>selected.has(g.id)))selected.clear();else gear.filter(g=>!g.reserve).forEach(g=>selected.add(g.id));renderGear();};
function addCart(){selected.forEach(id=>cart[id]=quantities[id]);save();}
$('addToCart').onclick=()=>{addCart();toast('已加入購物車，商品清單已保留。');};
$('checkoutSelected').onclick=()=>{addCart();location.hash='checkout';};$('openCart').onclick=()=>location.hash='checkout';$('printReport').onclick=()=>window.print();
function cartRows(removable){return gear.filter(g=>cart[g.id]).map(g=>`<div class="cart-row"><img src="${g.image||`img/pdp/acc-${g.id}.webp`}" alt="${g.name}"><div><h3>${g.name}</h3><p>${money(g.price)} × ${cart[g.id]}</p>${removable?`<button class="text-button" data-remove="${g.id}">移除</button>`:''}</div><strong>${money(g.price*cart[g.id])}</strong></div>`).join('');}
function renderCheckout(){refreshAccessorySuggestions();const count=Object.values(cart).reduce((a,b)=>a+b,0),total=gear.reduce((sum,g)=>sum+g.price*(cart[g.id]||0),0);$('orderCount').textContent=count+' 件商品';$('orderTotal').textContent=money(total);$('checkoutSteps').innerHTML=['確認清單','取貨與付款','清單備妥'].map((s,i)=>`<li class="${step===i?'current':''}" ${step===i?'aria-current="step"':''}><b>${i+1}</b>${s}</li>`).join('');$('checkoutTitle').textContent=['確認你的商品清單','選擇取貨與付款方式','下一次出發，準備好了。'][step];$('checkoutBack').hidden=step!==1;$('checkoutNext').disabled=!count;$('checkoutNext').textContent=['前往取貨與付款','確認結帳','返回騎乘報告'][step];
 $('checkoutBody').classList.toggle('is-empty',!count);
 if(!count){$('checkoutBody').innerHTML='<h3>購物車目前沒有商品</h3><p class="fine">回到報告，挑選適合這次旅程的裝備。</p><a class="btn" href="#equipment">挑選商品</a>';return;}
 if(step===0)$('checkoutBody').innerHTML='<h3>你的商品</h3>'+cartRows(true);
 if(step===1)$('checkoutBody').innerHTML='<fieldset><legend>取貨方式</legend>'+['門市取貨','宅配到府'].map(v=>`<label class="choice"><input type="radio" name="pickup" value="${v}" ${pickup===v?'checked':''}>${v}</label>`).join('')+'</fieldset><fieldset><legend>付款方式</legend>'+['門市付款','信用卡'].map(v=>`<label class="choice"><input type="radio" name="payment" value="${v}" ${payment===v?'checked':''} ${pickup==='宅配到府'&&v==='門市付款'?'disabled':''}>${v}</label>`).join('')+'</fieldset>';
 if(step===2)$('checkoutBody').innerHTML='<div class="done-mark">✓</div><h3>商品清單已備妥</h3><p class="fine">門市會與你聯繫，確認取貨時間。</p>'+cartRows(false)+`<div class="specs"><dl><dt>取貨方式</dt><dd>${pickup}</dd><dt>付款方式</dt><dd>${payment}</dd></dl></div><a class="btn" style="margin-top:20px" href="https://www.giant-bicycles.com/tw/stores" target="_blank" rel="noopener">聯繫門市完成購買 ↗</a>`;}
$('checkoutBody').onclick=e=>{const button=e.target.closest('[data-remove]');if(button){delete cart[button.dataset.remove];save();renderCheckout();}};
$('checkoutBody').onchange=e=>{if(e.target.name==='pickup'){pickup=e.target.value;if(pickup==='宅配到府')payment='信用卡';renderCheckout();}else if(e.target.name==='payment')payment=e.target.value;};
$('checkoutNext').onclick=()=>{if(step===2){location.hash='equipment';return;}step++;renderCheckout();if(step===2){cart={};selected.clear();for(const g of gear)quantities[g.id]=1;save();renderGear();}$('checkoutTitle').setAttribute('tabindex','-1');$('checkoutTitle').focus();};$('checkoutBack').onclick=()=>{step=0;renderCheckout();};
function route(){const checkout=location.hash==='#checkout';$('report').hidden=checkout;$('checkout').hidden=!checkout;$('purchaseBar').hidden=checkout;if(checkout){step=0;renderCheckout();window.scrollTo(0,0);}else if(location.hash==='#equipment')requestAnimationFrame(()=>$('equipment').scrollIntoView());}
window.addEventListener('hashchange',route);save();renderGear();route();


function syncCartSelection(){selected.clear();for(const g of gear){quantities[g.id]=cart[g.id]||1;if(cart[g.id])selected.add(g.id);}save();renderGear();renderCheckout();}
// Offer accessories only after the customer reaches checkout with a bike alone.
var accessoryOfferActive,accessoryOfferDismissed;
function refreshAccessorySuggestions(){
 const box=$('checkoutRecommend');if(!box)return;
 const bikeOnly=cart.revolt>0&&!gear.some(g=>g.id!=='revolt'&&cart[g.id]);
 if(step===0&&bikeOnly&&!accessoryOfferDismissed)accessoryOfferActive=true;
 box.hidden=Boolean(step!==0||!cart.revolt||!accessoryOfferActive||accessoryOfferDismissed||!gear.some(g=>g.id!=='revolt'&&!cart[g.id]));
 if(box.hidden)return;
 $('accessorySuggestions').innerHTML=gear.filter(g=>g.id!=='revolt'&&!cart[g.id]).slice(0,3).map(g=>`<article><div class="suggestion-photo"><img src="img/pdp/acc-${g.id}.webp" alt="${g.name}"></div><h3>${g.name}</h3><strong>${money(g.price)}</strong><p>${g.reason}</p><button class="btn secondary" type="button" data-suggest-add="${g.id}" ${cart[g.id]?'disabled':''}>${cart[g.id]?'已加入清單':'加入清單'}</button></article>`).join('');
}
$('skipAccessories').onclick=()=>{accessoryOfferDismissed=true;refreshAccessorySuggestions();};
$('accessorySuggestions').onclick=e=>{
 const button=e.target.closest('[data-suggest-add]');if(!button)return;
 const item=gear.find(g=>g.id===button.dataset.suggestAdd&&g.id!=='revolt');if(!item||cart[item.id])return;
 cart={...cart,[item.id]:1};syncCartSelection();
 $('accessoryAdded').textContent='已加入 '+item.name+'，結帳金額已更新。';
 const next=$('accessorySuggestions').querySelector('button:not(:disabled)');if(next)next.focus({preventScroll:true});else $('checkoutNext').focus({preventScroll:true});
};
refreshAccessorySuggestions();

// Demo-only store test-ride booking. Nothing is submitted anywhere.
(function(){
 const form=$('bookingForm');if(!form)return;
 const note=$('bkNote');
 const show=(state,text,focusEl)=>{note.dataset.state=state;note.textContent=text;note.hidden=false;if(focusEl)focusEl.focus({preventScroll:false});};
 form.addEventListener('submit',e=>{
  e.preventDefault();
  const date=$('bkDate'),slot=$('bkSlot'),name=$('bkName'),phone=$('bkPhone'),email=$('bkEmail');
  const checks=[
   [!date.value,'請選擇希望日期。',date],
   [!slot.value,'請選擇希望時段。',slot],
   [!name.value.trim(),'請填寫你的稱呼。',name],
   [!/^09\d{8}$/.test(phone.value.trim()),'請填寫 10 碼手機號碼，例如 0912345678。',phone],
   [!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()),'請填寫可收信的電子信箱。',email],
  ];
  const bad=checks.find(c=>c[0]);
  if(bad)return show('error',bad[1],bad[2]);
  show('ok','已記錄 '+$('bkStore').value+'　'+date.value+'　'+slot.value+' 的試乘預約，門市會與你確認。');
  toast('試騎預約已送出。');
 });
 form.addEventListener('input',()=>{if(note.dataset.state==='error')note.hidden=true;});
})();

// Tips（共用元件 js/tips.js）：這頁提供的示範動作
window.Tips&&Tips.register('report',function(){
 if(location.hash==='#checkout'){location.hash='';}
 requestAnimationFrame(function(){
  Tips.close();
  // 勾上建議配件，讓金額當場跳動——這一項要看得出「勾選後可直接結帳」
  var picks=gear.filter(function(g){return !g.reserve;});
  picks.forEach(function(g){selected.add(g.id);});
  renderGear();
  $('equipment').scrollIntoView({behavior:'smooth',block:'start'});
 });
});

// 章節導覽的目前段落：product.html 的分頁有 .on 狀態，這裡用捲動位置推
(function(){
 const nav=document.querySelector('.section-nav');if(!nav)return;
 const links=[...nav.querySelectorAll('a[href^="#"]')];
 const targets=links.map(a=>({a,el:document.getElementById(a.getAttribute('href').slice(1))})).filter(t=>t.el);
 const sync=()=>{
  const line=nav.getBoundingClientRect().bottom+1;
  let current=null;
  for(const t of targets){if(t.el.hidden)continue;
   if(t.el.getBoundingClientRect().top<=line)current=t;}
  if(!current)current=targets.find(t=>!t.el.hidden)||null;
  links.forEach(a=>a.classList.toggle('on',!!current&&a===current.a));
 };
 addEventListener('scroll',sync,{passive:true});
 addEventListener('resize',sync);
 sync();
})();

/* ───────── 結帳情境的選車顧問 ─────────
   開關與推移比照 product.html：body 加 adv-open，內容往左推，面板從右側出現。
   回答只用這一頁已有的資料：配件清單與價格、結帳流程的取貨與付款選項、目前選取金額。
   PROMO 是為了 demo 放的檔期，正式上線要換成真實活動。 */
const PROMO={name:'秋季整備優惠',detail:'配件任選三件，第三件五折；到門市取車再送一次基礎調校。',until:'2026-11-30'};
let advStarted=false,advAnim=false;
function advMsg(text,who){
 const log=$('advLog');if(!log)return;
 const d=document.createElement('div');d.className='am '+(who==='me'?'me':'ai');d.textContent=text;
 log.appendChild(d);log.scrollTop=log.scrollHeight;
}
function advAccessoryAnswer(){
 const rest=gear.filter(g=>g.id!=='revolt'&&!selected.has(g.id));
 if(!rest.length)return '建議的配件你都選了，直接結帳就可以。';
 const list=rest.slice(0,3).map(g=>`${g.name} ${money(g.price)}`).join('、');
 return `這趟是山路與碎石路，先準備補水與收納最實用：${list}。`;
}
function advTotalAnswer(){
 const count=[...selected].reduce((s,id)=>s+quantities[id],0);
 const total=gear.reduce((s,g)=>s+(selected.has(g.id)?g.price*quantities[g.id]:0),0);
 return `目前選了 ${count} 件，合計 ${money(total)}。`;
}
function advAnswer(q){
 const t=(q||'').trim();if(!t)return null;
 if(/配件|裝備|要買|加購|推薦/.test(t))return advAccessoryAnswer();
 if(/折扣|優惠|活動|促銷|檔期|便宜/.test(t))return `${PROMO.name}：${PROMO.detail}活動到 ${PROMO.until}。`;
 if(/結帳|付款|信用卡|分期/.test(t))return '付款可選門市付款或信用卡。選宅配到府時會自動切成信用卡。';
 if(/取貨|宅配|運費|到府|門市拿/.test(t))return '取貨可選門市取貨或宅配到府，兩種都在結帳的第二步選。';
 if(/多少|總共|金額|合計|價格/.test(t))return advTotalAnswer();
 if(/尺寸|身高|幾何|重量|規格/.test(t))return '車架尺寸與規格要看車款頁，這裡主要處理配件與結帳。';
 return null;
}
function advAsk(q){
 advMsg(q,'me');
 const a=advAnswer(q)||'這裡可以回答配件建議、活動折扣、結帳與取貨，以及目前選取的金額。';
 setTimeout(()=>advMsg(a,'ai'),280);
}
function advGreet(){
 advMsg('車已經幫你整理好了。配件、折扣或結帳有問題都可以問我。','ai');
}
function openAdvisor(){
 const a=$('advisor');if(!a||advAnim||!a.hidden)return;
 if(window.Tips)Tips.close();
 a.hidden=false;a.classList.add('on');document.body.classList.add('adv-open');
 advAnim=true;
 advisorGenie(a,$('advLog'),$('aiOrb'),'out',()=>{
  advAnim=false;if(!advStarted){advStarted=true;advGreet();}
  $('advInput').focus({preventScroll:true});
 });
}
function closeAdvisor(){
 const a=$('advisor');if(!a||advAnim||a.hidden)return;
 advAnim=true;document.body.classList.remove('adv-open');
 advisorGenie(a,$('advLog'),$('aiOrb'),'in',()=>{a.classList.remove('on');a.hidden=true;advAnim=false;});
}
if($('advisor')){
 const toggle=()=>$('advisor').hidden?openAdvisor():closeAdvisor();
 $('aiOrb').onclick=toggle;
 $('advClose').onclick=closeAdvisor;
 $('advQuick').onclick=e=>{const b=e.target.closest('[data-q]');if(!b)return;advAsk(b.textContent.trim());};
 $('advForm').addEventListener('submit',e=>{
  e.preventDefault();const i=$('advInput');const v=i.value.trim();if(!v)return;
  advAsk(v);i.value='';i.focus({preventScroll:true});
 });
 addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('advisor').hidden)closeAdvisor();});
}
