
import React, { useState } from 'react';
import { useStore } from '../store';
import { UserRole } from '../types';
import { motion } from 'framer-motion';
// Fixed missing Loader2 import
import { Bus, ShieldCheck, GraduationCap, ArrowRight, User, Loader2 } from 'lucide-react';

export const Auth = () => {
  const { login } = useStore();
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.STUDENT);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        const email = activeRole === UserRole.ADMIN ? 'admin@bgctub.ac.bd' : 'student@bgctub.ac.bd';
        login(email, activeRole);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-200/30 rounded-full blur-[100px] animate-float" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-purple-200/30 rounded-full blur-[100px] animate-float" style={{animationDelay: '1s'}} />
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-bgc-200/30 rounded-full blur-[100px] animate-float" style={{animationDelay: '2s'}} />
      </div>

      <div className="w-full max-w-5xl h-auto md:h-[600px] bg-white rounded-[2rem] shadow-2xl border border-white/50 relative z-10 flex flex-col md:flex-row overflow-hidden">
        <div className="md:w-1/2 bg-gradient-to-br from-bgc-600 to-bgc-800 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10"><Bus size={200} /></div>
            <div className="relative z-10">
                <div className="bg-white/10 backdrop-blur-md inline-flex p-3 rounded-2xl mb-6 border border-white/10">
                    <Bus className="text-white w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">Campus <br/> Commute</h1>
                <p className="text-bgc-100 text-lg leading-relaxed opacity-90 font-medium">Streamline your daily journey with BGC Trust University's official transport management system.</p>
            </div>
            <div className="relative z-10 hidden md:block">
                 <div className="flex items-center gap-3 text-sm text-bgc-200 bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/5 font-bold">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    System Operational • v2.4.0
                 </div>
            </div>
        </div>

        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">Welcome Back</h2>
            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-2 mb-8 relative">
                <button
                    onClick={() => setActiveRole(UserRole.STUDENT)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative z-10 ${
                        activeRole === UserRole.STUDENT ? 'text-bgc-700' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <GraduationCap size={18} /> Student
                </button>
                <button
                    onClick={() => setActiveRole(UserRole.ADMIN)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative z-10 ${
                        activeRole === UserRole.ADMIN ? 'text-bgc-700' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <ShieldCheck size={18} /> Manager
                </button>
                <motion.div 
                    className="absolute top-1.5 bottom-1.5 bg-white rounded-xl shadow-sm"
                    initial={false}
                    animate={{ left: activeRole === UserRole.STUDENT ? '6px' : '50%', width: 'calc(50% - 9px)' }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 ml-1">University Email</label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                        type="email"
                        defaultValue={activeRole === UserRole.ADMIN ? 'admin@bgctub.ac.bd' : 'student@bgctub.ac.bd'}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-xl focus:border-bgc-500 focus:ring-2 focus:ring-bgc-200 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400"
                        placeholder="id@bgctub.ac.bd"
                    />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 ml-1">Password</label>
                <input
                    type="password"
                    defaultValue="password"
                    className="w-full px-4 py-4 bg-white border border-slate-300 rounded-xl focus:border-bgc-500 focus:ring-2 focus:ring-bgc-200 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400"
                    placeholder="••••••••"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="submit" disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-bgc-600 to-bgc-500 text-white font-bold rounded-xl shadow-lg shadow-bgc-500/30 flex items-center justify-center gap-2 mt-4 hover:brightness-110 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><span className="text-lg">Access Portal</span> <ArrowRight size={20} /></>}
              </motion.button>
            </form>
            <p className="mt-8 text-center text-xs text-slate-500 font-bold">© 2024 BGC Trust University Bangladesh</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
