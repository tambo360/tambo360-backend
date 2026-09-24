# Documentación de Endpoints - Mermas

## Descripción
La API de mermas permite registrar, consultar, editar y eliminar pérdidas asociadas a lotes de producción, y consultar el catálogo de tipos disponibles.

## Autenticación
- Requiere autenticación (cookie de sesión).
- Todos los endpoints, **excepto `/mermas/tipos`**, requieren contexto de organización y establecimiento (header `x-establecimiento-id`).

## Endpoints

### 1. Obtener tipos de merma

**Método:** `GET`
**Ruta:** `/mermas/tipos`

#### Request
No requiere body ni header de establecimiento.

#### Ejemplo de request

```bash
GET /mermas/tipos
```

#### Response (200 - OK)

```json
{
  "statusCode": 200,
  "message": "Tipos de merma obtenidos correctamente",
  "data": [
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
}
```

#### Posibles errores

| Código | Mensaje |
|--------|---------|
| 401 | Usuario no autenticado |

---

### 2. Crear merma

**Método:** `POST`
**Ruta:** `/mermas`

#### Request

```bash
POST /mermas
x-establecimiento-id: <id-establecimiento>
Content-Type: application/json

{
  "id_lote": "uuid-del-lote",
  "tipoMerma": "MASTITIS",
  "cantidad": 25,
  "observaciones": "Detectado en el ordeñe de la mañana"
}
```

> ⚠️ El campo del lote se llama **`id_lote`** (con guion bajo), no `idLote`. El resto de los campos van en camelCase.

`observaciones` es opcional.

#### Response (201 - Created)

```json
{
  "statusCode": 201,
  "message": "Merma registrada correctamente",
  "data": {
    "idMerma": "uuid-generado",
    "tipo": "MASTITIS",
    "cantidad": 25,
    "observacion": "Detectado en el ordeñe de la mañana",
    "fechaCreacion": "2026-09-20T10:00:00.000Z",
    "idLote": "uuid-del-lote"
  }
}
```

#### Reglas de negocio
- El lote debe existir y pertenecer al establecimiento del usuario autenticado.
- El lote debe estar en estado editable (INCOMPLETO).
- `cantidad` debe ser mayor a 0.
- `tipoMerma` debe ser uno de los valores válidos del catálogo (ver `/mermas/tipos`).
- La suma de todas las mermas del lote no puede superar la cantidad producida del lote.

#### Posibles errores

| Código | Mensaje |
|--------|---------|
| 400 | Datos inválidos (cantidad, tipo de merma, o body mal formado) |
| 400 | No se pudo determinar el establecimiento |
| 401 | Usuario no autenticado |
| 403 | El lote no pertenece al establecimiento |
| 409 | La merma supera la producción del lote |

---

### 3. Listar mermas

**Método:** `GET`
**Ruta:** `/mermas`

