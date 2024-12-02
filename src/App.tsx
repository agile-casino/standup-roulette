import { MantineProvider } from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { RouletteDialog } from "./components/RouletteDialog";
import { store } from "./store";

export function App() {
  const [url, setUrl] = useState(window.location.href);
  const [origin, setOrigin] = useState(window.location.origin);
  const [dialogOpen, setDialogOpen] = useState(false);

  let colorScheme = useColorScheme();
  const activeForegroundColour = "black";
  const activeBackgroundColour = colorScheme === "dark" ? "silver" : "#CCFFAA";
  const inactiveForegroundColour = "unset";
  const inactiveBackgroundColour = "unset";

  const navMenu = document.querySelector(".project-navigation");
  if (navMenu) {
    const navMenuStyle = getComputedStyle(navMenu);
    if (navMenuStyle.backgroundColor === "rgb(59, 58, 57)") {
      colorScheme = "dark";
    }
  }

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

  // eslint-disable-next-line sonarjs/slow-regex
  const matches = /(?<collection>[\w%]+)\/(?<project>[\w%]+)\/_sprints\/taskboard\/[\w%]+\/[\w%]+\/(?<team>[\w%]+)\/(?<sprint>[\w.%()]+)/.exec(url);

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
            background: dialogOpen ? activeBackgroundColour : inactiveBackgroundColour,
            border: "1px solid rgb(234,234,234)",
            color: dialogOpen ? activeForegroundColour : inactiveForegroundColour
          }}
        >
          Standup Roulette
        </button>
        <Provider store={store}>
          <MantineProvider defaultColorScheme={colorScheme}>
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
          </MantineProvider>
        </Provider>
      </>
    );
  }
  else {
    return null;
  }
}
