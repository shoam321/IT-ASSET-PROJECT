import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Parse connection string with special characters in password
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
