# Configuración - API Tambo360

Esta sección documenta los endpoints de configuración del backend, orientados a operaciones administrativas sobre movimientos de animales (altas, bajas y transferencias) dentro del establecimiento autenticado.

## Base

- Prefijo: `/conf`
- Requiere autenticación JWT y contexto de organización/establecimiento
- Los endpoints están protegidos por los middlewares de autenticación y contexto multi-tenant

## Headers Requeridos

| Header | Tipo | Descripción |
|--------|------|-------------|
| `Authorization` | string | Token JWT de autenticación |
| `x-organizacion-id` | string (UUID) | ID de la organización |
| `x-establecimiento-id` | string (UUID) | ID del establecimiento |

---

## 1. Dar de Alta Animales

**Método:** `POST`  
**Ruta:** `/conf/animal`

Permite registrar la incorporación de animales al establecimiento. Soporta dos modos según el tipo de seguimiento configurado:
- `RODEO` o `RODEO_UNICO`: incrementa la cantidad en un rodeo específico
- `INDIVIDUAL`: crea nuevos registros de animales en el sistema

### Request Body

#### Campos comunes

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `tipoSeguimiento` | enum | Sí | Tipo de seguimiento: `RODEO`, `RODEO_UNICO` o `INDIVIDUAL` |
| `motivo` | enum | Sí | Motivo del ingreso: `INGRESO_COMPRA` o `INGRESO_NACIMIENTO` |
| `cantidad` | integer | Sí | Cantidad de animales a ingresar (debe ser > 0) |
| `observacion` | string | No | Observación opcional de hasta 255 caracteres |

#### Campos adicionales si `tipoSeguimiento = RODEO` o `RODEO_UNICO`

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `rodeoDestino` | string (UUID) | Sí | ID del rodeo destino |

#### Campos adicionales si `tipoSeguimiento = INDIVIDUAL`

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `animales` | array | Sí | Array de animales a crear (min 1 elemento) |
| `animales[].codigo` | string | No | Código identificador del animal |
| `animales[].nombre` | string | No | Nombre del animal |
| `animales[].categoria` | enum | Sí | Categoría: `ORDENE`, `SECAS` o `PREPARTO` |
| `animales[].estado` | enum | Sí | Estado: `MATITIS`, `TRATAMIENTO`, `PREPARTO` o `DESCARTE` |
| `animales[].fechaNacimiento` | string (ISO) | No | Fecha de nacimiento en formato ISO 8601 |

### Ejemplo de Request (RODEO)

```bash
POST /api/conf/animal
Authorization: Bearer jwt_token_here
x-organizacion-id: 550e8400-e29b-41d4-a716-446655440001
x-establecimiento-id: 550e8400-e29b-41d4-a716-446655440002
Content-Type: application/json
```

```json
{
  "tipoSeguimiento": "RODEO",
  "rodeoDestino": "550e8400-e29b-41d4-a716-446655440010",
  "motivo": "INGRESO_COMPRA",
  "cantidad": 5,
  "observacion": "Compra de vacas de lechería"
}
```

### Ejemplo de Request (INDIVIDUAL)

```json
{
  "tipoSeguimiento": "INDIVIDUAL",
  "motivo": "INGRESO_NACIMIENTO",
  "cantidad": 2,
  "animales": [
    {
      "codigo": "A-001",
      "nombre": "Vaca Rosa",
      "categoria": "ORDENE",
      "estado": "PREPARTO",
      "fechaNacimiento": "2024-01-15T00:00:00.000Z"
    },
    {
      "codigo": "A-002",
      "nombre": "Vaca Negra",
      "categoria": "ORDENE",
      "estado": "MATITIS"
    }
  ],
  "observacion": "Nacimientos en el rodeo"
}
```

### Response (200 - OK)

```json
{
  "success": true,
  "message": "Alta de animales realizada correctamente",
  "data": {
    "idMovimiento": "550e8400-e29b-41d4-a716-446655440100",
    "idConfiguracion": "550e8400-e29b-41d4-a716-446655440200",
    "tipo": "INGRESO",
    "motivo": "INGRESO_COMPRA",
    "cantidad": 5,
    "usuarioId": "550e8400-e29b-41d4-a716-446655440300",
    "observacion": "Compra de vacas de lechería",
    "fechaCreacion": "2026-08-17T12:00:00.000Z",
    "rodeoDestino": "550e8400-e29b-41d4-a716-446655440010"
  }
}
```

### Response (200 - OK) para INDIVIDUAL

