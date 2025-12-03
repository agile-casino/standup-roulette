import { Input, NativeSelect, Title } from "@mantine/core";
import type { ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectEndImageUrl, setEndImageUrl, setMascotApi } from "../store/roulette/rouletteSlice";
import { ImportExportSettings } from "./ImportExportSettings";
import styles from "./styles.module.css";

export enum MascotApi {
  Pokémon,
  Digimon
}

const mascotApiOptions = [
  { value: MascotApi[MascotApi.Pokémon], label: "Pokémon" },
  { value: MascotApi[MascotApi.Digimon], label: "Digimon" }
];

export function SettingsPanel() {
  const dispatch = useAppDispatch();
  const endImageUrl = useAppSelector(selectEndImageUrl);

  const onEndImageUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setEndImageUrl({ url: event.currentTarget.value }));
  };

  const onApiChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(setMascotApi({ api: MascotApi[event.currentTarget.value as keyof typeof MascotApi] }));
  };

  return (
    <div>
      <Title order={5} fw={400} className={styles.header}>
        Settings
      </Title>
      <Input.Wrapper label="End of standup image url">
        <Input placeholder="(default)" value={endImageUrl} onChange={onEndImageUrlChange} />
      </Input.Wrapper>
      <Input.Wrapper>
        <NativeSelect label="Mascot API" data={mascotApiOptions} defaultValue={MascotApi[MascotApi.Pokémon]} onChange={onApiChange}>
        </NativeSelect>  
      </Input.Wrapper>
      <ImportExportSettings />
    </div>
  );
}
