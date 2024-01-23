export function getColourScheme(numColours: number): string[] {
  const result = [];
  for (let i = 0; i < numColours; i++) {
    result.push(`hsl(${(i * 360) / numColours}, 75%, 65%)`);
  }
  return result;
}
