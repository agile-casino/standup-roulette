import { Input, Title } from "@mantine/core";
import type { ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectEndImageUrl, setEndImageUrl } from "../store/roulette/rouletteSlice";
import styles from "./RouletteDialog.module.css";

export function SettingsPanel() {
  const dispatch = useAppDispatch();
  const endImageUrl = useAppSelector(selectEndImageUrl);

  const onEndImageUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setEndImageUrl({ url: event.currentTarget.value }));
  };

  return (
    <div>
      <Title order={5} fw={400} className={styles.header}>
        Settings
      </Title>
      <Input.Wrapper label="End of standup image url">
        <Input placeholder="(default)" value={endImageUrl} onChange={onEndImageUrlChange} />
      </Input.Wrapper>
    </div>
  );
}
