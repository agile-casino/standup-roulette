import { ActionIcon, TextInput, Title } from "@mantine/core";
import { IconArrowLeft, IconArrowRight, IconSettings } from "@tabler/icons-react";
import type { ChangeEvent } from "react";
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { nextGame, prevGame, selectGameName, selectSpinning, setGameName } from "../store/roulette/rouletteSlice";
import styles from "./styles.module.css";

const maxGameIndex = 4;

interface HeaderProps {
  toggleShowSettings: () => void;
}

export function Header({ toggleShowSettings }: Readonly<HeaderProps>) {
  const dispatch = useAppDispatch();
  const gameName = useAppSelector(selectGameName);
  const spinning = useAppSelector(selectSpinning);
  const currentGame = useAppSelector(state => state.roulette.currentGame);

  const canGoPrevGame = !spinning && currentGame > 0;
  const canGoNextGame = !spinning && currentGame < maxGameIndex;

  const onGameNameUpdate = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(setGameName({ name: event.currentTarget.value }));
    },
    [dispatch]
  );

  const onPrevGameClick = useCallback(() => {
    dispatch(prevGame());
  }, [dispatch]);

  const onNextGameClick = useCallback(() => {
    dispatch(nextGame());
  }, [dispatch]);

  return (
    <>
      <ActionIcon variant="subtle" style={{ position: "absolute", top: "calc(var(--mantine-spacing-md) / 2)", right: "calc(var(--ai-size) + var(--mantine-spacing-md) / 2)" }} onClick={toggleShowSettings}>
        <IconSettings />
      </ActionIcon>
      <Title order={4} fw={400} className={styles.header}>
        <span>Standup Roulette</span>
        <ActionIcon style={{ margin: "0 1rem", verticalAlign: "bottom" }} onClick={onPrevGameClick} disabled={!canGoPrevGame}>
          <IconArrowLeft />
        </ActionIcon>
        <span>
          <TextInput value={gameName} style={{ display: "inline-block" }} onChange={onGameNameUpdate} />
        </span>
        <ActionIcon style={{ margin: "0 1rem", verticalAlign: "bottom" }} onClick={onNextGameClick} disabled={!canGoNextGame}>
          <IconArrowRight />
        </ActionIcon>
      </Title>
    </>
  );
}
