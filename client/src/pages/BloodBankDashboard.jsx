import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2, FileText, Download } from '../components/Icons';
import * as XLSX from 'xlsx';

export const BloodBankDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('inventory'); // inventory, donations, requests, reports
  const [inventory, setInventory] = useState([]);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [msg, setMsg] = useState('');

  // Add Inventory Form
  const [newGroup, setNewGroup] = useState('A+');
  const [newUnits, setNewUnits] = useState(5);
  const [newExpiry, setNewExpiry] = useState('');

  useEffect(() => {
    fetchBankData();
  }, []);

  const fetchBankData = async () => {
    const token = localStorage.getItem('pulselife_token');
    try {
      const [invRes, donRes, reqRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/donations', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/requests', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (invRes.ok) setInventory(await invRes.json());
      if (donRes.ok) setDonations(await donRes.json());
      if (reqRes.ok) setRequests(await reqRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!newExpiry) {
      alert('Please set expiry date');
      return;
    }

    const token = localStorage.getItem('pulselife_token');
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bloodGroup: newGroup,
          units: newUnits,
          expiryDate: newExpiry
        })
      });

      if (res.ok) {
        setMsg(`Added ${newUnits} units of ${newGroup} to inventory!`);
        fetchBankData();
      }
    } catch (err) {
      alert('Error adding stock');
    }
  };

  const handleRemoveExpired = async () => {
    const token = localStorage.getItem('pulselife_token');
    try {
      const res = await fetch('/api/inventory/expired', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMsg(data.message);
      fetchBankData();
    } catch (err) {
      alert('Error clearing expired units');
    }
  };

  const handleAcceptDonation = async (id) => {
    const token = localStorage.getItem('pulselife_token');
    try {
      const res = await fetch(`/api/donations/${id}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMsg('Donation accepted!');
        fetchBankData();
      }
    } catch (err) {
      alert('Error accepting donation');
    }
  };

  const handleTestStatus = async (id, status) => {
    const token = localStorage.getItem('pulselife_token');
    try {
      const res = await fetch(`/api/donations/${id}/test-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ testStatus: status })
      });
      if (res.ok) {
        setMsg(`Testing status updated to ${status}. ${status === 'Passed' ? 'Units added to inventory automatically!' : ''}`);
        fetchBankData();
      }
    } catch (err) {
      alert('Error updating lab status');
    }
  };

  const handleUpdateRequestStatus = async (id, status) => {
    const token = localStorage.getItem('pulselife_token');
    try {
      const res = await fetch(`/api/requests/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setMsg(`Request status updated to ${status}.`);
        fetchBankData();
      }
    } catch (err) {
      alert('Error updating request');
    }
  };

  // Clean Native Print / PDF Report Generator
  const printPDF = (title, headers, rows) => {
    const printWindow = window.open('', '_blank');
    const tableRows = rows.map(r => `<tr>${r.map(cell => `<td style="padding:10px;border:1px solid #ddd;">${cell}</td>`).join('')}</tr>`).join('');
    const tableHeaders = headers.map(h => `<th style="padding:10px;background:#E63946;color:#fff;text-align:left;">${h}</th>`).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h2>🩸 PulseLife Blood Bank - ${title}</h2>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead><tr>${tableHeaders}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Excel Export
  const exportExcel = (reportTitle, dataArray) => {
    const worksheet = XLSX.utils.json_to_sheet(dataArray);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${reportTitle.toLowerCase().replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="badge badge-emergency">Blood Bank Portal</span>
          <h2 style={{ fontSize: '1.5rem', marginTop: '4px' }}>{user?.name || 'Chennai Blood Centre'}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Inventory Management • Donor Approvals • Lab Testing • Order Fulfillment
          </p>
        </div>
        <button onClick={handleRemoveExpired} className="btn-secondary" style={{ color: '#F87171', borderColor: 'rgba(248,113,113,0.3)' }}>
          <Trash2 size={16} /> Remove Expired Units
        </button>
      </div>

      {msg && (
        <div style={{ padding: '12px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '10px', color: '#34D399' }}>
          {msg}
        </div>
      )}

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { id: 'inventory', label: 'Inventory Stock' },
          { id: 'donations', label: 'Donor Verification & Lab Tests' },
          { id: 'requests', label: 'Hospital Requests' },
          { id: 'reports', label: 'Generate Reports' }
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

      {/* Tab 1: Inventory Stock Management */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Add New Stock Form */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} color="#10B981" /> Add New Blood Units to Inventory
            </h3>

            <form onSubmit={handleAddStock} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Blood Group</label>
                <select className="input-field" value={newGroup} onChange={(e) => setNewGroup(e.target.value)}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Units Count</label>
                <input type="number" min="1" className="input-field" value={newUnits} onChange={(e) => setNewUnits(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Expiry Date</label>
                <input type="date" className="input-field" value={newExpiry} onChange={(e) => setNewExpiry(e.target.value)} />
              </div>

              <button type="submit" className="btn-primary" style={{ height: '44px', justifyContent: 'center' }}>
                Add to Stock
              </button>
            </form>
          </div>

          {/* Current Inventory Table */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Current Inventory Reserve ({inventory.length} Records)</h3>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Blood Group</th>
                  <th>Units Available</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item._id}>
                    <td><span className="badge badge-emergency">{item.bloodGroup}</span></td>
                    <td style={{ fontWeight: 700, color: '#10B981' }}>{item.units} Units</td>
                    <td>{new Date(item.expiryDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${item.status === 'Available' ? 'badge-success' : 'badge-urgent'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Tab 2: Donations & Lab Testing */}
      {activeTab === 'donations' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Donor Submissions & Lab Testing Queue</h3>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Group</th>
                <th>Units</th>
                <th>Donation Date</th>
                <th>Approval</th>
                <th>Lab Testing</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donations.map(d => (
                <tr key={d._id}>
                  <td style={{ fontWeight: 600 }}>{d.donorId?.name || 'Anonymous Donor'}</td>
                  <td><span className="badge badge-emergency">{d.bloodGroup}</span></td>
                  <td>{d.units} Unit</td>
                  <td>{new Date(d.date).toLocaleDateString()}</td>
                  <td>
                    {d.accepted ? (
                      <span className="badge badge-success">Accepted</span>
                    ) : (
                      <button onClick={() => handleAcceptDonation(d._id)} className="btn-success" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                        Accept
                      </button>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${d.testStatus === 'Passed' ? 'badge-success' : d.testStatus === 'Failed' ? 'badge-emergency' : 'badge-pending'}`}>
                      {d.testStatus}
                    </span>
                  </td>
                  <td>
                    {d.testStatus === 'Pending' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleTestStatus(d._id, 'Passed')} className="btn-success" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                          Pass Test
                        </button>
                        <button onClick={() => handleTestStatus(d._id, 'Failed')} className="btn-danger" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                          Fail
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Hospital Requests */}
      {activeTab === 'requests' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Incoming Hospital Requests</h3>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Hospital</th>
                <th>Group</th>
                <th>Units</th>
                <th>Urgency</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Fulfill Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 600 }}>{r.hospitalId?.name || 'Hospital'}</td>
                  <td><span className="badge badge-emergency">{r.bloodGroup}</span></td>
                  <td>{r.units} Units</td>
                  <td>
                    <span className={`badge ${r.urgency === 'Emergency' ? 'badge-emergency' : 'badge-pending'}`}>
                      {r.urgency}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{r.reason}</td>
                  <td>
                    <span className={`badge ${r.status === 'Fulfilled' ? 'badge-success' : 'badge-urgent'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status !== 'Fulfilled' && (
                      <button 
                        onClick={() => handleUpdateRequestStatus(r._id, 'Fulfilled')} 
                        className="btn-primary" 
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      >
                        Dispatch & Fulfill
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Reports Generator */}
      {activeTab === 'reports' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>📂 Exportable Official Reports Engine</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Generate instant PDF documents or Excel spreadsheets for audits and government reporting.
          </p>

          <div className="grid-2">
            
            {/* Report Card 1 */}
            <div className="glass-panel" style={{ padding: '20px', background: '#161C26' }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>Donation Report</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Complete log of all registered donor blood donations and lab verification statuses.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => printPDF('Donation Report', ['Donor', 'Group', 'Units', 'Date', 'Lab Test'], 
                    donations.map(d => [d.donorId?.name || 'Donor', d.bloodGroup, d.units, new Date(d.date).toLocaleDateString(), d.testStatus])
                  )}
                  className="btn-primary" style={{ fontSize: '0.8rem' }}
                >
                  <FileText size={14} /> PDF / Print
                </button>
                <button 
                  onClick={() => exportExcel('Donation_Report', donations)}
                  className="btn-secondary" style={{ fontSize: '0.8rem' }}
                >
                  <Download size={14} /> Excel
                </button>
              </div>
            </div>

            {/* Report Card 2 */}
            <div className="glass-panel" style={{ padding: '20px', background: '#161C26' }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>Blood Stock Inventory Report</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Detailed breakdown of current reserves, available units, and expiration dates.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => printPDF('Blood Stock Report', ['Blood Group', 'Units', 'Expiry Date', 'Status'],
                    inventory.map(i => [i.bloodGroup, i.units, new Date(i.expiryDate).toLocaleDateString(), i.status])
                  )}
                  className="btn-primary" style={{ fontSize: '0.8rem' }}
                >
                  <FileText size={14} /> PDF / Print
                </button>
                <button 
                  onClick={() => exportExcel('Blood_Stock_Report', inventory)}
                  className="btn-secondary" style={{ fontSize: '0.8rem' }}
                >
                  <Download size={14} /> Excel
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
