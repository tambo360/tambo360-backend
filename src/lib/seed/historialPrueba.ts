// Generador de datos históricos de prueba (puro: no toca la base de datos).
// Es determinístico: con la misma semilla genera siempre los mismos datos, así
// que dos personas que corran el seed ven los mismos gráficos.

export type TipoMermaSeed =
    | "MASTITIS"
    | "ESTRES_CALORICO"
    | "DERRAME_EN_ORDENE"
    | "FALLA_EQUIPO"
    | "RECHAZO_ANTIBIOTICOS"
    | "MERMA_DESCONOCIDA";

export type TipoCostoDirectoSeed = "ALIMENTACION" | "ENERGIA" | "MANO_OBRA" | "SANIDAD";

export type TipoCostoGeneralSeed =
    | "PERSONAL"
    | "ALIMENTACION"
    | "SERVICIOS"
    | "VETERINARIO"
    | "MANTENIMIENTO"
    | "INMUEBLE"
    | "LOGISTICA";

export type ProductoSeed = "LECHE" | "QUESO";

export interface LoteSeed {
    numeroLote: number;
    producto: ProductoSeed;
    fechaProduccion: Date;
    cantidad: number; // litros (leche) o kilos (queso)
    destino: "TANQUE_FRIO" | "VENTA" | "FABRICA_QUESOS";
    tempTanque: number | null;
    cantBajadas: number;
    estado: boolean; // true = completado
    mermas: { tipo: TipoMermaSeed; cantidad: number }[];
    costosDirectos: { tipoCosto: TipoCostoDirectoSeed; monto: number }[];
}

export interface CostoGeneralSeed {
    tipoCosto: TipoCostoGeneralSeed;
    descripcion: string;
    monto: number;
    fecha: Date;
}

export interface OpcionesHistorial {
    hoy?: Date;
    /** Meses anteriores al actual que se cargan (por defecto 6). */
    meses?: number;
    /** Lotes por mes completo (por defecto 10). */
    lotesPorMes?: number;
    /** Lotes de queso por mes completo (por defecto 0: solo leche; p. ej. 4 para sumar quesos). */
    lotesQuesoPorMes?: number;
    cantVacas?: number;
    semilla?: number;
}

export interface HistorialPrueba {
    lotes: LoteSeed[];
    costosGenerales: CostoGeneralSeed[];
}

