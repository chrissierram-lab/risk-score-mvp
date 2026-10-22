export type UserRole = "admin" | "user";

export type AuthPayload =
  | { sub: string; role: "user"; rut: string }
  | { sub: string; role: "admin" };

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rut: string;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthPayload;
      normalizedRut?: string;
    }
  }
}