```json
{
  "success": true,
  "message": "Alta de animales realizada correctamente",
  "data": {
    "idMovimiento": "550e8400-e29b-41d4-a716-446655440100",
    "idConfiguracion": "550e8400-e29b-41d4-a716-446655440200",
    "tipo": "INGRESO",
    "motivo": "INGRESO_NACIMIENTO",
    "cantidad": 2,
    "usuarioId": "550e8400-e29b-41d4-a716-446655440300",
    "observacion": "Nacimientos en el rodeo",
    "fechaCreacion": "2026-08-17T12:00:00.000Z",
    "animales": [
      {
        "idAnimal": "550e8400-e29b-41d4-a716-446655440401",
        "codigo": "A-001",
        "nombre": "Vaca Rosa",
        "categoria": "ORDENE",
        "estado": "PREPARTO",
        "fechaNacimiento": "2024-01-15T00:00:00.000Z"
      },
      {
        "idAnimal": "550e8400-e29b-41d4-a716-446655440402",
        "codigo": "A-002",
        "nombre": "Vaca Negra",
        "categoria": "ORDENE",
        "estado": "MATITIS"
      }
    ]
  }
}
```

### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Datos de ingreso inválidos |
| 400 | La cantidad de animales ingresada no coincide |
| 400 | No se puede superar el límite de animales para el establecimiento |
| 400 | Rodeo de destino no encontrado |
| 401 | Usuario no autenticado |
| 403 | Establecimiento no autorizado |
| 404 | Configuración no encontrada |

---

## 2. Dar de Baja Animales

**Método:** `DELETE`  
**Ruta:** `/conf/animal`

Permite registrar la salida de animales del establecimiento. Soporta dos modos según el tipo de seguimiento configurado:
- `RODEO` o `RODEO_UNICO`: decrementa la cantidad en un rodeo específico
- `INDIVIDUAL`: marca animales como inactivos

### Request Body

#### Campos comunes

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `tipoSeguimiento` | enum | Sí | Tipo de seguimiento: `RODEO`, `RODEO_UNICO` o `INDIVIDUAL` |
| `motivo` | enum | Sí | Motivo de egreso: `EGRESO_VENTA`, `EGRESO_DESCARTE` o `EGRESO_MUERTE` |
| `cantidad` | integer | Sí | Cantidad de animales a dar de baja (debe ser > 0) |
| `observacion` | string | No | Observación opcional de hasta 255 caracteres |

#### Campos adicionales si `tipoSeguimiento = RODEO` o `RODEO_UNICO`

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `rodeoOrigen` | string (UUID) | Sí | ID del rodeo origen |

#### Campos adicionales si `tipoSeguimiento = INDIVIDUAL`

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `animales` | array | Sí | Array de IDs de animales a dar de baja (min 1 elemento) |

### Ejemplo de Request (RODEO)

```bash
DELETE /api/conf/animal
Authorization: Bearer jwt_token_here
x-organizacion-id: 550e8400-e29b-41d4-a716-446655440001
x-establecimiento-id: 550e8400-e29b-41d4-a716-446655440002
Content-Type: application/json
```

```json
{
  "tipoSeguimiento": "RODEO",
  "rodeoOrigen": "550e8400-e29b-41d4-a716-446655440010",
  "motivo": "EGRESO_VENTA",
  "cantidad": 2,
  "observacion": "Venta a feria de ganado"
}
```

### Ejemplo de Request (INDIVIDUAL)

```json
{
  "tipoSeguimiento": "INDIVIDUAL",
  "motivo": "EGRESO_DESCARTE",
  "cantidad": 1,
  "animales": ["550e8400-e29b-41d4-a716-446655440401"],
  "observacion": "Descarte por edad"
}
```

### Response (200 - OK)

```json
{
  "success": true,
  "message": "Baja de animales realizada correctamente",
  "data": {
    "idMovimiento": "550e8400-e29b-41d4-a716-446655440110",
    "idConfiguracion": "550e8400-e29b-41d4-a716-446655440200",
    "tipo": "EGRESO",
    "motivo": "EGRESO_VENTA",
    "cantidad": 2,
    "usuarioId": "550e8400-e29b-41d4-a716-446655440300",
    "observacion": "Venta a feria de ganado",
    "fechaCreacion": "2026-08-17T12:00:00.000Z",
    "rodeoOrigen": "550e8400-e29b-41d4-a716-446655440010"
  }
}
```

### Response (200 - OK) para INDIVIDUAL

