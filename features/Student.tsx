
import React from 'react';
import { useStore } from '../store';
import { Schedule, Booking } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Calendar, Ticket, ArrowRight, AlertCircle, Bus as BusIcon, Trash2, CheckCircle2, Loader2, Navigation, Circle } from 'lucide-react';

export const StudentDashboard = ({ activeTab }: { activeTab: string }) => {
  const { schedules, buses, destinations, bookings, currentUser, createBooking, cancelBooking, addNotification } = useStore();
  const [isBooking, setIsBooking] = React.useState(false);
  const [selectedSchedule, setSelectedSchedule] = React.useState<Schedule | null>(null);
  const [selectedBoardingPoint, setSelectedBoardingPoint] = React.useState<string>('');

  const myBookings = bookings.filter(b => b.studentId === currentUser?.id);

  const getDestName = (id: string) => destinations.find(d => d.id === id)?.name || 'Unknown';

  const handleBookClick = (schedule: Schedule) => {
      // Check if student already booked for this schedule
      const alreadyBooked = bookings.some(b => b.studentId === currentUser?.id && b.scheduleId === schedule.id && b.status === 'confirmed');
      if (alreadyBooked) {
          addNotification('error', 'Reservation already exists for this trip.');
          return;
      }
      setSelectedSchedule(schedule);
      // Default boarding point is origin
      setSelectedBoardingPoint(getDestName(schedule.originId));
  };

  const confirmBooking = async () => {
    if (!selectedSchedule || isBooking) return;

    const existingBookingsForSchedule = bookings.filter(b => b.scheduleId === selectedSchedule.id && b.status === 'confirmed').length;
    const bus = buses.find(b => b.id === selectedSchedule.busId);
    
    if(bus && existingBookingsForSchedule >= bus.capacity) {
      addNotification('error', 'Bus capacity reached!');
      return;
    }

    setIsBooking(true);
    const seatNum = existingBookingsForSchedule + 1;
    const booking: Booking = {
      id: Date.now().toString(),
      scheduleId: selectedSchedule.id,
      studentId: currentUser!.id,
      seatNumber: seatNum,
      date: new Date().toISOString().split('T')[0],
      status: 'confirmed',
      timestamp: Date.now(),
      boardingPoint: selectedBoardingPoint
    };

    try {
      await createBooking(booking);
      addNotification('success', `Seat #${seatNum} Reserved! Boarding at: ${selectedBoardingPoint}`);
      setSelectedSchedule(null);
    } catch (e) {
      addNotification('error', 'Failed to process booking.');
    } finally {
      setIsBooking(false);
    }
  };

  if (activeTab === 'dashboard') {
    const nextTrip = myBookings.filter(b => b.status === 'confirmed').sort((a,b) => b.timestamp - a.timestamp)[0];
    const nextTripSchedule = nextTrip ? schedules.find(s => s.id === nextTrip.scheduleId) : null;

    return (
      <div className="space-y-8">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 text-white p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Ticket size={240} /></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-3 tracking-tighter">Hello, {currentUser?.name.split(' ')[0]}!</h2>
            <p className="text-slate-400 text-lg mb-8 font-bold">Manage your university commute with ease.</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-xs font-black border border-white/10 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Student ID: {currentUser?.identifier}
            </div>
          </div>
        </div>
        
        <h3 className="font-black text-xl text-slate-900 flex items-center gap-3"><Ticket className="text-bgc-600"/> Active Ticket</h3>

        {nextTrip && nextTripSchedule ? (
             <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden max-w-2xl relative">
                 <div className="h-4 bg-gradient-to-r from-bgc-600 to-bgc-400 w-full" />
                 <div className="p-8">
                     <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                         <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Campus Boarding Pass</p>
                             <div className="flex items-center gap-3 text-3xl font-black text-slate-900 tracking-tighter">
                                <span>{getDestName(nextTripSchedule.originId)}</span>
                                <ArrowRight className="text-bgc-400" />
                                <span>{getDestName(nextTripSchedule.destinationId)}</span>
                             </div>
                         </div>
                         <div className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-100">Confirmed</div>
                     </div>
                     <div className="flex flex-wrap gap-8 md:gap-16 mb-8">
                         <div>
                             <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Trip Date</p>
                             <div className="flex items-center gap-2 font-black text-slate-800"><Calendar size={18} className="text-bgc-500" /> {nextTrip.date}</div>
                         </div>
                         <div>
                             <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Boarding Point</p>
                             <div className="flex items-center gap-2 font-black text-slate-800"><MapPin size={18} className="text-bgc-500" /> {nextTrip.boardingPoint || 'Origin'}</div>
                         </div>
                         <div>
                             <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Seat Assignment</p>
                             <div className="flex items-center gap-2 font-black text-4xl text-bgc-600 leading-none">{nextTrip.seatNumber}</div>
                         </div>
                     </div>
                 </div>
                 <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#f8fafc] rounded-full" />
                 <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#f8fafc] rounded-full" />
             </motion.div>
        ) : (
             <div className="p-12 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center">
                <p className="text-slate-400 font-bold">No active reservations. Please book a trip below.</p>
             </div>
        )}
      </div>
    );
  }

  if (activeTab === 'book') {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Trip Selector</h2>
        
        {selectedSchedule ? (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl max-w-2xl mx-auto">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                 <Navigation className="text-bgc-600" /> Confirm Boarding Point
              </h3>
              <p className="text-slate-500 text-sm font-bold mb-6">Select where you will hop on the bus for the trip from <span className="text-slate-900">{getDestName(selectedSchedule.originId)}</span> to <span className="text-slate-900">{getDestName(selectedSchedule.destinationId)}</span>.</p>
              
              <div className="space-y-3 mb-8">
                 {/* Origin Option */}
                 <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedBoardingPoint === getDestName(selectedSchedule.originId) ? 'border-bgc-500 bg-bgc-50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <input 
                      type="radio" 
                      name="boarding" 
                      className="hidden" 
                      checked={selectedBoardingPoint === getDestName(selectedSchedule.originId)}
                      onChange={() => setSelectedBoardingPoint(getDestName(selectedSchedule.originId))} 
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedBoardingPoint === getDestName(selectedSchedule.originId) ? 'border-bgc-500' : 'border-slate-300'}`}>
                       {selectedBoardingPoint === getDestName(selectedSchedule.originId) && <div className="w-2.5 h-2.5 bg-bgc-500 rounded-full" />}
                    </div>
                    <div>
                       <p className="font-black text-slate-900">{getDestName(selectedSchedule.originId)}</p>
                       <p className="text-xs text-slate-400 font-bold">Origin • {selectedSchedule.departureTime}</p>
                    </div>
                 </label>

                 {/* Stops Options */}
                 {(selectedSchedule.stops || []).map((stop) => (
                    <label key={stop.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedBoardingPoint === stop.name ? 'border-bgc-500 bg-bgc-50' : 'border-slate-100 hover:border-slate-200'}`}>
                       <input 
                         type="radio" 
                         name="boarding" 
                         className="hidden" 
                         checked={selectedBoardingPoint === stop.name}
                         onChange={() => setSelectedBoardingPoint(stop.name)} 
                       />
                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedBoardingPoint === stop.name ? 'border-bgc-500' : 'border-slate-300'}`}>
                          {selectedBoardingPoint === stop.name && <div className="w-2.5 h-2.5 bg-bgc-500 rounded-full" />}
                       </div>
                       <div>
                          <p className="font-black text-slate-900">{stop.name}</p>
                          <p className="text-xs text-slate-400 font-bold">Stop • {stop.arrivalTime}</p>
                       </div>
                    </label>
                 ))}
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setSelectedSchedule(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                 <button onClick={confirmBooking} disabled={isBooking} className="flex-[2] py-4 bg-bgc-600 text-white font-black rounded-xl hover:bg-bgc-700 transition-colors flex items-center justify-center gap-2">
                    {isBooking ? <Loader2 className="animate-spin" /> : 'Confirm Ticket'}
                 </button>
              </div>
           </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4 pb-20">
            {schedules.map(schedule => {
              const bus = buses.find(b => b.id === schedule.busId);
              const bookedCount = bookings.filter(b => b.scheduleId === schedule.id && b.status === 'confirmed').length;
              const available = (bus?.capacity || 0) - bookedCount;
              const alreadyBooked = bookings.some(b => b.studentId === currentUser?.id && b.scheduleId === schedule.id && b.status === 'confirmed');

              return (
                <div key={schedule.id} className={`group bg-white p-8 rounded-[2rem] border transition-all ${alreadyBooked ? 'border-bgc-200 bg-bgc-50/20' : 'border-slate-200 shadow-sm hover:shadow-xl'}`}>
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${schedule.type === 'inbound' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                          {schedule.type === 'inbound' ? 'To Campus' : 'From Campus'}
                        </span>
                        {alreadyBooked && <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-bgc-600 bg-bgc-100 px-3 py-1 rounded-lg"><CheckCircle2 size={12}/> My Ticket</span>}
                      </div>
                      <div className="flex items-center gap-3 text-2xl font-black text-slate-900 mb-3 tracking-tighter group-hover:text-bgc-600 transition-colors">
                          <span>{getDestName(schedule.originId)}</span>
                          <ArrowRight size={20} className="text-slate-400"/>
                          <span>{getDestName(schedule.destinationId)}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-slate-500 font-bold mb-2">
                        <span className="flex items-center gap-2"><Clock size={16} className="text-bgc-500"/> {schedule.departureTime}</span>
                        <span className="flex items-center gap-2"><BusIcon size={16} className="text-bgc-500"/> {bus?.plateNumber}</span>
                      </div>
                      {schedule.stops && schedule.stops.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                              <div className="w-2 h-2 rounded-full bg-slate-300" />
                              <span>Via: {schedule.stops.map(s => s.name).join(', ')}</span>
                          </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-5 min-w-[160px] pl-8 md:border-l border-slate-100">
                      <div className="text-right">
                        <span className={`block text-3xl font-black leading-none mb-1 ${available === 0 ? 'text-red-500' : 'text-slate-900'}`}>{available}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seats Left</span>
                      </div>
                      <button
                        onClick={() => handleBookClick(schedule)}
                        disabled={available === 0 || alreadyBooked || isBooking}
                        className="w-full px-6 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-bgc-600 active:scale-[0.97] transition-all text-[11px] uppercase tracking-widest disabled:opacity-30"
                      >
                        {isBooking ? <Loader2 className="animate-spin mx-auto" size={16} /> : alreadyBooked ? 'Reserved' : available === 0 ? 'Full' : 'Book Seat'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'history') {
     return (
        <div className="space-y-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Travel Log</h2>
            <div className="space-y-4 pb-20">
                <AnimatePresence>
                    {myBookings.map((booking) => {
                        const schedule = schedules.find(s => s.id === booking.scheduleId);
                        if (!schedule) return null;
                        return (
                            <motion.div 
                                layout
                                key={booking.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold ${booking.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        <Ticket size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-black text-slate-900">{getDestName(schedule.originId)}</span>
                                            <ArrowRight size={14} className="text-slate-400" />
                                            <span className="font-black text-slate-900">{getDestName(schedule.destinationId)}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <span className="flex items-center gap-1"><MapPin size={10} /> Boarding: {booking.boardingPoint || 'Origin'}</span>
                                            <span>•</span>
                                            <span>Seat #{booking.seatNumber}</span>
                                            <span>•</span>
                                            <span className={`${booking.status === 'confirmed' ? 'text-green-600' : 'text-red-600'}`}>{booking.status}</span>
                                        </div>
                                    </div>
                                </div>
                                {booking.status === 'confirmed' && (
                                    <button 
                                        onClick={async () => {
                                            await cancelBooking(booking.id);
                                            addNotification('info', 'Booking cancelled.');
                                        }}
                                        className="px-5 py-3 text-[10px] font-black text-red-600 bg-red-50 hover:bg-red-100 rounded-xl flex items-center gap-2 transition-all uppercase tracking-widest"
                                    >
                                        <Trash2 size={14} /> Void Ticket
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {myBookings.length === 0 && (
                     <div className="p-20 text-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
                        <Calendar size={64} className="mx-auto text-slate-200 mb-6" />
                        <p className="text-slate-400 font-black text-lg">Your travel log is empty.</p>
                    </div>
                )}
            </div>
        </div>
     );
  }

  return null;
};
