import { ActionIcon, TextInput, Title } from "@mantine/core";
import { IconArrowLeft, IconArrowRight, IconSettings } from "@tabler/icons-react";
import type { ChangeEvent } from "react";
import { useCallback } from "react";
import { useRouletteStore } from "../store/useRouletteStore";
import { SpeakerTimer } from "./SpeakerTimer";
import styles from "./styles.module.css";

const maxGameIndex = 4;

interface HeaderProps {
  toggleShowSettings: () => void;
}

export function Header({ toggleShowSettings }: Readonly<HeaderProps>) {
  const gameName = useRouletteStore(state => state.games[state.currentGame].name);
  const spinning = useRouletteStore(state => state.games[state.currentGame].spinning);
  const currentGame = useRouletteStore(state => state.currentGame);
  const timerType = useRouletteStore(state => state.timerType);
  const timerDuration = useRouletteStore(state => state.timerDuration);
  const timerLimit = useRouletteStore(state => state.timerLimit);
  const winningName = useRouletteStore(state => state.games[state.currentGame].winningName);
  const remainingUsers = useRouletteStore(state => state.games[state.currentGame].remainingUsers);

  const setGameName = useRouletteStore(state => state.setGameName);
  const prevGame = useRouletteStore(state => state.prevGame);
  const nextGame = useRouletteStore(state => state.nextGame);

  const canGoPrevGame = !spinning && currentGame > 0;
  const canGoNextGame = !spinning && currentGame < maxGameIndex;

  const onGameNameUpdate = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setGameName(event.currentTarget.value);
    },
    [setGameName]
  );

  const onPrevGameClick = useCallback(() => {
    prevGame();
  }, [prevGame]);

  const onNextGameClick = useCallback(() => {
    nextGame();
  }, [nextGame]);

  return (
    <div style={{ marginBottom: "var(--mantine-spacing-md)" }}>
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
        {timerType !== "off" && !spinning && !!winningName && remainingUsers.length > 0 && <SpeakerTimer timerType={timerType as "up" | "down"} timerDuration={timerDuration} timerLimit={timerLimit} />}
      </Title>
    </div>
  );
}
