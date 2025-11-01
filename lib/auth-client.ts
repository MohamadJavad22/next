// کمک‌کننده‌های authentication برای سمت کلاینت

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000; // 7 روز به میلی‌ثانیه

// چک کردن اینکه آیا کاربر لاگین کرده یا نه
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('auth-token');
  const loginTime = localStorage.getItem('login-time');
  
  if (!token || !loginTime) {
    return false;
  }
  
  // چک کردن اینکه آیا 7 روز گذشته یا نه
  const loginTimestamp = parseInt(loginTime);
  const now = Date.now();
  const timePassed = now - loginTimestamp;
  
  if (timePassed > WEEK_IN_MS) {
    // session منقضی شده - پاک کردن اطلاعات
    logout();
    return false;
  }
  
  return true;
}

// گرفتن اطلاعات کاربر
export function getUser() {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// گرفتن توکن
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth-token');
}

// خروج از حساب کاربری
export function logout() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('auth-token');
  localStorage.removeItem('user');
  localStorage.removeItem('login-time');
}

// چک کردن و redirect کردن اگر authentication نیاز است
export function requireAuth(): boolean {
  const authenticated = isAuthenticated();
  
  if (!authenticated && typeof window !== 'undefined') {
    window.location.href = '/login';
    return false;
  }
  
  return authenticated;
}

