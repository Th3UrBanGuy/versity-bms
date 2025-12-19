
import React, { useEffect } from 'react';
import { useStore } from '../store';
import { UserRole } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, Calendar, LayoutDashboard, LogOut, 
  MapPin, Ticket, UserCircle, Menu, X, Settings2
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, logout, notifications, removeNotification } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        removeNotification(notifications[0].id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications, removeNotification]);

  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'management', label: 'System Mgmt', icon: Settings2 },
  ];

  const studentMenu = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'book', label: 'Book Seat', icon: Ticket },
    { id: 'history', label: 'Tickets', icon: Calendar },
  ];

  const menuItems = isAdmin ? adminMenu : studentMenu;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[40] lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[50]
        w-[85vw] sm:w-80 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col shadow-2xl lg:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 sm:p-10 border-b border-slate-100">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="bg-gradient-to-tr from-bgc-600 to-bgc-400 text-white p-3 rounded-2xl shadow-lg shadow-bgc-500/20">
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-black text-xl sm:text-2xl text-slate-900 tracking-tighter leading-none">BGC Trust</h1>
              <p className="text-[9px] font-black text-bgc-600 uppercase tracking-widest mt-1">Bus Ecosystem</p>
            </div>
          </motion.div>
        </div>

        <nav className="p-4 sm:p-6 space-y-1.5 flex-1 overflow-y-auto">
          <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Navigation</p>
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative ${
                activeTab === item.id 
                  ? 'bg-bgc-50 text-bgc-700 font-black' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold'
              }`}
            >
              {activeTab === item.id && (
                 <motion.div 
                   layoutId="activeTabIndicator"
                   className="absolute left-0 top-3 bottom-3 w-1 bg-bgc-500 rounded-r-full" 
                 />
              )}
              <item.icon size={20} className={activeTab === item.id ? 'text-bgc-600' : 'text-slate-400 group-hover:text-slate-600'} />
              <span className="text-sm">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="bg-slate-100 text-slate-500 p-2 rounded-xl">
              <UserCircle size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 truncate">{currentUser?.name}</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">ID: {currentUser?.identifier}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-white border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-2xl transition-all text-xs font-black shadow-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 lg:hidden flex justify-between items-center z-[30] sticky top-0">
          <div className="flex items-center gap-2">
            <div className="bg-bgc-600 p-1.5 rounded-lg text-white">
              <Bus size={18} />
            </div>
            <span className="font-black text-slate-900 tracking-tight uppercase text-xs">BGCTUB Transport</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-slate-100 rounded-xl text-slate-600 active:scale-90 transition-transform">
            <Menu size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 scroll-smooth">
          <div className="max-w-6xl mx-auto min-h-full">
            <AnimatePresence mode='wait'>
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
                 className="h-full"
               >
                 {children}
               </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};
