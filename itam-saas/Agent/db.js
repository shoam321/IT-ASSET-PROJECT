import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Debug: Log all environment variables
console.log('=== DATABASE CONNECTION DEBUG ===');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL value:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('database')));

const connectionString = process.env.DATABASE_URL;

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
