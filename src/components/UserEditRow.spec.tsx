import { render, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { UserEditRow } from "./UserEditRow";
import { Table, MantineProvider } from "@mantine/core";
import { removeUser, setUserName, setUserTeam, toggleUser } from "../store/roulette/rouletteSlice";

const mockDispatch = vi.fn();
vi.mock("../store/hooks", () => ({
  useAppDispatch: () => mockDispatch
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
    mockDispatch.mockClear();
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

  it("should dispatch setUserName when name is changed", () => {
    const { getByDisplayValue } = renderComponent();
    const nameInput = getByDisplayValue("Alice");

    fireEvent.change(nameInput, { target: { value: "Bob" } });

    expect(mockDispatch).toHaveBeenCalledWith(
      setUserName({ id: "user-1", newUserName: "Bob" })
    );
  });

  it("should dispatch setUserTeam when team is changed", () => {
    const { getByDisplayValue } = renderComponent();
    const teamInput = getByDisplayValue("Alpha");

    fireEvent.change(teamInput, { target: { value: "Beta" } });

    expect(mockDispatch).toHaveBeenCalledWith(
      setUserTeam({ id: "user-1", newTeamName: "Beta" })
    );
  });

  it("should dispatch toggleUser when checkbox is clicked", () => {
    const { getByRole } = renderComponent();
    const checkbox = getByRole("checkbox");

    fireEvent.click(checkbox);

    expect(mockDispatch).toHaveBeenCalledWith(
      toggleUser({ id: "user-1" })
    );
  });

  it("should dispatch removeUser when delete button is clicked", () => {
    const { getByRole } = renderComponent();
    
    // The action icon button
    const deleteButton = getByRole("button");
    fireEvent.click(deleteButton);

    expect(mockDispatch).toHaveBeenCalledWith(
      removeUser({ id: "user-1" })
    );
  });
});
