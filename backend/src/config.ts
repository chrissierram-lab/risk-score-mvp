import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta configurar la variable de entorno ${name}`);
  }
  return value;
}

const jwtSecret = required("JWT_SECRET");
if (jwtSecret.length < 32) {
  throw new Error("JWT_SECRET debe tener al menos 32 caracteres");
}

const port = Number(process.env.PORT ?? "3001");
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT debe ser un puerto válido");
}

export const config = {
  port,
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  jwtSecret,
  demoUser: {
    email: required("DEMO_USER_EMAIL"),
    password: required("DEMO_USER_PASSWORD"),
    rut: required("DEMO_USER_RUT"),
  },
  demoAdmin: {
    email: required("DEMO_ADMIN_EMAIL"),
    password: required("DEMO_ADMIN_PASSWORD"),
    rut: required("DEMO_ADMIN_RUT"),
  },
};
