import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import test, { after, before } from "node:test";
import jwt from "jsonwebtoken";

const testSecret = "test-only-jwt-secret-with-at-least-32-characters";
process.env.JWT_SECRET = testSecret;
process.env.PORT = "3001";
process.env.FRONTEND_ORIGIN = "http://localhost:5173";
process.env.DEMO_USER_EMAIL = "usuario@demo.cl";
process.env.DEMO_USER_PASSWORD = "usuario123";
process.env.DEMO_USER_RUT = "12.345.678-9";
process.env.DEMO_ADMIN_EMAIL = "admin@demo.cl";
process.env.DEMO_ADMIN_PASSWORD = "admin123";
process.env.DEMO_ADMIN_RUT = "76.123.456-0";

const { app } = await import("./app.js");

let server: Server;
let baseUrl: string;

before(async () => {
  server = app.listen(0);
  await once(server, "listening");

  const address = server.address();
  assert.ok(address && typeof address !== "string");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

async function login(email: string, password: string): Promise<string> {
  const response = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(response.status, 200);

  const body: unknown = await response.json();
  assert.ok(typeof body === "object" && body !== null);
  assert.ok("token" in body && typeof body.token === "string");
  return body.token;
}

function bearer(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

test("JWT incluye rut para user y lo omite para admin", async () => {
  const userToken = await login("usuario@demo.cl", "usuario123");
  const userClaims = jwt.verify(userToken, testSecret, { issuer: "prontopaga-api" });
  assert.ok(typeof userClaims === "object" && userClaims !== null);
  assert.equal(userClaims.sub, "demo-user");
  assert.equal(userClaims.role, "user");
  assert.equal(userClaims.rut, "12.345.678-9");

  const adminToken = await login("admin@demo.cl", "admin123");
  const adminClaims = jwt.verify(adminToken, testSecret, { issuer: "prontopaga-api" });
  assert.ok(typeof adminClaims === "object" && adminClaims !== null);
  assert.equal(adminClaims.sub, "demo-admin");
  assert.equal(adminClaims.role, "admin");
  assert.equal(Object.hasOwn(adminClaims, "rut"), false);
});

test("requiere un JWT válido y rechaza tokens expirados", async () => {
  const unauthenticated = await fetch(`${baseUrl}/score/12.345.678-9`);
  assert.equal(unauthenticated.status, 401);

  const expiredToken = jwt.sign(
    { role: "user", rut: "12.345.678-9" },
    testSecret,
    { subject: "expired-user", expiresIn: -1, issuer: "prontopaga-api" },
  );
  const expired = await fetch(`${baseUrl}/score/12.345.678-9`, {
    headers: bearer(expiredToken),
  });
  assert.equal(expired.status, 401);
});

test("user consulta solo su RUT y el score se mantiene para formatos equivalentes", async () => {
  const token = await login("usuario@demo.cl", "usuario123");
  const first = await fetch(`${baseUrl}/score/12.345.678-9`, {
    headers: bearer(token),
  });
  assert.equal(first.status, 200);
  const firstBody: unknown = await first.json();
  assert.ok(typeof firstBody === "object" && firstBody !== null);
  assert.ok("score" in firstBody && typeof firstBody.score === "number");
  assert.ok(firstBody.score >= 0 && firstBody.score <= 100);

  const equivalent = await fetch(`${baseUrl}/score/123456789`, {
    headers: bearer(token),
  });
  assert.equal(equivalent.status, 200);
  const equivalentBody: unknown = await equivalent.json();
  assert.ok(typeof equivalentBody === "object" && equivalentBody !== null);
  assert.ok("score" in equivalentBody && typeof equivalentBody.score === "number");
  assert.equal(equivalentBody.score, firstBody.score);

  const forbidden = await fetch(`${baseUrl}/score/76.123.456-0`, {
    headers: bearer(token),
  });
  assert.equal(forbidden.status, 403);
});

test("admin consulta otros RUT y los formatos inválidos se rechazan", async () => {
  const token = await login("admin@demo.cl", "admin123");
  const allowed = await fetch(`${baseUrl}/score/12.345.678-9`, {
    headers: bearer(token),
  });
  assert.equal(allowed.status, 200);

  const invalid = await fetch(`${baseUrl}/score/no-es-un-rut`, {
    headers: bearer(token),
  });
  assert.equal(invalid.status, 400);
});

test("login rechaza credenciales incorrectas", async () => {
  const response = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "usuario@demo.cl", password: "incorrecta" }),
  });
  assert.equal(response.status, 401);
});
