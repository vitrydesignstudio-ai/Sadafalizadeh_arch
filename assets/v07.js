(() => {
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const cfg=window.SADAF_CONFIG||{};
let sb=null;
const SOFTWARE={
  'AutoCAD':['Tutorials','Scripts & Plugins','Projects','Tips & Tricks','Resources'],
  '3ds Max':['Tutorials','Scripts & Plugins','Projects','Modeling','Rendering','Tips & Tricks'],
  'Corona Renderer':['Tutorials','Interior Rendering','Exterior Rendering','Lighting','Tips & Tricks'],
  'Lumion':['Tutorials','Rendering','Animation','Projects','Tips & Tricks'],
  'Unreal Engine':['Tutorials','Architectural Visualization','Real-time Visualization','Interactive Projects'],
  'Blender':['Tutorials','Modeling','Rendering','Projects','Resources'],
  'D5 Render':['Tutorials','Assets','Materials','Lighting','Animation','Projects'],
  'Photoshop':['Tutorials','Resources','Post Production','PSD / Templates','Brushes & Actions'],
  'Premiere Pro':['Tutorials','Motion','Templates','Resources'],
  'After Effects':['Tutorials','Motion Design','Templates','Resources'],
  'DaVinci Resolve':['Tutorials','Color','Editing','Motion','Resources'],
  'AI Tools':['Prompts','Workflows','Image Tools','Video Tools','AI for Architecture']
};
const SERVICES=['Architectural Design','Interior Design','3D Modeling','Photorealistic Rendering','Architectural Animation','Motion Design','Digital Content Creation','AI-assisted Visual Production','Creative Direction'];

async function client(){
  if(sb)return sb;
  if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY)return null;
  if(!window.supabase){
    await new Promise((ok,fail)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=ok;s.onerror=fail;document.head.appendChild(s)});
  }
  sb=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
  return sb;
}
function scrollToId(id){const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}
function tuneHero(){
  const role=$('.hero-role'); if(role)role.textContent='ARCHITECTURAL DESIGNER & VISUALIZER';
  const h1=$('.personal-hero-copy h1'); if(h1)h1.innerHTML='<span>صدف علیزاده</span><em>معماری | تصویر | روایت</em>';
  const body=$('.personal-hero-copy > p'); if(body)body.textContent='طراح معمار و Visualizer با تمرکز بر طراحی معماری، تجسم سه‌بعدی، روایت بصری، محتوای دیجیتال، موشن و تولید خلاقانه با کمک هوش مصنوعی.';
  const creds=$('.hero-credentials'); if(creds)creds.innerHTML='<span>MASTER OF ARCHITECTURE</span><span>ARCHITECTURE + VISUAL DESIGN + DIGITAL CONTENT + 3D VISUALIZATION</span>';
  const portrait=$('.portrait-frame img'); if(portrait){portrait.src='assets/sadaf-portrait.webp';portrait.loading='eager';portrait.decoding='async';portrait.fetchPriority='high';}
}
function reorderSections(){
  const main=$('main'); if(!main)return;
  const hero=$('.personal-hero'), marquee=$('.marquee'), profile=$('#profile'), tools=$('#tools'), learn=$('#learn'), work=$('#work'), visual=$('.portfolio-editorial'), about=$('#about'), contact=$('#contact');
  if(visual){visual.id='visual-storytelling';const eyebrow=$('.eyebrow',visual);if(eyebrow)eyebrow.textContent='06 / VISUAL STORYTELLING';const h2=$('.section-heading h2',visual);if(h2)h2.textContent='روایت تصویر';const p=$('.section-heading > p',visual);if(p)p.textContent='معماری، موشن، AI Visuals و روایت‌های تصویری؛ برگرفته از پورتفولیوی حرفه‌ای ۲۰۲۶.';}
  ensureVisualExtras(visual);
  const services=ensureServices(about,contact);
  [hero,marquee,profile,tools,learn,work,visual,about,services,contact].filter(Boolean).forEach(el=>main.appendChild(el));
}
function ensureVisualExtras(section){
  if(!section||$('#v07VisualExtras',section))return;
  section.insertAdjacentHTML('beforeend',`<div class="v07-story-grid" id="v07VisualExtras">
    <a class="v07-story-card" href="#visual-storytelling"><span>ANIMATION / AI VISUALS</span><h3>From still to sequence</h3><p>حرکت، نور، دوربین و روایت سینمایی برای معماری.</p></a>
    <a class="v07-story-card character" href="#visual-storytelling"><span>CHARACTER & STORYTELLING</span><h3>Miss Khunechi</h3><p>Animated Interior Designer / Space Detective؛ یک مسیر خلاق برای آموزش و روایت فضا.</p></a>
    <a class="v07-story-card" href="#visual-storytelling"><span>CREATIVE VISUALS</span><h3>Human-led AI exploration</h3><p>AI به‌عنوان بخشی از production workflow، نه جایگزین قضاوت طراحی.</p></a>
  </div>`);
}
function ensureServices(about,contact){
  let s=$('#services'); if(s)return s;
  s=document.createElement('section');s.className='section-shell section v07-services';s.id='services';
  s.innerHTML=`<div class="section-heading reveal"><div><span class="eyebrow">08 / SERVICES</span><h2>خدمات حرفه‌ای</h2></div><p>خدمات بر پایه تجربه معماری، visualization، motion و creative direction.</p></div><div class="v07-service-grid">${SERVICES.map((x,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><h3>${x}</h3></article>`).join('')}</div>`;
  (contact||about?.nextSibling)?.parentNode?.insertBefore(s,contact||about?.nextSibling); return s;
}
function reorderNav(){
  const nav=$('.main-nav'); if(!nav)return;
  const byHref=Object.fromEntries($$('a',nav).map(a=>[a.getAttribute('href'),a]));
  const order=['#profile','#tools','#learn','#work','#about','#contact'];
  order.forEach(h=>byHref[h]&&nav.appendChild(byHref[h]));
  if(byHref['#profile'])byHref['#profile'].textContent='پروفایل من';
  if(byHref['#work'])byHref['#work'].textContent='کارها';
  if(byHref['#learn'])byHref['#learn'].textContent='آموزشی';
  if(byHref['#tools'])byHref['#tools'].textContent='ابزارهای دیجیتال';
}
function buildMegaMenu(){
  const header=$('.site-header'), nav=$('.main-nav'), toolsLink=$('a[href="#tools"]',nav);if(!header||!nav||!toolsLink||$('#digitalToolsMega'))return;
  const mega=document.createElement('div');mega.id='digitalToolsMega';mega.className='v07-mega';mega.setAttribute('aria-hidden','true');
  mega.innerHTML=`<div class="v07-mega-inner"><div class="v07-mega-software">${Object.keys(SOFTWARE).map((s,i)=>`<button type="button" data-mega-software="${s}" class="${i===0?'active':''}"><span>${String(i+1).padStart(2,'0')}</span>${s}</button>`).join('')}</div><div class="v07-mega-detail"><div><span class="eyebrow">DIGITAL TOOLS</span><h3 id="megaSoftwareTitle">AutoCAD</h3><p>Software → Category → Content</p></div><div id="megaSoftwareLinks" class="v07-mega-links"></div><a class="v07-mega-all" href="#tools">مشاهده همه ابزارهای دیجیتال →</a></div></div>`;
  header.appendChild(mega);
  let timer;
  const open=()=>{clearTimeout(timer);mega.classList.add('open');mega.setAttribute('aria-hidden','false')};
  const close=()=>{timer=setTimeout(()=>{mega.classList.remove('open');mega.setAttribute('aria-hidden','true')},160)};
  toolsLink.addEventListener('mouseenter',open);mega.addEventListener('mouseenter',open);toolsLink.addEventListener('mouseleave',close);mega.addEventListener('mouseleave',close);
  const render=(name)=>{const t=$('#megaSoftwareTitle');if(t)t.textContent=name;const box=$('#megaSoftwareLinks');if(box)box.innerHTML=SOFTWARE[name].map(x=>`<a href="${megaTarget(x)}" data-mega-sub="${x}" data-mega-current="${name}">${x}<span>↗</span></a>`).join('');$$('[data-mega-software]',mega).forEach(b=>b.classList.toggle('active',b.dataset.megaSoftware===name));};
  $$('[data-mega-software]',mega).forEach(b=>{b.addEventListener('mouseenter',()=>render(b.dataset.megaSoftware));b.addEventListener('click',()=>{selectSoftware(b.dataset.megaSoftware);close()})});
  mega.addEventListener('click',e=>{const a=e.target.closest('[data-mega-sub]');if(!a)return;selectSoftware(a.dataset.megaCurrent);close()});
  render('AutoCAD');
  buildMobileTools(nav);
}
function megaTarget(cat){const c=cat.toLowerCase();if(c.includes('tutorial'))return '#learn';if(c.includes('project'))return '#work';if(c.includes('animation')||c.includes('motion')||c.includes('visual'))return '#visual-storytelling';return '#tools';}
function selectSoftware(name){scrollToId('tools');const select=$('#v07SoftwareFilter');if(select){select.value=name;applyToolFilters();}setTimeout(()=>{const b=$$('#toolCategories button').find(x=>x.textContent.trim()===name);b?.click();},80);}
function buildMobileTools(nav){
  if($('#v07MobileTools',nav))return;
  const details=document.createElement('details');details.id='v07MobileTools';details.className='v07-mobile-tools';
  details.innerHTML=`<summary>ابزارهای دیجیتال <span>+</span></summary><div>${Object.entries(SOFTWARE).map(([name,cats])=>`<details><summary>${name}<span>+</span></summary><div>${cats.map(c=>`<a href="${megaTarget(c)}" data-mobile-software="${name}">${c}</a>`).join('')}</div></details>`).join('')}</div>`;
  nav.appendChild(details);details.addEventListener('click',e=>{const a=e.target.closest('[data-mobile-software]');if(a)selectSoftware(a.dataset.mobileSoftware)});
}
async function enhanceToolLibrary(){
  const section=$('#tools');if(!section||$('#v07ToolFilters'))return;
  const toolbar=$('.store-toolbar',section);if(!toolbar)return;
  toolbar.insertAdjacentHTML('beforebegin',`<div class="v07-tool-filters" id="v07ToolFilters"><label><span>Search</span><input id="v07ToolSearch" type="search" placeholder="جست‌وجوی عنوان یا کلمه کلیدی"></label><label><span>Software</span><select id="v07SoftwareFilter"><option value="">همه نرم‌افزارها</option>${Object.keys(SOFTWARE).map(x=>`<option>${x}</option>`).join('')}</select></label><label><span>Content Type</span><select id="v07TypeFilter"><option value="">همه</option><option value="script">Script</option><option value="plugin">Plugin</option><option value="preset">Preset</option><option value="template">Template</option><option value="resource">Resource</option><option value="asset">Asset</option><option value="prompt">Prompt</option></select></label><label><span>Access</span><select id="v07AccessFilter"><option value="">همه</option><option value="free">Free</option><option value="paid">Premium</option></select></label></div>`);
  ['#v07ToolSearch','#v07SoftwareFilter','#v07TypeFilter','#v07AccessFilter'].forEach(id=>$(id)?.addEventListener('input',applyToolFilters));
  try{const c=await client();if(c){const {data}=await c.from('content_library').select('*');window.__SADAF_CONTENT_LIBRARY__=data||[];decorateProducts();}}
  catch(e){console.warn('Content library enhancement skipped',e)}
  const obs=new MutationObserver(()=>{decorateProducts();applyToolFilters()});obs.observe($('#productsGrid'),{childList:true,subtree:true});
}
function decorateProducts(){const rows=(window.__SADAF_CONTENT_LIBRARY__||[]).filter(x=>x.source_type==='product');$$('#productsGrid .product-card').forEach(card=>{const title=$('h3',card)?.textContent.trim();const r=rows.find(x=>x.title_fa===title||x.title_en===title);if(!r)return;card.dataset.software=r.software||'';card.dataset.contentType=r.content_type||'';card.dataset.access=r.is_free?'free':'paid';});}
function applyToolFilters(){const q=($('#v07ToolSearch')?.value||'').trim().toLowerCase(),sw=$('#v07SoftwareFilter')?.value||'',type=$('#v07TypeFilter')?.value||'',access=$('#v07AccessFilter')?.value||'';$$('#productsGrid .product-card').forEach(card=>{const okQ=!q||card.textContent.toLowerCase().includes(q),okSw=!sw||card.dataset.software===sw,okType=!type||card.dataset.contentType===type,okAccess=!access||card.dataset.access===access;card.hidden=!(okQ&&okSw&&okType&&okAccess)});}
function enhanceContact(){
  const hub=$('#contact .contact-hub');if(!hub||$('#generalContactForm'))return;
  const card=document.createElement('article');card.className='contact-panel v07-general-contact reveal';card.innerHTML=`<span class="eyebrow">GENERAL CONTACT</span><h3>پیام مستقیم</h3><p>برای همکاری، معرفی، رسانه یا ارتباط عمومی پیام بفرست.</p><form class="v06-form" id="generalContactForm"><label>نام<input name="name" required maxlength="120"></label><label>ایمیل<input name="email" type="email" required maxlength="200" dir="ltr"></label><label class="wide">موضوع<input name="subject" required maxlength="220"></label><label class="wide">پیام<textarea name="message" required maxlength="5000"></textarea></label><div class="form-submit wide"><span class="form-note">پیام شما به‌صورت امن ثبت می‌شود.</span><button class="btn btn-primary" type="submit">ارسال پیام →</button></div><p class="form-message v07-contact-message wide"></p></form>`;
  hub.insertBefore(card,hub.children[1]||null);$('#generalContactForm').addEventListener('submit',submitContact);
}
async function submitContact(e){e.preventDefault();const form=e.currentTarget,m=$('.v07-contact-message',form),f=new FormData(form);m.textContent='در حال ارسال…';m.className='form-message v07-contact-message wide';try{const c=await client();if(!c)throw new Error('Backend unavailable');const {data:{session}}=await c.auth.getSession();const payload={user_id:session?.user?.id||null,name:String(f.get('name')).trim(),email:String(f.get('email')).trim(),subject:String(f.get('subject')).trim(),message:String(f.get('message')).trim()};const {error}=await c.from('contact_messages').insert(payload);if(error)throw error;form.reset();m.textContent='پیام با موفقیت ارسال شد.';m.className='form-message v07-contact-message wide ok';}catch(err){m.textContent='ارسال پیام انجام نشد. لطفاً دوباره تلاش کنید.';m.className='form-message v07-contact-message wide error';console.error(err)}}
function enhanceAuth(){
  const mode=$('.auth-mode.login-mode'), login=$('#loginForm'), otp=$('#otpLoginForm');if(!mode||!login||!otp||$('#emailLinkLoginForm'))return;
  const b=document.createElement('button');b.type='button';b.dataset.loginMode='email-link';b.textContent='لینک ورود ایمیل';mode.appendChild(b);
  const form=document.createElement('form');form.id='emailLinkLoginForm';form.className='auth-form hidden';form.innerHTML='<label>ایمیل<input name="email" type="email" required autocomplete="email" placeholder="example@email.com" dir="ltr"></label><button class="btn btn-primary" type="submit"><span>ارسال لینک ورود</span><span>→</span></button><p class="form-message" id="emailLinkMessage"></p><small class="form-help">لینک امن ورود به ایمیل شما ارسال می‌شود.</small>';
  otp.insertAdjacentElement('afterend',form);
  mode.addEventListener('click',e=>{const x=e.target.closest('[data-login-mode]');if(!x)return;$$('[data-login-mode]',mode).forEach(k=>k.classList.toggle('active',k===x));login.classList.toggle('hidden',x.dataset.loginMode!=='password');otp.classList.toggle('hidden',x.dataset.loginMode!=='otp');form.classList.toggle('hidden',x.dataset.loginMode!=='email-link')});
  form.addEventListener('submit',sendMagicLink);
}
async function sendMagicLink(e){e.preventDefault();const form=e.currentTarget,out=$('#emailLinkMessage'),email=String(new FormData(form).get('email')||'').trim();out.textContent='در حال ارسال ایمیل…';out.className='form-message';try{const c=await client();if(!c)throw new Error('Backend unavailable');const redirect=(cfg.SITE_URL||location.origin).replace(/\/$/,'')+'/?auth=callback';const {error}=await c.auth.signInWithOtp({email,options:{emailRedirectTo:redirect,shouldCreateUser:true}});if(error)throw error;out.textContent='لینک ورود ارسال شد. ایمیل را باز کن و روی لینک کلیک کن.';out.className='form-message ok';}catch(err){out.textContent=authError(err);out.className='form-message error';}}
function authError(err){const m=String(err?.message||err||'');if(/expired|invalid|otp/i.test(m))return 'لینک ورود معتبر نیست یا منقضی شده است. لطفاً یک لینک ورود جدید دریافت کنید.';if(/rate/i.test(m))return 'تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.';return 'ورود انجام نشد. لطفاً دوباره تلاش کنید.';}
function authStateCard(text,type=''){let c=$('#v07AuthStatus');if(!c){c=document.createElement('div');c.id='v07AuthStatus';c.className='v07-auth-status';document.body.appendChild(c)}c.className='v07-auth-status '+type;c.innerHTML=`<strong>${type==='ok'?'ورود موفق':'وضعیت ورود'}</strong><p>${text}</p>${type==='error'?'<button type="button" id="v07RetryLogin">ارسال لینک جدید</button>':''}`;if(type==='error')$('#v07RetryLogin')?.addEventListener('click',()=>{$('#accountButton')?.click();setTimeout(()=>document.querySelector('[data-login-mode="email-link"]')?.click(),120);c.remove()});}
async function handleAuthCallback(){
  const url=new URL(location.href), hash=new URLSearchParams(location.hash.replace(/^#/,'')), hasAuth=url.searchParams.get('auth')==='callback'||url.searchParams.has('code')||url.searchParams.has('token_hash')||hash.has('access_token')||url.searchParams.has('error')||hash.has('error');if(!hasAuth)return;
  authStateCard('در حال بررسی لینک ورود…');
  try{const c=await client();if(!c)throw new Error('Backend unavailable');const err=url.searchParams.get('error_description')||hash.get('error_description')||url.searchParams.get('error')||hash.get('error');if(err)throw new Error(err);
    if(url.searchParams.get('code')){const {error}=await c.auth.exchangeCodeForSession(url.searchParams.get('code'));if(error)throw error;}
    else if(url.searchParams.get('token_hash')){const type=url.searchParams.get('type')||'magiclink';const {error}=await c.auth.verifyOtp({token_hash:url.searchParams.get('token_hash'),type});if(error)throw error;}
    else if(hash.get('access_token')&&hash.get('refresh_token')){const {error}=await c.auth.setSession({access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token')});if(error)throw error;}
    await new Promise(r=>setTimeout(r,250));const {data}=await c.auth.getSession();if(!data?.session)throw new Error('No session created');authStateCard('ورود با موفقیت انجام شد.','ok');setTimeout(()=>location.replace((cfg.SITE_URL||location.origin).replace(/\/$/,'')+'/?login=success'),700);
  }catch(err){console.error(err);authStateCard(authError(err),'error')}
}
function improveImages(){
  $$('.portfolio-media-card img').forEach(img=>{img.loading='lazy';img.decoding='async';img.setAttribute('sizes','(max-width: 700px) 100vw, 50vw')});
}
function bindSmooth(){document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute('href').slice(1);if(!id)return;const target=document.getElementById(id);if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'','#'+id)}})}
async function init(){tuneHero();reorderSections();reorderNav();buildMegaMenu();enhanceContact();enhanceAuth();improveImages();bindSmooth();await enhanceToolLibrary();await handleAuthCallback();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,80));else setTimeout(init,80);
})();
