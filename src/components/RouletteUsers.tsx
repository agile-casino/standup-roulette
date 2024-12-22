import { ActionIcon, Input, Table } from "@mantine/core";
import { IconCirclePlus } from "@tabler/icons-react";
import { type ChangeEvent, memo, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addUser, selectAllUsers } from "../store/roulette/rouletteSlice";
import { UserEditRow } from "./UserEditRow";

interface InputRowProps {
  newName: string;
  onNewNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onAddUser: () => void;
}

const InputRow = memo(({ newName, onNewNameChange, onAddUser }: InputRowProps) => (
  <Table.Tr>
    <Table.Td />
    <Table.Td>
      <Input value={newName} onChange={onNewNameChange} />
    </Table.Td>
    <Table.Td />
    <Table.Td style={{ verticalAlign: "middle" }}>
      <ActionIcon onClick={onAddUser}>
        <IconCirclePlus />
      </ActionIcon>
    </Table.Td>
  </Table.Tr>
));

export function RouletteUsers() {
  const dispatch = useAppDispatch();
  const [newName, setNewName] = useState("");
  const allUsers = useAppSelector(selectAllUsers);

  const onNewNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setNewName(event.target.value);
  }, []);

  const onAddUser = useCallback(() => {
    dispatch(addUser({ name: newName }));
    setNewName("");
  }, [dispatch, newName]);

  return (
    <div style={{ height: "95%", overflowY: "auto" }}>
      <Table horizontalSpacing="3px" verticalSpacing="3px" highlightOnHover={true} withRowBorders={false}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th />
            <Table.Th>Name</Table.Th>
            <Table.Th>Sprint Backlog</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {allUsers.map(user => (
            <UserEditRow key={user.id} user={user} />
          ))}
          <InputRow newName={newName} onNewNameChange={onNewNameChange} onAddUser={onAddUser} />
        </Table.Tbody>
      </Table>
    </div>
  );
}
