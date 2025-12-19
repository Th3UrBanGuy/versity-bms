
import React, { useState } from 'react';
import { useStore } from '../store';
import { Bus, Schedule, Destination, RouteStop } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Bus as BusIcon, Calendar, User, Phone, Hash, Clock, MapPin, ArrowRight, Trash2, Map as MapIcon, CheckCircle2, Link as LinkIcon, Settings2, ShieldCheck, ChevronRight, Locate, Pencil, X
} from 'lucide-react';

type ManagementTab = 'buses' | 'destinations' | 'schedules';

// Simple Map Component to visualize routes
const RouteMap = ({ origin, destination, stops }: { origin?: Destination, destination?: Destination, stops: RouteStop[] }) => {
  if (!origin || !destination) return (
    <div className="w-full h-64 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400">
      <MapIcon size={48} className="mb-2 opacity-50" />
      <span className="text-xs font-black uppercase tracking-widest">Select From & To Points to view map</span>
    </div>
  );

  const originQ = origin.lat && origin.lng ? `${origin.lat},${origin.lng}` : origin.name;
  const destQ = destination.lat && destination.lng ? `${destination.lat},${destination.lng}` : destination.name;
  
  return (
    <div className="w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 p-4 relative">
       <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest text-slate-400 z-10 border border-slate-100">
          Route Preview
       </div>
       <div className="flex items-center justify-between relative mt-6 mb-2 px-4">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 -z-0" />
          
          {/* Origin */}
          <div className="flex flex-col items-center z-10 bg-slate-50 px-2">
             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border-4 border-white shadow-sm mb-2">
                <MapPin size={14} />
             </div>
             <span className="text-[10px] font-black uppercase text-slate-900">{origin.name}</span>
          </div>

          {/* Stops */}
          {stops.map((stop, idx) => (
             <div key={idx} className="flex flex-col items-center z-10 bg-slate-50 px-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center border-4 border-white shadow-sm mb-2">
                   <span className="text-[8px] font-bold">{idx + 1}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-500">{stop.name}</span>
             </div>
          ))}

          {/* Destination */}
          <div className="flex flex-col items-center z-10 bg-slate-50 px-2">
             <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center border-4 border-white shadow-sm mb-2">
                <MapPin size={14} />
             </div>
             <span className="text-[10px] font-black uppercase text-slate-900">{destination.name}</span>
          </div>
       </div>
       <div className="text-center mt-4">
          <a 
            href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originQ)}&destination=${encodeURIComponent(destQ)}`} 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-bold text-bgc-600 hover:underline"
          >
             <LinkIcon size={10} /> Open in Google Maps
          </a>
       </div>
    </div>
  );
};

export const AdminDashboard = ({ activeTab }: { activeTab: string }) => {
  const { buses, destinations, schedules, addBus, addDestination, removeDestination, addSchedule, addNotification, bookings } = useStore();
  const [mgmtTab, setMgmtTab] = useState<ManagementTab>('buses');

  // Forms State & Edit Mode
  const [editingBusId, setEditingBusId] = useState<string | null>(null);
  const [newBus, setNewBus] = useState<Partial<Bus>>({ plateNumber: '', capacity: 40, driverName: '', driverPhone: '', driverAge: 30, status: 'active' });

  const [editingDestId, setEditingDestId] = useState<string | null>(null);
  const [newDest, setNewDest] = useState<Partial<Destination>>({ name: '', address: '', mapUrl: '', lat: 0, lng: 0, isCampus: false });
  
  const [newSchedule, setNewSchedule] = useState<Partial<Schedule>>({ busId: '', departureTime: '', type: 'inbound', originId: '', destinationId: '', stops: [] });
  const [tempStop, setTempStop] = useState({ destinationId: '', arrivalTime: '' });

  // --- Handlers for Buses ---

  const handleRegisterBus = async () => {
    if(!newBus.plateNumber || !newBus.driverName || !newBus.driverPhone) {
      addNotification('error', 'Please fill in all bus & driver details');
      return;
    }
    const id = editingBusId ? editingBusId : Date.now().toString();
    await addBus({ ...newBus, id, status: 'active' } as Bus);
    addNotification('success', editingBusId ? 'Bus details updated' : 'New bus registered');
    
    // Reset
    setNewBus({ plateNumber: '', capacity: 40, driverName: '', driverPhone: '', driverAge: 30, status: 'active' });
    setEditingBusId(null);
  };

  const handleEditBus = (bus: Bus) => {
    setNewBus(bus);
    setEditingBusId(bus.id);
  };

  const cancelEditBus = () => {
    setNewBus({ plateNumber: '', capacity: 40, driverName: '', driverPhone: '', driverAge: 30, status: 'active' });
    setEditingBusId(null);
  };

  // --- Handlers for Destinations ---

  const handleAddDestination = async () => {
    if(!newDest.name || !newDest.address) {
      addNotification('error', 'Please provide a location name and address');
      return;
    }
    const id = editingDestId ? editingDestId : Date.now().toString();
    await addDestination({ ...newDest, id } as Destination);
    addNotification('success', editingDestId ? 'Location updated' : 'Location added');
    
    // Reset
    setNewDest({ name: '', address: '', mapUrl: '', lat: 0, lng: 0, isCampus: false });
    setEditingDestId(null);
  };

  const handleEditDestination = (dest: Destination) => {
    setNewDest(dest);
    setEditingDestId(dest.id);
  };

  const cancelEditDest = () => {
    setNewDest({ name: '', address: '', mapUrl: '', lat: 0, lng: 0, isCampus: false });
    setEditingDestId(null);
  };

  // --- Handlers for Schedules ---

  const handleAddStop = () => {
    if (!tempStop.destinationId || !tempStop.arrivalTime) return;
    const dest = destinations.find(d => d.id === tempStop.destinationId);
    if (!dest) return;

    const stop: RouteStop = {
       id: Math.random().toString(36).substr(7),
       destinationId: dest.id,
       name: dest.name,
       arrivalTime: tempStop.arrivalTime
    };
    
    setNewSchedule({
       ...newSchedule,
       stops: [...(newSchedule.stops || []), stop]
    });
    setTempStop({ destinationId: '', arrivalTime: '' });
  };

  const handleRemoveStop = (idx: number) => {
     const updated = [...(newSchedule.stops || [])];
     updated.splice(idx, 1);
     setNewSchedule({ ...newSchedule, stops: updated });
  };

  const handleCreateSchedule = async () => {
    if(!newSchedule.busId || !newSchedule.departureTime || !newSchedule.originId || !newSchedule.destinationId) {
      addNotification('error', 'Please fill in all trip details');
      return;
    }
    await addSchedule({ ...newSchedule, id: Date.now().toString() } as Schedule);
    addNotification('success', 'Trip scheduled successfully');
    setNewSchedule({ busId: '', departureTime: '', type: 'inbound', originId: '', destinationId: '', stops: [] });
  };

  const handleTypeChange = (type: 'inbound' | 'outbound' | 'custom') => {
      const campus = destinations.find(d => d.isCampus);
      let updates: Partial<Schedule> = { type };
      
      if (campus) {
          if (type === 'inbound') {
              updates.destinationId = campus.id;
          } else if (type === 'outbound') {
              updates.originId = campus.id;
          }
      }
      setNewSchedule({ ...newSchedule, ...updates });
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
            <div className={`bg-white p-8 rounded-[2.5rem] border ${editingBusId ? 'border-bgc-300 ring-2 ring-bgc-100' : 'border-slate-200'} shadow-xl shadow-slate-200/50 relative overflow-hidden`}>
              {editingBusId && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-bgc-400 to-bgc-600" />
              )}
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  {editingBusId ? <><Pencil size={18} className="text-bgc-600"/> Edit Bus Details</> : <><Plus size={18} className="text-bgc-600"/> Register New Bus</>}
                </h3>
                {editingBusId && (
                  <button onClick={cancelEditBus} className="text-xs font-bold text-red-500 flex items-center gap-1 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                    <X size={14} /> Cancel Edit
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Info</label>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-bgc-400 focus:ring-4 focus:ring-bgc-50 transition-all font-bold text-slate-800" placeholder="Plate Number (e.g. CH-D-11)" value={newBus.plateNumber} onChange={e => setNewBus({...newBus, plateNumber: e.target.value})} />
                  <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-bgc-400 focus:ring-4 focus:ring-bgc-50 transition-all font-bold text-slate-800" placeholder="Capacity (Seats)" value={newBus.capacity} onChange={e => setNewBus({...newBus, capacity: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver Info</label>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-bgc-400 focus:ring-4 focus:ring-bgc-50 transition-all font-bold text-slate-800" placeholder="Driver Name" value={newBus.driverName} onChange={e => setNewBus({...newBus, driverName: e.target.value})} />
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-bgc-400 focus:ring-4 focus:ring-bgc-50 transition-all font-bold text-slate-800" placeholder="Contact Phone" value={newBus.driverPhone} onChange={e => setNewBus({...newBus, driverPhone: e.target.value})} />
                </div>
                <div className="flex items-end">
                  <button onClick={handleRegisterBus} className={`w-full p-4 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl ${editingBusId ? 'bg-bgc-600 hover:bg-bgc-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                    {editingBusId ? <><CheckCircle2 size={20}/> Update Bus</> : <><Plus size={20}/> Save Bus</>}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black tracking-widest text-slate-400">
                  <tr><th className="p-5">Bus ID</th><th className="p-5">Driver</th><th className="p-5">Capacity</th><th className="p-5 text-center">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {buses.map(bus => (
                    <tr key={bus.id} className={`transition-colors ${editingBusId === bus.id ? 'bg-bgc-50' : 'hover:bg-slate-50/50'}`}>
                      <td className="p-5 font-black text-slate-900">{bus.plateNumber}</td>
                      <td className="p-5"><p className="font-bold">{bus.driverName}</p><p className="text-xs text-slate-400">{bus.driverPhone}</p></td>
                      <td className="p-5 font-bold text-slate-600">{bus.capacity} Seats</td>
                      <td className="p-5 flex items-center justify-center gap-2">
                         <button onClick={() => handleEditBus(bus)} className="p-2 text-slate-400 hover:text-bgc-600 hover:bg-bgc-50 rounded-xl transition-all"><Pencil size={16}/></button>
                         <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-tighter">Active</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {mgmtTab === 'destinations' && (
          <motion.div key="destinations" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className={`bg-white p-8 rounded-[2.5rem] border ${editingDestId ? 'border-bgc-300 ring-2 ring-bgc-100' : 'border-slate-200'} shadow-2xl shadow-slate-200/50 relative overflow-hidden`}>
              {editingDestId && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-bgc-400 to-bgc-600" />
              )}
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  {editingDestId ? <><Pencil size={18} className="text-bgc-600"/> Edit Location</> : <><MapPin size={18} className="text-bgc-600"/> Add New Location</>}
                </h3>
                {editingDestId && (
                  <button onClick={cancelEditDest} className="text-xs font-bold text-red-500 flex items-center gap-1 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                    <X size={14} /> Cancel Edit
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location Name</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-bgc-400 focus:ring-4 focus:ring-bgc-50 transition-all font-bold text-slate-800" placeholder="e.g. Agrabad Terminal" value={newDest.name} onChange={e => setNewDest({...newDest, name: e.target.value})} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address / Landmark</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-bgc-400 focus:ring-4 focus:ring-bgc-50 transition-all font-bold text-slate-800" placeholder="e.g. Sheikh Mujib Road" value={newDest.address} onChange={e => setNewDest({...newDest, address: e.target.value})} />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-6 items-end">
                   <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latitude</label>
                         <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-bgc-400 focus:ring-4 focus:ring-bgc-50 transition-all font-bold text-slate-800" placeholder="22.335" value={newDest.lat || ''} onChange={e => setNewDest({...newDest, lat: parseFloat(e.target.value)})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Longitude</label>
                         <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-bgc-400 focus:ring-4 focus:ring-bgc-50 transition-all font-bold text-slate-800" placeholder="91.801" value={newDest.lng || ''} onChange={e => setNewDest({...newDest, lng: parseFloat(e.target.value)})} />
                      </div>
                   </div>
                   <div className="flex items-center gap-4 h-[56px] px-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <span className="text-slate-500 text-sm font-bold">Is Campus?</span>
                      <button 
                        onClick={() => setNewDest({...newDest, isCampus: !newDest.isCampus})}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${newDest.isCampus ? 'bg-bgc-500' : 'bg-slate-300'}`}
                      >
                         <div className={`w-4 h-4 bg-white rounded-full transition-transform ${newDest.isCampus ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                   </div>
                   <button onClick={handleAddDestination} className={`h-[56px] px-8 text-white font-black rounded-2xl flex items-center gap-2 transition-all shadow-xl ${editingDestId ? 'bg-bgc-600 hover:bg-bgc-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                     {editingDestId ? <><CheckCircle2 size={20}/> Update</> : <><Plus size={20}/> Add</>}
                   </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map(dest => (
                <div key={dest.id} className={`bg-white p-6 rounded-3xl border shadow-sm flex flex-col justify-between transition-all ${dest.isCampus ? 'border-bgc-300 ring-2 ring-bgc-100' : 'border-slate-200'} ${editingDestId === dest.id ? 'ring-4 ring-bgc-200' : ''}`}>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl ${dest.isCampus ? 'bg-bgc-100 text-bgc-700' : 'bg-slate-50 text-slate-500'}`}>
                         <MapPin size={24} />
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEditDestination(dest)} className="p-2 text-slate-300 hover:text-bgc-600 transition-colors"><Pencil size={18}/></button>
                        <button onClick={() => removeDestination(dest.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <h4 className="text-lg font-black text-slate-900">{dest.name}</h4>
                       {dest.isCampus && <span className="text-[9px] bg-bgc-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Campus</span>}
                    </div>
                    <p className="text-sm text-slate-500 mt-1 font-bold">{dest.address}</p>
                    {dest.lat && dest.lng ? (
                       <div className="mt-3 text-[10px] font-mono text-slate-400 bg-slate-50 p-2 rounded-lg inline-block">
                          {dest.lat}, {dest.lng}
                       </div>
                    ) : (
                       <div className="mt-3 text-[10px] text-slate-400 italic">No coordinates set</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {mgmtTab === 'schedules' && (
          <motion.div key="schedules" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
              
              {/* Route Builder */}
              <div className="mb-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Trip Configuration</h3>
                <div className="flex flex-col lg:flex-row gap-6">
                   <div className="flex-1 space-y-4">
                      {/* Trip Type */}
                      <div className="flex items-center bg-slate-100 rounded-2xl p-1">
                        <button onClick={() => handleTypeChange('inbound')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newSchedule.type === 'inbound' ? 'bg-white shadow-sm text-bgc-700' : 'text-slate-400'}`}>To Campus</button>
                        <button onClick={() => handleTypeChange('outbound')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newSchedule.type === 'outbound' ? 'bg-white shadow-sm text-bgc-700' : 'text-slate-400'}`}>From Campus</button>
                        <button onClick={() => handleTypeChange('custom')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newSchedule.type === 'custom' ? 'bg-white shadow-sm text-bgc-700' : 'text-slate-400'}`}>Custom</button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From (Start)</label>
                           <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800" value={newSchedule.originId} onChange={e => setNewSchedule({...newSchedule, originId: e.target.value})}>
                              <option value="">-- Select --</option>
                              {destinations.map(d => <option key={d.id} value={d.id}>{d.name} {d.isCampus ? '(Campus)' : ''}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To (End)</label>
                           <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800" value={newSchedule.destinationId} onChange={e => setNewSchedule({...newSchedule, destinationId: e.target.value})}>
                              <option value="">-- Select --</option>
                              {destinations.map(d => <option key={d.id} value={d.id}>{d.name} {d.isCampus ? '(Campus)' : ''}</option>)}
                           </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Bus</label>
                            <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800" value={newSchedule.busId} onChange={e => setNewSchedule({...newSchedule, busId: e.target.value})}>
                              <option value="">-- Bus --</option>
                              {buses.map(b => <option key={b.id} value={b.id}>{b.plateNumber}</option>)}
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Time</label>
                            <input type="time" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800" value={newSchedule.departureTime} onChange={e => setNewSchedule({...newSchedule, departureTime: e.target.value})} />
                         </div>
                      </div>
                   </div>

                   {/* Route & Map Section */}
                   <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stops along the way</label>
                         <div className="flex gap-2">
                            <select className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800" value={tempStop.destinationId} onChange={e => setTempStop({...tempStop, destinationId: e.target.value})}>
                               <option value="">Select Stop...</option>
                               {destinations.filter(d => d.id !== newSchedule.originId && d.id !== newSchedule.destinationId).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <input type="time" className="w-24 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800" value={tempStop.arrivalTime} onChange={e => setTempStop({...tempStop, arrivalTime: e.target.value})} />
                            <button onClick={handleAddStop} className="p-3 bg-slate-900 text-white rounded-xl"><Plus size={18} /></button>
                         </div>
                      </div>
                      
                      {/* Visual Stop List */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 min-h-[100px]">
                         {(!newSchedule.stops || newSchedule.stops.length === 0) && <p className="text-center text-slate-400 text-xs mt-8">No intermediate stops added</p>}
                         <ul className="space-y-2">
                            {newSchedule.stops?.map((stop, idx) => (
                               <li key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                  <div className="flex items-center gap-3">
                                     <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">{idx + 1}</div>
                                     <div>
                                        <p className="text-xs font-bold text-slate-800">{stop.name}</p>
                                        <p className="text-[9px] text-slate-400 font-mono">@{stop.arrivalTime}</p>
                                     </div>
                                  </div>
                                  <button onClick={() => handleRemoveStop(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                               </li>
                            ))}
                         </ul>
                      </div>
                      
                      {/* Map Preview */}
                      <RouteMap 
                        origin={destinations.find(d => d.id === newSchedule.originId)}
                        destination={destinations.find(d => d.id === newSchedule.destinationId)}
                        stops={newSchedule.stops || []}
                      />
                   </div>
                </div>

                <div className="mt-8 flex justify-end">
                   <button onClick={handleCreateSchedule} className="h-[56px] px-8 bg-bgc-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-bgc-700 shadow-xl shadow-bgc-600/20"><Plus size={20}/> Publish Route</button>
                </div>
              </div>
            </div>

            {/* List of Schedules */}
            <div className="grid grid-cols-1 gap-4">
              {schedules.map(schedule => {
                 const origin = destinations.find(d => d.id === schedule.originId);
                 const destination = destinations.find(d => d.id === schedule.destinationId);
                 return (
                    <div key={schedule.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-bgc-300 transition-all shadow-sm">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-bgc-50 text-bgc-600 rounded-2xl flex flex-col items-center justify-center border border-bgc-100">
                             <span className="text-lg font-black">{schedule.departureTime}</span>
                             <span className="text-[9px] font-bold uppercase">Departs</span>
                          </div>
                          <div>
                             <div className="flex items-center gap-3 mb-2">
                                <span className="font-black text-slate-900 text-lg">{origin?.name}</span>
                                <div className="flex flex-col items-center px-2">
                                   <span className="text-[9px] font-bold text-slate-400 mb-0.5">{(schedule.stops || []).length} Stops</span>
                                   <ArrowRight size={16} className="text-bgc-400" />
                                </div>
                                <span className="font-black text-slate-900 text-lg">{destination?.name}</span>
                             </div>
                             <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                <span className="flex items-center gap-1.5"><BusIcon size={14}/> {buses.find(b => b.id === schedule.busId)?.plateNumber}</span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wide ${schedule.type === 'inbound' ? 'bg-green-100 text-green-700' : schedule.type === 'outbound' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{schedule.type}</span>
                             </div>
                          </div>
                       </div>
                       <div className="hidden md:flex -space-x-2">
                          {(schedule.stops || []).map((s, i) => (
                             <div key={i} title={`${s.name} @ ${s.arrivalTime}`} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 cursor-help shadow-sm">
                                {i + 1}
                             </div>
                          ))}
                          {(schedule.stops || []).length > 0 && (
                             <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm">+</div>
                          )}
                       </div>
                    </div>
                 );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
