# Documentación de Endpoints - Lotes

## Descripción
Esta API permite gestionar lotes de producción dentro de un establecimiento. Requiere autenticación y acceso a un establecimiento válido.

## Autenticación y Autorización
- Todos los endpoints requieren token de autenticación (`authenticate`)
- Requieren contexto de organización (`orgContext`)
- Requieren acceso a la organización (`requireOrgAccess`)
- Requieren contexto de establecimiento (`estContext`)
- Requieren acceso al establecimiento (`establecimientoRequireOrgAccess`)

## Headers Requeridos

| Header | Tipo | Descripción |
|--------|------|-------------|
| `Authorization` | string | Token JWT de autenticación |
| `x-organizacion-id` | string (UUID) | ID de la organización |
| `x-establecimiento-id` | string (UUID) | ID del establecimiento |

---

## Endpoints

### 1. Crear Lote

**Método:** `POST`  
**Ruta:** `/lote`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`

El body del request acepta dos variantes según el tipo de seguimiento configurado en el establecimiento:

- `tipoSeguimiento: "RODEO"` para lotes asociados a un rodeo existente.
- `tipoSeguimiento: "INDIVIDUAL"` para lotes creados a partir de animales individuales.

#### Request Body

Campos comunes a ambas variantes:

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `tipoSeguimiento` | enum | Sí | `RODEO` o `INDIVIDUAL` |
| `idLote` | string (UUID) | Sí | ID único del lote |
| `tempTanque` | number | Sí | Temperatura del tanque, debe ser mayor a 0 |
| `destino` | enum | Sí | `TANQUE_FRIO`, `VENTA` o `FABRICA_QUESOS` |
| `idProducto` | string (UUID) | Sí | ID del producto a producir |
| `cantidad` | number | Sí | Cantidad de producción, debe ser mayor a 0 |
| `unidad` | enum | Sí | `kg` o `litros` |
| `fechaProduccion` | string | Sí | Fecha en formato `dd/mm/yyyy` entre hoy y 7 días anteriores |
| `estado` | boolean | No | Estado del lote, si se omite queda en `false` |

Campos adicionales si `tipoSeguimiento = RODEO`:

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `idRodeo` | string (UUID) | Sí | ID del rodeo existente que pertenece al establecimiento |

Campos adicionales si `tipoSeguimiento = INDIVIDUAL`:

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `animales` | array | Sí | Lista de animales participantes en la producción |
| `animales[].idAnimal` | string (UUID) | Sí | ID del animal |
| `animales[].litros` | number | Sí | Litros producidos por el animal, debe ser mayor a 0 |
| `animales[].estado` | enum | Sí | Estado del animal (`MATITIS`, `TRATAMIENTO`, `PREPARTO`, `DESCARTE`) |

> El backend valida que el `tipoSeguimiento` enviado coincida con la configuración del establecimiento. Además, en modo `RODEO` el rodeo debe pertenecer al establecimiento y, en modo `INDIVIDUAL`, la suma de `litros` debe coincidir exactamente con `cantidad` y los animales deben pertenecer al establecimiento.

#### Ejemplo de Request (RODEO)

```json
{
  "tipoSeguimiento": "RODEO",
  "idLote": "550e8400-e29b-41d4-a716-446655440000",
  "tempTanque": 4.5,
  "destino": "TANQUE_FRIO",
  "idProducto": "550e8400-e29b-41d4-a716-446655440001",
  "cantidad": 100,
  "unidad": "kg",
  "fechaProduccion": "15/05/2026",
  "idRodeo": "550e8400-e29b-41d4-a716-446655440003"
}
```

#### Ejemplo de Request (INDIVIDUAL)

```json
{
  "tipoSeguimiento": "INDIVIDUAL",
  "idLote": "550e8400-e29b-41d4-a716-446655440010",
  "tempTanque": 3.2,
  "destino": "VENTA",
  "idProducto": "550e8400-e29b-41d4-a716-446655440001",
  "cantidad": 80,
  "unidad": "litros",
  "fechaProduccion": "15/05/2026",
  "animales": [
    {
      "idAnimal": "550e8400-e29b-41d4-a716-446655440020",
      "litros": 40,
      "estado": "PREPARTO"
    },
    {
      "idAnimal": "550e8400-e29b-41d4-a716-446655440021",
      "litros": 40,
      "estado": "TRATAMIENTO"
    }
  ]
}
```

#### Response (201 - Creado)

```json
{
  "success": true,
  "message": "Lote creado correctamente",
  "data": {
    "idLote": "550e8400-e29b-41d4-a716-446655440000",
    "numeroLote": 1,
    "fechaProduccion": "2026-05-15T12:00:00.000Z",
    "cantidad": 100,
    "unidad": "kg",
    "tempTanque": 4.5,
    "destino": "TANQUE_FRIO",
    "estado": false,
    "idRodeo": "550e8400-e29b-41d4-a716-446655440003",
    "idProducto": "550e8400-e29b-41d4-a716-446655440001",
    "idEstablecimiento": "uuid-establecimiento",
    "producto": {
      "idProducto": "550e8400-e29b-41d4-a716-446655440001",
      "nombre": "Leche Fresca",
      "categoria": "leches"
    }
  }
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Acceso a establecimiento no válido |
| 400 | Datos inválidos o body no coincide con el schema esperado |
| 400 | El tipo de seguimiento enviado no coincide con la configuración del establecimiento |
| 400 | El rodeo no pertenece a la configuración del establecimiento |
| 400 | Algunos animales no pertenecen al establecimiento |
| 400 | La cantidad total de producción no coincide con la cantidad del lote |
| 401 | Usuario no autenticado |
| 404 | Producto no encontrado o rodeo no encontrado |

---

### 2. Listar Lotes

**Método:** `GET`  
**Ruta:** `/lote/listar`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`

#### Query Parameters

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `pagina` | number | No | Página de resultados |
| `orden` | string | No | Orden de los resultados (`asc`, `desc`) |
| `estado` | boolean | No | Filtrar por estado del lote (`true` o `false`) |
| `nombre` | string | No | Buscar por texto en el nombre o producto |
| `producto` | string | No | Buscar por texto en el nombre del producto |
| `numeroLote` | number | No | Buscar por número de lote exacto |
| `fecha_desde` | string | No | Fecha inicial en formato `dd/mm/aaaa` |
| `fecha_hasta` | string | No | Fecha final en formato `dd/mm/aaaa` |

#### Ejemplo de Request

```bash
GET /lote/listar?pagina=1&orden=asc&estado=false&fecha_desde=01/05/2026&fecha_hasta=15/05/2026
Authorization: Bearer jwt_token_here
x-organizacion-id: 550e8400-e29b-41d4-a716-446655440001
x-establecimiento-id: 550e8400-e29b-41d4-a716-446655440002
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Lotes listados correctamente",
  "data": {
    "page": 1,
    "limit": 10,
    "totalLotes": 1,
    "totalPaginas": 1,
    "lotes": [
      {
        "idLote": "550e8400-e29b-41d4-a716-446655440000",
        "numeroLote": 123,
        "fechaProduccion": "2026-05-15T12:00:00.000Z",
        "cantidad": 100,
        "unidad": "kg",
        "estado": true,
        "cantRazas": 50,
        "idRaza": "550e8400-e29b-41d4-a716-446655440002",
        "idProducto": "550e8400-e29b-41d4-a716-446655440001",
        "idEstablecimiento": "uuid-establecimiento",
        "producto": {
          "idProducto": "550e8400-e29b-41d4-a716-446655440001",
          "nombre": "Leche Fresca",
          "categoria": "leches"
        },
        "raza": {
          "idRaza": "550e8400-e29b-41d4-a716-446655440002",
          "nombre": "Holando"
        },
        "mermas": []
      }
    ]
  }
}
```

---

### 3. Eliminar Lote

**Método:** `DELETE`  
**Ruta:** `/lote/:idLote`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`, `requireRoles({est: [RolEstablecimiento.ADMIN, RolEstablecimiento.OWNER]})`

