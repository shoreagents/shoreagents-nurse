import { Pool, PoolConfig } from 'pg';

// Database configuration interface
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

// Default database configuration
const defaultConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'shoreagents_nurse',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production',
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
};

// Create PostgreSQL connection pool
const poolConfig: PoolConfig = {
  host: defaultConfig.host,
  port: defaultConfig.port,
  database: defaultConfig.database,
  user: defaultConfig.username,
  password: defaultConfig.password,
  ssl: defaultConfig.ssl ? { rejectUnauthorized: false } : false,
  max: defaultConfig.max,
  idleTimeoutMillis: defaultConfig.idleTimeoutMillis,
  connectionTimeoutMillis: defaultConfig.connectionTimeoutMillis,
};

// Initialize connection pool
export const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Database utility functions
export class Database {
  /**
   * Execute a query with optional parameters
   * @param text SQL query string
   * @param params Query parameters
   * @returns Query result
   */
  static async query(text: string, params?: any[]) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Executed query', { text, duration, rows: res.rowCount });
      }
      
      return res;
    } catch (error) {
      console.error('Database query error:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Execute a transaction with multiple queries
   * @param callback Function containing queries to execute in transaction
   * @returns Transaction result
   */
  static async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Test database connection
   * @returns Connection status
   */
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await Database.query('SELECT NOW() as current_time');
      return {
        success: true,
        message: `Connected successfully at ${result.rows[0].current_time}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Get database health information
   * @returns Database health stats
   */
  static async getHealthInfo() {
    try {
      const versionResult = await Database.query('SELECT version()');
      const connectionsResult = await Database.query(`
        SELECT 
          COUNT(*) as total_connections,
          COUNT(CASE WHEN state = 'active' THEN 1 END) as active_connections,
          COUNT(CASE WHEN state = 'idle' THEN 1 END) as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);
      
      return {
        version: versionResult.rows[0].version,
        connections: connectionsResult.rows[0],
        pool: {
          totalCount: pool.totalCount,
          idleCount: pool.idleCount,
          waitingCount: pool.waitingCount
        }
      };
    } catch (error) {
      throw new Error(`Failed to get health info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Close all database connections
   */
  static async close(): Promise<void> {
    await pool.end();
  }
}

// Export pool for direct access if needed
export default Database; 