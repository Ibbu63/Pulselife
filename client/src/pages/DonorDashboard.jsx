import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Heart, Calendar, History, Sparkles, QrCode, User, Trash2
} from '../components/Icons';
import { QRCodeModal } from '../components/QRCodeModal';

export const DonorDashboard = ({ setActiveTab }) => {
  const { user, setUser, logout } = useContext(AuthContext);
  const [activeSubTab, setActiveSubTab] = useState('donate'); // donate, appointments, history, quiz, profile
  const [bloodBanks, setBloodBanks] = useState([]);
  const [donations, setDonations] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Form states for donation
  const [selectedBank, setSelectedBank] = useState('');
  const [donateUnits, setDonateUnits] = useState(1);
  const [remarks, setRemarks] = useState('');
  
  // Appointment form states
  const [apptBank, setApptBank] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('10:00 AM');

  // Eligibility quiz state
  const [quizScore, setQuizScore] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({
    age: true, weight: true, tattoo: false, travel: false, sickness: false
  });

  // Profile Edit State
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [editBloodGroup, setEditBloodGroup] = useState(user?.bloodGroup || 'A+');
  const [editAge, setEditAge] = useState(user?.age || 25);
  const [editGender, setEditGender] = useState(user?.gender || 'Male');
  const [profileMsg, setProfileMsg] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // QR Modal state
  const [showQR, setShowQR] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchDonorData();
  }, []);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditAddress(user.address || '');
      setEditBloodGroup(user.bloodGroup || 'A+');
      setEditAge(user.age || 25);
      setEditGender(user.gender || 'Male');
    }
  }, [user]);

  const fetchDonorData = async () => {
    const token = localStorage.getItem('pulselife_token');
    try {
      const [bbRes, donRes, apptRes] = await Promise.all([
        fetch('/api/blood-banks'),
        fetch('/api/donations', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (bbRes.ok) setBloodBanks(await bbRes.json());
      if (donRes.ok) setDonations(await donRes.json());
      if (apptRes.ok) setAppointments(await apptRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBank) {
      alert('Please select a Blood Bank center');
      return;
    }

    const token = localStorage.getItem('pulselife_token');
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bloodBankId: selectedBank,
          bloodGroup: user?.bloodGroup || 'A+',
          units: Number(donateUnits),
          remarks
        })
      });

      if (res.ok) {
        setMsg('🎉 Donation request submitted successfully! Pending Blood Bank verification.');
        setSelectedBank('');
        setRemarks('');
        fetchDonorData();
      }
    } catch (err) {
      alert('Error submitting donation request');
    }
  };

  const handleBookAppt = async (e) => {
    e.preventDefault();
    if (!apptBank || !apptDate) {
      alert('Please select blood bank and date');
      return;
    }

    const token = localStorage.getItem('pulselife_token');
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bloodBankId: apptBank,
          appointmentDate: apptDate,
          timeSlot: apptTime
        })
      });

      if (res.ok) {
        setMsg('📅 Donation appointment scheduled successfully!');
        setApptBank('');
        setApptDate('');
        fetchDonorData();
      }
    } catch (err) {
      alert('Error scheduling appointment');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setIsUpdating(true);

    const token = localStorage.getItem('pulselife_token');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          address: editAddress,
          bloodGroup: editBloodGroup,
          age: editAge,
          gender: editGender
        })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setProfileMsg('✅ Profile details updated successfully in database!');
      } else {
        const errData = await res.json();
        setProfileMsg(`⚠️ ${errData.message || 'Error updating profile'}`);
      }
    } catch (err) {
      setProfileMsg('⚠️ Server connection error while updating profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('⚠️ Are you sure you want to permanently delete your PulseLife account? This action cannot be undone.')) {
      return;
    }

    const token = localStorage.getItem('pulselife_token');
    try {
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert('Your account has been deleted successfully.');
        logout();
        setActiveTab('login');
      } else {
        alert('Failed to delete account.');
      }
    } catch (err) {
      alert('Error deleting account');
    }
  };

  const calculateEligibility = () => {
    const { age, weight, tattoo, travel, sickness } = quizAnswers;
    if (age && weight && !tattoo && !travel && !sickness) {
      setQuizScore('ELIGIBLE');
    } else {
      setQuizScore('INELIGIBLE');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
      
      {/* Clickable Donor Profile Header Card */}
      <div 
        className="glass-panel" 
        style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}
      >
        <div 
          onClick={() => setActiveSubTab('profile')}
          style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
          title="Click to Edit Profile"
        >
          <div style={{ background: 'var(--primary-red)', padding: '16px', borderRadius: '16px', boxShadow: '0 0 20px var(--primary-red-glow)' }}>
            <Heart size={32} color="#FFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.5rem' }}>{user?.name}</h2>
              <span className="badge badge-emergency">{user?.bloodGroup || 'O-'}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Donor ID: {user?._id?.substring(0, 10) || 'DNR-88910'} • Phone: {user?.phone || 'Not provided'} • Click to edit profile
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setActiveSubTab('profile')} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            <User size={16} /> Edit Profile & Settings
          </button>
          <button onClick={() => setShowQR(true)} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            <QrCode size={16} /> Digital Donor Pass
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '12px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '10px', color: '#34D399' }}>
          {msg}
        </div>
      )}

      {/* Sub-Navigation */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        {[
          { id: 'donate', label: 'Donate Blood', icon: Heart },
          { id: 'appointments', label: 'Book Appointment', icon: Calendar },
          { id: 'history', label: 'Donation History', icon: History },
          { id: 'quiz', label: 'Eligibility Quiz', icon: Sparkles },
          { id: 'profile', label: 'My Profile & Account', icon: User }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`btn-secondary ${activeSubTab === tab.id ? 'btn-primary' : ''}`}
            style={{ fontSize: '0.88rem' }}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-Tab 1: Donate Blood Request */}
      {activeSubTab === 'donate' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>🩸 Submit a Blood Donation Request</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Select your preferred blood bank center and submit your pledge to donate.
          </p>

          <form onSubmit={handleDonateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Select Blood Bank / Donation Center
              </label>
              <select 
                className="input-field"
                required
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
              >
                <option value="">-- Choose Center --</option>
                {bloodBanks.map(b => (
                  <option key={b._id} value={b._id}>{b.name} ({b.address})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Your Blood Group
                </label>
                <input type="text" className="input-field" readOnly value={user?.bloodGroup || 'A+'} />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Units to Donate
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max="2" 
                  className="input-field" 
                  value={donateUnits} 
                  onChange={(e) => setDonateUnits(e.target.value)} 
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Additional Remarks / Notes
              </label>
              <textarea 
                className="input-field" 
                rows="3" 
                placeholder="e.g. Prefer morning hours, first time donor..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
              Submit Donation Request
            </button>
          </form>
        </div>
      )}

      {/* Sub-Tab 2: Book Appointment */}
      {activeSubTab === 'appointments' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>📅 Schedule Donation Appointment</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Lock in a specific date and time slot to skip wait times at blood bank centers.
          </p>

          <form onSubmit={handleBookAppt} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px', marginBottom: '32px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Select Blood Bank Center
              </label>
              <select 
                className="input-field" 
                required 
                value={apptBank} 
                onChange={(e) => setApptBank(e.target.value)}
              >
                <option value="">-- Choose Center --</option>
                {bloodBanks.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Appointment Date
                </label>
                <input 
                  type="date" 
                  className="input-field" 
                  required 
                  value={apptDate} 
                  onChange={(e) => setApptDate(e.target.value)} 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Time Slot
                </label>
                <select className="input-field" value={apptTime} onChange={(e) => setApptTime(e.target.value)}>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
              Book Appointment Slot
            </button>
          </form>

          {/* Scheduled Appointments Table */}
          <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>Your Booked Appointments</h4>
          {appointments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No upcoming appointments scheduled.</p>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Center</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a._id}>
                    <td>{a.bloodBankId?.name || 'Central Blood Bank'}</td>
                    <td>{new Date(a.appointmentDate).toLocaleDateString()}</td>
                    <td>{a.timeSlot}</td>
                    <td><span className="badge badge-success">{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Sub-Tab 3: Donation History */}
      {activeSubTab === 'history' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>📜 Your Past Donations & Lab Results</h3>
          {donations.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No donation history records found.</p>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Blood Bank</th>
                  <th>Testing Status</th>
                  <th>Approval Status</th>
                </tr>
              </thead>
              <tbody>
                {donations.map(d => (
                  <tr key={d._id}>
                    <td>{new Date(d.date).toLocaleDateString()}</td>
                    <td><span className="badge badge-emergency">{d.bloodGroup}</span></td>
                    <td>{d.units} Unit</td>
                    <td>{d.bloodBankId?.name || 'Blood Center'}</td>
                    <td>
                      <span className={`badge ${d.testStatus === 'Passed' ? 'badge-success' : 'badge-pending'}`}>
                        {d.testStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${d.accepted ? 'badge-success' : 'badge-urgent'}`}>
                        {d.accepted ? 'Accepted' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Sub-Tab 4: Eligibility Screener Quiz */}
      {activeSubTab === 'quiz' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>✨ "Am I Eligible to Donate?" Interactive Screener</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Answer 5 quick medical safety questions to verify donor eligibility.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '600px', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem' }}>
              <input type="checkbox" checked={quizAnswers.age} onChange={(e) => setQuizAnswers({...quizAnswers, age: e.target.checked})} />
              I am between 18 and 65 years old.
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem' }}>
              <input type="checkbox" checked={quizAnswers.weight} onChange={(e) => setQuizAnswers({...quizAnswers, weight: e.target.checked})} />
              My weight is at least 45 kg (100 lbs).
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem' }}>
              <input type="checkbox" checked={quizAnswers.tattoo} onChange={(e) => setQuizAnswers({...quizAnswers, tattoo: e.target.checked})} />
              I got a tattoo or piercing in the last 6 months.
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem' }}>
              <input type="checkbox" checked={quizAnswers.sickness} onChange={(e) => setQuizAnswers({...quizAnswers, sickness: e.target.checked})} />
              I currently have a fever, cough, or infectious illness.
            </label>
          </div>

          <button onClick={calculateEligibility} className="btn-primary">
            Evaluate My Eligibility
          </button>

          {quizScore && (
            <div style={{
              marginTop: '20px', padding: '16px', borderRadius: '12px',
              background: quizScore === 'ELIGIBLE' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              border: quizScore === 'ELIGIBLE' ? '1px solid #10B981' : '1px solid #EF4444'
            }}>
              <h4 style={{ color: quizScore === 'ELIGIBLE' ? '#34D399' : '#F87171' }}>
                {quizScore === 'ELIGIBLE' ? '✅ You are Eligible to Donate Blood!' : '⚠️ Temporary Cooldown / Ineligible'}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {quizScore === 'ELIGIBLE' 
                  ? 'Great news! You meet all health & safety requirements for whole blood donation.' 
                  : 'Please wait until symptoms pass or 6 months post-tattoo before donating.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 5: My Profile & Account Settings */}
      {activeSubTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '700px' }}>
          
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="#E63946" /> Edit Donor Profile
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Update your personal details, blood group, contact information, and address in the database.
            </p>

            {profileMsg && (
              <div style={{
                padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem',
                background: profileMsg.startsWith('✅') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                border: profileMsg.startsWith('✅') ? '1px solid #10B981' : '1px solid #EF4444',
                color: profileMsg.startsWith('✅') ? '#34D399' : '#F87171'
              }}>
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Full Name
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Blood Group
                  </label>
                  <select 
                    className="input-field" 
                    value={editBloodGroup} 
                    onChange={(e) => setEditBloodGroup(e.target.value)}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={editPhone} 
                    onChange={(e) => setEditPhone(e.target.value)} 
                    placeholder="+1 (555) 019-2834"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Age
                  </label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={editAge} 
                    onChange={(e) => setEditAge(e.target.value)} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Gender
                  </label>
                  <select 
                    className="input-field" 
                    value={editGender} 
                    onChange={(e) => setEditGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Residential Address
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editAddress} 
                  onChange={(e) => setEditAddress(e.target.value)} 
                  placeholder="Street name, City, State"
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={isUpdating}
                style={{ justifyContent: 'center', marginTop: '10px', padding: '12px' }}
              >
                {isUpdating ? 'Saving to Database...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Delete Account Danger Zone */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.05)' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#F87171', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trash2 size={18} /> Danger Zone: Delete Account
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Deleting your account will permanently remove your profile, donor ID pass, and donation history from the PulseLife database. This action cannot be reversed.
            </p>
            <button 
              onClick={handleDeleteAccount} 
              className="btn-danger"
              style={{ fontSize: '0.85rem', padding: '10px 16px' }}
            >
              <Trash2 size={16} /> Delete My Donor Account Permanently
            </button>
          </div>

        </div>
      )}

      {/* Digital QR Modal */}
      <QRCodeModal 
        isOpen={showQR} 
        onClose={() => setShowQR(false)} 
        title="Official PulseLife Donor ID Pass" 
        qrValue={`DONOR:${user?._id}:${user?.name}:${user?.bloodGroup}`} 
        metadata={{
          Name: user?.name || 'Donor',
          Role: 'Registered Life Donor',
          'Blood Group': user?.bloodGroup || 'A+',
          Verified: 'Yes (ISBT Compliant)'
        }}
      />

    </div>
  );
};
