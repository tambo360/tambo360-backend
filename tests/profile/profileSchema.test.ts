import { describe, expect, it } from 'vitest';
import { actualizarPerfilSchema } from '../../src/schemas/profileSchema';

describe('actualizarPerfilSchema', () => {
    it('acepta solo nombre', () => {
        expect(actualizarPerfilSchema.safeParse({ nombre: 'Nuevo Nombre' }).success).toBe(true);
    });

    it('rechaza nombre de menos de 5 o más de 50 caracteres', () => {
        const corto = actualizarPerfilSchema.safeParse({ nombre: 'abc' });
        expect(corto.success).toBe(false);
        expect(corto.error?.issues[0].message).toBe('El nombre debe tener al menos 5 caracteres');

        expect(actualizarPerfilSchema.safeParse({ nombre: 'a'.repeat(51) }).success).toBe(false);
    });

    it('rechaza body vacío', () => {
        const vacio = actualizarPerfilSchema.safeParse({});
        expect(vacio.success).toBe(false);
        expect(vacio.error?.issues[0].message).toBe('Debés enviar al menos nombre o correo');
    });

    it('exige contraseñaActual si viene correo', () => {
        const sinPass = actualizarPerfilSchema.safeParse({ correo: 'otro@test.com' });
        expect(sinPass.success).toBe(false);
        expect(sinPass.error?.issues[0].message).toBe('Para cambiar el correo se requiere la contraseña actual');

        expect(
            actualizarPerfilSchema.safeParse({ correo: 'otro@test.com', contraseñaActual: 'x' }).success
        ).toBe(true);
    });

    it('recorta espacios y pasa el correo a minúsculas', () => {
        const r = actualizarPerfilSchema.parse({ correo: '  Otro@Test.COM ', contraseñaActual: 'x' });
        expect(r.correo).toBe('otro@test.com');
    });

    it('rechaza correo inválido', () => {
        expect(
            actualizarPerfilSchema.safeParse({ correo: 'no-es-correo', contraseñaActual: 'x' }).success
        ).toBe(false);
    });
});