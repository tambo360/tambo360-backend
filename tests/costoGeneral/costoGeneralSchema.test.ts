import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TipoCostoGeneral } from '@prisma/client';
import {
    actualizarCostoGeneralSchema,
    crearCostoGeneralSchema,
    listarCostosGeneralesSchema,
    validarFechaGasto,
} from '../../src/schemas/costoGeneralSchema';

// Hoy en Argentina: jueves 5/11/2026, 12:00 (15:00 UTC)
const AHORA = new Date('2026-11-05T15:00:00.000Z');

describe('validarFechaGasto', () => {
    it('acepta la fecha de hoy', () => {
        expect(validarFechaGasto(new Date('2026-11-05T00:00:00.000Z'), AHORA)).toBeNull();
        expect(validarFechaGasto(new Date('2026-11-05T14:00:00.000Z'), AHORA)).toBeNull();
    });

    it('acepta hasta 7 días atrás y rechaza 8', () => {
        expect(validarFechaGasto(new Date('2026-10-29T00:00:00.000Z'), AHORA)).toBeNull();
        expect(validarFechaGasto(new Date('2026-10-28T00:00:00.000Z'), AHORA)).toMatch(/anterior a 7 días/);
    });

    it('rechaza fechas futuras', () => {
        expect(validarFechaGasto(new Date('2026-11-06T00:00:00.000Z'), AHORA)).toMatch(/futura/);
        expect(validarFechaGasto(new Date('2026-11-06T15:00:00.000Z'), AHORA)).toMatch(/futura/);
        expect(validarFechaGasto(new Date('2027-01-01T00:00:00.000Z'), AHORA)).toMatch(/futura/);
    });

    it('usa el día de Argentina: a las 22:30 todavía es "hoy" aunque en UTC ya sea mañana', () => {
        const ahora = new Date('2026-11-06T01:30:00.000Z'); // 5/11 22:30 en Argentina
        expect(validarFechaGasto(new Date('2026-11-06T01:00:00.000Z'), ahora)).toBeNull();
        expect(validarFechaGasto(new Date('2026-11-05T00:00:00.000Z'), ahora)).toBeNull();
        expect(validarFechaGasto(new Date('2026-11-06T00:00:00.000Z'), ahora)).toMatch(/futura/);
    });
});

describe('crearCostoGeneralSchema', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(AHORA);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const valido = {
        tipoCosto: TipoCostoGeneral.PERSONAL,
        descripcion: 'Sueldos del mes',
        monto: 150000,
        fecha: '2026-11-05',
    };

    it('acepta un gasto válido', () => {
        expect(crearCostoGeneralSchema.safeParse(valido).success).toBe(true);
    });

    it('rechaza fecha futura y fecha de hace más de 7 días, con mensaje claro', () => {
        const futura = crearCostoGeneralSchema.safeParse({ ...valido, fecha: '2026-11-06' });
        expect(futura.success).toBe(false);
        expect(futura.error?.issues[0].message).toBe('La fecha del gasto no puede ser futura');

        const vieja = crearCostoGeneralSchema.safeParse({ ...valido, fecha: '2026-10-28' });
        expect(vieja.success).toBe(false);
        expect(vieja.error?.issues[0].message).toBe('La fecha del gasto no puede ser anterior a 7 días');
    });

    it('la descripción admite hasta 100 caracteres', () => {
        expect(crearCostoGeneralSchema.safeParse({ ...valido, descripcion: 'a'.repeat(100) }).success).toBe(true);
        expect(crearCostoGeneralSchema.safeParse({ ...valido, descripcion: 'a'.repeat(101) }).success).toBe(false);
    });
});

describe('actualizarCostoGeneralSchema', () => {
    it('no limita la fecha (se puede editar un gasto viejo)', () => {
        expect(actualizarCostoGeneralSchema.safeParse({ fecha: '2026-01-15' }).success).toBe(true);
    });
});

describe('listarCostosGeneralesSchema', () => {
    it('pagina de a 20 por defecto', () => {
        expect(listarCostosGeneralesSchema.parse({}).limit).toBe(20);
    });
});