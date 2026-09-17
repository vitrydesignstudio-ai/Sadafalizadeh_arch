(() => {
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
function applyIdentity(){
  const role=$('.hero-role'); if(role)role.textContent='ARCHITECTURAL DESIGNER & VISUAL CREATIVE';
  const h1=$('.personal-hero-copy h1'); if(h1)h1.innerHTML='<span>صدف علیزاده</span><em>معماری، تصویر و روایت</em>';
  const portrait=$('.portrait-frame img'); if(portrait){portrait.src='assets/sadaf-portrait.webp';portrait.alt='پرتره صدف علیزاده';portrait.loading='eager';portrait.decoding='async';portrait.fetchPriority='high';}
  const ctas=$$('.hero-actions a'); if(ctas[0])ctas[0].setAttribute('href','#profile'); if(ctas[1])ctas[1].setAttribute('href','#work');
}
function restoreMainNavOrder(){
  const nav=$('.main-nav'); if(!nav)return;
  const links=Object.fromEntries($$('a[href^="#"]',nav).map(a=>[a.getAttribute('href'),a]));
  ['#profile','#work','#learn','#tools','#about','#contact'].forEach(h=>links[h]&&nav.appendChild(links[h]));
  const labels={'#profile':'پروفایل','#work':'نمونه‌کارها','#learn':'آموزش','#tools':'ابزارهای دیجیتال','#about':'درباره من','#contact':'تماس'};
  Object.entries(labels).forEach(([h,t])=>{if(links[h])links[h].textContent=t});
}
function enforceSectionOrder(){
  const main=$('main'); if(!main)return;
  const hero=$('.personal-hero'),marquee=$('.marquee'),profile=$('#profile'),tools=$('#tools'),learn=$('#learn'),work=$('#work'),visual=$('#visual-storytelling')||$('.portfolio-editorial'),about=$('#about'),services=$('#services'),contact=$('#contact');
  [hero,marquee,profile,tools,learn,work,visual,about,services,contact].filter(Boolean).forEach(el=>main.appendChild(el));
}
function polishEmptyStates(){
  const work=$('#workGrid .empty-state'); if(work)work.textContent='پروژه‌ها پس از انتشار از پنل مدیریت اینجا نمایش داده می‌شوند.';
  const learn=$('#learnList .empty-state'); if(learn)learn.textContent='آموزش‌ها پس از انتشار از پنل مدیریت اینجا نمایش داده می‌شوند.';
  const tools=$('#productsGrid .empty-state'); if(tools)tools.textContent='منابع و ابزارهای دیجیتال پس از انتشار از پنل مدیریت اینجا نمایش داده می‌شوند.';
}
function keepToolsClickable(){
  const tools=$('.main-nav a[href="#tools"]'); if(!tools)return;
  tools.addEventListener('click',()=>document.getElementById('tools')?.scrollIntoView({behavior:'smooth',block:'start'}));
}
function run(){applyIdentity();restoreMainNavOrder();enforceSectionOrder();keepToolsClickable();polishEmptyStates();setTimeout(polishEmptyStates,500);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(run,180));else setTimeout(run,180);
})();