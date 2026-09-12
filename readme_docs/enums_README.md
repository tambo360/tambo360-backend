# Enums - API Tambo360

Este documento centraliza los valores enumerados usados por Prisma, Zod y los endpoints de la API. Los valores deben enviarse exactamente como aparecen, respetando mayúsculas, minúsculas y guiones bajos.

## Organización y acceso

### `RolOrganizacion`
Define los permisos del usuario dentro de una organización.

| Valor | Uso |
|---|---|
| `ORG_OWNER` | Propietario de la organización; tiene el nivel de acceso más alto. |
| `ORG_ADMIN` | Administrador de la organización. |
| `MEMBER` | Miembro sin permisos administrativos globales. |

### `RolEstablecimiento`
Define los permisos del usuario dentro de un establecimiento.

| Valor | Uso |
|---|---|
| `OWNER` | Propietario del establecimiento. |
| `ADMIN` | Administrador del establecimiento. |
| `EMPLOYEE` | Empleado con permisos operativos. |

### `EstadoInvitacion`
Representa el estado de una invitación.

| Valor | Uso |
|---|---|
| `pendiente` | Invitación enviada y aún no resuelta. |
| `aceptada` | Invitación aceptada. |
| `rechazada` | Invitación rechazada. |

## Establecimiento y producción

### `TipoSeguimiento`
Define cómo se administran los animales del establecimiento.

| Valor | Uso |
|---|---|
| `RODEO` | Seguimiento agrupado por rodeos de alta producción, baja producción y vacas secas. |
| `RODEO_UNICO` | Seguimiento agrupado en los rodeos `UNICO_ORDENIE` y `UNICO_SECA`. |
| `INDIVIDUAL` | Seguimiento de cada animal mediante su propio registro. |

### `TipoRodeo`
Clasifica un rodeo dentro del modelo de seguimiento seleccionado.

| Valor | Uso |
|---|---|
| `ALTA_PRODUCCION` | Animales en alta producción. |
| `BAJA_PRODUCCION` | Animales en baja producción. |
| `VACAS_SECAS` | Vacas fuera de ordeñe. |
| `UNICO_ORDENIE` | Rodeo de ordeñe para `RODEO_UNICO`. |
| `UNICO_SECA` | Rodeo de vacas secas para `RODEO_UNICO`. |

### `TipoOrdenie`
Indica el método de ordeñe del establecimiento.

| Valor | Uso |
|---|---|
| `balde` | Ordeñe mediante balde. |
| `linea` | Ordeñe mediante línea. |
| `espina_de_pescado` | Sala de ordeñe tipo espina de pescado. |
| `rotativo` | Sala de ordeñe rotativa. |
| `manual` | Ordeñe manual. |
| `otro` | Método no contemplado en las opciones anteriores. |

### `VentaLeche`
Indica el canal de comercialización de la leche.

| Valor | Uso |
|---|---|
| `usina` | Venta a una usina. |
| `fabrica_propia` | Procesamiento en fábrica propia. |
| `cooperativa` | Venta mediante una cooperativa. |
| `varios` | Combinación de canales. |

### `GeneroAnimal`
Representa el género del animal.

| Valor | Uso |
|---|---|
| `HEMBRA` | Animal hembra. |
| `MACHO` | Animal macho. |

### `CategoriaAnimal`
Clasifica productivamente a un animal.

| Valor | Uso |
|---|---|
| `ORDENE` | Animal dentro del grupo productivo de ordeñe. |
| `SECAS` | Animal dentro del grupo de vacas secas. |

### `EstadoSanitarioAnimal`
Indica el estado sanitario del animal.

| Valor | Uso |
|---|---|
| `MASTITIS` | Animal con mastitis. |
| `TRATAMIENTO` | Animal bajo tratamiento sanitario. |
| `NORMAL` | Animal sin una condición sanitaria especial registrada. |

### `DestinoProduccion`
Indica qué ocurre con la producción de leche.

| Valor | Uso |
|---|---|
| `TANQUE` | Producción enviada al tanque. |
| `DESCARTE` | Producción descartada. |

### `TipoDestino`
Indica el destino comercial o productivo de productos o leche.

| Valor | Uso |
|---|---|
| `TANQUE_FRIO` | Tanque de frío. |
| `VENTA` | Venta directa. |
| `FABRICA_QUESOS` | Fábrica de quesos. |

## Productos, unidades y dinero

### `Categoria`
Clasifica un producto del inventario.

