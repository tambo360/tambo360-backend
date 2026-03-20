import cors from "cors";
import bodyParser from "body-parser";
import { Application, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";

export const setupMiddleware = (app: Application): void => {
  const origins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : "http://localhost:5173";

  app.use(
    cors({
      origin: origins,
      credentials: true,
    })
  );

  app.use(bodyParser.json());
  app.use(cookieParser());

  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
};