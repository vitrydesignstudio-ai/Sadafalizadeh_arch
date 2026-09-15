# راه‌اندازی v0.5 — قدم‌به‌قدم

## 1) Supabase

یک پروژه Supabase بساز. سپس `assets/config.js` را با دو مقدار عمومی زیر کامل کن:

```js
SUPABASE_URL: 'https://....supabase.co'
SUPABASE_ANON_KEY: '...'
SITE_URL: 'https://دامنه-نهایی-سایت'
```

`service_role` هرگز داخل این فایل قرار نگیرد.

## 2) Migrationها

Migrationهای زیر را به ترتیب اجرا کن:

1. `0001_sadaf_platform.sql`
2. `0002_optional_phone_auth_notes.sql`
3. `0003_v05_commerce_auth_license.sql`

Migration سوم این موارد را اضافه می‌کند: `payment_attempts`، `licenses`، RPC پرداخت آنلاین و صدور License Key.

## 3) نقش Admin

بعد از ساخت حساب خودت، یک‌بار در SQL Editor:

```sql
update public.profiles
set role='admin'
where email='EMAIL-YOU@example.com';
```

## 4) Deploy Edge Functions

با Supabase CLI:

```bash
supabase functions deploy payment-create
supabase functions deploy payment-verify --no-verify-jwt
supabase functions deploy admin-order-action
```

فایل `supabase/config.toml` هم مشخص کرده که callback Verify عمومی باشد. خود Verify فقط با Authority موجود در دیتابیس و پاسخ واقعی درگاه، سفارش را Paid می‌کند.

## 5) Secretهای Backend

نمونه:

```bash
supabase secrets set SITE_URL=https://example.com
supabase secrets set ZARINPAL_MERCHANT_ID=YOUR-MERCHANT-ID
supabase secrets set ZARINPAL_AMOUNT_MULTIPLIER=10
supabase secrets set RESEND_API_KEY=re_xxxxxxxxx
supabase secrets set EMAIL_FROM="Sadaf Tools <tools@example.com>"
```

`ZARINPAL_AMOUNT_MULTIPLIER` جدا تعریف شده تا واحد مبلغ قبل از انتشار نهایی با قرارداد Merchant شما کنترل شود. برای تبدیل تومان به ریال مقدار رایج `10` است؛ قبل از فعال‌سازی Production با تنظیمات حساب درگاه خودت تطبیق بده.

## 6) فعال‌کردن درگاه در Front-end

بعد از اینکه Functions و Secretها تست شدند:

```js
GATEWAY_ENABLED: true
```

در `assets/config.js`.

## 7) ایمیل

برای ایمیل خرید:

- یک حساب Resend بساز.
- دامنه‌ی فرستنده را Verify کن.
- `RESEND_API_KEY` و `EMAIL_FROM` را فقط در Supabase Secrets بگذار.

بعد از تأیید کارت‌به‌کارت توسط صدف یا Verify موفق درگاه، ایمیل خرید ارسال می‌شود. فایل ZIP ضمیمه نمی‌شود؛ کاربر وارد حسابش می‌شود و آخرین نسخه را دانلود می‌کند.

## 8) OTP موبایل

در Supabase > Authentication > Providers، Phone را فعال کن و یک SMS Provider پشتیبانی‌شده تنظیم کن. بعد فرم «ورود با کد پیامک» سایت بدون تغییر کد کار می‌کند.

برای کنترل هزینه و سوءاستفاده، Rate Limit و CAPTCHA را قبل از عمومی‌کردن سایت فعال کن.

## 9) Password Recovery

در Authentication > URL Configuration، `SITE_URL` و Redirect URLهای دامنه را تنظیم کن. کاربر از «رمز عبور را فراموش کرده‌ام» ایمیل Recovery دریافت می‌کند و بعد از بازگشت به سایت، فرم رمز جدید باز می‌شود.

## 10) License

در پنل Admin هنگام ساخت/ویرایش محصول، گزینه «نیاز به License Key» را روی بله بگذار. بعد از ایجاد Entitlement، License به‌صورت خودکار ساخته می‌شود و در «لایسنس‌ها»ی حساب کاربر نمایش داده می‌شود.

این نسخه هنوز Activation سخت‌افزاری یا محدودکردن دستگاه را اجرا نمی‌کند؛ License Key پایه را می‌سازد. Device activation مرحله بعدی است.
