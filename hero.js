'use strict';
// 仅增强首页 .hero-art；复用 effects.js 的感应权限与方向数据。
(() => {
 const files = [
  ['sky','ResizedImage_2026-09-19_00-24-23_2626[1].jpg',2],
  ['trees','ResizedImage_2026-09-19_00-32-56_5264[1].jpg',5],
  ['cat','ResizedImage_2026-09-19_00-29-25_8440[1].jpg',8],
  ['person','ResizedImage_2026-09-19_00-39-38_4648[3].jpg',12],
  ['light','ResizedImage_2026-09-19_00-39-37_4369[1].jpg',17],
  ['leaves','ResizedImage_2026-09-19_00-39-38_7391[2].jpg',22]
 ];
 let assets,scene=null,frame=0,x=0,y=0,tx=0,ty=0,visible=true,observer;
 const limit=v=>Math.max(-1,Math.min(1,v));
 // 仅在内存中去除与画布边缘连通的黑底，原 JPG 文件和文件名保持原样。
 function surface(img,key){
  const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
  const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
  if(['person','cat','leaves'].includes(key)){
   const d=ctx.getImageData(0,0,c.width,c.height),p=d.data,w=c.width,h=c.height,n=w*h;
   const seen=new Uint8Array(n),queue=new Int32Array(n);let head=0,tail=0;
   function add(i){if(seen[i])return;seen[i]=1;const k=i*4;if(Math.max(p[k],p[k+1],p[k+2])<65)queue[tail++]=i;}
   for(let a=0;a<w;a++){add(a);add((h-1)*w+a);}for(let b=0;b<h;b++){add(b*w);add(b*w+w-1);}
   while(head<tail){const i=queue[head++],k=i*4,m=Math.max(p[k],p[k+1],p[k+2]);
    const alpha=Math.max(0,Math.min(1,(m-8)/57));p[k+3]=Math.round(255*alpha);
    if(alpha>0){for(let v=0;v<3;v++)p[k+v]=Math.min(255,p[k+v]/alpha);}
    if(i%w)add(i-1);if(i%w<w-1)add(i+1);if(i>=w)add(i-w);if(i<n-w)add(i+w);
   }
   ctx.putImageData(d,0,0);
  }
  c.className='hero-plane hero-'+key;c.setAttribute('aria-hidden','true');return c;
 }
 function preload(){return assets||(assets=Promise.all(files.map(([key,file,depth])=>new Promise(resolve=>{
  const img=new Image();img.onload=()=>{try{resolve({key,depth,canvas:surface(img,key)});}catch{resolve({key,depth,canvas:null});}};
  img.onerror=()=>resolve({key,depth,canvas:null});img.src='./'+encodeURIComponent(file);
 }))));}
 function stop(){if(frame)cancelAnimationFrame(frame);frame=0;}
 function paint(){if(!scene)return;for(const p of scene.children){const d=Number(p.dataset.depth)||0;p.style.transform=`translate3d(${x*d}px,${y*d*.7}px,0)`;}}
 function tick(){frame=0;if(!scene||document.hidden||!visible||reducedMotion.matches)return;x+=(tx-x)*.12;y+=(ty-y)*.12;paint();if(Math.abs(tx-x)+Math.abs(ty-y)>.001)frame=requestAnimationFrame(tick);}
 function aim(a,b){tx=limit(a);ty=limit(b);if(!frame&&!reducedMotion.matches&&!document.hidden&&visible&&scene)frame=requestAnimationFrame(tick);}
 async function mount(){stop();observer?.disconnect();scene=null;x=y=tx=ty=0;visible=true;
  const host=app.querySelector('.hero-art');if(!host)return;
  const loaded=await preload();if(!host.isConnected||host.querySelector('.hero-scene'))return;
  if(!loaded.find(a=>a.key==='person')?.canvas||!loaded.find(a=>a.key==='sky')?.canvas)return;
  const box=document.createElement('span');box.className='hero-scene';box.setAttribute('role','img');box.setAttribute('aria-label','小叶子与白猫，随手机倾斜呈现分层视差');
  for(const a of loaded){if(!a.canvas)continue;const copy=a.canvas.cloneNode();copy.getContext('2d').drawImage(a.canvas,0,0);copy.dataset.depth=a.depth;box.append(copy);}
  host.querySelector(':scope > img,:scope > .broken')?.remove();host.prepend(box);host.classList.add('hero-layered');host.href='#character/xiaoyezi';host.querySelector('.hero-caption h3').textContent='小叶子 / Xiaoyezi';scene=box;
  host.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||sensorsOn)return;const r=host.getBoundingClientRect();aim((e.clientX-r.left)/r.width*2-1,(e.clientY-r.top)/r.height*2-1);});
  host.addEventListener('pointerleave',()=>{if(!sensorsOn)aim(0,0);});
  if('IntersectionObserver'in window){observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)aim(tx,ty);else stop();});observer.observe(host);}
 }
 window.addEventListener('aetheria:orientation',e=>aim(e.detail.x/25,e.detail.y/25));
 window.addEventListener('aetheria:sensors-off',()=>aim(0,0));
 window.addEventListener('aetheria:render',mount);
 document.addEventListener('visibilitychange',()=>{stop();x=y=tx=ty=0;paint();});
 reducedMotion.addEventListener('change',()=>{stop();x=y=tx=ty=0;paint();});
 mount();
})();
