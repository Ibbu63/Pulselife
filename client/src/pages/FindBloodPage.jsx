import React, { useState, useEffect } from 'react';
import { Search, Shield, Sparkles, AlertCircle } from '../components/Icons';

export const FindBloodPage = ({ setActiveTab }) => {
  const [bloodGroup, setBloodGroup] = useState('');
  const [city, setCity] = useState('');
  const [statusFilter, setStatusFilter] = useState('Available');
  const [inventoryItems, setInventoryItems] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [bloodGroup, city, statusFilter]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      let queryParams = new URLSearchParams();
      if (bloodGroup) queryParams.append('bloodGroup', bloodGroup);
      if (city) queryParams.append('city', city);
      if (statusFilter) queryParams.append('status', statusFilter);

      const res = await fetch(`/api/inventory?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInventoryItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSmartMatch = async () => {
    if (!bloodGroup) {
      alert('Please select a Blood Group first to trigger AI Smart Match!');
      return;
    }

    try {
      const res = await fetch(`/api/ai/recommend-donors?bloodGroup=${encodeURIComponent(bloodGroup)}`);
      if (res.ok) {
        const data = await res.json();
        setAiRecommendations(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '60px' }}>
      
      {/* Search Header Banner */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🔍 Find Available Blood & Smart Matching</h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Search real-time blood bank inventory across accredited centers and trigger AI donor recommendations.
        </p>

        {/* Search Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Blood Group
            </label>
            <select 
              className="input-field"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
            >
              <option value="">All Blood Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              City / Location
            </label>
            <input 
              type="text"
              className="input-field"
              placeholder="e.g. New York, Brooklyn..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Status Filter
            </label>
            <select 
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Available">Available Stock</option>
              <option value="Reserved">Reserved</option>
              <option value="Expired">Expired Stock</option>
            </select>
          </div>

          <button onClick={handleSmartMatch} className="btn-primary" style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
            <Sparkles size={16} /> AI Smart Match
          </button>
        </div>
      </div>

      {/* AI Smart Donor Match Section (If Triggered) */}
      {aiRecommendations && (
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(139, 92, 246, 0.4)', background: 'rgba(139, 92, 246, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#A78BFA', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} /> AI Donor Match Results for {aiRecommendations.targetBloodGroup}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Compatible Groups: {aiRecommendations.compatibleGroups.join(', ')} • Found {aiRecommendations.totalRecommended} eligible donors on standby.
              </p>
            </div>
            <button onClick={() => setAiRecommendations(null)} className="btn-secondary" style={{ fontSize: '0.75rem' }}>
              Dismiss AI Results
            </button>
          </div>

          <div className="grid-2">
            {aiRecommendations.donors.map(donor => (
              <div key={donor._id} className="glass-panel" style={{ padding: '16px', background: '#161C26' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="badge badge-success">{donor.bloodGroup}</span>
                    <h4 style={{ fontSize: '1rem', marginTop: '6px' }}>{donor.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {donor.address || 'Local Region'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>Score: {donor.suitabilityScore}</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Last Donated: {donor.daysSinceDonation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Search Results Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
          Blood Inventory Results ({inventoryItems.length} Records)
        </h3>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Searching live inventory database...</p>
        ) : inventoryItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <AlertCircle size={36} color="#F59E0B" style={{ marginBottom: '10px' }} />
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>No blood inventory found matching your current filter criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Blood Bank / Center</th>
                  <th>Location</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map(item => (
                  <tr key={item._id}>
                    <td>
                      <span className="badge badge-emergency" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                        {item.bloodGroup}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '1.05rem', color: '#10B981' }}>
                      {item.units} Units
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.bloodBankId?.name || 'Central Blood Bank'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>📍 {item.bloodBankId?.address || 'New York, NY'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'Available' ? 'badge-success' : 'badge-urgent'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => setActiveTab('login')} 
                        className="btn-primary"
                        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                      >
                        Request Unit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
