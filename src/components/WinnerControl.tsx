import { Text } from "@mantine/core";
import { useEffect, useState } from "react";

interface MascotData {
  name: string;
  sprites: {
    other: {
      "home"?: {
        front_default?: string;
      };
      "official-artwork"?: {
        front_default: string;
      };
    };
  };
}

interface WinnerControlProps {
  name: string;
  mascotNumber: number;
}

export function WinnerControl({ name, mascotNumber: number }: Readonly<WinnerControlProps>) {
  const [data, setData] = useState<MascotData | null>(null);

  useEffect(() => {
    setData(null);
    getData(number)
      .then(setData)
      .catch((e: unknown) => console.error(e));
  }, [number]);

  const src = data?.sprites.other.home?.front_default ?? data?.sprites.other["official-artwork"]?.front_default;

  if (name) {
    return (
      <div className="winner" style={{ display: "inline-grid" }}>
        <Text fz="xl" style={{ gridColumn: 1 }}>
          Winner:&nbsp;
        </Text>
        <div style={{ gridColumn: 3, gridRow: "1 / span 2" }}>{data && src && <img src={src} alt={data.name} title={data.name} width={50} height={50} />}</div>
        <Text fz="xl" style={{ gridColumn: 2 }}>
          {name}
        </Text>
        {data && (
          <Text fz="md" lh="xs" style={{ gridColumn: 2 }}>
            {data.name}
          </Text>
        )}
      </div>
    );
  }

  return null;
}

async function getData(number: number): Promise<MascotData | null> {
  return new Promise(resolve => {
    GM_xmlhttpRequest({
      method: "GET",
      url: `https://pokeapi.co/api/v2/pokemon/${number}`,
      onload: response => resolve(JSON.parse(response.responseText) as MascotData),
      onerror: () => resolve(null)
    });
  });
}
