import {z} from "zod";

export const registerSchema = z.object({
    nombre: z.string().min(5, "El nombre debe tener al menos 5 caracteres").max(50, "El nombre no puede exceder los 50 caracteres"),
    correo: z.string().email("El correo no es válido").min(5, "El correo debe tener al menos 5 caracteres").max(50, "El correo no puede exceder los 50 caracteres"),
    contraseña: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
        .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
        .regex(/\d/, "La contraseña debe contener al menos un número")
        .regex(/[@$!%*?&]/, "La contraseña debe contener al menos un carácter especial")
        .max(50, "La contraseña no puede exceder los 50 caracteres")
})

export const  passwordValidationSchema = z.object({
    contraseña: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
        .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
        .regex(/\d/, "La contraseña debe contener al menos un número")
        .regex(/[@$!%*?&]/, "La contraseña debe contener al menos un carácter especial")
        .max(50, "La contraseña no puede exceder los 50 caracteres")
})

export type RegisterData = z.infer<typeof registerSchema>;