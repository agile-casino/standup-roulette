import { MantineProvider } from "@mantine/core";
import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ImportExportSettings } from "./ImportExportSettings";

const mockActions = {
  importState: vi.fn()
};

const mockSelectors = {
  currentGame: 0,
  games: [] as any[],
  timerType: "off",
  timerDuration: 60,
  timerLimit: 60
};

vi.mock("../store/useRouletteStore", () => ({
  useRouletteStore: (selectorFn: (state: any) => any) => {
    const mockState = {
      ...mockSelectors,
      ...mockActions
    };
    return selectorFn(mockState);
  }
}));

// Mock FileReader
let mockFileReaderInstance: any = null;
class MockFileReader {
  onload: ((e: any) => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  result: string = "";

  constructor() {
    mockFileReaderInstance = this;
  }

  readAsText() {}
}
global.FileReader = MockFileReader as any;

describe("ImportExportSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFileReaderInstance = null;
    vi.spyOn(window, "alert").mockImplementation(() => {});
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
        this.onchange(mockEvent as any);
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
    mockFileReaderInstance.result = JSON.stringify({ testState: "ok" });
    if (mockFileReaderInstance.onload) {
      mockFileReaderInstance.onload({
        target: { result: mockFileReaderInstance.result }
      } as any);
    }

    expect(mockActions.importState).toHaveBeenCalledWith({ testState: "ok" });
  });

  it("should alert error if import file JSON is invalid", () => {
    const { getByText } = renderComponent();
    const importBtn = getByText("Import Settings");
    fireEvent.click(importBtn);

    expect(mockFileReaderInstance).not.toBeNull();

    // Simulate parsing invalid JSON
    mockFileReaderInstance.result = "invalid-json";
    if (mockFileReaderInstance.onload) {
      mockFileReaderInstance.onload({
        target: { result: mockFileReaderInstance.result }
      } as any);
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
    if (mockFileReaderInstance.onerror) {
      mockFileReaderInstance.onerror(new ProgressEvent("error"));
    }

    expect(window.alert).toHaveBeenCalledWith("Failed to read the file. Please try again.");
    expect(console.error).toHaveBeenCalled();
  });
});
