// @vitest-environment happy-dom

import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import { If } from "./If";

test("If_WhenConditionIsTrue_RendersChild", () => {
  const { queryByTestId } = render(
    <If condition={true}>
      <div data-testid="test-div" />
    </If>
  );

  expect(queryByTestId("test-div")).toBeTruthy();
});

test("If_WhenConditionIsFalse_DoesNotRenderChild", () => {
  const { queryByTestId } = render(
    <If condition={false}>
      <div data-testid="test-div" />
    </If>
  );

  expect(queryByTestId("test-div")).toBeNull();
});
