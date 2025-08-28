import { default as crc24 } from "crc/crc24";

const numberOfPokemonImagesAvailable = 1025;

export function getMascot(name: string, randomSeed: number): number {
  return (crc24(name) ^ Math.floor(randomSeed * 16777216)) % numberOfPokemonImagesAvailable;
}
