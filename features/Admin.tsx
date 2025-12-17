import React, { useState } from 'react';
import { useStore } from '../store';
import { Bus, Schedule, Destination } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Bus as BusIcon, Calendar, User, Phone, Hash, Clock, MapPin, ArrowRight, Trash2, Map, CheckCircle2, Link as LinkIcon, Settings2, ShieldCheck, ChevronRight
} from 'lucide-react';

type ManagementTab = 'buses' | 'destinations' | 'schedules';

export const AdminDashboard = ({ activeTab }: { activeTab: string }) => {
  const { buses, destinations, schedules, addBus, addDestination, removeDestination, addSchedule, addNotification, bookings } = useStore();
  const [mgmtTab, setMgmtTab] = useState<ManagementTab>('buses');

  // Forms State
  const [newBus, setNewBus] = useState<Partial<Bus>>({ plateNumber: '', capacity: 40, driverName: '', driverPhone: '', driverAge: 30, status: 'active' });
  const [newDest, setNewDest] = useState<Partial<Destination>>({ name: '', address: '', mapUrl: '' });
  const [newSchedule, setNewSchedule] = useState<Partial<Schedule>>({ busId: '', departureTime: '', type: 'inbound', originId: '', destinationId: '' });

  const handleRegisterBus = async () => {
    if(!newBus.plateNumber || !newBus.driverName || !newBus.driverPhone) {
      addNotification('error', 'Please fill in all bus & driver details');
      return;
    }
    await addBus({ ...newBus, id: Date.now().toString(), status: 'active' } as Bus);
    addNotification('success', 'New bus registered and saved');
    setNewBus({ plateNumber: '', capacity: 40, driverName: '', driverPhone: '', driverAge: 30, status: 'active' });
  };

  const handleAddDestination = async () => {
    if(!newDest.name || !newDest.address) {
      addNotification('error', 'Please provide a destination name and address');
      return;
    }
    await addDestination({ ...newDest, id: Date.now().toString() } as Destination);
    addNotification('success', 'Destination synced successfully');
    setNewDest({ name: '', address: '', mapUrl: '' });
  };

  const handleCreateSchedule = async () => {
    if(!newSchedule.busId || !newSchedule.departureTime || !newSchedule.originId || !newSchedule.destinationId) {
      addNotification('error', 'Please fill in all schedule details');
      return;
    }
    await addSchedule({ ...newSchedule, id: Date.now().toString() } as Schedule);
    addNotification('success', 'Trip scheduled successfully');
    setNewSchedule({ ...newSchedule, departureTime: '', originId: '', destinationId: '' });
  };

  if (activeTab === 'dashboard') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div className="bg-gradient-to-br from-bgc-800 to-bgc-600 p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10"><BusIcon size={300} /></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold mb-4 tracking-tighter">Campus Commute Node</h2>
            <p className="opacity-90 font-bold text-lg max-w-xl">Real-time oversight of the BGC Trust University transport ecosystem.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-6 mb-4">
              <div className="p-5 bg-blue-50 text-blue-600 rounded-[1.5rem]"><BusIcon size={32} /></div>
              <div>
                <p className="text-slate-500 font-extrabold uppercase tracking-widest text-xs">Fleet</p>
                <h3 className="text-4xl font-black text-slate-900">{buses.length}</h3>
              </div>
            </div>
            <p className="text-sm text-slate-400 font-medium">Active university buses</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-6 mb-4">
              <div className="p-5 bg-purple-50 text-purple-600 rounded-[1.5rem]"><MapPin size={32} /></div>
              <div>
                <p className="text-slate-500 font-extrabold uppercase tracking-widest text-xs">Points</p>
                <h3 className="text-4xl font-black text-slate-900">{destinations.length}</h3>
              </div>
            </div>
            <p className="text-sm text-slate-400 font-medium">Verified pickup locations</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-6 mb-4">
              <div className="p-5 bg-green-50 text-green-600 rounded-[1.5rem]"><Calendar size={32} /></div>
              <div>
                <p className="text-slate-500 font-extrabold uppercase tracking-widest text-xs">Trips</p>
                <h3 className="text-4xl font-black text-slate-900">{schedules.length}</h3>
              </div>
            </div>
            <p className="text-sm text-slate-400 font-medium">Daily trips published</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Management</h2>
          <p className="text-slate-500 font-bold mt-1">Configure fleet, locations, and trip schedules.</p>
        </div>
        <div className="flex p-1.5 bg-slate-200/50 rounded-2xl gap-1">
          {(['buses', 'destinations', 'schedules'] as ManagementTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setMgmtTab(tab)}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                mgmtTab === tab ? 'bg-white text-bgc-700 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'buses' && 'Fleet'}
              {tab === 'destinations' && 'Locations'}
              {tab === 'schedules' && 'Trips'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mgmtTab === 'buses' && (
          <motion.div key="buses" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-bgc-700 uppercase tracking-widest text-[10px]">Bus Details</h3>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Plate Number" value={newBus.plateNumber} onChange={e => setNewBus({...newBus, plateNumber: e.target.value})} />
                  <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Capacity" value={newBus.capacity} onChange={e => setNewBus({...newBus, capacity: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold text-bgc-700 uppercase tracking-widest text-[10px]">Driver Details</h3>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Driver Name" value={newBus.driverName} onChange={e => setNewBus({...newBus, driverName: e.target.value})} />
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Phone Number" value={newBus.driverPhone} onChange={e => setNewBus({...newBus, driverPhone: e.target.value})} />
                </div>
                <div className="flex items-end">
                  <button onClick={handleRegisterBus} className="w-full p-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-bgc-600 transition-all shadow-xl shadow-slate-200/50"><Plus size={20}/> Register Bus</button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black tracking-widest text-slate-400">
                  <tr><th className="p-5">Bus ID</th><th className="p-5">Driver</th><th className="p-5">Capacity</th><th className="p-5 text-center">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {buses.map(bus => (
                    <tr key={bus.id} className="hover:bg-slate-50/50">
                      <td className="p-5 font-black text-slate-900">{bus.plateNumber}</td>
                      <td className="p-5"><p className="font-bold">{bus.driverName}</p><p className="text-xs text-slate-400">{bus.driverPhone}</p></td>
                      <td className="p-5 font-bold text-slate-600">{bus.capacity} Seats</td>
                      <td className="p-5 text-center"><span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-tighter">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {mgmtTab === 'destinations' && (
          <motion.div key="destinations" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-bgc-400 uppercase tracking-widest">Point Name</label>
                  <input className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white outline-none" placeholder="e.g. Agrabad Terminal" value={newDest.name} onChange={e => setNewDest({...newDest, name: e.target.value})} />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-bgc-400 uppercase tracking-widest">Address</label>
                  <input className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white outline-none" placeholder="e.g. Sheikh Mujib Road" value={newDest.address} onChange={e => setNewDest({...newDest, address: e.target.value})} />
                </div>
                <button onClick={handleAddDestination} className="h-[56px] px-8 bg-bgc-500 text-white font-black rounded-2xl flex items-center gap-2 hover:bg-bgc-400 shadow-xl shadow-bgc-500/20"><Plus size={20}/> Save Location</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map(dest => (
                <div key={dest.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-bgc-50 text-bgc-600 rounded-xl"><MapPin size={24} /></div>
                      <button onClick={() => removeDestination(dest.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                    </div>
                    <h4 className="text-lg font-black text-slate-900">{dest.name}</h4>
                    <p className="text-sm text-slate-500 mt-1 font-bold">{dest.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {mgmtTab === 'schedules' && (
          <motion.div key="schedules" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Bus</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newSchedule.busId} onChange={e => setNewSchedule({...newSchedule, busId: e.target.value})}>
                    <option value="">-- Bus --</option>
                    {buses.map(b => <option key={b.id} value={b.id}>{b.plateNumber}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newSchedule.originId} onChange={e => setNewSchedule({...newSchedule, originId: e.target.value})}>
                    <option value="">-- Start --</option>
                    {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newSchedule.destinationId} onChange={e => setNewSchedule({...newSchedule, destinationId: e.target.value})}>
                    <option value="">-- End --</option>
                    {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</label>
                  <input type="time" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newSchedule.departureTime} onChange={e => setNewSchedule({...newSchedule, departureTime: e.target.value})} />
                </div>
                <div className="lg:col-span-3 h-[56px] flex items-center bg-slate-100 rounded-2xl p-1 gap-1">
                  <button onClick={() => setNewSchedule({...newSchedule, type: 'inbound'})} className={`flex-1 h-full rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newSchedule.type === 'inbound' ? 'bg-white shadow-sm text-bgc-700' : 'text-slate-400'}`}>To Campus</button>
                  <button onClick={() => setNewSchedule({...newSchedule, type: 'outbound'})} className={`flex-1 h-full rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newSchedule.type === 'outbound' ? 'bg-white shadow-sm text-bgc-700' : 'text-slate-400'}`}>From Campus</button>
                </div>
                <button onClick={handleCreateSchedule} className="h-[56px] bg-bgc-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-bgc-700 shadow-xl shadow-bgc-600/20"><Plus size={20}/> Publish Trip</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schedules.map(schedule => (
                <div key={schedule.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between group hover:border-bgc-300 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-bgc-50 text-bgc-600 rounded-2xl flex items-center justify-center font-black">{schedule.departureTime}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">{destinations.find(d => d.id === schedule.originId)?.name}</span>
                        <ArrowRight size={14} className="text-slate-400" />
                        <span className="font-black text-slate-900">{destinations.find(d => d.id === schedule.destinationId)?.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Bus: {buses.find(b => b.id === schedule.busId)?.plateNumber}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${schedule.type === 'inbound' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>{schedule.type}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};