import { Button, Checkbox, Group, Input, SegmentedControl, Select, Stack, Title } from "@mantine/core";
import type { ChangeEvent } from "react";
import { useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addEndImageUrl,
  removeEndImageUrl,
  selectEndImageUrls,
  selectTimerDuration,
  selectTimerLimit,
  selectTimerType,
  setEndImageUrlEnabled,
  setEndImageUrlValue,
  setTimerDuration,
  setTimerLimit,
  setTimerType
} from "../store/roulette/rouletteSlice";
import { ImportExportSettings } from "./ImportExportSettings";
import styles from "./styles.module.css";

export function SettingsPanel() {
  const dispatch = useAppDispatch();
  const endImageUrls = useAppSelector(selectEndImageUrls);
  const timerType = useAppSelector(selectTimerType);
  const timerDuration = useAppSelector(selectTimerDuration);
  const timerLimit = useAppSelector(selectTimerLimit);
  const endImageUrlKeys = useRef<string[]>([]);
  const nextEndImageUrlKey = useRef(0);

  while (endImageUrlKeys.current.length < endImageUrls.length) {
    endImageUrlKeys.current.push(`end-image-url-${nextEndImageUrlKey.current++}`);
  }

  if (endImageUrlKeys.current.length > endImageUrls.length) {
    endImageUrlKeys.current = endImageUrlKeys.current.slice(0, endImageUrls.length);
  }

  const onEndImageUrlChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setEndImageUrlValue({ index, url: event.currentTarget.value }));
  };

  const onEndImageUrlEnabledChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setEndImageUrlEnabled({ index, enabled: event.currentTarget.checked }));
  };

  const onEndImageUrlAdd = () => {
    endImageUrlKeys.current.push(`end-image-url-${nextEndImageUrlKey.current++}`);
    dispatch(addEndImageUrl());
  };

  const onEndImageUrlRemove = (index: number) => () => {
    endImageUrlKeys.current.splice(index, 1);
    dispatch(removeEndImageUrl({ index }));
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
            onChange={value => dispatch(setTimerType(value as "off" | "down" | "up"))}
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
                    dispatch(setTimerDuration(numValue));
                  } else {
                    dispatch(setTimerLimit(numValue));
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
