/* Read-only prototype checks. Browser execution belongs on a GitHub-hosted runner. */
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium } = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright'))
  : require('playwright');

const sizes = [{width:1440,height:1000,mobile:false},{width:375,height:667,mobile:true},{width:390,height:844,mobile:true},{width:412,height:915,mobile:true}];
const targets = JSON.parse(process.env.QA_TARGETS || '[{"path":"previews/longyin-home-smoke-20261016"}]');
const out = process.env.QA_OUTPUT || 'mobile-qa-results';
const sha = process.env.QA_COMMIT || 'unknown';
const root = process.env.QA_BASE_URL || 'http://127.0.0.1:4173/';
if(root!=='http://127.0.0.1:4173/')throw Error('QA must use the isolated commit-local HTTP server');
const hash = data => crypto.createHash('sha256').update(data).digest('hex');

async function main(){
  await fs.mkdir(out,{recursive:true});
  const browser = await chromium.launch({headless:true});
  const reports=[];
  try {
    for(const target of targets){
      if(!/^previews\/[a-zA-Z0-9_./-]+$/.test(target.path) || target.path.includes('..')) throw Error('Unsafe target path');
      const url=new URL(target.path.replace(/\/$/,'')+'/',root).href;
      const expected=hash(await fs.readFile(path.join(target.path,'index.html')));
      const served=await fetch(url,{signal:AbortSignal.timeout(15000)});
      if(!served.ok||hash(Buffer.from(await served.arrayBuffer()))!==expected)throw Error('HTTP source does not match checked-out commit: '+target.path);
      for(const size of sizes){
        const context=await browser.newContext({viewport:{width:size.width,height:size.height},deviceScaleFactor:1,isMobile:size.mobile,hasTouch:size.mobile,locale:'zh-TW'});
        const networkFailures=[];
        await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin===new URL(root).origin||['data:','blob:'].includes(u.protocol))return route.continue();networkFailures.push({url:u.origin+u.pathname,reason:'External request blocked in isolated prototype test'});return route.abort();});
        const page=await context.newPage();
        page.setDefaultTimeout(10000);
        const result={url,sourceHTMLSHA256:expected,commit:sha,viewport:{width:size.width,height:size.height},deviceType:size.mobile?'simulated_mobile':'desktop',browser:browser.version(),checkedAt:new Date().toISOString(),checks:[],status:'pass'};
        const check=(name,ok,details)=>{result.checks.push({name,status:ok?'pass':'rework',details});if(!ok)result.status='rework';};
        const errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        page.on('response',response=>{if(response.status()>=400)networkFailures.push({url:response.url(),status:response.status()});});
        const activate=locator=>size.mobile?locator.tap():locator.click();
        const name=target.path.replace(/\//g,'-')+'-'+size.width+'x'+size.height;
        result.screenshots=[];
        try {
          const response=await page.goto(url+'?qa='+encodeURIComponent(sha),{waitUntil:'networkidle',timeout:45000});
          check('Commit-local HTTP response',response?.ok(),response?.status());
          await page.evaluate(()=>document.fonts.ready);
          const layout=await page.evaluate(()=>({viewport:{width:innerWidth,height:innerHeight},scrollWidth:document.documentElement.scrollWidth,images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0}))}));
          check('Exact CSS viewport',layout.viewport.width===size.width&&layout.viewport.height===size.height,layout.viewport);
          check('No horizontal overflow',layout.scrollWidth<=size.width+1,layout.scrollWidth);
          check('All image assets load',layout.images.every(i=>i.loaded),layout.images);
          await page.screenshot({path:path.join(out,name+'-top.png')});
          await page.screenshot({path:path.join(out,name+'-full.png'),fullPage:true});
          result.screenshots.push(name+'-top.png',name+'-full.png');
          const ratios=await page.locator('img').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {src:e.getAttribute('src'),displayRatio:r.width/r.height,naturalRatio:e.naturalWidth/e.naturalHeight,objectFit:getComputedStyle(e).objectFit};}));
          check('Images preserve proportions or use intentional cover/contain',ratios.every(r=>['cover','contain'].includes(r.objectFit)||Math.abs(r.displayRatio/r.naturalRatio-1)<.01),ratios);
          const icons=await page.locator('.nav-item svg').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height};}));
          check('Navigation icons have square boxes',icons.every(r=>Math.abs(r.width-r.height)<1),icons);
          const controls=await page.locator('.nav-item,.add-cart,.coupon-action,.heart').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent.trim()||e.getAttribute('aria-label'),width:r.width,height:r.height};}));
          if(size.mobile)check('Tap targets at least 44 by 44 CSS pixels',controls.every(r=>r.width>=44&&r.height>=44),controls);
          if(!(await page.locator('.product').count())){
            result.not_tested=['Page-specific interaction adapter is unavailable for this prototype'];
            reports.push(result);
            await context.close();
            continue;
          }
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
          await activate(coupon);
          check('Coupon changes state',(await coupon.innerText()).includes('已領取')&&!(await coupon.isEnabled()));
          await activate(page.locator('.heart'));
          check('Favourite toggles',(await page.locator('.heart').getAttribute('class')).includes('saved'));
          const before=Number(await page.locator('.cart-count').first().innerText());
          await activate(page.locator('.add-cart'));
          check('Demo add-to-cart updates count',Number(await page.locator('.cart-count').first().innerText())===before+1);
          await activate(page.locator('.bottom-nav [data-cart]'));
          check('Cart drawer opens',(await page.locator('#cartDrawer').getAttribute('class')).includes('open'));
          const panel=await page.locator('.cart-panel').boundingBox();
          check('Drawer fits viewport',!!panel&&panel.x>=-1&&panel.y>=-1&&panel.x+panel.width<=size.width+1&&panel.y+panel.height<=size.height+1,panel);
          await page.screenshot({path:path.join(out,name+'-drawer.png')});
          result.screenshots.push(name+'-drawer.png');
          await activate(page.locator('[data-close]'));
          check('Cart drawer closes',!(await page.locator('#cartDrawer').isVisible()));
          await activate(page.locator('[data-nav="brands"]'));
          check('Category navigation changes active state',(await page.locator('[data-nav="brands"]').getAttribute('class')).includes('active'));
          await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
          const bottom=await page.evaluate(()=>{const n=document.querySelector('.bottom-nav'),p=document.querySelector('.purchase-row'),r=n.getBoundingClientRect(),b=p.getBoundingClientRect();return {position:getComputedStyle(n).position,navBottom:r.bottom,navTop:r.top,purchaseBottom:b.bottom,scrollY};});
          check('Navigation stays fixed at viewport bottom',bottom.position==='fixed'&&Math.abs(bottom.navBottom-size.height)<=1,bottom);
          check('Scrolling reveals complete purchase row',bottom.purchaseBottom<=bottom.navTop+1,bottom);
          await page.screenshot({path:path.join(out,name+'-bottom.png')});
          check('No page JavaScript exceptions',errors.length===0,errors);
          check('No blocked or failed resources',networkFailures.length===0,networkFailures);
          result.screenshots.push(name+'-bottom.png');
          result.not_tested=['Physical iPhone / Safari rendering','Safe-area inset on a physical device','Pixel comparison with approved design master','Real backend, payment, account and order functions'];
        } catch(e){result.status=result.checks.length?'rework':'not_tested';result.error=e.message;result.screenshots.push(name+'-failure.png');await page.screenshot({path:path.join(out,name+'-failure.png')}).catch(()=>{});}
        reports.push(result);
        await context.close();
      }
    }
  } finally {await browser.close();}
  await fs.writeFile(path.join(out,'results.json'),JSON.stringify({runnerStatus:'executed',physicalDeviceTested:false,reports},null,2));
  const summary=['# Prototype browser test results','','Commit: `'+sha+'`','','Mobile dimensions below are simulated Chromium viewports, not physical iPhones.','','| Preview | Viewport | Result | Failed checks |','| --- | --- | --- | --- |',...reports.map(r=>'| '+new URL(r.url).pathname+' | '+r.viewport.width+'×'+r.viewport.height+' | '+r.status+' | '+r.checks.filter(c=>c.status!=='pass').map(c=>c.name).join('; ')+' |'),'','See results.json, browser screenshots and HTTP logs in the Actions artifact.',''];
  await fs.writeFile(path.join(out,'summary.md'),summary.join('\n'));
  if(process.env.GITHUB_STEP_SUMMARY)await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,summary.join('\n'));
  if(reports.some(r=>r.status!=='pass'))process.exitCode=1;
}
main().catch(async e=>{await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'blocked.json'),JSON.stringify({status:'not_tested',reason:e.message},null,2));console.error(e.message);process.exitCode=1;});
