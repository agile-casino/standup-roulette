import { MantineProvider, Table } from "@mantine/core";
import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserEditRow } from "./UserEditRow";

const mockActions = {
  removeUser: vi.fn(),
  setUserName: vi.fn(),
  setUserTeam: vi.fn(),
  toggleUser: vi.fn()
};

vi.mock("../store/useRouletteStore", () => ({
  useRouletteStore: (selectorFn: (state: any) => any) => {
    return selectorFn(mockActions);
  }
}));

describe("UserEditRow", () => {
  const user = {
    id: "user-1",
    name: "Alice",
    team: "Alpha",
    checked: true,
    mascot: 42
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MantineProvider>
        <Table>
          <tbody>
            <UserEditRow user={user} />
          </tbody>
        </Table>
      </MantineProvider>
    );
  };

  it("should render user inputs with values", () => {
    const { getByDisplayValue, getByRole } = renderComponent();

    const nameInput = getByDisplayValue("Alice") as HTMLInputElement;
    const teamInput = getByDisplayValue("Alpha") as HTMLInputElement;
    const checkbox = getByRole("checkbox") as HTMLInputElement;

    expect(nameInput).toBeTruthy();
    expect(teamInput).toBeTruthy();
    expect(checkbox.checked).toBe(true);
  });

  it("should call setUserName when name is changed", () => {
    const { getByDisplayValue } = renderComponent();
    const nameInput = getByDisplayValue("Alice");

    fireEvent.change(nameInput, { target: { value: "Bob" } });

    expect(mockActions.setUserName).toHaveBeenCalledWith("user-1", "Bob");
  });

  it("should call setUserTeam when team is changed", () => {
    const { getByDisplayValue } = renderComponent();
    const teamInput = getByDisplayValue("Alpha");

    fireEvent.change(teamInput, { target: { value: "Beta" } });

    expect(mockActions.setUserTeam).toHaveBeenCalledWith("user-1", "Beta");
  });

  it("should call toggleUser when checkbox is clicked", () => {
    const { getByRole } = renderComponent();
    const checkbox = getByRole("checkbox");

    fireEvent.click(checkbox);

    expect(mockActions.toggleUser).toHaveBeenCalledWith("user-1");
  });

  it("should call removeUser when delete button is clicked", () => {
    const { getByRole } = renderComponent();

    const deleteButton = getByRole("button");
    fireEvent.click(deleteButton);

    expect(mockActions.removeUser).toHaveBeenCalledWith("user-1");
  });
});
