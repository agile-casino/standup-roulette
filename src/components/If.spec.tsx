// @vitest-environment happy-dom

import { test, expect } from "vitest";
import { render } from "@testing-library/react";
import { If } from "./If";

test("If_WhenConditionIsTrue_RendersChild", () => {
  const { queryByTestId } = render(
    <If condition={true}>
      <div data-testid="test-div"></div>
    </If>
  );

  expect(queryByTestId("test-div")).toBeTruthy();
});

test("If_WhenConditionIsFalse_DoesNotRenderChild", () => {
  const { queryByTestId } = render(
    <If condition={false}>
      <div data-testid="test-div"></div>
    </If>
  );

  expect(queryByTestId("test-div")).toBeNull();
});
