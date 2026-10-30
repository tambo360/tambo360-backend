
import { z } from "zod";
import { TipoEventoIA, TipoAlertaIA, NivelAlerta, TipoMerma, CategoriaCostoResumen, AmbitoPromedioProductivo, TipoSeguimiento, } from "@prisma/client";

// Decimal enviado como string.
// Se valida que pueda interpretarse como un número finito.
export const decimalSchema = z.string().refine(
  (value) => value.trim() !== "" && Number.isFinite(Number(value)),
  "Debe ser un decimal válido"
);

// Fecha ISO 8601 con zona horaria.
const fechaSchema = z.string().datetime({ offset: true });


//------------------------ PARA LOTE EVENT------------------------------------------------------------------------
const produccionAnimalSchema = z.object({
  idAnimal: z.string().min(1),
  litros: decimalSchema,
});

const promedioProductivoLoteSchema = z.object({
  idLote: z.string().min(1),
  cantLitros: decimalSchema,
  cantAnimales: z.number().int().nonnegative(),
  creadoEn: fechaSchema,
  mermas: z.array(
    z.object({
      tipo: z.nativeEnum(TipoMerma),
      cantidad: decimalSchema,
    })
  ),
});

const promedioProductivoSchema = z.object({
  idPromedioProductivo: z.string().min(1),
  ambito: z.nativeEnum(AmbitoPromedioProductivo),
  promedioLitrosPorAnimal: decimalSchema,
  cantLotes: z.number().int().nonnegative(),
  periodoDesde: fechaSchema.nullable(),
  periodoHasta: fechaSchema.nullable(),
  lotes: z.array(promedioProductivoLoteSchema),
});

const dataForLotEventSchema = z.object({
  lote: z.object({
    idLote: z.string().min(1),
    cantidad: decimalSchema,
    cantAnimales: z.number().int().nonnegative(),
    fechaProduccion: fechaSchema,
    listaAnimales: z.array(produccionAnimalSchema).nullable(),
  }),
  contexto: z.object({
    tipoSeguimiento: z.nativeEnum(TipoSeguimiento),
    promedioProductivo: promedioProductivoSchema,
  }),
});

//-------------------------------------------------------------------------------------


// --------------------------- PARA MONTH EVENT---------------------------------------------
const costoPorCategoriaSchema = z.object({
  idResumenCostoCategoria: z.string().min(1),
  categoria: z.nativeEnum(CategoriaCostoResumen),
  monto: decimalSchema,
});

const dataForMonthEventSchema = z.object({
  idResumenMensual: z.string().min(1),
  anio: z.number().int(),
  mes: z.number().int().min(1).max(12),
  fechaDesde: fechaSchema,
  fechaHasta: fechaSchema,
  cantLotes: z.number().int().nonnegative(),
  litrosProduccion: decimalSchema,
  litrosMermas: decimalSchema,
  litrosTotales: decimalSchema,
  litrosLibres: decimalSchema.nullable(),
  costosTotales: decimalSchema,
  costoPorLitro: decimalSchema.nullable(),
  costoPorCategoria: z.array(costoPorCategoriaSchema),
});

//--------------------------------------------------------------------------------------

export const analisisIARequestSchema = z.discriminatedUnion("tipo", [
  z.object({
    idEventoIA: z.string().min(1),
    tipo: z.literal(TipoEventoIA.LOT_CLOSED),
    idEstablecimiento: z.string().min(1),
    datos: dataForLotEventSchema,
  }),
  z.object({
    idEventoIA: z.string().min(1),
    tipo: z.literal(TipoEventoIA.MONTH_CLOSED),
    idEstablecimiento: z.string().min(1),
    datos: dataForMonthEventSchema,
  }),
]);

export const alertaIAResponseSchema = z.object({
  tipo: z.nativeEnum(TipoAlertaIA),
  nivel: z.nativeEnum(NivelAlerta),
  titulo: z.string().min(1),
  descripcion: z.string().min(1),
  recomendacion: z.string().nullable().optional(),
  datosContexto: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const analisisIAResponseSchema = z.discriminatedUnion("resultado", [
  z.object({
    idEventoIA: z.string().min(1),
    resultado: z.literal("COMPLETED"),
    alerta: alertaIAResponseSchema.nullable(),
  }),
  z.object({
    idEventoIA: z.string().min(1),
    resultado: z.literal("INSUFFICIENT_HISTORY"),
    alerta: z.null(),
  }),
]);

export const errorIAResponseSchema = z.object({
  error: z.object({
    codigo: z.string().min(1),
    mensaje: z.string().min(1),
    reintentable: z.boolean(),
    detalles: z.array(
      z.object({
        campo: z.string(),
        mensaje: z.string(),
      })
    ).optional(),
  }),
});
