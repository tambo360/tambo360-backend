/**
 * @swagger
 * tags:
 *   - name: Mermas
 *     description: Gestión de mermas asociadas a lotes de producción
 */

/**
 * @swagger
 * /mermas/tipos:
 *   get:
 *     summary: Obtener tipos de merma disponibles
 *     tags: [Mermas]
 *     responses:
 *       200:
 *         description: Lista de tipos de merma
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example:
 *                 - Natural
 *                 - Tecnica
 *                 - Administrativa
 *                 - Danio
 */


/**
 * @swagger
 * /mermas:
 *   post:
 *     summary: Crear una nueva merma
 *     tags: [Mermas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idLote
 *               - tipo
 *               - cantidad
 *             properties:
 *               idLote:
 *                 type: string
 *                 format: uuid
 *                 example: "d3e1c8e4-12a3-4bcd-9e0d-123456789abc"
 *               tipo:
 *                 type: string
 *                 example: "Natural"
 *               observacion:
 *                 type: string
 *                 example: "Pérdida durante el transporte"
 *               cantidad:
 *                 type: number
 *                 example: 20
 *     responses:
 *       201:
 *         description: Merma creada correctamente
 *       400:
 *         description: Error de validación
 */


/**
 * @swagger
 * /mermas:
 *   get:
 *     summary: Obtener todas las mermas
 *     tags: [Mermas]
 *     responses:
 *       200:
 *         description: Lista de mermas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idMerma:
 *                     type: string
 *                     format: uuid
 *                   tipo:
 *                     type: string
 *                   observacion:
 *                     type: string
 *                   cantidad:
 *                     type: number
 *                   fechaCreacion:
 *                     type: string
 *                     format: date-time
 *                   idLote:
 *                     type: string
 */


/**
 * @swagger
 * /mermas/{id}:
 *   get:
 *     summary: Obtener una merma por ID
 *     tags: [Mermas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la merma
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Merma encontrada
 *       404:
 *         description: Merma no encontrada
 */


/**
 * @swagger
 * /mermas/{id}:
 *   put:
 *     summary: Actualizar una merma
 *     tags: [Mermas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la merma
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *                 example: "Tecnica"
 *               observacion:
 *                 type: string
 *                 example: "Error en proceso de producción"
 *               cantidad:
 *                 type: number
 *                 example: 15
 *     responses:
 *       200:
 *         description: Merma actualizada correctamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Merma no encontrada
 */


/**
 * @swagger
 * /mermas/{id}:
 *   delete:
 *     summary: Eliminar una merma
 *     tags: [Mermas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la merma
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Merma eliminada correctamente
 *       404:
 *         description: Merma no encontrada
 */