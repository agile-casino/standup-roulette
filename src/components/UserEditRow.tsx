import { ActionIcon, Checkbox, Input, Table } from "@mantine/core";
import { IconCircleMinus } from "@tabler/icons-react";
import { type ChangeEvent, useCallback } from "react";
import { useAppDispatch } from "../store/hooks";
import { removeUser, setUserName, setUserTeam, toggleUser } from "../store/roulette/rouletteSlice";
import type { RouletteUser } from "../store/roulette/state";

interface UserEditRowProps {
  user: RouletteUser;
}

export function UserEditRow({ user }: Readonly<UserEditRowProps>) {
  const dispatch = useAppDispatch();

  const onNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(setUserName({ id: user.id, newUserName: event.target.value }));
    },
    [dispatch, user.id]
  );

  const onTeamChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(setUserTeam({ id: user.id, newTeamName: event.target.value }));
    },
    [dispatch, user.id]
  );

  const onToggleUser = useCallback(() => {
    dispatch(toggleUser({ id: user.id }));
  }, [dispatch, user.id]);

  const onRemoveUser = useCallback(() => {
    dispatch(removeUser({ id: user.id }));
  }, [dispatch, user.id]);

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
