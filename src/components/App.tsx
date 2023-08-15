import { useEffect, useState } from "react";
import { RouletteDialog } from "./RouletteDialog";

export function App() {
  const [url, setUrl] = useState(window.location.href);
  const [origin, setOrigin] = useState(window.location.origin);
  const [dialogOpen, setDialogOpen] = useState(false);

  function onUrlChange() {
    setUrl(window.location.href);
    setOrigin(window.location.origin);
  }

  useEffect(() => {
    window.addEventListener("urlChange", onUrlChange);
    return () => {
      window.removeEventListener("urlChange", onUrlChange);
    };
  }, []);

  const matches = url.match(/(?<collection>[\w\d_%]+)\/(?<project>[\w\d_%]+)\/_sprints\/taskboard\/[\w\d_%]+\/[\w\d_%]+\/(?<team>[\w\d_%]+)\/(?<sprint>[\w\d_.%()]+)/);

  if (matches?.groups) {
    const collection = decodeURI(matches.groups.collection);
    const project = decodeURI(matches.groups.project);
    const team = decodeURI(matches.groups.team);
    const sprint = decodeURI(matches.groups.sprint);
    return (
      <>
        <button
          onClick={() => {
            setDialogOpen(!dialogOpen);
          }}
          style={{
            height: "32px",
            margin: "auto 8px",
            background: dialogOpen ? "#CCFFAA" : "none",
            border: "1px solid rgb(234,234,234)"
          }}
        >
          Standup Roulette
        </button>
        <RouletteDialog
          origin={origin}
          collection={collection}
          project={project}
          team={team}
          sprint={sprint}
          open={dialogOpen}
          onCloseClicked={() => {
            setDialogOpen(!dialogOpen);
          }}
        />
      </>
    );
  }
  else {
    return null;
  }
}
