
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
const quantities=Object.fromEntries(gear.map(g=>[g.id,1])),selected=new Set();let cart={},step=0,pickup='門市取貨',payment='門市付款',toastTimer;
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
const reportGeometry=[
  ['A','座(立)管長','430mm','450mm','470mm','490mm'],
  ['B','座(立)管角度','75.0°','74.5°','74.5°','74.0°'],
  ['C','上管長度','530mm','540mm','550mm','565mm'],
  ['D','頭管長度','90mm','100mm','120mm','135mm'],
  ['E','頭管角度','70.5°','71.0°','71.5°','72.0°'],
  ['F','前叉偏移量','—','—','—','—'],
  ['G','Trail','78mm','74mm','71mm','67mm'],
  ['H','前後輪距','1026mm','1027mm','1033mm','1039mm'],
  ['I','後下叉長度','433mm','433mm','433mm','433mm'],
  ['J','五通下降高度','80mm','80mm','80mm','80mm'],
  ['K','頭碗至五通高度（Stack）','525mm','536mm','557mm','573mm'],
  ['L','頭碗至五通長度（Reach）','389mm','391mm','395mm','401mm'],
  ['M','上管至地面高度','726mm','743mm','762mm','779mm'],
  ['N','把手寬','380mm','380mm','400mm','400mm'],
  ['O','龍頭長度','70mm','80mm','90mm','100mm'],
  ['P','曲柄長度','165mm','165mm','170mm','170mm'],
  ['Q','輪組尺寸','700C','700C','700C','700C'],
];
let geometryExpanded=false;
function renderGeometry(){const sizes=['XS','S','M','ML'],active=sizes.indexOf($('size').value);$('geometryTable').innerHTML='<thead><tr><th>圖示 / 幾何項目</th>'+sizes.map((x,i)=>`<th class="${i===active?'hit':''}">${x}</th>`).join('')+'</tr></thead><tbody>'+(geometryExpanded?reportGeometry:reportGeometry.slice(0,Math.ceil(reportGeometry.length/2))).map(r=>'<tr><td><span class="geo-key">'+r[0]+'</span>'+r[1]+'</td>'+r.slice(2).map((x,i)=>`<td class="${i===active?'hit':''}">${x}</td>`).join('')+'</tr>').join('')+'</tbody>';}
$('size').onchange=renderGeometry;
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
window.addEventListener('hashchange',route);save();renderGear();renderGeometry();route();

$('geometryToggle').onclick=()=>{geometryExpanded=!geometryExpanded;renderGeometry();$('geometryToggle').setAttribute('aria-expanded',String(geometryExpanded));$('geometryToggle').textContent=geometryExpanded?'收合幾何尺寸':'展開完整幾何尺寸';};
const reportSpecsData=[
  ['車架組', [['尺寸','XS, S, M, ML'],['顏色','Raw Carbon / Prism Mist'],['車架','Advanced SL-grade composite, 12x142mm thru-axle, disc, UDH dropout'],['前叉','Advanced SL-grade composite, full-composite, updated OverDrive steerer, 12mm thru-axle, disc']]],
  ['座艙', [['車把手','Giant Contact SLR XR Integrated, XS:420/380mm, S:420/380mm, M:440/400mm, ML:440/400mm'],['把手帶/套','Stratus Lite 3.0'],['豎桿','Giant Contact SLR XR Integrated, XS:70mm, S:80mm, M:90mm, ML:100mm'],['座桿','Giant Contact SLR XR D-Fuse, composite, 20mm offset'],['坐墊','CADEX Amp']]],
  ['傳動', [['變速把手','SRAM RED XPLR AXS E1, 1x13'],['後變速器','SRAM RED XPLR AXS E1'],['飛輪','SRAM RED E1, 13-speed, 10x46'],['鍊條','SRAM RED E1'],['大齒盤','SRAM RED XPLR AXS with power meter, 44t, XS:165mm, S:165mm, M:170mm, ML:170mm'],['BB','SRAM DUB, Press Fit']]],
  ['煞車', [['煞車系統','SRAM RED AXS E1 hydraulic, SRAM PaceLine X rotors [F]160mm, [R]160mm'],['煞車把手','SRAM RED E1 hydraulic']]],
  ['輪組', [['輪圈','CADEX Max GXR WheelSystem, hookless, carbon, [F]50mm, [R]50mm'],['花鼓','[F] CADEX R3, Center Lock, one-piece integrated hub and spokes / [R] CADEX R3-C60, 60-tooth ratchet driver, Center Lock, one-piece integrated hub and spokes'],['輻條','CADEX Super Aero Carbon Spoke'],['外胎','CADEX GXR, 700x45c, tubeless']]],
  ['其他', [['其他','Tubeless prepared, computer mount, chain guide'],['最大胎寬','700x53mm'],['最大齒盤','54T'],['重量','依車架尺寸與零件而異']]],
];
let specsExpanded=false;
function renderSpecs(){const groups=specsExpanded?reportSpecsData:[reportSpecsData[0],[reportSpecsData[1][0],reportSpecsData[1][1].slice(0,4)]];$('reportSpecs').innerHTML=groups.map(([group,rows])=>'<div class="spec-g"><h3>'+group+'</h3><dl>'+rows.map(([key,value])=>'<dt>'+key+'</dt><dd>'+value+'</dd>').join('')+'</dl></div>').join('');}
$('specsToggle').onclick=()=>{specsExpanded=!specsExpanded;renderSpecs();$('specsToggle').setAttribute('aria-expanded',String(specsExpanded));$('specsToggle').textContent=specsExpanded?'收合產品規格':'展開更多規格';};renderSpecs();

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
