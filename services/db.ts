
import { neon } from '@neondatabase/serverless';

/**
 * Super Compatibility Database Service
 * 
 * Provides a robust connection to the Neon Serverless Postgres instance.
 * Includes a hardcoded fallback to ensure connectivity in all client-side environments.
 */

let _sql: any = null;

// Verified connection string - Primary Anchor for the application
const FALLBACK_DATABASE_URL = 'postgresql://neondb_owner:npg_l3EdsLaVbg5Y@ep-empty-bush-afa2ayxj-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';

const getSql = async () => {
  if (_sql) return _sql;

  let dbUrl = FALLBACK_DATABASE_URL;

  // Optional: Try process.env if available (Node/Vercel)
  try {
    if (typeof process !== 'undefined' && process.env && process.env.DATABASE_URL) {
      dbUrl = process.env.DATABASE_URL;
    }
  } catch (e) {}

  // Optional: Try import.meta.env if available (Vite)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DATABASE_URL) {
      // @ts-ignore
      dbUrl = import.meta.env.DATABASE_URL;
    }
  } catch (e) {}

  try {
    _sql = neon(dbUrl);
    return _sql;
  } catch (e) {
    console.error("Critical Database Engine Error:", e);
    return null;
  }
};

export const db = {
  /**
   * Initializes the database schema. Mandatory call before operations.
   */
  init: async () => {
    try {
      const sql = await getSql();
      if (!sql) throw new Error("Could not initialize database engine.");

      // Users Table
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
      // Destinations Table - Added lat, lng, is_campus
      await sql`
        CREATE TABLE IF NOT EXISTS destinations (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          address TEXT,
          map_url TEXT,
          lat DECIMAL,
          lng DECIMAL,
          is_campus BOOLEAN DEFAULT FALSE
        )
      `;
      // Migration for Destinations
      try { await sql`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS lat DECIMAL`; } catch (e) {}
      try { await sql`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS lng DECIMAL`; } catch (e) {}
      try { await sql`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS is_campus BOOLEAN DEFAULT FALSE`; } catch (e) {}

      // Buses Table
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
      // Schedules Table - Added stops
      await sql`
        CREATE TABLE IF NOT EXISTS schedules (
          id TEXT PRIMARY KEY,
          bus_id TEXT,
          origin_id TEXT,
          destination_id TEXT,
          departure_time TEXT,
          type TEXT,
          stops TEXT 
        )
      `;
      // Migration for Schedules
      try { await sql`ALTER TABLE schedules ADD COLUMN IF NOT EXISTS stops TEXT`; } catch (e) {}

      // Bookings Table - Added boarding_point
      await sql`
        CREATE TABLE IF NOT EXISTS bookings (
          id TEXT PRIMARY KEY,
          schedule_id TEXT,
          student_id TEXT,
          seat_number INTEGER,
          date TEXT,
          status TEXT,
          timestamp BIGINT,
          boarding_point TEXT
        )
      `;
      // Migration for Bookings
      try { await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS boarding_point TEXT`; } catch (e) {}

      console.log("Database Sync Status: Connected & Online");
    } catch (e) {
      console.error("Database initialization failed:", e);
      // We do not throw here to allow the app to attempt partial loading if DB fails
    }
  },

  getUsers: async () => {
    try {
      const sql = await getSql();
      if (!sql) return [];
      const result = (await sql`SELECT * FROM users`) as any[];
      return result.map(r => ({
        id: r.id,
        name: r.name,
        identifier: r.identifier,
        password: r.password,
        role: r.role,
        studentId: r.student_id
      }));
    } catch (e) {
      console.error("Failed to fetch users", e);
      return [];
    }
  },

  saveUser: async (user: any) => {
    const sql = await getSql();
    if (!sql) throw new Error("DB Connection Unavailable");
    try {
      return await sql`
        INSERT INTO users (id, name, identifier, password, role, student_id)
        VALUES (${user.id}, ${user.name}, ${user.identifier}, ${user.password}, ${user.role}, ${user.studentId || null})
        ON CONFLICT (id) DO UPDATE SET 
          name = EXCLUDED.name, 
          password = EXCLUDED.password
      `;
    } catch (e: any) {
      console.error("Registration write error:", e);
      throw e;
    }
  },

  getDestinations: async () => {
    try {
      const sql = await getSql();
      if (!sql) return [];
      const result = (await sql`SELECT * FROM destinations`) as any[];
      return result.map(r => ({ 
        id: r.id, 
        name: r.name, 
        address: r.address, 
        mapUrl: r.map_url,
        lat: Number(r.lat) || 0,
        lng: Number(r.lng) || 0,
        isCampus: r.is_campus
      }));
    } catch (e) {
      return [];
    }
  },

  saveDestination: async (dest: any) => {
    const sql = await getSql();
    if (!sql) return;
    return await sql`
      INSERT INTO destinations (id, name, address, map_url, lat, lng, is_campus)
      VALUES (${dest.id}, ${dest.name}, ${dest.address}, ${dest.mapUrl}, ${dest.lat || 0}, ${dest.lng || 0}, ${dest.isCampus || false})
      ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        address = EXCLUDED.address, 
        map_url = EXCLUDED.map_url,
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        is_campus = EXCLUDED.is_campus
    `;
  },

  deleteDestination: async (id: string) => {
    const sql = await getSql();
    if (!sql) return;
    return await sql`DELETE FROM destinations WHERE id = ${id}`;
  },

  getBuses: async () => {
    try {
      const sql = await getSql();
      if (!sql) return [];
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
    return await sql`
      INSERT INTO buses (id, plate_number, capacity, driver_name, driver_phone, driver_age, status)
      VALUES (${bus.id}, ${bus.plateNumber}, ${bus.capacity}, ${bus.driverName}, ${bus.driverPhone}, ${bus.driverAge}, ${bus.status})
      ON CONFLICT (id) DO UPDATE SET 
        plate_number = EXCLUDED.plate_number, 
        capacity = EXCLUDED.capacity,
        driver_name = EXCLUDED.driver_name,
        driver_phone = EXCLUDED.driver_phone,
        driver_age = EXCLUDED.driver_age,
        status = EXCLUDED.status
    `;
  },

  getSchedules: async () => {
    try {
      const sql = await getSql();
      if (!sql) return [];
      const result = (await sql`SELECT * FROM schedules`) as any[];
      return result.map(r => ({
        id: r.id,
        busId: r.bus_id,
        originId: r.origin_id,
        destinationId: r.destination_id,
        departureTime: r.departure_time,
        type: r.type,
        stops: r.stops ? JSON.parse(r.stops) : []
      }));
    } catch (e) {
      return [];
    }
  },

  saveSchedule: async (s: any) => {
    const sql = await getSql();
    if (!sql) return;
    return await sql`
      INSERT INTO schedules (id, bus_id, origin_id, destination_id, departure_time, type, stops)
      VALUES (${s.id}, ${s.busId}, ${s.originId}, ${s.destinationId}, ${s.departureTime}, ${s.type}, ${JSON.stringify(s.stops || [])})
    `;
  },

  getBookings: async () => {
    try {
      const sql = await getSql();
      if (!sql) return [];
      const result = (await sql`SELECT * FROM bookings`) as any[];
      return result.map(r => ({
        id: r.id,
        scheduleId: r.schedule_id,
        studentId: r.student_id,
        seatNumber: r.seat_number,
        date: r.date,
        status: r.status,
        timestamp: Number(r.timestamp),
        boardingPoint: r.boarding_point || 'Main Terminal'
      }));
    } catch (e) {
      return [];
    }
  },

  saveBooking: async (b: any) => {
    const sql = await getSql();
    if (!sql) return;
    return await sql`
      INSERT INTO bookings (id, schedule_id, student_id, seat_number, date, status, timestamp, boarding_point)
      VALUES (${b.id}, ${b.scheduleId}, ${b.studentId}, ${b.seatNumber}, ${b.date}, ${b.status}, ${b.timestamp}, ${b.boardingPoint})
      ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status
    `;
  }
};
