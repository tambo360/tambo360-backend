
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




/**
 * @swagger
 * /internal/ia/eventos/{idEvento}/contexto:
 *   get:
 *     summary: Obtener contexto productivo de un evento de IA
 *     description: |
 *       Obtiene la información productiva asociada al establecimiento
 *       y al evento de IA solicitado.
 *
 *       El período de consulta de movimientos depende del tipo de evento:
 *
 *       - LOT_CLOSED: obtiene el período desde PromedioProductivo,
 *         según el ámbito correspondiente al tipo de seguimiento
 *         y al rodeo del lote.
 *       - MONTH_CLOSED: obtiene el período desde el ResumenMensual
 *         asociado al evento.
 *
 *       Los movimientos se filtran utilizando las fechas de inicio
 *       y fin del período correspondiente.
 *
 *       Si no existe un período válido, se devuelve una lista vacía
 *       de movimientos. No se consulta el histórico completo.
 *
 *       Para establecimientos con seguimiento INDIVIDUAL, además
 *       se recuperan hasta 30 producciones históricas anteriores
 *       por cada animal identificado en los movimientos del período.
 *
 *       El lote actual se excluye del historial porque Python ya
 *       recibe esa información al solicitar el análisis.
 *
 *       Para seguimiento RODEO y RODEO_UNICO, los movimientos
 *       se agrupan en ingresos, egresos y transferencias.
 *
 *       Si no existen movimientos o historial productivo,
 *       se devuelven estructuras vacías.
 *
 *       IMPORTANTE: el período se obtiene dinámicamente desde
 *       PromedioProductivo o ResumenMensual. Por lo tanto,
 *       una actualización posterior de esas entidades puede
 *       modificar el período recuperado para un evento anterior.
 *
 *       La autenticación interna Node-Python se encuentra pendiente
 *       de implementación.
 *     tags:
 *       - Inteligencia Artificial
 *     servers:
 *       - url: /
 *         description: Backend sin el prefijo /api.
 *     parameters:
 *       - in: path
 *         name: idEvento
 *         required: true
 *         description: Identificador UUID del evento de IA.
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: header
 *         name: x-establecimiento-id
 *         required: true
 *         description: Identificador UUID del establecimiento al que pertenece el evento.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Contexto productivo obtenido correctamente.
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
 *                   example: Contexto del evento obtenido correctamente
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     evento:
 *                       type: object
 *                       properties:
 *                         idEventoIA:
 *                           type: string
 *                           format: uuid
 *                         idEstablecimiento:
 *                           type: string
 *                           format: uuid
 *                         tipo:
 *                           type: string
 *                           enum:
 *                             - LOT_CLOSED
 *                             - MONTH_CLOSED
 *                         idLoteActual:
 *                           type: string
 *                           format: uuid
 *                           nullable: true
 *                         tipoSeguimiento:
 *                           type: string
 *                           enum:
 *                             - INDIVIDUAL
 *                             - RODEO
 *                             - RODEO_UNICO
 *                     movimientos:
 *                       description: |
 *                         Para INDIVIDUAL devuelve un arreglo de movimientos.
 *                         Para RODEO y RODEO_UNICO devuelve un objeto
 *                         con movimientos agrupados por tipo.
 *                       oneOf:
 *                         - type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               idMovimiento:
 *                                 type: string
 *                                 format: uuid
 *                               tipo:
 *                                 type: string
 *                                 enum:
 *                                   - INGRESO
 *                                   - EGRESO
 *                                   - TRANSFERENCIA
 *                               motivo:
 *                                 type: string
 *                               causa:
 *                                 type: string
 *                                 nullable: true
 *                               cantidad:
 *                                 type: integer
 *                               fechaCreacion:
 *                                 type: string
 *                                 format: date-time
 *                               observacion:
 *                                 type: string
 *                                 nullable: true
 *                               retorno:
 *                                 type: string
 *                                 format: date-time
 *                                 nullable: true
 *                               rodeoOrigen:
 *                                 type: string
 *                                 nullable: true
 *                               rodeoDestino:
 *                                 type: string
 *                                 nullable: true
 *                               categoriaOrigen:
 *                                 type: string
 *                                 nullable: true
 *                               categoriaDestino:
 *                                 type: string
 *                                 nullable: true
 *                               animales:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     idAnimal:
 *                                       type: string
 *                                       format: uuid
 *                                     codigo:
 *                                       type: string
 *                                       nullable: true
 *                                     nombre:
 *                                       type: string
 *                                       nullable: true
 *                                     categoria:
 *                                       type: string
 *                                     estado:
 *                                       type: string
 *                         - type: object
 *                           properties:
 *                             ingresos:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 description: Estructura de un movimiento.
 *                             egresos:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 description: Estructura de un movimiento.
 *                             transferencias:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 description: Estructura de un movimiento.
 *                     historialProduccion:
 *                       type: array
 *                       description: |
 *                         Historial productivo por animal.
 *                         Se devuelve con datos únicamente para seguimiento INDIVIDUAL.
 *                       items:
 *                         type: object
 *                         properties:
 *                           idAnimal:
 *                             type: string
 *                             format: uuid
 *                           producciones:
 *                             type: array
 *                             maxItems: 30
 *                             items:
 *                               type: object
 *                               properties:
 *                                 idLote:
 *                                   type: string
 *                                   format: uuid
 *                                 fechaProduccion:
 *                                   type: string
 *                                   format: date-time
 *                                 litros:
 *                                   type: string
 *             examples:
 *               contextoIndividual:
 *                 summary: Evento con seguimiento individual
 *                 value:
 *                   success: true
 *                   message: Contexto del evento obtenido correctamente
 *                   statusCode: 200
 *                   data:
 *                     evento:
 *                       idEventoIA: "550e8400-e29b-41d4-a716-446655440000"
 *                       idEstablecimiento: "650e8400-e29b-41d4-a716-446655440000"
 *                       tipo: "LOT_CLOSED"
 *                       idLoteActual: "750e8400-e29b-41d4-a716-446655440000"
 *                       tipoSeguimiento: "INDIVIDUAL"
 *                     movimientos:
 *                       - idMovimiento: "850e8400-e29b-41d4-a716-446655440000"
 *                         tipo: "INGRESO"
 *                         motivo: "COMPRA"
 *                         causa: null
 *                         cantidad: 2
 *                         fechaCreacion: "2026-10-15T10:00:00.000Z"
 *                         observacion: null
 *                         retorno: null
 *                         rodeoOrigen: null
 *                         rodeoDestino: null
 *                         categoriaOrigen: null
 *                         categoriaDestino: null
 *                         animales:
 *                           - idAnimal: "950e8400-e29b-41d4-a716-446655440000"
 *                             codigo: "AN-001"
 *                             nombre: "Vaca 001"
 *                             categoria: "VACA"
 *                             estado: "ACTIVO"
 *                     historialProduccion:
 *                       - idAnimal: "950e8400-e29b-41d4-a716-446655440000"
 *                         producciones:
 *                           - idLote: "a50e8400-e29b-41d4-a716-446655440000"
 *                             fechaProduccion: "2026-10-10T00:00:00.000Z"
 *                             litros: "25.50"
 *               contextoRodeo:
 *                 summary: Evento con seguimiento por rodeos
 *                 value:
 *                   success: true
 *                   message: Contexto del evento obtenido correctamente
 *                   statusCode: 200
 *                   data:
 *                     evento:
 *                       idEventoIA: "550e8400-e29b-41d4-a716-446655440000"
 *                       idEstablecimiento: "650e8400-e29b-41d4-a716-446655440000"
 *                       tipo: "LOT_CLOSED"
 *                       idLoteActual: "750e8400-e29b-41d4-a716-446655440000"
 *                       tipoSeguimiento: "RODEO"
 *                     movimientos:
 *                       ingresos: []
 *                       egresos: []
 *                       transferencias: []
 *                     historialProduccion: []
 *               contextoSinDatos:
 *                 summary: Evento sin movimientos ni historial
 *                 value:
 *                   success: true
 *                   message: Contexto del evento obtenido correctamente
 *                   statusCode: 200
 *                   data:
 *                     evento:
 *                       idEventoIA: "550e8400-e29b-41d4-a716-446655440000"
 *                       idEstablecimiento: "650e8400-e29b-41d4-a716-446655440000"
 *                       tipo: "MONTH_CLOSED"
 *                       idLoteActual: null
 *                       tipoSeguimiento: "RODEO"
 *                     movimientos:
 *                       ingresos: []
 *                       egresos: []
 *                       transferencias: []
 *                     historialProduccion: []
 *       400:
 *         description: El identificador del evento o del establecimiento tiene formato UUID inválido.
 *       404:
 *         description: No se encontró el evento o la configuración del establecimiento.
 *       500:
 *         description: Error interno del servidor.
 */
