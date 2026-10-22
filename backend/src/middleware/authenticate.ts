import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";
import { config } from "../config.js";
import type { AuthPayload, UserRole } from "../types/auth.js";

function isAuthPayload(value: unknown): value is AuthPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;
  if (typeof payload.sub !== "string") {
    return false;
  }
  if (payload.role === "user") {
    return typeof payload.rut === "string";
  }
  return payload.role === "admin" && !("rut" in payload);
}

export const authenticateRequest: RequestHandler = (req, res, next) => {
  const authorization = req.header("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!token) {
    res.status(401).json({ message: "Debes iniciar sesión para continuar." });
    return;
  }

  try {
    const payload: unknown = jwt.verify(token, config.jwtSecret, {
      issuer: "prontopaga-api",
    });
    if (!isAuthPayload(payload)) {
      res.status(401).json({ message: "El token no es válido." });
      return;
    }

    req.authUser = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "La sesión expiró o el token no es válido." });
      return;
    }
    next(error);
  }
};