#### Parámetros de Ruta

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `idLote` | string (UUID) | Sí | ID del lote a eliminar |

#### Ejemplo de Request

```bash
DELETE /lote/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer jwt_token_here
x-organizacion-id: 550e8400-e29b-41d4-a716-446655440000
x-establecimiento-id: 550e8400-e29b-41d4-a716-446655440001
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Lote eliminado correctamente",
  "data": null
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | No se pudo determinar el establecimiento |
| 400 | Id de lote inválido |
| 401 | Usuario no autenticado |
| 403 | Permisos insuficientes |

---

### 4. Actualizar Lote

**Método:** `PATCH`  
**Ruta:** `/lote/:idLote`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`

#### Parámetros de Ruta

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `idLote` | string (UUID) | Sí | ID del lote a actualizar |

#### Request Body

El body del request debe incluir el `tipoSeguimiento` configurado en el establecimiento y los datos de edición del lote.

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `tipoSeguimiento` | enum | Sí | `RODEO` o `INDIVIDUAL` |
| `idProducto` | string (UUID) | No | ID del producto del lote (opcional) |
| `cantidad` | number | Sí | Cantidad de producción, mayor a 0 |
| `unidad` | enum | Sí | Unidad de medida (`kg`, `litros`) |
| `fechaProduccion` | string | Sí | Fecha en formato `dd/mm/yyyy` |
| `tempTanque` | number | Sí | Temperatura del tanque, mayor a 0 |
| `destino` | enum | Sí | `TANQUE_FRIO`, `VENTA` o `FABRICA_QUESOS` |

