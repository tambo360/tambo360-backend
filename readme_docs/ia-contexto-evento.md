# Endpoint interno: contexto productivo de un evento de IA

## 1. Objetivo

El endpoint permite que el servicio de Python obtenga el contexto productivo asociado a un evento de IA registrado en Tambo360.

La información se obtiene desde el backend Node.js mediante Prisma. Python no accede directamente a la base de datos.

## 2. Endpoint

`GET /internal/ia/eventos/:idEvento/contexto`

### Parámetros

| Parámetro | Ubicación | Descripción |
|---|---|---|
| `idEvento` | Path | Identificador UUID del evento de IA. |
| `x-establecimiento-id` | Header | Identificador UUID del establecimiento. |

### Validaciones

- El identificador del evento debe ser un UUID válido.
- El identificador del establecimiento debe ser un UUID válido.
- El evento debe existir y pertenecer al establecimiento indicado.
- Debe existir una configuración asociada al establecimiento.

## 3. Información devuelta

La respuesta contiene tres elementos principales:

- `evento`: datos generales del evento y tipo de seguimiento.
- `movimientos`: movimientos de animales asociados al período del análisis.
- `historialProduccion`: historial productivo de los animales cuando el seguimiento es individual.

### 3.1. Seguimiento individual

Cuando el establecimiento utiliza seguimiento `INDIVIDUAL`:

- Se devuelven los movimientos correspondientes al período del análisis.
- Cada movimiento incluye los datos de los animales asociados.
- Se recuperan hasta 30 producciones históricas por animal.
- Se excluye el lote actual del historial para evitar duplicar la producción que Python ya recibe por otro medio.
- El historial se agrupa por identificador de animal.

### 3.2. Seguimiento por rodeos

Cuando el seguimiento no es individual, los movimientos se agrupan en:

- `ingresos`
- `egresos`
- `transferencias`

El historial individual de producción no se devuelve para estos tipos de seguimiento.

## 4. Determinación del período del análisis

Para limitar los movimientos al período correspondiente, el backend obtiene las fechas desde las entidades productivas existentes.

### Eventos de cierre de lote (`LOT_CLOSED`)

El período se obtiene desde `PromedioProductivo`, utilizando el ámbito correspondiente al seguimiento y al tipo de rodeo:

| Seguimiento | Tipo de rodeo | Ámbito de PromedioProductivo |
|---|---|---|
| `INDIVIDUAL` | No aplica | `INDIVIDUAL` |
| `RODEO` | `ALTA_PRODUCCION` | `RODEO_ALTO` |
| `RODEO` | `BAJA_PRODUCCION` | `RODEO_BAJO` |
| `RODEO_UNICO` | `UNICO_ORDENIE` o `UNICO_SECA` | `RODEO_UNICO` |

Si no se puede determinar un ámbito o no existe un período válido, no se consultan movimientos sin límite temporal.

### Eventos de cierre mensual (`MONTH_CLOSED`)

El período se obtiene desde el `ResumenMensual` asociado al evento, utilizando sus fechas `fechaDesde` y `fechaHasta`.

## 5. Limitación de la solución actual

Actualmente, las fechas del período no se guardan como una copia dentro de `AiAnalysisEvent`.

En su lugar, el backend consulta dinámicamente las entidades `PromedioProductivo` o `ResumenMensual` cuando Python solicita el contexto.

Esto implica que el período recuperado podría cambiar si se actualizan los datos de origen.

**Ejemplo:**

1. El 10 de noviembre se genera un evento de IA correspondiente al período del 1 al 31 de octubre.
2. Posteriormente, el 15 de noviembre se actualiza el promedio productivo y su período pasa a ser del 15 de octubre al 14 de noviembre.
3. Si se vuelve a consultar el evento generado el 10 de noviembre, el backend podría recuperar el período actualizado en lugar del período original.

Por lo tanto, el período utilizado en una consulta posterior podría no coincidir con el que se utilizó al momento de crear el evento.

### Mejora propuesta para el futuro

Como mejora de arquitectura, se propone evaluar la incorporación de los campos `periodoDesde` y `periodoHasta` en `AiAnalysisEvent`.

De esta manera, al crear el evento se guardaría una copia del período utilizado en el análisis.

Esto permitiría:

- Mantener el período original del evento.
- Evitar que las actualizaciones posteriores de los promedios modifiquen el contexto de eventos anteriores.
- Garantizar mayor consistencia en reintentos y consultas históricas.

Esta mejora queda como propuesta para evaluar con el equipo y no forma parte de la implementación actual de la issue.

## 6. Comportamiento cuando no existe un período válido

Si el backend no puede obtener un período válido:

- `movimientos` se devuelve vacío, respetando la estructura correspondiente al tipo de seguimiento.
- No se consultan movimientos históricos sin límite de fechas.
- No se genera un error únicamente por la ausencia de movimientos o de un período disponible.

Esta decisión evita incorporar información productiva que no corresponda al análisis solicitado.

## 7. Orden y límites de los datos

- Los movimientos se ordenan por fecha de creación descendente.
- El historial de producción individual se ordena por fecha de producción descendente.
- Se recuperan como máximo 30 producciones históricas por animal.
- El lote actual se excluye del historial.

## 8. Consideraciones de seguridad

La ruta pertenece al conjunto de endpoints internos del módulo de IA.

La autenticación interna entre Node.js y Python todavía está pendiente de definición e implementación. Por lo tanto, no debe considerarse que este endpoint ya cuenta con protección mediante autenticación interna.

La comunicación entre ambos servicios deberá incorporar un mecanismo de autenticación antes de exponer esta ruta en un entorno público.

## 9. Alcance de la implementación

La implementación actual contempla:

- Validación del evento y del establecimiento.
- Obtención del tipo de seguimiento.
- Determinación del período desde las entidades existentes.
- Consulta de movimientos dentro del período.
- Agrupación de movimientos por rodeo cuando corresponde.
- Recuperación de hasta 30 producciones históricas por animal en seguimiento individual.
- Respuesta sin error cuando no existen movimientos o historial.

No contempla:

- Incorporar fechas del período en `AiAnalysisEvent`.
- Crear migraciones de base de datos.
- Modificar la generación de promedios productivos.
- Implementar la autenticación interna Node.js-Python.

Estas cuestiones quedan fuera del alcance actual y podrán evaluarse con el equipo.