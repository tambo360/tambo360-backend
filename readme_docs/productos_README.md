# Documentación de Endpoints - Productos

## Descripción
Esta API permite consultar la lista de productos disponibles en el sistema.

## Autenticación y Autorización
- Requiere autenticación JWT
- Requiere contexto de organización válido
- Requiere acceso a la organización

## Headers Requeridos

| Header | Tipo | Descripción |
|--------|------|-------------|
| `Authorization` | string | Token JWT de autenticación |
| `x-organizacion-id` | string (UUID) | ID de la organización |

---

## Endpoints

### 1. Listar Productos

**Método:** `GET`  
**Ruta:** `/productos`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`

#### Request
No requiere parámetros ni body.

#### Ejemplo de Request

```bash
GET /productos
Authorization: Bearer jwt_token_here
x-organizacion-id: 550e8400-e29b-41d4-a716-446655440000
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Productos obtenidos correctamente",
  "data": [
    {
      "idProducto": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "Producto 1",
      "categoria": "Categoría A"
    },
    {
      "idProducto": "550e8400-e29b-41d4-a716-446655440001",
      "nombre": "Producto 2",
      "categoria": "Categoría B"
    }
  ]
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Acceso a organización no válido |
| 401 | Usuario no autenticado |
| 403 | Acceso a organización no válido |

---

## Notas

- Retorna solo los productos asociados a la organización del usuario
- Las respuestas siguen el formato estándar `ApiResponse`