```json
{
  "success": true,
  "message": "Baja de animales realizada correctamente",
  "data": {
    "idMovimiento": "550e8400-e29b-41d4-a716-446655440110",
    "idConfiguracion": "550e8400-e29b-41d4-a716-446655440200",
    "tipo": "EGRESO",
    "motivo": "EGRESO_DESCARTE",
    "cantidad": 1,
    "usuarioId": "550e8400-e29b-41d4-a716-446655440300",
    "observacion": "Descarte por edad",
    "fechaCreacion": "2026-08-17T12:00:00.000Z",
    "animales": [
      {
        "idAnimal": "550e8400-e29b-41d4-a716-446655440401",
        "codigo": "A-001",
        "nombre": "Vaca Rosa",
        "categoria": "ORDENE",
        "estado": "PREPARTO",
        "fechaNacimiento": "2024-01-15T00:00:00.000Z"
      }
    ]
  }
}
```

### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Datos de egreso inválidos |
| 400 | La cantidad de animales ingresada no coincide |
| 400 | Cantidad a dar de baja mayor a la cantidad disponible |
| 400 | Rodeo de origen no encontrado |
| 401 | Usuario no autenticado |
| 403 | Establecimiento no autorizado |
| 404 | Configuración no encontrada o animales no encontrados |

---

## 3. Transferir Animales entre Rodeos

**Método:** `POST`  
**Ruta:** `/conf/rodeo/transferir`

Permite transferir animales de un rodeo a otro. Solo disponible para establecimientos con seguimiento por `RODEO` o `RODEO_UNICO`.

### Request Body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `rodeoOrigen` | string (UUID) | Sí | ID del rodeo origen |
| `rodeoDestino` | string (UUID) | Sí | ID del rodeo destino (debe ser diferente al origen) |
| `motivo` | enum | Sí | Motivo de la transferencia. Valores permitidos: `TRANSFERENCIA_BAJA_PRODUCCION`, `TRANSFERENCIA_ALTA_PRODUCCION`, `TRANSFERENCIA_SECADO`, `TRANSFERENCIA_CAMBIO_ESTADO`, `TRANSFERENCIA_OTRO` |
| `cantidad` | integer | Sí | Cantidad de animales a transferir (debe ser > 0) |
| `observacion` | string | No | Observación opcional de hasta 255 caracteres |

### Ejemplo de Request

```bash
POST /api/conf/rodeo/transferir
Authorization: Bearer jwt_token_here
x-organizacion-id: 550e8400-e29b-41d4-a716-446655440001
x-establecimiento-id: 550e8400-e29b-41d4-a716-446655440002
Content-Type: application/json
```

```json
{
  "rodeoOrigen": "550e8400-e29b-41d4-a716-446655440010",
  "rodeoDestino": "550e8400-e29b-41d4-a716-446655440011",
  "motivo": "TRANSFERENCIA_BAJA_PRODUCCION",
  "cantidad": 3,
  "observacion": "Transferencia por baja producción"
}
```

### Response (200 - OK)

```json
{
  "success": true,
  "message": "Transferencia de rodeo realizada correctamente",
  "data": {
    "idMovimiento": "550e8400-e29b-41d4-a716-446655440120",
    "idConfiguracion": "550e8400-e29b-41d4-a716-446655440200",
    "tipo": "TRANSFERENCIA",
    "motivo": "TRANSFERENCIA_BAJA_PRODUCCION",
    "rodeoOrigen": "550e8400-e29b-41d4-a716-446655440010",
    "rodeoDestino": "550e8400-e29b-41d4-a716-446655440011",
    "cantidad": 3,
    "usuarioId": "550e8400-e29b-41d4-a716-446655440300",
    "observacion": "Transferencia por baja producción",
    "fechaCreacion": "2026-08-17T12:00:00.000Z"
  }
}
```

### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Datos de transferencia inválidos |
| 400 | El rodeo de origen y destino no pueden ser el mismo |
| 400 | Cantidad a transferir mayor a la cantidad disponible en el rodeo de origen |
| 400 | El establecimiento no tiene habilitado el seguimiento por rodeo |
| 401 | Usuario no autenticado |
| 403 | Establecimiento no autorizado |
| 404 | Rodeo de origen, rodeo de destino o configuración no encontrados |

---

## Motivos Válidos

### Ingreso
- `INGRESO_COMPRA` - Compra de animales
- `INGRESO_NACIMIENTO` - Nacimiento de terneros

### Egreso
- `EGRESO_VENTA` - Venta de animales
- `EGRESO_DESCARTE` - Descarte de animales
- `EGRESO_MUERTE` - Muerte de animales

### Transferencia
- `TRANSFERENCIA_BAJA_PRODUCCION` - Transferencia a rodeo de baja producción
- `TRANSFERENCIA_ALTA_PRODUCCION` - Transferencia a rodeo de alta producción
- `TRANSFERENCIA_SECADO` - Transferencia a rodeo de secado
- `TRANSFERENCIA_CAMBIO_ESTADO` - Transferencia por cambio de estado
- `TRANSFERENCIA_OTRO` - Otra razón de transferencia
