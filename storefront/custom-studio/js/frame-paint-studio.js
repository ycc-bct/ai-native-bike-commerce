import * as THREE from '../assets/frame-3d/lib/three.module.js';
import {RoomEnvironment} from '../assets/frame-3d/lib/RoomEnvironment.js';
class FramePaintStudio extends HTMLElement {
 async connectedCallback(){
 if(this.started)return;this.started=true;
 this.innerHTML=`<div class="paint-stage"><div class="paint-render"><canvas tabindex="0" aria-label="TCR 立體車架塗裝預覽，可拖曳或使用方向鍵旋轉"></canvas><span class="paint-drag-hint">拖曳查看車架</span><p class="paint-loading">正在載入 3D 車架…</p></div><div class="paint-card"><h2>車架塗裝</h2><div class="paint-swatches" role="group" aria-label="選擇車架塗裝"></div><div class="paint-description" aria-live="polite"></div><div class="paint-finishes" role="group" aria-label="塗裝光澤"><button type="button" data-finish="gloss" aria-pressed="true">亮光</button><button type="button" data-finish="matte" aria-pressed="false">消光</button></div></div></div>`;
 const host=this,canvas=this.querySelector('canvas'),area=this.querySelector('.paint-render');
 try {
 const r=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
 r.setPixelRatio(Math.min(devicePixelRatio,2));r.toneMapping=THREE.NeutralToneMapping;r.toneMappingExposure=.9;r.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),pm=new THREE.PMREMGenerator(r);scene.environment=pm.fromScene(new RoomEnvironment(),.03).texture;
 const cam=new THREE.PerspectiveCamera(26,1,.1,50);cam.position.set(0,.30,2.6);cam.lookAt(0,.06,0);
 const kl=new THREE.DirectionalLight(0xffffff,1.2);kl.position.set(2,3,3);scene.add(kl);
function mottle(){const cv=document.createElement('canvas');cv.width=cv.height=512;const g=cv.getContext('2d');
 g.fillStyle='#5D646D';g.fillRect(0,0,512,512);let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
 for(let i=0;i<2600;i++){const x=rnd()*512,y=rnd()*512,rr=4+rnd()*26;const k=rnd();
  g.fillStyle=k<.3?`rgba(193,200,195,${.15+rnd()*.3})`:k<.75?`rgba(42,62,82,${.3+rnd()*.4})`:`rgba(150,158,162,${.3})`;
  g.beginPath();g.ellipse(x,y,rr,rr*(.3+rnd()*.7),rnd()*3,0,7);g.fill();}
 const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(6,1);t.anisotropy=8;return t;}
function chameleon(){const m=new THREE.MeshPhysicalMaterial({color:'#ffffff',metalness:.55,roughness:.3,clearcoat:1,clearcoatRoughness:.04});
 m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWp=(modelMatrix*vec4(transformed,1.0)).xyz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;').replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 {float f=clamp(dot(normalize(normal),normalize(vViewPosition)),0.0,1.0);
  vec3 cTeal=vec3(0.025,0.088,0.064),cGreen=vec3(0.020,0.043,0.027),cSlate=vec3(0.056,0.060,0.073),cOlive=vec3(0.093,0.093,0.082),cMint=vec3(0.39,0.52,0.40);
  float g=clamp(vWp.x*0.9+0.5+vWp.y*0.6,0.0,1.0);
  vec3 face=mix(cTeal,cOlive,smoothstep(0.15,0.95,g));
  vec3 edge=mix(cSlate,cMint,0.35*(1.0-g));
  diffuseColor.rgb=mix(edge,face,smoothstep(0.05,0.85,f));}`);};
 return m;}
const P=[
 {sys:'經典塗裝',name:'寶石紅',code:'RD-002',hex:'#A51B32',m:new THREE.MeshPhysicalMaterial({color:'#A51B32',metalness:0,roughness:.32,clearcoat:1,clearcoatRoughness:.04})},
 {sys:'SD 手工亂紋系列',name:'波賽頓',code:'SD-001',hex:'#5D646D',sw:'radial-gradient(circle at 35% 35%,#C1C8C3,#5D646D 55%,#2A3E52)',m:new THREE.MeshPhysicalMaterial({map:mottle(),color:"#9aa0a8",metalness:.15,roughness:.4,clearcoat:1,clearcoatRoughness:.05})},
 {sys:'CL 變色龍系列',name:'超級變色龍',code:'CL-005',hex:'#354236',sw:'linear-gradient(135deg,#888A85,#354236 50%,#2D5A3C)',m:chameleon()},
 {sys:'EP 電鍍系列',name:'海洋之星',code:'EP-008',hex:'#2C54A5',m:new THREE.MeshPhysicalMaterial({color:'#2C54A5',metalness:1,roughness:.16,clearcoat:1,clearcoatRoughness:.03})}];
const black=new THREE.MeshPhysicalMaterial({color:'#18181a',roughness:.5,metalness:.3});
// geometry: traced from refs/tcr25_raw.jpg (inflated silhouette, see model/build.py)
const frame=new THREE.Group(),meshes=[];
const J=await (await fetch(new URL('../assets/frame-3d/model/tcr.json',import.meta.url))).json();
const dec=(b,T)=>{const u=Uint8Array.from(atob(b),c=>c.charCodeAt(0));return new T(u.buffer)};
for(const [k,v] of Object.entries(J)){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(dec(v.p,Float32Array),3));
 g.setIndex(new THREE.BufferAttribute(dec(v.i,Uint32Array),1));g.computeVertexNormals();
 const dark=(k==='post'||k==='cap');const me=new THREE.Mesh(g,dark?black:P[0].m);frame.add(me);if(!dark)meshes.push(me);}
const bbx=new THREE.Box3().setFromObject(frame),ctr=bbx.getCenter(new THREE.Vector3());
frame.position.set(-ctr.x,-bbx.min.y-0.0,0);// floor at y=0 of frame bottom
const piv=new THREE.Group();piv.add(frame);piv.position.y=0;piv.scale.x=-1;scene.add(piv);
const FY=-0.33; frame.position.y+=FY;
// contact shadow
const sc=document.createElement('canvas');sc.width=sc.height=256;const sg=sc.getContext('2d');const gr=sg.createRadialGradient(128,128,0,128,128,128);
gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(.5,'rgba(0,0,0,.18)');gr.addColorStop(1,'rgba(0,0,0,0)');sg.fillStyle=gr;sg.fillRect(0,0,256,256);
const sh=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.34),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc),transparent:true,depthWrite:false}));
sh.rotation.x=-Math.PI/2;sh.position.set(0,FY+0.005,0);scene.add(sh);

 const sw=host.querySelector('.paint-swatches'),desc=host.querySelector('.paint-description');
 let current=0,lastChange=performance.now(),lastInput=0,visible=false,entered=0,enabled=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function select(i,manual=false){current=i;meshes.forEach(m=>m.material=P[i].m);sw.querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));desc.innerHTML=`目前顯示 <strong>${P[i].sys}・${P[i].name}</strong>`;lastChange=performance.now();if(manual)lastInput=lastChange;r.render(scene,cam);}
 P.forEach((p,i)=>{const b=document.createElement('button');b.type='button';b.title=p.sys+'・'+p.name;b.setAttribute('aria-label',b.title);b.style.setProperty('--paint',p.sw||p.hex);b.addEventListener('click',()=>select(i,true));sw.append(b)});
 // Keep the chosen finish across automatic and manual paint changes.
 const finishes=host.querySelector('.paint-finishes');
 const glossy=P.map(p=>({roughness:p.m.roughness,clearcoat:p.m.clearcoat,clearcoatRoughness:p.m.clearcoatRoughness}));
 finishes.addEventListener('click',event=>{const button=event.target.closest('[data-finish]');if(!button)return;const matte=button.dataset.finish==='matte';P.forEach((p,i)=>Object.assign(p.m,matte?{roughness:.85,clearcoat:0,clearcoatRoughness:1}:glossy[i]));finishes.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));lastInput=performance.now();r.render(scene,cam)});
 let yaw=0,pitch=0,dragging=false,px=0,py=0;
 const renderDrag=()=>{piv.position.y=0;piv.rotation.set(THREE.MathUtils.degToRad(4)+pitch,THREE.MathUtils.degToRad(32)+yaw,0);r.render(scene,cam)};
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;px=e.clientX;py=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');lastInput=performance.now()});
 canvas.addEventListener('pointermove',e=>{if(!dragging)return;yaw+=(e.clientX-px)*.008;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-py)*.006,-.65,.65);px=e.clientX;py=e.clientY;lastInput=performance.now();renderDrag()});
 const release=()=>{dragging=false;canvas.classList.remove('dragging');lastInput=performance.now()};
 canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
 canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')yaw-=.12;if(e.key==='ArrowRight')yaw+=.12;if(e.key==='ArrowUp')pitch-=.08;if(e.key==='ArrowDown')pitch+=.08;pitch=THREE.MathUtils.clamp(pitch,-.65,.65);lastInput=performance.now();renderDrag()});
 select(0);
 const resize=()=>{const {width,height}=area.getBoundingClientRect();if(!width||!height)return;r.setSize(width,height,false);cam.aspect=width/height;cam.position.z=cam.aspect<1?3.3:2.6;cam.updateProjectionMatrix()};new ResizeObserver(resize).observe(area);resize();
 new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible&&!entered)entered=performance.now();},{threshold:.15}).observe(host);
 host.querySelector('.paint-loading').remove();
 piv.rotation.set(THREE.MathUtils.degToRad(4),THREE.MathUtils.degToRad(32),0);r.render(scene,cam);
 r.setAnimationLoop(()=>{if(!visible)return;const now=performance.now();const progress=reduced?1:Math.min((now-entered)/1800,1),k=1-Math.pow(1-progress,3);piv.position.y=(1-k)*.6;piv.rotation.set(THREE.MathUtils.degToRad(4+16*(1-k))+pitch,THREE.MathUtils.degToRad(32-120*(1-k))+yaw,0);sh.material.opacity=k*k;if(enabled&&!dragging&&now-lastChange>4000&&now-lastInput>10000)select((current+1)%P.length);r.render(scene,cam)});
 }catch(error){host.querySelector('.paint-loading').textContent='3D 預覽無法載入，請重新整理或使用支援 WebGL 的瀏覽器。';console.error('Frame preview',error);}
 }
}
customElements.define('frame-paint-studio',FramePaintStudio);
