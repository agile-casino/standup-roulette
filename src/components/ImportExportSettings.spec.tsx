import { MantineProvider } from "@mantine/core";
import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RouletteState } from "../store/roulette/state";
import type { RouletteStoreType } from "../store/useRouletteStore";
import { ImportExportSettings } from "./ImportExportSettings";

const mockActions = {
  importState: vi.fn()
};

const mockSelectors: RouletteState = {
  currentGame: 0,
  games: [],
  timerType: "off",
  timerDuration: 60,
  timerLimit: 60,
  wheelType: "old"
};

vi.mock("../store/useRouletteStore", () => ({
  useRouletteStore: <T,>(selectorFn: (state: RouletteStoreType) => T): T => {
    const mockState = {
      ...mockSelectors,
      ...mockActions
    } as unknown as RouletteStoreType;
    return selectorFn(mockState);
  }
}));

// Mock FileReader
let mockFileReaderInstance: MockFileReader | null = null;
class MockFileReader {
  onload: ((e: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((e: ProgressEvent<FileReader>) => void) | null = null;
  result: string = "";

  constructor() {
    mockFileReaderInstance = this;
  }

  readAsText() {}
}
global.FileReader = MockFileReader as unknown as typeof FileReader;

describe("ImportExportSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFileReaderInstance = null;
    window.alert = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});

    // Mock URL methods
    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:foo");
    global.URL.revokeObjectURL = vi.fn();

    // Mock input click to trigger file change with a mock event
    vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(function (this: HTMLInputElement) {
      const file = new File(["test"], "test.json", { type: "application/json" });
      const mockEvent = {
        target: {
          files: [file]
        }
      };
      if (this.onchange) {
        this.onchange(mockEvent as unknown as Event);
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MantineProvider>
        <ImportExportSettings />
      </MantineProvider>
    );
  };

  it("should render Import and Export buttons", () => {
    const { getByText } = renderComponent();
    expect(getByText("Export Settings")).toBeTruthy();
    expect(getByText("Import Settings")).toBeTruthy();
  });

  it("should trigger export flow when clicking Export Settings", () => {
    const { getByText } = renderComponent();

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");
    const appendSpy = vi.spyOn(document.body, "appendChild");
    const removeSpy = vi.spyOn(document.body, "removeChild");

    const exportBtn = getByText("Export Settings");
    fireEvent.click(exportBtn);

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:foo");
  });

  it("should alert error if export fails", () => {
    const { getByText } = renderComponent();

    vi.spyOn(global.URL, "createObjectURL").mockImplementation(() => {
      throw new Error("Export Error");
    });

    const exportBtn = getByText("Export Settings");
    fireEvent.click(exportBtn);

    expect(window.alert).toHaveBeenCalledWith("Failed to export settings. Please try again.");
    expect(console.error).toHaveBeenCalled();
  });

  it("should handle successful import", () => {
    const { getByText } = renderComponent();
    const importBtn = getByText("Import Settings");
    fireEvent.click(importBtn);

    expect(mockFileReaderInstance).not.toBeNull();

    // Simulate successful file read
    if (mockFileReaderInstance) {
      mockFileReaderInstance.result = JSON.stringify({ testState: "ok" });
      mockFileReaderInstance.onload?.({
        target: { result: mockFileReaderInstance.result }
      } as unknown as ProgressEvent<FileReader>);
    }

    expect(mockActions.importState).toHaveBeenCalledWith({ testState: "ok" });
  });

  it("should alert error if import file JSON is invalid", () => {
    const { getByText } = renderComponent();
    const importBtn = getByText("Import Settings");
    fireEvent.click(importBtn);

    expect(mockFileReaderInstance).not.toBeNull();

    // Simulate parsing invalid JSON
    if (mockFileReaderInstance) {
      mockFileReaderInstance.result = "invalid-json";
      mockFileReaderInstance.onload?.({
        target: { result: mockFileReaderInstance.result }
      } as unknown as ProgressEvent<FileReader>);
    }

    expect(window.alert).toHaveBeenCalledWith("Failed to import settings. The file may be corrupted.");
    expect(console.error).toHaveBeenCalled();
  });

  it("should alert error if reading file fails", () => {
    const { getByText } = renderComponent();
    const importBtn = getByText("Import Settings");
    fireEvent.click(importBtn);

    expect(mockFileReaderInstance).not.toBeNull();

    // Simulate FileReader error
    mockFileReaderInstance?.onerror?.(new ProgressEvent("error") as unknown as ProgressEvent<FileReader>);

    expect(window.alert).toHaveBeenCalledWith("Failed to read the file. Please try again.");
    expect(console.error).toHaveBeenCalled();
  });
});
