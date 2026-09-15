# جریان پرداخت

## کارت‌به‌کارت

کاربر → سفارش Pending → آپلود رسید → پنل Admin → تأیید صدف → Paid → Entitlement → License در صورت نیاز → Email → دانلود امن

## درگاه آنلاین

کاربر → `payment-create` → ساخت Order و Authority → انتقال به درگاه → Callback → `payment-verify` → Verify سرور به سرور → Paid → Entitlement → License در صورت نیاز → Email → دانلود امن

## اصل مهم

Front-end هیچ‌وقت خودش سفارش را Paid نمی‌کند. وضعیت Paid فقط در Backend ایجاد می‌شود.
