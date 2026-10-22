import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { login, getScore } from "../services/api";
import { LoginPage } from "./LoginPage";
import { ScorePage } from "./ScorePage";
import type { Session } from "../types";

vi.mock("../services/api", () => ({
  login: vi.fn(),
  getScore: vi.fn(),
  roleLabel: (role: "admin" | "user") =>
    role === "admin" ? "Administración" : "Usuario",
}));

const session: Session = {
  token: "test-token",
  user: {
    id: "demo-user",
    name: "Usuario Demo",
    email: "usuario@demo.cl",
    role: "user",
    rut: "12.345.678-9",
  },
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("flujos principales de la interfaz", () => {
  it("muestra el rechazo de credenciales al fallar el login", async () => {
    vi.mocked(login).mockRejectedValueOnce(
      new Error("Email o contraseña incorrectos."),
    );
    const user = userEvent.setup();
    render(<LoginPage onLogin={vi.fn()} />);

    await user.type(screen.getByRole("textbox", { name: "Email" }), "bad@email.cl");
    await user.type(screen.getByLabelText("Contraseña"), "incorrecta");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email o contraseña incorrectos.",
    );
    expect(login).toHaveBeenCalledWith("bad@email.cl", "incorrecta");
  });

  it("muestra el score cuando la consulta termina correctamente", async () => {
    vi.mocked(getScore).mockResolvedValueOnce({
      rut: "12.345.678-9",
      score: 73,
      fecha: "2025-06-27T14:35:00.000Z",
    });
    const user = userEvent.setup();
    render(<ScorePage session={session} onLogout={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Consultar score" }));

    expect(await screen.findByText("73")).toBeInTheDocument();
    expect(getScore).toHaveBeenCalledWith("test-token", "12.345.678-9");
  });

  it("muestra un mensaje cuando el usuario intenta consultar otro RUT", async () => {
    vi.mocked(getScore).mockRejectedValueOnce(
      new Error("Solo puedes consultar el RUT asociado a tu cuenta."),
    );
    const user = userEvent.setup();
    render(<ScorePage session={session} onLogout={vi.fn()} />);

    const rutInput = screen.getByRole("textbox", { name: "RUT" });
    await user.clear(rutInput);
    await user.type(rutInput, "76.123.456-0");
    await user.click(screen.getByRole("button", { name: "Consultar score" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Solo puedes consultar el RUT asociado a tu cuenta.",
    );
    expect(getScore).toHaveBeenCalledWith("test-token", "76.123.456-0");
  });
});
