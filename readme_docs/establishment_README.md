# Documentación de Endpoints - Establecimientos

## Descripción
Esta API permite gestionar establecimientos dentro de una organización. Requiere autenticación y acceso a una organización válida.

## Autenticación y Autorización
- Todos los endpoints requieren token de autenticación (`authenticate`)
- Requieren contexto de organización (`orgContext`)
- Requieren acceso a la organización (`requireOrgAccess`)

## Headers Requeridos

| Header | Tipo | Descripción | Endpoints que lo usan |
|--------|------|-------------|----------------------|
| `Authorization` | string | Token JWT de autenticación | Todos |
| `x-organizacion-id` | string (UUID) | ID de la organización | Todos (vía `orgContext`) |
| `x-establecimiento-id` | string (UUID) | ID del establecimiento | `/establecimiento/cuestionario/*`, `/establecimiento/invitacion` (vía `estContext`) |

---

## Endpoints

### 1. Crear Establecimiento

**Método:** `POST`  
**Ruta:** `/establecimiento`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`

#### Request Body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `nombre` | string | Sí | Nombre del establecimiento (2-100 caracteres) |

#### Ejemplo de Request

```json
{
  "nombre": "Establecimiento La Esperanza"
}
```

#### Response (201 - Creado)

```json
{
  "success": true,
  "message": "Establecimiento creado correctamente",
  "data": {
    "id": "uuid",
    "nombre": "Establecimiento La Esperanza",
    "idOrganizacion": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Permisos
Solo usuarios con rol `duenio` o `cooperativa` pueden crear establecimientos.

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Acceso a organización no válido |
| 400 | Todos los campos son obligatorios y deben ser válidos |
| 403 | Permisos insuficientes para crear un establecimiento |

---

### 2. Listar Establecimientos

**Método:** `GET`  
**Ruta:** `/establecimiento`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`

#### Request
No requiere body. Los establecimientos se filtran por la organización del usuario.

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Establecimientos obtenidos correctamente",
  "data": [
    {
      "id": "uuid",
      "nombre": "Establecimiento 1",
      "idOrganizacion": "uuid"
    },
    {
      "id": "uuid",
      "nombre": "Establecimiento 2",
      "idOrganizacion": "uuid"
    }
  ]
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Acceso a organización no válido |

---

### 3. Obtener Establecimiento por ID

**Método:** `GET`  
**Ruta:** `/establecimiento/:idEst`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`

#### Parámetros de Ruta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `idEst` | string (UUID) | ID del establecimiento |

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Establecimiento obtenido correctamente",
  "data": {
    "id": "uuid",
    "nombre": "Establecimiento La Esperanza",
    "idOrganizacion": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Acceso a organización no válido |
| 404 | Establecimiento no encontrado |

---

### 4. Registrar Cuestionario

**Método:** `POST`  
**Ruta:** `/establecimiento/cuestionario`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`

#### Request Body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `rodeos` | array | Sí | Array de rodeos por tipo de producción |
| `rodeos[].tipoRodeo` | enum | Sí | Tipo de rodeo (`ALTA_PRODUCCION`, `BAJA_PRODUCCION`, `VACAS_SECAS`) |
| `rodeos[].cantVacas` | number (int) | Sí | Cantidad de vacas en este rodeo (positivo) |
| `rodeos[].costoRacion` | number | Sí | Costo de la ración diaria por vaca (positivo) |
| `productos` | array | No | Array opcional de productos |
| `productos[].tipo` | string | Sí | `existente` o `nuevo` |
| `productos[].idProducto` | string (UUID) | No | ID del producto cuando `tipo` es `existente` |
| `productos[].nombre` | string | Sí | Nombre del producto |
| `productos[].categoria` | string | No | Categoría del producto cuando `tipo` es `nuevo` |
| `cantOrdenie` | number (int) | Sí | Cantidad de ordeñes por día (positivo) |
| `tipoOrdenie` | enum | Sí | Tipo de ordeñe (`balde`, `linea`, `espina_de_pescado`, `rotativo`, `manual`, `otro`) |
| `promLitros` | number | Sí | Promedio de litros por día (positivo) |
| `ventaLeche` | enum | Sí | Tipo de venta de leche (`usina`, `fabrica_propia`, `cooperativa`, `varios`) |
| `empleados` | boolean | Sí | Indica si tiene empleados |
| `cantEmpleados` | number (int) | No | Cantidad de empleados |
| `ubicacion.provincia` | string | Sí | Provincia |
| `ubicacion.localidad` | string | Sí | Localidad |

> Nota: el field `idEstablecimiento` se inyecta automáticamente desde el contexto del establecimiento, no debe enviarse en el body.
> **Importante:** Debe incluir exactamente UN rodeo de cada tipo de TipoRodeo.

#### Ejemplo de Request

```json
{
  "rodeos": [
    {
      "tipoRodeo": "ALTA_PRODUCCION",
      "cantVacas": 80,
      "costoRacion": 150.50
    },
    {
      "tipoRodeo": "BAJA_PRODUCCION",
      "cantVacas": 50,
      "costoRacion": 120.00
    },
    {
      "tipoRodeo": "VACAS_SECAS",
      "cantVacas": 20,
      "costoRacion": 80.00
    }
  ],
  "productos": [
    {
      "tipo": "existente",
      "idProducto": "uuid-producto",
      "nombre": "Leche Fresca"
    },
    {
      "tipo": "nuevo",
      "nombre": "Yogur Natural",
      "categoria": "yogures"
    }
  ],
  "cantOrdenie": 2,
  "tipoOrdenie": "linea",
  "promLitros": 25.5,
  "ventaLeche": "usina",
  "empleados": true,
  "cantEmpleados": 3,
  "ubicacion": {
    "provincia": "Córdoba",
    "localidad": "Villa María"
  }
}
```

#### Response (201 - Creado)

```json
{
  "success": true,
  "message": "Cuestionario registrado correctamente",
  "data": {
    "id": "uuid",
    "idEstablecimiento": "uuid",
    "cantVacas": 150,
    "cantOrdenie": 2,
    "tipoOrdenie": "linea",
    "promLitros": 25.5,
    "ventaLeche": "usina",
    "empleados": true,
    "cantEmpleados": 3
  }
}
```

#### Permisos
Solo usuarios con rol `duenio` o `administrador` del establecimiento pueden registrar el cuestionario.

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Acceso a organización no válido |
| 400 | Acceso a establecimiento no válido |
| 400 | Todos los campos son obligatorios y deben ser válidos |
| 400 | Debe existir al menos un rodeo de cada tipo |
| 403 | Permisos insuficientes para registrar el cuestionario |

---

### 5. Obtener Cuestionario

**Método:** `GET`  
**Ruta:** `/establecimiento/cuestionario/info`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`

#### Request
No requiere body. El ID del establecimiento se obtiene del contexto.

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Cuestionario obtenido correctamente",
  "data": {
    "idEstablecimiento": "uuid",
    "cantidad_vacas": 150,
    "productos": [
      {
        "nombre": "Leche Fresca",
        "id": "uuid-producto"
      }
    ],
    "ordeñe_por_dia": 2,
    "tipo_ordeñe": "linea",
    "litros_por_dia": 25.5,
    "venta_leche": "usina",
    "empleados": true,
    "cantidad_empleados": 3,
    "localidad": "Villa María",
    "provincia": "Córdoba",
    "rodeos": [
      {
        "tipoRodeo": "ALTA_PRODUCCION",
        "cantVacas": 80,
        "costoRacion": 150.50
      },
      {
        "tipoRodeo": "BAJA_PRODUCCION",
        "cantVacas": 50,
        "costoRacion": 120.00
      },
      {
        "tipoRodeo": "VACAS_SECAS",
        "cantVacas": 20,
        "costoRacion": 80.00
      }
    ]
  }
}
```

#### Permisos
Solo usuarios con rol `duenio` o `administrador` del establecimiento pueden obtener el cuestionario.

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Acceso a organización no válido |
| 400 | Acceso a establecimiento no válido |
| 403 | Permisos insuficientes para obtener el cuestionario |
| 404 | Cuestionario no encontrado para este establecimiento |

---

### 6. Enviar Invitación a Establecimiento

**Método:** `POST`  
**Ruta:** `/establecimiento/invitacion`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`

#### Headers

| Header | Tipo | Descripción |
|--------|------|-------------|
| `Authorization` | string | Token JWT de autenticación |
| `x-organizacion-id` | string (UUID) | ID de la organización |
| `x-establecimiento-id` | string (UUID) | ID del establecimiento |

#### Request Body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `correo` | string | Sí | Email de la persona invitada |
| `rol` | string | Sí | Rol en el establecimiento (`ADMIN` o `EMPLOYEE`) |

#### Ejemplo de Request

```json
{
  "correo": "usuario@dominio.com",
  "rol": "ADMIN"
}
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Invitación enviada correctamente",
  "data": {
    "rol": "ADMIN",
    "expiraEn": "2024-01-08T00:00:00.000Z",
    "invitador": {
      "nombre": "Nombre Invitador"
    },
    "establecimiento": {
      "nombre": "Establecimiento La Esperanza"
    }
  }
}
```

#### Permisos
Solo usuarios con rol `OWNER` del establecimiento pueden enviar invitaciones.

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Datos inválidos |
| 400 | Acceso a organización no válido |
| 400 | Acceso a establecimiento no válido |
| 403 | Permisos insuficientes para enviar invitación |

---

### 7. Eliminar Invitación de Establecimiento

**Método:** `DELETE`  
**Ruta:** `/establecimiento/invitacion/:idInvitacion`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`

#### Headers

| Header | Tipo | Descripción |
|--------|------|-------------|
| `Authorization` | string | Token JWT de autenticación |
| `x-organizacion-id` | string (UUID) | ID de la organización |
| `x-establecimiento-id` | string (UUID) | ID del establecimiento |

#### Parámetros de Ruta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `idInvitacion` | string (UUID) | ID de la invitación a eliminar |

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Invitación eliminada correctamente",
  "data": {
    "idInvitacion": "8e2f7b1a-3b90-4c0a-a4db-df0d2b6f4f8f",
    "idEstablecimiento": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
    "correo": "usuario@dominio.com",
    "estado": "pendiente"
  }
}
```

#### Permisos
Solo usuarios con rol `OWNER` o `ADMIN` del establecimiento pueden eliminar invitaciones.

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Datos inválidos |
| 400 | La invitación ya ha sido procesada |
| 400 | Acceso a organización no válido |
| 400 | Acceso a establecimiento no válido |
| 403 | Permisos insuficientes o no pertenece al establecimiento |
| 404 | Invitación no encontrada |

---

### 8. Listar Rodeos del Establecimiento

**Método:** `GET`  
**Ruta:** `/establecimiento/rodeos/get`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`

#### Headers

| Header | Tipo | Descripción |
|--------|------|-------------|
| `Authorization` | string | Token JWT de autenticación |
| `x-organizacion-id` | string (UUID) | ID de la organización |
| `x-establecimiento-id` | string (UUID) | ID del establecimiento |

#### Request
No requiere body. El ID del establecimiento se obtiene del contexto.

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Rodeos obtenidos correctamente",
  "data": [
    {
      "idRodeo": "550e8400-e29b-41d4-a716-446655440001",
      "tipoRodeo": "ALTA_PRODUCCION",
      "cantVacas": 80,
      "costoRacion": 150.50,
      "idConfiguracion": "a1b2c3d4-5678-90ab-cdef-1234567890ab"
    },
    {
      "idRodeo": "550e8400-e29b-41d4-a716-446655440002",
      "tipoRodeo": "BAJA_PRODUCCION",
      "cantVacas": 50,
      "costoRacion": 120.00,
      "idConfiguracion": "a1b2c3d4-5678-90ab-cdef-1234567890ab"
    },
    {
      "idRodeo": "550e8400-e29b-41d4-a716-446655440003",
      "tipoRodeo": "VACAS_SECAS",
      "cantVacas": 20,
      "costoRacion": 80.00,
      "idConfiguracion": "a1b2c3d4-5678-90ab-cdef-1234567890ab"
    }
  ]
}
```

#### Permisos
Solo usuarios con acceso al establecimiento pueden obtener sus rodeos.

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Acceso a establecimiento no válido |
| 404 | Establecimiento no encontrado |

---

## Enums

### TipoRodeo

| Valor | Descripción |
|-------|-------------|
| `ALTA_PRODUCCION` | Rodeo de vacas de alta producción |
| `BAJA_PRODUCCION` | Rodeo de vacas de baja producción |
| `VACAS_SECAS` | Rodeo de vacas secas/no productivas |

### TipoOrdenie

| Valor | Descripción |
|-------|-------------|
| `balde` | Ordeño manual con balde |
| `linea` | Ordeño por línea de ordeño |
| `espina_de_pescado` | Ordeño espina de pescado |
| `rotativo` | Ordeño rotativo |
| `manual` | Ordeño manual |
| `otro` | Otro tipo de ordeño |

### VentaLeche

| Valor | Descripción |
|-------|-------------|
| `usina` | Venta a usina |
| `fabrica_propia` | Venta con fábrica propia |
| `cooperativa` | Venta a cooperativa |
| `varios` | Varias opciones de venta |

### RolEstablecimiento

| Valor | Descripción |
|-------|-------------|
| `duenio` | Owner/Propietario del establecimiento |
| `administrador` | Administrador del establecimiento |
| `miembro` | Miembro del establecimiento |

---

## Notas

- Todos los endpoints requieren autenticación JWT
- El contexto de organización se establece mediante middleware
- Para endpoints de cuestionario se requiere contexto de establecimiento (`estContext`)
- Las respuestas siguen el formato estándar `ApiResponse`