import { describe, expect, it } from 'vitest';
import { generarHistorial } from '../../src/lib/seed/historialPrueba';

const HOY = new Date(2026, 9, 30, 15, 0, 0); // 30/10/2026

describe('generarHistorial', () => {
    it('es determinístico: la misma semilla genera los mismos datos', () => {
        const a = generarHistorial({ hoy: HOY, semilla: 7 });
        const b = generarHistorial({ hoy: HOY, semilla: 7 });
        expect(a).toEqual(b);
    });

    it('cubre los meses pedidos más el mes actual', () => {
        const { lotes } = generarHistorial({ hoy: HOY, meses: 6 });
        const meses = new Set(lotes.map((l) => `${l.fechaProduccion.getFullYear()}-${l.fechaProduccion.getMonth()}`));
        expect(meses.size).toBe(7);
        expect(meses.has('2026-3')).toBe(true); // abril
        expect(meses.has('2026-9')).toBe(true); // octubre (actual)
    });

    it('genera suficientes lotes para el análisis de IA (mínimo 15)', () => {
        const { lotes } = generarHistorial({ hoy: HOY });
        expect(lotes.length).toBeGreaterThanOrEqual(15);
    });

    it('numera los lotes en forma consecutiva y en orden cronológico', () => {
        const { lotes } = generarHistorial({ hoy: HOY });
        lotes.forEach((l, i) => expect(l.numeroLote).toBe(i + 1));
        for (let i = 1; i < lotes.length; i++) {
            expect(lotes[i].fechaProduccion.getTime()).toBeGreaterThanOrEqual(lotes[i - 1].fechaProduccion.getTime());
        }
    });

    it('no genera fechas futuras ni lotes completados sin merma', () => {
        const { lotes, costosGenerales } = generarHistorial({ hoy: HOY });
        for (const l of lotes) {
            expect(l.fechaProduccion.getTime()).toBeLessThanOrEqual(HOY.getTime());
            expect(l.cantidad).toBeGreaterThan(0);
            expect(l.mermas.length).toBeGreaterThan(0);
        }
        for (const c of costosGenerales) {
            expect(c.fecha.getTime()).toBeLessThanOrEqual(HOY.getTime());
        }
    });

    it('deja el último lote pendiente y los demás completados', () => {
        const { lotes } = generarHistorial({ hoy: HOY });
        expect(lotes[lotes.length - 1].estado).toBe(false);
        expect(lotes.slice(0, -1).every((l) => l.estado)).toBe(true);
    });

    it('los 3 últimos lotes tienen merma alta y el resto merma normal', () => {
        const { lotes } = generarHistorial({ hoy: HOY });
        const pct = (i: number) => lotes[i].mermas.reduce((a, m) => a + m.cantidad, 0) / lotes[i].cantidad;

        for (let i = 0; i < lotes.length - 3; i++) {
            expect(pct(i)).toBeLessThan(0.04);
        }
        for (let i = lotes.length - 3; i < lotes.length; i++) {
            expect(pct(i)).toBeGreaterThan(0.07);
        }
    });

    it('exige temperatura de tanque solo cuando el destino es tanque de frío', () => {
        const { lotes } = generarHistorial({ hoy: HOY });
        for (const l of lotes) {
            if (l.destino === 'TANQUE_FRIO') {
                expect(l.tempTanque).not.toBeNull();
                expect(l.tempTanque!).toBeGreaterThan(0);
            } else {
                expect(l.tempTanque).toBeNull();
            }
        }
    });

    it('genera costos generales para todos los meses con datos', () => {
        const { costosGenerales } = generarHistorial({ hoy: HOY, meses: 6 });
        const meses = new Set(costosGenerales.map((c) => `${c.fecha.getFullYear()}-${c.fecha.getMonth()}`));
        expect(meses.size).toBeGreaterThanOrEqual(6);
        expect(costosGenerales.every((c) => c.monto > 0)).toBe(true);
    });

    it('funciona aunque hoy sea el primer día del mes', () => {
        const { lotes } = generarHistorial({ hoy: new Date(2026, 10, 1, 9, 0, 0) });
        const ultimo = lotes[lotes.length - 1];
        expect(ultimo.fechaProduccion.getDate()).toBe(1);
        const hoyTemprano = new Date(2026, 10, 1, 9, 0, 0);
        expect(ultimo.fechaProduccion.getTime()).toBeLessThanOrEqual(hoyTemprano.getTime());
    });
});
