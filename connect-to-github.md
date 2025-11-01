# راهنمای اتصال به GitHub

پروژه شما آماده است! برای اتصال به GitHub:

## اگر مخزن GitHub را هنوز نساخته‌اید:

1. به https://github.com بروید و وارد حساب کاربری خود شوید
2. روی دکمه "+" در بالای صفحه کلیک کنید و "New repository" را انتخاب کنید
3. نام مخزن را وارد کنید (مثلاً: `next-project`)
4. مخزن را Public یا Private انتخاب کنید
5. **DO NOT** initialize with README, .gitignore, or license (چون قبلاً ایجاد شده)
6. روی "Create repository" کلیک کنید

## بعد از ایجاد مخزن:

آدرس مخزن GitHub خود را در یکی از این فرمت‌ها بدهید:
- `https://github.com/YOUR_USERNAME/REPO_NAME.git`
- `git@github.com:YOUR_USERNAME/REPO_NAME.git`

## یا از دستورات زیر استفاده کنید:

```bash
# تنظیم remote repository (آدرس را با آدرس واقعی خود جایگزین کنید)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# تغییر نام شاخه به main (اگر نیاز باشد)
git branch -M main

# ارسال کد به GitHub
git push -u origin main
```

---

**نکته:** فایل‌های حساس مثل دیتابیس (`*.db`) و فایل‌های `.env` به `.gitignore` اضافه شده‌اند و به GitHub ارسال نخواهند شد.

