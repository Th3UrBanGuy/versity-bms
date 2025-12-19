
import React, { useState } from 'react';
import { useStore } from '../store';
import { UserRole } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, ShieldCheck, GraduationCap, ArrowRight, Loader2, Key, UserCircle, Mail, ChevronLeft, Fingerprint } from 'lucide-react';

export const Auth = () => {
  const { login, signup, addNotification } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.STUDENT);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      if (isLogin) {
        const success = await login(identifier.trim(), password, activeRole);
        // If success, store handles navigation via state change
      } else {
        if (!name.trim() || !identifier.trim() || !password) {
          addNotification('error', 'Required fields are missing');
          setLoading(false);
          return;
        }
        await signup({ 
          name: name.trim(), 
          identifier: identifier.trim(), 
          password, 
          role: activeRole,
          studentId: activeRole === UserRole.STUDENT ? identifier.trim() : undefined
        });
      }
    } catch (err) {
      console.error(err);
      addNotification('error', 'A system error occurred. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-0 sm:p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-bgc-100/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md sm:max-w-4xl bg-white sm:rounded-[3rem] shadow-2xl shadow-slate-200/50 flex flex-col sm:flex-row overflow-hidden relative z-10 min-h-screen sm:min-h-[600px]"
      >
        {/* Visual Sidebar - Only on desktop */}
        <div className="hidden sm:flex w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10"><Bus size={300} /></div>
          </div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-bgc-500 rounded-2xl flex items-center justify-center mb-10 shadow-xl shadow-bgc-500/20">
              <Bus className="text-white" size={28} />
            </div>
            <h1 className="text-5xl font-black text-white leading-tight tracking-tighter mb-6">
              Connect to your <br /><span className="text-bgc-400">Campus Flow.</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xs">
              Secure, real-time transport management for BGC Trust University.
            </p>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-fit">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700" />)}
              </div>
              <p className="text-xs font-bold text-slate-300">Used by 2.4k+ daily commuters</p>
            </div>
          </div>
        </div>

        {/* Main Auth Form */}
        <div className="flex-1 flex flex-col p-8 sm:p-12 lg:p-16 justify-center">
          {/* Mobile Header */}
          <div className="sm:hidden flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-bgc-600 rounded-xl text-white">
                <Bus size={20} />
              </div>
              <span className="font-black text-slate-900 text-lg tracking-tight">BGCTUB Transport</span>
            </div>
          </div>

          <div className="max-w-sm mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-3">
                {isLogin ? 'Hello Again!' : 'Join Transit'}
              </h2>
              <p className="text-slate-500 font-bold text-sm">
                {isLogin 
                  ? `Sign in as ${activeRole === UserRole.ADMIN ? 'Manager' : 'Student'}`
                  : 'Register your student account to book seats.'}
              </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-2xl mb-8 relative">
              <motion.div 
                layoutId="roleBg"
                className="absolute inset-1 bg-white rounded-xl shadow-sm z-0"
                style={{ width: 'calc(50% - 4px)', left: activeRole === UserRole.STUDENT ? '4px' : 'calc(50% + 0px)' }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
              <button 
                onClick={() => setActiveRole(UserRole.STUDENT)}
                className={`flex-1 py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest z-10 flex items-center justify-center gap-2 transition-colors ${activeRole === UserRole.STUDENT ? 'text-bgc-600' : 'text-slate-400'}`}
              >
                <GraduationCap size={16} /> Student
              </button>
              <button 
                onClick={() => setActiveRole(UserRole.ADMIN)}
                className={`flex-1 py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest z-10 flex items-center justify-center gap-2 transition-colors ${activeRole === UserRole.ADMIN ? 'text-bgc-600' : 'text-slate-400'}`}
              >
                <ShieldCheck size={16} /> Manager
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode='wait'>
                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="relative group">
                      <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-bgc-500 transition-colors" size={20} />
                      <input
                        required={!isLogin}
                        type="text"
                        placeholder="Your Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-bgc-500 focus:ring-4 focus:ring-bgc-50 outline-none transition-all font-bold text-slate-900"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-bgc-500 transition-colors" size={20} />
                <input
                  required
                  type="text"
                  placeholder={activeRole === UserRole.STUDENT ? "Student ID" : "Username"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-bgc-500 focus:ring-4 focus:ring-bgc-50 outline-none transition-all font-bold text-slate-900"
                />
              </div>

              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-bgc-500 transition-colors" size={20} />
                <input
                  required
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-bgc-500 focus:ring-4 focus:ring-bgc-50 outline-none transition-all font-bold text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4.5 bg-slate-900 text-white font-black rounded-[1.25rem] flex items-center justify-center gap-3 hover:bg-bgc-600 active:scale-[0.98] transition-all disabled:opacity-50 mt-8 shadow-xl shadow-slate-200"
              >
                {loading ? <Loader2 className="animate-spin" size={22} /> : (
                  <>
                    <span>{isLogin ? 'Log into Portal' : 'Create Account'}</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                   setIsLogin(!isLogin);
                   // If switching to login as Admin, that's fine. If switching to signup as admin, force it to student as admin signup isn't typically allowed in public apps.
                   if (isLogin && activeRole === UserRole.ADMIN) {
                      setActiveRole(UserRole.STUDENT);
                   }
                }}
                className="text-slate-500 text-sm font-bold group"
              >
                {isLogin ? "No account yet?" : "Already have an account?"}
                <span className="ml-2 text-bgc-600 font-black group-hover:underline decoration-2 underline-offset-4">
                  {isLogin ? 'Create One' : 'Sign In'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Background Decorative Circles - Only Mobile */}
      <div className="sm:hidden absolute top-[-50px] left-[-50px] w-64 h-64 bg-bgc-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="sm:hidden absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
