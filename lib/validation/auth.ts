import { z } from 'zod';

export const customerTypeSchema = z.enum(['INDIVIDUAL', 'PRO']);

export const signupSchema = z.object({
  email: z.string().email('Adresse email invalide').max(255),
  password: z
    .string()
    .min(10, '10 caractères minimum')
    .max(128, 'Mot de passe trop long')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[a-z]/, 'Au moins une minuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
  firstName: z.string().min(1, 'Prénom requis').max(80),
  lastName: z.string().min(1, 'Nom requis').max(80),
  customerType: customerTypeSchema,
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const requestPasswordResetSchema = z.object({
  email: z.string().email('Adresse email invalide'),
});
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export const updatePasswordSchema = z
  .object({
    password: signupSchema.shape.password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
