import { ActionIcon, Input, Table } from "@mantine/core";
import { IconCirclePlus } from "@tabler/icons-react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addUser, selectAllUsers } from "../store/roulette/rouletteSlice";
import { UserEditRow } from "./UserEditRow";

export function RouletteUsers() {
  const dispatch = useAppDispatch();

  const [newName, setNewName] = useState("");

  const allUsers = useAppSelector(selectAllUsers);

  const onNewNameChange = (event: { target: HTMLInputElement }) => {
    setNewName(event.target.value);
  };

  const onAddUser = () => {
    dispatch(addUser({ name: newName }));
    setNewName("");
  };

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
        </Table.Tbody>
      </Table>
    </div>
  );
}
