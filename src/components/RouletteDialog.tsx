import { Dialog } from "@mantine/core";
import { useState } from "react";
import { Header } from "./Header";
import { RouletteUsers } from "./RouletteUsers";
import { RouletteWheel } from "./RouletteWheel";
import { SettingsPanel } from "./SettingsPanel";
import styles from "./styles.module.css";

interface SettingsDialogProps {
  origin: string;
  collection: string;
  project: string;
  team: string;
  sprint: string;
  open: boolean;
  onCloseClicked: () => void;
}

export function RouletteDialog({ open, onCloseClicked }: Readonly<SettingsDialogProps>) {
  const [showSettings, setShowSettings] = useState(false);

  const toggleShowSettings = () => {
    setShowSettings(previousState => !previousState);
  };

  return (
    <Dialog opened={open} className={styles.dialog} position={{ bottom: 0, left: 0 }} w={1000} h={700} withBorder={true} withCloseButton={true} onClose={onCloseClicked}>
      <Header toggleShowSettings={toggleShowSettings} />
      {showSettings ? (
        <SettingsPanel />
      ) : (
        <div style={{ height: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <RouletteWheel />
          <RouletteUsers />
        </div>
      )}
    </Dialog>
  );
}
