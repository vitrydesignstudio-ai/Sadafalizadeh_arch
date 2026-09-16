(() => {
'use strict';
const cfg=window.SADAF_CONFIG||{};
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const prefKey='sadaf_site_language';
let client=null;

async function getClient(){
  if(client)return client;
  if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY)return null;
  if(!window.supabase){
    await new Promise((resolve,reject)=>{
      const sc=document.createElement('script');
      sc.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      sc.onload=resolve;sc.onerror=reject;document.head.appendChild(sc);
    });
  }
  client=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  return client;
}

const copy={
  fa:{
    'nav.tools':'ابزارهای دیجیتال','tools.title':'ابزارهای دیجیتال','tools.body':'کتابخانه‌ای از اسکریپت، پلاگین، براش، پریست، متریال و منابع حرفه‌ای؛ بعضی رایگان و بعضی تجاری.','tools.note':'ابزارها بر اساس نرم‌افزار و نوع فایل دسته‌بندی می‌شوند و خریدها و دانلودها به حساب کاربری متصل هستند.','contact.title':'تماس و همکاری','contact.body':'برای پروژه معماری، همکاری حرفه‌ای یا پشتیبانی ابزارها از مسیر مناسب استفاده کن.','inquiry.title':'درخواست پروژه','inquiry.body':'اطلاعات اولیه پروژه را ثبت کن تا برای ادامه گفتگو با شما تماس گرفته شود.','support.title':'پشتیبانی','support.body':'برای سؤال، مشکل دانلود، لایسنس یا استفاده از ابزارها یک پیام پشتیبانی ثبت کن.'
  },
  en:{
    'nav.tools':'Digital Tools','tools.title':'Digital Tools','tools.body':'A curated library of scripts, plugins, brushes, presets, materials and professional resources — free and premium.','tools.note':'Resources are organized by software and file type, with purchases and downloads linked to each user account.','contact.title':'Contact & Collaboration','contact.body':'Choose the right channel for architecture projects, professional collaboration, or product support.','inquiry.title':'Project Inquiry','inquiry.body':'Share the initial project details and you will be contacted to continue the conversation.','support.title':'Support','support.body':'Send a support request for downloads, licenses, purchases or tool usage.'
  }
};

function currentLang(){return document.documentElement.lang==='en'?'en':'fa'}
function applyV06Copy(){const lang=currentLang();$$('[data-v06-i18n]').forEach(el=>{const key=el.dataset.v06I18n;const val=copy[lang]?.[key];if(val)el.textContent=val});}
function setLanguage(lang){
  localStorage.setItem(prefKey,lang);
  const now=currentLang();
  if(now!==lang)$('#langToggle')?.click();
  setTimeout(applyV06Copy,0);
  closeLanguageChoice();
}
function openLanguageChoice(){const m=$('#languageChoiceModal');if(!m)return;m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeLanguageChoice(){const m=$('#languageChoiceModal');if(!m)return;m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.style.overflow=''}
function hydrateLanguage(){
  const pref=localStorage.getItem(prefKey);
  if(pref==='fa'||pref==='en')setTimeout(()=>setLanguage(pref),80);else setTimeout(openLanguageChoice,220);
  $('#langToggle')?.addEventListener('click',()=>setTimeout(()=>{localStorage.setItem(prefKey,currentLang());applyV06Copy()},0));
  $$('[data-language-choice]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.languageChoice)));
}
function msg(form,text,type=''){const el=form.querySelector('.v06-message');if(!el)return;el.textContent=text;el.className='form-message v06-message '+type}
function values(form){return Object.fromEntries(new FormData(form).entries())}
function normalizeEmpty(obj){for(const k of Object.keys(obj)){if(typeof obj[k]==='string'){obj[k]=obj[k].trim();if(obj[k]==='')obj[k]=null}}return obj}
async function sessionUser(sb){try{const {data}=await sb.auth.getSession();return data?.session?.user||null}catch{return null}}

async function submitInquiry(e){
  e.preventDefault();const form=e.currentTarget;msg(form,'در حال ثبت درخواست…');
  const sb=await getClient();if(!sb){msg(form,'Backend هنوز متصل نیست.','error');return}
  const user=await sessionUser(sb),v=normalizeEmpty(values(form));
  const payload={user_id:user?.id||null,full_name:v.full_name,email:v.email,mobile:v.mobile,company:v.company,project_type:v.project_type,project_location:v.project_location,area:v.area,budget:v.budget,timeline:v.timeline,message:v.message,status:'new'};
  const {error}=await sb.from('project_inquiries').insert(payload);
  if(error){msg(form,'ثبت درخواست انجام نشد: '+error.message,'error');return}
  form.reset();msg(form,'درخواست شما ثبت شد. برای ادامه با شما تماس گرفته می‌شود.','ok');
}
async function submitSupport(e){
  e.preventDefault();const form=e.currentTarget;msg(form,'در حال ثبت پیام…');
  const sb=await getClient();if(!sb){msg(form,'Backend هنوز متصل نیست.','error');return}
  const user=await sessionUser(sb),v=normalizeEmpty(values(form));
  const payload={user_id:user?.id||null,full_name:v.full_name,email:v.email,category:v.category,subject:v.subject,message:v.message,status:'open'};
  const {error}=await sb.from('support_tickets').insert(payload);
  if(error){msg(form,'ثبت پیام انجام نشد: '+error.message,'error');return}
  form.reset();msg(form,'پیام پشتیبانی ثبت شد.','ok');
}
function bind(){
  hydrateLanguage();applyV06Copy();
  $('#projectInquiryForm')?.addEventListener('submit',submitInquiry);
  $('#supportForm')?.addEventListener('submit',submitSupport);
  $('#openInquiryBtn')?.addEventListener('click',()=>$('#project-inquiry')?.scrollIntoView({behavior:'smooth',block:'start'}));
  $('#openSupportBtn')?.addEventListener('click',()=>$('#support')?.scrollIntoView({behavior:'smooth',block:'start'}));
  getClient().then(sb=>{if(!sb)return;sb.auth.onAuthStateChange((event)=>{if(event==='SIGNED_IN'&&!localStorage.getItem(prefKey))setTimeout(openLanguageChoice,150)})}).catch(()=>{});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
