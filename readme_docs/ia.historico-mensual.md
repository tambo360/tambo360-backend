# Histórico de resúmenes mensuales – Issue #106

## 1. Objetivo

El endpoint permite obtener los resúmenes mensuales anteriores a un resumen determinado, para que el servicio de Inteligencia Artificial desarrollado en Python pueda utilizar información histórica en sus análisis.

La consulta se realiza exclusivamente sobre el mismo establecimiento al que pertenece el resumen solicitado.

## 2. Información del endpoint

| Propiedad | Valor |
|---|---|
| Método | GET |
| Ruta | `/internal/ia/resumenes/:idResumenMensual/historico` |
| Módulo | Inteligencia Artificial |
| Servicio responsable | Node.js / Express |
| Consumidor previsto | Servicio Python |
| Autenticación interna | Pendiente de definición |

## 3. Parámetros

### Parámetro de ruta

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| idResumenMensual | UUID | Sí | Identificador del resumen mensual actual. |

Ejemplo:

`GET /internal/ia/resumenes/550e8400-e29b-41d4-a716-446655440000/historico`

## 4. Funcionamiento

El endpoint realiza las siguientes operaciones:

1. Recibe el identificador del resumen mensual.
2. Valida que el identificador tenga formato UUID.
3. Busca el resumen mensual en la base de datos.
4. Si no existe, devuelve un error 404.
5. Obtiene el identificador del establecimiento y el período del resumen encontrado.
6. Consulta los resúmenes anteriores correspondientes al mismo establecimiento.
7. Excluye el período actual y cualquier período posterior.
8. Ordena los resultados por año y mes de manera descendente.
9. Limita la consulta a seis registros.
10. Incluye los costos correspondientes a cada categoría.
11. Devuelve la información mediante el formato estándar `ApiResponse`.

## 5. Reglas de negocio

- Se devuelven como máximo seis resúmenes anteriores.
- Los resúmenes deben pertenecer al mismo establecimiento.
- No se incluye el resumen solicitado.
- No se incluyen períodos posteriores al resumen actual.
- El orden es del período más reciente al más antiguo.
- Los meses sin registros no generan datos ficticios ni espacios vacíos.
- Si no existen períodos anteriores, se devuelve una lista vacía.
- Los valores Decimal de Prisma se convierten a string para preservar su precisión.

## 6. Estructura de respuesta

La respuesta utiliza el formato estándar del backend:

- `success`: indica si la operación fue exitosa.
- `message`: mensaje descriptivo.
- `statusCode`: código HTTP.
- `data`: contiene el histórico solicitado.

Dentro de `data` se encuentra:

| Campo | Tipo | Descripción |
|---|---|---|
| idResumenMensual | string | Identificador del resumen. |
| anio | number | Año del período. |
| mes | number | Mes del período. |
| fechaDesde | string | Fecha inicial. |
| fechaHasta | string | Fecha final. |
| cantLotes | number | Cantidad de lotes. |
| litrosProduccion | string | Litros producidos. |
| litrosMermas | string | Litros de mermas. |
| litrosTotales | string | Litros totales. |
| litrosLibres | string / null | Litros libres. |
| costosTotales | string | Costos totales. |
| costoPorLitro | string / null | Costo por litro. |
| costoPorCategoria | array | Costos desglosados por categoría. |

Cada elemento de `costoPorCategoria` contiene:

- `idResumenCostoCategoria`
- `categoria`
- `monto`

## 7. Ejemplo de respuesta exitosa

```json
{
  "success": true,
  "message": "Histórico mensual obtenido correctamente",
  "statusCode": 200,
  "data": {
    "historico": [
      {
        "idResumenMensual": "550e8400-e29b-41d4-a716-446655440000",
        "anio": 2026,
        "mes": 10,
        "fechaDesde": "2026-10-01T00:00:00.000Z",
        "fechaHasta": "2026-10-31T23:59:59.000Z",
        "cantLotes": 12,
        "litrosProduccion": "1500.50",
        "litrosMermas": "50.00",
        "litrosTotales": "1550.50",
        "litrosLibres": "1450.50",
        "costosTotales": "250000.00",
        "costoPorLitro": "161.2900",
        "costoPorCategoria": [
          {
            "idResumenCostoCategoria": "650e8400-e29b-41d4-a716-446655440000",
            "categoria": "ALIMENTACION",
            "monto": "50000.00"
          }
        ]
      }
    ]
  }
}
```

Los identificadores y valores del ejemplo son ilustrativos.

## 8. Histórico vacío

Cuando el establecimiento no tiene resúmenes anteriores, el endpoint devuelve HTTP 200:

```json
{
  "success": true,
  "message": "Histórico mensual obtenido correctamente",
  "statusCode": 200,
  "data": {
    "historico": []
  }
}
```

Esto no representa un error.

## 9. Códigos de respuesta

| Código | Descripción |
|---|---|
| 200 | Histórico obtenido correctamente. |
| 400 | Identificador UUID inválido. |
| 404 | El resumen mensual solicitado no existe. |
| 500 | Error interno del servidor. |

## 10. Integración con Python

El servicio Python podrá consumir este endpoint enviando el identificador del resumen mensual que desea analizar.

Node.js se encarga de consultar PostgreSQL mediante Prisma, aplicar las reglas de negocio y devolver los datos históricos.

Python recibe la información y puede utilizarla para realizar comparaciones, análisis de tendencias y otros procesos de Inteligencia Artificial.

La autenticación entre Node.js y Python queda pendiente de acordar e implementar con el equipo. El prefijo `/internal` no constituye por sí mismo un mecanismo de seguridad.

## 11. Archivos involucrados

| Archivo | Responsabilidad |
|---|---|
| `src/module/ia/types/historico-mensual.types.ts` | Define los tipos de respuesta. |
| `src/module/ia/repositories/historico-mensual.repository.ts` | Realiza las consultas a Prisma. |
| `src/module/ia/services/historico-mensual.service.ts` | Implementa las reglas de negocio y transforma los resultados. |
| `src/module/ia/controllers/ia.controller.ts` | Valida la solicitud y construye la respuesta HTTP. |
| `src/module/ia/routes/ia.routes.ts` | Define la ruta del endpoint. |
| `src/routes/internal.ts` | Agrupa las rutas internas. |
| `src/server.ts` | Registra las rutas internas en Express. |
| `src/docs/ia.swagger.ts` | Documentación Swagger del endpoint. |

---

**Issue:** #106 – Histórico de resúmenes mensuales anteriores.