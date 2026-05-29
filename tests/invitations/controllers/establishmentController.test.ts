import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registrarCuestionario, sendInvitation } from '../../../src/controllers/establishmentController';
import {TipoOrdenie, VentaLeche, Categoria} from '@prisma/client';
import { UUIDS } from '../../../src/utils';

const { establishmentsServiceMock } = vi.hoisted(() => ({
    establishmentsServiceMock: {
        sendInvitation: vi.fn(),
        guardarCuestionario: vi.fn(),
    },
}));

vi.mock('../../../src/services/establishmentsService', () => ({
    default: establishmentsServiceMock,
}));

describe('EstablishmentController.sendInvitation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('rechaza payload inválido', async () => {
        const req = {
            body: {
                correo: 'correo-invalido',
                rol: 'OWNER',
            },
            orgAccess: {
                idOrganizacion: 'org-1',
                idUsuario: 'user-1',
            },
            estAccess: {
                idEstablecimiento: 'est-1',
                rol: 'OWNER',
            },
        } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as any;
        const next = vi.fn();

        await sendInvitation(req, res, next);

        expect(establishmentsServiceMock.sendInvitation).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0].message).toBe('Datos inválidos');
        expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    it('rechaza cuando no hay acceso de organización', async () => {
        const req = {
            body: {
                correo: 'user@example.com',
                rol: 'ADMIN',
            },
            orgAccess: undefined,
            estAccess: {
                idEstablecimiento: 'est-1',
                rol: 'OWNER',
            },
        } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as any;
        const next = vi.fn();

        await sendInvitation(req, res, next);

        expect(establishmentsServiceMock.sendInvitation).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0].message).toBe('Acceso a organización no válido');
        expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    it('rechaza cuando no hay acceso de establecimiento', async () => {
        const req = {
            body: {
                correo: 'user@example.com',
                rol: 'ADMIN',
            },
            orgAccess: {
                idOrganizacion: 'org-1',
                idUsuario: 'user-1',
            },
            estAccess: undefined,
        } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as any;
        const next = vi.fn();

        await sendInvitation(req, res, next);

        expect(establishmentsServiceMock.sendInvitation).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0].message).toBe('Acceso a establecimiento no válido');
        expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    it('rechaza cuando el usuario no tiene rol dueño', async () => {
        const req = {
            body: {
                correo: 'user@example.com',
                rol: 'ADMIN',
            },
            orgAccess: {
                idOrganizacion: 'org-1',
                idUsuario: 'user-1',
            },
            estAccess: {
                idEstablecimiento: 'est-1',
                rol: 'EMPLOYEE',
            },
        } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as any;
        const next = vi.fn();

        await sendInvitation(req, res, next);

        expect(establishmentsServiceMock.sendInvitation).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0].message).toBe('Permisos insuficientes para enviar invitación');
        expect(next.mock.calls[0][0].statusCode).toBe(403);
    });

    it('envía invitación correctamente', async () => {
        const invitation = {
            invitador: { nombre: 'Invitador' },
            establecimiento: { nombre: 'Establecimiento' },
            rol: 'ADMIN',
            expiraEn: new Date(),
        };

        establishmentsServiceMock.sendInvitation.mockResolvedValue(invitation);

        const req = {
            body: {
                correo: 'user@example.com',
                rol: 'ADMIN',
            },
            orgAccess: {
                idOrganizacion: 'org-1',
                idUsuario: 'user-1',
            },
            estAccess: {
                idEstablecimiento: UUIDS.establishment,
                rol: 'OWNER',
            },
        } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as any;
        const next = vi.fn();

        await sendInvitation(req, res, next);

        expect(establishmentsServiceMock.sendInvitation).toHaveBeenCalledWith('org-1', UUIDS.establishment, 'user-1', 'user@example.com', 'ADMIN');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Invitación enviada correctamente',
            data: invitation,
        }));
        expect(next).not.toHaveBeenCalled();
    });
});

describe('EstablishmentController.registrarCuestionario', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('rechaza preguntas obligatorias', async () => {
        const req = {
            body: {
                cantidadVacas: 20,
            },
            orgAccess: {
                idOrganizacion: 'org-1',
                idUsuario: 'user-1',
            },
            estAccess: {
                idEstablecimiento: UUIDS.establishment,
                rol: 'OWNER',
            },
        } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as any;
        const next = vi.fn();

        await registrarCuestionario(req, res, next);

        expect(establishmentsServiceMock.guardarCuestionario).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0].message).toBe('Todos los campos son obligatorios y deben ser válidos');
        expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    it('guarda cuestionario correctamente', async () => {
        const savedQuestionnaire = { status: 'success' };
        establishmentsServiceMock.guardarCuestionario.mockResolvedValue(savedQuestionnaire);

        const req = {
            body: {
                cantidadVacas: 30,
                razas: [
                    {
                        tipo: 'existente',
                        idRaza: UUIDS.raza,
                        nombre: 'Holstein',
                    },
                    {
                        tipo: 'nuevo',
                        nombre: 'Jersey',
                    },
                ],
                productos: [
                    {
                        tipo: 'existente',
                        idProducto: UUIDS.producto,
                        nombre: 'Leche',
                    },
                    {
                        tipo: 'nuevo',
                        nombre: 'Queso',
                        categoria: Categoria.quesos,
                    },
                ],
                cantOrdenie: 2,
                tipoOrdenie: TipoOrdenie.manual,
                promLitros: 18,
                ventaLeche: VentaLeche.usina,
                empleados: true,
                cantEmpleados: 5,
                ubicacion: {
                    provincia: 'Córdoba',
                    localidad: 'Río Cuarto',
                },
            },
            orgAccess: {
                idOrganizacion: 'org-1',
                idUsuario: 'user-1',
            },
            estAccess: {
                idEstablecimiento: UUIDS.establishment,
                rol: 'OWNER',
            },
        } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as any;
        const next = vi.fn();

        await registrarCuestionario(req, res, next);

        expect(establishmentsServiceMock.guardarCuestionario).toHaveBeenCalledWith(expect.objectContaining({
            idEstablecimiento: UUIDS.establishment,
            cantidadVacas: 30,
            cantOrdenie: 2,
            tipoOrdenie: TipoOrdenie.manual,
            promLitros: 18,
            ventaLeche: VentaLeche.usina,
            empleados: true,
            cantEmpleados: 5,
            ubicacion: {
                provincia: 'Córdoba',
                localidad: 'Río Cuarto',
            },
            razas: expect.arrayContaining([
                expect.objectContaining({ tipo: 'existente', idRaza: UUIDS.raza, nombre: 'Holstein' }),
                expect.objectContaining({ tipo: 'nuevo', nombre: 'Jersey' }),
            ]),
            productos: expect.arrayContaining([
                expect.objectContaining({ tipo: 'existente', idProducto: UUIDS.producto, nombre: 'Leche' }),
                expect.objectContaining({ tipo: 'nuevo', nombre: 'Queso', categoria: Categoria.quesos }),
            ]),
        }));
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Cuestionario registrado correctamente',
            data: savedQuestionnaire,
        }));
        expect(next).not.toHaveBeenCalled();
    });
});
