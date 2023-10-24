import { crc32 } from "@aws-crypto/crc32";

export function getMascot(name: string): { uri: string } {
  const mascotIndex = crc32((new TextEncoder).encode(name)) % 749;
  return {
    uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${mascotIndex}.png`
  }
}