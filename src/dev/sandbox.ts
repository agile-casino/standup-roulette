// Developer Sandbox Simulator for Standup Roulette
// Simulates the Azure DevOps (ADOS) DOM environment and URL structures

interface SandboxLog {
  timestamp: string;
  type: "API" | "DOM";
  methodOrAction: string;
  details: string;
  status?: number;
}

class SandboxState {
  public isDarkMode = false;
  public currentUrlParams = {
    collection: "DefaultCollection",
    project: "WirelineRnD",
    team: "DE_BK_Green",
    sprint: "Sprint 13"
  };
  public logs: SandboxLog[] = [];

  // Active mockup state
  public activePerson = "All";
  public mockTeams = ["DE_BK_Green", "DE_BK_Blue", "DE_EX_Yellow", "Delta-Team"];
  public mockPeople: Record<string, string[]> = {
    "DE_BK_Green": ["Alice Green", "Bob Miller", "Jack Green"],
    "DE_BK_Blue": ["Dave Blue", "Eva White", "Frank Yellow"],
    "DE_EX_Yellow": ["Frank Yellow", "John Smith"],
    "Delta-Team": ["Sam Adams", "Sarah Connor", "John Connor"]
  };

  constructor() {
    this.loadState();
  }

  public loadState() {
    const saved = localStorage.getItem("standup-roulette-sandbox-state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.isDarkMode = !!parsed.isDarkMode;
        this.currentUrlParams = parsed.currentUrlParams || this.currentUrlParams;
        if (parsed.activePerson) this.activePerson = parsed.activePerson;
      } catch (e) {
        console.warn("Failed to load sandbox state", e);
      }
    }
  }

  public saveState() {
    localStorage.setItem(
      "standup-roulette-sandbox-state",
      JSON.stringify({
        isDarkMode: this.isDarkMode,
        currentUrlParams: this.currentUrlParams,
        activePerson: this.activePerson
      })
    );
  }

  public addLog(type: "API" | "DOM", methodOrAction: string, details: string, status?: number) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.unshift({ timestamp, type, methodOrAction, details, status });
    if (this.logs.length > 50) this.logs.pop();
    updateLogsUI();
  }
}

export {};

declare global {
  interface Window {
    sandboxState: SandboxState;
  }
}

// Instantiate state globally so scripts/polyfills can access it
const state = new SandboxState();
window.sandboxState = state;

// 1. Polyfill GM_xmlhttpRequest (used by WinnerControl.tsx to fetch Pokemon Mascot data)
// biome-ignore lint/suspicious/noExplicitAny: override standard tampermonkey type definitions
if (typeof (window as any).GM_xmlhttpRequest === "undefined") {
  // biome-ignore lint/suspicious/noExplicitAny: override standard tampermonkey type definitions
  (window as any).GM_xmlhttpRequest = (details: any) => {
    state.addLog("API", details.method, `Fetching mascot: ${details.url}`);

    fetch(details.url)
      .then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const text = await response.text();
        state.addLog("API", details.method, `Mascot data loaded`, response.status);
        if (details.onload) {
          details.onload({ responseText: text });
        }
      })
      .catch(error => {
        state.addLog("API", details.method, `Mascot fetch failed: ${error.message}`, 500);
        if (details.onerror) {
          details.onerror(error);
        }
      });
  };
}

// URL synchronization matching ADOS Userscript regex:
// /(?<collection>[\w\-%]+)\/(?<project>[\w\-%]+)\/_sprints\/taskboard\/(?<team>[\w\-%]+)\/.+?\/(?<sprint>Sprint[\w\-.%()]+)/
function syncUrl() {
  const { collection, project, team, sprint } = state.currentUrlParams;
  const simulatedPath = `/${collection}/${project}/_sprints/taskboard/${team}/dummy/${encodeURIComponent(sprint)}`;
  window.history.replaceState({}, "", simulatedPath);
  window.dispatchEvent(new Event("urlChange"));
  state.addLog("DOM", "URL Sync", `URL updated to mock ADOS path: ${simulatedPath}`);
}

