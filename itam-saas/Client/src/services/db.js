// Database service for React frontend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Fetch all assets from server
 */
export async function fetchAssets() {
  try {
    const response = await fetch(`${API_URL}/assets`);
    if (!response.ok) throw new Error('Failed to fetch assets');
    return await response.json();
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
}

/**
 * Search assets
 */
export async function searchAssets(query) {
  try {
    const response = await fetch(`${API_URL}/assets/search/${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search assets');
    return await response.json();
  } catch (error) {
    console.error('Error searching assets:', error);
    throw error;
  }
}

/**
 * Get asset by ID
 */
export async function getAssetById(id) {
  try {
    const response = await fetch(`${API_URL}/assets/${id}`);
    if (!response.ok) throw new Error('Asset not found');
    return await response.json();
  } catch (error) {
    console.error('Error fetching asset:', error);
    throw error;
  }
}

/**
 * Create new asset
 */
export async function createAsset(assetData) {
  try {
    const response = await fetch(`${API_URL}/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData),
    });
    if (!response.ok) throw new Error('Failed to create asset');
    return await response.json();
  } catch (error) {
    console.error('Error creating asset:', error);
    throw error;
  }
}

/**
 * Update asset
 */
export async function updateAsset(id, assetData) {
  try {
    const response = await fetch(`${API_URL}/assets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData),
    });
    if (!response.ok) throw new Error('Failed to update asset');
    return await response.json();
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
    const response = await fetch(`${API_URL}/assets/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete asset');
    return await response.json();
  } catch (error) {
    console.error('Error deleting asset:', error);
    throw error;
  }
}

/**
 * Get asset statistics
 */
export async function getAssetStats() {
  try {
    const response = await fetch(`${API_URL}/../stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}
