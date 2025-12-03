/// <reference types="@types/tampermonkey" />

import { Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { selectMascotApi } from "../store/roulette/rouletteSlice";
import { useAppSelector } from "../store/hooks";
import { MascotApi } from "../types/MascotApi";

interface PokémonData {
  name: string;
  sprites: {
    other: {
      "home"?: {
        front_default?: string;
        front_shiny?: string;
      };
      "official-artwork"?: {
        front_default: string;
        front_shiny: string;
      };
    };
  };
}

interface DigimonData {
  name: string;
  xAntibody: boolean;
  images: {
    href: string;
    transparent: boolean;
  }[];
}

type MascotData = PokémonData | DigimonData;

interface WinnerControlProps {
  name: string;
  mascotNumber: number;
}

export function WinnerControl({ name, mascotNumber }: Readonly<WinnerControlProps>) {
  const [data, setData] = useState<MascotData | null>(null);
  const [isShiny, setIsShiny] = useState(false);
  const mascotApi = useAppSelector(selectMascotApi);

  useEffect(() => {
    setData(null);

    if (mascotApi === MascotApi.Pokémon) {
      // Add random chance for shiny (1/20 or 5% chance)
      setIsShiny(Math.random() < 0.05);
    } else {
      setIsShiny(false);
    }

    getMascotData(mascotApi, mascotNumber)
      .then(data => setData(data))
      .catch(console.error);
  }, [mascotNumber, mascotApi]);
  let mascotName = "";
  if (data) {
    mascotName = data?.name?.toUpperCase()[0] + data?.name?.slice(1)?.replace(/[-]./g, x => x.toUpperCase()[1]);
  }

  const date = new Date();
  const isAprilFirst = date.getMonth() === 3 && date.getDate() === 1;
  let shinySrc: string | undefined = undefined;
  let src: string = "";

  if (data && "sprites" in data) {
    shinySrc = data.sprites.other["official-artwork"]?.front_shiny ?? data.sprites.other.home?.front_shiny;

    if ((isAprilFirst || isShiny) && shinySrc) {
      mascotName = `Shiny ${mascotName}`;
      src = shinySrc;
    } else {
      src = data.sprites.other["official-artwork"]?.front_default ?? data.sprites.other.home?.front_default ?? "";
    }
  } else if (data && "images" in data && data.images?.length > 0) {
    src = data.images.find(image => image.transparent)?.href ?? data.images[0].href;
  }

  if (name) {
    return (
      <div className="winner" style={{ display: "inline-grid" }}>
        <Text fz="xl" style={{ gridColumn: 1 }}>
          Winner:&nbsp;
        </Text>
        <div style={{ gridColumn: 3, gridRow: "1 / span 2" }}>{data && src && <img src={src} alt={mascotName} title={mascotName} width={50} height={50} />}</div>
        <Text fz="xl" style={{ gridColumn: 2 }}>
          {name}
        </Text>
        {data && (
          <Text fz="md" lh="xs" style={{ gridColumn: 2 }}>
            {mascotName}
          </Text>
        )}
      </div>
    );
  }

  return null;
}

async function getMascotData(mascotApi: MascotApi, mascotNumber: number): Promise<MascotData | null> {
  return new Promise(resolve => {
     const baseUrl = mascotApi === MascotApi.Pokémon 
      ? "https://pokeapi.co/api/v2/pokemon/"
      : "https://digi-api.com/api/v1/digimon/";

    GM_xmlhttpRequest({
      method: "GET",
      url: `${baseUrl}${mascotNumber}`,
      onload: response => resolve(JSON.parse(response.responseText) as MascotData),
      onerror: () => resolve(null)
    });
  });
}