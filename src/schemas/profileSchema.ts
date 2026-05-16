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
