import { Button, Checkbox, Divider, Group, Input, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import type { ChangeEvent } from "react";
import { useRef } from "react";
import pkg from "../../package.json";
import { useRouletteStore } from "../store/useRouletteStore";
import { ImportExportSettings } from "./ImportExportSettings";
import styles from "./styles.module.css";

export function SettingsPanel() {
  const endImageUrls = useRouletteStore(state => state.games[state.currentGame].endImageUrls);
  const timerType = useRouletteStore(state => state.timerType);
  const timerDuration = useRouletteStore(state => state.timerDuration);
  const timerLimit = useRouletteStore(state => state.timerLimit);

  const addEndImageUrl = useRouletteStore(state => state.addEndImageUrl);
  const removeEndImageUrl = useRouletteStore(state => state.removeEndImageUrl);
  const setEndImageUrlValue = useRouletteStore(state => state.setEndImageUrlValue);
  const setEndImageUrlEnabled = useRouletteStore(state => state.setEndImageUrlEnabled);
  const setTimerType = useRouletteStore(state => state.setTimerType);
  const setTimerDuration = useRouletteStore(state => state.setTimerDuration);
  const setTimerLimit = useRouletteStore(state => state.setTimerLimit);
  const wheelType = useRouletteStore(state => state.wheelType);
  const setWheelType = useRouletteStore(state => state.setWheelType);

  const endImageUrlKeys = useRef<string[]>([]);
  const nextEndImageUrlKey = useRef(0);

  while (endImageUrlKeys.current.length < endImageUrls.length) {
    endImageUrlKeys.current.push(`end-image-url-${nextEndImageUrlKey.current++}`);
  }

  if (endImageUrlKeys.current.length > endImageUrls.length) {
    endImageUrlKeys.current = endImageUrlKeys.current.slice(0, endImageUrls.length);
  }

  const onEndImageUrlChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    setEndImageUrlValue(index, event.currentTarget.value);
  };

  const onEndImageUrlEnabledChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    setEndImageUrlEnabled(index, event.currentTarget.checked);
  };

  const onEndImageUrlAdd = () => {
    endImageUrlKeys.current.push(`end-image-url-${nextEndImageUrlKey.current++}`);
    addEndImageUrl();
  };

  const onEndImageUrlRemove = (index: number) => () => {
    endImageUrlKeys.current.splice(index, 1);
    removeEndImageUrl(index);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Title order={5} fw={400} className={styles.header}>
        Settings
      </Title>

      <div className={styles.settingsGrid}>
        {/* Section 1: End of standup images */}
        <div className={styles.settingsSection}>
          <div className={styles.cardTitle}>End of Standup Images</div>
          <div className={styles.cardSubtitle}>Configure image URLs to display when a standup roulette finishes.</div>
          <Stack gap={8}>
            {endImageUrls.map((endImageUrl, index) => (
              <div key={endImageUrlKeys.current[index]} className={styles.urlRow}>
                <Checkbox checked={endImageUrl.enabled} onChange={onEndImageUrlEnabledChange(index)} aria-label={`Enable image url ${index + 1}`} size="sm" />
                <Input placeholder="https://..." value={endImageUrl.url} onChange={onEndImageUrlChange(index)} style={{ flexGrow: 1 }} size="sm" />
                <Button variant="light" color="red" onClick={onEndImageUrlRemove(index)} size="xs">
                  Remove
                </Button>
              </div>
            ))}
            <Group mt="xs">
              <Button variant="outline" onClick={onEndImageUrlAdd} size="xs">
                Add URL
              </Button>
            </Group>
          </Stack>
        </div>

        <Divider my="md" />

        {/* Section 2: Speaker Timer */}
        <div className={styles.settingsSection}>
          <div className={styles.cardTitle}>Speaker Timer</div>
          <div className={styles.cardSubtitle}>Track individual speaker time with count up or count down timers.</div>
          <div className={styles.timerRow}>
            <div className={styles.timerControlCol}>
              <Input.Wrapper label="Timer Type">
                <SegmentedControl
                  value={timerType}
                  onChange={value => setTimerType(value as "off" | "down" | "up")}
                  data={[
                    { label: "Off", value: "off" },
                    { label: "Count Down", value: "down" },
                    { label: "Count Up", value: "up" }
                  ]}
                  size="sm"
                  fullWidth
                />
              </Input.Wrapper>
            </div>

            {timerType !== "off" && (
              <div className={styles.timerSelectCol}>
                <Input.Wrapper label={timerType === "down" ? "Count down from" : "Count up to (max 3 min)"}>
                  <SegmentedControl
                    value={String(timerType === "down" ? timerDuration : timerLimit)}
                    onChange={value => {
                      if (value) {
                        const numValue = Number.parseInt(value, 10);
                        if (timerType === "down") {
                          setTimerDuration(numValue);
                        } else {
                          setTimerLimit(numValue);
                        }
                      }
                    }}
                    data={[
                      { value: "60", label: "1m" },
                      { value: "120", label: "2m" },
                      { value: "180", label: "3m" }
                    ]}
                    size="sm"
                    fullWidth
                  />
                </Input.Wrapper>
              </div>
            )}
          </div>
        </div>

        <Divider my="md" />

        {/* Section 3: Roulette Wheel */}
        <div className={styles.settingsSection}>
          <div className={styles.cardTitle}>Roulette Wheel</div>
          <div className={styles.cardSubtitle}>Switch between the classic library wheel and the new custom wheel.</div>
          <div className={styles.timerRow}>
            <div className={styles.timerControlCol}>
              <Input.Wrapper label="Wheel Style">
                <SegmentedControl
                  value={wheelType}
                  onChange={value => setWheelType(value as "old" | "new")}
                  data={[
                    { label: "Classic", value: "old" },
                    { label: "Modern", value: "new" }
                  ]}
                  size="sm"
                  fullWidth
                />
              </Input.Wrapper>
            </div>
          </div>
        </div>

        <Divider my="md" />

        {/* Section 4: Actions / Import-Export */}
        <ImportExportSettings />
      </div>

      {/* Footer info */}
      <div className={styles.footer}>
        <Text size="xs" c="dimmed">
          Standup Roulette
        </Text>
        <Text size="xs" c="dimmed" fw={500}>
          v{pkg.version}
        </Text>
      </div>
    </div>
  );
}
