import { crc24 } from "crc";

const numberOfPokemonImagesAvailable = 749;

export function getMascot(name: string, randomSeed: number): { uri: string } {
  const mascotIndex = ((crc24((new TextEncoder).encode(name)) ^ Math.floor(randomSeed * 16777216)) % numberOfPokemonImagesAvailable);
  return {
    uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${mascotIndex}.png`
  }
}