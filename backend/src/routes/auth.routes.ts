import { Router } from "express";
import { authenticate } from "../services/auth.service.js";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ message: "Ingresa un email y una contraseña válidos." });
    return;
  }

  const session = authenticate(email, password);
  if (!session) {
    res.status(401).json({ message: "Email o contraseña incorrectos." });
    return;
  }

  res.json(session);
});
