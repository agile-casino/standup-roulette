import { Button, Group } from "@mantine/core";
import type { RootState } from "../store";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { importState } from "../store/roulette/rouletteSlice";

export function ImportExportSettings() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state: RootState) => state.roulette);

  const handleExport = () => {
    try {
      const stateStr = JSON.stringify(state);
      const blob = new Blob([stateStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "standup-roulette-settings.json";
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export settings:", error);
      alert("Failed to export settings. Please try again.");
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const content = event.target?.result as string;
          const importedState = JSON.parse(content);
          dispatch(importState(importedState));
        } catch (error) {
          console.error("Failed to parse imported file:", error);
          alert("Failed to import settings. The file may be corrupted.");
        }
      };

      reader.onerror = () => {
        console.error("Failed to read the file");
        alert("Failed to read the file. Please try again.");
      };

      reader.readAsText(file);
    };

    input.click();
  };

  return (
    <Group mt={20}>
      <Button onClick={handleExport} variant="outline">
        Export Settings
      </Button>
      <Button onClick={handleImport} variant="outline">
        Import Settings
      </Button>
    </Group>
  );
}
