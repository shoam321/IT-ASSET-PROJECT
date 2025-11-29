import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Parse connection string - handle Railway shared variables
const connectionString = process.env.DATABASE_URL || process.env['${{ shared.DATABASE_URL }}'];

console.log('DATABASE_URL:', connectionString ? 'Connected' : 'Not found');
console.log('Environment:', process.env.NODE_ENV);

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
