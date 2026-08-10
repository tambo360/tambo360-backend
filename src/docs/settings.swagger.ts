/**
 * @swagger
 * tags:
 *   - name: Configuración
 *     description: Operaciones de configuración y administración de rodeos
 */

/**
 * @swagger
 * /conf/rodeo/transferir:
 *   post:
 *     summary: Transferir vacas entre rodeos del mismo establecimiento
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
 *                 example: TRANSFERENCIA_BAJA_PRODUCCION
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
 *         description: Transferencia de rodeo realizada correctamente
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
 *                     idMovRodeo:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440100"
 *                     idConfiguracion:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440200"
 *                     tipo:
 *                       type: string
 *                       example: "TRANSFERENCIA"
 *                     motivo:
 *                       type: string
 *                       example: "TRANSFERENCIA_BAJA_PRODUCCION"
 *                     rodeoOrigen:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440010"
 *                     rodeoDestino:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440011"
 *                     cantidad:
 *                       type: integer
 *                       example: 3
 *                     usuarioId:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440300"
 *                     observacion:
 *                       type: string
 *                       example: "Transferencia por baja producción"
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-08-10T12:00:00.000Z"
 *       400:
 *         description: Datos de transferencia inválidos o cantidad mayor a la disponible
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cantidad a transferir mayor a la cantidad disponible en el rodeo de origen"
 *                 data:
 *                   type: null
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Usuario no autenticado"
 *                 data:
 *                   type: null
 *       403:
 *         description: Establecimiento no autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Establecimiento no autorizado"
 *                 data:
 *                   type: null
 *       404:
 *         description: Rodeo de origen, rodeo de destino o configuración no encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Rodeo de destino no encontrado"
 *                 data:
 *                   type: null
 */
