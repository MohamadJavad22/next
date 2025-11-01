const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'users.db');
const db = new Database(dbPath);

async function createAdmin() {
  console.log('🔧 ساخت حساب ادمین...\n');

  // اطلاعات ادمین
  const adminData = {
    name: 'مدیر سیستم',
    phone: '09123456789',
    username: 'admin',
    password: 'Admin@123',
    role: 'admin'
  };

  try {
    // بررسی وجود ادمین
    const existingAdmin = db.prepare('SELECT * FROM users WHERE username = ?').get(adminData.username);
    
    if (existingAdmin) {
      console.log('⚠️  حساب ادمین از قبل وجود دارد!');
      console.log('نام کاربری:', adminData.username);
      return;
    }

    // Hash کردن رمز عبور
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // ذخیره ادمین
    const result = db.prepare(
      'INSERT INTO users (name, phone, username, password, role) VALUES (?, ?, ?, ?, ?)'
    ).run(
      adminData.name,
      adminData.phone,
      adminData.username,
      hashedPassword,
      adminData.role
    );

    console.log('✅ حساب ادمین با موفقیت ساخته شد!\n');
    console.log('📋 اطلاعات ورود:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('نام کاربری: ', adminData.username);
    console.log('رمز عبور:   ', adminData.password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  لطفاً بعد از ورود، رمز عبور را تغییر دهید!');

  } catch (error) {
    console.error('❌ خطا در ساخت حساب ادمین:', error.message);
  } finally {
    db.close();
  }
}

createAdmin();

