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


/**
 * @swagger
 * /dashboard/litros-libres:
 *   get:
 *     summary: Calcular litros libres del mes actual
 *     description: >
 *       Calcula los litros libres del establecimiento para el mes actual,
 *       considerando la producción de leche registrada en litros, el precio
 *       actual por litro configurado y los costos generales del período.
 *       No incluye producción expresada en kilogramos ni costos directos.
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
 *         description: Litros libres calculados correctamente
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
 *                   example: "Litros Libres calculados correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     periodo:
 *                       type: object
 *                       properties:
 *                         fechaInicio:
 *                           type: string
 *                           format: date-time
 *                           example: "2026-10-01T00:00:00.000Z"
 *                         fechaFin:
 *                           type: string
 *                           format: date-time
 *                           example: "2026-10-31T23:59:59.999Z"
 *                     litrosProducidos:
 *                       type: number
 *                       description: Total de leche producida en litros durante el período.
 *                       example: 12000
 *                     precioLitro:
 *                       type: number
 *                       description: Precio actual por litro obtenido de la configuración del establecimiento.
 *                       example: 500
 *                     costosGenerales:
 *                       type: number
 *                       description: Total de costos generales registrados durante el período.
 *                       example: 1500000
 *                     litrosLibres:
 *                       type: number
 *                       description: Litros libres resultantes del cálculo.
 *                       example: 9000
 *       400:
 *         description: No se pudo determinar el establecimiento o falta configurar el precio por litro.
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Usuario sin permisos para consultar el establecimiento
 */


/**
 * @swagger
 * /dashboard/costos-generales:
 *   get:
 *     summary: Obtener datos para el gráfico de costos generales
 *     description: >
 *       Devuelve los costos generales del establecimiento agrupados por
 *       categoría y período. Permite consultar los últimos 7 días, el mes
 *       actual o los 6 meses completos anteriores. No incluye costos directos.
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
 *         name: periodo
 *         required: false
 *         schema:
 *           type: string
 *           enum: [7dias, 1mes, 6meses]
 *           default: 6meses
 *         description: >
 *           Período de consulta. 7dias corresponde a los últimos 7 días;
 *           1mes corresponde al mes calendario actual; 6meses corresponde
 *           a los 6 meses calendario completos anteriores, sin incluir
 *           el mes actual.
 *         example: 6meses
 *     responses:
 *       200:
 *         description: Gráfico de costos generales obtenido correctamente
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
 *                   example: "Gráfico de costos generales obtenido correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     periodo:
 *                       type: string
 *                       enum: [7dias, 1mes, 6meses]
 *                       example: 6meses
 *                     inicioPeriodo:
 *                       type: string
 *                       format: date-time
 *                       description: Inicio del período consultado.
 *                     finPeriodo:
 *                       type: string
 *                       format: date-time
 *                       description: Fin del período consultado.
 *                     categorias:
 *                       type: array
 *                       description: Categorías de costos generales encontradas en el período.
 *                       items:
 *                         type: string
 *                       example: ["alimentacion", "mantenimiento"]
 *                     datos:
 *                       type: array
 *                       description: Valores agrupados por período. Cada categoría se representa como una propiedad numérica del objeto.
 *                       items:
 *                         type: object
 *                         properties:
 *                           periodo:
 *                             type: string
 *                             description: Etiqueta visible del período.
 *                             example: "Agosto"
 *                           clave:
 *                             type: string
 *                             description: Clave identificadora del período.
 *                             example: "2026-08"
 *                           anio:
 *                             type: integer
 *                             example: 2026
 *                           total:
 *                             type: number
 *                             description: Suma de los costos generales del período.
 *                             example: 250000
 *                         additionalProperties:
 *                           type: number
 *                           description: Importe de una categoría de costo general.
 *       400:
 *         description: Parámetros inválidos o no se pudo determinar el establecimiento.
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Usuario sin permisos para consultar el establecimiento
 */

/**
 * @swagger
 * /dashboard/precio-mercado:
 *   get:
 *     summary: Obtener el precio nacional de mercado de la leche
 *     description: >
 *       Devuelve el último precio nacional por litro publicado por el
 *       Ministerio de Agricultura, Ganadería y Pesca (MAGyP) y almacenado
 *       en el sistema. El precio se actualiza automáticamente mediante
 *       una tarea CRON mensual. Este endpoint no modifica el precio
 *       configurado por cada establecimiento.
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Precio nacional de mercado obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Precio nacional de mercado obtenido correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     precioLitro:
 *                       type: number
 *                       description: Último precio nacional publicado por litro, expresado en pesos argentinos.
 *                       example: 500.16
 *                     mes:
 *                       type: integer
 *                       description: Mes correspondiente al precio publicado.
 *                       example: 9
 *                     anio:
 *                       type: integer
 *                       description: Año correspondiente al precio publicado.
 *                       example: 2026
 *                     ultimaConsulta:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha y hora de la última consulta exitosa a la fuente oficial.
 *                       example: "2026-10-01T09:00:00.000Z"
 *       401:
 *         description: Usuario no autenticado
 *       503:
 *         description: El precio nacional de mercado todavía no está disponible.
 */
