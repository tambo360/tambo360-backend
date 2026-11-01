// Crea (o recrea) un usuario de prueba con varios meses de historial, para probar
// los gráficos de la sección Resumen y el flujo de alertas de IA.
//
// Uso:
//   npm run seed:prueba
//
// Variables opcionales:
//   SEED_EMAIL     correo del usuario        (default: prueba.historial@tambo360.test)
//   SEED_PASSWORD  contraseña del usuario    (default: Prueba123!)
//   SEED_MESES     meses de historial        (default: 6)
//
// Es repetible: si el establecimiento de prueba ya existe, reemplaza sus datos
// históricos (lotes, mermas, costos y promedios) y deja intacto todo lo demás.

import { prisma } from "./prisma";
import { hashPassword } from "../utils/password";
import { generarHistorial } from "./seed/historialPrueba";
import {
    AmbitoPromedioProductivo,
    Categoria,
    RolEstablecimiento,
    RolOrganizacion,
    TipoDestino,
    TipoRodeo,
    TipoSeguimiento,
    Unidad,
    Razas,
} from "@prisma/client";

const EMAIL = process.env.SEED_EMAIL ?? "usuario.prueba@tambo360.test";
const PASSWORD = process.env.SEED_PASSWORD ?? "Prueba123!";
const MESES = Number(process.env.SEED_MESES ?? 6);
const NOMBRE_ORGANIZACION = "Organización de Prueba";
const NOMBRE_ESTABLECIMIENTO = "Tambo de Prueba (historial)";
const CANT_VACAS = 120;

async function obtenerProductoLeche() {
    const existente = await prisma.producto.findFirst({
        where: { nombreNormalizado: "leche entera", idOrganizacion: null },
    });
    if (existente) return existente;

    return prisma.producto.create({
        data: {
            nombre: "Leche Entera",
            categoria: Categoria.leches,
            nombreNormalizado: "leche entera",
            esSistema: true,
        },
    });
}

// Borra el historial del establecimiento en orden de dependencias.
async function limpiarHistorial(idEstablecimiento: string) {
    const lotes = await prisma.loteProduccion.findMany({
        where: { idEstablecimiento },
        select: { idLote: true },
    });
    const idsLotes = lotes.map((l) => l.idLote);

    await prisma.alertaIA.deleteMany({ where: { idEstablecimiento } });
    // AiAnalysisExecution se elimina en cascada con el evento
    await prisma.aiAnalysisEvent.deleteMany({ where: { idEstablecimiento } });
    await prisma.promedioProductivoLote.deleteMany({ where: { idLote: { in: idsLotes } } });
    await prisma.promedioProductivo.deleteMany({ where: { idEstablecimiento } });
    // ResumenMensualCostoCategoria se elimina en cascada con el resumen
    await prisma.resumenMensual.deleteMany({ where: { idEstablecimiento } });
    await prisma.merma.deleteMany({ where: { idLote: { in: idsLotes } } });
    await prisma.costosDirecto.deleteMany({ where: { idLote: { in: idsLotes } } });
    await prisma.produccionRodeo.deleteMany({ where: { idLote: { in: idsLotes } } });
    await prisma.loteProduccion.deleteMany({ where: { idEstablecimiento } });
    await prisma.costoGeneral.deleteMany({ where: { idEstablecimiento } });
}

