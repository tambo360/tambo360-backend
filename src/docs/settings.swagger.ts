/**
 * @swagger
 * tags:
 *   - name: Configuración
 *     description: Operaciones de configuración y administración de movimientos de animales (altas, bajas y transferencias)
 */

/**
 * @swagger
 * /conf/animal:
 *   post:
 *     summary: Dar de alta animales en el establecimiento
 *     description: Registra la incorporación de animales. Soporta dos modos según tipoSeguimiento - RODEO/RODEO_UNICO (incrementa cantidad en rodeo) o INDIVIDUAL (crea registros de animales)
 *     tags: [Configuración]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [tipoSeguimiento, rodeoDestino, motivo, cantidad]
 *                 properties:
 *                   tipoSeguimiento:
 *                     type: string
 *                     enum: [RODEO, RODEO_UNICO]
 *                     example: "RODEO"
 *                   rodeoDestino:
 *                     type: string
 *                     format: uuid
 *                     example: "550e8400-e29b-41d4-a716-446655440010"
 *                   motivo:
 *                     type: string
 *                     enum: [INGRESO_COMPRA, INGRESO_NACIMIENTO]
 *                     example: "INGRESO_COMPRA"
 *                   cantidad:
 *                     type: integer
 *                     minimum: 1
 *                     example: 5
 *                   observacion:
 *                     type: string
 *                     maxLength: 255
 *                     example: "Compra de vacas de lechería"
 *               - type: object
 *                 required: [tipoSeguimiento, animales, motivo, cantidad]
 *                 properties:
 *                   tipoSeguimiento:
 *                     type: string
 *                     enum: [INDIVIDUAL]
 *                     example: "INDIVIDUAL"
 *                   motivo:
 *                     type: string
 *                     enum: [INGRESO_COMPRA, INGRESO_NACIMIENTO]
 *                     example: "INGRESO_NACIMIENTO"
 *                   cantidad:
 *                     type: integer
 *                     minimum: 1
 *                     example: 2
 *                   animales:
 *                     type: array
 *                     minItems: 1
 *                     items:
 *                       type: object
 *                       required: [categoria, estado]
 *                       properties:
 *                         codigo:
 *                           type: string
 *                           example: "A-001"
 *                         nombre:
 *                           type: string
 *                           example: "Vaca Rosa"
 *                         categoria:
 *                           type: string
 *                           enum: [ORDENE, SECAS, PREPARTO]
 *                           example: "ORDENE"
 *                         estado:
 *                           type: string
 *                           enum: [MATITIS, TRATAMIENTO, PREPARTO, DESCARTE]
 *                           example: "PREPARTO"
 *                         fechaNacimiento:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T00:00:00.000Z"
 *                   observacion:
 *                     type: string
 *                     maxLength: 255
 *                     example: "Nacimientos en el rodeo"
 *     responses:
 *       200:
 *         description: Alta de animales realizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Alta de animales realizada correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     idMovimiento:
 *                       type: string
 *                       format: uuid
 *                     idConfiguracion:
 *                       type: string
 *                       format: uuid
 *                     tipo:
 *                       type: string
 *                       example: "INGRESO"
 *                     motivo:
 *                       type: string
 *                       example: "INGRESO_COMPRA"
 *                     cantidad:
 *                       type: integer
 *                       example: 5
 *                     usuarioId:
 *                       type: string
 *                       format: uuid
 *                     observacion:
 *                       type: string
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                     rodeoDestino:
 *                       type: string
 *                       format: uuid
 *                     animales:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Datos de ingreso inválidos
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Establecimiento no autorizado
 *       404:
 *         description: Configuración no encontrada
 */

