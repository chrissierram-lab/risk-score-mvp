import type { ScoreResult, Session, UserRole, UserProfile } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

interface ErrorResponse {
  message: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return isRecord(value) && typeof value.message === "string";
}

function isUserProfile(value: unknown): value is UserProfile {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    typeof value.rut === "string" &&
    (value.role === "admin" || value.role === "user")
  );
}

function isSession(value: unknown): value is Session {
  return (
    isRecord(value) &&
    typeof value.token === "string" &&
    isUserProfile(value.user)
  );
}

function isScoreResult(value: unknown): value is ScoreResult {
  return (
    isRecord(value) &&
    typeof value.rut === "string" &&
    typeof value.score === "number" &&
    Number.isInteger(value.score) &&
    value.score >= 0 &&
    value.score <= 100 &&
    typeof value.fecha === "string"
  );
}

async function readError(response: Response): Promise<Error> {
  const body: unknown = await response.json();
  return new Error(
    isErrorResponse(body) ? body.message : "No fue posible completar la solicitud.",
  );
}

export async function login(email: string, password: string): Promise<Session> {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw await readError(response);
  }

  const body: unknown = await response.json();
  if (!isSession(body)) {
    throw new Error("La API devolvió una respuesta de inicio de sesión inválida.");
  }
  return body;
}

export async function getScore(token: string, rut: string): Promise<ScoreResult> {
  const response = await fetch(`${API_URL}/score/${encodeURIComponent(rut)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await readError(response);
  }

  const body: unknown = await response.json();
  if (!isScoreResult(body)) {
    throw new Error("La API devolvió una respuesta de score inválida.");
  }
  return body;
}

export function roleLabel(role: UserRole): string {
  return role === "admin" ? "Administración" : "Usuario";
}
