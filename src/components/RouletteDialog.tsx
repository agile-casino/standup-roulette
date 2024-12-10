import { Dialog } from "@mantine/core";
import { useState } from "react";
import { Header } from "./Header";
import { RouletteUsers } from "./RouletteUsers";
import { RouletteWheel } from "./RouletteWheel";
import { SettingsPanel } from "./SettingsPanel";
import styles from "./RouletteDialog.module.css";

interface SettingsDialogProps {
  origin: string;
  collection: string;
  project: string;
  team: string;
  sprint: string;
  open: boolean;
  onCloseClicked: () => void;
}

export function RouletteDialog(props: Readonly<SettingsDialogProps>) {
  const [showSettings, setShowSettings] = useState(false);

  if (props.open) {
    return (
      <Dialog opened={true} className={styles.dialog} position={{ bottom: 0, left: 0 }} w={1000} h={700} withBorder={true} withCloseButton={true} onClose={props.onCloseClicked}>
        <Header setShowSettings={setShowSettings} />
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
}
