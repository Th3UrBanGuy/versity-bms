
import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { Auth } from './features/Auth';
import { Layout } from './components/Layout';
import { AdminDashboard } from './features/Admin';
import { StudentDashboard } from './features/Student';
import { UserRole } from './types';
import { Loader2 } from 'lucide-react';

function App() {
  const { currentUser, initData, isLoaded } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    setActiveTab('dashboard');
  }, [currentUser]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="bg-bgc-600 p-4 rounded-3xl text-white shadow-2xl shadow-bgc-500/50 animate-bounce">
          <Loader2 className="animate-spin" size={40} />
        </div>
        <p className="text-slate-900 font-bold text-lg">Connecting to Neon Cloud...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {currentUser.role === UserRole.ADMIN ? (
        <AdminDashboard activeTab={activeTab} />
      ) : (
        <StudentDashboard activeTab={activeTab} />
      )}
    </Layout>
  );
}

export default App;
