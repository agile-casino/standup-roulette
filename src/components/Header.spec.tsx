import { MantineProvider } from "@mantine/core";
import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "./Header";

const mockSelectors = {
  gameName: "Game 1",
  spinning: false,
  currentGame: 0,
  timerType: "off",
  timerDuration: 60,
  timerLimit: 60,
  winningName: null as string | null,
  remainingUsers: [] as any[]
};

const mockActions = {
  setGameName: vi.fn(),
  prevGame: vi.fn(),
  nextGame: vi.fn()
};

vi.mock("../store/useRouletteStore", () => ({
  useRouletteStore: (selectorFn: (state: any) => any) => {
    const games = Array.from({ length: 5 }, (_, index) => ({
      name: index === mockSelectors.currentGame ? mockSelectors.gameName : `Game ${index + 1}`,
      spinning: index === mockSelectors.currentGame ? mockSelectors.spinning : false,
      winningId: index === mockSelectors.currentGame && mockSelectors.winningName ? "winner-id" : null,
      winningName: index === mockSelectors.currentGame ? mockSelectors.winningName : null,
      remainingUsers: index === mockSelectors.currentGame ? mockSelectors.remainingUsers : [],
      allUsers: [],
      seed: 0,
      endImageUrls: []
    }));

    const mockState = {
      currentGame: mockSelectors.currentGame,
      games,
      timerType: mockSelectors.timerType,
      timerDuration: mockSelectors.timerDuration,
      timerLimit: mockSelectors.timerLimit,
      ...mockActions
    };
    return selectorFn(mockState);
  }
}));

describe("Header", () => {
  const toggleShowSettingsMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    toggleShowSettingsMock.mockClear();
    mockSelectors.gameName = "Game 1";
    mockSelectors.spinning = false;
    mockSelectors.currentGame = 0;
    mockSelectors.timerType = "off";
    mockSelectors.timerDuration = 60;
    mockSelectors.timerLimit = 60;
    mockSelectors.winningName = null;
    mockSelectors.remainingUsers = [];
  });

  const renderComponent = () => {
    return render(
      <MantineProvider>
        <Header toggleShowSettings={toggleShowSettingsMock} />
      </MantineProvider>
    );
  };

  it("should render Header title and game name", () => {
    const { getByText, getByDisplayValue } = renderComponent();
    expect(getByText("Standup Roulette")).toBeTruthy();
    expect(getByDisplayValue("Game 1")).toBeTruthy();
  });

  it("should call toggleShowSettings when settings button is clicked", () => {
    const { container } = renderComponent();
    const buttons = container.querySelectorAll("button");
    const settingsButton = buttons[0];
    fireEvent.click(settingsButton);
    expect(toggleShowSettingsMock).toHaveBeenCalled();
  });

  it("should disable previous game button when currentGame is 0", () => {
    mockSelectors.currentGame = 0;
    const { container } = renderComponent();
    const buttons = container.querySelectorAll("button");
    const prevButton = buttons[1];
    expect(prevButton.disabled).toBe(true);
  });

  it("should enable previous game button when currentGame > 0", () => {
    mockSelectors.currentGame = 1;
    const { container } = renderComponent();
    const buttons = container.querySelectorAll("button");
    const prevButton = buttons[1];
    expect(prevButton.disabled).toBe(false);

    fireEvent.click(prevButton);
    expect(mockActions.prevGame).toHaveBeenCalled();
  });

  it("should disable next game button when currentGame is 4", () => {
    mockSelectors.currentGame = 4;
    const { container } = renderComponent();
    const buttons = container.querySelectorAll("button");
    const nextButton = buttons[2];
    expect(nextButton.disabled).toBe(true);
  });

  it("should enable next game button when currentGame < 4", () => {
    mockSelectors.currentGame = 3;
    const { container } = renderComponent();
    const buttons = container.querySelectorAll("button");
    const nextButton = buttons[2];
    expect(nextButton.disabled).toBe(false);

    fireEvent.click(nextButton);
    expect(mockActions.nextGame).toHaveBeenCalled();
  });

  it("should disable previous and next buttons when spinning", () => {
    mockSelectors.currentGame = 2;
    mockSelectors.spinning = true;
    const { container } = renderComponent();
    const buttons = container.querySelectorAll("button");
    const prevButton = buttons[1];
    const nextButton = buttons[2];
    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(true);
  });

  it("should call setGameName when typing in game name input", () => {
    const { getByDisplayValue } = renderComponent();
    const input = getByDisplayValue("Game 1");
    fireEvent.change(input, { target: { value: "Daily Standup" } });
    expect(mockActions.setGameName).toHaveBeenCalledWith("Daily Standup");
  });

  it("should render SpeakerTimer when timer is on, not spinning, there is a winner, and users remain", () => {
    mockSelectors.timerType = "down";
    mockSelectors.spinning = false;
    mockSelectors.winningName = "Alice";
    mockSelectors.remainingUsers = [{ id: "user-2", name: "Bob", checked: true }];

    const { getByText } = renderComponent();
    expect(getByText("1:00")).toBeTruthy();
  });
});
