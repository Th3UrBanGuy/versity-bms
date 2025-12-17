import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from '../secrets';

const sql = neon(DATABASE_URL);

export const db = {
  init: async () => {
    try {
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
    const result = await sql`SELECT * FROM users`;
    return result.map(r => ({
      id: r.id,
      name: r.name,
      identifier: r.identifier,
      password: r.password,
      role: r.role as any,
      studentId: r.student_id
    }));
  },
  saveUser: async (user: any) => {
    await sql`
      INSERT INTO users (id, name, identifier, password, role, student_id)
      VALUES (${user.id}, ${user.name}, ${user.identifier}, ${user.password}, ${user.role}, ${user.studentId || null})
    `;
  },

  // Destinations CRUD
  getDestinations: async () => {
    const result = await sql`SELECT * FROM destinations`;
    return result.map(r => ({ id: r.id, name: r.name, address: r.address, mapUrl: r.map_url }));
  },
  saveDestination: async (dest: any) => {
    await sql`
      INSERT INTO destinations (id, name, address, map_url)
      VALUES (${dest.id}, ${dest.name}, ${dest.address}, ${dest.mapUrl})
      ON CONFLICT (id) DO UPDATE SET name = ${dest.name}, address = ${dest.address}, map_url = ${dest.mapUrl}
    `;
  },
  deleteDestination: async (id: string) => {
    await sql`DELETE FROM destinations WHERE id = ${id}`;
  },

  // Buses CRUD
  getBuses: async () => {
    const result = await sql`SELECT * FROM buses`;
    return result.map(r => ({ 
      id: r.id, 
      plateNumber: r.plate_number, 
      capacity: r.capacity, 
      driverName: r.driver_name, 
      driverPhone: r.driver_phone, 
      driverAge: r.driver_age, 
      status: r.status 
    }));
  },
  saveBus: async (bus: any) => {
    await sql`
      INSERT INTO buses (id, plate_number, capacity, driver_name, driver_phone, driver_age, status)
      VALUES (${bus.id}, ${bus.plateNumber}, ${bus.capacity}, ${bus.driverName}, ${bus.driverPhone}, ${bus.driverAge}, ${bus.status})
      ON CONFLICT (id) DO UPDATE SET plate_number = ${bus.plateNumber}, capacity = ${bus.capacity}
    `;
  },

  // Schedules CRUD
  getSchedules: async () => {
    const result = await sql`SELECT * FROM schedules`;
    return result.map(r => ({
      id: r.id,
      busId: r.bus_id,
      originId: r.origin_id,
      destinationId: r.destination_id,
      departureTime: r.departure_time,
      type: r.type
    }));
  },
  saveSchedule: async (s: any) => {
    await sql`
      INSERT INTO schedules (id, bus_id, origin_id, destination_id, departure_time, type)
      VALUES (${s.id}, ${s.busId}, ${s.originId}, ${s.destinationId}, ${s.departureTime}, ${s.type})
    `;
  },

  // Bookings
  getBookings: async () => {
    const result = await sql`SELECT * FROM bookings`;
    return result.map(r => ({
      id: r.id,
      scheduleId: r.schedule_id,
      studentId: r.student_id,
      seatNumber: r.seat_number,
      date: r.date,
      status: r.status,
      timestamp: Number(r.timestamp)
    }));
  },
  saveBooking: async (b: any) => {
    await sql`
      INSERT INTO bookings (id, schedule_id, student_id, seat_number, date, status, timestamp)
      VALUES (${b.id}, ${b.scheduleId}, ${b.studentId}, ${b.seatNumber}, ${b.date}, ${b.status}, ${b.timestamp})
    `;
  }
};