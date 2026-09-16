(() => {
'use strict';
const cfg=window.SADAF_CONFIG||{};
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const prefKey='sadaf_site_language';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
let client=null;

async function getClient(){
  if(client)return client;
  if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY)return null;
  if(!window.supabase){
    await new Promise((resolve,reject)=>{const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';sc.onload=resolve;sc.onerror=reject;document.head.appendChild(sc)});
  }
  client=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  return client;
}

const copy={
  fa:{'nav.tools':'ابزارهای دیجیتال','tools.title':'ابزارهای دیجیتال','tools.body':'کتابخانه‌ای از اسکریپت، پلاگین، براش، پریست، متریال و منابع حرفه‌ای؛ بعضی رایگان و بعضی تجاری.','tools.note':'ابزارها بر اساس نرم‌افزار و نوع فایل دسته‌بندی می‌شوند و خریدها و دانلودها به حساب کاربری متصل هستند.','contact.title':'تماس و همکاری','contact.body':'برای پروژه معماری، همکاری حرفه‌ای یا پشتیبانی ابزارها از مسیر مناسب استفاده کن.','inquiry.title':'درخواست پروژه','inquiry.body':'اطلاعات اولیه پروژه را ثبت کن تا برای ادامه گفتگو با شما تماس گرفته شود.','support.title':'پشتیبانی','support.body':'برای سؤال، مشکل دانلود، لایسنس یا استفاده از ابزارها یک پیام پشتیبانی ثبت کن.'},
  en:{'nav.tools':'Digital Tools','tools.title':'Digital Tools','tools.body':'A curated library of scripts, plugins, brushes, presets, materials and professional resources — free and premium.','tools.note':'Resources are organized by software and file type, with purchases and downloads linked to each user account.','contact.title':'Contact & Collaboration','contact.body':'Choose the right channel for architecture projects, professional collaboration, or product support.','inquiry.title':'Project Inquiry','inquiry.body':'Share the initial project details and you will be contacted to continue the conversation.','support.title':'Support','support.body':'Send a support request for downloads, licenses, purchases or tool usage.'}
};

function currentLang(){return document.documentElement.lang==='en'?'en':'fa'}
function applyV06Copy(){const lang=currentLang();$$('[data-v06-i18n]').forEach(el=>{const key=el.dataset.v06I18n,val=copy[lang]?.[key];if(val)el.textContent=val})}
async function persistProfileLocale(lang){try{const sb=await getClient();if(!sb)return;const {data}=await sb.auth.getSession();const user=data?.session?.user;if(user)await sb.from('profiles').update({locale:lang}).eq('id',user.id)}catch{}}
function setLanguage(lang){localStorage.setItem(prefKey,lang);const now=currentLang();if(now!==lang)$('#langToggle')?.click();setTimeout(applyV06Copy,0);persistProfileLocale(lang);closeLanguageChoice()}
function openLanguageChoice(){const m=$('#languageChoiceModal');if(!m)return;m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeLanguageChoice(){const m=$('#languageChoiceModal');if(!m)return;m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.style.overflow=''}
function hydrateLanguage(){const pref=localStorage.getItem(prefKey);if(pref==='fa'||pref==='en')setTimeout(()=>setLanguage(pref),80);else setTimeout(openLanguageChoice,220);$('#langToggle')?.addEventListener('click',()=>setTimeout(()=>{localStorage.setItem(prefKey,currentLang());applyV06Copy()},0));$$('[data-language-choice]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.languageChoice)))}
function msg(form,text,type=''){const el=form.querySelector('.v06-message');if(!el)return;el.textContent=text;el.className='form-message v06-message '+type}
function values(form){return Object.fromEntries(new FormData(form).entries())}
function normalizeEmpty(obj){for(const k of Object.keys(obj)){if(typeof obj[k]==='string'){obj[k]=obj[k].trim();if(obj[k]==='')obj[k]=null}}return obj}
async function sessionUser(sb){try{const {data}=await sb.auth.getSession();return data?.session?.user||null}catch{return null}}
async function isAdmin(sb){const user=await sessionUser(sb);if(!user)return false;const {data}=await sb.from('profiles').select('role').eq('id',user.id).maybeSingle();return data?.role==='admin'}

async function submitInquiry(e){e.preventDefault();const form=e.currentTarget;msg(form,'در حال ثبت درخواست…');const sb=await getClient();if(!sb){msg(form,'Backend هنوز متصل نیست.','error');return}const user=await sessionUser(sb),v=normalizeEmpty(values(form));const payload={user_id:user?.id||null,full_name:v.full_name,email:v.email,mobile:v.mobile,company:v.company,project_type:v.project_type,project_location:v.project_location,area:v.area,budget:v.budget,timeline:v.timeline,message:v.message,status:'new'};const {error}=await sb.from('project_inquiries').insert(payload);if(error){msg(form,'ثبت درخواست انجام نشد: '+error.message,'error');return}form.reset();msg(form,'درخواست شما ثبت شد. برای ادامه با شما تماس گرفته می‌شود.','ok')}
async function submitSupport(e){e.preventDefault();const form=e.currentTarget;msg(form,'در حال ثبت پیام…');const sb=await getClient();if(!sb){msg(form,'Backend هنوز متصل نیست.','error');return}const user=await sessionUser(sb),v=normalizeEmpty(values(form));const payload={user_id:user?.id||null,full_name:v.full_name,email:v.email,category:v.category,subject:v.subject,message:v.message,status:'open'};const {error}=await sb.from('support_tickets').insert(payload);if(error){msg(form,'ثبت پیام انجام نشد: '+error.message,'error');return}form.reset();msg(form,'پیام پشتیبانی ثبت شد.','ok')}

function ensureExtraNav(){
  const dnav=$('#dashboardModal .dashboard-nav');
  if(dnav&&!dnav.querySelector('[data-v06-dash="requests"]')){dnav.insertAdjacentHTML('beforeend','<button type="button" data-v06-dash="requests">درخواست‌های پروژه</button><button type="button" data-v06-dash="support">تیکت‌های پشتیبانی</button>');}
  const anav=$('#adminModal .dashboard-nav');
  if(anav&&!anav.querySelector('[data-v06-admin="inquiries"]')){anav.insertAdjacentHTML('beforeend','<button type="button" data-v06-admin="inquiries">درخواست‌های پروژه</button><button type="button" data-v06-admin="support">پشتیبانی</button>');}
  $$('[data-v06-dash]').forEach(b=>b.onclick=()=>renderUserExtra(b.dataset.v06Dash,b));
  $$('[data-v06-admin]').forEach(b=>b.onclick=()=>renderAdminExtra(b.dataset.v06Admin,b));
}
function markActive(button,scope){$$('button',scope).forEach(x=>x.classList.remove('active'));button?.classList.add('active')}
function statusBadge(v){return `<span class="pill ${esc(v)}">${esc(v)}</span>`}
function fmt(x){return x?new Date(x).toLocaleString('fa-IR'):'—'}

async function renderUserExtra(kind,button){
  const sb=await getClient(),user=sb?await sessionUser(sb):null;if(!user)return;
  const nav=$('#dashboardModal .dashboard-nav');markActive(button,nav);
  const c=$('#dashboardContent');c.innerHTML='<div class="loading">در حال دریافت اطلاعات…</div>';
  if(kind==='requests'){
    const {data,error}=await sb.from('project_inquiries').select('*').eq('user_id',user.id).order('created_at',{ascending:false});
    if(error){c.innerHTML=`<p>${esc(error.message)}</p>`;return}
    c.innerHTML=`<div class="admin-toolbar"><h4>درخواست‌های پروژه</h4><span>${data.length}</span></div><div class="download-list">${data.map(x=>`<article class="download-card"><div><span>${esc(x.project_type||'PROJECT')}</span><h4>${esc(x.project_location||'درخواست پروژه')}</h4><p>${esc(fmt(x.created_at))}</p><p>${esc(x.message)}</p></div>${statusBadge(x.status)}</article>`).join('')||'<div class="empty-state">هنوز درخواستی ثبت نشده است.</div>'}</div>`;
  }else{
    const {data,error}=await sb.from('support_tickets').select('*').eq('user_id',user.id).order('created_at',{ascending:false});
    if(error){c.innerHTML=`<p>${esc(error.message)}</p>`;return}
    c.innerHTML=`<div class="admin-toolbar"><h4>تیکت‌های پشتیبانی</h4><span>${data.length}</span></div><div class="download-list">${data.map(x=>`<article class="download-card"><div><span>${esc(x.category)}</span><h4>${esc(x.subject)}</h4><p>${esc(fmt(x.created_at))}</p><p>${esc(x.message)}</p>${x.admin_reply?`<p><strong>پاسخ:</strong> ${esc(x.admin_reply)}</p>`:''}</div>${statusBadge(x.status)}</article>`).join('')||'<div class="empty-state">هنوز تیکتی ثبت نشده است.</div>'}</div>`;
  }
}

async function renderAdminExtra(kind,button){
  const sb=await getClient();if(!sb||!(await isAdmin(sb)))return;
  const nav=$('#adminModal .dashboard-nav');markActive(button,nav);
  const c=$('#adminContent');c.innerHTML='<div class="loading">در حال دریافت…</div>';
  if(kind==='inquiries'){
    const {data,error}=await sb.from('project_inquiries').select('*').order('created_at',{ascending:false});if(error){c.innerHTML=`<p>${esc(error.message)}</p>`;return}
    c.innerHTML=`<div class="admin-toolbar"><h4>درخواست‌های پروژه</h4><span>${data.length}</span></div><div class="download-list">${data.map(x=>`<article class="download-card"><div><span>${esc(x.project_type||'PROJECT')} · ${esc(x.status)}</span><h4>${esc(x.full_name)} — ${esc(x.project_location||'')}</h4><p>${esc(x.email)} ${x.mobile?'· '+esc(x.mobile):''}</p><p>${esc([x.area,x.budget,x.timeline].filter(Boolean).join(' · '))}</p><p>${esc(x.message)}</p></div><div><select data-inquiry-status="${x.id}"><option ${x.status==='new'?'selected':''}>new</option><option ${x.status==='in_review'?'selected':''}>in_review</option><option ${x.status==='contacted'?'selected':''}>contacted</option><option ${x.status==='closed'?'selected':''}>closed</option></select></div></article>`).join('')||'<div class="empty-state">درخواستی ثبت نشده است.</div>'}</div>`;
    $$('[data-inquiry-status]',c).forEach(s=>s.onchange=async()=>{await sb.from('project_inquiries').update({status:s.value}).eq('id',s.dataset.inquiryStatus)});
  }else{
    const {data,error}=await sb.from('support_tickets').select('*').order('created_at',{ascending:false});if(error){c.innerHTML=`<p>${esc(error.message)}</p>`;return}
    c.innerHTML=`<div class="admin-toolbar"><h4>پشتیبانی</h4><span>${data.length}</span></div><div class="download-list">${data.map(x=>`<article class="download-card"><div><span>${esc(x.category)} · ${esc(x.status)}</span><h4>${esc(x.subject)}</h4><p>${esc(x.full_name)} · ${esc(x.email)}</p><p>${esc(x.message)}</p><textarea data-support-reply="${x.id}" rows="3" placeholder="پاسخ مدیر...">${esc(x.admin_reply||'')}</textarea></div><div><select data-support-status="${x.id}"><option ${x.status==='open'?'selected':''}>open</option><option ${x.status==='in_progress'?'selected':''}>in_progress</option><option ${x.status==='resolved'?'selected':''}>resolved</option><option ${x.status==='closed'?'selected':''}>closed</option></select><button class="row-action" data-save-support="${x.id}">ذخیره</button></div></article>`).join('')||'<div class="empty-state">تیکتی ثبت نشده است.</div>'}</div>`;
    $$('[data-save-support]',c).forEach(b=>b.onclick=async()=>{const id=b.dataset.saveSupport,reply=$(`[data-support-reply="${id}"]`,c)?.value||'',status=$(`[data-support-status="${id}"]`,c)?.value||'open';await sb.from('support_tickets').update({admin_reply:reply,status}).eq('id',id);b.textContent='ذخیره شد'});
  }
}

async function injectProductTaxonomy(){
  const form=$('#productForm');if(!form||form.dataset.v06Enhanced==='1')return;form.dataset.v06Enhanced='1';
  const type=form.querySelector('[name="product_type"]');if(type){const values=['script','plugin','preset','template','block','ctb','brush','action','psd','material','model','scene','asset','prompt','other'];type.innerHTML=values.map(v=>`<option value="${v}">${v}</option>`).join('')}
  const sw=form.querySelector('[name="software_category"]');if(sw){const label=document.createElement('label');label.innerHTML='زیرمجموعه<input name="subcategory" placeholder="مثلاً Blocks / CTB / Brushes / Materials">';sw.closest('label')?.insertAdjacentElement('afterend',label)}
  const id=form.querySelector('[name="id"]')?.value;if(id){const sb=await getClient();const {data}=await sb.from('products').select('product_type,subcategory').eq('id',id).maybeSingle();if(data){if(type)type.value=data.product_type||'other';const sub=form.querySelector('[name="subcategory"]');if(sub)sub.value=data.subcategory||''}}
}
async function saveProductV06(e){
  const form=e.target;if(form?.id!=='productForm')return;e.preventDefault();e.stopImmediatePropagation();
  const sb=await getClient();if(!sb)return;const f=new FormData(form),id=String(f.get('id')||''),file=f.get('cover');
  const patch={name:String(f.get('name')||''),software_category:String(f.get('software_category')||'Other'),subcategory:String(f.get('subcategory')||'')||null,product_type:String(f.get('product_type')||'other'),current_version:String(f.get('current_version')||''),price_toman:Number(f.get('price_toman')||0),is_free:String(f.get('is_free'))==='true',requires_license:String(f.get('requires_license'))==='true',status:String(f.get('status')||'draft'),sort_order:Number(f.get('sort_order')||100),description_fa:String(f.get('description_fa')||''),features_fa:String(f.get('features_fa')||'').split('\n').map(x=>x.trim()).filter(Boolean)};
  if(file instanceof File&&file.size){const ext=(file.name.split('.').pop()||'jpg').replace(/[^a-zA-Z0-9]/g,''),path=`products/${Date.now()}-${Math.random().toString(36).slice(2,7)}.${ext}`;const {error:ue}=await sb.storage.from('site-media').upload(path,file);if(ue){alert(ue.message);return}patch.cover_image_url=sb.storage.from('site-media').getPublicUrl(path).data.publicUrl}
  let error;if(id)({error}=await sb.from('products').update(patch).eq('id',id));else{patch.slug=String(patch.name||'tool').trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g,'-').replace(/^-|-$/g,'')+'-'+Date.now().toString(36).slice(-5);const user=await sessionUser(sb);patch.created_by=user?.id||null;({error}=await sb.from('products').insert(patch))}
  if(error){alert(error.message);return}location.reload();
}

function bind(){
  hydrateLanguage();applyV06Copy();ensureExtraNav();
  $('#projectInquiryForm')?.addEventListener('submit',submitInquiry);
  $('#supportForm')?.addEventListener('submit',submitSupport);
  $('#openInquiryBtn')?.addEventListener('click',()=>$('#project-inquiry')?.scrollIntoView({behavior:'smooth',block:'start'}));
  $('#openSupportBtn')?.addEventListener('click',()=>$('#support')?.scrollIntoView({behavior:'smooth',block:'start'}));
  document.addEventListener('submit',saveProductV06,true);
  const obs=new MutationObserver(()=>{ensureExtraNav();injectProductTaxonomy()});obs.observe(document.body,{childList:true,subtree:true});
  getClient().then(sb=>{if(!sb)return;sb.auth.onAuthStateChange((event)=>{if(event==='SIGNED_IN'&&!localStorage.getItem(prefKey))setTimeout(openLanguageChoice,150)})}).catch(()=>{});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