async function main() {
    const producto = await obtenerProductoLeche();

    // 1. Usuario
    const usuario = await prisma.usuario.upsert({
        where: { correo: EMAIL },
        update: {},
        create: {
            correo: EMAIL,
            nombre: "Usuario de Prueba",
            contrasena: await hashPassword(PASSWORD),
            verificado: true,
        },
    });

    // 2. Organización (se reutiliza si ya existe)
    let relacionOrg = await prisma.organizacionUsuario.findFirst({
        where: { idUsuario: usuario.idUsuario, rol: RolOrganizacion.ORG_OWNER },
    });
    if (!relacionOrg) {
        const organizacion = await prisma.organizacion.create({ data: { nombre: NOMBRE_ORGANIZACION } });
        relacionOrg = await prisma.organizacionUsuario.create({
            data: {
                idOrganizacion: organizacion.idOrganizacion,
                idUsuario: usuario.idUsuario,
                rol: RolOrganizacion.ORG_OWNER,
            },
        });
    }

    // 3. Establecimiento con su configuración y rodeo
    let establecimiento = await prisma.establecimiento.findFirst({
        where: { idOrganizacion: relacionOrg.idOrganizacion, nombre: NOMBRE_ESTABLECIMIENTO },
        include: { configuracions: { include: { rodeos: true } } },
    });

    if (!establecimiento) {
        establecimiento = await prisma.establecimiento.create({
            data: {
                nombre: NOMBRE_ESTABLECIMIENTO,
                localidad: "Adrogué",
                provincia: "Buenos Aires",
                idOrganizacion: relacionOrg.idOrganizacion,
                cuestionarioCompletado: true,
                configuracions: {
                    create: {
                        cantVacas: CANT_VACAS,
                        cantOrdenies: 2,
                        promLitros: 22,
                        precioLitro: 450,
                        empleados: true,
                        cantEmpleados: 3,
                        tipoSeguimiento: TipoSeguimiento.RODEO,
                        rodeos: {
                            create: {
                                tipoRodeo: TipoRodeo.ALTA_PRODUCCION,
                                cantVacas: CANT_VACAS,
                                costoRacion: 5000,
                                razas: {
                                    create: [
                                        { nombre: Razas.HOLANDO_ARGENTINO, cantVacas: 80 },
                                        { nombre: Razas.JERSEY, cantVacas: 40 },
                                    ],
                                },
                            },
                        },
                    },
                },
                establecimientoProductos: { create: { idProducto: producto.idProducto } },
                establecimientoOrganizacionUsuarios: {
                    create: {
                        idOrganizacionUsuario: relacionOrg.idOrganizacionUsuario,
                        rol: RolEstablecimiento.OWNER,
                    },
                },
            },
            include: { configuracions: { include: { rodeos: true } } },
        });
    } else {
        await limpiarHistorial(establecimiento.idEstablecimiento);
    }

    const configuracion = establecimiento.configuracions[0];
    const rodeo = configuracion.rodeos[0];
    const razas = await prisma.raza.findMany({ where: { idRodeo: rodeo.idRodeo } });

    // 4. Historial
    const { lotes, costosGenerales } = generarHistorial({ meses: MESES, cantVacas: CANT_VACAS });

    const creados: { idLote: string; cantidad: number; estado: boolean }[] = [];
    for (const lote of lotes) {
        const creado = await prisma.loteProduccion.create({
            data: {
                numeroLote: lote.numeroLote,
                fechaProduccion: lote.fechaProduccion,
                idProducto: producto.idProducto,
                idEstablecimiento: establecimiento.idEstablecimiento,
                cantidad: lote.cantidad,
                unidad: Unidad.litros,
                destino: lote.destino as TipoDestino,
                tempTanque: lote.tempTanque,
                cantBajadas: lote.cantBajadas,
                cantAnimales: rodeo.cantVacas,
                rodeoIdRodeo: rodeo.idRodeo,
                estado: lote.estado,
                mermas: {
                    create: lote.mermas.map((m) => ({
                        tipo: m.tipo,
                        cantidad: m.cantidad,
                        fechaCreacion: lote.fechaProduccion,
                    })),
                },
                costosDirectos: {
                    create: lote.costosDirectos.map((c) => ({
                        tipoCosto: c.tipoCosto,
                        monto: c.monto,
                        fechaCreacion: lote.fechaProduccion,
                    })),
                },
                produccionRodeos: {
                    create: razas.map((r) => ({
                        idRodeo: rodeo.idRodeo,
                        idRaza: r.idRaza,
                        razaNombre: r.nombre,
                        cantVacas: r.cantVacas,
                    })),
                },
            },
            select: { idLote: true, cantidad: true, estado: true },
        });
        creados.push({ idLote: creado.idLote, cantidad: Number(creado.cantidad), estado: creado.estado });
    }

    await prisma.costoGeneral.createMany({
        data: costosGenerales.map((c) => ({
            idEstablecimiento: establecimiento!.idEstablecimiento,
            tipoCosto: c.tipoCosto,
            descripcion: c.descripcion,
            monto: c.monto,
            fecha: c.fecha,
            creadoEn: c.fecha,
        })),
    });

    await prisma.configuracion.update({
        where: { idConfiguracion: configuracion.idConfiguracion },
        data: { ultimoNumeroLote: lotes.length },
    });

    // 5. Referencia productiva: promedio de los últimos 30 lotes completados
    const completados = creados.filter((l) => l.estado).slice(-30);
    if (completados.length > 0) {
        const promedio = completados.reduce((acc, l) => acc + l.cantidad / rodeo.cantVacas, 0) / completados.length;
        const fechas = lotes.filter((l) => l.estado).slice(-30).map((l) => l.fechaProduccion.getTime());

        const referencia = await prisma.promedioProductivo.create({
            data: {
                idEstablecimiento: establecimiento.idEstablecimiento,
                ambito: AmbitoPromedioProductivo.RODEO_ALTO,
                promedioLitrosPorAnimal: Math.round(promedio * 100) / 100,
                cantidadLotes: completados.length,
                periodoDesde: new Date(Math.min(...fechas)),
                periodoHasta: new Date(Math.max(...fechas)),
            },
        });
        await prisma.promedioProductivoLote.createMany({
            data: completados.map((l) => ({
                idPromedioProductivo: referencia.idPromedioProductivo,
                idLote: l.idLote,
            })),
        });
    }

    console.log("Usuario de prueba listo");
    console.log(`  correo:        ${EMAIL}`);
    console.log(`  contraseña:    ${PASSWORD}`);
    console.log(`  establecimiento: ${NOMBRE_ESTABLECIMIENTO}`);
    console.log(`  lotes:         ${lotes.length} (el último queda pendiente para completarlo desde la app)`);
    console.log(`  costos generales: ${costosGenerales.length}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
