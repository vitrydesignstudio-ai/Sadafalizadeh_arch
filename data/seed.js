// Public runtime safety net. This runs before app.js and keeps production usable even when
// the hosting environment has not injected browser-safe variables yet.
window.SADAF_CONFIG = window.SADAF_CONFIG || {};
if (!window.SADAF_CONFIG.SUPABASE_URL || !window.SADAF_CONFIG.SUPABASE_ANON_KEY) {
  Object.assign(window.SADAF_CONFIG, {
    SUPABASE_URL: 'https://nhqewuniroljxgaefkgx.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_0WQ5ts4mMkLLZM0WJFstGQ_xxx1QOg6',
    SITE_URL: 'https://sadafalizadeh-arch.vercel.app',
    DOWNLOAD_URL_TTL_SECONDS: 300,
    GATEWAY_ENABLED: false,
    PAYMENT_PROVIDER: 'zarinpal'
  });
}

window.SADAF_SEED = {
  categories: ['همه','AutoCAD','3ds Max','D5 Render','Lumion','Photoshop','AI Tools','Other'],
  projects: [],
  lessons: [
    {id:'l1',titleFa:'Batch Plot در AutoCAD',titleEn:'Batch Plot in AutoCAD',subtitleFa:'منطق فایل‌های تولیدی با ده‌ها شیت',subtitleEn:'How to think about production files',tag:'AutoCAD',time:'12 min',status:'published'},
    {id:'l2',titleFa:'DNA فایل CTB و سلسله‌مراتب Lineweight',titleEn:'CTB DNA & Lineweight Hierarchy',subtitleFa:'ساخت سیستم خوانا برای نقشه‌ها',subtitleEn:'Build a readable drawing system',tag:'Standards',time:'18 min',status:'published'},
    {id:'l3',titleFa:'ورک‌فلو حرفه‌ای D5 Render',titleEn:'D5 Render — Pro Workflow',subtitleFa:'نور، دوربین، انیمیشن و ارائه',subtitleEn:'Lighting, camera and presentation',tag:'D5 Render',time:'24 min',status:'published'}
  ],
  products: [
    {id:'sheet-by-sadaf',name:'SHEET by SADAF',slug:'sheet-by-sadaf',category:'AutoCAD',version:'0.1.3',status:'beta',isFree:false,price:490000,priceLabel:'۴۹۰٬۰۰۰ تومان',descriptionFa:'پلات گروهی هوشمند برای فایل‌های سنگین اتوکد؛ تشخیص شیت و خروجی PDF.',descriptionEn:'Smart batch plotting workflow for AutoCAD.',features:['تشخیص شیت','پشتیبانی از Layout','خروجی PDF'],download:'downloads/SHEET_by_SADAF_Beta_0.1.3_COMPLETE.zip'}
  ]
};

function makeStaticContentVisible(){
  document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'));
}
function installImageFallbacks(){
  document.querySelectorAll('img').forEach(img=>{
    const mark=()=>{
      if(img.naturalWidth)return;
      img.hidden=true;
      const host=img.closest('figure,.portrait-frame,.portfolio-media-card');
      if(host)host.classList.add('media-missing');
    };
    img.addEventListener('error',mark,{once:true});
    if(img.complete&&!img.naturalWidth)mark();
  });
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{makeStaticContentVisible();installImageFallbacks();});
}else{
  makeStaticContentVisible();installImageFallbacks();
}
