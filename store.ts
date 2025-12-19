
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
  cancelBooking: (bookingId: string) => Promise<void>;
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
    try {
      // Step 1: Initialize Database
      await db.init();
      
      // Step 2: Parallel fetch all operational data
      const [users, buses, destinations, schedules, bookings] = await Promise.all([
        db.getUsers(),
        db.getBuses(),
        db.getDestinations(),
        db.getSchedules(),
        db.getBookings()
      ]);

      // Step 3: Session Restoration
      const savedUserId = localStorage.getItem('transport_user_id');
      let foundUser = null;
      if (savedUserId && users) {
        foundUser = users.find(u => u.id === savedUserId) || null;
      }
      
      set({ 
        users: users || [], 
        buses: buses || [], 
        destinations: destinations || [], 
        schedules: schedules || [], 
        bookings: bookings || [], 
        currentUser: foundUser,
        isLoaded: true 
      });

      if (foundUser) {
        console.log(`Session restored for: ${foundUser.name}`);
      } else {
        console.log("Portal data synchronization finalized.");
      }

    } catch (error) {
      console.error("Critical: Bootstrap data sync failed.", error);
      // Mark as loaded to allow user to see UI/Error state
      set({ isLoaded: true });
    }
  },

  login: async (identifier, password, role) => {
    const { addNotification } = get();
    
    try {
      // Refresh directory to catch latest signups
      const dbUsers = await db.getUsers();
      if (dbUsers && dbUsers.length > 0) {
        set({ users: dbUsers });
      }
    } catch (e) {
      console.warn("Falling back to local user cache during login.");
    }

    const { users } = get();
    const user = users.find(u => 
      u.identifier.toLowerCase() === identifier.trim().toLowerCase() && 
      u.role === role
    );
    
    if (user && user.password === password) {
      // Persist session
      localStorage.setItem('transport_user_id', user.id);
      set({ currentUser: user });
      addNotification('success', `Welcome back, ${user.name}`);
      return true;
    }
    
    addNotification('error', 'Login Failed: Invalid ID or Password');
    return false;
  },

  signup: async (userData) => {
    const { addNotification } = get();
    
    try {
      // Step 1: Ensure we have the absolute latest user list before checking for collision
      const latestUsers = await db.getUsers();
      set({ users: latestUsers });

      if (latestUsers.some(u => u.identifier.toLowerCase() === userData.identifier.trim().toLowerCase())) {
        addNotification('error', 'Registration Failed: This ID/Username is already taken.');
        return false;
      }

      const newUser: User = {
        ...userData,
        id: Math.random().toString(36).substring(7),
        studentId: userData.role === UserRole.STUDENT ? userData.identifier.trim() : undefined
      };

      // Step 2: Attempt write to Neon
      await db.saveUser(newUser);
      
      // Step 3: Local store update and login
      localStorage.setItem('transport_user_id', newUser.id);
      set((state) => ({ 
        users: [...state.users, newUser], 
        currentUser: newUser 
      }));
      
      addNotification('success', 'Account Activated! Welcome to BGC Trust Transport.');
      return true;
    } catch (e: any) {
      console.error("Signup Operation Aborted:", e);
      addNotification('error', `Network Error: ${e.message || 'Database link failed'}`);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('transport_user_id');
    set({ currentUser: null });
  },

  addBus: async (bus) => {
    try {
      await db.saveBus(bus);
      set((state) => ({ buses: [...state.buses, bus] }));
    } catch (e) {
      get().addNotification('error', 'Fleet registration failure.');
    }
  },
  
  addDestination: async (dest) => {
    try {
      await db.saveDestination(dest);
      set((state) => ({ destinations: [...state.destinations, dest] }));
    } catch (e) {
      get().addNotification('error', 'Location storage failure.');
    }
  },
  
  removeDestination: async (id) => {
    try {
      await db.deleteDestination(id);
      set((state) => ({ 
        destinations: state.destinations.filter(d => d.id !== id),
        schedules: state.schedules.filter(s => s.originId !== id && s.destinationId !== id)
      }));
    } catch (e) {
      get().addNotification('error', 'Location deletion failure.');
    }
  },

  addSchedule: async (schedule) => {
    try {
      await db.saveSchedule(schedule);
      set((state) => ({ schedules: [...state.schedules, schedule] }));
    } catch (e) {
      get().addNotification('error', 'Schedule publication failure.');
    }
  },

  createBooking: async (booking) => {
    try {
      await db.saveBooking(booking);
      set((state) => ({ bookings: [...state.bookings, booking] }));
    } catch (e) {
      get().addNotification('error', 'Seat reservation failure.');
    }
  },
  
  cancelBooking: async (id) => {
    const booking = get().bookings.find(b => b.id === id);
    if (booking) {
      const updated = { ...booking, status: 'cancelled' as const };
      try {
        await db.saveBooking(updated);
        set((state) => ({ 
          bookings: state.bookings.map(b => b.id === id ? updated : b) 
        }));
      } catch (e) {
        get().addNotification('error', 'Ticket void failure.');
      }
    }
  },

  addNotification: (type, message) => set((state) => ({
    notifications: [...state.notifications, { id: Math.random().toString(36).substring(7), type, message }]
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
}));
