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
| `x-establecimiento-id` | string (UUID) | ID del establecimiento | `/establecimiento/cuestionario/*` (vía `estContext`) |

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
| `idEstablecimiento` | string (UUID) | Sí | ID del establecimiento |
| `cantidadVacas` | number (int) | Sí | Cantidad de vacas (positivo) |
| `Razas` | array | Sí | Array de razas (mínimo 1) |
| `Razas[].idRaza` | string (UUID) | Sí | ID de la raza |
| `Razas[].nombre` | string | Sí | Nombre de la raza |
| `cantOrdenie` | number (int) | Sí | Cantidad de ordeñes (positivo) |
| `tipoOrdenie` | enum | Sí | Tipo de ordeñe |
| `promLitros` | number | Sí | Promedio de litros (positivo) |
| `ventaLeche` | enum | Sí | Tipo de venta de leche |
| `empleados` | boolean | Sí | Indica si tiene empleados |
| `cantEmpleados` | number (int) | No | Cantidad de empleados |
| `ubicacion.provincia` | string | Sí | Provincia |
| `ubicacion.localidad` | string | Sí | Localidad |

#### Ejemplo de Request

```json
{
  "idEstablecimiento": "uuid-del-establecimiento",
  "cantidadVacas": 150,
  "Razas": [
    {
      "idRaza": "uuid-raza",
      "nombre": "Holando"
    }
  ],
  "cantOrdenie": 2,
  "tipoOrdenie": "temporal",
  "promLitros": 25.5,
  "ventaLeche": "directa",
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
    "tipoOrdenie": "temporal",
    "promLitros": 25.5,
    "ventaLeche": "directa",
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
    "razas": ["Holando", "Jersey"],
    "cant_ordenie": 2,
    "tipo_ordenie": "temporal",
    "prom_litros": 25.5,
    "venta_leche": "directa",
    "empleados": true,
    "cant_empleados": 3,
    "ubicacion": {
      "provincia": "Córdoba",
      "localidad": "Villa María"
    },
    "establecimiento": {
      "id": "uuid",
      "nombre": "Establecimiento La Esperanza"
    }
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

## Enums

### TipoOrdenie

| Valor | Descripción |
|-------|-------------|
| `temporal` | Ordeñe temporal |
| `fijo` | Ordeñe fijo |

### VentaLeche

| Valor | Descripción |
|-------|-------------|
| `directa` | Venta directa |
| `intermediario` | Venta a intermediario |
| `cooperativa` | Venta a cooperativa |

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