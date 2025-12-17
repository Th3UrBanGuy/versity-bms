export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  name: string;
  identifier: string; // This is Student ID for students or Username for admins
  password?: string;
  role: UserRole;
  studentId?: string;
}

export interface Destination {
  id: string;
  name: string;
  address?: string;
  mapUrl?: string;
}

export interface Bus {
  id: string;
  plateNumber: string; // Bus Number
  capacity: number;    // Number of Seats
  driverName: string;
  driverPhone: string;
  driverAge: number;
  status: 'active' | 'maintenance';
}

export interface Schedule {
  id: string;
  busId: string;
  originId: string;
  destinationId: string;
  departureTime: string;
  type: 'inbound' | 'outbound';
}

export interface Booking {
  id: string;
  scheduleId: string;
  studentId: string;
  seatNumber: number;
  date: string;
  status: 'confirmed' | 'cancelled';
  timestamp: number;
}