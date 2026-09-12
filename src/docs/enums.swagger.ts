/**
 * @swagger
 * tags:
 *   - name: Enums
 *     description: Catálogo de valores enumerados utilizados por la API Tambo360
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Unidad:
 *       type: string
 *       enum: [kg, litros]
 *       description: Unidad de medida utilizada por productos e inventario.
 *     Moneda:
 *       type: string
 *       enum: [USD, EUR, ARS]
 *       description: Moneda de un importe monetario.
 *     Categoria:
 *       type: string
 *       enum: [quesos, leches, yogures, otros]
 *       description: Categoría de un producto.
 *     TipoToken:
 *       type: string
 *       enum: [verificacion, recuperacion]
 *       description: Finalidad de un token enviado al usuario.
 *     TipoMerma:
 *       type: string
 *       enum: [MASTITIS, ESTRES_CALORICO, DERRAME_EN_ORDENE, FALLA_EQUIPO, RECHAZO_ANTIBIOTICOS, ACIDOSIS_RUMINAL, PERDIDA_EN_TRANSPORTE, VENCIMIENTO_PRODUCTO, DANO_POR_MANIPULACION, DISCREPANCIA_INVENTARIO, MERMA_DESCONOCIDA, OTRO]
 *       description: Causa o clasificación de una merma.
 *     TipoCosto:
 *       type: string
 *       enum: [ALIMENTACION, SANIDAD, MANO_OBRA, ENERGIA, MANTENIMIENTO, LOGISTICA, OTRO]
 *       description: Tipo de costo directo asociado a un lote.
 *     RolOrganizacion:
 *       type: string
 *       enum: [ORG_OWNER, ORG_ADMIN, MEMBER]
 *       description: Nivel de acceso de un usuario dentro de una organización.
 *     RolEstablecimiento:
 *       type: string
 *       enum: [OWNER, ADMIN, EMPLOYEE]
 *       description: Nivel de acceso de un usuario dentro de un establecimiento.
 *     EstadoInvitacion:
 *       type: string
 *       enum: [pendiente, aceptada, rechazada]
 *       description: Estado de una invitación.
 *     TipoOrdenie:
 *       type: string
 *       enum: [balde, linea, espina_de_pescado, rotativo, manual, otro]
 *       description: Método de ordeñe del establecimiento.
 *     VentaLeche:
 *       type: string
 *       enum: [usina, fabrica_propia, cooperativa, varios]
 *       description: Canal o modalidad de venta de leche.
 *     GeneroAnimal:
 *       type: string
 *       enum: [HEMBRA, MACHO]
 *       description: Género biológico del animal.
 *     TipoRodeo:
 *       type: string
 *       enum: [ALTA_PRODUCCION, BAJA_PRODUCCION, VACAS_SECAS, UNICO_ORDENIE, UNICO_SECA]
 *       description: Clasificación operativa de un rodeo.
 *     TipoDestino:
 *       type: string
 *       enum: [TANQUE_FRIO, VENTA, FABRICA_QUESOS]
 *       description: Destino de una producción o producto lácteo.
 *     TipoCostoGeneral:
 *       type: string
 *       enum: [PERSONAL, ALIMENTACION, SERVICIOS, LOGISTICA, MANTENIMIENTO, VETERINARIO, INMUEBLE, OTRO]
 *       description: Categoría de un costo general del establecimiento.
 *     TipoSeguimiento:
 *       type: string
 *       enum: [RODEO, INDIVIDUAL, RODEO_UNICO]
 *       description: Modelo de seguimiento del ganado. Define si la gestión se realiza por rodeos o por animales individuales.
 *     CategoriaAnimal:
 *       type: string
 *       enum: [ORDENE, SECAS]
 *       description: Categoría productiva del animal.
 *     EstadoSanitarioAnimal:
 *       type: string
 *       enum: [MASTITIS, TRATAMIENTO, NORMAL]
 *       description: Estado sanitario actual del animal.
 *     DestinoProduccion:
 *       type: string
 *       enum: [TANQUE, DESCARTE]
 *       description: Destino de la producción obtenida en un ordeñe.
 *     TipoMovimientoAnimal:
 *       type: string
 *       enum: [INGRESO, EGRESO, TRANSFERENCIA]
 *       description: Tipo de movimiento de animales registrado.
 *     MotivoMovimientoAnimal:
 *       type: string
 *       enum: [INGRESO_COMPRA, INGRESO_NACIMIENTO, EGRESO_VENTA, EGRESO_DESCARTE, EGRESO_MUERTE, TRANSFERENCIA_BAJA_PRODUCCION, TRANSFERENCIA_ALTA_PRODUCCION, TRANSFERENCIA_SECADO, TRANSFERENCIA_CAMBIO_ESTADO, TRANSFERENCIA_OTRO]
 *       description: Motivo específico de un movimiento de animales.
 *     NivelAlerta:
 *       type: string
 *       enum: [bajo, medio, alto]
 *       description: Nivel de severidad de una alerta.
 */
