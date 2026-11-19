import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const doctorSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  specialization: z.string().trim().min(2, 'Specialization is required').max(100),
  hospital: z.string().trim().min(2, 'Hospital is required').max(150),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone is required')
    .max(20)
    .regex(/^[+\d][\d\s\-()]+$/, 'Enter a valid phone number'),
  email: z.string().trim().email('Enter a valid email').max(120),
});

export const patientSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  age: z.coerce.number().int().min(0, 'Age must be 0 or more').max(130),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone is required')
    .max(20)
    .regex(/^[+\d][\d\s\-()]+$/, 'Enter a valid phone number'),
  condition: z.string().trim().min(2, 'Condition is required').max(120),
  status: z.enum(['Active', 'Discharged']),
  doctor: z.string().optional(),
});

export const appointmentSchema = z.object({
  patient: z.string().min(1, 'Patient is required'),
  doctor: z.string().min(1, 'Doctor is required'),
  scheduledAt: z.string().min(1, 'Date and time are required'),
  reason: z.string().trim().min(2, 'Reason is required').max(200),
  status: z.enum(['Scheduled', 'Completed', 'Cancelled']),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type DoctorValues = z.infer<typeof doctorSchema>;
export type PatientValues = z.infer<typeof patientSchema>;
export type AppointmentValues = z.infer<typeof appointmentSchema>;
