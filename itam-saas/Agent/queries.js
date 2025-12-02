import pool from './db.js';

/**
 * Initialize database tables - Create if they don't exist
 */
export async function initDatabase() {
  try {
    console.log('🔄 Starting database initialization...');
    
    // Create assets table
    console.log('📝 Creating assets table if not exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_tag VARCHAR(255) UNIQUE NOT NULL,
        asset_type VARCHAR(50) NOT NULL,
        manufacturer VARCHAR(255),
        model VARCHAR(255),
        serial_number VARCHAR(255) UNIQUE,
        assigned_user_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'In Use',
        cost DECIMAL(10, 2) DEFAULT 0,
        discovered BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Assets table created/verified');

    // Create licenses table
    console.log('📝 Creating licenses table if not exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS licenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        license_name VARCHAR(255) NOT NULL,
        license_type VARCHAR(50) NOT NULL,
        license_key VARCHAR(255) UNIQUE,
        software_name VARCHAR(255),
        vendor VARCHAR(255),
        expiration_date DATE,
        quantity INTEGER DEFAULT 1,
        status VARCHAR(50) DEFAULT 'Active',
        cost DECIMAL(10, 2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Licenses table created/verified');

    // Create users table
    console.log('📝 Creating users table if not exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        department VARCHAR(255),
        phone VARCHAR(20),
        role VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Active',
        assigned_assets INTEGER DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created/verified');

    // Create contracts table
    console.log('📝 Creating contracts table if not exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contracts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        contract_name VARCHAR(255) NOT NULL,
        vendor VARCHAR(255),
        contract_type VARCHAR(50),
        start_date DATE,
        end_date DATE,
        contract_value DECIMAL(12, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Active',
        renewal_date DATE,
        contact_person VARCHAR(255),
        contact_email VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Contracts table created/verified');

    // Create indexes
    console.log('📝 Creating indexes...');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_asset_tag ON assets(asset_tag);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_status ON assets(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_license_name ON licenses(license_name);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_license_status ON licenses(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_name ON users(user_name);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_status ON users(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contract_name ON contracts(contract_name);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contract_status ON contracts(status);`);
    console.log('✅ Indexes created/verified');

    // Verify tables exist
    const tablesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'assets'
      ) as assets_exists,
      EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'licenses'
      ) as licenses_exists,
      EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'users'
      ) as users_exists,
      EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'contracts'
      ) as contracts_exists;
    `);
    
    const { assets_exists, licenses_exists, users_exists, contracts_exists } = tablesCheck.rows[0];
    if (assets_exists && licenses_exists && users_exists && contracts_exists) {
      console.log('✅ Database tables initialized successfully');
    } else {
      throw new Error(`Table verification failed: assets=${assets_exists}, licenses=${licenses_exists}, users=${users_exists}, contracts=${contracts_exists}`);
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

/**
 * Get all assets
 */
export async function getAllAssets() {
  try {
    const result = await pool.query('SELECT * FROM assets ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
}

/**
 * Get asset by ID
 */
export async function getAssetById(id) {
  try {
    const result = await pool.query('SELECT * FROM assets WHERE id = $1', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching asset:', error);
    throw error;
  }
}

/**
 * Get asset by tag
 */
export async function getAssetByTag(assetTag) {
  try {
    const result = await pool.query('SELECT * FROM assets WHERE asset_tag = $1', [assetTag]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching asset by tag:', error);
    throw error;
  }
}

/**
 * Create new asset
 */
export async function createAsset(assetData) {
  const { asset_tag, asset_type, manufacturer, model, serial_number, assigned_user_name, status, cost, discovered } = assetData;
  
  try {
    const result = await pool.query(
      `INSERT INTO assets (asset_tag, asset_type, manufacturer, model, serial_number, assigned_user_name, status, cost, discovered)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [asset_tag, asset_type, manufacturer, model, serial_number, assigned_user_name, status || 'In Use', cost || 0, discovered || false]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating asset:', error);
    throw error;
  }
}

/**
 * Update asset
 */
export async function updateAsset(id, assetData) {
  const fields = [];
  const values = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(assetData)) {
    if (value !== undefined && value !== null) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push(`updated_at = $${paramCount}`);
  values.push(new Date());
  values.push(id);

  try {
    const query = `UPDATE assets SET ${fields.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating asset:', error);
    throw error;
  }
}

/**
 * Delete asset
 */
export async function deleteAsset(id) {
  try {
    const result = await pool.query('DELETE FROM assets WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting asset:', error);
    throw error;
  }
}

/**
 * Search assets
 */
export async function searchAssets(query) {
  try {
    const searchTerm = `%${query}%`;
    const result = await pool.query(
      `SELECT * FROM assets 
       WHERE asset_tag ILIKE $1 
          OR manufacturer ILIKE $1 
          OR model ILIKE $1 
          OR assigned_user_name ILIKE $1
       ORDER BY created_at DESC`,
      [searchTerm]
    );
    return result.rows;
  } catch (error) {
    console.error('Error searching assets:', error);
    throw error;
  }
}

/**
 * Get asset statistics
 */
export async function getAssetStats() {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_assets,
        COUNT(CASE WHEN status = 'In Use' THEN 1 END) as in_use,
        COUNT(CASE WHEN discovered = true THEN 1 END) as discovered,
        COUNT(CASE WHEN status = 'Retired' THEN 1 END) as retired
      FROM assets
    `);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}

// ============ LICENSES FUNCTIONS ============

/**
 * Get all licenses
 */
export async function getAllLicenses() {
  try {
    const result = await pool.query('SELECT * FROM licenses ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Error fetching licenses:', error);
    throw error;
  }
}

/**
 * Create license
 */
export async function createLicense(licenseData) {
  const { license_name, license_type, license_key, software_name, vendor, expiration_date, quantity, status, cost, notes } = licenseData;
  try {
    const result = await pool.query(
      `INSERT INTO licenses (license_name, license_type, license_key, software_name, vendor, expiration_date, quantity, status, cost, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [license_name, license_type, license_key, software_name, vendor, expiration_date, quantity, status || 'Active', cost || 0, notes]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating license:', error);
    throw error;
  }
}

/**
 * Update license
 */
export async function updateLicense(id, licenseData) {
  const fields = [];
  const values = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(licenseData)) {
    if (value !== undefined && value !== null) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push(`updated_at = $${paramCount}`);
  values.push(new Date());
  values.push(id);

  try {
    const query = `UPDATE licenses SET ${fields.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating license:', error);
    throw error;
  }
}

/**
 * Delete license
 */
export async function deleteLicense(id) {
  try {
    const result = await pool.query('DELETE FROM licenses WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting license:', error);
    throw error;
  }
}

/**
 * Search licenses
 */
export async function searchLicenses(query) {
  try {
    const searchTerm = `%${query}%`;
    const result = await pool.query(
      `SELECT * FROM licenses 
       WHERE license_name ILIKE $1 
          OR software_name ILIKE $1 
          OR vendor ILIKE $1 
          OR license_key ILIKE $1
       ORDER BY created_at DESC`,
      [searchTerm]
    );
    return result.rows;
  } catch (error) {
    console.error('Error searching licenses:', error);
    throw error;
  }
}

// ============ USERS FUNCTIONS ============

/**
 * Get all users
 */
export async function getAllUsers() {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Create user
 */
export async function createUser(userData) {
  const { user_name, email, department, phone, role, status, notes } = userData;
  try {
    const result = await pool.query(
      `INSERT INTO users (user_name, email, department, phone, role, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user_name, email, department, phone, role, status || 'Active', notes]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update user
 */
export async function updateUser(id, userData) {
  const fields = [];
  const values = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(userData)) {
    if (value !== undefined && value !== null) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push(`updated_at = $${paramCount}`);
  values.push(new Date());
  values.push(id);

  try {
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Delete user
 */
export async function deleteUser(id) {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Search users
 */
export async function searchUsers(query) {
  try {
    const searchTerm = `%${query}%`;
    const result = await pool.query(
      `SELECT * FROM users 
       WHERE user_name ILIKE $1 
          OR email ILIKE $1 
          OR department ILIKE $1 
          OR phone ILIKE $1
       ORDER BY created_at DESC`,
      [searchTerm]
    );
    return result.rows;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

// ============ CONTRACTS FUNCTIONS ============

/**
 * Get all contracts
 */
export async function getAllContracts() {
  try {
    const result = await pool.query('SELECT * FROM contracts ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Error fetching contracts:', error);
    throw error;
  }
}

/**
 * Create contract
 */
export async function createContract(contractData) {
  const { contract_name, vendor, contract_type, start_date, end_date, contract_value, status, renewal_date, contact_person, contact_email, notes } = contractData;
  try {
    const result = await pool.query(
      `INSERT INTO contracts (contract_name, vendor, contract_type, start_date, end_date, contract_value, status, renewal_date, contact_person, contact_email, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [contract_name, vendor, contract_type, start_date, end_date, contract_value || 0, status || 'Active', renewal_date, contact_person, contact_email, notes]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating contract:', error);
    throw error;
  }
}

/**
 * Update contract
 */
export async function updateContract(id, contractData) {
  const fields = [];
  const values = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(contractData)) {
    if (value !== undefined && value !== null) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push(`updated_at = $${paramCount}`);
  values.push(new Date());
  values.push(id);

  try {
    const query = `UPDATE contracts SET ${fields.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating contract:', error);
    throw error;
  }
}

/**
 * Delete contract
 */
export async function deleteContract(id) {
  try {
    const result = await pool.query('DELETE FROM contracts WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting contract:', error);
    throw error;
  }
}

/**
 * Search contracts
 */
export async function searchContracts(query) {
  try {
    const searchTerm = `%${query}%`;
    const result = await pool.query(
      `SELECT * FROM contracts 
       WHERE contract_name ILIKE $1 
          OR vendor ILIKE $1 
          OR contact_person ILIKE $1 
          OR contact_email ILIKE $1
       ORDER BY created_at DESC`,
      [searchTerm]
    );
    return result.rows;
  } catch (error) {
    console.error('Error searching contracts:', error);
    throw error;
  }
}
