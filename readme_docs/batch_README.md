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

#### Request Body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `idLote` | string (UUID) | Sí | ID único del lote |
| `idProducto` | string (UUID) | Sí | ID del producto a producir |
| `cantidad` | number | Sí | Cantidad a producir (mayor a 0) |
| `unidad` | string | Sí | Unidad de medida (kg, litros) |
| `fechaProduccion` | string | Sí | Fecha en formato dd/mm/aaaa (entre hoy y 7 días anteriores) |
| `estado` | boolean | No | Estado del lote (opcional) |
| `idRaza` | string (UUID) | Sí | ID de la raza utilizada |
| `cantRaza` | number | Sí | Cantidad de la raza (mayor a 0) |

#### Ejemplo de Request

```json
{
  "idLote": "550e8400-e29b-41d4-a716-446655440000",
  "idProducto": "550e8400-e29b-41d4-a716-446655440001",
  "cantidad": 100,
  "unidad": "kg",
  "fechaProduccion": "15/05/2026",
  "estado": true,
  "idRaza": "550e8400-e29b-41d4-a716-446655440002",
  "cantRaza": 50
}
```

#### Response (201 - Creado)

```json
{
  "success": true,
  "message": "Lote creado correctamente",
  "data": {
    "idLote": "550e8400-e29b-41d4-a716-446655440000",
    "idProducto": "550e8400-e29b-41d4-a716-446655440001",
    "cantidad": 100,
    "unidad": "kg",
    "fechaProduccion": "2026-05-15T12:00:00.000Z",
    "estado": true,
    "idRaza": "550e8400-e29b-41d4-a716-446655440002",
    "cantRaza": 50,
    "idEstablecimiento": "uuid-establecimiento"
  }
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Acceso a organización no válido |
| 400 | Acceso a establecimiento no válido |
| 400 | Unidad de medida inválida |
| 400 | Datos inválidos (detalles específicos de validación) |
| 401 | Usuario no autenticado |

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

#### Ejemplo de Request

```bash
GET /lote/listar?pagina=1&orden=asc
Authorization: Bearer jwt_token_here
x-organizacion-id: 550e8400-e29b-41d4-a716-446655440000
x-establecimiento-id: 550e8400-e29b-41d4-a716-446655440001
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Lotes listados correctamente",
  "data": [
    {
      "idLote": "550e8400-e29b-41d4-a716-446655440000",
      "idProducto": "550e8400-e29b-41d4-a716-446655440001",
      "cantidad": 100,
      "unidad": "kg",
      "fechaProduccion": "2026-05-15T12:00:00.000Z",
      "estado": true,
      "idRaza": "550e8400-e29b-41d4-a716-446655440002",
      "cantRaza": 50,
      "idEstablecimiento": "uuid-establecimiento"
    }
  ]
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

### 4. Obtener Lote por ID

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