
import { create } from 'zustand';
import { User, Bus, Schedule, Booking, UserRole, Destination } from './types';
import { db } from './services/db';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  buses: Bus[];
  destinations: Destination[];
  schedules: Schedule[];
  bookings: Booking[];
  notifications: Notification[];
  isLoaded: boolean;
  
  // Actions
  initData: () => Promise<void>;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  addBus: (bus: Bus) => Promise<void>;
  addDestination: (dest: Destination) => Promise<void>;
  removeDestination: (id: string) => Promise<void>;
  addSchedule: (schedule: Schedule) => Promise<void>;
  createBooking: (booking: Booking) => Promise<void>;
  cancelBooking: (bookingId: string) => void;
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: [
    { id: 'admin1', name: 'System Admin', email: 'admin@bgctub.ac.bd', role: UserRole.ADMIN },
    { id: 'stu1', name: 'Tanvir Hasan', email: 'student@bgctub.ac.bd', role: UserRole.STUDENT, studentId: 'BGC-2024-001' },
  ],
  buses: [],
  destinations: [],
  schedules: [],
  bookings: [],
  notifications: [],
  isLoaded: false,

  initData: async () => {
    await db.init();
    const [buses, destinations, schedules, bookings] = await Promise.all([
      db.getBuses(),
      db.getDestinations(),
      db.getSchedules(),
      db.getBookings()
    ]);
    set({ buses, destinations, schedules, bookings, isLoaded: true });
  },

  login: (email, role) => set((state) => {
    const user = state.users.find(u => u.email === email && u.role === role);
    return { currentUser: user || { id: 'new', name: 'Demo User', email, role } };
  }),

  logout: () => set({ currentUser: null }),

  addBus: async (bus) => {
    await db.saveBus(bus);
    set((state) => ({ buses: [...state.buses, bus] }));
  },
  
  addDestination: async (dest) => {
    await db.saveDestination(dest);
    set((state) => ({ destinations: [...state.destinations, dest] }));
  },
  
  removeDestination: async (id) => {
    await db.deleteDestination(id);
    set((state) => ({ 
      destinations: state.destinations.filter(d => d.id !== id),
      schedules: state.schedules.filter(s => s.originId !== id && s.destinationId !== id)
    }));
  },

  addSchedule: async (schedule) => {
    await db.saveSchedule(schedule);
    set((state) => ({ schedules: [...state.schedules, schedule] }));
  },

  createBooking: async (booking) => {
    await db.saveBooking(booking);
    set((state) => ({ bookings: [...state.bookings, booking] }));
  },
  
  cancelBooking: (id) => set((state) => ({ 
    bookings: state.bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b) 
  })),

  addNotification: (type, message) => set((state) => ({
    notifications: [...state.notifications, { id: Math.random().toString(36).substring(7), type, message }]
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
}));
