/**
 * @swagger
 * tags:
 *   - name: Costos
 *     description: Gestión de costos directos asociados a los lotes
 */

/**
 * @swagger
 * /costos/registrar:
 *   post:
 *     summary: Crear un nuevo costo
 *     tags: [Costos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loteId
 *               - concepto
 *               - monto
 *             properties:
 *               loteId:
 *                 type: string
 *                 format: uuid
 *               concepto:
 *                 type: string
 *                 enum:
 *                   - insumos_basicos
 *                   - leche_cruda
 *                   - cuajo_y_fermentos
 *                   - refrigeracion
 *                 example: leche_cruda
 *               monto:
 *                 type: number
 *                 example: 1200.50
 *               observaciones:
 *                 type: string
 *                 example: Costo estimado para producción del lote
 *     responses:
 *       201:
 *         description: Costo registrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Costo registrado correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     idCostoDirecto:
 *                       type: string
 *                       format: uuid
 *                     idLote:
 *                       type: string
 *                       format: uuid
 *                     concepto:
 *                       type: string
 *                     monto:
 *                       type: number
 *                     observaciones:
 *                       type: string
 *                       nullable: true
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Datos inválidos o lote terminado
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Lote no encontrado
 */

/**
 * @swagger
 * /costos/detalle/{id}:
 *   get:
 *     summary: Obtener un costo por ID
 *     tags: [Costos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Costo obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Costo obtenido correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     idCostoDirecto:
 *                       type: string
 *                       format: uuid
 *                     idLote:
 *                       type: string
 *                       format: uuid
 *                     concepto:
 *                       type: string
 *                     monto:
 *                       type: number
 *                     observaciones:
 *                       type: string
 *                       nullable: true
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Costo no encontrado
 */

/**
 * @swagger
 * /costos/costos-lote/{loteId}:
 *   get:
 *     summary: Listar todos los costos de un lote
 *     tags: [Costos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Costos obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Costos obtenidos correctamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idCostoDirecto:
 *                         type: string
 *                         format: uuid
 *                       concepto:
 *                         type: string
 *                       monto:
 *                         type: number
 *                       observaciones:
 *                         type: string
 *                         nullable: true
 *                       fechaCreacion:
 *                         type: string
 *                         format: date-time
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: ID de lote inválido
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Lote no encontrado
 */

/**
 * @swagger
 * /costos/actualizar/{id}:
 *   put:
 *     summary: Actualizar un costo existente
 *     tags: [Costos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               concepto:
 *                 type: string
 *                 enum:
 *                   - insumos_basicos
 *                   - leche_cruda
 *                   - cuajo_y_fermentos
 *                   - refrigeracion
 *               monto:
 *                 type: number
 *               observaciones:
 *                 type: string
 *     responses:
 *       200:
 *         description: Costo actualizado correctamente
 *       400:
 *         description: Datos inválidos o lote terminado
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Costo no encontrado
 */

/**
 * @swagger
 * /costos/eliminar/{id}:
 *   delete:
 *     summary: Eliminar un costo
 *     tags: [Costos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Costo eliminado correctamente
 *       400:
 *         description: No se puede eliminar (lote terminado)
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Costo no encontrado
 */