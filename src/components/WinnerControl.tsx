/// <reference types="@types/tampermonkey" />

import { Text } from "@mantine/core";
import { useEffect, useState } from "react";

interface MascotData {
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

interface WinnerControlProps {
  name: string;
  mascotNumber: number;
}

export function WinnerControl({ name, mascotNumber }: Readonly<WinnerControlProps>) {
  const [data, setData] = useState<MascotData | null>(null);
  const [isShiny, setIsShiny] = useState(false);

  useEffect(() => {
    setData(null);
    // Add random chance for shiny (1/20 or 5% chance)
    setIsShiny(Math.random() < 0.05);
    getData(mascotNumber)
      .then(data => setData(data))
      .catch(console.error);
  }, [mascotNumber]);

  let mascotName = "";
  if (data) {
    mascotName = data?.name?.toUpperCase()[0] + data?.name?.slice(1)?.replace(/[-]./g, x => x.toUpperCase()[1]);
  }

  const date = new Date();
  const isAprilFirst = date.getMonth() === 3 && date.getDate() === 1;
  const shinySrc = data?.sprites.other["official-artwork"]?.front_shiny ?? data?.sprites.other.home?.front_shiny;

  let src: string;
  if ((isAprilFirst || isShiny) && shinySrc) {
    mascotName = `Shiny ${mascotName}`;
    src = shinySrc;
  } else {
    src = data?.sprites.other["official-artwork"]?.front_default ?? data?.sprites.other.home?.front_default ?? "";
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

async function getData(mascotNumber: number): Promise<MascotData | null> {
  if (typeof GM_xmlhttpRequest === "undefined") {
    return null;
  }
  return new Promise(resolve => {
    GM_xmlhttpRequest({
      method: "GET",
      url: `https://pokeapi.co/api/v2/pokemon/${mascotNumber}`,
      onload: response => resolve(JSON.parse(response.responseText) as MascotData),
      onerror: () => resolve(null)
    });
  });
}
