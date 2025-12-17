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
  login: (identifier: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
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
  users: [],
  buses: [],
  destinations: [],
  schedules: [],
  bookings: [],
  notifications: [],
  isLoaded: false,

  initData: async () => {
    await db.init();
    const [users, buses, destinations, schedules, bookings] = await Promise.all([
      db.getUsers(),
      db.getBuses(),
      db.getDestinations(),
      db.getSchedules(),
      db.getBookings()
    ]);
    set({ users, buses, destinations, schedules, bookings, isLoaded: true });
  },

  login: async (identifier, password, role) => {
    const { users, addNotification } = get();
    const user = users.find(u => u.identifier === identifier && u.role === role);
    
    if (user && user.password === password) {
      set({ currentUser: user });
      addNotification('success', `Welcome back, ${user.name}!`);
      return true;
    }
    
    addNotification('error', 'Invalid identifier or password');
    return false;
  },

  signup: async (userData) => {
    const { users, addNotification } = get();
    
    // Check if identifier already exists
    if (users.some(u => u.identifier === userData.identifier)) {
      addNotification('error', 'This identifier is already registered');
      return false;
    }

    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substring(7),
      studentId: userData.role === UserRole.STUDENT ? userData.identifier : undefined
    };

    try {
      await db.saveUser(newUser);
      set((state) => ({ users: [...state.users, newUser], currentUser: newUser }));
      addNotification('success', 'Account created successfully!');
      return true;
    } catch (e) {
      addNotification('error', 'Failed to create account. Please try again.');
      return false;
    }
  },

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