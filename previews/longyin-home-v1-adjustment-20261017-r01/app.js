/* Local prototype state only; no backend requests or persistent customer data. */
(()=>{
  const root=document.querySelector('[data-tjp-app]')||document.body;
  const q=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)];
  const state={cartCount:3,claimed:new Set(),favorite:false};
  const dialog=q('#demo-dialog');let toastTimer,lastFocus;
  function notify(message){clearTimeout(toastTimer);q('#toast').textContent=message;q('#toast').hidden=false;toastTimer=setTimeout(()=>q('#toast').hidden=true,2400);}
  function open(title,content){lastFocus=document.activeElement;q('#dialog-title').textContent=title;q('#dialog-body').replaceChildren();if(typeof content==='string')q('#dialog-body').textContent=content;else q('#dialog-body').append(content);if(!dialog.open)dialog.showModal();}
  function close(){dialog.close();lastFocus?.focus();}
  function counts(){all('[data-cart-count]').forEach(el=>el.textContent=state.cartCount);}
  function scrollToPart(id){const target=q('#'+id);target?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
  function cart(){const section=document.createElement('div');const row=document.createElement('div');row.className='demo-cart-row';row.append(document.createTextNode('MEVIUS Original'));const controls=document.createElement('div');const minus=document.createElement('button'),count=document.createElement('span'),plus=document.createElement('button');minus.textContent='−';plus.textContent='+';minus.setAttribute('aria-label','減少數量');plus.setAttribute('aria-label','增加數量');function update(){count.textContent=state.cartCount;minus.disabled=state.cartCount===0;counts();}minus.onclick=()=>{state.cartCount=Math.max(0,state.cartCount-1);update();};plus.onclick=()=>{state.cartCount++;update();};controls.append(minus,count,plus);row.append(controls);section.append(row);update();open('購物車',section);}
  function action(name){if(name==='cart'){cart();return;}if(name==='brands'){scrollToPart('brands');return;}if(name==='product'){open('MEVIUS Original','メビウス・オリジナル\n滑順口感・經典原味\n¥4,250／條');return;}if(name==='register'){open('新會員註冊','新會員註冊贈送 500 點！');return;}if(name==='categories'){scrollToPart('brands');return;}if(name==='account')open('會員中心','會員點數・優惠券・訂單查詢');}
  all('[data-action]').forEach(button=>button.addEventListener('click',()=>action(button.dataset.action)));
  all('[data-nav]').forEach(button=>button.addEventListener('click',()=>{all('[data-nav]').forEach(item=>{item.classList.toggle('active',item===button);if(item===button)item.setAttribute('aria-current','page');else item.removeAttribute('aria-current');});button.dataset.nav==='home'?scrollToPart('home'):action(button.dataset.nav);}));
  all('[data-coupon]').forEach(button=>button.addEventListener('click',()=>{const value=button.dataset.coupon;if(state.claimed.has(value)){notify('此優惠券已領取');return;}state.claimed.add(value);button.classList.add('is-claimed');button.querySelector('em').textContent='已領取';notify('優惠券已領取');}));
  all('[data-brand]').forEach(button=>button.addEventListener('click',()=>{scrollToPart('recommendations');notify(button.dataset.brand);}));
  q('#favorite').addEventListener('click',()=>{state.favorite=!state.favorite;q('#favorite').setAttribute('aria-pressed',String(state.favorite));q('#favorite').setAttribute('aria-label',state.favorite?'取消收藏':'加入收藏');notify(state.favorite?'已收藏':'已取消收藏');});
  q('#add-to-cart').addEventListener('click',()=>{state.cartCount++;counts();notify('已加入購物車');});
  q('#search-form').addEventListener('submit',event=>{event.preventDefault();const term=q('#search-input').value.trim();if(!term){q('#search-input').focus();notify('請輸入商品或品牌');return;}open('搜尋結果',/mevius|メビウス|原味/i.test(term)?'MEVIUS Original　¥4,250／條':'沒有找到相關商品');});
  q('#dialog-close').addEventListener('click',close);q('#dialog-done').addEventListener('click',close);dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)close();}});dialog.addEventListener('close',()=>lastFocus?.focus());
  const hero=q('#home-carousel'),track=q('.hero-track'),slides=all('.hero-slide'),dots=all('[data-slide-to]');
  let active=0,start=null,suppressClick=false;
  function show(index){active=(index+slides.length)%slides.length;track.style.transform='translateX(-'+active*100+'%)';slides.forEach((slide,i)=>{slide.inert=i!==active;slide.setAttribute('aria-hidden',String(i!==active));});dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===active)));hero.dataset.activeSlide=String(active);}
  dots.forEach(dot=>dot.addEventListener('click',()=>show(Number(dot.dataset.slideTo))));
  all('[data-slide-step]').forEach(button=>button.addEventListener('click',()=>show(active+Number(button.dataset.slideStep))));
  hero.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();show(active+(event.key==='ArrowRight'?1:-1));}});
  track.addEventListener('pointerdown',event=>{if(event.isPrimary)start={x:event.clientX,y:event.clientY};});
  track.addEventListener('pointerup',event=>{if(!start)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){show(active+(dx<0?1:-1));suppressClick=true;}});
  track.addEventListener('pointercancel',()=>start=null);
  track.addEventListener('click',event=>{if(suppressClick){event.preventDefault();suppressClick=false;return;}const link=event.target.closest('.hero-slide');if(link){event.preventDefault();scrollToPart(link.getAttribute('href').slice(1));}});
  show(0);counts();
})();
