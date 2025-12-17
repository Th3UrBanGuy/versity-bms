import React, { useState } from 'react';
import { useStore } from '../store';
import { UserRole } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, ShieldCheck, GraduationCap, ArrowRight, User, Loader2, Key, UserCircle } from 'lucide-react';

export const Auth = () => {
  const { login, signup } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.STUDENT);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isLogin) {
      await login(identifier, password, activeRole);
    } else {
      if (!name || !identifier || !password) {
        setLoading(false);
        return;
      }
      await signup({ 
        name, 
        identifier, 
        password, 
        role: activeRole,
        studentId: activeRole === UserRole.STUDENT ? identifier : undefined
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-200/30 rounded-full blur-[100px] animate-float" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-purple-200/30 rounded-full blur-[100px] animate-float" style={{animationDelay: '1s'}} />
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-bgc-200/30 rounded-full blur-[100px] animate-float" style={{animationDelay: '2s'}} />
      </div>

      <div className="w-full max-w-5xl h-auto md:min-h-[650px] bg-white rounded-[2.5rem] shadow-2xl border border-white/50 relative z-10 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Branding */}
        <div className="md:w-1/2 bg-gradient-to-br from-bgc-700 to-bgc-900 p-10 md:p-14 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10"><Bus size={250} /></div>
            <div className="relative z-10">
                <div className="bg-white/10 backdrop-blur-md inline-flex p-3 rounded-2xl mb-8 border border-white/10">
                    <Bus className="text-white w-10 h-10" />
                </div>
                <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 tracking-tighter">BGC Trust <br/> <span className="text-bgc-300">Transport</span></h1>
                <p className="text-bgc-100 text-xl leading-relaxed opacity-90 font-medium max-w-md">Your secure gateway to university mobility. Track, book, and commute with confidence.</p>
            </div>
            <div className="relative z-10 mt-12">
                 <div className="flex items-center gap-3 text-sm text-bgc-200 bg-black/20 p-4 rounded-2xl backdrop-blur-md border border-white/5 font-bold w-fit">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                    BGC Trust University Official Portal
                 </div>
            </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center bg-white">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-500 font-medium">
                {isLogin ? 'Access your transport dashboard' : 'Join the BGCTUB transport network'}
              </p>
            </div>

            {/* Role Switcher */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-2 mb-8 relative">
                <button
                    onClick={() => setActiveRole(UserRole.STUDENT)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black transition-all duration-300 relative z-10 ${
                        activeRole === UserRole.STUDENT ? 'text-bgc-700' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <GraduationCap size={18} /> Student
                </button>
                <button
                    onClick={() => setActiveRole(UserRole.ADMIN)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black transition-all duration-300 relative z-10 ${
                        activeRole === UserRole.ADMIN ? 'text-bgc-700' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <ShieldCheck size={18} /> Manager
                </button>
                <motion.div 
                    className="absolute top-1.5 bottom-1.5 bg-white rounded-xl shadow-md"
                    initial={false}
                    animate={{ left: activeRole === UserRole.STUDENT ? '6px' : '50%', width: 'calc(50% - 9px)' }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div 
                    key="name-field"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="text-sm font-black text-slate-800 ml-1 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                        <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            required={!isLogin}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-bgc-500 focus:ring-4 focus:ring-bgc-50 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400"
                            placeholder="e.g. Abdullah Al Mamun"
                        />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-800 ml-1 uppercase tracking-wider">
                  {activeRole === UserRole.STUDENT ? 'Student ID' : 'Manager Username'}
                </label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        required
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-bgc-500 focus:ring-4 focus:ring-bgc-50 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400"
                        placeholder={activeRole === UserRole.STUDENT ? "e.g. 21101004" : "e.g. bgc_manager_01"}
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-800 ml-1 uppercase tracking-wider">Password</label>
                <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        required
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-bgc-500 focus:ring-4 focus:ring-bgc-50 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400"
                        placeholder="••••••••"
                    />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="submit" disabled={loading}
                className="w-full py-4.5 bg-gradient-to-r from-bgc-600 to-bgc-500 text-white font-black rounded-2xl shadow-xl shadow-bgc-500/30 flex items-center justify-center gap-2 mt-8 hover:brightness-110 transition-all text-lg"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <><span>{isLogin ? 'Login to Portal' : 'Create My Account'}</span> <ArrowRight size={20} /></>}
              </motion.button>
            </form>

            <div className="mt-8 text-center">
               <button 
                 onClick={() => setIsLogin(!isLogin)}
                 className="text-bgc-600 font-black hover:text-bgc-700 transition-colors text-sm"
               >
                 {isLogin ? "Don't have an account? Sign up now" : "Already have an account? Login instead"}
               </button>
            </div>
            
            <p className="mt-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2024 BGC Trust University Bangladesh Transport Division</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};