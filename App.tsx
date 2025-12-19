
import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { Auth } from './features/Auth';
import { Layout } from './components/Layout';
import { AdminDashboard } from './features/Admin';
import { StudentDashboard } from './features/Student';
import { UserRole } from './types';
import { Loader2, Bus } from 'lucide-react';
import { ToastContainer } from './components/Toast';

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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
          <div className="bg-bgc-600 p-6 rounded-[2.5rem] text-white shadow-2xl shadow-bgc-500/40 relative z-10">
            <Bus className="animate-pulse" size={48} />
          </div>
          <div className="absolute inset-0 bg-bgc-400 blur-3xl opacity-20 animate-pulse" />
        </div>
        <h2 className="text-slate-900 font-black text-2xl tracking-tight mb-2">BGC Trust Transport</h2>
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <Loader2 className="animate-spin" size={18} />
          <span>Synchronizing with Cloud Node...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      {!currentUser ? (
        <Auth />
      ) : (
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
          {currentUser.role === UserRole.ADMIN ? (
            <AdminDashboard activeTab={activeTab} />
          ) : (
            <StudentDashboard activeTab={activeTab} />
          )}
        </Layout>
      )}
    </>
  );
}

export default App;
