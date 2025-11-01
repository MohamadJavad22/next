# راهنمای اتصال به GitHub

## وضعیت فعلی
✅ Git نصب شد
✅ مخزن Git ایجاد شد
✅ فایل‌ها commit شدند
✅ Remote repository اضافه شد: `https://github.com/MohamadJavad22/next.git`
❌ Push به GitHub (مشکل اتصال)

## راه‌حل‌های ممکن

### راه‌حل 1: استفاده از Personal Access Token

اگر از HTTPS استفاده می‌کنید، GitHub دیگر از پسورد پشتیبانی نمی‌کند و نیاز به Personal Access Token دارید:

1. به https://github.com/settings/tokens بروید
2. روی "Generate new token" > "Generate new token (classic)" کلیک کنید
3. یک نام برای token انتخاب کنید (مثلاً: `next-project`)
4. دسترسی‌های زیر را فعال کنید:
   - ✅ `repo` (Full control of private repositories)
5. روی "Generate token" کلیک کنید
6. Token را کپی کنید (فقط یک بار نمایش داده می‌شود)

بعد از گرفتن token، از دستور زیر استفاده کنید:

```bash
# تنظیم credential helper
git config --global credential.helper wincred

# Push با وارد کردن username و token به عنوان password
git push -u origin main
# وقتی username را خواست: MohamadJavad22
# وقتی password را خواست: TOKEN خود را وارد کنید
```

### راه‌حل 2: استفاده از SSH (پیشنهادی)

1. تولید SSH Key:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# فایل را در مسیر پیش‌فرض ذخیره کنید (Enter بزنید)
# یک passphrase انتخاب کنید (اختیاری)
```

2. اضافه کردن SSH Key به GitHub:
```bash
# نمایش کلید عمومی
cat ~/.ssh/id_ed25519.pub
# یا
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

3. کپی محتوای کلید عمومی و اضافه کردن به GitHub:
   - به https://github.com/settings/keys بروید
   - روی "New SSH key" کلیک کنید
   - عنوان را وارد کنید
   - کلید را paste کنید
   - روی "Add SSH key" کلیک کنید

4. تغییر remote به SSH:
```bash
git remote set-url origin git@github.com:MohamadJavad22/next.git
git push -u origin main
```

### راه‌حل 3: بررسی Proxy و Firewall

اگر از proxy استفاده می‌کنید:

```bash
# تنظیم proxy (اگر می‌دانید proxy چیست)
git config --global http.proxy http://proxy.example.com:8080
git config --global https.proxy https://proxy.example.com:8080
```

اگر proxy ندارید:

```bash
# حذف proxy
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### راه‌حل 4: استفاده از GitHub Desktop

1. GitHub Desktop را از https://desktop.github.com دانلود و نصب کنید
2. با حساب GitHub خود وارد شوید
3. File > Add Local Repository
4. مسیر پروژه را انتخاب کنید: `C:\Users\MohamadJavad\OneDrive\Desktop\نکست`
5. روی "Publish repository" کلیک کنید

### راه‌حل 5: بررسی اتصال اینترنت

```bash
# تست اتصال به GitHub
ping github.com

# یا با PowerShell
Test-NetConnection github.com -Port 443
```

---

## دستورات مفید

```bash
# مشاهده remote های اضافه شده
git remote -v

# تغییر remote URL
git remote set-url origin https://github.com/MohamadJavad22/next.git
# یا
git remote set-url origin git@github.com:MohamadJavad22/next.git

# مشاهده وضعیت
git status

# مشاهده commit ها
git log

# Push
git push -u origin main
```

---

## وضعیت فعلی پروژه

- ✅ مخزن Git ایجاد شد
- ✅ همه فایل‌ها commit شدند (91 فایل)
- ✅ Remote repository تنظیم شد
- ⏳ در انتظار push به GitHub

بعد از حل مشکل اتصال، می‌توانید با دستور `git push -u origin main` کد خود را به GitHub ارسال کنید.

