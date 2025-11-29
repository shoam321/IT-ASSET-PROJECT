import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import * as db from './queries.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigin = process.env.REACT_APP_URL || 'https://it-asset-project.vercel.app';
console.log('🔧 CORS Origin:', allowedOrigin);

// Middleware
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialize database on startup
async function startServer() {
  let retries = 3;
  while (retries > 0) {
    try {
      await db.initDatabase();
      console.log('✅ Database initialized successfully');
      return;
    } catch (error) {
      retries--;
      console.error(`❌ Database init failed (${retries} retries left):`, error.message);
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      }
    }
  }
  console.warn('⚠️ Database initialization failed after retries - server starting without DB');
}

// --- ROUTES ---

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all assets
app.get('/api/assets', async (req, res) => {
  try {
    const assets = await db.getAllAssets();
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get asset by ID
app.get('/api/assets/:id', async (req, res) => {
  try {
    const asset = await db.getAssetById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search assets
app.get('/api/assets/search/:query', async (req, res) => {
  try {
    const assets = await db.searchAssets(req.params.query);
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get asset statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.getAssetStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new asset
app.post('/api/assets', async (req, res) => {
  try {
    const asset = await db.createAsset(req.body);
    res.status(201).json(asset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update asset
app.put('/api/assets/:id', async (req, res) => {
  try {
    const asset = await db.updateAsset(req.params.id, req.body);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete asset
app.delete('/api/assets/:id', async (req, res) => {
  try {
    const asset = await db.deleteAsset(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json({ message: 'Asset deleted', asset });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize and start server
startServer();

// Export for Vercel
export default app;

// Start listening (both production and development)
app.listen(PORT, () => {
  console.log(`\n🚀 IT Asset Tracker Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health\n`);
});
