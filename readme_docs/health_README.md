# Documentación de Endpoints - Health Check

## Descripción
Endpoint para verificar el estado de salud del sistema. No requiere autenticación.

## Autenticación y Autorización
- No requiere autenticación
- No requiere headers especiales

---

## Endpoints

### 1. Verificar Estado del Sistema

**Método:** `GET`  
**Ruta:** `/health`  
**Middleware:** Ninguno

#### Request
No requiere body ni parámetros.

#### Ejemplo de Request

```bash
GET /health
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "El sistema funciona correctamente",
  "data": {
    "status": "ok",
    "timestamp": "2026-05-15T12:00:00.000Z",
    "uptime": 123.456
  }
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 500 | Fallo en el chequeo de salud |

---

## Notas

- Este endpoint se utiliza para monitoreo del sistema
- Retorna información básica sobre el estado del servidor
- Las respuestas siguen el formato estándar `ApiResponse`