import { MantineProvider } from "@mantine/core";
import { act, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WinnerControl } from "./WinnerControl";

interface GMXMLHttpRequestDetails {
  onload: (response: { responseText: string }) => void;
  onerror: () => void;
}

describe("WinnerControl", () => {
  const mockMascotData = {
    name: "pikachu",
    sprites: {
      other: {
        "official-artwork": {
          front_default: "http://example.com/pikachu.png",
          front_shiny: "http://example.com/pikachu-shiny.png"
        }
      }
    }
  };

  beforeEach(() => {
    // Mock the global Tampermonkey API
    global.GM_xmlhttpRequest = vi.fn().mockImplementation((details: GMXMLHttpRequestDetails) => {
      details.onload({
        responseText: JSON.stringify(mockMascotData)
      });
    });

    // Mock Math.random to return non-shiny by default
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    delete (global as unknown as Record<string, unknown>).GM_xmlhttpRequest;
    vi.restoreAllMocks();
  });

  const renderComponent = (name: string, mascotNumber: number) => {
    return render(
      <MantineProvider>
        <WinnerControl name={name} mascotNumber={mascotNumber} />
      </MantineProvider>
    );
  };

  it("should render null if no name is provided", async () => {
    const { container } = renderComponent("", 25);
    expect(container.querySelector(".winner")).toBeNull();

    // Flush any pending state updates to avoid act warnings
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  it("should render the winner name", async () => {
    const { getByText, queryByText } = renderComponent("Alice", 25);
    expect(getByText("Alice")).toBeTruthy();
    expect(getByText("Winner:")).toBeTruthy();

    // Wait for the asynchronous state updates to finish
    await waitFor(() => {
      expect(queryByText("Pikachu")).toBeTruthy();
    });
  });

  it("should fetch and render mascot data", async () => {
    const { getByAltText, getByText } = renderComponent("Alice", 25);

    expect(global.GM_xmlhttpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https://pokeapi.co/api/v2/pokemon/25"
      })
    );

    // Wait for state updates after the promise resolves
    await waitFor(() => {
      expect(getByText("Pikachu")).toBeTruthy();
      const img = getByAltText("Pikachu") as HTMLImageElement;
      expect(img.src).toBe("http://example.com/pikachu.png");
    });
  });

  it("should render shiny mascot if shiny condition is met", async () => {
    // Override Math.random to trigger shiny (needs to be < 0.05)
    vi.spyOn(Math, "random").mockReturnValue(0.01);

    const { getByAltText, getByText } = renderComponent("Alice", 25);

    await waitFor(() => {
      expect(getByText("Shiny Pikachu")).toBeTruthy();
      const img = getByAltText("Shiny Pikachu") as HTMLImageElement;
      expect(img.src).toBe("http://example.com/pikachu-shiny.png");
    });
  });

  it("should render shiny mascot if it is April First", async () => {
    // Mock Date prototype to return April 1st (Month 3, Day 1)
    const getMonthSpy = vi.spyOn(Date.prototype, "getMonth").mockReturnValue(3);
    const getDateSpy = vi.spyOn(Date.prototype, "getDate").mockReturnValue(1);

    const { getByAltText, getByText } = renderComponent("Alice", 25);

    await waitFor(() => {
      expect(getByText("Shiny Pikachu")).toBeTruthy();
      const img = getByAltText("Shiny Pikachu") as HTMLImageElement;
      expect(img.src).toBe("http://example.com/pikachu-shiny.png");
    });

    getMonthSpy.mockRestore();
    getDateSpy.mockRestore();
  });
});
