import type { RequestHandler } from "express";
import { normalizeRut } from "../utils/rut.js";

export const validateScoreRut: RequestHandler = (req, res, next) => {
  const rutParam = req.params.rut;
  if (typeof rutParam !== "string") {
    res.status(400).json({ message: "El RUT ingresado no tiene un formato válido." });
    return;
  }

  const normalizedRut = normalizeRut(rutParam);
  if (!normalizedRut) {
    res.status(400).json({ message: "El RUT ingresado no tiene un formato válido." });
    return;
  }

  req.normalizedRut = normalizedRut;
  next();
};

export const authorizeScoreRut: RequestHandler = (req, res, next) => {
  const user = req.authUser;
  if (!user) {
    res.status(401).json({ message: "Debes iniciar sesión para continuar." });
    return;
  }

  if (user.role === "admin") {
    next();
    return;
  }

  const requestedRut = req.normalizedRut;
  if (!requestedRut || normalizeRut(user.rut) !== requestedRut) {
    res.status(403).json({ message: "Solo puedes consultar el RUT asociado a tu cuenta." });
    return;
  }

  next();
};
