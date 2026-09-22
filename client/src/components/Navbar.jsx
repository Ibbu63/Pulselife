import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Heart, Droplets, Shield, Hospital, 
  User, Bell, LogOut, LogIn, Search, Sparkles 
} from './Icons';

export const Navbar = ({ activeTab, setActiveTab, openChatbot }) => {
  const { user, logout, demoLogin } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('pulselife_token');
      if (!token) return;
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    setShowNotifMenu(false);
    setShowRoleMenu(false);
    setIsMobileMenuOpen(false);
    if (activeTab !== 'login') {
      setActiveTab('login');
    }
  };

  const handleTabClick = (targetTab) => {
    setIsMobileMenuOpen(false);
    if (activeTab !== targetTab) {
      setActiveTab(targetTab);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('pulselife_token');
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', position: 'sticky', top: 0, zIndex: 100 }}>
      
      {/* Dynamic Emergency Alert Ticker Banner */}
      <div style={{
        background: 'linear-gradient(90deg, #991B1B, #EF4444, #991B1B)',
        padding: '6px 16px',
        color: '#FFF',
        fontSize: '0.8rem',
        fontWeight: 600,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
        gap: '8px',
        boxShadow: '0 2px 10px rgba(239, 68, 68, 0.4)'
      }}>
        <span style={{
          display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
          background: '#FFF', animation: 'pulse-red 1s infinite'
        }}></span>
        <span>🔴 LIVE NETWORK BROADCAST: Emergency O- & A+ Blood Required at Metro Trauma Care • 4 Donors Urgently Needed</span>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        
        {/* Logo */}
        <div 
          onClick={() => handleTabClick('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{ 
            background: 'linear-gradient(135deg, #E63946, #8B0000)', 
            padding: '8px', 
            borderRadius: '10px', 
            display: 'flex',
            boxShadow: '0 0 15px rgba(230, 57, 70, 0.5)'
          }}>
            <Droplets size={22} color="#FFF" className="heartbeat-icon" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #FFFFFF, #E63946)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              PULSELIFE
            </h1>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, display: 'block' }}>
              Blood Network
            </span>
          </div>
        </div>

        {/* Desktop Controls (Width > 900px) */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          <button 
            className={`btn-secondary ${activeTab === 'home' ? 'btn-primary' : ''}`}
            onClick={() => handleTabClick('home')}
            style={{ padding: '8px 14px', fontSize: '0.88rem' }}
          >
            Home
          </button>
          
          <button 
            className={`btn-secondary ${activeTab === 'find-blood' ? 'btn-primary' : ''}`}
            onClick={() => handleTabClick('find-blood')}
            style={{ padding: '8px 14px', fontSize: '0.88rem' }}
          >
            <Search size={15} /> Find Blood
          </button>

          {user && (
            <button 
              className={`btn-secondary ${activeTab === 'dashboard' ? 'btn-primary' : ''}`}
              onClick={() => handleTabClick('dashboard')}
              style={{ padding: '8px 14px', fontSize: '0.88rem' }}
            >
              <Shield size={15} /> Dashboard ({user.role})
            </button>
          )}

          <button 
            className="btn-secondary"
            onClick={openChatbot}
            style={{ padding: '8px 14px', fontSize: '0.88rem', color: '#60A5FA', borderColor: 'rgba(96, 165, 250, 0.3)' }}
          >
            <Sparkles size={15} /> AI Assistant
          </button>

          {/* Quick Role Switcher Dropdown - RESTRICTED TO SUPER ADMIN ONLY */}
          {user && user.role === 'Admin' && (
            <div style={{ position: 'relative' }}>
              <button 
                className="btn-secondary"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                style={{ 
                  background: 'rgba(230, 57, 70, 0.15)', 
                  borderColor: 'rgba(230, 57, 70, 0.3)', 
                  color: '#FF2E63', 
                  fontSize: '0.85rem', 
                  padding: '8px 14px' 
                }}
              >
                🔄 Admin Switcher
              </button>

              {showRoleMenu && (
                <div className="glass-panel" style={{
                  position: 'absolute', right: 0, top: '48px', width: '220px', padding: '12px',
                  zIndex: 200, background: '#161C26'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                    ADMIN PRESET PREVIEWS:
                  </div>
                  {['Admin', 'Blood Bank', 'Hospital', 'Donor'].map(role => (
                    <button
                      key={role}
                      onClick={() => {
                        demoLogin(role);
                        setShowRoleMenu(false);
                        handleTabClick('dashboard');
                      }}
                      style={{
                        width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: '6px',
                        background: user?.role === role ? 'var(--primary-red)' : 'transparent',
                        color: '#FFF', fontSize: '0.85rem', marginBottom: '4px', display: 'block'
                      }}
                    >
                      As {role}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notification Bell */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                style={{ background: 'none', border: 'none', color: '#FFF', position: 'relative', padding: '6px', cursor: 'pointer' }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 0, right: 0, background: '#EF4444', color: '#FFF',
                    fontSize: '0.65rem', fontWeight: 'bold', width: '18px', height: '18px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="glass-panel" style={{
                  position: 'absolute', right: 0, top: '48px', width: '320px', padding: '14px',
                  zIndex: 200, background: '#161C26', maxHeight: '400px', overflowY: 'auto'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ fontSize: '0.95rem' }}>Notifications</h4>
                    <button onClick={markAllRead} style={{ background: 'none', color: '#60A5FA', fontSize: '0.75rem' }}>
                      Mark all read
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No notifications yet.</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} style={{
                        padding: '10px', borderRadius: '8px', marginBottom: '8px',
                        background: n.read ? 'rgba(255,255,255,0.03)' : 'rgba(230,57,70,0.15)',
                        borderLeft: n.type === 'Emergency' ? '3px solid #EF4444' : '3px solid #3B82F6'
                      }}>
                        <p style={{ fontSize: '0.82rem', color: '#FFF' }}>{n.message}</p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Profile / Logout / Sign In */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFF' }}>{user.name}</div>
                <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>{user.role}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="btn-secondary"
                title="Logout"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <LogOut size={15} color="#F87171" /> Logout
              </button>
            </div>
          ) : (
            <button 
              className="btn-primary"
              onClick={() => handleTabClick('login')}
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            >
              <LogIn size={15} /> Sign In
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle (Width <= 900px) */}
        <button 
          className="mobile-hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid var(--border-color)',
            color: '#FFF',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '1.2rem',
            display: 'none'
          }}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {isMobileMenuOpen && (
        <div style={{
          background: 'rgba(11, 15, 23, 0.95)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border-color)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <button 
            className={`btn-secondary ${activeTab === 'home' ? 'btn-primary' : ''}`}
            onClick={() => handleTabClick('home')}
            style={{ justifyContent: 'center', width: '100%' }}
          >
            Home
          </button>
          
          <button 
            className={`btn-secondary ${activeTab === 'find-blood' ? 'btn-primary' : ''}`}
            onClick={() => handleTabClick('find-blood')}
            style={{ justifyContent: 'center', width: '100%' }}
          >
            <Search size={16} /> Find Blood
          </button>

          {user && (
            <button 
              className={`btn-secondary ${activeTab === 'dashboard' ? 'btn-primary' : ''}`}
              onClick={() => handleTabClick('dashboard')}
              style={{ justifyContent: 'center', width: '100%' }}
            >
              <Shield size={16} /> Dashboard ({user.role})
            </button>
          )}

          <button 
            className="btn-secondary"
            onClick={() => {
              setIsMobileMenuOpen(false);
              openChatbot();
            }}
            style={{ justifyContent: 'center', width: '100%', color: '#60A5FA' }}
          >
            <Sparkles size={16} /> AI Medical Assistant
          </button>

          {user && user.role === 'Admin' && (
            <button 
              className="btn-secondary"
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
              }}
              style={{ justifyContent: 'center', width: '100%', color: '#FF2E63' }}
            >
              🔄 Switch Admin Role
            </button>
          )}

          {user ? (
            <button 
              onClick={handleLogout}
              className="btn-danger"
              style={{ justifyContent: 'center', width: '100%', marginTop: '6px' }}
            >
              <LogOut size={16} /> Logout ({user.name})
            </button>
          ) : (
            <button 
              className="btn-primary"
              onClick={() => handleTabClick('login')}
              style={{ justifyContent: 'center', width: '100%', marginTop: '6px' }}
            >
              <LogIn size={16} /> Sign In / Register
            </button>
          )}
        </div>
      )}

    </header>
  );
};
