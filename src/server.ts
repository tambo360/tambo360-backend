import express from "express";
import { setupMiddleware } from "./middleware";
import apiRoutes from "./routes";
import config from "./config";
import { setupSwagger } from "./swagger";
import { errorHandler } from "./middleware/errorMiddleware";
import { iniciarCrons } from "./cron";
import rateLimit from "express-rate-limit";

//1000 requests por IP cada 15 minutos (límite suave para evitar bloqueos innecesarios)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});


const app = express();
console.log("ENV DATABASE_URL:", process.env.DATABASE_URL);
console.log("ENV DIRECT_URL:", process.env.DIRECT_URL);

setupMiddleware(app);
setupSwagger(app);


app.use("/api", globalLimiter, apiRoutes);

// handler de errores global
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Example Auth Backend running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);

  if (process.env.ENABLE_CRONS === "true") {

    console.log("[CRON] Crons habilitados");

    iniciarCrons();

  } else {

    console.log("[CRON] Crons deshabilitados");

  }
});