function updateThemeClass() {
  const navMenu = document.querySelector(".project-navigation") as HTMLElement;
  if (navMenu) {
    if (state.isDarkMode) {
      navMenu.style.backgroundColor = "rgb(59, 58, 57)"; // Matches dark mode detector in App.tsx
      document.body.classList.add("dark-mode-sandbox");
    } else {
      navMenu.style.backgroundColor = "rgb(255, 255, 255)"; // Matches light mode
      document.body.classList.remove("dark-mode-sandbox");
    }
  }
}

function updateLogsUI() {
  const container = document.getElementById("sandbox-logs");
  if (!container) return;

  if (state.logs.length === 0) {
    container.innerHTML = `<div style="color: #666; font-size: 0.8rem; font-style: italic; padding: 6px;">No activity logged yet. Spin the wheel to begin!</div>`;
    return;
  }

  container.innerHTML = state.logs
    .map(log => {
      const typeColor = log.type === "API" ? "#50fa7b" : "#ff79c6";
      const statusSpan = log.status ? `<span style="color: ${log.status >= 400 ? "#ff5555" : "#50fa7b"}; font-weight: bold; margin-left: 4px;">(${log.status})</span>` : "";
      return `
          <div style="font-family: monospace; font-size: 0.75rem; margin-bottom: 6px; padding: 6px; border-bottom: 1px solid #2d2d2d; line-height: 1.3;">
            <span style="color: #6272a4;">[${log.timestamp}]</span>
            <span style="color: ${typeColor}; font-weight: bold; margin: 0 4px;">${log.type}</span>
            <span style="color: #f8f8f2; font-weight: 500;">${log.methodOrAction}</span>
            <div style="color: #a9b2c3; padding-left: 8px; margin-top: 2px; overflow-wrap: break-word;">
              ${log.details}${statusSpan}
            </div>
          </div>
        `;
    })
    .join("");
}

// Helper to create popup dropdown menus in simulated board
function createDropdownContainer(anchor: HTMLElement): HTMLElement {
  // Remove existing dropdowns first
  const existing = document.getElementById("simulated-dropdown-popup");
  if (existing) existing.remove();

  const dropdown = document.createElement("div");
  dropdown.id = "simulated-dropdown-popup";
  dropdown.style.position = "absolute";
  dropdown.style.zIndex = "9999";
  dropdown.style.backgroundColor = state.isDarkMode ? "#252526" : "white";
  dropdown.style.border = `1px solid ${state.isDarkMode ? "#454545" : "#ccc"}`;
  dropdown.style.borderRadius = "4px";
  dropdown.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
  dropdown.style.minWidth = "160px";
  dropdown.style.padding = "4px 0";

  const rect = anchor.getBoundingClientRect();
  dropdown.style.top = `${rect.bottom + window.scrollY + 4}px`;
  dropdown.style.left = `${rect.left + window.scrollX}px`;

  document.body.appendChild(dropdown);

  // Close dropdown when clicking outside
  const outsideClick = (e: MouseEvent) => {
    if (!dropdown.contains(e.target as Node) && !anchor.contains(e.target as Node)) {
      dropdown.remove();
      document.removeEventListener("mousedown", outsideClick);
    }
  };
  document.addEventListener("mousedown", outsideClick);

  return dropdown;
}

