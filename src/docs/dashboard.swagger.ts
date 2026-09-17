/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Dashboard de análisis
 */

/**
 * @swagger
 * /dashboard/costos:
 *   get:
 *     summary: Costos por categoría del mes actual
 *     description: Devuelve el total de costos directos del establecimiento en el mes actual, agrupados por tipo de costo y moneda.
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: header
 *         name: x-establecimiento-id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del establecimiento sobre el que se consulta.
 *     responses:
 *       200:
 *         description: Costos por categoría obtenidos correctamente
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
 *                   example: "Costos por categoría obtenidos correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       categoria:
 *                         $ref: '#/components/schemas/TipoCosto'
 *                       moneda:
 *                         $ref: '#/components/schemas/Moneda'
 *                       total:
 *                         type: number
 *                         example: 45000
 *       400:
 *         description: No se pudo determinar el establecimiento
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No tiene permisos (requiere rol ADMIN u OWNER)
 */

/**
 * @swagger
 * /dashboard/mes-actual:
 *   get:
 *     summary: Obtener resumen del mes actual
 *     description: Devuelve métricas de producción del mes actual y su variación respecto al mes anterior.
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: header
 *         name: x-establecimiento-id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del establecimiento sobre el que se consulta.
 *     responses:
 *       200:
 *         description: Resumen del mes actual obtenido correctamente
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
 *                   example: "Resumen del mes actual"
 *                 data:
 *                   type: object
 *                   properties:
 *                     actual:
 *                       type: object
 *                       properties:
 *                         leches:
 *                           type: number
 *                           example: 1200
 *                         quesos:
 *                           type: number
 *                           example: 850
 *                         mermas:
 *                           type: number
 *                           example: 35
 *                         costos:
 *                           type: number
 *                           example: 42000
 *                     variaciones:
 *                       type: object
 *                       description: Variación porcentual respecto al mes anterior. null cuando no hay datos del mes anterior para comparar.
 *                       properties:
 *                         leches:
 *                           type: number
 *                           nullable: true
 *                           example: 12.5
 *                         quesos:
 *                           type: number
 *                           nullable: true
 *                           example: -5.2
 *                         mermas:
 *                           type: number
 *                           nullable: true
 *                           example: 3.1
 *                         costos:
 *                           type: number
 *                           nullable: true
 *                           example: 8.7
 *                     mesPrevio:
 *                       type: string
 *                       example: "Febrero"
 *       400:
 *         description: No se pudo determinar el establecimiento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "No se pudo determinar el establecimiento"
 *                 data:
 *                   type: null
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Usuario no autenticado"
 *                 data:
 *                   type: null
 */

/**
 * @swagger
 * /dashboard/grafico:
 *   get:
 *     summary: Obtener datos para gráfico de producción
 *     description: Devuelve datos agregados por mes para los últimos 6 meses más el mes actual, filtrados por producto y métrica.
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: header
 *         name: x-establecimiento-id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del establecimiento sobre el que se consulta.
 *       - in: query
 *         name: producto
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/Categoria'
 *         description: Categoría del producto a analizar
 *         example: quesos
 *       - in: query
 *         name: metrica
 *         required: true
 *         schema:
 *           type: string
 *           enum: [cantidad, mermas, costos]
 *         description: Métrica a calcular en el gráfico
 *         example: cantidad
 *     responses:
 *       200:
 *         description: Datos del gráfico obtenidos correctamente
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
 *                   example: "Resumen de los ultimos 6 meses"
 *                 data:
 *                   type: object
 *                   properties:
 *                     resultado:
 *                       type: array
 *                       description: Lista de meses con el valor agregado de la métrica
 *                       items:
 *                         type: object
 *                         properties:
 *                           mes:
 *                             type: string
 *                             example: "Marzo"
 *                           anio:
 *                             type: integer
 *                             example: 2026
 *                           valor:
 *                             type: number
 *                             example: 1730
 *                     Lote:
 *                       type: boolean
 *                       description: Indica si existen lotes en el período consultado
 *                       example: true
 *       400:
 *         description: Parámetros inválidos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Producto o métrica no válidos"
 *                 data:
 *                   type: null
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Usuario no autenticado"
 *                 data:
 *                   type: null
 */