// PRNG determinístico (mulberry32)
function crearAleatorio(semilla: number) {
    let a = semilla >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const redondear = (n: number, decimales = 2) => {
    const f = 10 ** decimales;
    return Math.round(n * f) / f;
};

const MERMAS_NORMALES: TipoMermaSeed[] = ["DERRAME_EN_ORDENE", "FALLA_EQUIPO", "MERMA_DESCONOCIDA"];
const MERMAS_ANOMALAS: TipoMermaSeed[] = ["MASTITIS", "ESTRES_CALORICO", "RECHAZO_ANTIBIOTICOS"];

/** Fecha al mediodía en hora local, para que no cambie de día por la zona horaria. */
const fechaMediodia = (anio: number, mes: number, dia: number) => new Date(anio, mes, dia, 12, 0, 0, 0);

export function generarHistorial(opciones: OpcionesHistorial = {}): HistorialPrueba {
    const hoy = opciones.hoy ?? new Date();
    const meses = opciones.meses ?? 6;
    const lotesPorMes = opciones.lotesPorMes ?? 10;
    const lotesQuesoPorMes = opciones.lotesQuesoPorMes ?? 0;
    const cantVacas = opciones.cantVacas ?? 120;
    const aleatorio = crearAleatorio(opciones.semilla ?? 42);

    const fechas: Date[] = [];
    const costosGenerales: CostoGeneralSeed[] = [];

    for (let m = meses; m >= 0; m--) {
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth() - m, 1);
        const anio = inicioMes.getFullYear();
        const mes = inicioMes.getMonth();
        const diasDelMes = new Date(anio, mes + 1, 0).getDate();
        const esMesActual = m === 0;
        const ultimoDia = esMesActual ? hoy.getDate() : diasDelMes;
        // En el mes actual se cargan menos lotes, proporcional a los días transcurridos
        const cantLotes = esMesActual
            ? Math.max(1, Math.round((lotesPorMes * ultimoDia) / diasDelMes))
            : lotesPorMes;

        // Días repartidos de forma pareja a lo largo del mes
        for (let i = 0; i < cantLotes; i++) {
            const dia = Math.min(ultimoDia, Math.max(1, Math.round(((i + 0.5) * ultimoDia) / cantLotes)));
            fechas.push(fechaMediodia(anio, mes, dia));
        }

        // Costos generales del mes (solo si el día ya pasó)
        const base: [TipoCostoGeneralSeed, string, number, number][] = [
            ["PERSONAL", "Sueldos del personal", 1_200_000, 5],
            ["ALIMENTACION", "Compra de alimento balanceado y silo", 3_400_000, 8],
            ["SERVICIOS", "Luz, agua e internet", 260_000, 12],
            ["VETERINARIO", "Honorarios y medicamentos", 180_000, 15],
            ["MANTENIMIENTO", "Mantenimiento de equipos de ordeñe", 150_000, 18],
            ["INMUEBLE", "Alquiler del campo", 300_000, 20],
            ["LOGISTICA", "Fletes de leche", 120_000, 25],
        ];
        for (const [tipoCosto, descripcion, monto, dia] of base) {
            const diaReal = Math.min(dia, diasDelMes);
            const fecha = fechaMediodia(anio, mes, diaReal);
            if (fecha > hoy) continue;
            // Variación de ±10% y suba gradual por inflación (~3% por mes)
            const factor = (0.9 + aleatorio() * 0.2) * (1 + 0.03 * (meses - m));
            costosGenerales.push({ tipoCosto, descripcion, monto: redondear(monto * factor, 0), fecha });
        }
    }

    // Los 3 lotes más recientes se generan como anomalías (merma alta) para probar las alertas.
    // El último de todos queda sin completar.
    const indiceAnomalia = fechas.length - 3;

    const lotesLeche: LoteSeed[] = fechas.map((fecha, i) => {
        const numeroLote = i + 1;
        const esAnomalia = i >= indiceAnomalia;
        // ~22 L por vaca por día, ±8%, con leve suba estacional
        const litrosBase = cantVacas * 22 * (0.92 + aleatorio() * 0.16) * (1 + 0.004 * i);
        const cantidad = redondear(litrosBase, 1);

        const pctMerma = esAnomalia ? 0.08 + aleatorio() * 0.04 : 0.01 + aleatorio() * 0.02;
        const tipoMerma = esAnomalia
            ? MERMAS_ANOMALAS[Math.floor(aleatorio() * MERMAS_ANOMALAS.length)]
            : MERMAS_NORMALES[Math.floor(aleatorio() * MERMAS_NORMALES.length)];
        const mermas = [{ tipo: tipoMerma, cantidad: redondear(cantidad * pctMerma, 1) }];

        const costosDirectos: LoteSeed["costosDirectos"] = [
            { tipoCosto: "ALIMENTACION", monto: redondear(cantidad * (38 + aleatorio() * 6), 0) },
            { tipoCosto: "ENERGIA", monto: redondear(15_000 + aleatorio() * 10_000, 0) },
            { tipoCosto: "MANO_OBRA", monto: redondear(30_000 + aleatorio() * 10_000, 0) },
        ];
        if (aleatorio() < 0.25) {
            costosDirectos.push({ tipoCosto: "SANIDAD", monto: redondear(8_000 + aleatorio() * 12_000, 0) });
        }

        const aTanque = i % 3 !== 0;
        return {
            numeroLote,
            producto: "LECHE",
            // Si el mediodía de hoy todavía no llegó, se usa el momento actual (nunca una fecha futura)
            fechaProduccion: fecha > hoy ? new Date(hoy) : fecha,
            cantidad,
            destino: aTanque ? "TANQUE_FRIO" : "VENTA",
            tempTanque: aTanque ? redondear(3 + aleatorio() * 2, 1) : null,
            cantBajadas: 2,
            // El último lote queda pendiente (estado false) para poder completarlo desde la app
            estado: i !== fechas.length - 1,
            mermas,
            costosDirectos,
        };
    });

    // Lotes de queso: usan su propio generador aleatorio para no alterar los datos de leche.
    const aleatorioQueso = crearAleatorio((opciones.semilla ?? 42) + 1000);
    const lotesQueso: LoteSeed[] = [];

    for (let m = meses; m >= 0 && lotesQuesoPorMes > 0; m--) {
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth() - m, 1);
        const anio = inicioMes.getFullYear();
        const mes = inicioMes.getMonth();
        const diasDelMes = new Date(anio, mes + 1, 0).getDate();
        const esMesActual = m === 0;
        const ultimoDia = esMesActual ? hoy.getDate() : diasDelMes;
        const cantLotes = esMesActual
            ? Math.round((lotesQuesoPorMes * ultimoDia) / diasDelMes)
            : lotesQuesoPorMes;

        for (let i = 0; i < cantLotes; i++) {
            const dia = Math.min(ultimoDia, Math.max(1, Math.round(((i + 0.5) * ultimoDia) / cantLotes)));
            const fecha = fechaMediodia(anio, mes, dia);
            // ~300 kg por lote (≈ 10 litros de leche por kilo de queso), ±15%, con leve suba
            const cantidad = redondear(300 * (0.85 + aleatorioQueso() * 0.3) * (1 + 0.004 * lotesQueso.length), 1);
            const pctMerma = 0.01 + aleatorioQueso() * 0.02;

            lotesQueso.push({
                numeroLote: 0, // se asigna al ordenar junto con los de leche
                producto: "QUESO",
                fechaProduccion: fecha > hoy ? new Date(hoy) : fecha,
                cantidad,
                destino: "FABRICA_QUESOS",
                tempTanque: null,
                cantBajadas: 1,
                estado: true,
                mermas: [
                    {
                        tipo: MERMAS_NORMALES[Math.floor(aleatorioQueso() * MERMAS_NORMALES.length)],
                        cantidad: redondear(cantidad * pctMerma, 1),
                    },
                ],
                costosDirectos: [
                    { tipoCosto: "ENERGIA", monto: redondear(20_000 + aleatorioQueso() * 15_000, 0) },
                    { tipoCosto: "MANO_OBRA", monto: redondear(40_000 + aleatorioQueso() * 20_000, 0) },
                ],
            });
        }
    }

    // Se ordenan por fecha (si coinciden, el queso va antes, así el último lote sigue siendo el de leche pendiente)
    // y se numeran en forma consecutiva.
    const lotes = [...lotesLeche, ...lotesQueso]
        .sort(
            (a, b) =>
                a.fechaProduccion.getTime() - b.fechaProduccion.getTime() ||
                (a.producto === b.producto ? a.numeroLote - b.numeroLote : a.producto === "QUESO" ? -1 : 1),
        )
        .map((lote, i) => ({ ...lote, numeroLote: i + 1 }));

    return { lotes, costosGenerales };
}
