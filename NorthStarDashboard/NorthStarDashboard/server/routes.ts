import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVolunteerSchema, insertGuestSchema, insertStaffSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Volunteer routes
  app.post("/api/volunteer", async (req, res) => {
    try {
      const volunteerData = insertVolunteerSchema.parse(req.body);
      const volunteer = await storage.createVolunteer(volunteerData);
      res.json(volunteer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid volunteer data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create volunteer check-in" });
      }
    }
  });

  app.get("/api/volunteer", async (req, res) => {
    try {
      const { category } = req.query;
      if (category && typeof category === "string") {
        const volunteers = await storage.getVolunteersByCategory(category);
        res.json(volunteers);
      } else {
        const volunteers = await storage.getVolunteers();
        res.json(volunteers);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch volunteers" });
    }
  });

  // Guest routes
  app.post("/api/guest", async (req, res) => {
    try {
      const guestData = insertGuestSchema.parse(req.body);
      const guest = await storage.createGuest(guestData);
      res.json(guest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid guest data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to register guest" });
      }
    }
  });

  app.get("/api/guest", async (req, res) => {
    try {
      const guests = await storage.getGuests();
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guests" });
    }
  });

  // Staff routes
  app.post("/api/employee-clock", async (req, res) => {
    try {
      const staffData = insertStaffSchema.parse(req.body);
      const staff = await storage.createStaff(staffData);
      res.json(staff);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid staff data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to clock in/out" });
      }
    }
  });

  app.get("/api/employee-clock", async (req, res) => {
    try {
      const staff = await storage.getStaff();
      res.json(staff);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff records" });
    }
  });

  // People management routes
  app.get("/api/people", async (req, res) => {
    try {
      const people = await storage.getAllPeople();
      res.json(people);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch people" });
    }
  });

  app.delete("/api/people/:type/:id", async (req, res) => {
    try {
      const { type, id } = req.params;
      const personId = parseInt(id);
      
      if (isNaN(personId)) {
        res.status(400).json({ message: "Invalid person ID" });
        return;
      }

      if (!['volunteer', 'guest', 'staff'].includes(type)) {
        res.status(400).json({ message: "Invalid person type" });
        return;
      }

      const deleted = await storage.deletePerson(type as 'volunteer' | 'guest' | 'staff', personId);
      
      if (deleted) {
        res.json({ message: "Person deleted successfully" });
      } else {
        res.status(404).json({ message: "Person not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete person" });
    }
  });

  // Statistics route for reporting
  app.get("/api/stats", async (req, res) => {
    try {
      const volunteers = await storage.getVolunteers();
      const guests = await storage.getGuests();
      const staff = await storage.getStaff();
      
      // Calculate total hours logged (simplified calculation)
      const totalHours = staff.reduce((total, s) => {
        if (s.timeIn && s.timeOut) {
          const timeIn = new Date(`2024-01-01 ${s.timeIn}`);
          const timeOut = new Date(`2024-01-01 ${s.timeOut}`);
          const hours = (timeOut.getTime() - timeIn.getTime()) / (1000 * 60 * 60);
          return total + Math.max(0, hours);
        }
        return total;
      }, 0);

      res.json({
        volunteers: volunteers.length,
        guests: guests.length,
        hours: Math.round(totalHours),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Get unique volunteer names for returning volunteers list
  app.get("/api/volunteer-names", async (req, res) => {
    try {
      const names = await storage.getUniqueVolunteerNames();
      res.json(names);
    } catch (error) {
      console.error("Error fetching volunteer names:", error);
      res.status(500).json({ error: "Failed to fetch volunteer names" });
    }
  });

  // Get unique staff names for returning staff list
  app.get("/api/staff-names", async (req, res) => {
    try {
      const names = await storage.getUniqueStaffNames();
      res.json(names);
    } catch (error) {
      console.error("Error fetching staff names:", error);
      res.status(500).json({ error: "Failed to fetch staff names" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
