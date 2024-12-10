import { ActionIcon, TextInput, Title } from "@mantine/core";
import { IconArrowLeft, IconArrowRight, IconSettings } from "@tabler/icons-react";
import type { Dispatch, SetStateAction } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { nextGame, prevGame, setGameName } from "../store/roulette/rouletteSlice";
import { selectGameName } from "../store/roulette/rouletteSlice";
import styles from "./RouletteDialog.module.css";

interface HeaderProps {
  setShowSettings: Dispatch<SetStateAction<boolean>>;
}

export function Header({ setShowSettings }: Readonly<HeaderProps>) {
  const dispatch = useAppDispatch();

  const gameName = useAppSelector(selectGameName);

  const onSettingsClick = () => {
    setShowSettings(showSettings => !showSettings);
  };

  const onGameNameUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setGameName({ name: event.currentTarget.value }));
  };

  const onPrevGameClick = () => {
    dispatch(prevGame());
  };

  const onNextGameClick = () => {
    dispatch(nextGame());
  };

  return (
    <>
      <ActionIcon variant="subtle" style={{ position: "absolute", top: "calc(var(--mantine-spacing-md) / 2)", right: "calc(var(--ai-size) + var(--mantine-spacing-md) / 2)" }} onClick={onSettingsClick}>
        <IconSettings />
      </ActionIcon>
      <Title order={4} fw={400} className={styles.header}>
        <span>Standup Roulette</span>
        <ActionIcon style={{ margin: "0 1rem", verticalAlign: "bottom" }} onClick={onPrevGameClick}>
          <IconArrowLeft />
        </ActionIcon>
        <span>
          <TextInput value={gameName} style={{ display: "inline-block" }} onChange={onGameNameUpdate} />
        </span>
        <ActionIcon style={{ margin: "0 1rem", verticalAlign: "bottom" }} onClick={onNextGameClick}>
          <IconArrowRight />
        </ActionIcon>
      </Title>
    </>
  );
}
