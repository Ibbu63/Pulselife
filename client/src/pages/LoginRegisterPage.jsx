import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogIn, UserPlus, Droplets } from '../components/Icons';

export const LoginRegisterPage = ({ setActiveTab }) => {
  const { login, demoLogin } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('Donor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('Male');
  const [license, setLicense] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister ? {
      name, email, password, role, phone, address, bloodGroup, age, gender,
      licenseNumber: license, license
    } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
        setActiveTab('dashboard');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSignIn = async (roleName) => {
    setError('');
    setLoading(true);
    await demoLogin(roleName);
    setLoading(false);
    setActiveTab('dashboard');
  };

  return (
    <div style={{ maxWidth: '540px', margin: '40px auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '36px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex', background: 'rgba(230,57,70,0.15)', padding: '12px',
            borderRadius: '50%', marginBottom: '10px'
          }}>
            <Droplets size={32} color="#E63946" />
          </div>
          <h2 style={{ fontSize: '1.8rem' }}>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {isRegister ? 'Register as a Donor, Hospital, or Blood Bank Center' : 'Sign in to access your PulseLife role dashboard'}
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.4)', color: '#F87171', fontSize: '0.85rem', marginBottom: '20px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Role Selector Tabs if Register */}
          {isRegister && (
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Select Your System Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {['Donor', 'Blood Bank', 'Hospital'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{
                      padding: '8px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                      background: role === r ? 'var(--primary-red)' : 'rgba(255,255,255,0.06)',
                      color: '#FFF', border: '1px solid var(--border-color)'
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isRegister && (
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Full Name / Institution Name
              </label>
              <input 
                type="text"
                className="input-field"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Sarah Smith or City Blood Bank"
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Email Address
            </label>
            <input 
              type="email"
              className="input-field"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Password
            </label>
            <input 
              type="password"
              className="input-field"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {isRegister && role === 'Donor' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Blood Group
                </label>
                <select 
                  className="input-field"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Age
                </label>
                <input 
                  type="number"
                  className="input-field"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
            </div>
          )}

          {isRegister && (role === 'Blood Bank' || role === 'Hospital') && (
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                License Number
              </label>
              <input 
                type="text"
                className="input-field"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                placeholder="e.g. LIC-NY-99120"
              />
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', marginTop: '10px', padding: '12px' }}>
            {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        {/* 1-Click Quick Role Sign-in options for testing */}
        {!isRegister && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px', textAlign: 'center' }}>
              ⚡ 1-CLICK DEMO SIGN-IN AS:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { name: 'Donor', role: 'Donor' },
                { name: 'Blood Bank', role: 'Blood Bank' },
                { name: 'Hospital', role: 'Hospital' },
                { name: 'Super Admin', role: 'Admin' }
              ].map(opt => (
                <button
                  key={opt.role}
                  onClick={() => handleQuickDemoSignIn(opt.role)}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 10px', justifyContent: 'center' }}
                >
                  Sign in as {opt.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'none', border: 'none', color: '#60A5FA', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register Now"}
          </button>
        </div>

      </div>
    </div>
  );
};
