-- CreateEnum
CREATE TYPE "Unidad" AS ENUM ('kg', 'litros');

-- CreateEnum
CREATE TYPE "Moneda" AS ENUM ('USD', 'EUR', 'ARS');

-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('quesos', 'leches', 'yogures', 'otros');

-- CreateEnum
CREATE TYPE "TipoToken" AS ENUM ('verificacion', 'recuperacion');

-- CreateEnum
CREATE TYPE "TipoMerma" AS ENUM ('MASTITIS', 'ESTRES_CALORICO', 'DERRAME_EN_ORDENE', 'FALLA_EQUIPO', 'RECHAZO_ANTIBIOTICOS', 'ACIDOSIS_RUMINAL', 'PERDIDA_EN_TRANSPORTE', 'VENCIMIENTO_PRODUCTO', 'DANO_POR_MANIPULACION', 'DISCREPANCIA_INVENTARIO', 'MERMA_DESCONOCIDA', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoCosto" AS ENUM ('ALIMENTACION', 'SANIDAD', 'MANO_OBRA', 'ENERGIA', 'MANTENIMIENTO', 'LOGISTICA', 'OTRO');

-- CreateEnum
CREATE TYPE "RolOrganizacion" AS ENUM ('ORG_OWNER', 'ORG_ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "RolEstablecimiento" AS ENUM ('OWNER', 'ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "EstadoInvitacion" AS ENUM ('pendiente', 'aceptada', 'rechazada');

-- CreateEnum
CREATE TYPE "TipoOrdenie" AS ENUM ('balde', 'linea', 'espina_de_pescado', 'rotativo', 'manual', 'otro');

-- CreateEnum
CREATE TYPE "VentaLeche" AS ENUM ('USINA', 'COOPERTIVA', 'ELABORACION_PROPIA', 'VENTA_DIRECTA_MERCADO_LOCAL');

-- CreateEnum
CREATE TYPE "GeneroAnimal" AS ENUM ('HEMBRA', 'MACHO');

-- CreateEnum
CREATE TYPE "TipoRodeo" AS ENUM ('ALTA_PRODUCCION', 'BAJA_PRODUCCION', 'VACAS_SECAS', 'UNICO_ORDENIE', 'UNICO_SECA');

-- CreateEnum
CREATE TYPE "TipoDestino" AS ENUM ('TANQUE_FRIO', 'VENTA', 'FABRICA_QUESOS');

-- CreateEnum
CREATE TYPE "TipoCostoGeneral" AS ENUM ('PERSONAL', 'ALIMENTACION', 'SERVICIOS', 'LOGISTICA', 'MANTENIMIENTO', 'VETERINARIO', 'INMUEBLE', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoSeguimiento" AS ENUM ('RODEO', 'INDIVIDUAL', 'RODEO_UNICO');

-- CreateEnum
CREATE TYPE "CategoriaAnimal" AS ENUM ('ORDENE', 'SECAS');

-- CreateEnum
CREATE TYPE "EstadoSanitarioAnimal" AS ENUM ('MASTITIS', 'PREPARTO', 'SANO', 'PROBLEMA_PODAL', 'PROBLEMA_UTERINO', 'ENFERMEDAD_GENERAL');

-- CreateEnum
CREATE TYPE "DestinoProduccion" AS ENUM ('TANQUE', 'DESCARTE');

-- CreateEnum
CREATE TYPE "TipoMovimientoAnimal" AS ENUM ('INGRESO', 'EGRESO', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "MotivoMovimientoAnimal" AS ENUM ('INGRESO_COMPRA', 'INGRESO_NACIMIENTO', 'EGRESO_VENTA', 'EGRESO_DESCARTE', 'EGRESO_MUERTE', 'TRANSFERENCIA_SANITARIA', 'TRANSFERENCIA_CICLO_PRODUCTIVO', 'TRANSFERENCIA_RECUPERACION');

-- CreateEnum
CREATE TYPE "CausaMovimientoAnimal" AS ENUM ('MASTITIS', 'PROBLEMA_PODAL', 'PROBLEMA_UTERINO', 'ENFERMEDAD_GENERAL', 'SECADA_PROGRAMADA', 'PARTO', 'ABORTO', 'ALTA_MEDICA');

-- CreateEnum
CREATE TYPE "Razas" AS ENUM ('HOLANDO_ARGENTINO', 'JERSEY', 'PARDO_SUIZO', 'GIR_LECHERO', 'HOLANDO_JERSEY_CRUZA', 'AYRSHIRE', 'NORMANDO', 'BROWN_SWISS', 'MONTBELIARDE', 'SIMMENTAL_LECHERO', 'OTRAS');

-- CreateEnum
CREATE TYPE "TipoEventoIA" AS ENUM ('LOT_CLOSED', 'MONTH_CLOSED');

-- CreateEnum
CREATE TYPE "EstadoEventoIA" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "EstadoEjecucionIA" AS ENUM ('COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "TipoAlertaIA" AS ENUM ('DESVIO_PRODUCTIVO', 'RESUMEN_MENSUAL');

-- CreateEnum
CREATE TYPE "NivelAlerta" AS ENUM ('INFORMATIVA', 'RELEVANTE', 'CRITICA');

-- CreateEnum
CREATE TYPE "AmbitoPromedioProductivo" AS ENUM ('RODEO_ALTO', 'RODEO_BAJO', 'RODEO_UNICO', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "CategoriaCostoResumen" AS ENUM ('ALIMENTACION', 'SANIDAD', 'MANO_OBRA', 'ENERGIA', 'MANTENIMIENTO', 'LOGISTICA', 'SERVICIOS', 'VETERINARIO', 'INMUEBLE', 'OTRO');

-- CreateTable
CREATE TABLE "Usuario" (
    "idUsuario" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("idUsuario")
);

-- CreateTable
CREATE TABLE "Organizacion" (
    "idOrganizacion" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organizacion_pkey" PRIMARY KEY ("idOrganizacion")
);

-- CreateTable
CREATE TABLE "OrganizacionUsuario" (
    "idOrganizacionUsuario" TEXT NOT NULL,
    "idOrganizacion" TEXT NOT NULL,
    "idUsuario" TEXT NOT NULL,
    "rol" "RolOrganizacion" NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizacionUsuario_pkey" PRIMARY KEY ("idOrganizacionUsuario")
);

-- CreateTable
CREATE TABLE "Establecimiento" (
    "idEstablecimiento" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "localidad" TEXT,
    "provincia" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idOrganizacion" TEXT NOT NULL,
    "cuestionarioCompletado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Establecimiento_pkey" PRIMARY KEY ("idEstablecimiento")
);

-- CreateTable
CREATE TABLE "Establecimiento_OrganizacionUsuario" (
    "idEstablecimientoOrganizacionUsuario" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "idOrganizacionUsuario" TEXT NOT NULL,
    "rol" "RolEstablecimiento" NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Establecimiento_OrganizacionUsuario_pkey" PRIMARY KEY ("idEstablecimientoOrganizacionUsuario")
);

-- CreateTable
CREATE TABLE "configuracion" (
    "idConfiguracion" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "cantVacas" INTEGER,
    "cantOrdenies" INTEGER,
    "promLitros" DOUBLE PRECISION,
    "promDEL" DOUBLE PRECISION,
    "tipoOrdenie" "TipoOrdenie",
    "ventaLeche" "VentaLeche",
    "precioLitro" DECIMAL(13,2),
    "empleados" BOOLEAN,
    "cantEmpleados" INTEGER,
    "modificadoEn" TIMESTAMP(3),
    "ultimoNumeroLote" INTEGER NOT NULL DEFAULT 0,
    "tipoSeguimiento" "TipoSeguimiento" NOT NULL DEFAULT 'RODEO',

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("idConfiguracion")
);

-- CreateTable
CREATE TABLE "InvitacionOrganizacion" (
    "idInvitacion" TEXT NOT NULL,
    "idOrganizacion" TEXT NOT NULL,
    "idInvitador" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "estado" "EstadoInvitacion" NOT NULL DEFAULT 'pendiente',
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "rol" "RolOrganizacion" NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondidaEn" TIMESTAMP(3),

    CONSTRAINT "InvitacionOrganizacion_pkey" PRIMARY KEY ("idInvitacion")
);

-- CreateTable
CREATE TABLE "InvitacionEstablecimiento" (
    "idInvitacion" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "idInvitador" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "estado" "EstadoInvitacion" NOT NULL DEFAULT 'pendiente',
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "rol" "RolEstablecimiento" NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondidaEn" TIMESTAMP(3),

    CONSTRAINT "InvitacionEstablecimiento_pkey" PRIMARY KEY ("idInvitacion")
);

-- CreateTable
CREATE TABLE "Producto" (
    "idProducto" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "esSistema" BOOLEAN NOT NULL DEFAULT false,
    "idOrganizacion" TEXT,
    "nombreNormalizado" TEXT NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("idProducto")
);

-- CreateTable
CREATE TABLE "EstablecimientoProducto" (
    "id" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "idProducto" TEXT NOT NULL,

    CONSTRAINT "EstablecimientoProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rodeo" (
    "idRodeo" TEXT NOT NULL,
    "idConfiguracion" TEXT NOT NULL,
    "tipoRodeo" "TipoRodeo" NOT NULL,
    "cantVacas" INTEGER NOT NULL,
    "costoRacion" DECIMAL(13,2) NOT NULL,

    CONSTRAINT "Rodeo_pkey" PRIMARY KEY ("idRodeo")
);

-- CreateTable
CREATE TABLE "Raza" (
    "idRaza" TEXT NOT NULL,
    "nombre" "Razas" NOT NULL,
    "cantVacas" INTEGER NOT NULL,
    "idRodeo" TEXT NOT NULL,

    CONSTRAINT "Raza_pkey" PRIMARY KEY ("idRaza")
);

-- CreateTable
CREATE TABLE "MovimientoAnimal" (
    "idMovimiento" TEXT NOT NULL,
    "idConfiguracion" TEXT NOT NULL,
    "tipo" "TipoMovimientoAnimal" NOT NULL,
    "motivo" "MotivoMovimientoAnimal" NOT NULL,
    "causa" "CausaMovimientoAnimal",
    "rodeoOrigen" TEXT,
    "rodeoDestino" TEXT,
    "categoriaOrigen" "CategoriaAnimal",
    "categoriaDestino" "CategoriaAnimal",
    "cantidad" INTEGER NOT NULL,
    "usuarioId" TEXT,
    "observacion" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retorno" TIMESTAMP(3),

    CONSTRAINT "MovimientoAnimal_pkey" PRIMARY KEY ("idMovimiento")
);

-- CreateTable
CREATE TABLE "MovimientoAnimalDetalle" (
    "idMovimientoDetalle" TEXT NOT NULL,
    "idMovimiento" TEXT NOT NULL,
    "idAnimal" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoAnimalDetalle_pkey" PRIMARY KEY ("idMovimientoDetalle")
);

-- CreateTable
CREATE TABLE "Animal" (
    "idAnimal" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "idRodeo" TEXT,
    "codigo" TEXT,
    "nombre" TEXT,
    "categoria" "CategoriaAnimal" NOT NULL,
    "estado" "EstadoSanitarioAnimal" NOT NULL,
    "raza" "Razas" NOT NULL DEFAULT 'OTRAS',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaNacimiento" TIMESTAMP(3),
    "genero" "GeneroAnimal" NOT NULL DEFAULT 'HEMBRA',
    "fechaUltimoParto" TIMESTAMP(3),
    "observacion" TEXT,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("idAnimal")
);

-- CreateTable
CREATE TABLE "ProduccionAnimal" (
    "idProduccionAnimal" TEXT NOT NULL,
    "idAnimal" TEXT NOT NULL,
    "idLote" TEXT NOT NULL,
    "categoria" "CategoriaAnimal" NOT NULL DEFAULT 'ORDENE',
    "destino" "DestinoProduccion" NOT NULL,
    "estado" "EstadoSanitarioAnimal" NOT NULL,
    "litros" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ProduccionAnimal_pkey" PRIMARY KEY ("idProduccionAnimal")
);

-- CreateTable
CREATE TABLE "ProduccionRodeo" (
    "idProduccionRodeo" TEXT NOT NULL,
    "idRodeo" TEXT NOT NULL,
    "idLote" TEXT NOT NULL,
    "idRaza" TEXT NOT NULL,
    "razaNombre" "Razas" NOT NULL,
    "cantVacas" INTEGER NOT NULL,

    CONSTRAINT "ProduccionRodeo_pkey" PRIMARY KEY ("idProduccionRodeo")
);

-- CreateTable
CREATE TABLE "LoteProduccion" (
    "idLote" TEXT NOT NULL,
    "numeroLote" INTEGER NOT NULL,
    "fechaProduccion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idProducto" TEXT NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "unidad" "Unidad" NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT false,
    "destino" "TipoDestino" NOT NULL,
    "cantBajadas" INTEGER NOT NULL,
    "tempTanque" DECIMAL(13,2),
    "cantAnimales" INTEGER NOT NULL,
    "rodeoIdRodeo" TEXT,

    CONSTRAINT "LoteProduccion_pkey" PRIMARY KEY ("idLote")
);

-- CreateTable
CREATE TABLE "Merma" (
    "idMerma" TEXT NOT NULL,
    "tipo" "TipoMerma" NOT NULL,
    "observacion" TEXT,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idLote" TEXT NOT NULL,

    CONSTRAINT "Merma_pkey" PRIMARY KEY ("idMerma")
);

-- CreateTable
CREATE TABLE "CostosDirecto" (
    "idCostoDirecto" TEXT NOT NULL,
    "monto" DECIMAL(13,2) NOT NULL,
    "observaciones" TEXT DEFAULT '',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idLote" TEXT NOT NULL,
    "moneda" "Moneda" NOT NULL DEFAULT 'ARS',
    "tipoCosto" "TipoCosto" NOT NULL,

    CONSTRAINT "CostosDirecto_pkey" PRIMARY KEY ("idCostoDirecto")
);

-- CreateTable
CREATE TABLE "CostoGeneral" (
    "idCostoGeneral" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "tipoCosto" "TipoCostoGeneral" NOT NULL,
    "descripcion" TEXT DEFAULT '',
    "monto" DECIMAL(13,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostoGeneral_pkey" PRIMARY KEY ("idCostoGeneral")
);

-- CreateTable
CREATE TABLE "VerificarToken" (
    "tokenid" TEXT NOT NULL,
    "idUsuario" TEXT NOT NULL,
    "tipo" "TipoToken" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "usadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificarToken_pkey" PRIMARY KEY ("tokenid")
);

-- CreateTable
CREATE TABLE "AiAnalysisEvent" (
    "idEventoIA" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "tipo" "TipoEventoIA" NOT NULL,
    "estado" "EstadoEventoIA" NOT NULL DEFAULT 'PENDING',
    "idLote" TEXT,
    "idResumenMensual" TEXT,
    "claveIdempotencia" TEXT NOT NULL,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "iniciadoEn" TIMESTAMP(3),
    "completadoEn" TIMESTAMP(3),
    "ultimoError" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiAnalysisEvent_pkey" PRIMARY KEY ("idEventoIA")
);

-- CreateTable
CREATE TABLE "AiAnalysisExecution" (
    "idEjecucionIA" TEXT NOT NULL,
    "idEventoIA" TEXT NOT NULL,
    "numeroIntento" INTEGER NOT NULL,
    "estado" "EstadoEjecucionIA" NOT NULL,
    "inicioEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finEn" TIMESTAMP(3),
    "duracionMs" INTEGER,
    "usoLLM" BOOLEAN NOT NULL DEFAULT false,
    "proveedor" TEXT,
    "modelo" TEXT,
    "tokensEntrada" INTEGER,
    "tokensSalida" INTEGER,
    "codigoError" TEXT,
    "mensajeError" TEXT,

    CONSTRAINT "AiAnalysisExecution_pkey" PRIMARY KEY ("idEjecucionIA")
);

-- CreateTable
CREATE TABLE "AlertaIA" (
    "idAlertaIA" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "idEventoIA" TEXT NOT NULL,
    "tipo" "TipoAlertaIA" NOT NULL,
    "nivel" "NivelAlerta" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "recomendacion" TEXT,
    "datosContexto" JSONB,
    "visto" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertaIA_pkey" PRIMARY KEY ("idAlertaIA")
);

-- CreateTable
CREATE TABLE "PromedioProductivo" (
    "idPromedioProductivo" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "ambito" "AmbitoPromedioProductivo" NOT NULL,
    "promedioLitrosPorAnimal" DECIMAL(10,2) NOT NULL,
    "cantidadLotes" INTEGER NOT NULL DEFAULT 0,
    "periodoDesde" TIMESTAMP(3),
    "periodoHasta" TIMESTAMP(3),
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromedioProductivo_pkey" PRIMARY KEY ("idPromedioProductivo")
);

-- CreateTable
CREATE TABLE "PromedioProductivoLote" (
    "idPromedioProductivoLote" TEXT NOT NULL,
    "idPromedioProductivo" TEXT NOT NULL,
    "idLote" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromedioProductivoLote_pkey" PRIMARY KEY ("idPromedioProductivoLote")
);

-- CreateTable
CREATE TABLE "ResumenMensual" (
    "idResumenMensual" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "fechaDesde" TIMESTAMP(3) NOT NULL,
    "fechaHasta" TIMESTAMP(3) NOT NULL,
    "cantidadLotes" INTEGER NOT NULL DEFAULT 0,
    "litrosProduccion" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "litrosMermas" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "litrosTotales" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "litrosLibres" DECIMAL(14,2),
    "costosTotales" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "costoPorLitro" DECIMAL(14,4),
    "calculadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumenMensual_pkey" PRIMARY KEY ("idResumenMensual")
);

-- CreateTable
CREATE TABLE "ResumenMensualCostoCategoria" (
    "idResumenCostoCategoria" TEXT NOT NULL,
    "idResumenMensual" TEXT NOT NULL,
    "categoria" "CategoriaCostoResumen" NOT NULL,
    "monto" DECIMAL(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT "ResumenMensualCostoCategoria_pkey" PRIMARY KEY ("idResumenCostoCategoria")
);

-- CreateTable
CREATE TABLE "PrecioMercado" (
    "idPrecioMercado" TEXT NOT NULL,
    "precioLitro" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "precioLitroPrevio" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "ultimaConsulta" TIMESTAMP(3) NOT NULL,
    "moneda" "Moneda" NOT NULL DEFAULT 'ARS',
    "fuente" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrecioMercado_pkey" PRIMARY KEY ("idPrecioMercado")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizacionUsuario_idOrganizacion_idUsuario_key" ON "OrganizacionUsuario"("idOrganizacion", "idUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "Establecimiento_OrganizacionUsuario_idEstablecimiento_idOrg_key" ON "Establecimiento_OrganizacionUsuario"("idEstablecimiento", "idOrganizacionUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_idEstablecimiento_key" ON "configuracion"("idEstablecimiento");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_nombreNormalizado_idOrganizacion_key" ON "Producto"("nombreNormalizado", "idOrganizacion");

-- CreateIndex
CREATE UNIQUE INDEX "EstablecimientoProducto_idEstablecimiento_idProducto_key" ON "EstablecimientoProducto"("idEstablecimiento", "idProducto");

-- CreateIndex
CREATE UNIQUE INDEX "Rodeo_idConfiguracion_tipoRodeo_key" ON "Rodeo"("idConfiguracion", "tipoRodeo");

-- CreateIndex
CREATE UNIQUE INDEX "Raza_idRodeo_nombre_key" ON "Raza"("idRodeo", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Animal_idEstablecimiento_codigo_key" ON "Animal"("idEstablecimiento", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "LoteProduccion_idEstablecimiento_numeroLote_key" ON "LoteProduccion"("idEstablecimiento", "numeroLote");

-- CreateIndex
CREATE INDEX "CostosDirecto_idLote_idx" ON "CostosDirecto"("idLote");

-- CreateIndex
CREATE INDEX "VerificarToken_idUsuario_tipo_idx" ON "VerificarToken"("idUsuario", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "AiAnalysisEvent_claveIdempotencia_key" ON "AiAnalysisEvent"("claveIdempotencia");

-- CreateIndex
CREATE INDEX "AiAnalysisEvent_estado_creadoEn_idx" ON "AiAnalysisEvent"("estado", "creadoEn");

-- CreateIndex
CREATE INDEX "AiAnalysisEvent_idEstablecimiento_creadoEn_idx" ON "AiAnalysisEvent"("idEstablecimiento", "creadoEn");

-- CreateIndex
CREATE INDEX "AiAnalysisExecution_idEventoIA_inicioEn_idx" ON "AiAnalysisExecution"("idEventoIA", "inicioEn");

-- CreateIndex
CREATE UNIQUE INDEX "AiAnalysisExecution_idEventoIA_numeroIntento_key" ON "AiAnalysisExecution"("idEventoIA", "numeroIntento");

-- CreateIndex
CREATE INDEX "AlertaIA_idEstablecimiento_creadoEn_idx" ON "AlertaIA"("idEstablecimiento", "creadoEn");

-- CreateIndex
CREATE INDEX "AlertaIA_idEstablecimiento_visto_creadoEn_idx" ON "AlertaIA"("idEstablecimiento", "visto", "creadoEn");

-- CreateIndex
CREATE INDEX "AlertaIA_idEventoIA_idx" ON "AlertaIA"("idEventoIA");

-- CreateIndex
CREATE UNIQUE INDEX "PromedioProductivo_idEstablecimiento_ambito_key" ON "PromedioProductivo"("idEstablecimiento", "ambito");

-- CreateIndex
CREATE UNIQUE INDEX "PromedioProductivoLote_idPromedioProductivo_idLote_key" ON "PromedioProductivoLote"("idPromedioProductivo", "idLote");

-- CreateIndex
CREATE UNIQUE INDEX "ResumenMensual_idEstablecimiento_anio_mes_key" ON "ResumenMensual"("idEstablecimiento", "anio", "mes");

-- CreateIndex
CREATE UNIQUE INDEX "ResumenMensualCostoCategoria_idResumenMensual_categoria_key" ON "ResumenMensualCostoCategoria"("idResumenMensual", "categoria");

-- AddForeignKey
ALTER TABLE "OrganizacionUsuario" ADD CONSTRAINT "OrganizacionUsuario_idOrganizacion_fkey" FOREIGN KEY ("idOrganizacion") REFERENCES "Organizacion"("idOrganizacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizacionUsuario" ADD CONSTRAINT "OrganizacionUsuario_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Establecimiento" ADD CONSTRAINT "Establecimiento_idOrganizacion_fkey" FOREIGN KEY ("idOrganizacion") REFERENCES "Organizacion"("idOrganizacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Establecimiento_OrganizacionUsuario" ADD CONSTRAINT "Establecimiento_OrganizacionUsuario_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Establecimiento_OrganizacionUsuario" ADD CONSTRAINT "Establecimiento_OrganizacionUsuario_idOrganizacionUsuario_fkey" FOREIGN KEY ("idOrganizacionUsuario") REFERENCES "OrganizacionUsuario"("idOrganizacionUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion" ADD CONSTRAINT "configuracion_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitacionOrganizacion" ADD CONSTRAINT "InvitacionOrganizacion_idInvitador_fkey" FOREIGN KEY ("idInvitador") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitacionOrganizacion" ADD CONSTRAINT "InvitacionOrganizacion_idOrganizacion_fkey" FOREIGN KEY ("idOrganizacion") REFERENCES "Organizacion"("idOrganizacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitacionEstablecimiento" ADD CONSTRAINT "InvitacionEstablecimiento_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitacionEstablecimiento" ADD CONSTRAINT "InvitacionEstablecimiento_idInvitador_fkey" FOREIGN KEY ("idInvitador") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_idOrganizacion_fkey" FOREIGN KEY ("idOrganizacion") REFERENCES "Organizacion"("idOrganizacion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstablecimientoProducto" ADD CONSTRAINT "EstablecimientoProducto_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstablecimientoProducto" ADD CONSTRAINT "EstablecimientoProducto_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto"("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rodeo" ADD CONSTRAINT "Rodeo_idConfiguracion_fkey" FOREIGN KEY ("idConfiguracion") REFERENCES "configuracion"("idConfiguracion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Raza" ADD CONSTRAINT "Raza_idRodeo_fkey" FOREIGN KEY ("idRodeo") REFERENCES "Rodeo"("idRodeo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoAnimal" ADD CONSTRAINT "MovimientoAnimal_idConfiguracion_fkey" FOREIGN KEY ("idConfiguracion") REFERENCES "configuracion"("idConfiguracion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoAnimal" ADD CONSTRAINT "MovimientoAnimal_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("idUsuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoAnimalDetalle" ADD CONSTRAINT "MovimientoAnimalDetalle_idAnimal_fkey" FOREIGN KEY ("idAnimal") REFERENCES "Animal"("idAnimal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoAnimalDetalle" ADD CONSTRAINT "MovimientoAnimalDetalle_idMovimiento_fkey" FOREIGN KEY ("idMovimiento") REFERENCES "MovimientoAnimal"("idMovimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_idRodeo_fkey" FOREIGN KEY ("idRodeo") REFERENCES "Rodeo"("idRodeo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduccionAnimal" ADD CONSTRAINT "ProduccionAnimal_idAnimal_fkey" FOREIGN KEY ("idAnimal") REFERENCES "Animal"("idAnimal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduccionAnimal" ADD CONSTRAINT "ProduccionAnimal_idLote_fkey" FOREIGN KEY ("idLote") REFERENCES "LoteProduccion"("idLote") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduccionRodeo" ADD CONSTRAINT "ProduccionRodeo_idRaza_fkey" FOREIGN KEY ("idRaza") REFERENCES "Raza"("idRaza") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduccionRodeo" ADD CONSTRAINT "ProduccionRodeo_idRodeo_fkey" FOREIGN KEY ("idRodeo") REFERENCES "Rodeo"("idRodeo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduccionRodeo" ADD CONSTRAINT "ProduccionRodeo_idLote_fkey" FOREIGN KEY ("idLote") REFERENCES "LoteProduccion"("idLote") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteProduccion" ADD CONSTRAINT "LoteProduccion_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteProduccion" ADD CONSTRAINT "LoteProduccion_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto"("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteProduccion" ADD CONSTRAINT "LoteProduccion_rodeoIdRodeo_fkey" FOREIGN KEY ("rodeoIdRodeo") REFERENCES "Rodeo"("idRodeo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Merma" ADD CONSTRAINT "Merma_idLote_fkey" FOREIGN KEY ("idLote") REFERENCES "LoteProduccion"("idLote") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostosDirecto" ADD CONSTRAINT "CostosDirecto_idLote_fkey" FOREIGN KEY ("idLote") REFERENCES "LoteProduccion"("idLote") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostoGeneral" ADD CONSTRAINT "CostoGeneral_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificarToken" ADD CONSTRAINT "VerificarToken_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAnalysisEvent" ADD CONSTRAINT "AiAnalysisEvent_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAnalysisEvent" ADD CONSTRAINT "AiAnalysisEvent_idLote_fkey" FOREIGN KEY ("idLote") REFERENCES "LoteProduccion"("idLote") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAnalysisEvent" ADD CONSTRAINT "AiAnalysisEvent_idResumenMensual_fkey" FOREIGN KEY ("idResumenMensual") REFERENCES "ResumenMensual"("idResumenMensual") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAnalysisExecution" ADD CONSTRAINT "AiAnalysisExecution_idEventoIA_fkey" FOREIGN KEY ("idEventoIA") REFERENCES "AiAnalysisEvent"("idEventoIA") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertaIA" ADD CONSTRAINT "AlertaIA_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertaIA" ADD CONSTRAINT "AlertaIA_idEventoIA_fkey" FOREIGN KEY ("idEventoIA") REFERENCES "AiAnalysisEvent"("idEventoIA") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromedioProductivo" ADD CONSTRAINT "PromedioProductivo_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromedioProductivoLote" ADD CONSTRAINT "PromedioProductivoLote_idPromedioProductivo_fkey" FOREIGN KEY ("idPromedioProductivo") REFERENCES "PromedioProductivo"("idPromedioProductivo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromedioProductivoLote" ADD CONSTRAINT "PromedioProductivoLote_idLote_fkey" FOREIGN KEY ("idLote") REFERENCES "LoteProduccion"("idLote") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumenMensual" ADD CONSTRAINT "ResumenMensual_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumenMensualCostoCategoria" ADD CONSTRAINT "ResumenMensualCostoCategoria_idResumenMensual_fkey" FOREIGN KEY ("idResumenMensual") REFERENCES "ResumenMensual"("idResumenMensual") ON DELETE CASCADE ON UPDATE CASCADE;
