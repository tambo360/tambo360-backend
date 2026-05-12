# Documentación de Endpoints - Razas

## Descripción
Esta API permite gestionar razas de ganado dentro de una organización. Requiere autenticación y acceso a una organización válida.

## Autenticación y Autorización
- Todos los endpoints requieren token de autenticación (`authenticate`)
- Requieren contexto de organización (`orgContext`)
- Requieren acceso a la organización (`requireOrgAccess`)

## Headers Requeridos

| Header | Tipo | Descripción |
|--------|------|-------------|
| `Authorization` | string | Token JWT de autenticación |
| `x-organizacion-id` | string (UUID) | ID de la organización |

---

## Endpoints

### 1. Obtener Todas las Razas

**Método:** `GET`  
**Ruta:** `/razas`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`

#### Request
No requiere body. Las razas se filtran por organización.

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Razas obtenidas correctamente",
  "data": [
    {
      "idRaza": "uuid",
      "nombre": "Holando",
      "nombreNormalizado": "holando",
      "esSistema": true,
      "idOrganizacion": null
    },
    {
      "idRaza": "uuid",
      "nombre": "Jersey",
      "nombreNormalizado": "jersey",
      "esSistema": true,
      "idOrganizacion": null
    },
    {
      "idRaza": "uuid",
      "nombre": "Raza Personalizada",
      "nombreNormalizado": "raza personalizada",
      "esSistema": false,
      "idOrganizacion": "uuid-organizacion"
    }
  ]
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Acceso a organización no válido |
| 401 | Usuario no autenticado |

---

## Notas

- Devuelve razas del sistema (`esSistema: true`) y razas específicas de la organización
- Las razas del sistema tienen `idOrganizacion: null`
- Las razas personalizadas tienen `idOrganizacion` igual al ID de la organización
- Las respuestas siguen el formato estándar `ApiResponse`