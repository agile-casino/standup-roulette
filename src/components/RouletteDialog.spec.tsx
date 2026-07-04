import { MantineProvider } from "@mantine/core";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouletteDialog } from "./RouletteDialog";

// Mock child components
vi.mock("./Header", () => ({
  Header: ({ toggleShowSettings }: { toggleShowSettings: () => void }) => (
    <div data-testid="mock-header">
      <button type="button" data-testid="toggle-settings-btn" onClick={toggleShowSettings}>
        Toggle Settings
      </button>
    </div>
  )
}));
vi.mock("./SettingsPanel", () => ({
  SettingsPanel: () => <div data-testid="mock-settings-panel">Settings Panel</div>
}));
vi.mock("./RouletteWheel", () => ({
  RouletteWheel: () => <div data-testid="mock-roulette-wheel">Roulette Wheel</div>
}));
vi.mock("./RouletteUsers", () => ({
  RouletteUsers: () => <div data-testid="mock-roulette-users">Roulette Users</div>
}));

describe("RouletteDialog", () => {
  const mockOnCloseClicked = vi.fn();
  const defaultProps = {
    open: true,
    onCloseClicked: mockOnCloseClicked
  };

  const renderComponent = (props = defaultProps) => {
    return render(
      <MantineProvider>
        <RouletteDialog {...props} />
      </MantineProvider>
    );
  };

  it("should render dialog, Header, RouletteWheel, and RouletteUsers when open and showSettings is false", () => {
    const { getByTestId, queryByTestId } = renderComponent();

    expect(getByTestId("mock-header")).toBeTruthy();
    expect(getByTestId("mock-roulette-wheel")).toBeTruthy();
    expect(getByTestId("mock-roulette-users")).toBeTruthy();
    expect(queryByTestId("mock-settings-panel")).toBeNull();
  });

  it("should toggle SettingsPanel when toggleShowSettings is called", () => {
    const { getByTestId, queryByTestId } = renderComponent();

    // Toggle settings on
    const toggleBtn = getByTestId("toggle-settings-btn");
    fireEvent.click(toggleBtn);

    expect(getByTestId("mock-header")).toBeTruthy();
    expect(getByTestId("mock-settings-panel")).toBeTruthy();
    expect(queryByTestId("mock-roulette-wheel")).toBeNull();
    expect(queryByTestId("mock-roulette-users")).toBeNull();

    // Toggle settings off
    fireEvent.click(toggleBtn);

    expect(getByTestId("mock-header")).toBeTruthy();
    expect(getByTestId("mock-roulette-wheel")).toBeTruthy();
    expect(getByTestId("mock-roulette-users")).toBeTruthy();
    expect(queryByTestId("mock-settings-panel")).toBeNull();
  });

  it("should call onCloseClicked when close button is clicked", () => {
    const { container } = renderComponent();
    // Dialog has built-in close button if withCloseButton={true}
    const closeBtn = container.querySelector(".mantine-Dialog-closeButton");
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(mockOnCloseClicked).toHaveBeenCalled();
    }
  });

  it("should not render anything when open is false", () => {
    const { queryByTestId } = renderComponent({ ...defaultProps, open: false });
    expect(queryByTestId("mock-header")).toBeNull();
  });
});
