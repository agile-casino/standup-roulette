import { ActionIcon, Checkbox, Input, Table } from "@mantine/core";
import { IconCircleMinus } from "@tabler/icons-react";
import { type ChangeEvent, useCallback } from "react";
import type { RouletteUser } from "../store/roulette/state";
import { useRouletteStore } from "../store/useRouletteStore";

interface UserEditRowProps {
  user: RouletteUser;
}

export function UserEditRow({ user }: Readonly<UserEditRowProps>) {
  const removeUser = useRouletteStore(state => state.removeUser);
  const setUserName = useRouletteStore(state => state.setUserName);
  const setUserTeam = useRouletteStore(state => state.setUserTeam);
  const toggleUser = useRouletteStore(state => state.toggleUser);

  const onNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setUserName(user.id, event.target.value);
    },
    [setUserName, user.id]
  );

  const onTeamChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setUserTeam(user.id, event.target.value);
    },
    [setUserTeam, user.id]
  );

  const onToggleUser = useCallback(() => {
    toggleUser(user.id);
  }, [toggleUser, user.id]);

  const onRemoveUser = useCallback(() => {
    removeUser(user.id);
  }, [removeUser, user.id]);

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
