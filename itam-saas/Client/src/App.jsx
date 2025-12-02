import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Trash2, Edit2, Menu, X, HardDrive, FileText, Users, FileCheck } from 'lucide-react';
import * as dbService from './services/db';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('devices');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    asset_tag: '',
    asset_type: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    assigned_user_name: '',
    status: 'In Use'
  });

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dbService.fetchAssets();
      setAssets(data);
    } catch (err) {
      console.error('Failed to load assets:', err);
      setError('Failed to load assets. Make sure the backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async () => {
    if (!formData.asset_tag.trim()) {
      alert('Please enter an asset tag');
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await dbService.updateAsset(editingId, formData);
        setEditingId(null);
      } else {
        await dbService.createAsset(formData);
      }
      setFormData({
        asset_tag: '',
        asset_type: '',
        manufacturer: '',
        model: '',
        serial_number: '',
        assigned_user_name: '',
        status: 'In Use'
      });
      setShowForm(false);
      await loadAssets();
    } catch (err) {
      setError(`Failed to ${editingId ? 'update' : 'add'} asset: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAsset = (asset) => {
    setEditingId(asset.id);
    setFormData({
      asset_tag: asset.asset_tag,
      asset_type: asset.asset_type,
      manufacturer: asset.manufacturer,
      model: asset.model,
      serial_number: asset.serial_number,
      assigned_user_name: asset.assigned_user_name,
      status: asset.status
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      asset_tag: '',
      asset_type: '',
      manufacturer: '',
      model: '',
      serial_number: '',
      assigned_user_name: '',
      status: 'In Use'
    });
  };

  const handleDeleteAsset = async (id) => {
    try {
      setLoading(true);
      await dbService.deleteAsset(id);
      await loadAssets();
    } catch (err) {
      setError(`Failed to delete asset: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = searchTerm 
    ? assets.filter(asset =>
        asset.asset_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.model.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : assets;

  // Screen rendering functions
  const renderDevicesScreen = () => (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
          <p className="text-red-200">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-sm mt-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading && (
        <div className="mb-6 p-4 bg-blue-900 border border-blue-700 rounded-lg">
          <p className="text-blue-200">Loading...</p>
        </div>
      )}

      {showForm && (
        <div className="bg-slate-700 border border-slate-600 rounded-lg p-6 mb-8 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">{editingId ? 'Edit Device' : 'Add New Device'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Asset Tag"
              value={formData.asset_tag}
              onChange={(e) => setFormData({...formData, asset_tag: e.target.value})}
              className="px-4 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400"
            />
            <select
              value={formData.asset_type}
              onChange={(e) => setFormData({...formData, asset_type: e.target.value})}
              className="px-4 py-2 bg-slate-600 border border-slate-500 rounded text-white"
            >
              <option value="">Select Type</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="cloud">Cloud</option>
              <option value="network">Network</option>
            </select>
            <input
              type="text"
              placeholder="Manufacturer"
              value={formData.manufacturer}
              onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
              className="px-4 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400"
            />
            <input
              type="text"
              placeholder="Model"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              className="px-4 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400"
            />
            <input
              type="text"
              placeholder="Serial Number"
              value={formData.serial_number}
              onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
              className="px-4 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400"
            />
            <input
              type="email"
              placeholder="Assigned User"
              value={formData.assigned_user_name}
              onChange={(e) => setFormData({...formData, assigned_user_name: e.target.value})}
              className="px-4 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddAsset}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
            >
              {editingId ? 'Update Device' : 'Save Device'}
            </button>
            <button
              onClick={handleCancelEdit}
              className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-slate-700 border border-slate-600 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 border-b border-slate-600">
              <tr>
                <th className="px-6 py-3 text-left text-slate-300 font-semibold">Asset Tag</th>
                <th className="px-6 py-3 text-left text-slate-300 font-semibold">Type</th>
                <th className="px-6 py-3 text-left text-slate-300 font-semibold">Manufacturer</th>
                <th className="px-6 py-3 text-left text-slate-300 font-semibold">Model</th>
                <th className="px-6 py-3 text-left text-slate-300 font-semibold">Assigned User</th>
                <th className="px-6 py-3 text-left text-slate-300 font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-slate-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                    No devices found
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="border-b border-slate-600 hover:bg-slate-600 transition">
                    <td className="px-6 py-4 text-white font-medium">{asset.asset_tag}</td>
                    <td className="px-6 py-4 text-slate-300">
                      <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs">
                        {asset.asset_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{asset.manufacturer}</td>
                    <td className="px-6 py-4 text-slate-300">{asset.model}</td>
                    <td className="px-6 py-4 text-slate-300">{asset.assigned_user_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        asset.status === 'In Use' ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditAsset(asset)}
                          className="text-blue-400 hover:text-blue-300 transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-700 border border-slate-600 rounded-lg p-6 shadow-lg">
          <p className="text-slate-400 text-sm">Total Devices</p>
          <p className="text-3xl font-bold text-white mt-2">{assets.length}</p>
        </div>
        <div className="bg-slate-700 border border-slate-600 rounded-lg p-6 shadow-lg">
          <p className="text-slate-400 text-sm">In Use</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{assets.filter(a => a.status === 'In Use').length}</p>
        </div>
        <div className="bg-slate-700 border border-slate-600 rounded-lg p-6 shadow-lg">
          <p className="text-slate-400 text-sm">Connected to PostgreSQL</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">✓</p>
        </div>
      </div>
    </>
  );

  const renderLicensesScreen = () => (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Licenses</h2>
        <p className="text-slate-400">Licenses module - coming soon</p>
      </div>
    </div>
  );

  const renderUsersScreen = () => (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Users</h2>
        <p className="text-slate-400">Users module - coming soon</p>
      </div>
    </div>
  );

  const renderContractsScreen = () => (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <FileCheck className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Contracts</h2>
        <p className="text-slate-400">Contracts module - coming soon</p>
      </div>
    </div>
  );

  const renderScreen = () => {
    switch(currentScreen) {
      case 'devices':
        return renderDevicesScreen();
      case 'licenses':
        return renderLicensesScreen();
      case 'users':
        return renderUsersScreen();
      case 'contracts':
        return renderContractsScreen();
      default:
        return renderDevicesScreen();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-slate-800 border-r border-slate-700 transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold text-white">IT ASSET</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => { setCurrentScreen('devices'); setShowForm(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              currentScreen === 'devices' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:bg-slate-700'
            }`}
          >
            <HardDrive className="w-5 h-5" />
            <span>Devices</span>
          </button>

          <button
            onClick={() => { setCurrentScreen('licenses'); setShowForm(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              currentScreen === 'licenses' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:bg-slate-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Licenses</span>
          </button>

          <button
            onClick={() => { setCurrentScreen('users'); setShowForm(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              currentScreen === 'users' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Users</span>
          </button>

          <button
            onClick={() => { setCurrentScreen('contracts'); setShowForm(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              currentScreen === 'contracts' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:bg-slate-700'
            }`}
          >
            <FileCheck className="w-5 h-5" />
            <span>Contracts</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-300"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {currentScreen === 'devices' && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Plus className="w-5 h-5" />
                Add Device
              </button>
            )}
          </div>
        </header>

        {/* Screen Content */}
        <main className="flex-1 overflow-auto p-8">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}
