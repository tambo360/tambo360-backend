# Documentación de Endpoints - Autenticación

## Descripción
Esta API maneja toda la autenticación y gestión de usuarios del sistema Tambo360, incluyendo registro, login, verificación de email y recuperación de contraseña.

## Autenticación y Autorización
- Los endpoints marcados con 🔒 requieren autenticación JWT
- Los endpoints marcados con ⏱️ tienen rate limiting aplicado
- Los tokens JWT se devuelven en el response y también se setean como cookies httpOnly

---

## Endpoints

### 1. Registrar Usuario

**Método:** `POST`  
**Ruta:** `/auth/crear-cuenta`  
**Middleware:** Rate limiting (⏱️)

#### Request Body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `nombre` | string | Sí | Nombre completo (5-50 caracteres) |
| `correo` | string | Sí | Email válido (5-50 caracteres) |
| `contraseña` | string | Sí | Contraseña segura (ver requisitos abajo) |

#### Requisitos de Contraseña

- Mínimo 8 caracteres, máximo 50
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número
- Al menos un carácter especial (@$!%*?&)

#### Ejemplo de Request

```json
{
  "nombre": "Juan Pérez",
  "correo": "juan@example.com",
  "contraseña": "MiPass123!"
}
```

#### Response (201 - Creado)

```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "idUsuario": "uuid",
    "nombre": "Juan Pérez",
    "correo": "juan@example.com",
    "verificado": false,
    "fechaCreacion": "2026-05-15T12:00:00.000Z"
  }
}
```

---

### 2. Iniciar Sesión

**Método:** `POST`  
**Ruta:** `/auth/iniciar-sesion`  
**Middleware:** Rate limiting (⏱️)

#### Request Body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `correo` | string | Sí | Email del usuario |
| `contraseña` | string | Sí | Contraseña del usuario |

#### Ejemplo de Request

```json
{
  "correo": "juan@example.com",
  "contraseña": "MiPass123!"
}
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "nombre": "Juan Pérez",
      "correo": "juan@example.com",
      "idUsuario": "uuid",
      "verificado": true,
      "fechaCreacion": "2026-05-15T12:00:00.000Z",
      "organizaciones": [...]
    },
    "token": "jwt_token_here"
  }
}
```

---

### 3. Verificar Email

**Método:** `POST`  
**Ruta:** `/auth/verificar-email`  
**Middleware:** Rate limiting (⏱️)

#### Request Body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `token` | string | Sí | Token de verificación enviado por email |

#### Ejemplo de Request

```json
{
  "token": "verification_token_here"
}
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Email verificado exitosamente",
  "data": {
    "user": {
      "nombre": "Juan Pérez",
      "correo": "juan@example.com",
      "idUsuario": "uuid",
      "verificado": true,
      "fechaCreacion": "2026-05-15T12:00:00.000Z",
      "organizaciones": [...]
    }
  }
}
```

---

### 4. Reenviar Email de Verificación

**Método:** `POST`  
**Ruta:** `/auth/reenviar-verificacion`  
**Middleware:** Rate limiting (⏱️)

#### Request Body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `correo` | string | Sí | Email del usuario |

#### Ejemplo de Request

```json
{
  "correo": "juan@example.com"
}
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Correo de verificación reenviado exitosamente",
  "data": null
}
```

---

### 5. Solicitar Restablecimiento de Contraseña

**Método:** `POST`  
**Ruta:** `/auth/contrasena-olvidada`  
**Middleware:** Rate limiting (⏱️)

#### Request Body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `correo` | string | Sí | Email del usuario |

#### Ejemplo de Request

```json
{
  "correo": "juan@example.com"
}
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Instrucciones para restablecer la contraseña enviadas al correo",
  "data": null
}
```

---

### 6. Verificar Token de Restablecimiento

**Método:** `POST`  
**Ruta:** `/auth/verificar-restablecer-contrasena`  
**Middleware:** Rate limiting (⏱️)

#### Request Body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `token` | string | Sí | Token de restablecimiento recibido por email |

#### Ejemplo de Request

```json
{
  "token": "reset_token_here"
}
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Token de restablecimiento válido",
  "data": null
}
```

---

### 7. Restablecer Contraseña

**Método:** `POST`  
**Ruta:** `/auth/restablecer-contrasena`  
**Middleware:** Rate limiting (⏱️)

#### Request Body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `token` | string | Sí | Token de restablecimiento válido |
| `nuevaContraseña` | string | Sí | Nueva contraseña (mismos requisitos que registro) |

#### Ejemplo de Request

```json
{
  "token": "reset_token_here",
  "nuevaContraseña": "NuevaPass123!"
}
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente",
  "data": null
}
```

---

### 8. Obtener Datos del Usuario Actual

**Método:** `GET`  
**Ruta:** `/auth/me`  
**Middleware:** Autenticación requerida (🔒)

#### Headers Requeridos

| Header | Tipo | Descripción |
|--------|------|-------------|
| `Authorization` | string | Token JWT de autenticación |

#### Ejemplo de Request

```bash
GET /auth/me
Authorization: Bearer jwt_token_here
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Usuario obtenido exitosamente",
  "data": {
    "idUsuario": "uuid",
    "nombre": "Juan Pérez",
    "correo": "juan@example.com",
    "verificado": true,
    "fechaCreacion": "2026-05-15T12:00:00.000Z",
    "organizaciones": [...]
  }
}
```

---

### 9. Cerrar Sesión

**Método:** `POST`  
**Ruta:** `/auth/logout`  
**Middleware:** Autenticación requerida (🔒)

#### Headers Requeridos

| Header | Tipo | Descripción |
|--------|------|-------------|
| `Authorization` | string | Token JWT de autenticación |

#### Ejemplo de Request

```bash
POST /auth/logout
Authorization: Bearer jwt_token_here
```

#### Response (200 - OK)

```json
{
  "statusCode": 200,
  "message": "Sesión cerrada correctamente",
  "success": true
}
```

---

## Posibles Errores Comunes

| Código | Mensaje |
|--------|---------|
| 400 | Todos los campos son obligatorios |
| 400 | Email y contraseña son obligatorios |
| 400 | Token de verificación es obligatorio |
| 400 | Correo es obligatorio |
| 400 | Token es obligatorio |
| 400 | Nueva contraseña es obligatoria |
| 400 | Token de verificación inválido o expirado |
| 400 | Token de restablecimiento inválido o expirado |
| 400 | Errores de validación específicos (formato email, longitud, etc.) |
| 401 | No autenticado |
| 404 | Usuario no encontrado |
| 429 | Demasiadas solicitudes (rate limiting) |

---

## Notas

- Los tokens JWT expiran en 24 horas
- Los tokens se envían tanto en el response JSON como en cookies httpOnly
- Los endpoints de registro, login y verificación tienen rate limiting para prevenir abuso
- Las contraseñas deben cumplir con requisitos de seguridad estrictos
- El email debe ser verificado antes de poder usar todas las funcionalidades
- Las respuestas siguen el formato estándar `ApiResponse`