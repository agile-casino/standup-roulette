import { MantineProvider } from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { RouletteDialog } from "./components/RouletteDialog";

function useUrl() {
  const [url, setUrl] = useState(window.location.href);
  const [origin, setOrigin] = useState(window.location.origin);

  useEffect(() => {
    function onUrlChange() {
      setUrl(window.location.href);
      setOrigin(window.location.origin);
    }
    window.addEventListener("urlChange", onUrlChange);
    return () => {
      window.removeEventListener("urlChange", onUrlChange);
    };
  }, []);

  return { url, origin };
}

function useColorSchemeFromNavMenu() {
  let colorScheme = useColorScheme();
  const navMenu = document.querySelector(".project-navigation");
  if (navMenu) {
    const navMenuStyle = getComputedStyle(navMenu);
    if (navMenuStyle.backgroundColor === "rgb(59, 58, 57)") {
      colorScheme = "dark";
    }
  }
  return colorScheme;
}

export function App() {
  const { url, origin } = useUrl();
  const [dialogOpen, setDialogOpen] = useState(false);
  const colorScheme = useColorSchemeFromNavMenu();

  const activeForegroundColour = "black";
  const activeBackgroundColour = colorScheme === "dark" ? "silver" : "#CCFFAA";
  const inactiveForegroundColour = "unset";
  const inactiveBackgroundColour = "unset";

  const matches = /(?<collection>[\w\-%]+)\/(?<project>[\w\-%]+)\/_sprints\/taskboard\/(?<team>[\w\-%]+)\/.+?\/(?<sprint>Sprint[\w\-.%()]+)/.exec(url);

  if (matches?.groups) {
    const { collection, project, team, sprint } = matches.groups;
    return (
      <>
        <button
          type="button"
          onClick={() => setDialogOpen(previous => !previous)}
          style={{
            height: "32px",
            margin: "auto 8px",
            background: dialogOpen ? activeBackgroundColour : inactiveBackgroundColour,
            border: "1px solid rgb(234,234,234)",
            color: dialogOpen ? activeForegroundColour : inactiveForegroundColour
          }}
        >
          Standup Roulette
        </button>
        <MantineProvider defaultColorScheme={colorScheme}>
          <RouletteDialog open={dialogOpen} onCloseClicked={() => setDialogOpen(previous => !previous)} />
        </MantineProvider>
      </>
    );
  }
  return null;
}
