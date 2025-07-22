import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const volunteers = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  timeIn: text("time_in").notNull(),
  timeOut: text("time_out"),
  area: text("area").notNull(),
  activities: text("activities").notNull(),
});

export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  reason: text("reason").notNull(),
  joinNewsletter: boolean("join_newsletter").default(false),
  brideName: text("bride_name"),
  groomName: text("groom_name"),
  tourGuide: text("tour_guide"),
  date: text("date").notNull(),
});

export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  timeIn: text("time_in"),
  timeOut: text("time_out"),
  notes: text("notes"),
});

export const insertVolunteerSchema = createInsertSchema(volunteers).omit({
  id: true,
});

export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
});

export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type InsertStaff = z.infer<typeof insertStaffSchema>;

export type Volunteer = typeof volunteers.$inferSelect;
export type Guest = typeof guests.$inferSelect;
export type Staff = typeof staff.$inferSelect;

// Remove the users table since it's not needed for this application
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
