import React, { useState, useEffect } from 'react';
import { Sparkles, Trash2, FileText } from '../components/Icons';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import * as XLSX from 'xlsx';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement
);

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, ai, reports
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [aiPredictions, setAiPredictions] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    const token = localStorage.getItem('pulselife_token');
    try {
      const [statsRes, usersRes, aiRes] = await Promise.all([
        fetch('/api/admin/dashboard-stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/ai/predict-shortage')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsersList(await usersRes.json());
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        setAiPredictions(aiData.predictions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    const token = localStorage.getItem('pulselife_token');
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      alert('Error deleting user');
    }
  };

  const availabilityChartData = {
    labels: Object.keys(stats?.bloodGroupDistribution || { 'A+': 18, 'O-': 12, 'B+': 25, 'AB+': 8, 'O+': 30, 'A-': 6 }),
    datasets: [{
      label: 'Available Units',
      data: Object.values(stats?.bloodGroupDistribution || { 'A+': 18, 'O-': 12, 'B+': 25, 'AB+': 8, 'O+': 30, 'A-': 6 }),
      backgroundColor: 'rgba(230, 57, 70, 0.75)',
      borderColor: '#E63946',
      borderWidth: 2,
      borderRadius: 6
    }]
  };

  const donationTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [{
      label: 'Total Blood Units Donated',
      data: [45, 62, 58, 80, 95, 110, 130, 145],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      tension: 0.4,
      fill: true
    }]
  };

  const requestBreakdownData = {
    labels: ['Normal Requisition', 'Urgent Surgery', 'Emergency Trauma'],
    datasets: [{
      data: [55, 30, 15],
      backgroundColor: ['#3B82F6', '#F59E0B', '#EF4444'],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#F1F5F9' } } },
    scales: {
      x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  const printAdminReport = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Master Admin Report</title></head>
        <body style="font-family:Arial;padding:20px;">
          <h2>🩸 PulseLife Master Admin Analytics Report</h2>
          <p>Generated at: ${new Date().toLocaleString()}</p>
          <hr/>
          <h3>Platform KPI Metrics</h3>
          <ul>
            <li>Total Donors: <strong>${stats?.totalDonors || 142}</strong></li>
            <li>Available Blood Units: <strong>${stats?.totalBloodUnits || 185}</strong></li>
            <li>Active Requisitions: <strong>${stats?.activeRequests || 12}</strong></li>
            <li>Connected Hospitals: <strong>${stats?.totalHospitals || 8}</strong></li>
          </ul>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
      
      {/* Title */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="badge badge-emergency">Super Admin Control Center</span>
          <h2 style={{ fontSize: '1.6rem', marginTop: '4px' }}>System Overview & Analytics</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Full system control across Donors, Blood Banks, Hospitals, Inventories, AI Predictions & Reports.
          </p>
        </div>
        <button onClick={fetchAdminData} className="btn-secondary">
          Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: 'Overview & Charts' },
          { id: 'users', label: 'Manage Users' },
          { id: 'ai', label: 'AI Shortage Predictor & Demand Forecast' },
          { id: 'reports', label: 'System Reports' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`btn-secondary ${activeTab === t.id ? 'btn-primary' : ''}`}
            style={{ fontSize: '0.88rem' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="grid-4">
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL REGISTERED DONORS</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px', color: '#FFF' }}>
                {stats?.totalDonors || 142}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AVAILABLE BLOOD UNITS</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px', color: '#10B981' }}>
                {stats?.totalBloodUnits || 185}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ACTIVE BLOOD REQUESTS</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px', color: '#F59E0B' }}>
                {stats?.activeRequests || 12}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CONNECTED HOSPITALS</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px', color: '#3B82F6' }}>
                {stats?.totalHospitals || 8}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>📊 Blood Group Stock Availability</h3>
              <Bar data={availabilityChartData} options={chartOptions} />
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>📈 Monthly Donation Trends</h3>
              <Line data={donationTrendData} options={chartOptions} />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>🍩 Blood Request Urgency Distribution</h3>
            <div style={{ maxWidth: '300px', margin: '0 auto' }}>
              <Doughnut data={requestBreakdownData} />
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Users */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Registered System Users ({usersList.length})</h3>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Blood Group</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td><span className="badge badge-pending">{u.role}</span></td>
                  <td>{u.bloodGroup ? <span className="badge badge-emergency">{u.bloodGroup}</span> : '-'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.phone || '-'}</td>
                  <td>
                    {u.role !== 'Admin' && (
                      <button onClick={() => handleDeleteUser(u._id)} className="btn-danger" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: AI Predictor */}
      {activeTab === 'ai' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Sparkles size={24} color="#8B5CF6" />
            <h3 style={{ fontSize: '1.3rem' }}>AI Shortage Predictor & Demand Forecasting Engine</h3>
          </div>

          <div className="grid-2">
            {aiPredictions.map(pred => (
              <div key={pred.bloodGroup} className="glass-panel" style={{
                padding: '20px', background: '#161C26',
                borderLeft: pred.riskLevel.includes('CRITICAL') ? '4px solid #EF4444' : '4px solid #10B981'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-emergency" style={{ fontSize: '0.95rem' }}>{pred.bloodGroup}</span>
                  <span className={`badge ${pred.riskLevel.includes('CRITICAL') ? 'badge-emergency' : 'badge-success'}`}>
                    {pred.riskLevel}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  🤖 AI Recommendation: {pred.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Reports */}
      {activeTab === 'reports' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Super Admin Exportable Analytics & Audits</h3>
          <button onClick={printAdminReport} className="btn-primary">
            <FileText size={16} /> Print Master PDF Report
          </button>
        </div>
      )}

    </div>
  );
};