Campos adicionales según el `tipoSeguimiento`:

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `idRodeo` | string (UUID) | Sí si `tipoSeguimiento = RODEO` | ID del rodeo del establecimiento |
| `animales` | array | Sí si `tipoSeguimiento = INDIVIDUAL` | Lista de animales usados en el lote |
| `animales[].idAnimal` | string (UUID) | Sí | ID del animal |
| `animales[].litros` | number | Sí | Litros producidos por el animal |
| `animales[].estado` | enum | Sí | Estado del animal (`MATITIS`, `TRATAMIENTO`, `PREPARTO`, `DESCARTE`) |

> El backend valida que el `tipoSeguimiento` enviado coincida con la configuración del establecimiento. El lote debe estar en estado `false` para poder editarlo.

#### Ejemplo de Request (RODEO)

```json
{
  "tipoSeguimiento": "RODEO",
  "idProducto": "550e8400-e29b-41d4-a716-446655440001",
  "cantidad": 120,
  "unidad": "litros",
  "fechaProduccion": "16/05/2026",
  "tempTanque": 4.5,
  "destino": "VENTA",
  "idRodeo": "550e8400-e29b-41d4-a716-446655440003"
}
```

#### Ejemplo de Request (INDIVIDUAL)

```json
{
  "tipoSeguimiento": "INDIVIDUAL",
  "idProducto": "550e8400-e29b-41d4-a716-446655440001",
  "cantidad": 80,
  "unidad": "litros",
  "fechaProduccion": "16/05/2026",
  "tempTanque": 3.5,
  "destino": "TANQUE_FRIO",
  "animales": [
    {
      "idAnimal": "550e8400-e29b-41d4-a716-446655440020",
      "litros": 40,
      "estado": "PREPARTO"
    },
    {
      "idAnimal": "550e8400-e29b-41d4-a716-446655440021",
      "litros": 40,
      "estado": "TRATAMIENTO"
    }
  ]
}
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Lote actualizado correctamente",
  "data": {
    "idLote": "550e8400-e29b-41d4-a716-446655440000",
    "numeroLote": 123,
    "fechaProduccion": "2026-05-16T00:00:00.000Z",
    "cantidad": 120,
    "unidad": "litros",
    "tempTanque": 4.5,
    "destino": "VENTA",
    "estado": false,
    "idProducto": "550e8400-e29b-41d4-a716-446655440001",
    "idEstablecimiento": "uuid-establecimiento",
    "producto": {
      "idProducto": "550e8400-e29b-41d4-a716-446655440001",
      "nombre": "Leche Fresca",
      "categoria": "leches"
    }
  }
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | No se pudo determinar el establecimiento |
| 400 | Parámetros inválidos |
| 400 | Datos del cuerpo inválidos |
| 400 | El tipo de seguimiento enviado no coincide con la configuración del establecimiento |
| 400 | El rodeo no pertenece a la configuración del establecimiento |
| 400 | Algunos animales no pertenecen al establecimiento |
| 400 | La cantidad total de producción no coincide con la cantidad del lote |
| 401 | Usuario no autenticado |
| 404 | El lote no existe o no pertenece al establecimiento |
| 409 | No se pueden editar lotes que ya están completados |

---

### 5. Obtener Lote por ID

**Método:** `GET`  
**Ruta:** `/lote/buscar/:idLote`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`

