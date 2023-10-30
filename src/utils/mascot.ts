import { crc32 } from "@aws-crypto/crc32";

const getHardCodedValues = (name: string) => {
  switch (name.toLowerCase()) {
    case "adam e":
      return 158;
    default:
      return crc32((new TextEncoder).encode(name)) % 749;
  }
}

export function getMascot(name: string): { uri: string } {
  const mascotIndex = getHardCodedValues(name);
  return {
    uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${mascotIndex}.png`
  }
}