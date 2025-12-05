import { default as crc24 } from "crc/crc24";
import { MascotApi } from "../models/MascotApi";

const numberOfPokemonImagesAvailable = 1025;
const numberOfDigimonImagesAvailable = 1488;

export function getMascot(name: string, randomSeed: number, mascotApi: MascotApi): number {
  const maxNumber = mascotApi === MascotApi.Pokémon ? numberOfPokemonImagesAvailable : numberOfDigimonImagesAvailable;
  return (crc24(name) ^ Math.floor(randomSeed * 16777216)) % maxNumber;
}
