import { z } from 'zod';

export const locationSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  address: z.string().trim().min(1, 'Address is required').max(300),
});

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email address is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(80, 'Name cannot exceed 80 characters'),
  email: z.string().trim().min(1, 'Email address is required').email('Invalid email address'),
  password: z.string().min(8, 'Min 8 characters required'),
  role: z.enum(['rider', 'driver']).default('rider'),
});

export const postTripSchema = z.object({
  origin: locationSchema.nullable().refine((val) => val !== null && !!val.address, {
    message: 'Please set a valid pickup point',
  }),
  destination: locationSchema.nullable().refine((val) => val !== null && !!val.address, {
    message: 'Please set a valid destination point',
  }),
  date: z.string().min(1, 'Trip date required'),
  departureTime: z.string().min(1, 'Departure time required'),
  seatsTotal: z.coerce.number().int().min(1, 'At least 1 seat required').max(10, 'Max 10 seats allowed'),
  pricePerSeat: z.coerce.number().min(0, 'Price cannot be negative'),
});

/**
 * Validates data against a Zod schema and returns formatted errors object.
 * @param {z.ZodSchema} schema
 * @param {any} data
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateWithZod(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) {
    return { isValid: true, errors: {} };
  }
  const errors = {};
  const issues = result.error.issues || result.error.errors || [];
  issues.forEach((err) => {
    const key = err.path && err.path[0] ? String(err.path[0]) : 'form';
    if (!errors[key]) {
      errors[key] = err.message;
    }
  });
  return { isValid: false, errors };
}
