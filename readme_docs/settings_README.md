# Configuración - API Tambo360

Esta sección documenta los endpoints de configuración del backend, orientados a operaciones administrativas sobre rodeos del establecimiento autenticado.

## Base

- Prefijo: `/conf`
- Requiere autenticación JWT y contexto de organización/establecimiento
- Los endpoints están protegidos por los middlewares de autenticación y contexto multi-tenant

## 1. Transferir rodeos entre establecimientos

**Método:** `POST`  
**Ruta:** `/conf/rodeo/transferir`

### Headers

- `Authorization: Bearer <token>`
- `x-organizacion-id: <id-organizacion>`
- `x-establecimiento-id: <id-establecimiento>`

### Body

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---:|---|
| `rodeoOrigen` | string (UUID) | Sí | ID del rodeo origen |
| `rodeoDestino` | string (UUID) | Sí | ID del rodeo destino |
| `motivo` | string | Sí | Motivo de la transferencia. Valores permitidos: `TRANSFERENCIA_BAJA_PRODUCCION`, `TRANSFERENCIA_ALTA_PRODUCCION`, `TRANSFERENCIA_SECADO`, `TRANSFERENCIA_CAMBIO_ESTADO`, `TRANSFERENCIA_OTRO` |
| `cantidad` | integer | Sí | Cantidad de vacas a transferir. Debe ser mayor a 0 |
| `observacion` | string | No | Observación opcional de hasta 255 caracteres |

### Ejemplo de Request

```bash
POST /api/conf/rodeo/transferir
Authorization: Bearer jwt_token_here
x-organizacion-id: 550e8400-e29b-41d4-a716-446655440001
x-establecimiento-id: 550e8400-e29b-41d4-a716-446655440002
Content-Type: application/json
```

```json
{
  "rodeoOrigen": "550e8400-e29b-41d4-a716-446655440010",
  "rodeoDestino": "550e8400-e29b-41d4-a716-446655440011",
  "motivo": "TRANSFERENCIA_BAJA_PRODUCCION",
  "cantidad": 3,
  "observacion": "Transferencia por baja producción"
}
```

### Response (200 - OK)

```json
{
  "success": true,
  "message": "Transferencia de rodeo realizada correctamente",
  "data": {
    "idMovRodeo": "550e8400-e29b-41d4-a716-446655440100",
    "idConfiguracion": "550e8400-e29b-41d4-a716-446655440200",
    "tipo": "TRANSFERENCIA",
    "motivo": "TRANSFERENCIA_BAJA_PRODUCCION",
    "rodeoOrigen": "550e8400-e29b-41d4-a716-446655440010",
    "rodeoDestino": "550e8400-e29b-41d4-a716-446655440011",
    "cantidad": 3,
    "usuarioId": "550e8400-e29b-41d4-a716-446655440300",
    "observacion": "Transferencia por baja producción",
    "fechaCreacion": "2026-08-10T12:00:00.000Z"
  }
}
```

### Posibles Errores

| Código | Mensaje |
|---|---|
| 400 | Datos de transferencia inválidos |
| 400 | El rodeo de origen y destino no pueden ser el mismo |
| 400 | Cantidad a transferir mayor a la cantidad disponible en el rodeo de origen |
| 401 | Usuario no autenticado |
| 403 | Establecimiento no autorizado |
| 404 | Rodeo de origen, rodeo de destino o configuración no encontrados |
