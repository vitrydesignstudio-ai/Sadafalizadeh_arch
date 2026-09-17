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

// Keep preview content honest: unpublished CMS content is represented by professional empty states,
// never by demo projects, tutorials, or products.
window.SADAF_SEED = {
  categories: ['همه','AutoCAD','3ds Max','Corona Renderer','Lumion','Unreal Engine','Blender','D5 Render','Photoshop','Premiere Pro','After Effects','DaVinci Resolve','AI Tools','Other'],
  projects: [],
  lessons: [],
  products: []
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
