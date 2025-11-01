const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'users.db');
const db = new Database(dbPath);

console.log('📊 لیست کاربران:\n');

try {
  const users = db.prepare('SELECT id, name, username, phone, role, created_at FROM users').all();
  
  if (users.length === 0) {
    console.log('⚠️  هیچ کاربری یافت نشد!');
  } else {
    console.log(`تعداد کاربران: ${users.length}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   نام کاربری: ${user.username}`);
      console.log(`   شماره: ${user.phone}`);
      console.log(`   نقش: ${user.role === 'admin' ? '👑 مدیر' : '👤 کاربر عادی'}`);
      console.log(`   تاریخ عضویت: ${new Date(user.created_at).toLocaleDateString('fa-IR')}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  }
} catch (error) {
  console.error('❌ خطا:', error.message);
} finally {
  db.close();
}

