export function calculateScore(normalizedRut: string): number {
  let hash = 0;
  for (const character of normalizedRut) {
    hash = (hash * 31 + character.charCodeAt(0)) % 101;
  }
  return hash;
}
