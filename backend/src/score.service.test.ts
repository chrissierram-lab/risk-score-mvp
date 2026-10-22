import assert from "node:assert/strict";
import test from "node:test";
import { calculateScore } from "./services/score.service.js";
import { normalizeRut } from "./utils/rut.js";

test("mantiene el mismo score para el mismo RUT normalizado", () => {
  const formattedRut = normalizeRut("12.345.678-9");
  const unformattedRut = normalizeRut("123456789");

  assert.ok(formattedRut);
  assert.ok(unformattedRut);
  assert.equal(formattedRut, unformattedRut);
  assert.equal(calculateScore(formattedRut), calculateScore(unformattedRut));
});

test("entrega un score dentro del rango de 0 a 100", () => {
  const rut = normalizeRut("76.123.456-0");
  assert.ok(rut);

  const score = calculateScore(rut);
  assert.ok(Number.isInteger(score));
  assert.ok(score >= 0 && score <= 100);
});

test("rechaza formatos de RUT que no corresponden", () => {
  assert.equal(normalizeRut("abc"), null);
  assert.equal(normalizeRut("123-45"), null);
});
