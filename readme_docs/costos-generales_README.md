# Costos Generales - API Tambo360

Documentación de los endpoints montados bajo `/api/costos-generales`.

## Autenticación y permisos

Todos los endpoints requieren JWT y los headers `x-organizacion-id` y `x-establecimiento-id`.

- `GET /`: cualquier rol con acceso al establecimiento.
- `POST /`, `GET /resumen`, `PATCH /:id` y `DELETE /:id`: solo `OWNER` o `ADMIN`.

## Tipos de costo

`PERSONAL`, `SERVICIOS`, `LOGISTICA`, `MANTENIMIENTO`, `VETERINARIO`, `INMUEBLE`, `OTRO`.

## 1. Registrar un costo general

**Método:** `POST`  
**Ruta:** `/api/costos-generales/`

### Body

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---:|---|
| `tipoCosto` | enum | Sí | Tipo de costo general |
| `descripcion` | string | No | Máximo 500 caracteres |
| `monto` | number | Sí | Debe ser mayor que 0 |
| `fecha` | date | Sí | Fecha válida; se acepta formato ISO 8601 |

### Request

```json
{
  "tipoCosto": "PERSONAL",
  "descripcion": "Sueldos del personal del establecimiento",
  "monto": 125000.50,
  "fecha": "2026-08-31T00:00:00.000Z"
}
```

### Response `201`

Devuelve el registro persistido, incluyendo `idCostoGeneral`, `idEstablecimiento`, `tipoCosto`, `descripcion`, `monto`, `fecha` y `creadoEn`.

```json
{
  "success": true,
  "message": "Costo general registrado correctamente",
  "data": {
    "idCostoGeneral": "550e8400-e29b-41d4-a716-446655440100",
    "idEstablecimiento": "550e8400-e29b-41d4-a716-446655440002",
    "tipoCosto": "PERSONAL",
    "descripcion": "Sueldos del personal del establecimiento",
    "monto": "125000.50",
    "fecha": "2026-08-31T00:00:00.000Z",
    "creadoEn": "2026-08-31T12:00:00.000Z"
  }
}
```

## 2. Listar costos de un período

**Método:** `GET`  
**Ruta:** `/api/costos-generales/`

Requiere obligatoriamente un período. Devuelve los costos manuales registrados y agrega un costo virtual de alimentación calculado con la cantidad de vacas, costo de ración y cantidad de días del período.

### Query Parameters

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---:|---|
| `fechaDesde` | date | Sí | Inicio del período |
| `fechaHasta` | date | Sí | Fin del período |

`fechaDesde` no puede ser posterior a `fechaHasta`. El listado se ordena por `fecha` descendente.

### Request

```text
GET /api/costos-generales/?fechaDesde=2026-08-01T00:00:00.000Z&fechaHasta=2026-08-31T23:59:59.999Z
```

### Respuesta

La respuesta contiene registros manuales y un registro automático con esta forma:

```json
{
  "idCostoGeneral": "alimentacion",
  "tipoCosto": "ALIMENTACION",
  "descripcion": "Costo de alimentación (calculado automáticamente)",
  "monto": 250000,
  "fecha": "2026-08-31T23:59:59.999Z",
  "automatico": true,
  "soloLectura": true
}
```

El registro automático no está almacenado en la base de datos y no puede editarse ni eliminarse.

## 3. Obtener resumen económico

**Método:** `GET`  
**Ruta:** `/api/costos-generales/resumen`

Requiere rol `OWNER` o `ADMIN`. Calcula los indicadores del período sin crear registros persistentes.

### Query Parameters

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---:|---|
| `fechaDesde` | date | Sí | Inicio del período |
| `fechaHasta` | date | Sí | Fin del período |

### Response `200`

```json
{
  "success": true,
  "message": "Resumen económico obtenido correctamente",
  "data": {
    "periodo": {
      "fechaDesde": "2026-08-01T00:00:00.000Z",
      "fechaHasta": "2026-08-31T23:59:59.999Z"
    },
    "gastoAlimentacion": 250000,
    "gastoCostosGenerales": 125000.5,
    "gastoTotal": 375000.5,
    "lotesCompletos": 8,
    "prorrateoPromedio": 46875.0625
  }
}
```

- `gastoAlimentacion`: costo calculado automáticamente.
- `gastoCostosGenerales`: suma de costos manuales del período.
- `gastoTotal`: suma de ambos gastos.
- `lotesCompletos`: lotes con estado completo dentro del período.
- `prorrateoPromedio`: `gastoTotal / lotesCompletos`; es `0` si no hay lotes completos.

## 4. Actualizar un costo general

**Método:** `PATCH`  
**Ruta:** `/api/costos-generales/:id`

Requiere rol `OWNER` o `ADMIN`. `:id` es el `idCostoGeneral` del registro persistido.

### Body

Todos los campos son opcionales, pero debe enviarse un JSON válido si se desea modificar datos.

| Campo | Tipo | Descripción |
|---|---|---|
| `tipoCosto` | enum | Tipo de costo general |
| `descripcion` | string | Máximo 500 caracteres |
| `monto` | number | Debe ser mayor que 0 |
| `fecha` | date | Fecha válida |

```json
{
  "tipoCosto": "MANTENIMIENTO",
  "descripcion": "Reparación del equipo de ordeñe",
  "monto": 85000,
  "fecha": "2026-08-30T00:00:00.000Z"
}
```

### Response `200`

Devuelve el costo general actualizado con el mensaje `Costo general actualizado correctamente`.

## 5. Eliminar un costo general

**Método:** `DELETE`  
**Ruta:** `/api/costos-generales/:id`

Requiere rol `OWNER` o `ADMIN`. Solo permite eliminar costos persistidos pertenecientes al establecimiento actual.

### Response `200`

```json
{
  "success": true,
  "message": "Costo general eliminado correctamente",
  "data": null
}
```

## Errores comunes

| Código | Situación |
|---|---|
| `400` | Datos inválidos, fechas faltantes, período inválido o establecimiento no determinado |
| `401` | Usuario no autenticado |
| `403` | Rol insuficiente, establecimiento no autorizado o costo de otro establecimiento |
| `404` | Establecimiento o costo general no encontrado |
