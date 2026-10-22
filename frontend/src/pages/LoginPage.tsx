import { useState, type FormEvent } from "react";
import { Brand } from "../components/Brand";
import { login } from "../services/api";
import type { Session } from "../types";

interface LoginPageProps {
  onLogin: (session: Session) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      onLogin(await login(email, password));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo iniciar sesión.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-layout">
      <section className="login-intro" aria-labelledby="welcome-title">
        <Brand />
        <div className="login-intro__copy">
          <span className="eyebrow">Consulta de riesgo financiero</span>
          <h1 id="welcome-title">
            Información clara para decisiones más seguras.
          </h1>
          <p>
            Accede a la plataforma de demostración y consulta un score por RUT
            con acceso protegido.
          </p>
        </div>
        <p className="login-intro__footnote">
          Entorno de demostración · Datos ficticios
        </p>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-card">
          <div className="login-card__heading">
            <span className="eyebrow">Bienvenido</span>
            <h2 id="login-title">Iniciar sesión</h2>
            <p>Ingresa tus credenciales para continuar.</p>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Email</span>
              <input
                autoComplete="username"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nombre@correo.cl"
                required
              />
            </label>
            <label className="field">
              <span>Contraseña</span>
              <input
                autoComplete="current-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Ingresa tu contraseña"
                required
              />
            </label>
            {error && (
              <p className="notice notice--error" role="alert">
                {error}
              </p>
            )}
            <button className="button button--primary" disabled={loading}>
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>

          <p className="login-card__hint">
            Usa una de las cuentas de prueba documentadas en el README.
          </p>
        </div>
      </section>
    </main>
  );
}