/**
 * @swagger
 * /conf/animal:
 *   delete:
 *     summary: Dar de baja animales del establecimiento
 *     description: Registra la salida de animales. Soporta dos modos - RODEO/RODEO_UNICO (decrementa cantidad) o INDIVIDUAL (marca como inactivos)
 *     tags: [Configuración]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [tipoSeguimiento, rodeoOrigen, motivo, cantidad]
 *                 properties:
 *                   tipoSeguimiento:
 *                     type: string
 *                     enum: [RODEO, RODEO_UNICO]
 *                     example: "RODEO"
 *                   rodeoOrigen:
 *                     type: string
 *                     format: uuid
 *                     example: "550e8400-e29b-41d4-a716-446655440010"
 *                   motivo:
 *                     type: string
 *                     enum: [EGRESO_VENTA, EGRESO_DESCARTE, EGRESO_MUERTE]
 *                     example: "EGRESO_VENTA"
 *                   cantidad:
 *                     type: integer
 *                     minimum: 1
 *                     example: 2
 *                   observacion:
 *                     type: string
 *                     maxLength: 255
 *                     example: "Venta a feria de ganado"
 *               - type: object
 *                 required: [tipoSeguimiento, animales, motivo, cantidad]
 *                 properties:
 *                   tipoSeguimiento:
 *                     type: string
 *                     enum: [INDIVIDUAL]
 *                     example: "INDIVIDUAL"
 *                   motivo:
 *                     type: string
 *                     enum: [EGRESO_VENTA, EGRESO_DESCARTE, EGRESO_MUERTE]
 *                     example: "EGRESO_DESCARTE"
 *                   cantidad:
 *                     type: integer
 *                     minimum: 1
 *                     example: 1
 *                   animales:
 *                     type: array
 *                     minItems: 1
 *                     items:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440401"
 *                   observacion:
 *                     type: string
 *                     maxLength: 255
 *                     example: "Descarte por edad"
 *     responses:
 *       200:
 *         description: Baja de animales realizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Baja de animales realizada correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     idMovimiento:
 *                       type: string
 *                       format: uuid
 *                     idConfiguracion:
 *                       type: string
 *                       format: uuid
 *                     tipo:
 *                       type: string
 *                       example: "EGRESO"
 *                     motivo:
 *                       type: string
 *                       example: "EGRESO_VENTA"
 *                     cantidad:
 *                       type: integer
 *                       example: 2
 *                     usuarioId:
 *                       type: string
 *                       format: uuid
 *                     observacion:
 *                       type: string
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                     rodeoOrigen:
 *                       type: string
 *                       format: uuid
 *                     animales:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Datos de egreso inválidos
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Establecimiento no autorizado
 *       404:
 *         description: Configuración no encontrada
 */

/**
 * @swagger
 * /conf/rodeo/transferir:
 *   post:
 *     summary: Transferir animales entre rodeos del mismo establecimiento
 *     description: Transfiere animales de un rodeo a otro. Solo disponible para establecimientos con seguimiento RODEO o RODEO_UNICO
 *     tags: [Configuración]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rodeoOrigen, rodeoDestino, motivo, cantidad]
 *             properties:
 *               rodeoOrigen:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440010"
 *               rodeoDestino:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440011"
 *               motivo:
 *                 type: string
 *                 enum: [TRANSFERENCIA_BAJA_PRODUCCION, TRANSFERENCIA_ALTA_PRODUCCION, TRANSFERENCIA_SECADO, TRANSFERENCIA_CAMBIO_ESTADO, TRANSFERENCIA_OTRO]
 *                 example: "TRANSFERENCIA_BAJA_PRODUCCION"
 *               cantidad:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *               observacion:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Transferencia por baja producción"
 *     responses:
 *       200:
 *         description: Transferencia de animales realizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transferencia de rodeo realizada correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     idMovimiento:
 *                       type: string
 *                       format: uuid
 *                     idConfiguracion:
 *                       type: string
 *                       format: uuid
 *                     tipo:
 *                       type: string
 *                       example: "TRANSFERENCIA"
 *                     motivo:
 *                       type: string
 *                       example: "TRANSFERENCIA_BAJA_PRODUCCION"
 *                     rodeoOrigen:
 *                       type: string
 *                       format: uuid
 *                     rodeoDestino:
 *                       type: string
 *                       format: uuid
 *                     cantidad:
 *                       type: integer
 *                       example: 3
 *                     usuarioId:
 *                       type: string
 *                       format: uuid
 *                     observacion:
 *                       type: string
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Datos de transferencia inválidos
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Establecimiento no autorizado
 *       404:
 *         description: Rodeos o configuración no encontrados
 */
