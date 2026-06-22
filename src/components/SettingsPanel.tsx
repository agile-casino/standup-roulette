import { Button, Checkbox, Group, Input, SegmentedControl, Select, Stack, Title } from "@mantine/core";
import type { ChangeEvent } from "react";
import { useRef } from "react";
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
    <div>
      <Title order={5} fw={400} className={styles.header}>
        Settings
      </Title>
      <Input.Wrapper label="End of standup image urls">
        <Stack gap={8}>
          {endImageUrls.map((endImageUrl, index) => (
            <Group key={endImageUrlKeys.current[index]} gap={8} wrap="nowrap">
              <Checkbox checked={endImageUrl.enabled} onChange={onEndImageUrlEnabledChange(index)} aria-label={`Enable image url ${index + 1}`} />
              <Input placeholder="https://..." value={endImageUrl.url} onChange={onEndImageUrlChange(index)} style={{ flexGrow: 1 }} />
              <Button variant="light" color="red" onClick={onEndImageUrlRemove(index)}>
                Remove
              </Button>
            </Group>
          ))}
          <Group>
            <Button variant="outline" onClick={onEndImageUrlAdd}>
              Add URL
            </Button>
          </Group>
        </Stack>
      </Input.Wrapper>

      <Stack gap="sm" style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
        <Input.Wrapper label="Speaker timer">
          <SegmentedControl
            value={timerType}
            onChange={value => setTimerType(value as "off" | "down" | "up")}
            data={[
              { label: "Off", value: "off" },
              { label: "Count Down", value: "down" },
              { label: "Count Up", value: "up" }
            ]}
            style={{ maxWidth: "300px" }}
          />
        </Input.Wrapper>

        {timerType !== "off" && (
          <Input.Wrapper label={timerType === "down" ? "Count down from" : "Count up to (max 5 min)"} style={{ paddingLeft: "1.5rem" }}>
            <Select
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
                { value: "30", label: "30 seconds" },
                { value: "60", label: "1 minute" },
                { value: "120", label: "2 minutes" },
                { value: "180", label: "3 minutes" },
                { value: "300", label: "5 minutes" }
              ]}
              style={{ maxWidth: "250px" }}
            />
          </Input.Wrapper>
        )}
      </Stack>

      <ImportExportSettings />
    </div>
  );
}
