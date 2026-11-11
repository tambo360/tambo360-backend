import { z } from "zod";

export const respondOrganizationInvitationSchema = z.object({
    idInvitacion: z.uuid(),
    accion: z.enum(["aceptada", "rechazada"]),
    rol: z.enum(["ORG_ADMIN"])
});

export type RespondOrganizationInvitationInput = z.infer<typeof respondOrganizationInvitationSchema>;

export const respondEstablishmentInvitationSchema = z.object({
    idInvitacion: z.uuid(),
    accion: z.enum(["aceptada", "rechazada"]),
    rol: z.enum(["ADMIN", "EMPLOYEE"])
});

export type RespondEstablishmentInvitationInput = z.infer<typeof respondEstablishmentInvitationSchema>;

export const actualizarPerfilSchema = z
    .object({
        nombre: z
            .string()
            .trim()
            .min(5, "El nombre debe tener al menos 5 caracteres")
            .max(50, "El nombre no puede superar los 50 caracteres")
            .optional(),
        correo: z
            .string()
            .trim()
            .toLowerCase()
            .pipe(
                z
                    .email("Correo inválido")
                    .min(5, "El correo debe tener al menos 5 caracteres")
                    .max(50, "El correo no puede superar los 50 caracteres")
            )
            .optional(),
        contraseñaActual: z.string().min(1, "La contraseña actual es obligatoria").optional(),
    })
    .refine((data) => data.nombre !== undefined || data.correo !== undefined, {
        message: "Debés enviar al menos nombre o correo",
    })
    .refine((data) => data.correo === undefined || data.contraseñaActual !== undefined, {
        message: "Para cambiar el correo se requiere la contraseña actual",
        path: ["contraseñaActual"],
    });

export type ActualizarPerfilInput = z.infer<typeof actualizarPerfilSchema>;