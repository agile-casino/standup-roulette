import { Button, Group } from "@mantine/core";
import { useRouletteStore } from "../store/useRouletteStore";

export function ImportExportSettings() {
  const currentGame = useRouletteStore(state => state.currentGame);
  const games = useRouletteStore(state => state.games);
  const timerType = useRouletteStore(state => state.timerType);
  const timerDuration = useRouletteStore(state => state.timerDuration);
  const timerLimit = useRouletteStore(state => state.timerLimit);
  const importState = useRouletteStore(state => state.importState);

  const handleExport = () => {
    try {
      const stateToExport = {
        currentGame,
        games,
        timerType,
        timerDuration,
        timerLimit
      };
      const stateStr = JSON.stringify(stateToExport);
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
          importState(importedState);
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
