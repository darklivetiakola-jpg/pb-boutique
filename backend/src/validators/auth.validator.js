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

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(80),
  lastName: z.string().trim().min(1, "Nom requis").max(80),
  phone: z.string().trim().max(20).regex(/^[0-9+\s().-]*$/, "Numéro invalide").optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
}).strict();
