import React, { useEffect } from 'react';
import { useStore } from '../store';
import { UserRole } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, Calendar, LayoutDashboard, LogOut, 
  MapPin, Ticket, UserCircle, Menu, X, Bell, CheckCircle, AlertCircle, Info 
} from 'lucide-react';

// Toast Component
const ToastContainer = () => {
  const { notifications, removeNotification } = useStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            layout
            className={`
              pointer-events-auto min-w-[320px] p-5 rounded-2xl shadow-2xl flex items-center gap-4 border backdrop-blur-xl
              ${note.type === 'success' ? 'bg-white/95 border-green-200 text-green-900' : ''}
              ${note.type === 'error' ? 'bg-white/95 border-red-200 text-red-900' : ''}
              ${note.type === 'info' ? 'bg-white/95 border-blue-200 text-blue-900' : ''}
            `}
          >
            <div className={`p-2 rounded-xl ${
              note.type === 'success' ? 'bg-green-100 text-green-600' : 
              note.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {note.type === 'success' && <CheckCircle size={20} />}
              {note.type === 'error' && <AlertCircle size={20} />}
              {note.type === 'info' && <Info size={20} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-black">{note.message}</p>
            </div>
            <button 
              onClick={() => removeNotification(note.id)}
              className="p-1 hover:bg-black/5 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

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
    { id: 'buses', label: 'Fleet Management', icon: Bus },
    { id: 'destinations', label: 'Destinations', icon: MapPin },
    { id: 'schedules', label: 'Schedules', icon: Calendar },
  ];

  const studentMenu = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'book', label: 'Book a Seat', icon: Ticket },
    { id: 'history', label: 'My Tickets', icon: Calendar },
  ];

  const menuItems = isAdmin ? adminMenu : studentMenu;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <ToastContainer />
      
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[40] lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[50]
        w-80 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col shadow-2xl lg:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-10 border-b border-slate-100">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="bg-gradient-to-tr from-bgc-600 to-bgc-400 text-white p-3 rounded-2xl shadow-xl shadow-bgc-500/30">
              <Bus className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-black text-2xl text-slate-900 tracking-tighter leading-none">BGC Trust</h1>
              <p className="text-[10px] font-black text-bgc-600 uppercase tracking-widest mt-1">Bus Ecosystem</p>
            </div>
          </motion.div>
        </div>

        <nav className="p-6 space-y-2 flex-1 overflow-y-auto">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                activeTab === item.id 
                  ? 'bg-bgc-50 text-bgc-700 font-black shadow-sm ring-1 ring-bgc-200' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold'
              }`}
            >
              {activeTab === item.id && (
                 <motion.div 
                   layoutId="activeTabIndicator"
                   className="absolute left-0 top-0 bottom-0 w-1.5 bg-bgc-500 rounded-r-full" 
                 />
              )}
              <item.icon size={22} className={activeTab === item.id ? 'text-bgc-600' : 'text-slate-400 group-hover:text-slate-600'} />
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4 px-4 py-3 mb-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="bg-bgc-100 text-bgc-700 p-2.5 rounded-xl">
              <UserCircle size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-500 truncate font-black uppercase tracking-tighter">ID: {currentUser?.identifier}</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-2xl transition-all text-sm font-black shadow-sm"
          >
            <LogOut size={18} />
            Sign Out
          </motion.button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50/80">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-5 lg:hidden flex justify-between items-center z-[30] sticky top-0">
          <div className="flex items-center gap-3">
            <div className="bg-bgc-600 p-2 rounded-xl text-white">
              <Bus className="h-5 w-5" />
            </div>
            <span className="font-black text-slate-900 tracking-tight uppercase text-sm">BGCTUB</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2.5 bg-slate-100 rounded-xl text-slate-600">
            <Menu size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-12 scroll-smooth">
          <div className="max-w-6xl mx-auto min-h-full">
            <AnimatePresence mode='wait'>
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 15 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -15 }}
                 transition={{ duration: 0.4, ease: "easeOut" }}
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