| Valor | Uso |
|---|---|
| `quesos` | Productos de tipo queso. |
| `leches` | Productos de tipo leche. |
| `yogures` | Productos de tipo yogur. |
| `otros` | Productos que no encajan en las categorías anteriores. |

### `Unidad`
Define la unidad de medida de una cantidad.

| Valor | Uso |
|---|---|
| `kg` | Kilogramos. |
| `litros` | Litros. |

### `Moneda`
Define la moneda de un importe.

| Valor | Uso |
|---|---|
| `USD` | Dólares estadounidenses. |
| `EUR` | Euros. |
| `ARS` | Pesos argentinos. |

### `TipoCosto`
Clasifica un costo directo asociado a un lote.

| Valor | Uso |
|---|---|
| `ALIMENTACION` | Alimentación del lote. |
| `SANIDAD` | Gastos sanitarios. |
| `MANO_OBRA` | Mano de obra. |
| `ENERGIA` | Energía. |
| `MANTENIMIENTO` | Mantenimiento. |
| `LOGISTICA` | Logística. |
| `OTRO` | Otro costo directo. |

### `TipoCostoGeneral`
Clasifica un costo general del establecimiento.

| Valor | Uso |
|---|---|
| `PERSONAL` | Sueldos y gastos de personal. |
| `ALIMENTACION` | Gastos de alimentación registrados como costo general. |
| `SERVICIOS` | Servicios contratados o consumidos. |
| `LOGISTICA` | Transporte y logística. |
| `MANTENIMIENTO` | Reparaciones y mantenimiento. |
| `VETERINARIO` | Servicios o insumos veterinarios. |
| `INMUEBLE` | Gastos vinculados al inmueble. |
| `OTRO` | Otro costo general. |

## Animales y movimientos

### `TipoMovimientoAnimal`
Indica la operación registrada sobre la población animal.

| Valor | Uso |
|---|---|
| `INGRESO` | Alta o incorporación de animales. |
| `EGRESO` | Baja o salida de animales. |
| `TRANSFERENCIA` | Movimiento entre rodeos. |

### `MotivoMovimientoAnimal`
Explica el motivo concreto de un movimiento.

| Valor | Uso |
|---|---|
| `INGRESO_COMPRA` | Ingreso por compra. |
| `INGRESO_NACIMIENTO` | Ingreso por nacimiento. |
| `EGRESO_VENTA` | Egreso por venta. |
| `EGRESO_DESCARTE` | Egreso por descarte. |
| `EGRESO_MUERTE` | Egreso por muerte. |
| `TRANSFERENCIA_BAJA_PRODUCCION` | Transferencia por baja producción. |
| `TRANSFERENCIA_ALTA_PRODUCCION` | Transferencia por alta producción. |
| `TRANSFERENCIA_SECADO` | Transferencia por secado. |
| `TRANSFERENCIA_CAMBIO_ESTADO` | Transferencia por cambio de estado. |
| `TRANSFERENCIA_OTRO` | Otro motivo de transferencia. |

## Mermas y alertas

### `TipoMerma`
Clasifica la causa de una pérdida o merma registrada.

| Valor | Uso |
|---|---|
| `MASTITIS` | Pérdida asociada a mastitis. |
| `ESTRES_CALORICO` | Pérdida asociada a estrés calórico. |
| `DERRAME_EN_ORDENE` | Derrame durante el ordeñe. |
| `FALLA_EQUIPO` | Pérdida por falla de equipo. |
| `RECHAZO_ANTIBIOTICOS` | Leche rechazada por antibióticos. |
| `ACIDOSIS_RUMINAL` | Pérdida asociada a acidosis ruminal. |
| `PERDIDA_EN_TRANSPORTE` | Pérdida durante transporte. |
| `VENCIMIENTO_PRODUCTO` | Producto vencido. |
| `DANO_POR_MANIPULACION` | Daño por manipulación. |
| `DISCREPANCIA_INVENTARIO` | Diferencia detectada en inventario. |
| `MERMA_DESCONOCIDA` | Merma sin causa identificada. |
| `OTRO` | Otra causa. |

### `NivelAlerta`
Indica la severidad de una alerta.

| Valor | Uso |
|---|---|
| `bajo` | Riesgo o impacto bajo. |
| `medio` | Riesgo o impacto medio. |
| `alto` | Riesgo o impacto alto. |

## Tokens

### `TipoToken`
Indica la finalidad de un token de usuario.

| Valor | Uso |
|---|---|
| `verificacion` | Verificar una cuenta o correo. |
| `recuperacion` | Recuperar el acceso a la cuenta. |