// Initial UI construction
window.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  body.style.display = "flex";
  body.style.height = "100vh";
  body.style.margin = "0";
  body.style.fontFamily = "'Inter', sans-serif";
  body.style.backgroundColor = "#f3f2f1";

  // Inject sandbox stylesheet
  const styleEl = document.createElement("style");
  styleEl.innerHTML = `
    .sb-input:focus { outline: none; border-color: #ff79c6 !important; }
    .dark-mode-sandbox { background-color: #1b1b1b !important; color: #f8f8f2 !important; }
    .dark-mode-sandbox #sandbox-main-area { background-color: #1e1e1e !important; }
    .dark-mode-sandbox #mock-board-container { background-color: #252526 !important; border-color: #3e3e3e !important; }
    .dark-mode-sandbox #board-header { background-color: #2d2d2d !important; border-color: #3e3e3e !important; }
    .dark-mode-sandbox #board-header-title { color: #f8f8f2 !important; }
    .dark-mode-sandbox .sb-team-btn { background-color: #2d2d2d !important; border-color: #454545 !important; color: #f8f8f2 !important; }
    .dark-mode-sandbox .sb-team-btn:hover { background-color: #3e3e3e !important; }
    .dark-mode-sandbox .sb-person-dropdown { background-color: #2d2d2d !important; border-color: #454545 !important; color: #f8f8f2 !important; }
    .dark-mode-sandbox .sb-person-dropdown:hover { background-color: #3e3e3e !important; }
    .dark-mode-sandbox .directory-dropdown-link, .dark-mode-sandbox .bolt-list-row { color: #f8f8f2 !important; }
    .dark-mode-sandbox .directory-dropdown-link:hover, .dark-mode-sandbox .bolt-list-row:hover { background-color: #3e3e3e !important; }
    
    /* Interactive simulated dropdown links styling */
    .directory-dropdown-link, .bolt-list-row {
      padding: 8px 12px;
      font-size: 0.85rem;
      cursor: pointer;
      display: block;
      color: #333;
      text-decoration: none;
      transition: background-color 0.15s ease;
    }
    .directory-dropdown-link:hover, .bolt-list-row:hover {
      background-color: #eaeaea;
    }
    
    /* Switch styling */
    .switch input:checked + .slider { background-color: #ff79c6; }
    .switch .slider:before {
      position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px;
      background-color: white; transition: .4s; border-radius: 50%;
    }
    .switch input:checked + .slider:before { transform: translateX(22px); }
  `;
  document.head.appendChild(styleEl);

  // Main area containing the simulated Azure DevOps board
  const mainArea = document.createElement("div");
  mainArea.id = "sandbox-main-area";
  mainArea.style.flex = "1";
  mainArea.style.display = "flex";
  mainArea.style.flexDirection = "column";
  mainArea.style.padding = "24px";
  mainArea.style.position = "relative";
  mainArea.style.overflowY = "auto";
  mainArea.style.transition = "background-color 0.3s ease";

  // Simulated ADOS top nav (dummy for theme color checks)
  const projectNav = document.createElement("div");
  projectNav.className = "project-navigation";
  projectNav.style.display = "none";
  body.appendChild(projectNav);

  // Azure DevOps Sim Header
  const header = document.createElement("div");
  header.style.backgroundColor = "#0078d4";
  header.style.color = "white";
  header.style.padding = "12px 20px";
  header.style.borderRadius = "4px";
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.justifyContent = "space-between";
  header.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
  header.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 1.3rem;">🎯</span>
      <span style="font-weight: 700; letter-spacing: 0.5px;">Azure DevOps - Standup Roulette Simulator</span>
    </div>
    <div style="font-size: 0.8rem; background-color: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px;">
      Dev Mode Active
    </div>
  `;
  mainArea.appendChild(header);

  // Mock ADOS Board container
  const boardContainer = document.createElement("div");
  boardContainer.id = "mock-board-container";
  boardContainer.style.backgroundColor = "white";
  boardContainer.style.border = "1px solid #e1dfdd";
  boardContainer.style.borderRadius = "4px";
  boardContainer.style.marginTop = "20px";
  boardContainer.style.flex = "1";
  boardContainer.style.display = "flex";
  boardContainer.style.flexDirection = "column";
  boardContainer.style.overflow = "hidden";
  boardContainer.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";

  // Board Header
  const boardHeader = document.createElement("div");
  boardHeader.id = "board-header";
  boardHeader.style.padding = "16px 20px";
  boardHeader.style.borderBottom = "1px solid #e1dfdd";
  boardHeader.style.display = "flex";
  boardHeader.style.alignItems = "center";
  boardHeader.style.justifyContent = "space-between";
  boardHeader.style.backgroundColor = "#faf9f8";

  const boardHeaderTitle = document.createElement("div");
  boardHeaderTitle.id = "board-header-title";
  boardHeaderTitle.style.display = "flex";
  boardHeaderTitle.style.alignItems = "center";
  boardHeaderTitle.style.gap = "8px";
  boardHeaderTitle.style.fontWeight = "600";
  boardHeaderTitle.style.color = "#323130";
  boardHeaderTitle.innerHTML = `
    <span>Sprints</span>
    <span style="color: #a19f9d;">/</span>
    <span id="sprint-title-val" style="color: #0078d4;">${state.currentUrlParams.sprint}</span>
  `;
  boardHeader.appendChild(boardHeaderTitle);

  // Mounting header anchor for userscript button
  const mountAnchor = document.createElement("div");
  mountAnchor.className = "expandable-search-header";
  mountAnchor.style.display = "flex";
  mountAnchor.style.alignItems = "center";
  mountAnchor.style.gap = "8px";

  // Create simulated team dropdown element
  const teamDropdown = document.createElement("div");
  teamDropdown.className = "directory-selector-dropdown";
  teamDropdown.style.display = "inline-flex";
  teamDropdown.style.alignItems = "center";
  teamDropdown.style.padding = "0 8px";
  teamDropdown.style.border = "1px solid #8a8886";
  teamDropdown.style.borderRadius = "2px";
  teamDropdown.style.height = "32px";
  teamDropdown.style.marginRight = "12px";

  const teamTextSpan = document.createElement("span");
  teamTextSpan.id = "sb-active-team-text";
  teamTextSpan.innerText = state.currentUrlParams.team;
  teamTextSpan.style.fontSize = "0.85rem";
  teamTextSpan.style.marginRight = "8px";
  teamDropdown.appendChild(teamTextSpan);

  const teamButton = document.createElement("button");
  teamButton.className = "bolt-button";
  teamButton.innerText = "▼";
  teamButton.style.border = "none";
  teamButton.style.background = "none";
  teamButton.style.cursor = "pointer";
  teamButton.style.fontSize = "0.7rem";
  teamButton.style.padding = "0 4px";
  teamDropdown.appendChild(teamButton);

  // Click handler for team dropdown to select team
  const toggleTeamDropdown = () => {
    state.addLog("DOM", "Click", "Simulated team dropdown clicked");
    const dropdownPopup = createDropdownContainer(teamDropdown);
    state.mockTeams.forEach(team => {
      const link = document.createElement("div");
      link.className = "directory-dropdown-link";
      link.innerText = team;
      link.addEventListener("click", () => {
        state.addLog("DOM", "Select Team", `Team selected in dropdown: ${team}`);
        state.currentUrlParams.team = team;
        teamTextSpan.innerText = team;
        state.saveState();
        syncUrl();
        dropdownPopup.remove();
        renderBoardUsers();
      });
      dropdownPopup.appendChild(link);
    });
  };
  teamButton.addEventListener("click", toggleTeamDropdown);
  teamDropdown.addEventListener("click", e => {
    if (e.target !== teamButton) {
      toggleTeamDropdown();
    }
  });

  // Create simulated person filter dropdown
  const personDropdown = document.createElement("div");
  personDropdown.id = "simulated-person-dropdown";
  personDropdown.style.display = "inline-flex";
  personDropdown.style.alignItems = "center";
  personDropdown.style.padding = "0 10px";
  personDropdown.style.border = "1px solid #8a8886";
  personDropdown.style.borderRadius = "2px";
  personDropdown.style.height = "32px";
  personDropdown.style.cursor = "pointer";
  personDropdown.style.fontSize = "0.85rem";
  personDropdown.style.backgroundColor = "white";
  personDropdown.className = "sb-person-dropdown";

  const personText = document.createElement("div");
  personText.id = "sb-person-text";
  personText.innerText = `Person: ${state.activePerson}`;
  personDropdown.appendChild(personText);

  // Register click for person selector (matching document.evaluate in adosHelper.ts)
  personDropdown.addEventListener("click", () => {
    state.addLog("DOM", "Click", "Simulated person selector clicked");
    const dropdownPopup = createDropdownContainer(personDropdown);

    // Add special options first
    const options = ["All", "@Me", "Unassigned", ...(state.mockPeople[state.currentUrlParams.team] || [])];
    options.forEach(option => {
      const row = document.createElement("div");
      row.className = "bolt-list-row";
      row.innerText = option;
      row.addEventListener("click", () => {
        state.addLog("DOM", "Select Person", `Person filter selected: ${option}`);
        state.activePerson = option;
        personText.innerText = `Person: ${option}`;
        state.saveState();
        dropdownPopup.remove();
      });
      dropdownPopup.appendChild(row);
    });
  });

  boardHeader.appendChild(teamDropdown);
  boardHeader.appendChild(personDropdown);
  boardHeader.appendChild(mountAnchor);
  boardContainer.appendChild(boardHeader);

  // Simulated Work Items Board body
  const boardBody = document.createElement("div");
  boardBody.id = "mock-board-body";
  boardBody.style.padding = "20px";
  boardBody.style.flex = "1";
  boardBody.style.overflowY = "auto";
  boardContainer.appendChild(boardBody);

  mainArea.appendChild(boardContainer);

  // Sidebar Controls (Developer Console)
  const sidebar = document.createElement("div");
  sidebar.id = "sandbox-sidebar";
  sidebar.style.width = "380px";
  sidebar.style.backgroundColor = "#1e1e1e";
  sidebar.style.color = "#f8f8f2";
  sidebar.style.padding = "20px";
  sidebar.style.display = "flex";
  sidebar.style.flexDirection = "column";
  sidebar.style.boxShadow = "-2px 0 10px rgba(0,0,0,0.3)";
  sidebar.style.overflowY = "auto";
  sidebar.style.borderLeft = "1px solid #2d2d2d";
  sidebar.style.transition = "width 0.3s ease, padding 0.3s ease, border-left 0.3s ease";

  const sidebarTitle = document.createElement("h2");
  sidebarTitle.style.margin = "0 0 16px 0";
  sidebarTitle.style.fontSize = "1.25rem";
  sidebarTitle.style.fontWeight = "600";
  sidebarTitle.style.backgroundImage = "linear-gradient(90deg, #ff79c6, #8be9fd)";
  sidebarTitle.style.webkitBackgroundClip = "text";
  sidebarTitle.style.webkitTextFillColor = "transparent";
  sidebarTitle.innerText = "Developer Console";
  sidebar.appendChild(sidebarTitle);

  // Theme Toggle
  const themeGroup = document.createElement("div");
  themeGroup.style.marginBottom = "20px";
  themeGroup.style.display = "flex";
  themeGroup.style.justifyContent = "space-between";
  themeGroup.style.alignItems = "center";
  themeGroup.innerHTML = `
    <span style="font-size: 0.9rem; font-weight: 500;">Simulated Dark Mode</span>
    <label class="switch" style="position: relative; display: inline-block; width: 44px; height: 22px;">
      <input type="checkbox" id="theme-toggle-chk" style="opacity: 0; width: 0; height: 0;">
      <span class="slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px;"></span>
    </label>
  `;
  sidebar.appendChild(themeGroup);

  // Configuration Form
  const configSection = document.createElement("div");
  configSection.style.marginBottom = "20px";
  configSection.innerHTML = `
    <h3 style="margin: 0 0 12px 0; font-size: 0.95rem; color: #ff79c6; border-bottom: 1px solid #333; padding-bottom: 6px;">URL Route Params</h3>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
      <div>
        <label style="font-size: 0.7rem; color: #6272a4; display: block; margin-bottom: 2px;">Collection</label>
        <input id="in-collection" class="sb-input" value="${state.currentUrlParams.collection}" style="width: 100%; box-sizing: border-box; background: #2d2d2d; border: 1px solid #444; color: white; border-radius: 4px; padding: 6px 8px; font-size: 0.8rem;">
      </div>
      <div>
        <label style="font-size: 0.7rem; color: #6272a4; display: block; margin-bottom: 2px;">Project</label>
        <input id="in-project" class="sb-input" value="${state.currentUrlParams.project}" style="width: 100%; box-sizing: border-box; background: #2d2d2d; border: 1px solid #444; color: white; border-radius: 4px; padding: 6px 8px; font-size: 0.8rem;">
      </div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div>
        <label style="font-size: 0.7rem; color: #6272a4; display: block; margin-bottom: 2px;">Team</label>
        <input id="in-team" class="sb-input" value="${state.currentUrlParams.team}" style="width: 100%; box-sizing: border-box; background: #2d2d2d; border: 1px solid #444; color: white; border-radius: 4px; padding: 6px 8px; font-size: 0.8rem;">
      </div>
      <div>
        <label style="font-size: 0.7rem; color: #6272a4; display: block; margin-bottom: 2px;">Sprint</label>
        <input id="in-sprint" class="sb-input" value="${state.currentUrlParams.sprint}" style="width: 100%; box-sizing: border-box; background: #2d2d2d; border: 1px solid #444; color: white; border-radius: 4px; padding: 6px 8px; font-size: 0.8rem;">
      </div>
    </div>
    <button id="btn-update-route" style="width: 100%; background: #0078d4; border: none; color: white; padding: 8px 12px; border-radius: 4px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: background-color 0.2s;">
      Apply & Update URL
    </button>
  `;
  sidebar.appendChild(configSection);

  // Live Console Logs
  const logSection = document.createElement("div");
  logSection.style.flex = "1";
  logSection.style.display = "flex";
  logSection.style.flexDirection = "column";
  logSection.style.minHeight = "250px";
  logSection.innerHTML = `
    <h3 style="margin: 0 0 10px 0; font-size: 0.95rem; color: #ff79c6; border-bottom: 1px solid #333; padding-bottom: 6px; display: flex; justify-content: space-between;">
      <span>Sandbox Logger</span>
      <button id="btn-clear-logs" style="background: none; border: none; color: #6272a4; font-size: 0.75rem; cursor: pointer; padding: 0;">Clear</button>
    </h3>
    <div id="sandbox-logs" style="flex: 1; background: #151515; border: 1px solid #2d2d2d; border-radius: 4px; padding: 8px; overflow-y: auto; box-sizing: border-box;">
    </div>
  `;
  sidebar.appendChild(logSection);

  // Collapse/Expand Console Button
  const toggleBtn = document.createElement("button");
  toggleBtn.id = "sandbox-sidebar-toggle";
  toggleBtn.innerHTML = "🛠️ Hide Console";
  toggleBtn.style.position = "absolute";
  toggleBtn.style.right = "24px";
  toggleBtn.style.top = "70px";
  toggleBtn.style.zIndex = "2000";
  toggleBtn.style.backgroundColor = "#1e1e1e";
  toggleBtn.style.border = "1px solid #444";
  toggleBtn.style.borderRadius = "4px";
  toggleBtn.style.color = "#8be9fd";
  toggleBtn.style.padding = "6px 12px";
  toggleBtn.style.fontSize = "0.8rem";
  toggleBtn.style.fontWeight = "600";
  toggleBtn.style.cursor = "pointer";
  toggleBtn.style.transition = "all 0.2s ease";

  let isCollapsed = false;
  toggleBtn.addEventListener("click", () => {
    if (isCollapsed) {
      sidebar.style.width = "380px";
      sidebar.style.padding = "20px";
      sidebar.style.borderLeft = "1px solid #2d2d2d";
      toggleBtn.innerHTML = "🛠️ Hide Console";
      toggleBtn.style.color = "#8be9fd";
    } else {
      sidebar.style.width = "0px";
      sidebar.style.padding = "0px";
      sidebar.style.borderLeft = "none";
      toggleBtn.innerHTML = "🛠️ Show Console";
      toggleBtn.style.color = "#ff79c6";
    }
    isCollapsed = !isCollapsed;
  });

  mainArea.appendChild(toggleBtn);

  // Assemble full DOM
  body.appendChild(mainArea);
  body.appendChild(sidebar);

  // Helper to render work items/users in board
  function renderBoardUsers() {
    const activeTeam = state.currentUrlParams.team;
    const people = state.mockPeople[activeTeam] || [];

    boardBody.innerHTML = `
      <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 12px;">Active Members for Team: ${activeTeam}</div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px;">
        ${people
          .map(
            person => `
          <div style="padding: 12px; border: 1px solid #e1dfdd; border-radius: 4px; display: flex; align-items: center; gap: 8px; background-color: ${state.isDarkMode ? "#2d2d2d" : "#f8f9fa"}">
            <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #0078d4; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: bold;">
              ${person
                .split(" ")
                .map(n => n[0])
                .join("")}
            </div>
            <div style="font-size: 0.85rem; font-weight: 500;">${person}</div>
          </div>
        `
          )
          .join("")}
      </div>
      <div style="color: #666; font-size: 0.8rem; border-top: 1px dashed #ccc; padding-top: 12px; margin-top: 24px;">
        Note: The roulette users list is loaded from Redux/localStorage. When the roulette spins, it will automatically select the winning person in the Person filter dropdown above.
      </div>
    `;
  }

  // Setup UI event listeners
  const themeToggle = document.getElementById("theme-toggle-chk") as HTMLInputElement;
  themeToggle.checked = state.isDarkMode;
  themeToggle.addEventListener("change", e => {
    state.isDarkMode = (e.target as HTMLInputElement).checked;
    state.saveState();
    updateThemeClass();
    renderBoardUsers();
  });

  const btnUpdateRoute = document.getElementById("btn-update-route");
  btnUpdateRoute?.addEventListener("click", () => {
    const coll = (document.getElementById("in-collection") as HTMLInputElement).value;
    const proj = (document.getElementById("in-project") as HTMLInputElement).value;
    const team = (document.getElementById("in-team") as HTMLInputElement).value;
    const spr = (document.getElementById("in-sprint") as HTMLInputElement).value;

    state.currentUrlParams = { collection: coll, project: proj, team, sprint: spr };
    state.saveState();

    const sprintVal = document.getElementById("sprint-title-val");
    if (sprintVal) sprintVal.innerText = spr;
    teamTextSpan.innerText = team;

    syncUrl();
    renderBoardUsers();
  });

  const btnClearLogs = document.getElementById("btn-clear-logs");
  btnClearLogs?.addEventListener("click", () => {
    state.logs = [];
    updateLogsUI();
  });

  // Initial Syncs
  updateThemeClass();
  syncUrl();
  updateLogsUI();
  renderBoardUsers();

  // Watch for programmatical selection changes in simulated dropdowns
  const observer = new MutationObserver(() => {
    // Sync UI display text if programmatic changes happened
    const currentPerson = state.activePerson;
    if (personText.innerText !== `Person: ${currentPerson}`) {
      personText.innerText = `Person: ${currentPerson}`;
    }
    const currentTeam = state.currentUrlParams.team;
    if (teamTextSpan.innerText !== currentTeam) {
      teamTextSpan.innerText = currentTeam;
      renderBoardUsers();
    }
  });
  observer.observe(personDropdown, { characterData: true, subtree: true });
  observer.observe(teamDropdown, { characterData: true, subtree: true });
});
