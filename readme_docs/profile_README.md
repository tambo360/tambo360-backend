# Documentación de Endpoints - Perfil

## Descripción
Esta API permite al usuario consultar sus invitaciones pendientes. Requiere autenticación.

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
        "estado": "PENDIENTE",
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
        "estado": "PENDIENTE",
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

## Notas

- El endpoint devuelve dos arrays: `invitaciones_organizacion` y `invitaciones_establecimiento`.
- La búsqueda se realiza usando el correo del usuario autenticado.
- Las respuestas siguen el formato estándar `ApiResponse`.
