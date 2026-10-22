import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.routes.js";
import { scoreRouter } from "./routes/score.routes.js";

export const app = express();

app.use(cors({ origin: config.frontendOrigin }));
app.use(express.json({ limit: "10kb" }));
app.use(authRouter);
app.use(scoreRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "La ruta solicitada no existe." });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error("Error no controlado en la API:", error);
  res.status(500).json({ message: "Ocurrió un error interno. Intenta nuevamente." });
};

app.use(errorHandler);
