(() => {
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const cfg=window.SADAF_CONFIG||{};
let authClient=null;

function lang(){return document.documentElement.lang==='en'?'en':'fa'}
function siteUrl(){return String(cfg.SITE_URL||location.origin).replace(/\/$/,'')}
function copyText(fa,en){return lang()==='en'?en:fa}

function polishHero(){
  const role=$('.hero-role');
  if(role) role.textContent='ARCHITECTURAL DESIGNER & VISUALIZER';
  const h1=$('.personal-hero-copy h1');
  if(h1) h1.innerHTML='<span>صدف علیزاده</span><em>معماری | تصویر | روایت</em>';
  const p=$('.personal-hero-copy > p');
  if(p) p.textContent='طراح معمار و Visualizer؛ فعال در تقاطع معماری، تجسم سه‌بعدی، طراحی بصری، محتوای دیجیتال، موشن و Creative Direction.';
  const portrait=$('.portrait-frame img');
  if(portrait){
    portrait.src='assets/sadaf-portrait.webp';
    portrait.alt='Sadaf Alizadeh — Architectural Designer & Visualizer';
    portrait.loading='eager';
    portrait.decoding='async';
    portrait.fetchPriority='high';
    portrait.removeAttribute('hidden');
  }
  const ctas=$$('.hero-actions a');
  if(ctas[0]){ctas[0].href='#profile';const s=$('span:first-child',ctas[0]);if(s)s.textContent='پروفایل حرفه‌ای';}
  if(ctas[1]){ctas[1].href='#work';const s=$('span:first-child',ctas[1]);if(s)s.textContent='مشاهده نمونه‌کارها';}
}

function applyPortfolioCopy(){
  const lead=$('#profile .profile-lead p');
  if(lead) lead.textContent='من صدف علیزاده، Architectural Designer & Visualizer هستم. کار من در تقاطع معماری و روایت بصری شکل می‌گیرد؛ از توسعه کانسپت و تجسم سه‌بعدی تا محتوای دیجیتال، موشن و تجربه‌های خلاق چندرشته‌ای.';
  const about=$('#about .about-copy p');
  if(about) about.textContent='رویکرد من معماری، composition، visual identity، storytelling و technology را کنار هم قرار می‌دهد تا هر پروژه علاوه بر کیفیت فضایی، یک روایت بصری منسجم و حرفه‌ای داشته باشد.';
  const profileTitle=$('#profile .profile-lead h2');
  if(profileTitle) profileTitle.textContent='معماری، تجسم و روایت بصری در یک مسیر حرفه‌ای.';
}

function navOrder(){
  const nav=$('.main-nav'); if(!nav)return;
  const labels={
    '#profile':['پروفایل من','Profile'],
    '#work':['کارها','Work'],
    '#learn':['آموزشی','Education'],
    '#tools':['ابزارهای دیجیتال','Digital Tools'],
    '#about':['درباره من','About'],
    '#contact':['تماس','Contact']
  };
  ['#profile','#work','#learn','#tools','#about','#contact'].forEach(h=>{
    const a=$(`a[href="${h}"]`,nav); if(!a)return; a.textContent=labels[h][lang()==='en'?1:0]; nav.appendChild(a);
  });
}

function honestEmptyStates(){
  const map=[
    ['#workGrid','Projects will appear here as they are published.','پروژه‌ها پس از انتشار از پنل مدیریت در این بخش نمایش داده می‌شوند.'],
    ['#learnList','Tutorials will appear here as they are published.','آموزش‌ها پس از انتشار از پنل مدیریت در این بخش نمایش داده می‌شوند.'],
    ['#productsGrid','Digital resources will appear here as they are published.','ابزارها و منابع دیجیتال پس از انتشار از پنل مدیریت در این بخش نمایش داده می‌شوند.']
  ];
  map.forEach(([sel,en,fa])=>{
    const host=$(sel); if(!host)return;
    const fix=()=>{const empty=$('.empty-state',host);if(empty)empty.textContent=copyText(fa,en)};
    fix(); new MutationObserver(fix).observe(host,{childList:true,subtree:true});
  });
}

function improvePortfolioMedia(){
  $$('.portfolio-media-card img').forEach((img,i)=>{
    img.loading=i===0?'eager':'lazy';
    img.decoding='async';
    img.sizes='(max-width:700px) 100vw, (max-width:1100px) 50vw, 1200px';
  });
  const visual=$('#visual-storytelling,.portfolio-editorial');
  if(visual){
    const h=$('.section-heading h2',visual); if(h)h.textContent=copyText('روایت تصویر','Visual Storytelling');
    const p=$('.section-heading > p',visual); if(p)p.textContent=copyText('معماری، موشن، AI Visuals و روایت‌های تصویری؛ برگرفته از مسیر حرفه‌ای و پورتفولیوی ۲۰۲۶.','Architecture, motion, AI visuals and narrative systems drawn from the 2026 professional portfolio.');
  }
}

function tuneSectionLabels(){
  const tools=$('#tools .section-heading h2'); if(tools)tools.textContent=copyText('ابزارهای دیجیتال','Digital Tools');
  const learn=$('#learn .section-heading h2'); if(learn)learn.textContent=copyText('آموزش','Education / Tutorials');
  const work=$('#work .section-heading h2'); if(work)work.textContent=copyText('نمونه‌کارها','Selected Works');
}

async function getAuthClient(){
  if(authClient)return authClient;
  if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY)return null;
  if(!window.supabase){
    await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
  }
  authClient=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY,{
    auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,flowType:'pkce',storageKey:'sadaf-auth-v08'}
  });
  return authClient;
}

