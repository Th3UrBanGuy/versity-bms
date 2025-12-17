
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Bus, Schedule, Destination } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Bus as BusIcon, Calendar, User, Phone, Hash, Clock, MapPin, ArrowRight, Search, Loader2, ExternalLink, X, Trash2, Map, CheckCircle2, Sparkles, BrainCircuit
} from 'lucide-react';
import { searchLocation, generateFleetAnalysis } from '../services/geminiService';

export const AdminDashboard = ({ activeTab }: { activeTab: string }) => {
  const { buses, destinations, schedules, bookings, addBus, addDestination, removeDestination, addSchedule, addNotification } = useStore();

  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Map Search Modal State
  const [showMapSearch, setShowMapSearch] = useState(false);
  const [searchTarget, setSearchTarget] = useState<'origin' | 'destination' | 'setup' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ text: string, links: any[] } | null>(null);

  // State for New Bus Form
  const [newBus, setNewBus] = useState<Partial<Bus>>({
    plateNumber: '', 
    capacity: 40, 
    driverName: '', 
    driverPhone: '', 
    driverAge: 30,
    status: 'active'
  });

  // State for New Destination Setup
  const [newDest, setNewDest] = useState<Partial<Destination>>({
    name: '',
    address: '',
    mapUrl: ''
  });

  // State for New Schedule Form
  const [newSchedule, setNewSchedule] = useState<Partial<Schedule>>({
    busId: '',
    departureTime: '',
    type: 'inbound',
    originId: '',
    destinationId: ''
  });

  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const handleOpenSearch = (target: 'origin' | 'destination' | 'setup') => {
    setSearchTarget(target);
    setShowMapSearch(true);
    setSearchResults(null);
    setSearchQuery('');
  };

  const handleLocationSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    
    let coords;
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
      coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (e) {
      console.log("Geolocation not available");
    }

    const results = await searchLocation(searchQuery, coords);
    setSearchResults(results);
    setIsSearching(false);
  };

  const selectSuggestedLocation = (title: string, uri?: string) => {
    if (searchTarget === 'setup') {
      setNewDest({ ...newDest, name: title, address: title, mapUrl: uri });
    }
    setShowMapSearch(false);
  };

  const handleCreateSchedule = async () => {
    if(!newSchedule.busId || !newSchedule.departureTime || !newSchedule.originId || !newSchedule.destinationId) {
      addNotification('error', 'Please fill in all schedule details');
      return;
    }
    await addSchedule({ ...newSchedule, id: Date.now().toString() } as Schedule);
    addNotification('success', 'Bus trip scheduled successfully');
    setNewSchedule({ ...newSchedule, departureTime: '', originId: '', destinationId: '' });
  };

  const handleAddDestination = async () => {
    if(!newDest.name) {
      addNotification('error', 'Please provide a destination name');
      return;
    }
    await addDestination({ ...newDest, id: Date.now().toString() } as Destination);
    addNotification('success', 'Destination synced to Neon DB');
    setNewDest({ name: '', address: '', mapUrl: '' });
  };

  const handleRegisterBus = async () => {
    if(!newBus.plateNumber || !newBus.driverName || !newBus.driverPhone) {
      addNotification('error', 'Please fill in all bus & driver details');
      return;
    }
    await addBus({ ...newBus, id: Date.now().toString(), status: 'active' } as Bus);
    addNotification('success', 'New bus registered and saved');
    setNewBus({ plateNumber: '', capacity: 40, driverName: '', driverPhone: '', driverAge: 30, status: 'active' });
  };

  const runAiAnalysis = async () => {
    if (buses.length === 0) return;
    setIsAnalyzing(true);
    const analysis = await generateFleetAnalysis(buses, schedules, bookings);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (activeTab === 'dashboard' && buses.length > 0) {
      runAiAnalysis();
    }
  }, [activeTab]);

  if (activeTab === 'buses') {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Fleet Registration</h2>
            <p className="text-slate-600 mt-1 font-medium">Add buses and drivers to the university network.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
            <CheckCircle2 size={14} /> Neon DB Live
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <div className="space-y-4">
               <h3 className="font-bold text-bgc-700 uppercase tracking-widest text-xs">Bus Identity</h3>
               <div>
                 <label className="block text-sm font-bold text-slate-800 mb-1.5">Bus Plate Number</label>
                 <div className="relative">
                   <BusIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                   <input 
                     className="w-full pl-12 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-bgc-200 focus:bg-white outline-none transition-all"
                     placeholder="e.g. CH-KA-1102"
                     value={newBus.plateNumber}
                     onChange={e => setNewBus({...newBus, plateNumber: e.target.value})}
                   />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-800 mb-1.5">Passenger Capacity</label>
                 <div className="relative">
                   <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                   <input 
                     type="number"
                     className="w-full pl-12 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-bgc-200 focus:bg-white outline-none transition-all"
                     placeholder="40"
                     value={newBus.capacity}
                     onChange={e => setNewBus({...newBus, capacity: parseInt(e.target.value)})}
                   />
                 </div>
               </div>
             </div>

             <div className="space-y-4">
               <h3 className="font-bold text-bgc-700 uppercase tracking-widest text-xs">Driver Profile</h3>
               <div>
                 <label className="block text-sm font-bold text-slate-800 mb-1.5">Full Name</label>
                 <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                   <input 
                     className="w-full pl-12 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-bgc-200 focus:bg-white outline-none transition-all"
                     placeholder="Driver's Full Name"
                     value={newBus.driverName}
                     onChange={e => setNewBus({...newBus, driverName: e.target.value})}
                   />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">Contact</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        className="w-full pl-10 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-bgc-200 focus:bg-white outline-none transition-all"
                        placeholder="018..."
                        value={newBus.driverPhone}
                        onChange={e => setNewBus({...newBus, driverPhone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">Age</label>
                    <input 
                      type="number"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-bgc-200 focus:bg-white outline-none transition-all"
                      placeholder="Age"
                      value={newBus.driverAge}
                      onChange={e => setNewBus({...newBus, driverAge: parseInt(e.target.value)})}
                    />
                  </div>
               </div>
             </div>

             <div className="flex items-end">
               <button 
                 onClick={handleRegisterBus}
                 className="w-full h-[64px] bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-bgc-600 transition-all shadow-2xl shadow-slate-400/20 active:scale-[0.98] flex items-center justify-center gap-2"
               >
                 <Plus size={24} /> Add to Fleet
               </button>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-900">
              <tr>
                <th className="p-5 font-extrabold uppercase tracking-widest text-[10px]">Bus Details</th>
                <th className="p-5 font-extrabold uppercase tracking-widest text-[10px]">Capacity</th>
                <th className="p-5 font-extrabold uppercase tracking-widest text-[10px]">Driver</th>
                <th className="p-5 font-extrabold uppercase tracking-widest text-[10px] text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {buses.map(bus => (
                <tr key={bus.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-bgc-100 text-bgc-600 rounded-xl flex items-center justify-center font-bold"><BusIcon size={20}/></div>
                       <div className="font-extrabold text-slate-900">{bus.plateNumber}</div>
                    </div>
                  </td>
                  <td className="p-5 text-slate-700 font-bold">{bus.capacity} Seats</td>
                  <td className="p-5">
                    <div className="font-bold text-slate-900">{bus.driverName}</div>
                    <div className="text-xs text-slate-500 font-medium">{bus.driverPhone}</div>
                  </td>
                  <td className="p-5 text-center">
                    <span className="inline-block px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-extrabold border border-green-100 uppercase tracking-tighter">{bus.status}</span>
                  </td>
                </tr>
              ))}
              {buses.length === 0 && (
                 <tr><td colSpan={4} className="p-12 text-center text-slate-400 font-bold italic">No fleet data found. Add your first bus!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  }

  if (activeTab === 'destinations') {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-8 pb-20">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Verified Destinations</h2>
          <p className="text-slate-600 mt-1 font-medium">Use real-time maps to setup verified pickup points.</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity"><Map size={200} /></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 space-y-4">
               <div>
                  <label className="block text-xs font-extrabold text-bgc-400 uppercase tracking-widest mb-1.5">Point Nickname</label>
                  <input 
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-bgc-400 outline-none text-white font-bold placeholder:text-slate-500"
                    placeholder="e.g. Agrabad Terminal"
                    value={newDest.name}
                    onChange={e => setNewDest({...newDest, name: e.target.value})}
                  />
               </div>
            </div>
            <div className="flex-[1.5] space-y-4">
               <div>
                  <label className="block text-xs font-extrabold text-bgc-400 uppercase tracking-widest mb-1.5">Search Live Maps for Verified Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-bgc-400 w-5 h-5" />
                    <input 
                      readOnly
                      onClick={() => handleOpenSearch('setup')}
                      className="w-full pl-12 pr-12 p-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-bgc-400 outline-none text-white font-bold cursor-pointer hover:bg-white/20 transition-all"
                      placeholder="Click to search on Realtime Map..."
                      value={newDest.address}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-bgc-400 flex items-center gap-2">
                       <span className="text-[10px] font-bold uppercase tracking-tighter opacity-50">Powered by Gemini Maps</span>
                       <Search size={18} />
                    </div>
                  </div>
               </div>
            </div>
            <button 
               onClick={handleAddDestination}
               className="h-[60px] px-10 bg-bgc-500 text-white font-extrabold rounded-2xl hover:bg-bgc-400 transition-all shadow-xl shadow-bgc-500/20 active:scale-95 flex items-center gap-2"
             >
               <Plus size={20} /> Sync Point
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {destinations.map(dest => (
              <motion.div 
                layout
                key={dest.id} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-bgc-500 transition-all hover:shadow-xl hover:shadow-bgc-500/5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-4 bg-bgc-50 text-bgc-600 rounded-2xl group-hover:scale-110 transition-transform"><MapPin size={24} /></div>
                  <button 
                    onClick={() => removeDestination(dest.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <h4 className="text-xl font-extrabold text-slate-900 mb-1">{dest.name}</h4>
                <p className="text-sm text-slate-500 mb-6 font-medium line-clamp-2 min-h-[40px] leading-relaxed">{dest.address || 'Verified Point'}</p>
                {dest.mapUrl && (
                  <a 
                    href={dest.mapUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-2 py-3 px-4 bg-slate-50 rounded-xl text-xs font-bold text-bgc-600 hover:bg-bgc-600 hover:text-white transition-all w-full justify-center group/btn"
                  >
                    <ExternalLink size={14} className="group-hover/btn:rotate-12 transition-transform" /> View Realtime Map
                  </a>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Gemini Map Search Modal */}
        <AnimatePresence>
          {showMapSearch && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                onClick={() => setShowMapSearch(false)}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
                className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-white/20"
              >
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="font-extrabold text-2xl text-slate-900 tracking-tight">Realtime Location Sync</h3>
                    <p className="text-slate-500 text-sm font-medium">Verify points in Chittagong via Google Maps</p>
                  </div>
                  <button onClick={() => setShowMapSearch(false)} className="p-3 bg-white hover:bg-red-50 hover:text-red-500 rounded-2xl text-slate-400 transition-all border border-slate-100 shadow-sm">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="p-8 space-y-6 overflow-y-auto">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        autoFocus
                        className="w-full pl-12 p-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-bgc-500 outline-none text-slate-900 font-bold placeholder:text-slate-400"
                        placeholder="Search places (e.g. Chittagong Station)..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLocationSearch()}
                      />
                    </div>
                    <button 
                      onClick={handleLocationSearch}
                      disabled={isSearching}
                      className="px-8 bg-bgc-600 text-white rounded-2xl font-extrabold flex items-center gap-2 hover:bg-bgc-700 transition disabled:opacity-50 shadow-lg shadow-bgc-600/20"
                    >
                      {isSearching ? <Loader2 className="animate-spin" size={24} /> : "Search"}
                    </button>
                  </div>

                  {searchResults && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="text-sm font-medium text-slate-700 bg-bgc-50 p-6 rounded-3xl leading-relaxed border border-bgc-100">
                        {searchResults.text}
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-2">Suggested Verified Places</p>
                        {searchResults.links.map((link, i) => (
                          <motion.div 
                            initial={{ x: -20, opacity: 0 }} 
                            animate={{ x: 0, opacity: 1 }} 
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-bgc-500 hover:bg-bgc-50 transition-all group cursor-pointer"
                            onClick={() => selectSuggestedLocation(link.title, link.uri)}
                          >
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-bgc-500 group-hover:bg-bgc-500 group-hover:text-white transition-colors">
                                  <MapPin size={20} />
                               </div>
                               <span className="font-extrabold text-slate-800">{link.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="p-2 text-slate-400 hover:text-bgc-600 transition-colors" onClick={(e) => { e.stopPropagation(); window.open(link.uri, '_blank'); }}>
                                  <ExternalLink size={18} />
                                </div>
                               <Plus size={20} className="text-bgc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  if (activeTab === 'schedules') {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-8 pb-20">
         <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Trip Scheduler</h2>
          <p className="text-slate-600 mt-1 font-medium">Coordinate routes between your verified points.</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            <div className="flex-1 w-full space-y-5">
               <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Assign Bus</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-bgc-500 outline-none text-slate-900 font-bold"
                    onChange={e => setNewSchedule({...newSchedule, busId: e.target.value})}
                    value={newSchedule.busId || ''}
                  >
                    <option value="">-- Choose a Bus --</option>
                    {buses.map(b => <option key={b.id} value={b.id}>{b.plateNumber} ({b.capacity} seats)</option>)}
                  </select>
               </div>
               <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                  <button 
                    onClick={() => setNewSchedule({...newSchedule, type: 'inbound'})}
                    className={`flex-1 py-3 text-xs font-extrabold rounded-xl transition-all ${newSchedule.type === 'inbound' ? 'bg-white shadow-md text-bgc-700' : 'text-slate-500'}`}
                  >
                    INBOUND TRIP
                  </button>
                  <button 
                    onClick={() => setNewSchedule({...newSchedule, type: 'outbound'})}
                    className={`flex-1 py-3 text-xs font-extrabold rounded-xl transition-all ${newSchedule.type === 'outbound' ? 'bg-white shadow-md text-bgc-700' : 'text-slate-500'}`}
                  >
                    OUTBOUND TRIP
                  </button>
               </div>
            </div>

            <div className="flex-[2] w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                   <label className="block text-sm font-bold text-slate-800 mb-1.5">Origin Point</label>
                   <select 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-bgc-500 outline-none text-slate-900 font-bold"
                      onChange={e => setNewSchedule({...newSchedule, originId: e.target.value})}
                      value={newSchedule.originId || ''}
                   >
                     <option value="">-- Start --</option>
                     {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                   </select>
                </div>

                <div>
                   <label className="block text-sm font-bold text-slate-800 mb-1.5">Destination</label>
                   <select 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-bgc-500 outline-none text-slate-900 font-bold"
                      onChange={e => setNewSchedule({...newSchedule, destinationId: e.target.value})}
                      value={newSchedule.destinationId || ''}
                   >
                     <option value="">-- End --</option>
                     {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                   </select>
                </div>

                <div>
                   <label className="block text-sm font-bold text-slate-800 mb-1.5">Time</label>
                   <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="time"
                        className="w-full pl-12 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-bgc-500 outline-none text-slate-900 font-bold"
                        onChange={e => setNewSchedule({...newSchedule, departureTime: e.target.value})}
                        value={newSchedule.departureTime}
                      />
                   </div>
                </div>
            </div>

            <button 
               onClick={handleCreateSchedule}
               className="h-[64px] px-10 bg-bgc-600 text-white font-extrabold rounded-2xl hover:bg-bgc-700 transition-all shadow-xl shadow-bgc-600/20 active:scale-95 flex items-center gap-2"
             >
               Publish Trip
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {schedules.map(schedule => {
              const bus = buses.find(b => b.id === schedule.busId);
              const origin = destinations.find(d => d.id === schedule.originId);
              const destination = destinations.find(d => d.id === schedule.destinationId);
              return (
                <motion.div 
                  layout
                  key={schedule.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6 hover:shadow-lg hover:border-bgc-300 transition-all"
                >
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold shadow-inner ${schedule.type === 'inbound' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    <BusIcon size={24} />
                    <span className="text-[10px] uppercase mt-1">Bus</span>
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-2">
                        <span className="font-extrabold text-slate-900 text-xl tracking-tighter">{schedule.departureTime}</span>
                        <span className="text-[10px] font-extrabold px-3 py-1 bg-slate-900 text-white rounded-lg tracking-widest uppercase">{bus?.plateNumber}</span>
                     </div>
                     <div className="flex items-center gap-3 text-sm text-slate-700 font-extrabold">
                        <span className="bg-slate-50 px-2 py-1 rounded-md">{origin?.name || 'Point A'}</span>
                        <ArrowRight size={14} className="text-bgc-400" />
                        <span className="bg-slate-50 px-2 py-1 rounded-md">{destination?.name || 'Point B'}</span>
                     </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {schedules.length === 0 && (
            <div className="col-span-full p-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
               <Calendar className="mx-auto text-slate-200 mb-4" size={64} />
               <p className="text-slate-400 font-extrabold text-lg">No trips scheduled for today.</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (activeTab === 'dashboard') {
     return (
        <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-8">
           <div className="bg-gradient-to-br from-bgc-800 to-bgc-600 p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-10"><BusIcon size={300} /></div>
             <div className="relative z-10">
                <h2 className="text-4xl font-extrabold mb-4 tracking-tighter">Campus Commute Node</h2>
                <p className="opacity-90 font-bold text-lg max-w-xl">Live monitoring and management of the BGC Trust University transport ecosystem.</p>
             </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                  <div className="flex items-center gap-6 mb-4">
                     <div className="p-5 bg-blue-50 text-blue-600 rounded-[1.5rem]"><BusIcon size={32} /></div>
                     <div>
                        <p className="text-slate-500 font-extrabold uppercase tracking-widest text-xs">Fleet Size</p>
                        <h3 className="text-4xl font-black text-slate-900">{buses.length}</h3>
                     </div>
                  </div>
                  <p className="text-sm text-slate-400 font-medium">Buses registered in Neon DB</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                  <div className="flex items-center gap-6 mb-4">
                     <div className="p-5 bg-purple-50 text-purple-600 rounded-[1.5rem]"><MapPin size={32} /></div>
                     <div>
                        <p className="text-slate-500 font-extrabold uppercase tracking-widest text-xs">Active Points</p>
                        <h3 className="text-4xl font-black text-slate-900">{destinations.length}</h3>
                     </div>
                  </div>
                  <p className="text-sm text-slate-400 font-medium">Verified pickup locations</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                  <div className="flex items-center gap-6 mb-4">
                     <div className="p-5 bg-green-50 text-green-600 rounded-[1.5rem]"><Calendar size={32} /></div>
                     <div>
                        <p className="text-slate-500 font-extrabold uppercase tracking-widest text-xs">Daily Trips</p>
                        <h3 className="text-4xl font-black text-slate-900">{schedules.length}</h3>
                     </div>
                  </div>
                  <p className="text-sm text-slate-400 font-medium">Published schedules</p>
              </div>
           </div>

           {/* AI INSIGHTS SECTION */}
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 text-slate-50 group-hover:text-bgc-50 transition-colors"><BrainCircuit size={150}/></div>
              <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                          <div className="bg-bgc-600 p-3 rounded-2xl text-white shadow-lg shadow-bgc-600/30">
                              <Sparkles size={24} />
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Gemini AI Fleet Analysis</h3>
                      </div>
                      <button 
                        onClick={runAiAnalysis}
                        disabled={isAnalyzing}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-bgc-700 transition-all flex items-center gap-2"
                      >
                         {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <><BrainCircuit size={18} /> Re-analyze</>}
                      </button>
                  </div>

                  <div className="min-h-[120px] bg-slate-50/50 p-8 rounded-3xl border border-slate-200/50 backdrop-blur-sm">
                      {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-4 text-slate-400">
                           <Loader2 className="animate-spin" size={40} />
                           <p className="font-bold text-lg animate-pulse">Consulting Gemini Flash-3...</p>
                        </div>
                      ) : aiAnalysis ? (
                        <div className="prose prose-slate max-w-none">
                           <p className="text-slate-700 leading-relaxed font-medium text-lg whitespace-pre-line">{aiAnalysis}</p>
                        </div>
                      ) : (
                        <div className="text-center py-10">
                           <p className="text-slate-400 font-bold">No AI insights generated yet. Click analyze to start.</p>
                        </div>
                      )}
                  </div>
              </div>
           </div>
        </motion.div>
     )
  }
  return null;
};
