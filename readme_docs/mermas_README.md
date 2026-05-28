# Documentación de Endpoints - Mermas

## Descripción
La API de mermas permite gestionar pérdidas asociadas a lotes y consultar el catálogo de tipos disponibles.

## Autenticación
- Requiere autenticación JWT.
- No requiere contexto de organización ni establecimiento.

## Endpoints

### 1. Obtener tipos de merma

**Método:** `GET`  
**Ruta:** `/mermas/tipos`

#### Request
No requiere body.

#### Ejemplo de request

```bash
GET /mermas/tipos
Authorization: Bearer <token>
```

#### Response (200 - OK)

```json
[
  {
    "value": "MASTITIS",
    "label": "Mastitis"
  },
  {
    "value": "ESTRES_CALORICO",
    "label": "Estrés calórico"
  },
  {
    "value": "OTRO",
    "label": "Otro"
  }
]
```

#### Posibles errores

| Código | Mensaje |
|--------|---------|
| 401 | Usuario no autenticado |

### 2. Eliminar merma

**Método:** `DELETE`  
**Ruta:** `/mermas/:id`

#### Request

```bash
DELETE /mermas/<id-merma>
Authorization: Bearer <token>
```

#### Response (204 - No Content)
Sin body.

#### Reglas de negocio
- La merma debe existir.
- El lote asociado debe existir.
- El lote asociado debe pertenecer al establecimiento del usuario autenticado.
- El lote debe seguir en estado `INCOMPLETO`.
- Solo pueden eliminar roles de establecimiento autorizados.

#### Posibles errores

| Código | Mensaje |
|--------|---------|
| 401 | Usuario no autenticado |
| 403 | No tiene permisos |
| 404 | Merma no encontrada o lote no encontrado |
| 409 | El lote asociado está completo |

## Notas
- El campo `value` contiene el enum interno del tipo de merma.
- El campo `label` contiene el texto legible para la UI.
