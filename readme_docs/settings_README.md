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

## 1. Actualizar un Animal

**Método:** `PATCH`  
**Ruta:** `/conf/animal`

Actualiza un animal perteneciente al establecimiento autenticado. La implementación actual recibe los datos mediante parámetros de consulta, no mediante JSON en el body.

### Query Parameters

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---:|---|
| `id` | string (UUID) | Sí | ID del animal a actualizar |
| `codigo` | string | Sí | Código del animal. Debe existir `codigo` o `nombre` |
| `nombre` | string | Sí | Nombre del animal. Debe existir `codigo` o `nombre` |
| `Categoria` | enum | Sí | Categoría: `ORDENE` o `SECAS` |
| `estado` | enum | Sí | Estado sanitario: `MASTITIS`, `TRATAMIENTO` o `NORMAL` |
| `observacion` | string | No | Observación del animal |
| `fechaNacimiento` | date | No | Fecha de nacimiento |
| `fechaParto` | date | No | Fecha del último parto |

### Ejemplo de Request

```bash
PATCH "/api/conf/animal?id=550e8400-e29b-41d4-a716-446655440401&codigo=A-001&nombre=Vaca%20Rosa&Categoria=ORDENE&estado=NORMAL&observacion=Animal%20en%20seguimiento&fechaNacimiento=2024-01-15&fechaParto=2026-07-20"
Authorization: Bearer jwt_token_here
x-organizacion-id: 550e8400-e29b-41d4-a716-446655440001
x-establecimiento-id: 550e8400-e29b-41d4-a716-446655440002
```

### Response (200 - OK)

```json
{
  "success": true,
  "message": "Animal actualizado correctamente",
  "data": {
    "idAnimal": "550e8400-e29b-41d4-a716-446655440401",
    "idEstablecimiento": "550e8400-e29b-41d4-a716-446655440002",
    "codigo": "A-001",
    "nombre": "Vaca Rosa",
    "Categoria": "ORDENE",
    "estado": "NORMAL",
    "observacion": "Animal en seguimiento",
    "fechaNacimiento": "2024-01-15T00:00:00.000Z",
    "fechaUltimoParto": "2026-07-20T00:00:00.000Z"
  }
}
```

### Posibles Errores

| Código | Mensaje |
|---|---|
| 400 | Parámetros inválidos |
| 400 | Debe proporcionar al menos un código o un nombre para el animal |
| 400 | El animal no existe |
| 401 | Usuario no autenticado |
| 403 | Establecimiento no autorizado |

---

## 2. Listar Animales

**Método:** `GET`  
**Ruta:** `/conf/animal/listar`

Devuelve únicamente animales activos del establecimiento autenticado. Permite filtrar por código, nombre y estado sanitario. También incluye el `DEL` (días desde el último parto) y la producción registrada durante el día actual.

### Query Parameters

| Parámetro | Tipo | Obligatorio | Default | Descripción |
|---|---|---:|---:|---|
| `codigo` | string | No | - | Coincidencia parcial, sin distinguir mayúsculas y minúsculas |
| `nombre` | string | No | - | Coincidencia parcial, sin distinguir mayúsculas y minúsculas |
| `estado` | enum | No | - | Estado sanitario: `MASTITIS`, `TRATAMIENTO` o `NORMAL` |
| `orden` | `asc \| desc` | No | `asc` | Orden por nombre |
| `page` | integer | No | `1` | Página, mayor que 0 |
| `limit` | integer | No | `10` | Resultados por página, entre 1 y 100 |

### Ejemplo de Request

```bash
GET /api/conf/animal/listar?estado=PREPARTO&page=1&limit=10&orden=asc
Authorization: Bearer jwt_token_here
x-organizacion-id: 550e8400-e29b-41d4-a716-446655440001
x-establecimiento-id: 550e8400-e29b-41d4-a716-446655440002
```

### Response (200 - OK)

