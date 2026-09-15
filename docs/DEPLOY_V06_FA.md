# راه‌اندازی آنلاین — SadafAlizadeh_arch v0.6

این نسخه برای Deploy روی Vercel و Backend روی Supabase آماده شده است.

## 1) Supabase
1. یک Project بساز.
2. Migrationهای پوشه `supabase/migrations` را به‌ترتیب اجرا کن.
3. Edge Functionهای `supabase/functions` را Deploy کن.
4. Storage Bucketهای خصوصی موردنیاز محصول و رسید را طبق مستندات v0.5 بساز.
5. حساب صدف را ایجاد و Role آن را `admin` کن.
6. URL پروژه و Public Anon Key را بردار.

## 2) Vercel
Environment Variables زیر را تعریف کن:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SITE_URL`
- `DOWNLOAD_URL_TTL_SECONDS=300`
- `GATEWAY_ENABLED=false` تا قبل از فعال‌شدن درگاه
- `PAYMENT_PROVIDER=zarinpal`

Vercel دستور `npm run build` را اجرا می‌کند و فقط پوشه `dist/` را عمومی می‌کند.

### نکته امنیتی مهم
پوشه‌های `supabase/`, `docs/` و `seed-assets/` در خروجی عمومی کپی نمی‌شوند. بنابراین ZIP محصول پولی داخل Front-end سایت منتشر نمی‌شود.

## 3) Auth Redirect URLs
در Supabase، URL اصلی سایت و URLهای Preview موردنیاز را در Auth > URL Configuration اضافه کن. برای Production، `SITE_URL` باید دامنه نهایی باشد.

## 4) تست قبل از انتشار
- ثبت‌نام کاربر
- ورود و خروج
- بازیابی رمز
- ایجاد محصول رایگان
- ایجاد سفارش کارت‌به‌کارت
- آپلود رسید
- تأیید سفارش از Admin
- مشاهده محصول در «دانلودهای من»
- کنترل Signed URL و عدم دسترسی کاربر دیگر
- تست فارسی/English روی موبایل و دسکتاپ

## 5) درگاه و ایمیل
بعد از تست پایه، Secretهای درگاه و سرویس ایمیل فقط در Supabase Edge Function Secrets تنظیم شوند؛ هرگز در `assets/config.js` یا Vercel Public Environment Variables قرار نگیرند.
