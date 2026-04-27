# Documentación de Endpoints - Organización

## Descripción
Esta API permite gestionar organizaciones dentro del sistema. Requiere autenticación para todos los endpoints.

## Autenticación
Todos los endpoints requieren un token de autenticación válido en el header `Authorization`.

---

## Endpoints

### 1. Crear Organización

**Método:** `POST`  
**Ruta:** `/organizacion`  
**Middleware:** `authenticate`

#### Request Body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `nombre` | string | Sí | Nombre de la organización |
| `rol` | enum (RolOrganizacion) | Sí | Rol del usuario en la organización |

#### Ejemplo de Request

```json
{
  "nombre": "Mi Cooperativa",
  "rol": "duenio"
}
```

#### Response (201 - Creado)

```json
{
  "success": true,
  "message": "Organización creada correctamente",
  "data": {
    "id": "uuid",
    "nombre": "Mi Cooperativa",
    "rol": "duenio",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Datos inválidos |
| 401 | Usuario no autenticado |

---

### 2. Obtener Organizaciones del Usuario

**Método:** `GET`  
**Ruta:** `/organizacion`  
**Middleware:** `authenticate`

#### Request
No requiere body. El `userId` se obtiene del token de autenticación.

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Organizaciones obtenidas correctamente",
  "data": [
    {
      "id": "uuid",
      "nombre": "Organización 1",
      "rol": "duenio"
    },
    {
      "id": "uuid",
      "nombre": "Organización 2",
      "rol": "cooperativa"
    }
  ]
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 401 | Usuario no autenticado |

---

### 3. Obtener Organización por ID

**Método:** `GET`  
**Ruta:** `/organizacion/:id`  
**Middleware:** `authenticate`

#### Parámetros de Ruta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (UUID) | ID de la organización |

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Organización obtenida correctamente",
  "data": {
    "id": "uuid",
    "nombre": "Mi Organización",
    "rol": "duenio",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 401 | Usuario no autenticado |
| 404 | Organización no encontrada |

---

## Enums

### RolOrganizacion

| Valor | Descripción |
|-------|-------------|
| `duenio` | Owner/Propietario de la organización |
| `cooperativa` | Miembro cooperativa |
| `administrador` | Administrador de la organización |
| `miembro` | Miembro regular |

---

## Notas

- Todos los endpoints requieren autenticación mediante JWT
- El `userId` se extrae automáticamente del token de autenticación
- Las respuestas siguen el formato estándar `ApiResponse`