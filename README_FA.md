# SadafAlizadeh_arch — v0.5 COMMERCE

این نسخه ادامه‌ی v0.4 است و لایه‌ی فروش واقعی را کامل‌تر می‌کند.

## قابلیت‌های جدید v0.5

- پرداخت کارت‌به‌کارت با تأیید دستی مدیر
- آماده‌ی اتصال به درگاه آنلاین زرین‌پال از طریق Edge Function
- Verify پرداخت در Backend و فعال‌سازی خودکار محصول
- ایمیل خودکار بعد از تأیید یا رد سفارش با Resend
- لینک دانلود امن و زمان‌دار از Storage خصوصی
- License Key خودکار برای محصولاتی که `requires_license = true` دارند
- نمایش لایسنس در پنل کاربر
- ورود با OTP موبایل در صورت فعال بودن SMS Provider در Supabase
- بازیابی رمز عبور با ایمیل
- تغییر رمز از لینک Recovery
- Admin approval از طریق Edge Function، نه فقط Front-end

## نکته مهم

فایل‌ها آماده‌اند، ولی برای کار واقعی باید پروژه Supabase خودت را بسازی و Secretهای سرویس‌های بیرونی را وارد کنی. هیچ Merchant ID، Service Role Key یا Email API Key داخل Browser قرار نمی‌گیرد.

## ترتیب نصب

1. راهنمای `docs/SETUP_V05_FA.md` را بخوان.
2. Migrationهای دیتابیس را به ترتیب اجرا کن.
3. Edge Functionها را Deploy کن.
4. Secretها را در Supabase تنظیم کن.
5. `assets/config.js` را فقط با URL و Public Anon Key کامل کن.
6. بعد از تست Sandbox/آزمایشی، `GATEWAY_ENABLED` را `true` کن.

## پوشه‌های مهم

- `assets/` رابط سایت
- `supabase/migrations/` دیتابیس و RLS
- `supabase/functions/` درگاه و ایمیل
- `docs/` راهنمای راه‌اندازی و امنیت
- `seed-assets/` فایل اولیه SHEET by SADAF

## نسخه

v0.5 — Commerce / Auth / License
