import { crc24 } from "crc";

const numberOfPokemonImagesAvailable = 1017;

export function getMascot(name: string, randomSeed: number): number {
  return (crc24(new TextEncoder().encode(name)) ^ Math.floor(randomSeed * 16777216)) % numberOfPokemonImagesAvailable;
}
