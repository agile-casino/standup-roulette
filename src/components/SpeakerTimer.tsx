import { Button, Group, Text } from "@mantine/core";
import { IconPlayerPause, IconPlayerPlay, IconRotate } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

interface SpeakerTimerProps {
  timerType: "up" | "down";
  timerDuration: number;
  timerLimit: number;
}

export function SpeakerTimer({ timerType, timerDuration, timerLimit }: Readonly<SpeakerTimerProps>) {
  const getInitialTime = useCallback(() => {
    return timerType === "down" ? timerDuration : 0;
  }, [timerType, timerDuration]);

  const [time, setTime] = useState(getInitialTime);
  const [isRunning, setIsRunning] = useState(true);

  // Reset when winner changes or timer settings change
  useEffect(() => {
    setTime(getInitialTime());
    setIsRunning(true);
  }, [getInitialTime]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      setTime(prevTime => {
        if (timerType === "down") {
          if (prevTime <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prevTime - 1;
        }

        if (prevTime >= timerLimit) {
          clearInterval(interval);
          return timerLimit;
        }
        return prevTime + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timerType, timerLimit]);

  const isFinished = timerType === "down" ? time <= 0 : time >= timerLimit;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePlayPause = () => {
    setIsRunning(prev => !prev);
  };

  const handleReset = () => {
    setTime(getInitialTime());
    setIsRunning(true);
  };

  return (
    <div style={{ marginLeft: "3rem" }}>
      <style>
        {`
          @keyframes blink {
            50% { opacity: 0.5; }
          }
        `}
      </style>

      <Group gap="xs">
        <Text
          fw={700}
          style={{
            color: isFinished ? "#fa5252" : "inherit",
            transition: "color 0.2s ease",
            animation: isFinished ? "blink 1s step-end infinite" : "none"
          }}
        >
          {formatTime(time)}
        </Text>
        <Button variant="light" color={isRunning ? "yellow" : "green"} onClick={handlePlayPause} size="xs">
          {isRunning ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
        </Button>
        <Button variant="default" onClick={handleReset} size="xs">
          <IconRotate size={16} />
        </Button>
      </Group>
    </div>
  );
}
