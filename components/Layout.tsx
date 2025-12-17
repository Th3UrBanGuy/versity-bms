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
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            layout
            className={`
              pointer-events-auto min-w-[300px] p-4 rounded-xl shadow-xl flex items-center gap-3 border backdrop-blur-md
              ${note.type === 'success' ? 'bg-white/90 border-green-200 text-green-800' : ''}
              ${note.type === 'error' ? 'bg-white/90 border-red-200 text-red-800' : ''}
              ${note.type === 'info' ? 'bg-white/90 border-blue-200 text-blue-800' : ''}
            `}
          >
            {note.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {note.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
            {note.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            <div className="flex-1">
              <p className="text-sm font-semibold">{note.message}</p>
            </div>
            <button 
              onClick={() => removeNotification(note.id)}
              className="p-1 hover:bg-black/5 rounded-full"
            >
              <X size={14} />
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
      }, 4000);
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col shadow-2xl lg:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 border-b border-slate-100">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="bg-gradient-to-tr from-bgc-600 to-bgc-400 text-white p-2.5 rounded-xl shadow-lg shadow-bgc-500/30">
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-slate-900 tracking-tight">BGC Trust</h1>
              <p className="text-xs font-medium text-bgc-600 uppercase tracking-wider">Transport Manager</p>
            </div>
          </motion.div>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                activeTab === item.id 
                  ? 'bg-bgc-50 text-bgc-700 font-semibold shadow-sm ring-1 ring-bgc-200' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {activeTab === item.id && (
                 <motion.div 
                   layoutId="activeTabIndicator"
                   className="absolute left-0 top-0 bottom-0 w-1 bg-bgc-500 rounded-r-full" 
                 />
              )}
              <item.icon size={20} className={activeTab === item.id ? 'text-bgc-600' : 'text-slate-400 group-hover:text-slate-600'} />
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-3 rounded-xl bg-white border border-slate-100 shadow-sm">
            <div className="bg-bgc-100 text-bgc-700 p-2 rounded-lg">
              <UserCircle size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{currentUser?.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{currentUser?.role}</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl transition-colors text-sm font-medium shadow-sm"
          >
            <LogOut size={16} />
            Sign Out
          </motion.button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50/80">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 lg:hidden flex justify-between items-center z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="bg-bgc-600 p-1.5 rounded-lg text-white">
              <Bus className="h-4 w-4" />
            </div>
            <span className="font-bold text-slate-800">BGCTUB</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-slate-100 rounded-lg text-slate-600">
            <Menu size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto min-h-full">
            <AnimatePresence mode='wait'>
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.3 }}
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