```json
{
  "success": true,
  "message": "Animales obtenidos correctamente",
  "data": [
    {
      "idAnimal": "550e8400-e29b-41d4-a716-446655440401",
      "idRodeo": "550e8400-e29b-41d4-a716-446655440010",
      "nombre": "Vaca Rosa",
      "codigo": "A-001",
      "categoria": "ORDENE",
      "estado": "PREPARTO",
      "genero": "HEMBRA",
      "observacion": null,
      "fechaNacimiento": "2024-01-15T00:00:00.000Z",
      "DEL": 42,
      "produccion": {
        "litros_hoy": {
          "VENTA": "24.50"
        },
        "litros_totales": "24.50"
      }
    }
  ]
}
```

### Posibles Errores

| Código | Mensaje |
|---|---|
| 400 | Filtros inválidos o no se pudo determinar el establecimiento |
| 401 | Usuario no autenticado |
| 403 | Establecimiento no autorizado |

---

## 3. Actualizar Establecimiento

**Método:** `PATCH`  
**Ruta:** `/conf/establecimiento`

Actualiza el nombre, la ubicación y los parámetros de ordeñe del establecimiento autenticado.

### Body

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---:|---|
| `idEst` | string (UUID) | Sí | ID del establecimiento a actualizar |
| `nombre` | string | Sí | Nombre, máximo 50 caracteres |
| `tipo_ordenie` | enum | Sí | `balde`, `linea`, `espina_de_pescado`, `rotativo`, `manual` u `otro` |
| `ordenie_dia` | integer | Sí | Cantidad de ordeñes por día, entre 1 y 3 |
| `promLitros` | number | Sí | Promedio de litros, mayor que 0 |
| `ubicacion.provincia` | string | Sí | Provincia, entre 2 y 100 caracteres |
| `ubicacion.localidad` | string | Sí | Localidad, entre 2 y 100 caracteres |

### Ejemplo de Request

```bash
PATCH /api/conf/establecimiento
Authorization: Bearer jwt_token_here
x-organizacion-id: 550e8400-e29b-41d4-a716-446655440001
x-establecimiento-id: 550e8400-e29b-41d4-a716-446655440002
Content-Type: application/json
```

```json
{
  "idEst": "550e8400-e29b-41d4-a716-446655440002",
  "nombre": "Tambo La Esperanza",
  "tipo_ordenie": "linea",
  "ordenie_dia": 2,
  "promLitros": 24.5,
  "ubicacion": {
    "provincia": "Buenos Aires",
    "localidad": "Chivilcoy"
  }
}
```

### Response (200 - OK)

La respuesta contiene el objeto `conf` actualizado y el objeto `establecimiento` actualizado dentro de `data`.

```json
{
  "success": true,
  "message": "Información del establecimiento actualizada correctamente",
  "data": {
    "conf": {
      "idConfiguracion": "550e8400-e29b-41d4-a716-446655440200",
      "tipoOrdenie": "MECANICO",
      "promLitros": "24.50",
      "cantOrdenies": 2
    },
    "establecimiento": {
      "idEstablecimiento": "550e8400-e29b-41d4-a716-446655440002",
      "nombre": "Tambo La Esperanza",
      "provincia": "Buenos Aires",
      "localidad": "Chivilcoy"
    }
  }
}
```

### Posibles Errores

| Código | Mensaje |
|---|---|
| 400 | Datos inválidos o el establecimiento no existe |
| 401 | Usuario no autenticado |
| 403 | Establecimiento no autorizado |

---

## 4. Dar de Alta Animales

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
| `tipo` | enum | Sí | Tipo de movimiento: `INGRESO` |
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

## 5. Dar de Baja Animales

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
| `tipo` | enum | Sí | Tipo de movimiento: `EGRESO` |
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

## 6. Transferir Animales entre Rodeos

**Método:** `POST`  
**Ruta:** `/conf/rodeo/transferir`

Permite transferir animales de un rodeo a otro. Solo está disponible para establecimientos con seguimiento por `RODEO`; el servicio rechaza configuraciones `RODEO_UNICO` e `INDIVIDUAL`.

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
