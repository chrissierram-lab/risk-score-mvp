import { Router } from "express";
import { authenticateRequest } from "../middleware/authenticate.js";
import {
  authorizeScoreRut,
  validateScoreRut,
} from "../middleware/authorizeScoreRut.js";
import { calculateScore } from "../services/score.service.js";
import { formatRut } from "../utils/rut.js";

export const scoreRouter = Router();

scoreRouter.get(
  "/score/:rut",
  authenticateRequest,
  validateScoreRut,
  authorizeScoreRut,
  (req, res) => {
    const user = req.authUser;
    if (!user) {
      res.status(401).json({ message: "Debes iniciar sesión para continuar." });
      return;
    }

    const requestedRut = req.normalizedRut;
    if (!requestedRut) {
      res.status(400).json({ message: "El RUT ingresado no tiene un formato válido." });
      return;
    }

    res.json({
      rut: formatRut(requestedRut),
      score: calculateScore(requestedRut),
      fecha: new Date().toISOString(),
    });
  },
);
