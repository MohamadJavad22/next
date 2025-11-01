import { NextResponse } from 'next/server';
import { testConnection, getDatabaseHealth } from '@/lib/database-config';

export async function GET() {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test connection
    const isConnected = await testConnection();
    
    // Get health
    const health = await getDatabaseHealth();
    
    return NextResponse.json({
      success: true,
      database: {
        connected: isConnected,
        health: health,
        message: isConnected 
          ? '✅ دیتابیس متصل است' 
          : '❌ دیتابیس در دسترس نیست - از mock data استفاده می‌شود'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: '❌ خطا در اتصال به دیتابیس - از mock data استفاده می‌شود'
      }
    });
  }
}


