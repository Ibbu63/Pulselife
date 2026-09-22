import React, { useState, useContext, useEffect } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PublicHome } from './pages/PublicHome';
import { FindBloodPage } from './pages/FindBloodPage';
import { LoginRegisterPage } from './pages/LoginRegisterPage';
import { DonorDashboard } from './pages/DonorDashboard';
import { BloodBankDashboard } from './pages/BloodBankDashboard';
import { HospitalDashboard } from './pages/HospitalDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AIChatbotModal } from './components/AIChatbotModal';

const MainContent = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('home'); // home, find-blood, login, dashboard
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Automatically scroll to the top of the newly loaded page when switching tabs (excluding current page)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const renderDashboard = () => {
    if (!user) return <LoginRegisterPage setActiveTab={setActiveTab} />;
    
    switch (user.role) {
      case 'Donor':
        return <DonorDashboard setActiveTab={setActiveTab} />;
      case 'Blood Bank':
        return <BloodBankDashboard />;
      case 'Hospital':
        return <HospitalDashboard />;
      case 'Admin':
        return <AdminDashboard />;
      default:
        return <DonorDashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        openChatbot={() => setIsChatbotOpen(true)} 
      />

      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '24px 20px' }}>
        {activeTab === 'home' && <PublicHome setActiveTab={setActiveTab} openChatbot={() => setIsChatbotOpen(true)} />}
        {activeTab === 'find-blood' && <FindBloodPage setActiveTab={setActiveTab} />}
        {activeTab === 'login' && <LoginRegisterPage setActiveTab={setActiveTab} />}
        {activeTab === 'dashboard' && renderDashboard()}
      </main>

      <AIChatbotModal 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />

      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
