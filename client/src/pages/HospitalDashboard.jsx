import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Hospital, PlusCircle, Send, History 
} from '../components/Icons';

export const HospitalDashboard = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [msg, setMsg] = useState('');

  // Request form state
  const [bloodGroup, setBloodGroup] = useState('O-');
  const [units, setUnits] = useState(2);
  const [urgency, setUrgency] = useState('Normal');
  const [reason, setReason] = useState('');
  const [assignedBank, setAssignedBank] = useState('');

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const fetchHospitalData = async () => {
    const token = localStorage.getItem('pulselife_token');
    try {
      const [reqRes, bbRes] = await Promise.all([
        fetch('/api/requests', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/blood-banks')
      ]);

      if (reqRes.ok) setRequests(await reqRes.json());
      if (bbRes.ok) setBloodBanks(await bbRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!reason) {
      alert('Please provide a medical reason for request');
      return;
    }

    const token = localStorage.getItem('pulselife_token');
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bloodGroup,
          units: Number(units),
          urgency,
          reason,
          assignedBloodBankId: assignedBank || null
        })
      });

      if (res.ok) {
        setMsg(`🚨 Blood request for ${units} units of ${bloodGroup} (${urgency}) submitted! Notifications dispatched.`);
        setReason('');
        fetchHospitalData();
      }
    } catch (err) {
      alert('Error creating blood request');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
      
      {/* Hospital Banner */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--accent-blue)', padding: '16px', borderRadius: '16px' }}>
            <Hospital size={32} color="#FFF" />
          </div>
          <div>
            <span className="badge badge-pending">Accredited Hospital Partner</span>
            <h2 style={{ fontSize: '1.5rem', marginTop: '4px' }}>{user?.name || 'R.G Hospital'}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              License: HOSP-NY-9021 • Phone: {user?.phone || '+1 (555) 234-5678'}
            </p>
          </div>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '12px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)', borderRadius: '10px', color: '#60A5FA' }}>
          {msg}
        </div>
      )}

      {/* Main Grid: Request Form + History */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Request Form */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={20} color="#3B82F6" /> Raise Blood Requirement
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Submit blood requisition orders. Emergency requests auto-alert standby donors.
          </p>

          <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Blood Group Needed
                </label>
                <select className="input-field" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Units Required
                </label>
                <input type="number" min="1" max="50" className="input-field" value={units} onChange={(e) => setUnits(e.target.value)} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Urgency Level
              </label>
              <select className="input-field" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                <option value="Normal">Normal Requisition</option>
                <option value="Urgent">Urgent (Surgery Scheduled)</option>
                <option value="Emergency">🚨 EMERGENCY (Critical Trauma)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Assign Blood Bank (Optional)
              </label>
              <select className="input-field" value={assignedBank} onChange={(e) => setAssignedBank(e.target.value)}>
                <option value="">-- Broadcast to All Centers --</option>
                {bloodBanks.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Medical Reason / Ward Details
              </label>
              <textarea 
                className="input-field" 
                rows="3" 
                placeholder="e.g. ICU Bed 12, Emergency bypass surgery patient..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
              <Send size={18} /> Submit Blood Requisition
            </button>
          </form>
        </div>

        {/* Track Request Status & History */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} color="#10B981" /> Track Requisitions & Status
          </h3>

          {requests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No blood requests raised yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {requests.map(r => (
                <div key={r._id} style={{
                  padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-emergency">{r.bloodGroup}</span>
                      <span style={{ fontWeight: 700, color: '#FFF' }}>{r.units} Units</span>
                      <span className={`badge ${r.urgency === 'Emergency' ? 'badge-emergency' : 'badge-pending'}`}>
                        {r.urgency}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Reason: {r.reason}
                    </p>
                  </div>
                  <div>
                    <span className={`badge ${r.status === 'Fulfilled' ? 'badge-success' : 'badge-urgent'}`}>
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
