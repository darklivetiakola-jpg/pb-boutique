import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8, "8 caractères minimum"),
  phone: z.string().min(8).max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().max(200).optional(),
  newPassword: z.string()
    .min(10, "10 caractères minimum")
    .max(100)
    .regex(/[A-Za-z]/, "Ajoutez au moins une lettre")
    .regex(/\d/, "Ajoutez au moins un chiffre"),
});
