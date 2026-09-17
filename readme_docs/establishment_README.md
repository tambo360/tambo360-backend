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

### 1. Crear Establecimiento (DESACTIVO POR AHORA)

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
    "idEstablecimiento": "uuid",
    "nombre": "Establecimiento La Esperanza",
    "idOrganizacion": "uuid",
    "localidad": null,
    "provincia": null,
    "cuestionarioCompletado": false,
    "fechaCreacion": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Permisos
Solo usuarios con rol `ORG_OWNER` o `ORG_ADMIN` de la organización pueden crear establecimientos.
El usuario que realiza la operación queda asociado al establecimiento con rol `OWNER`, y el backend crea una configuración inicial.

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Acceso a organización no válido |
| 400 | El nombre es obligatorio y debe tener entre 2 y 100 caracteres |
| 400 | Ya existe un establecimiento con ese nombre en la organización |
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
      "idOrganizacion": "uuid",
      "cuestionarioCompletado": false
    },
    {
      "id": "uuid",
      "nombre": "Establecimiento 2",
      "idOrganizacion": "uuid",
      "cuestionarioCompletado": true
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
    "cuestionarioCompletado": false,
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

### 4. Obtener opciones de seguimiento

**Método:** `GET`  
**Ruta:** `/establecimiento/info/opciones-seguimiento`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`

Devuelve los recursos disponibles para crear lotes según la configuración del establecimiento.

- `RODEO` o `RODEO_UNICO` → responde con `rodeos` filtrados.
- `INDIVIDUAL` → responde con animales activos.

En la respuesta de rodeos, `label` y `value` se generan a partir del tipo de rodeo. Actualmente el servicio considera `ALTA_PRODUCCION`, `BAJA_PRODUCCION` y `UNICO_ORDENIE`.

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Opciones de creación obtenidas correctamente",
  "data": {
    "tipoSeguimiento": "RODEO",
    "rodeos": [
      {
        "idRodeo": "550e8400-e29b-41d4-a716-446655440003",
        "label": "Rodeo Alta Producción",
        "value": "ALTA_PRODUCCION",
        "costoRacion": 120,
        "cantVacas": 15,
        "razas": [
          {
            "idRaza": "550e8400-e29b-41d4-a716-446655440003",
            "nombre": "Holando Argentino",
            "value": "HOLANDO_ARGENTINO",
            "cantVacas": 10
          },
          { 
            "idRaza": "550e8400-e29b-41d4-a716-446655440003",
            "nombre": "Jersey",
            "value": "JERSEY",
            "cantVacas": 5
          }
        ]
      }
    ]
  }
}
```

Cuando `tipoSeguimiento` es `INDIVIDUAL`, `data` tiene esta forma:

```json
{
  "tipoSeguimiento": "INDIVIDUAL",
  "animales": [
    {
      "idAnimal": "550e8400-e29b-41d4-a716-446655440020",
      "codigo": "A-001",
      "nombre": "Vaca Rosa",
      "categoria": "ORDENE",
      "raza": "Holando-Jersey (Cruza)",
      "estado": "SANO",
      "fechaNacimiento": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

El endpoint devuelve animales activos y no incluye `raza`, `observacion` ni datos de producción en esta respuesta.

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | No se pudo determinar el establecimiento |
| 401 | Usuario no autenticado |
| 404 | Establecimiento no encontrado |

---

### 5. Registrar Cuestionario

**Método:** `POST`  
**Ruta:** `/establecimiento/cuestionario`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`, `requireRoles({ est: [OWNER, ADMIN], org: [ORG_OWNER] })`

#### Permisos

Solo pueden registrar el cuestionario:
- rol `OWNER` o `ADMIN` del establecimiento
- rol `ORG_OWNER` de la organización

#### Request Body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `TipoSeguimiento` | enum | Sí | Modo de seguimiento: `RODEO`, `RODEO_UNICO` o `INDIVIDUAL` |
| `cantOrdenie` | number (int) | Sí | Cantidad de ordeñes por día (entero positivo) |
| `tipoOrdenie` | enum | Sí | Tipo de ordeñe (`balde`, `linea`, `espina_de_pescado`, `rotativo`, `manual`, `otro`) |
| `promDEL` | number | Sí | Promedio de días en leche (DEL), mayor que 0 |
| `promLitros` | number | Sí | Promedio de litros por día (positivo) |
| `ventaLeche` | enum | Sí | Tipo de venta de leche (`USINA`, `COOPERTIVA`, `ELABORACION_PROPIA`, `VENTA_DIRECTA_MERCADO_LOCAL`) |
| `precioLitro` | number | Sí | Precio por litro, mayor que 0 |
| `productos` | array | No | Productos asociados al establecimiento |
| `productos[].tipo` | string | Sí | `existente` o `nuevo` |
| `productos[].idProducto` | string (UUID) | No | ID del producto cuando `tipo` es `existente` |
| `productos[].nombre` | string | Sí | Nombre del producto |
| `productos[].categoria` | string | No | Categoría del producto cuando `tipo` es `nuevo`: `quesos`, `leches`, `yogures` u `otros` |
| `rodeos` | array | Sí si `TipoSeguimiento = RODEO` o `RODEO_UNICO` | Rodeos por tipo de producción |
| `rodeos[].tipoRodeo` | enum | Sí | `ALTA_PRODUCCION`, `BAJA_PRODUCCION`, `VACAS_SECAS`, `UNICO_ORDENIE` o `UNICO_SECA` |
| `rodeos[].costoRacion` | number | Sí | Costo de la ración diaria por vaca |
| `rodeos[].razas` | array | Sí | Distribución de razas dentro del rodeo |
| `rodeos[].razas[].raza` | enum | Sí | Raza del animal |
| `rodeos[].razas[].cantVacas` | number (int) | Sí | Cantidad de animales de esa raza |
| `animales` | array | Sí si `TipoSeguimiento = INDIVIDUAL` | Lista de animales a registrar |
| `animales[].codigo` | string | No | Código del animal |
| `animales[].nombre` | string | No | Nombre del animal |
| `animales[].categoria` | enum | Sí | Categoría del animal (`ORDENE`, `SECAS`) |
| `animales[].estado` | enum | Sí | Estado del animal (`MASTITIS`, `TRATAMIENTO`, `PREPARTO`, `SANO`) |
| `animales[].fechaNacimiento` | string | No | String convertible a fecha JavaScript |
| `animales[].observacion` | string | No | Observación opcional del animal |
| `animales[].fechaParto` | string | No | String convertible a fecha JavaScript |
| `animales[].raza` | enum | Sí | Raza del animal |
| `ubicacion.provincia` | string | Sí | Provincia |
| `ubicacion.localidad` | string | Sí | Localidad |

> Nota: el field `idEstablecimiento` se inyecta automáticamente desde el contexto del establecimiento, no debe enviarse en el body.
> **Reglas de negocio importantes:**
> - Si `TipoSeguimiento = RODEO`, debe enviarse `rodeos` y el backend valida que exista al menos un rodeo de cada tipo (`ALTA_PRODUCCION`, `BAJA_PRODUCCION`, `VACAS_SECAS`).
> - Si `TipoSeguimiento = RODEO_UNICO`, deben enviarse rodeos que incluyan al menos un `UNICO_ORDENIE` y un `UNICO_SECA`.
> - Si `TipoSeguimiento = INDIVIDUAL`, debe enviarse `animales`; la cantidad total se calcula desde el array.
> - Para `RODEO` y `RODEO_UNICO`, la cantidad total de vacas se calcula sumando `razas[].cantVacas` de todos los rodeos.
> - En seguimiento individual se rechaza una cantidad de animales superior a 70 o un `promLitros` superior a 2000.
> - Cada rodeo debe incluir al menos una raza y cada `raza` con cantidad positiva.
> - Un animal de categoría `ORDENE` solo puede tener estado `SANO`.
> - `fechaNacimiento` y `fechaParto` se envían como strings ISO/Date y luego se convierten a `Date` en el Zod.

#### Ejemplo de Request (seguimiento por rodeos)

```json
{
  "TipoSeguimiento": "RODEO",
  "cantOrdenie": 2,
  "tipoOrdenie": "linea",
  "promDEL": 120,
  "promLitros": 25.5,
  "ventaLeche": "USINA",
  "precioLitro": 42.5,
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
  "rodeos": [
    {
      "tipoRodeo": "ALTA_PRODUCCION",
      "costoRacion": 150.50,
      "razas": [
        { "raza": "HOLANDO_ARGENTINO", "cantVacas": 40 },
        { "raza": "JERSEY", "cantVacas": 40 }
      ]
    },
    {
      "tipoRodeo": "BAJA_PRODUCCION",
      "costoRacion": 120.00,
      "razas": [
        { "raza": "HOLANDO_ARGENTINO", "cantVacas": 50 }
      ]
    },
    {
      "tipoRodeo": "VACAS_SECAS",
      "costoRacion": 80.00,
      "razas": [
        { "raza": "HOLANDO_ARGENTINO", "cantVacas": 20 }
      ]
    }
  ],
  "ubicacion": {
    "provincia": "Córdoba",
    "localidad": "Villa María"
  }
}
```

#### Ejemplo de Request (seguimiento individual)

```json
{
  "TipoSeguimiento": "INDIVIDUAL",
  "cantOrdenie": 2,
  "tipoOrdenie": "linea",
  "promDEL": 120,
  "promLitros": 25.5,
  "ventaLeche": "USINA",
  "precioLitro": 42.5,
  "animales": [
    {
      "codigo": "A-001",
      "nombre": "Animal 1",
      "categoria": "ORDENE",
      "estado": "SANO",
      "fechaNacimiento": "2024-01-01T00:00:00.000Z",
      "raza": "HOLANDO_ARGENTINO"
    },
    {
      "codigo": "A-002",
      "nombre": "Animal 2",
      "categoria": "SECAS",
      "estado": "TRATAMIENTO",
      "raza": "JERSEY"
    }
  ],
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
    "status": "success"
  }
}
```

#### Permisos
Solo usuarios con rol `OWNER` o `ADMIN` del establecimiento y `ORG_OWNER` de la organización pueden registrar el cuestionario.

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Acceso a organización no válido |
| 400 | Acceso a establecimiento no válido |
| 400 | Todos los campos son obligatorios y deben ser válidos |
| 400 | Debe proporcionar los rodeos |
| 400 | Debe proporcionar los animales |
| 400 | Debe existir al menos un rodeo de cada tipo |
| 400 | La suma de la cantidad de vacas por rodeo no coincide con la cantidad total de vacas |
| 400 | La cantidad de animales no coincide con la cantidad total de vacas |
| 400 | La cantidad de vacas excede el límite para el seguimiento individual |
| 403 | Permisos insuficientes para registrar el cuestionario |
| 404 | Establecimiento no encontrado |

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

### 7. Obtener Invitaciones de Establecimiento

**Método:** `GET`  
**Ruta:** `/establecimiento/invitacion`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`

#### Headers

| Header | Tipo | Descripción |
|--------|------|-------------|
| `Authorization` | string | Token JWT de autenticación |
| `x-organizacion-id` | string (UUID) | ID de la organización |
| `x-establecimiento-id` | string (UUID) | ID del establecimiento |

#### Request
No requiere body. El ID del establecimiento se toma del contexto.

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Invitación enviada correctamente",
  "data": [
    {
      "id": "8e2f7b1a-3b90-4c0a-a4db-df0d2b6f4f8f",
      "correo": "usuario@dominio.com",
      "codigo": "abc123def456",
      "estado": "pendiente",
      "expiracion": "2024-01-08T00:00:00.000Z",
      "rol": "ADMIN"
    }
  ]
}
```

#### Permisos
Solo usuarios con rol `OWNER` del establecimiento pueden obtener las invitaciones.

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Acceso a organización no válido |
| 400 | Acceso a establecimiento no válido |
| 403 | Permisos insuficientes para obtener invitaciones |

---

### 8. Eliminar Invitación de Establecimiento

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