function authStatus(message,type='info',retry=false){
  let box=$('#v08AuthStatus');
  if(!box){box=document.createElement('div');box.id='v08AuthStatus';box.className='v08-auth-status';document.body.appendChild(box)}
  box.className=`v08-auth-status ${type}`;
  box.innerHTML=`<strong>${type==='ok'?'ورود موفق':'وضعیت ورود'}</strong><p>${message}</p>${retry?'<button type="button" id="v08RetryAuth">ارسال لینک جدید</button>':''}`;
  $('#v08RetryAuth')?.addEventListener('click',()=>{box.remove();$('#accountButton')?.click();setTimeout(()=>document.querySelector('[data-login-mode="email-link"]')?.click(),120)});
}

function humanAuthError(error){
  const m=String(error?.message||error||'');
  if(/expired|invalid|otp|token/i.test(m))return 'لینک ورود معتبر نیست یا منقضی شده است. لطفاً یک لینک ورود جدید دریافت کنید.';
  if(/already|used/i.test(m))return 'این لینک قبلاً استفاده شده است. لطفاً یک لینک ورود جدید دریافت کنید.';
  if(/rate|limit/i.test(m))return 'تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.';
  return 'ورود انجام نشد. لطفاً دوباره تلاش کنید.';
}

async function sendPkceMagicLink(form){
  const out=$('#emailLinkMessage')||$('.form-message',form);
  const email=String(new FormData(form).get('email')||'').trim();
  if(!email)return;
  if(out){out.textContent='در حال ارسال ایمیل…';out.className='form-message'}
  try{
    const c=await getAuthClient(); if(!c)throw new Error('Backend unavailable');
    const redirect=`${siteUrl()}/?auth=callback`;
    const {error}=await c.auth.signInWithOtp({email,options:{emailRedirectTo:redirect,shouldCreateUser:true}});
    if(error)throw error;
    if(out){out.textContent='لینک ورود ارسال شد. ایمیل را باز کن و روی لینک کلیک کن.';out.className='form-message ok'}
  }catch(err){if(out){out.textContent=humanAuthError(err);out.className='form-message error'}}
}

function interceptMagicLink(){
  const attach=()=>{
    const form=$('#emailLinkLoginForm'); if(!form||form.dataset.v08==='1')return;
    form.dataset.v08='1';
    form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();sendPkceMagicLink(form)},{capture:true});
  };
  attach(); new MutationObserver(attach).observe(document.body,{childList:true,subtree:true});
}

async function processAuthCallback(){
  const u=new URL(location.href);
  const hash=new URLSearchParams(location.hash.replace(/^#/,''));
  const hasAuth=u.searchParams.get('auth')==='callback'||u.searchParams.has('code')||u.searchParams.has('token_hash')||hash.has('access_token')||u.searchParams.has('error')||hash.has('error');
  if(!hasAuth){
    if(u.searchParams.get('login')==='success'){authStatus('ورود با موفقیت انجام شد.','ok');setTimeout(()=>{u.searchParams.delete('login');history.replaceState(null,'',u.pathname+(u.searchParams.toString()?`?${u.searchParams}`:'')+u.hash)},1200)}
    return;
  }
  authStatus('در حال بررسی لینک ورود…','info');
  try{
    const c=await getAuthClient(); if(!c)throw new Error('Backend unavailable');
    const err=u.searchParams.get('error_description')||u.searchParams.get('error')||hash.get('error_description')||hash.get('error');
    if(err)throw new Error(err);
    if(u.searchParams.get('code')){
      const {error}=await c.auth.exchangeCodeForSession(u.searchParams.get('code')); if(error)throw error;
    }else if(u.searchParams.get('token_hash')){
      const type=u.searchParams.get('type')||'magiclink'; const {error}=await c.auth.verifyOtp({token_hash:u.searchParams.get('token_hash'),type}); if(error)throw error;
    }else if(hash.get('access_token')&&hash.get('refresh_token')){
      const {error}=await c.auth.setSession({access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token')}); if(error)throw error;
    }
    const {data}=await c.auth.getSession(); if(!data?.session)throw new Error('No session created');
    authStatus('ورود با موفقیت انجام شد.','ok');
    setTimeout(()=>location.replace(`${siteUrl()}/?login=success`),650);
  }catch(err){console.error(err);authStatus(humanAuthError(err),'error',true)}
}

function strengthenMobileNav(){
  const nav=$('.main-nav'), toggle=$('#menuToggle'); if(!nav||!toggle)return;
  toggle.setAttribute('aria-expanded','false');
  toggle.addEventListener('click',()=>{setTimeout(()=>toggle.setAttribute('aria-expanded',nav.dataset.open==='1'?'true':'false'),0)});
  nav.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;if(innerWidth<=1050){nav.dataset.open='0';nav.removeAttribute('style');toggle.setAttribute('aria-expanded','false')}});
}

function languageWatcher(){
  const apply=()=>{navOrder();tuneSectionLabels();honestEmptyStates()};
  apply();
  $('#langToggle')?.addEventListener('click',()=>setTimeout(apply,40));
}

function init(){
  polishHero();
  applyPortfolioCopy();
  navOrder();
  tuneSectionLabels();
  honestEmptyStates();
  improvePortfolioMedia();
  strengthenMobileNav();
  interceptMagicLink();
  languageWatcher();
  processAuthCallback();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));else init();
})();
