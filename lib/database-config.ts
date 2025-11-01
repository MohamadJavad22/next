// 🗄️ Database Configuration for Next.js Ad Platform
// PostgreSQL Database Connection and Configuration

// @ts-ignore - pg module will be installed
import { Pool } from 'pg';

// 🔧 Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'nextjs_ads',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// 🏊‍♂️ Connection Pool
let pool: Pool | null = null;

// 🔌 Get Database Pool
export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool(dbConfig);
    
    // Handle pool errors
    pool.on('error', (err: Error) => {
      console.error('🚨 Database pool error:', err);
    });
    
    // Handle pool connection
    pool.on('connect', () => {
      console.log('✅ Database connected successfully');
    });
  }
  
  return pool;
};

// 🔍 Execute Query with Error Handling
export const executeQuery = async <T = any>(
  query: string, 
  params: any[] = []
): Promise<T[]> => {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    console.log('🔍 Executing query:', query.substring(0, 100) + '...');
    const result = await client.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('🚨 Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// 🔍 Execute Single Query
export const executeSingle = async <T = any>(
  query: string, 
  params: any[] = []
): Promise<T | null> => {
  const results = await executeQuery<T>(query, params);
  return results.length > 0 ? results[0] : null;
};

// 🔍 Execute Transaction
export const executeTransaction = async (
  queries: Array<{ query: string; params?: any[] }>
): Promise<any[]> => {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const results: any[] = [];
    for (const { query, params = [] } of queries) {
      const result = await client.query(query, params);
      results.push(result.rows);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('🚨 Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// 🧪 Test Database Connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await executeSingle('SELECT NOW() as current_time');
    console.log('✅ Database connection test successful:', result);
    return true;
  } catch (error) {
    console.error('🚨 Database connection test failed:', error);
    return false;
  }
};

// 🔄 Close Database Pool
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 Database pool closed');
  }
};

// 📊 Database Health Check
export const getDatabaseHealth = async () => {
  try {
    const pool = getPool();
    const totalCount = await pool.query('SELECT COUNT(*) as count FROM pg_stat_activity');
    const activeCount = await pool.query('SELECT COUNT(*) as count FROM pg_stat_activity WHERE state = $1', ['active']);
    
    return {
      status: 'healthy',
      totalConnections: parseInt(totalCount.rows[0].count),
      activeConnections: parseInt(activeCount.rows[0].count),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
};

// 🗃️ Database Types
export interface DatabaseUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  phone?: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'moderator';
  is_active: boolean;
  is_verified: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseAd {
  id: number;
  user_id: number;
  category_id?: number;
  title: string;
  description: string;
  price?: number;
  currency: string;
  condition: 'new' | 'good' | 'fair' | 'poor';
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  status: 'active' | 'inactive' | 'sold' | 'expired' | 'rejected';
  views: number;
  favorites_count: number;
  is_featured: boolean;
  is_urgent: boolean;
  created_at: Date;
  updated_at: Date;
  expires_at?: Date;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface DatabaseAdImage {
  id: number;
  ad_id: number;
  image_url: string;
  image_alt?: string;
  sort_order: number;
  is_primary: boolean;
  file_size?: number;
  width?: number;
  height?: number;
  created_at: Date;
}

export interface DatabaseCategory {
  id: number;
  name: string;
  name_fa: string;
  slug: string;
  icon?: string;
  parent_id?: number;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
}

// 🎯 Environment Variables Template
export const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT', 
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD'
];

// 🔍 Validate Environment Variables
export const validateEnvVars = (): boolean => {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('🚨 Missing required environment variables:', missing);
    return false;
  }
  
  return true;
};

export default {
  getPool,
  executeQuery,
  executeSingle,
  executeTransaction,
  testConnection,
  closePool,
  getDatabaseHealth,
  validateEnvVars
};
