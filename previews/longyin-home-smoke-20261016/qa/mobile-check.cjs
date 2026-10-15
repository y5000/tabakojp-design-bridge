/* Draft runner: actual browser execution has NOT been verified in Work. */
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium } = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright'))
  : require('playwright');

const sizes = [{width:375,height:667},{width:390,height:844},{width:412,height:915}];
const targets = JSON.parse(process.env.QA_TARGETS || '[{"path":"previews/longyin-home-smoke-20261016"}]');
const out = process.env.QA_OUTPUT || 'mobile-qa-results';
const sha = process.env.QA_COMMIT || 'unknown';
const root = 'https://y5000.github.io/tabakojp-design-bridge/';
const sleep = ms => new Promise(resolve => setTimeout(resolve,ms));
const hash = data => crypto.createHash('sha256').update(data).digest('hex');

async function main(){
  await fs.mkdir(out,{recursive:true});
  const browser = await chromium.launch({headless:true});
  const reports=[];
  try {
    for(const target of targets){
      if(!/^(previews|deliveries)\/[a-zA-Z0-9_./-]+$/.test(target.path) || target.path.includes('..')) throw Error('Unsafe target path');
      const url=new URL(target.path.replace(/\/$/,'')+'/',root).href;
      const expected=hash(await fs.readFile(path.join(target.path,'index.html')));
      let deployed=false;
      for(let attempt=0;attempt<12;attempt++){
        const response=await fetch(url+'?qa='+encodeURIComponent(sha)+'&attempt='+attempt,{signal:AbortSignal.timeout(20000)});
        if(response.ok && hash(Buffer.from(await response.arrayBuffer()))===expected){deployed=true;break;}
        if(attempt<11) await sleep(10000);
      }
      if(!deployed){reports.push({url,commit:sha,status:'not_tested',reason:'Deployed HTML does not match checked-out source'});continue;}
      for(const size of sizes){
        const context=await browser.newContext({viewport:size,deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'zh-TW'});
        const page=await context.newPage();
        const result={url,commit:sha,viewport:size,browser:browser.version(),checkedAt:new Date().toISOString(),checks:[],status:'pass'};
        const check=(name,ok,details)=>{result.checks.push({name,status:ok?'pass':'rework',details});if(!ok)result.status='rework';};
        const errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        try {
          const response=await page.goto(url+'?qa='+encodeURIComponent(sha),{waitUntil:'networkidle',timeout:45000});
          check('HTTPS response',response?.ok(),response?.status());
          await page.evaluate(()=>document.fonts.ready);
          const layout=await page.evaluate(()=>({viewport:{width:innerWidth,height:innerHeight},scrollWidth:document.documentElement.scrollWidth,images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0}))}));
          check('Exact CSS viewport',layout.viewport.width===size.width&&layout.viewport.height===size.height,layout.viewport);
          check('No horizontal overflow',layout.scrollWidth<=size.width+1,layout.scrollWidth);
          check('All image assets load',layout.images.every(i=>i.loaded),layout.images);
          const ratios=await page.locator('img').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {src:e.getAttribute('src'),displayRatio:r.width/r.height,naturalRatio:e.naturalWidth/e.naturalHeight,objectFit:getComputedStyle(e).objectFit};}));
          check('Images preserve proportions or use intentional cover/contain',ratios.every(r=>['cover','contain'].includes(r.objectFit)||Math.abs(r.displayRatio/r.naturalRatio-1)<.01),ratios);
          const icons=await page.locator('.nav-item svg').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height};}));
          check('Navigation icons have square boxes',icons.every(r=>Math.abs(r.width-r.height)<1),icons);
          const controls=await page.locator('.nav-item,.add-cart,.coupon-action,.heart').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent.trim()||e.getAttribute('aria-label'),width:r.width,height:r.height};}));
          check('Tap targets at least 44 by 44 CSS pixels',controls.every(r=>r.width>=44&&r.height>=44),controls);
          const product=await page.locator('.product').boundingBox();
          const photo=await page.locator('.product-photo').boundingBox();
          const info=await page.locator('.product-info').boundingBox();
          check('Product columns remain inside card',!!product&&!!photo&&!!info&&photo.x>=product.x-1&&info.x+info.width<=product.x+product.width+1&&photo.x+photo.width<=info.x+1,{product,photo,info});
          const price=await page.locator('.prices').boundingBox();
          const cart=await page.locator('.add-cart').boundingBox();
          check('Price does not collide with cart button',!!price&&!!cart&&price.x+price.width<=cart.x+1,{price,cart});
          const clipped=await page.locator('.prices,.product-info').evaluateAll(els=>els.map(e=>({className:e.className,clientWidth:e.clientWidth,scrollWidth:e.scrollWidth})));
          check('Product text is not horizontally clipped',clipped.every(r=>r.scrollWidth<=r.clientWidth+1),clipped);
          await page.locator('#searchInput').fill('MEVIUS');
          await page.locator('#searchInput').press('Enter');
          check('Search demonstration responds',(await page.locator('#toast').innerText()).includes('MEVIUS'));
          const coupon=page.locator('[data-coupon]').first();
          await coupon.tap();
          check('Coupon changes state',(await coupon.innerText()).includes('已領取')&&!(await coupon.isEnabled()));
          await page.locator('.heart').tap();
          check('Favourite toggles',(await page.locator('.heart').getAttribute('class')).includes('saved'));
          const before=Number(await page.locator('.cart-count').first().innerText());
          await page.locator('.add-cart').tap();
          check('Demo add-to-cart updates count',Number(await page.locator('.cart-count').first().innerText())===before+1);
          await page.locator('.bottom-nav [data-cart]').tap();
          check('Cart drawer opens',(await page.locator('#cartDrawer').getAttribute('class')).includes('open'));
          const panel=await page.locator('.cart-panel').boundingBox();
          check('Drawer fits viewport',!!panel&&panel.x>=-1&&panel.y>=-1&&panel.x+panel.width<=size.width+1&&panel.y+panel.height<=size.height+1,panel);
          await page.locator('[data-close]').tap();
          check('Cart drawer closes',!(await page.locator('#cartDrawer').isVisible()));
          await page.locator('[data-nav="brands"]').tap();
          check('Category navigation changes active state',(await page.locator('[data-nav="brands"]').getAttribute('class')).includes('active'));
          await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
          const bottom=await page.evaluate(()=>{const n=document.querySelector('.bottom-nav'),p=document.querySelector('.purchase-row'),r=n.getBoundingClientRect(),b=p.getBoundingClientRect();return {position:getComputedStyle(n).position,navBottom:r.bottom,navTop:r.top,purchaseBottom:b.bottom,scrollY};});
          check('Navigation stays fixed at viewport bottom',bottom.position==='fixed'&&Math.abs(bottom.navBottom-size.height)<=1,bottom);
          check('Scrolling reveals complete purchase row',bottom.purchaseBottom<=bottom.navTop+1,bottom);
          const name=target.path.replace(/\//g,'-')+'-'+size.width+'x'+size.height;
          await page.screenshot({path:path.join(out,name+'-bottom.png')});
          await page.screenshot({path:path.join(out,name+'-full.png'),fullPage:true});
          check('No page JavaScript exceptions',errors.length===0,errors);
          result.screenshots=[name+'-bottom.png',name+'-full.png'];
          result.not_tested=['Physical iPhone / Safari rendering','Safe-area inset on a physical device','Pixel comparison with approved design master','Real backend, payment, account and order functions'];
        } catch(e){result.status='rework';result.error=e.message;await page.screenshot({path:path.join(out,'failure-'+size.width+'.png')}).catch(()=>{});}
        reports.push(result);
        await context.close();
      }
    }
  } finally {await browser.close();}
  await fs.writeFile(path.join(out,'results.json'),JSON.stringify({runnerStatus:'executed',reports},null,2));
  if(reports.some(r=>r.status!=='pass'))process.exitCode=1;
}
main().catch(async e=>{await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'blocked.json'),JSON.stringify({status:'not_tested',reason:e.message},null,2));console.error(e.message);process.exitCode=1;});
