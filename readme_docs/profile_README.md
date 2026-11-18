# Documentación de Endpoints - Perfil

## Descripción
Esta API permite al usuario consultar y responder invitaciones pendientes. Requiere autenticación.

## Autenticación
Todos los endpoints requieren token JWT en el header `Authorization`.

---

## Endpoints

### 1. Obtener Invitaciones del Usuario

**Método:** `GET`  
**Ruta:** `/perfil/invitaciones`  
**Middleware:** `authenticate`

#### Request
No requiere body.

#### Headers

| Header | Tipo | Descripción |
|--------|------|-------------|
| `Authorization` | string | Token JWT de autenticación |

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Invitaciones obtenidas correctamente",
  "data": {
    "invitaciones_organizacion": [
      {
        "id": "uuid",
        "correo": "usuario@dominio.com",
        "invitador": "Nombre Invitador",
        "estado": "pendiente",
        "rol": {
          "rol": "ORG_ADMIN",
          "nombre": "Administrador de organización"
        },
        "expiraEn": "2024-01-08T00:00:00.000Z",
        "organizacion": {
          "id": "uuid",
          "nombre": "Mi Cooperativa"
        }
      }
    ],
    "invitaciones_establecimiento": [
      {
        "id": "uuid",
        "correo": "usuario@dominio.com",
        "invitador": "Nombre Invitador",
        "estado": "pendiente",
        "rol": {
          "rol": "ADMIN",
          "nombre": "Administrador de establecimiento"
        },
        "expiraEn": "2024-01-08T00:00:00.000Z",
        "establecimiento": {
          "id": "uuid",
          "nombre": "Establecimiento La Esperanza"
        },
        "organizacion": {
          "id": "uuid",
          "nombre": "Mi Cooperativa"
        }
      }
    ]
  }
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 401 | Usuario no autenticado |

---

### 2. Responder Invitación de Organización

**Método:** `POST`  
**Ruta:** `/perfil/invitaciones/org`  
**Middleware:** `authenticate`

#### Request Body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `idInvitacion` | string (UUID) | Sí | ID de la invitación |
| `accion` | string | Sí | `aceptada` o `rechazada` |

#### Ejemplo de Request

```json
{
  "idInvitacion": "uuid-de-invitacion",
  "accion": "aceptada"
}
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Invitaciones respondidas correctamente",
  "data": {
    "response": "aceptada"
  }
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Datos inválidos |
| 401 | Usuario no autenticado |
| 400 | Invitación no encontrada |
| 400 | La invitación ya ha sido respondida |
| 400 | La invitación ha expirado |
| 400 | No tienes permiso para responder esta invitación |

---

### 3. Responder Invitación de Establecimiento

**Método:** `POST`  
**Ruta:** `/perfil/invitaciones/est`  
**Middleware:** `authenticate`

#### Request Body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `idInvitacion` | string (UUID) | Sí | ID de la invitación |
| `accion` | string | Sí | `aceptada` o `rechazada` |
| `rol` | string | Sí | `ADMIN` o `EMPLOYEE` |

#### Ejemplo de Request

```json
{
  "idInvitacion": "uuid-de-invitacion",
  "accion": "aceptada",
  "rol": "ADMIN"
}
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Invitaciones respondidas correctamente",
  "data": {
    "response": "aceptada"
  }
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Datos inválidos |
| 401 | Usuario no autenticado |
| 400 | Invitación no encontrada |
| 400 | La invitación ya ha sido respondida |
| 400 | La invitación ha expirado |
| 400 | No tienes permiso para responder esta invitación |
| 400 | El usuario ya se encuentra en el establecimiento |

---

## Notas

- El endpoint `/perfil/invitaciones` devuelve dos arrays: `invitaciones_organizacion` y `invitaciones_establecimiento`.
- Cada invitación incluye un objeto `rol` con `rol` y `nombre`.
- Las respuestas se validan con `profileSchema`.
- Las respuestas siguen el formato estándar `ApiResponse`.
