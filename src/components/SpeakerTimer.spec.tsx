import { render, fireEvent, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SpeakerTimer } from "./SpeakerTimer";
import { MantineProvider } from "@mantine/core";

describe("SpeakerTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderComponent = (timerType: "up" | "down", timerDuration: number, timerLimit: number) => {
    return render(
      <MantineProvider>
        <SpeakerTimer timerType={timerType} timerDuration={timerDuration} timerLimit={timerLimit} />
      </MantineProvider>
    );
  };

  describe("when timerType is down", () => {
    it("should start at timerDuration and tick down every second", () => {
      const { getByText } = renderComponent("down", 120, 300);
      
      expect(getByText("2:00")).toBeTruthy();

      // Tick 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(getByText("1:59")).toBeTruthy();

      // Tick 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(getByText("1:49")).toBeTruthy();
    });

    it("should stop ticking when it reaches 0", () => {
      const { getByText } = renderComponent("down", 3, 300);

      expect(getByText("0:03")).toBeTruthy();

      act(() => {
        vi.advanceTimersByTime(4000);
      });
      expect(getByText("0:00")).toBeTruthy();
    });
  });

  describe("when timerType is up", () => {
    it("should start at 0 and tick up every second", () => {
      const { getByText } = renderComponent("up", 120, 5);

      expect(getByText("0:00")).toBeTruthy();

      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(getByText("0:03")).toBeTruthy();
    });

    it("should stop ticking when it reaches timerLimit", () => {
      const { getByText } = renderComponent("up", 120, 5);

      expect(getByText("0:00")).toBeTruthy();

      act(() => {
        vi.advanceTimersByTime(6000);
      });
      expect(getByText("0:05")).toBeTruthy();
    });
  });

  describe("controls", () => {
    it("should pause and play when play/pause button is clicked", () => {
      const { getByText, container } = renderComponent("down", 10, 300);

      expect(getByText("0:10")).toBeTruthy();

      // Find the play/pause button (variant yellow or green)
      const buttons = container.querySelectorAll("button");
      const playPauseButton = buttons[0]; // first button is play/pause
      const resetButton = buttons[1]; // second button is rotate/reset

      // Pause
      fireEvent.click(playPauseButton);

      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(getByText("0:10")).toBeTruthy(); // Time should not change

      // Resume
      fireEvent.click(playPauseButton);

      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(getByText("0:08")).toBeTruthy(); // Time should decrease
    });

    it("should reset time when reset button is clicked", () => {
      const { getByText, container } = renderComponent("down", 10, 300);

      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(getByText("0:07")).toBeTruthy();

      const buttons = container.querySelectorAll("button");
      const resetButton = buttons[1];

      fireEvent.click(resetButton);
      expect(getByText("0:10")).toBeTruthy();
    });
  });
});
