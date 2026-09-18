
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
 if(step===1)$('checkoutBody').innerHTML='<fieldset><legend>取貨方式</legend>'+['門市取貨','宅配到府'].map(v=>`<label class="choice"><input type="radio" name="pickup" value="${v}" ${pickup===v?'checked':''}>${v}</label>`).join('')+'</fieldset><fieldset><legend>付款方式</legend>'+['門市付款','信用卡'].map(v=>`<label class="choice"><input type="radio" name="payment" value="${v}" ${payment===v?'checked':''} ${pickup==='宅配到府'&&v==='門市付款'?'disabled':''}>${v}</label>`).join('')+'</fieldset><p class="fine">此步驟僅記錄偏好，尚未收取費用；配送與付款可用方式以正式結帳為準。</p>';
 if(step===2)$('checkoutBody').innerHTML='<div class="done-mark">✓</div><h3>商品清單已備妥</h3><p class="fine">已保留你的選擇，尚未建立訂單或扣款。</p>'+cartRows(false)+`<div class="specs"><dl><dt>取貨方式</dt><dd>${pickup}</dd><dt>付款方式</dt><dd>${payment}</dd></dl></div><a class="btn" style="margin-top:20px" href="https://www.giant-bicycles.com/tw/stores" target="_blank" rel="noopener">聯繫門市完成購買 ↗</a>`;}
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
  const date=$('bkDate'),slot=$('bkSlot'),name=$('bkName'),phone=$('bkPhone'),email=$('bkEmail'),ack=$('bkAck');
  const checks=[
   [!date.value,'請選擇希望日期。',date],
   [!slot.value,'請選擇希望時段。',slot],
   [!name.value.trim(),'請填寫你的稱呼。',name],
   [!/^09\d{8}$/.test(phone.value.trim()),'請填寫 10 碼手機號碼，例如 0912345678。',phone],
   [!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()),'請填寫可收信的電子信箱。',email],
   [!ack.checked,'請先確認這是預約示範。',ack],
  ];
  const bad=checks.find(c=>c[0]);
  if(bad)return show('error',bad[1],bad[2]);
  show('ok','已記錄 '+$('bkStore').value+'　'+date.value+'　'+slot.value+' 的試乘示範，未建立真實預約。正式預約請聯繫門市。');
  toast('試騎預約示範已完成，未建立真實預約。');
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
