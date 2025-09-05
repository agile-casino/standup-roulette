import * as ReactDOM from "react-dom/client";
import { App } from "./App";
import { isInDocument } from "./utils/isInDocument";
import "@mantine/core/styles.layer.css";

const container = document.createElement("div");
container.className = "flex";

const root = ReactDOM.createRoot(container);
root.render(<App />);

let url = window.location.href;
const urlChangeEvent = new Event("urlChange");

const observer = new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== url) {
    window.dispatchEvent(urlChangeEvent);
    url = currentUrl;
  }
  if (!isInDocument(container)) {
    const searchHeader = document.querySelector(".expandable-search-header");
    searchHeader?.parentElement?.insertBefore(container, searchHeader);
  }
});

observer.observe(document.body, {
  subtree: true,
  characterData: true,
  childList: true
});
