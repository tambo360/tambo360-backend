/**
 * @swagger
 * tags:
 *   name: Alertas
 *   description: API para consultar las alertas generadas por TamboEngine.
 */

/**
 * @swagger
 * /alertas/{idEstablecimiento}:
 *   get:
 *     summary: Obtener todas las alertas históricas de un establecimiento
 *     tags: [Alertas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idEstablecimiento
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del establecimiento a consultar
 *       - in: query
 *         name: rango
 *         required: false
 *         schema:
 *           type: integer
 *         description: Cantidad de días hacia atrás a filtrar (ej. 7 para la última semana)
 *     responses:
 *       200:
 *         description: Lista de alertas históricas obtenida exitosamente.
 *       400:
 *         description: Petición inválida (ej. falta ID).
 *       401:
 *         description: No autenticado.
 *       500:
 *         description: Error interno del servidor.
 */

/**
 * @swagger
 * /alertas/{idEstablecimiento}/ultimas:
 *   get:
 *     summary: Obtener las alertas más recientes generadas tras el último análisis
 *     tags: [Alertas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idEstablecimiento
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del establecimiento a consultar
 *     responses:
 *       200:
 *         description: Lista de las últimas alertas obtenida correctamente.
 *       400:
 *         description: Petición inválida (ej. falta ID).
 *       401:
 *         description: No autenticado.
 *       500:
 *         description: Error interno del servidor.
 */

/**
 * @swagger
 * /alertas/{idAlerta}/visto:
 *   put:
 *     summary: Marcar una alerta específica como vista
 *     tags: [Alertas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idAlerta
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la alerta a marcar como vista
 *     responses:
 *       200:
 *         description: Alerta marcada como vista exitosamente.
 *       400:
 *         description: Petición inválida (ej. falta ID).
 *       404:
 *         description: Alerta no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */

/**
 * @swagger
 * /alertas/{idEstablecimiento}/no-vistas:
 *   get:
 *     summary: Obtener el conteo total de alertas no vistas para un establecimiento
 *     tags: [Alertas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idEstablecimiento
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del establecimiento a consultar
 *     responses:
 *       200:
 *         description: Conteo de alertas no vistas obtenido correctamente.
 *       400:
 *         description: Petición inválida (ej. falta ID).
 *       401:
 *         description: No autenticado.
 *       404:
 *         description: Alerta no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */

/**
 * @swagger
 * /alertas/{idEstablecimiento}/lote/{idLote}:
 *   get:
 *     summary: Obtener todas las alertas asociadas a un lote en particular
 *     tags: [Alertas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idEstablecimiento
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del establecimiento
 *       - in: path
 *         name: idLote
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del lote
 *     responses:
 *       200:
 *         description: Lista de alertas para ese lote obtenida correctamente.
 *       400:
 *         description: Petición inválida (ej. falta ID).
 *       401:
 *         description: No autenticado.
 *       500:
 *         description: Error interno del servidor.
 */
