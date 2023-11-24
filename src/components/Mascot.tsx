import { useEffect, useState } from "react";

interface MascotData {
    name: string;
    sprites: {
        other: {
            "official-artwork": {
                front_default: string
            }
        }
    }
}

interface MascotProps {
    number: number;
    width: number;
    height: number;
}

export function Mascot({ number, width, height }: MascotProps) {
  const [data, setData] = useState<MascotData | null>(null);

  useEffect(() => {
    getData(number)
      .then(setData)
      .catch(console.error)
  }, [number]);

  return data
    ? <img src={data.sprites.other["official-artwork"].front_default} alt={data.name} title={data.name} width={width} height={height} />
    : null;
}

async function getData(number: number): Promise<MascotData | null> {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${number}`);

  return response.ok
    ? await response.json() as MascotData
    : null;
}
