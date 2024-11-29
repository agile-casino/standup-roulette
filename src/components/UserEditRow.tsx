import { ActionIcon, Checkbox, Input, Table } from "@mantine/core";
import { IconCircleMinus } from "@tabler/icons-react";
import { useAppDispatch } from "../store/hooks";
import { removeUser, setUserName, setUserTeam, toggleUser } from "../store/roulette/rouletteSlice";
import type { RouletteUser } from "../store/roulette/state";

interface UserEditRowProps {
  user: RouletteUser;
}

export function UserEditRow({ user }: Readonly<UserEditRowProps>) {
  const dispatch = useAppDispatch();

  const onNameChange = (event: { target: HTMLInputElement }) => {
    dispatch(setUserName({ id: user.id, newUserName: event.target.value }));
  };

  const onTeamChange = (event: { target: HTMLInputElement }) => {
    dispatch(setUserTeam({ id: user.id, newTeamName: event.target.value }));
  };

  const onToggleUser = () => {
    dispatch(toggleUser({ id: user.id }));
  };

  const onRemoveUser = () => {
    dispatch(removeUser({ id: user.id }));
  };

  return (
    <Table.Tr>
      <Table.Td style={{ verticalAlign: "middle" }}>
        <Checkbox checked={user.checked} onChange={onToggleUser} />
      </Table.Td>
      <Table.Td>
        <Input value={user.name} onChange={onNameChange} />
      </Table.Td>
      <Table.Td>
        <Input value={user.team ?? ""} onChange={onTeamChange} />
      </Table.Td>
      <Table.Td style={{ verticalAlign: "middle" }}>
        <ActionIcon color="red" onClick={onRemoveUser}>
          <IconCircleMinus />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
}
