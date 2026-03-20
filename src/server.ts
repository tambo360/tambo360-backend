import express from "express";
import { setupMiddleware } from "./middleware";
import apiRoutes from "./routes";
import config from "./config";
import { setupSwagger } from "./swagger";
import cookieParser from "cookie-parser";


const app = express();
console.log("ENV DATABASE_URL:", process.env.DATABASE_URL);
console.log("ENV DIRECT_URL:", process.env.DIRECT_URL);

setupMiddleware(app);
setupSwagger(app);

import { errorHandler } from "./middleware/errorMiddleware";

app.use("/api", apiRoutes);

// handler de errores global
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Example Auth Backend running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
