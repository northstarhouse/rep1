import { 
  volunteers, 
  guests, 
  staff as staffTable, 
  type Volunteer, 
  type Guest, 
  type Staff,
  type InsertVolunteer, 
  type InsertGuest, 
  type InsertStaff,
  users,
  type User,
  type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // Volunteer methods
  createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer>;
  getVolunteers(): Promise<Volunteer[]>;
  getVolunteersByCategory(category: string): Promise<Volunteer[]>;
  
  // Guest methods
  createGuest(guest: InsertGuest): Promise<Guest>;
  getGuests(): Promise<Guest[]>;
  
  // Staff methods
  createStaff(staff: InsertStaff): Promise<Staff>;
  getStaff(): Promise<Staff[]>;
  
  // People management methods
  getAllPeople(): Promise<Array<(Volunteer & { type: 'volunteer' }) | (Guest & { type: 'guest' }) | (Staff & { type: 'staff' })>>;
  deletePerson(type: 'volunteer' | 'guest' | 'staff', id: number): Promise<boolean>;
  getUniqueVolunteerNames(): Promise<string[]>;
  getUniqueStaffNames(): Promise<string[]>;
  
  // User methods (kept for compatibility)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private volunteers: Map<number, Volunteer>;
  private guests: Map<number, Guest>;
  private staff: Map<number, Staff>;
  private users: Map<number, User>;
  private currentVolunteerId: number;
  private currentGuestId: number;
  private currentStaffId: number;
  private currentUserId: number;

  constructor() {
    this.volunteers = new Map();
    this.guests = new Map();
    this.staff = new Map();
    this.users = new Map();
    this.currentVolunteerId = 1;
    this.currentGuestId = 1;
    this.currentStaffId = 1;
    this.currentUserId = 1;
  }

  // Volunteer methods
  async createVolunteer(insertVolunteer: InsertVolunteer): Promise<Volunteer> {
    const id = this.currentVolunteerId++;
    const volunteer: Volunteer = { 
      ...insertVolunteer, 
      id, 
      timeOut: insertVolunteer.timeOut || null 
    };
    this.volunteers.set(id, volunteer);
    return volunteer;
  }

  async getVolunteers(): Promise<Volunteer[]> {
    return Array.from(this.volunteers.values());
  }

  async getVolunteersByCategory(category: string): Promise<Volunteer[]> {
    return Array.from(this.volunteers.values()).filter(
      volunteer => volunteer.area === category
    );
  }

  // Guest methods
  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const id = this.currentGuestId++;
    const guest: Guest = { 
      ...insertGuest, 
      id,
      phone: insertGuest.phone || null,
      joinNewsletter: insertGuest.joinNewsletter || null,
      brideName: insertGuest.brideName || null,
      groomName: insertGuest.groomName || null,
      tourGuide: insertGuest.tourGuide || null
    };
    this.guests.set(id, guest);
    return guest;
  }

  async getGuests(): Promise<Guest[]> {
    return Array.from(this.guests.values());
  }

  // Staff methods
  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = this.currentStaffId++;
    const staff: Staff = { 
      ...insertStaff, 
      id,
      timeIn: insertStaff.timeIn || null,
      timeOut: insertStaff.timeOut || null,
      notes: insertStaff.notes || null
    };
    this.staff.set(id, staff);
    return staff;
  }

  async getStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values());
  }

  // People management methods
  async getAllPeople(): Promise<Array<(Volunteer & { type: 'volunteer' }) | (Guest & { type: 'guest' }) | (Staff & { type: 'staff' })>> {
    const allPeople = [];
    
    for (const volunteer of Array.from(this.volunteers.values())) {
      allPeople.push({ ...volunteer, type: 'volunteer' as const });
    }
    
    for (const guest of Array.from(this.guests.values())) {
      allPeople.push({ ...guest, type: 'guest' as const });
    }
    
    for (const staff of Array.from(this.staff.values())) {
      allPeople.push({ ...staff, type: 'staff' as const });
    }
    
    return allPeople;
  }

  async deletePerson(type: 'volunteer' | 'guest' | 'staff', id: number): Promise<boolean> {
    switch (type) {
      case 'volunteer':
        return this.volunteers.delete(id);
      case 'guest':
        return this.guests.delete(id);
      case 'staff':
        return this.staff.delete(id);
      default:
        return false;
    }
  }

  // User methods (kept for compatibility)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUniqueVolunteerNames(): Promise<string[]> {
    const volunteers = Array.from(this.volunteers.values());
    const uniqueNames = Array.from(new Set(volunteers.map(v => v.name)));
    return uniqueNames.sort();
  }

  async getUniqueStaffNames(): Promise<string[]> {
    const staff = Array.from(this.staff.values());
    const uniqueNames = Array.from(new Set(staff.map(s => s.name)));
    return uniqueNames.sort();
  }
}

export class DatabaseStorage implements IStorage {
  async createVolunteer(insertVolunteer: InsertVolunteer): Promise<Volunteer> {
    const [volunteer] = await db
      .insert(volunteers)
      .values(insertVolunteer)
      .returning();
    return volunteer;
  }

  async getVolunteers(): Promise<Volunteer[]> {
    return await db.select().from(volunteers);
  }

  async getVolunteersByCategory(category: string): Promise<Volunteer[]> {
    return await db.select().from(volunteers).where(eq(volunteers.area, category));
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const [guest] = await db
      .insert(guests)
      .values(insertGuest)
      .returning();
    return guest;
  }

  async getGuests(): Promise<Guest[]> {
    return await db.select().from(guests);
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const [staffMember] = await db
      .insert(staffTable)
      .values(insertStaff)
      .returning();
    return staffMember;
  }

  async getStaff(): Promise<Staff[]> {
    return await db.select().from(staffTable);
  }

  async getAllPeople(): Promise<Array<(Volunteer & { type: 'volunteer' }) | (Guest & { type: 'guest' }) | (Staff & { type: 'staff' })>> {
    const allPeople = [];
    
    const volunteerData = await db.select().from(volunteers);
    const guestData = await db.select().from(guests);
    const staffData = await db.select().from(staffTable);
    
    for (const volunteer of volunteerData) {
      allPeople.push({ ...volunteer, type: 'volunteer' as const });
    }
    
    for (const guest of guestData) {
      allPeople.push({ ...guest, type: 'guest' as const });
    }
    
    for (const staffMember of staffData) {
      allPeople.push({ ...staffMember, type: 'staff' as const });
    }
    
    return allPeople;
  }

  async deletePerson(type: 'volunteer' | 'guest' | 'staff', id: number): Promise<boolean> {
    let result;
    
    switch (type) {
      case 'volunteer':
        result = await db.delete(volunteers).where(eq(volunteers.id, id));
        break;
      case 'guest':
        result = await db.delete(guests).where(eq(guests.id, id));
        break;
      case 'staff':
        result = await db.delete(staffTable).where(eq(staffTable.id, id));
        break;
      default:
        return false;
    }
    
    return result && (result as any).rowCount > 0;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUniqueVolunteerNames(): Promise<string[]> {
    const result = await db
      .selectDistinct({ name: volunteers.name })
      .from(volunteers)
      .orderBy(volunteers.name);
    return result.map(row => row.name);
  }

  async getUniqueStaffNames(): Promise<string[]> {
    const result = await db
      .selectDistinct({ name: staffTable.name })
      .from(staffTable)
      .orderBy(staffTable.name);
    return result.map(row => row.name);
  }
}

export const storage = new DatabaseStorage();
