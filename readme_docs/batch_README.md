# Documentación de Endpoints - Lotes

## Descripción
Esta API permite gestionar lotes de producción dentro de un establecimiento. Requiere autenticación y acceso a un establecimiento válido.

## Autenticación y Autorización
- Todos los endpoints requieren token de autenticación (`authenticate`)
- Requieren contexto de organización (`orgContext`)
- Requieren acceso a la organización (`requireOrgAccess`)
- Requieren contexto de establecimiento (`estContext`)
- Requieren acceso al establecimiento (`establecimientoRequireOrgAccess`)

## Headers Requeridos

| Header | Tipo | Descripción |
|--------|------|-------------|
| `Authorization` | string | Token JWT de autenticación |
| `x-organizacion-id` | string (UUID) | ID de la organización |
| `x-establecimiento-id` | string (UUID) | ID del establecimiento |

---

## Endpoints

### 1. Crear Lote

**Método:** `POST`  
**Ruta:** `/lote`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`

#### Request Body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `idLote` | string (UUID) | Sí | ID único del lote |
| `idProducto` | string (UUID) | Sí | ID del producto a producir |
| `cantidad` | number | Sí | Cantidad a producir (mayor a 0) |
| `fechaProduccion` | string | Sí | Fecha en formato dd/mm/aaaa (entre hoy y 7 días anteriores) |
| `estado` | boolean | No | Estado del lote (opcional) |
| `idRaza` | string (UUID) | Sí | ID de la raza utilizada |
| `cantRaza` | number | Sí | Cantidad de la raza (mayor a 0) |

#### Ejemplo de Request

```json
{
  "idLote": "550e8400-e29b-41d4-a716-446655440000",
  "idProducto": "550e8400-e29b-41d4-a716-446655440001",
  "cantidad": 100,
  "fechaProduccion": "15/05/2026",
  "estado": true,
  "idRaza": "550e8400-e29b-41d4-a716-446655440002",
  "cantRaza": 50
}
```

#### Response (201 - Creado)

```json
{
  "success": true,
  "message": "Lote creado correctamente",
  "data": {
    "idLote": "550e8400-e29b-41d4-a716-446655440000",
    "idProducto": "550e8400-e29b-41d4-a716-446655440001",
    "cantidad": 100,
    "fechaProduccion": "2026-05-15T12:00:00.000Z",
    "estado": true,
    "idRaza": "550e8400-e29b-41d4-a716-446655440002",
    "cantRaza": 50,
    "idEstablecimiento": "uuid-establecimiento"
  }
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Acceso a organización no válido |
| 400 | Acceso a establecimiento no válido |
| 400 | Datos inválidos (detalles específicos de validación) |
| 401 | Usuario no autenticado |

---

## Notas

- La fecha de producción debe estar en formato `dd/mm/aaaa`
- La fecha debe estar entre la fecha actual y 7 días anteriores
- Las respuestas siguen el formato estándar `ApiResponse`