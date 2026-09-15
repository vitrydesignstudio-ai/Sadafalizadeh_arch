# نقشه دیتابیس v0.5

## profiles
حساب و پروفایل کاربر؛ `role` برای user/admin.

## projects
نمونه‌کارهای معماری، کاور، گالری، متن فارسی/انگلیسی و وضعیت انتشار.

## lessons
آموزش‌ها و دسته‌بندی آموزشی.

## products
اسکریپت/پلاگین/پریست؛ نرم‌افزار، قیمت، Free/Paid، نسخه جاری و `requires_license`.

## product_versions
نسخه‌های فایل محصول. مسیر فایل خصوصی در Storage ذخیره می‌شود.

## orders / order_items
سفارش و Snapshot محصول/قیمت در لحظه خرید.

## entitlements
مالکیت محصول برای کاربر؛ مبنای اجازه دانلود.

## payment_attempts
Authority و نتیجه Verify درگاه آنلاین. هر Authority به Order متصل است.

## licenses
License Key برای محصولات نیازمند لایسنس؛ وضعیت Active/Revoked، Seats و Activations.

## site_settings
تنظیمات عمومی و غیرمحرمانه مثل شماره کارت و اطلاعات تماس.

## Storage
- `site-media`: عمومی برای تصاویر پروژه/محصول
- `product-files`: خصوصی برای فایل‌های محصول
- `payment-receipts`: خصوصی برای رسید کارت‌به‌کارت
