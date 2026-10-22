import jwt from "jsonwebtoken";
import { config } from "../config.js";
import type { UserProfile, UserRole } from "../types/auth.js";
import { formatRut, normalizeRut } from "../utils/rut.js";

interface DemoAccount extends UserProfile {
  password: string;
}

function createAccount(
  id: string,
  name: string,
  email: string,
  password: string,
  role: UserRole,
  rut: string,
): DemoAccount {
  const normalizedRut = normalizeRut(rut);
  if (!normalizedRut) {
    throw new Error(`El RUT configurado para ${role} no tiene un formato válido`);
  }

  return {
    id,
    name,
    email: email.toLowerCase(),
    password,
    role,
    rut: formatRut(normalizedRut),
  };
}

const accounts: DemoAccount[] = [
  createAccount(
    "demo-user",
    "Usuario Demo",
    config.demoUser.email,
    config.demoUser.password,
    "user",
    config.demoUser.rut,
  ),
  createAccount(
    "demo-admin",
    "Administración Demo",
    config.demoAdmin.email,
    config.demoAdmin.password,
    "admin",
    config.demoAdmin.rut,
  ),
];

export function authenticate(email: string, password: string): {
  token: string;
  user: UserProfile;
} | null {
  const account = accounts.find(
    (candidate) =>
      candidate.email === email.trim().toLowerCase() &&
      candidate.password === password,
  );
  if (!account) {
    return null;
  }

  const { password: _password, ...user } = account;
  const claims =
    user.role === "user"
      ? { role: user.role, rut: user.rut }
      : { role: user.role };
  const token = jwt.sign(
    claims,
    config.jwtSecret,
    { subject: user.id, expiresIn: "1h", issuer: "prontopaga-api" },
  );

  return { token, user };
}
