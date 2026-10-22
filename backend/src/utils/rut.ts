const RUT_PATTERN = /^\d{7,8}[0-9K]$/;

export function normalizeRut(value: string): string | null {
  const normalized = value.replace(/[.\-\s]/g, "").toUpperCase();
  return RUT_PATTERN.test(normalized) ? normalized : null;
}

export function formatRut(value: string): string {
  const normalized = normalizeRut(value);
  if (!normalized) {
    throw new Error("No se puede formatear un RUT inválido");
  }

  const body = normalized.slice(0, -1);
  const checkDigit = normalized.slice(-1);
  const groups: string[] = [];
  for (let end = body.length; end > 0; end -= 3) {
    groups.unshift(body.slice(Math.max(0, end - 3), end));
  }

  return `${groups.join(".")}-${checkDigit}`;
}
