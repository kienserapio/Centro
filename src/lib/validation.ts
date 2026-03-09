import { z } from "zod";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Full name is required."),
  unitNumber: z.string().min(1, "Unit number is required."),
  role: z.enum(["resident", "admin", "guard"]),
});

// ---------------------------------------------------------------------------
// Dues
// ---------------------------------------------------------------------------
export const duesSchema = z.object({
  residentId: z.string().uuid(),
  amount: z.number().positive("Amount must be positive."),
  dueDate: z.string().datetime(),
});

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------
export const announcementSchema = z.object({
  title: z.string().min(1, "Title is required.").max(120),
  body: z.string().min(1, "Body is required."),
});

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------
export const alertSchema = z.object({
  category: z.enum(["fire", "intrusion", "medical", "other"]),
  message: z.string().max(280).optional(),
});
