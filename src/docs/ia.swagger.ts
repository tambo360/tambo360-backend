
/**
 * @swagger
 * tags:
 *   name: Inteligencia Artificial
 *   description: Endpoints de integración interna para los servicios de IA.
 */

/**
 * @swagger
 * /internal/ia/resumenes/{idResumenMensual}/historico:
 *   get:
 *     summary: Obtener el histórico de resúmenes mensuales
 *     description: |
 *       Obtiene hasta seis resúmenes mensuales anteriores al resumen solicitado.
 *       Los registros corresponden al mismo establecimiento y se ordenan
 *       desde el período más reciente al más antiguo.
 *
 *       Los meses sin información no se incluyen.
 *       Si no existen períodos anteriores, se devuelve una lista vacía.
 *     tags:
 *       - Inteligencia Artificial
 *     servers:
 *       - url: /
 *         description: Backend sin el prefijo /api.
 *     parameters:
 *       - in: path
 *         name: idResumenMensual
 *         required: true
 *         description: Identificador UUID del resumen mensual actual.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Histórico mensual obtenido correctamente.
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
 *                   example: Histórico mensual obtenido correctamente
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     historico:
 *                       type: array
 *                       maxItems: 6
 *                       items:
 *                         type: object
 *                         properties:
 *                           idResumenMensual:
 *                             type: string
 *                             format: uuid
 *                           anio:
 *                             type: integer
 *                           mes:
 *                             type: integer
 *                           fechaDesde:
 *                             type: string
 *                             format: date-time
 *                           fechaHasta:
 *                             type: string
 *                             format: date-time
 *                           cantLotes:
 *                             type: integer
 *                           litrosProduccion:
 *                             type: string
 *                           litrosMermas:
 *                             type: string
 *                           litrosTotales:
 *                             type: string
 *                           litrosLibres:
 *                             type: string
 *                             nullable: true
 *                           costosTotales:
 *                             type: string
 *                           costoPorLitro:
 *                             type: string
 *                             nullable: true
 *                           costoPorCategoria:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 idResumenCostoCategoria:
 *                                   type: string
 *                                   format: uuid
 *                                 categoria:
 *                                   type: string
 *                                   enum:
 *                                     - ALIMENTACION
 *                                     - SANIDAD
 *                                     - MANO_OBRA
 *                                     - ENERGIA
 *                                     - MANTENIMIENTO
 *                                     - LOGISTICA
 *                                     - SERVICIOS
 *                                     - VETERINARIO
 *                                     - INMUEBLE
 *                                     - OTRO
 *                                 monto:
 *                                   type: string
 *             examples:
 *               conHistorico:
 *                 summary: Existen resúmenes anteriores
 *                 value:
 *                   success: true
 *                   message: Histórico mensual obtenido correctamente
 *                   statusCode: 200
 *                   data:
 *                     historico:
 *                       - idResumenMensual: "550e8400-e29b-41d4-a716-446655440000"
 *                         anio: 2026
 *                         mes: 10
 *                         fechaDesde: "2026-10-01T00:00:00.000Z"
 *                         fechaHasta: "2026-10-31T23:59:59.000Z"
 *                         cantLotes: 12
 *                         litrosProduccion: "1500.50"
 *                         litrosMermas: "50.00"
 *                         litrosTotales: "1550.50"
 *                         litrosLibres: "1450.50"
 *                         costosTotales: "250000.00"
 *                         costoPorLitro: "161.2900"
 *                         costoPorCategoria:
 *                           - idResumenCostoCategoria: "650e8400-e29b-41d4-a716-446655440000"
 *                             categoria: ALIMENTACION
 *                             monto: "50000.00"
 *               sinHistorico:
 *                 summary: No existen resúmenes anteriores
 *                 value:
 *                   success: true
 *                   message: Histórico mensual obtenido correctamente
 *                   statusCode: 200
 *                   data:
 *                     historico: []
 *       400:
 *         description: El identificador del resumen mensual tiene formato UUID inválido.
 *       404:
 *         description: No se encontró el resumen mensual solicitado.
 *       500:
 *         description: Error interno del servidor.
 */
