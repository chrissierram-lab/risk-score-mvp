export type UserRole = "admin" | "user";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rut: string;
}

export interface Session {
  token: string;
  user: UserProfile;
}

export interface ScoreResult {
  rut: string;
  score: number;
  fecha: string;
}
