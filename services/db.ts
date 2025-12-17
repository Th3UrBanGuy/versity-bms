import { neon } from '@neondatabase/serverless';

/**
 * Super Compatibility Database Service
 * 
 * Logic:
 * 1. Checks process.env.DATABASE_URL (Standard for Vercel/Production)
 * 2. Attempts to dynamically import ../secrets.ts (Local development fallback)
 * 3. Safely initializes the Neon client only when needed to prevent crashes
 */

let _sql: ReturnType<typeof neon> | null = null;
let _dbUrl: string | null = null;

const getSql = async () => {
  if (_sql) return _sql;

  // 1. Try process.env
  try {
    // Note: In Vite/Vercel, process.env.DATABASE_URL is often replaced at build time
    // or available via import.meta.env.DATABASE_URL
    if (typeof process !== 'undefined' && process.env.DATABASE_URL) {
      _dbUrl = process.env.DATABASE_URL;
    }
  } catch (e) {
    // process might not be defined in all browser environments
  }

  // 2. Try local secrets.ts if env is empty
  if (!_dbUrl) {
    try {
      // CRITICAL: Added /* @vite-ignore */ to prevent the build tool from 
      // trying to resolve this file during the Vercel deployment build.
      // This solves the "Could not resolve ../secrets.ts" error.
      const secrets = await import(/* @vite-ignore */ '../secrets.ts');
      if (secrets && secrets.DATABASE_URL) {
        _dbUrl = secrets.DATABASE_URL;
      }
    } catch (e) {
      // secrets.ts is missing or ignored, which is expected in production/Vercel
    }
  }

  if (!_dbUrl) {
    console.warn("DATABASE_URL not found. Please set it in Vercel environment variables or local secrets.ts.");
    return null;
  }

  _sql = neon(_dbUrl);
  return _sql;
};

export const db = {
  init: async () => {
    try {
      const sql = await getSql();
      if (!sql) return;

      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          identifier TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL,
          student_id TEXT
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS destinations (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          address TEXT,
          map_url TEXT
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS buses (
          id TEXT PRIMARY KEY,
          plate_number TEXT NOT NULL,
          capacity INTEGER NOT NULL,
          driver_name TEXT,
          driver_phone TEXT,
          driver_age INTEGER,
          status TEXT
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS schedules (
          id TEXT PRIMARY KEY,
          bus_id TEXT,
          origin_id TEXT,
          destination_id TEXT,
          departure_time TEXT,
          type TEXT
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS bookings (
          id TEXT PRIMARY KEY,
          schedule_id TEXT,
          student_id TEXT,
          seat_number INTEGER,
          date TEXT,
          status TEXT,
          timestamp BIGINT
        )
      `;
      console.log("Database initialized successfully");
    } catch (e) {
      console.error("DB Init Error:", e);
    }
  },

  // Users CRUD
  getUsers: async () => {
    const sql = await getSql();
    if (!sql) return [];
    try {
      const result = (await sql`SELECT * FROM users`) as any[];
      return result.map(r => ({
        id: r.id,
        name: r.name,
        identifier: r.identifier,
        password: r.password,
        role: r.role as any,
        studentId: r.student_id
      }));
    } catch (e) {
      console.error("Failed to fetch users:", e);
      return [];
    }
  },

  saveUser: async (user: any) => {
    const sql = await getSql();
    if (!sql) return;
    await sql`
      INSERT INTO users (id, name, identifier, password, role, student_id)
      VALUES (${user.id}, ${user.name}, ${user.identifier}, ${user.password}, ${user.role}, ${user.studentId || null})
    `;
  },

  // Destinations CRUD
  getDestinations: async () => {
    const sql = await getSql();
    if (!sql) return [];
    try {
      const result = (await sql`SELECT * FROM destinations`) as any[];
      return result.map(r => ({ id: r.id, name: r.name, address: r.address, mapUrl: r.map_url }));
    } catch (e) {
      return [];
    }
  },

  saveDestination: async (dest: any) => {
    const sql = await getSql();
    if (!sql) return;
    await sql`
      INSERT INTO destinations (id, name, address, map_url)
      VALUES (${dest.id}, ${dest.name}, ${dest.address}, ${dest.mapUrl})
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address, map_url = EXCLUDED.map_url
    `;
  },

  deleteDestination: async (id: string) => {
    const sql = await getSql();
    if (!sql) return;
    await sql`DELETE FROM destinations WHERE id = ${id}`;
  },

  // Buses CRUD
  getBuses: async () => {
    const sql = await getSql();
    if (!sql) return [];
    try {
      const result = (await sql`SELECT * FROM buses`) as any[];
      return result.map(r => ({ 
        id: r.id, 
        plateNumber: r.plate_number, 
        capacity: r.capacity, 
        driverName: r.driver_name, 
        driverPhone: r.driver_phone, 
        driverAge: r.driver_age, 
        status: r.status 
      }));
    } catch (e) {
      return [];
    }
  },

  saveBus: async (bus: any) => {
    const sql = await getSql();
    if (!sql) return;
    await sql`
      INSERT INTO buses (id, plate_number, capacity, driver_name, driver_phone, driver_age, status)
      VALUES (${bus.id}, ${bus.plateNumber}, ${bus.capacity}, ${bus.driverName}, ${bus.driverPhone}, ${bus.driverAge}, ${bus.status})
      ON CONFLICT (id) DO UPDATE SET plate_number = EXCLUDED.plate_number, capacity = EXCLUDED.capacity
    `;
  },

  // Schedules CRUD
  getSchedules: async () => {
    const sql = await getSql();
    if (!sql) return [];
    try {
      const result = (await sql`SELECT * FROM schedules`) as any[];
      return result.map(r => ({
        id: r.id,
        busId: r.bus_id,
        originId: r.origin_id,
        destinationId: r.destination_id,
        departureTime: r.departure_time,
        type: r.type
      }));
    } catch (e) {
      return [];
    }
  },

  saveSchedule: async (s: any) => {
    const sql = await getSql();
    if (!sql) return;
    await sql`
      INSERT INTO schedules (id, bus_id, origin_id, destination_id, departure_time, type)
      VALUES (${s.id}, ${s.busId}, ${s.originId}, ${s.destinationId}, ${s.departureTime}, ${s.type})
    `;
  },

  // Bookings
  getBookings: async () => {
    const sql = await getSql();
    if (!sql) return [];
    try {
      const result = (await sql`SELECT * FROM bookings`) as any[];
      return result.map(r => ({
        id: r.id,
        scheduleId: r.schedule_id,
        studentId: r.student_id,
        seatNumber: r.seat_number,
        date: r.date,
        status: r.status,
        timestamp: Number(r.timestamp)
      }));
    } catch (e) {
      return [];
    }
  },

  saveBooking: async (b: any) => {
    const sql = await getSql();
    if (!sql) return;
    await sql`
      INSERT INTO bookings (id, schedule_id, student_id, seat_number, date, status, timestamp)
      VALUES (${b.id}, ${b.scheduleId}, ${b.studentId}, ${b.seatNumber}, ${b.date}, ${b.status}, ${b.timestamp})
    `;
  }
};