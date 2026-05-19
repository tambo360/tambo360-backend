# Documentación de Endpoints - Dashboard

## Descripción
Esta API expone métricas de dashboard para un establecimiento, incluyendo los costos agrupados por categoría durante el mes actual.

## Autenticación y Autorización
- Requiere autenticación JWT
- Requiere contexto de organización (`orgContext`)
- Requiere acceso a la organización (`requireOrgAccess`)
- Requiere contexto de establecimiento (`estContext`)
- Requiere acceso al establecimiento (`establecimientoRequireOrgAccess`)
- Requiere rol de establecimiento `ADMIN` o `OWNER`

## Headers Requeridos

| Header | Tipo | Descripción |
|--------|------|-------------|
| `Authorization` | string | Token JWT de autenticación |
| `x-organizacion-id` | string (UUID) | ID de la organización |
| `x-establecimiento-id` | string (UUID) | ID del establecimiento |

---

## Endpoints

### 1. Costos por Categoría

**Método:** `GET`  
**Ruta:** `/dashboard/costos`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`, `requireRoles({est: [RolEstablecimiento.ADMIN, RolEstablecimiento.OWNER]})`

#### Request
No requiere body ni query params.

#### Ejemplo de Request

```bash
GET /dashboard/costos
Authorization: Bearer jwt_token_here
x-organizacion-id: 550e8400-e29b-41d4-a716-446655440000
x-establecimiento-id: 550e8400-e29b-41d4-a716-446655440001
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Costos por categoría obtenidos correctamente",
  "data": [
    {
      "categoria": "insumos_basicos",
      "moneda": "ARS",
      "total": 12000.5
    },
    {
      "categoria": "leche_cruda",
      "moneda": "ARS",
      "total": 8500.0
    }
  ]
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | No se pudo determinar el establecimiento |
| 401 | Usuario no autenticado |
| 403 | Permisos insuficientes |

---

## Notas

- La consulta agrupa los costos directos del mes actual por `tipoCosto` y `moneda`
- El resultado incluye el total acumulado por categoría y moneda
- Las fechas se calculan automáticamente para el mes en curso