#### Parámetros de Ruta

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `idLote` | string (UUID) | Sí | ID del lote a obtener |

#### Ejemplo de Request

```bash
GET /lote/buscar/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer jwt_token_here
x-organizacion-id: 550e8400-e29b-41d4-a716-446655440000
x-establecimiento-id: 550e8400-e29b-41d4-a716-446655440001
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Lote obtenido correctamente",
  "data": {
    "idLote": "550e8400-e29b-41d4-a716-446655440000",
    "numeroLote": 123,
    "fechaProduccion": "2026-05-15T12:00:00.000Z",
    "cantidad": 100,
    "unidad": "kg",
    "estado": true,
    "cantRazas": 50,
    "idRaza": "550e8400-e29b-41d4-a716-446655440002",
    "idProducto": "550e8400-e29b-41d4-a716-446655440001",
    "idEstablecimiento": "uuid-establecimiento",
    "producto": {
      "idProducto": "550e8400-e29b-41d4-a716-446655440001",
      "nombre": "Leche Fresca",
      "categoria": "leches"
    },
    "raza": {
      "idRaza": "550e8400-e29b-41d4-a716-446655440002",
      "nombre": "Holando"
    },
    "establecimiento": {
      "idEstablecimiento": "uuid-establecimiento",
      "nombre": "Establecimiento La Esperanza",
      "provincia": "Córdoba",
      "localidad": "Villa María"
    },
    "mermas": [
      {
        "idMerma": "uuid-merma",
        "tipo": "Natural",
        "cantidad": 5.5,
        "fechaCreacion": "2026-05-15T13:00:00.000Z"
      }
    ],
    "costosDirectos": [
      {
        "idCostoDirecto": "uuid-costo",
        "concepto": "insumos_basicos",
        "monto": 150.50,
        "observaciones": "Costo de insumos",
        "fechaCreacion": "2026-05-15T13:00:00.000Z"
      }
    ],
    "alertas": [
      {
        "id": "uuid-alerta",
        "idEstablecimiento": "uuid-establecimiento",
        "idLote": "550e8400-e29b-41d4-a716-446655440000",
        "producto": "Leche Fresca",
        "categoria": "leches",
        "nivel": "alto",
        "descripcion": "Temperatura del lote supera el límite",
        "creadoEn": "2026-05-15T14:00:00.000Z",
        "visto": false
      }
    ],
    "alertasError": null
  }
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | No se pudo determinar el establecimiento |
| 400 | Parámetros inválidos |
| 401 | Usuario no autenticado |

---

## Notas

- La fecha de producción debe estar en formato `dd/mm/aaaa`
- La fecha debe estar entre la fecha actual y 7 días anteriores
- Las unidades válidas son: `kg`, `litros`
- Las respuestas siguen el formato estándar `ApiResponse`