#### Query params opcionales
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id_lote` | string (uuid) | Filtra las mermas de un lote específico |

#### Ejemplo de request

```bash
GET /mermas?id_lote=uuid-del-lote
x-establecimiento-id: <id-establecimiento>
```

#### Response (200 - OK)

```json
{
  "statusCode": 200,
  "data": [
    {
      "idMerma": "uuid-1",
      "tipo": "MASTITIS",
      "cantidad": 25,
      "observacion": "Detectado en el ordeñe de la mañana",
      "fechaCreacion": "2026-09-20T10:00:00.000Z",
      "idLote": "uuid-del-lote",
      "lote": {
        "idLote": "uuid-del-lote",
        "numeroLote": 12,
        "fechaProduccion": "2026-09-20T08:00:00.000Z"
      }
    }
  ]
}
```

Ordenado por `fechaCreacion` descendente (la más reciente primero).

#### Posibles errores

| Código | Mensaje |
|--------|---------|
| 400 | No se pudo determinar el establecimiento |
| 401 | Usuario no autenticado |

---

### 4. Obtener merma por ID

**Método:** `GET`
**Ruta:** `/mermas/:id`

#### Ejemplo de request

```bash
GET /mermas/<id-merma>
x-establecimiento-id: <id-establecimiento>
```

#### Response (200 - OK)

```json
{
  "statusCode": 200,
  "data": {
    "idMerma": "uuid-1",
    "tipo": "MASTITIS",
    "cantidad": 25,
    "observacion": "Detectado en el ordeñe de la mañana",
    "fechaCreacion": "2026-09-20T10:00:00.000Z",
    "idLote": "uuid-del-lote",
    "lote": {
      "idLote": "uuid-del-lote",
      "numeroLote": 12,
      "fechaProduccion": "2026-09-20T08:00:00.000Z",
      "idEstablecimiento": "uuid-establecimiento"
    }
  }
}
```

#### Posibles errores

| Código | Mensaje |
|--------|---------|
| 400 | No se pudo determinar el establecimiento |
| 401 | Usuario no autenticado |
| 404 | Merma no encontrada (no existe, o no pertenece al establecimiento) |

---

### 5. Editar merma

**Método:** `PUT`
**Ruta:** `/mermas/:id`

#### Request

```bash
PUT /mermas/<id-merma>
x-establecimiento-id: <id-establecimiento>
Content-Type: application/json

{
  "tipoMerma": "FALLA_EQUIPO",
  "cantidad": 30,
  "observaciones": "Corregido tras revisión"
}
```

Todos los campos son opcionales — se actualiza solo lo que se envía. `id_lote` **no se puede modificar** (la merma queda asociada al lote con el que se creó).

#### Response (200 - OK)

```json
{
  "statusCode": 200,
  "message": "Merma actualizada correctamente",
  "data": {
    "idMerma": "uuid-1",
    "tipo": "FALLA_EQUIPO",
    "cantidad": 30,
    "observacion": "Corregido tras revisión",
    "fechaCreacion": "2026-09-20T10:00:00.000Z",
    "idLote": "uuid-del-lote"
  }
}
```

#### Reglas de negocio
- El lote asociado debe seguir en estado editable (INCOMPLETO).
- Si se envía `cantidad`, debe ser mayor a 0 y la suma con las demás mermas del lote no puede superar la producción del lote.
- Si se envía `tipoMerma`, debe ser un valor válido del catálogo.

#### Posibles errores

| Código | Mensaje |
|--------|---------|
| 400 | Datos inválidos (cantidad, tipo de merma, o body mal formado) |
| 400 | No se pudo determinar el establecimiento |
| 401 | Usuario no autenticado |
| 404 | Merma no encontrada (no existe, o no pertenece al establecimiento) |
| 409 | La merma supera la producción del lote |

---

### 6. Eliminar merma

**Método:** `DELETE`
**Ruta:** `/mermas/:id`

#### Ejemplo de request

```bash
DELETE /mermas/<id-merma>
x-establecimiento-id: <id-establecimiento>
```

#### Response (200 - OK)

```json
{
  "statusCode": 200,
  "message": "Merma eliminada correctamente",
  "data": null
}
```

#### Reglas de negocio
- La merma debe existir.
- El lote asociado debe existir y pertenecer al establecimiento del usuario autenticado.
- El lote debe seguir en estado editable (INCOMPLETO).

#### Posibles errores

| Código | Mensaje |
|--------|---------|
| 400 | No se pudo determinar el establecimiento |
| 401 | Usuario no autenticado |
| 404 | Merma no encontrada |

## Notas
- El campo `value` de `/mermas/tipos` contiene el enum interno del tipo de merma (`TipoMerma`).
- El campo `label` contiene el texto legible para la UI.
- Todos los endpoints (salvo `/tipos`) requieren el header `x-establecimiento-id` y roles OWNER, ADMIN o EMPLOYEE del establecimiento.
- El nombre del campo de lote en el body es **`id_lote`** (snake_case), a diferencia del resto de los campos que usan camelCase.