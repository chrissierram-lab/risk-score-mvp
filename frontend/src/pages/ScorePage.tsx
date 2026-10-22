import { useState, type FormEvent } from "react";
import { Brand } from "../components/Brand";
import { getScore, roleLabel } from "../services/api";
import type { ScoreResult, Session } from "../types";

interface ScorePageProps {
  session: Session;
  onLogout: () => void;
}

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function ScorePage({ session, onLogout }: ScorePageProps) {
  const [rut, setRut] = useState(session.user.rut);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setError("");
    setLoading(true);
    try {
      setResult(await getScore(session.token, rut));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo consultar el RUT.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Brand compact />
        <div className="topbar__account">
          <div className="account-copy">
            <span className="account-copy__name">{session.user.name}</span>
            <span className="account-copy__role">
              {roleLabel(session.user.role)}
            </span>
          </div>
          <button className="button button--quiet" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="dashboard__intro">
          <span className="eyebrow">Panel de consulta</span>
          <h1>Score financiero</h1>
          <p>
            Consulta el score asociado a un RUT. Los resultados de esta
            aplicación son exclusivamente demostrativos.
          </p>
        </section>

        <section className="query-card" aria-labelledby="query-title">
          <div className="section-heading">
            <span className="section-icon" aria-hidden="true">
              ↗
            </span>
            <div>
              <h2 id="query-title">Consultar por RUT</h2>
              <p>
                {session.user.role === "admin"
                  ? "Como administración, puedes consultar cualquier RUT válido."
                  : "Puedes consultar el RUT asociado a tu cuenta."}
              </p>
            </div>
          </div>
          <form className="query-form" onSubmit={handleSubmit}>
            <label className="field" htmlFor="rut">
              <span>RUT</span>
              <input
                id="rut"
                autoComplete="off"
                inputMode="text"
                value={rut}
                onChange={(event) => setRut(event.target.value)}
                placeholder="12.345.678-9"
                required
              />
            </label>
            <button className="button button--primary" disabled={loading}>
              {loading ? "Consultando…" : "Consultar score"}
            </button>
          </form>
          {error && (
            <p className="notice notice--error" role="alert">
              {error}
            </p>
          )}
        </section>

        {result ? (
          <section
            className="result-card"
            aria-labelledby="result-title"
            aria-live="polite"
          >
            <div className="result-card__header">
              <div>
                <span className="eyebrow">Resultado de demostración</span>
                <h2 id="result-title">{result.rut}</h2>
              </div>
              <span className="result-badge">Score</span>
            </div>
            <p className="score-value">{result.score}</p>
            <div className="result-card__footer">
              <span>Escala demostrativa: 0–100</span>
              <span>
                Consultado el {dateFormatter.format(new Date(result.fecha))}
              </span>
            </div>
          </section>
        ) : loading ? (
          <section className="empty-state" role="status" aria-live="polite">
            <span className="empty-state__icon" aria-hidden="true">
              …
            </span>
            <div>
              <h2>Consultando score</h2>
              <p>Estamos obteniendo el resultado para este RUT.</p>
            </div>
          </section>
        ) : (
          <section className="empty-state">
            <span className="empty-state__icon" aria-hidden="true">
              01
            </span>
            <div>
              <h2>Tu consulta aparecerá aquí</h2>
              <p>Ingresa un RUT válido para ver el resultado.</p>
            </div>
          </section>
        )}
        <p className="disclaimer">
          El score se genera de manera determinista para esta demo. No corresponde
          a datos reales ni debe utilizarse para evaluar personas o empresas.
        </p>
      </main>
    </div>
  );
}
