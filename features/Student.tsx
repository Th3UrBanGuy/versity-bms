
import React from 'react';
import { useStore } from '../store';
import { Schedule, Booking } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Calendar, Ticket, ArrowRight, AlertCircle, Bus as BusIcon, Trash2, CheckCircle2 } from 'lucide-react';

export const StudentDashboard = ({ activeTab }: { activeTab: string }) => {
  const { schedules, buses, destinations, bookings, currentUser, createBooking, cancelBooking, addNotification } = useStore();

  const myBookings = bookings.filter(b => b.studentId === currentUser?.id);

  const getDestName = (id: string) => destinations.find(d => d.id === id)?.name || 'Unknown';

  const handleBook = (schedule: Schedule) => {
    // Check if student already booked for this schedule
    const alreadyBooked = bookings.some(b => b.studentId === currentUser?.id && b.scheduleId === schedule.id && b.status === 'confirmed');
    if (alreadyBooked) {
        addNotification('error', 'You already have a seat for this trip!');
        return;
    }

    const existingBookingsForSchedule = bookings.filter(b => b.scheduleId === schedule.id && b.status === 'confirmed').length;
    const bus = buses.find(b => b.id === schedule.busId);
    
    if(bus && existingBookingsForSchedule >= bus.capacity) {
      addNotification('error', 'Bus is full!');
      return;
    }

    const seatNum = existingBookingsForSchedule + 1;
    const booking: Booking = {
      id: Date.now().toString(),
      scheduleId: schedule.id,
      studentId: currentUser!.id,
      seatNumber: seatNum,
      date: new Date().toISOString().split('T')[0],
      status: 'confirmed',
      timestamp: Date.now()
    };

    createBooking(booking);
    addNotification('success', `Seat #${seatNum} Booked Successfully!`);
  };

  if (activeTab === 'dashboard') {
    const nextTrip = myBookings.filter(b => b.status === 'confirmed').sort((a,b) => b.timestamp - a.timestamp)[0];
    const nextTripSchedule = nextTrip ? schedules.find(s => s.id === nextTrip.scheduleId) : null;

    return (
      <div className="space-y-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-bgc-900 to-bgc-700 text-white p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Ticket size={240} /></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-2 tracking-tight">Hello, {currentUser?.name.split(' ')[0]}!</h2>
            <p className="text-bgc-200 text-lg mb-6 font-bold">Your university travel at your fingertips.</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-bold border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Student ID: {currentUser?.identifier}
            </div>
          </div>
        </div>
        
        <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2"><Ticket className="text-bgc-600"/> Current Ticket</h3>

        {nextTrip && nextTripSchedule ? (
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl relative">
                 <div className="h-4 bg-gradient-to-r from-bgc-500 to-bgc-700 w-full" />
                 <div className="p-8">
                     <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                         <div>
                             <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Boarding Pass</p>
                             <div className="flex items-center gap-3 text-2xl font-extrabold text-slate-900">
                                <span>{getDestName(nextTripSchedule.originId)}</span>
                                <ArrowRight className="text-bgc-400" />
                                <span>{getDestName(nextTripSchedule.destinationId)}</span>
                             </div>
                         </div>
                         <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold self-start">Active</div>
                     </div>
                     <div className="flex flex-wrap gap-8 md:gap-16 mb-8">
                         <div>
                             <p className="text-xs text-slate-500 uppercase font-bold mb-1">Date</p>
                             <div className="flex items-center gap-2 font-bold text-slate-800"><Calendar size={18} className="text-bgc-500" /> {nextTrip.date}</div>
                         </div>
                         <div>
                             <p className="text-xs text-slate-500 uppercase font-bold mb-1">Departure</p>
                             <div className="flex items-center gap-2 font-bold text-slate-800"><Clock size={18} className="text-bgc-500" /> {nextTripSchedule.departureTime}</div>
                         </div>
                         <div>
                             <p className="text-xs text-slate-500 uppercase font-bold mb-1">Seat</p>
                             <div className="flex items-center gap-2 font-extrabold text-3xl text-bgc-600">{nextTrip.seatNumber}</div>
                         </div>
                     </div>
                 </div>
                 <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#f8fafc] rounded-full" />
                 <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#f8fafc] rounded-full" />
             </motion.div>
        ) : (
             <div className="p-8 bg-white border border-dashed border-slate-300 rounded-3xl text-center">
                <p className="text-slate-600 font-bold">No active tickets. Please book a seat.</p>
             </div>
        )}
      </div>
    );
  }

  if (activeTab === 'book') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Select Your Trip</h2>
        <div className="grid grid-cols-1 gap-4 pb-20">
          {schedules.map(schedule => {
            const bus = buses.find(b => b.id === schedule.busId);
            const bookedCount = bookings.filter(b => b.scheduleId === schedule.id && b.status === 'confirmed').length;
            const available = (bus?.capacity || 0) - bookedCount;
            const alreadyBooked = bookings.some(b => b.studentId === currentUser?.id && b.scheduleId === schedule.id && b.status === 'confirmed');

            return (
              <div key={schedule.id} className={`group bg-white p-6 rounded-[2rem] border transition-all ${alreadyBooked ? 'border-bgc-200 bg-bgc-50/20' : 'border-slate-200 shadow-sm hover:shadow-xl'}`}>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div className="flex-1">
                     <div className="flex items-center gap-2 mb-3">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${schedule.type === 'inbound' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                         {schedule.type === 'inbound' ? 'To Campus' : 'From Campus'}
                       </span>
                       {alreadyBooked && <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-bgc-600 bg-bgc-100 px-3 py-1 rounded-full"><CheckCircle2 size={12}/> Booked</span>}
                     </div>
                     <div className="flex items-center gap-3 text-2xl font-black text-slate-900 mb-2 group-hover:text-bgc-600 transition-colors tracking-tighter">
                        <span>{getDestName(schedule.originId)}</span>
                        <ArrowRight size={20} className="text-slate-400"/>
                        <span>{getDestName(schedule.destinationId)}</span>
                     </div>
                     <div className="flex items-center gap-6 text-sm text-slate-600 font-bold">
                       <span className="flex items-center gap-1.5"><Clock size={16} className="text-bgc-500"/> {schedule.departureTime}</span>
                       <span className="flex items-center gap-1.5"><BusIcon size={16} className="text-bgc-500"/> {bus?.plateNumber}</span>
                     </div>
                  </div>
                  <div className="flex flex-col items-end gap-4 min-w-[140px] pl-4 md:border-l border-slate-100">
                     <div className="text-right">
                       <span className={`block text-3xl font-black ${available === 0 ? 'text-red-500' : 'text-slate-900'}`}>{available}</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available</span>
                     </div>
                     <button
                       onClick={() => handleBook(schedule)}
                       disabled={available === 0 || alreadyBooked}
                       className="w-full px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-bgc-600 active:scale-95 disabled:opacity-50 transition-all text-sm uppercase tracking-widest"
                     >
                       {alreadyBooked ? 'Reserved' : available === 0 ? 'Full' : 'Book Now'}
                     </button>
                  </div>
                </div>
              </div>
            );
          })}
          {schedules.length === 0 && (
             <div className="p-20 text-center bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
                <BusIcon size={64} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-black text-lg">No active trips found.</p>
             </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'history') {
     return (
        <div className="space-y-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Booking History</h2>
            <div className="space-y-4 pb-20">
                <AnimatePresence>
                    {myBookings.map((booking) => {
                        const schedule = schedules.find(s => s.id === booking.scheduleId);
                        if (!schedule) return null;
                        return (
                            <motion.div 
                                layout
                                key={booking.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold ${booking.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        <Ticket size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-black text-slate-900">{getDestName(schedule.originId)}</span>
                                            <ArrowRight size={14} className="text-slate-400" />
                                            <span className="font-black text-slate-900">{getDestName(schedule.destinationId)}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                            <span>Seat: {booking.seatNumber}</span>
                                            <span>•</span>
                                            <span>{booking.date}</span>
                                            <span>•</span>
                                            <span className={`uppercase tracking-widest ${booking.status === 'confirmed' ? 'text-green-600' : 'text-red-600'}`}>{booking.status}</span>
                                        </div>
                                    </div>
                                </div>
                                {booking.status === 'confirmed' && (
                                    <button 
                                        onClick={() => {
                                            cancelBooking(booking.id);
                                            addNotification('info', 'Booking cancelled successfully');
                                        }}
                                        className="px-4 py-2 text-xs font-black text-red-600 bg-red-50 hover:bg-red-100 rounded-xl flex items-center gap-2 transition-all uppercase tracking-widest"
                                    >
                                        <Trash2 size={14} /> Cancel Trip
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {myBookings.length === 0 && (
                     <div className="p-20 text-center bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
                        <Calendar size={64} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-black text-lg">No travel history found.</p>
                    </div>
                )}
            </div>
        </div>
     );
  }

  return null;
};
