# امنیت v0.5

- `SUPABASE_ANON_KEY` عمومی است و می‌تواند در Browser باشد؛ امنیت داده با RLS اعمال می‌شود.
- `SUPABASE_SERVICE_ROLE_KEY` فقط داخل Edge Functions است.
- Merchant ID و Email API Key فقط Secret هستند.
- فایل محصول در Bucket خصوصی `product-files` می‌ماند.
- دانلود از طریق Signed URL کوتاه‌مدت انجام می‌شود.
- Verify آنلاین فقط بعد از پاسخ درگاه و تطابق Authority ذخیره‌شده انجام می‌شود.
- پرداخت دستی فقط توسط Admin تأیید می‌شود.
- License Key در دیتابیس تولید می‌شود، نه در Browser.
- قبل از انتشار عمومی Phone OTP، CAPTCHA و Rate Limit فعال شود.
- برای Production حتماً HTTPS و دامنه واقعی استفاده شود.
