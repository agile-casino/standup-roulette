import { ActionIcon, Button, Center, Dialog, Input, Table, TextInput, Title } from "@mantine/core";
import { IconArrowLeft, IconArrowRight, IconCirclePlus, IconSettings } from "@tabler/icons-react";
import { type ChangeEvent, useMemo, useState } from "react";
import { Wheel, type WheelDataType } from "react-custom-roulette";
import { thatsAllFolks } from "../images/thatsAllFolks";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addUser,
  beginSpin,
  endSpin,
  nextGame,
  prepareSpin,
  prevGame,
  reset,
  selectAllUsers,
  selectEndImageUrl,
  selectGameName,
  selectRemainingUsers,
  selectSeed,
  selectSpinning,
  selectWinningId,
  selectWinningName,
  setEndImageUrl,
  setGameName
} from "../store/roulette/rouletteSlice";
import { selectPerson, selectTeam } from "../utils/adosHelper";
import { getMascot } from "../utils/mascot";
import { If } from "./If";
import { UserEditRow } from "./UserEditRow";
import { WinnerControl } from "./WinnerControl";
import styles from "./RouletteDialog.module.css";

interface SettingsDialogProps {
  origin: string;
  collection: string;
  project: string;
  team: string;
  sprint: string;
  open: boolean;
  onCloseClicked: () => void;
}

export function RouletteDialog(props: Readonly<SettingsDialogProps>) {
  const dispatch = useAppDispatch();

  const gameName = useAppSelector(selectGameName);

  const spinning = useAppSelector(selectSpinning);

  const winningId = useAppSelector(selectWinningId);
  const winningName = useAppSelector(selectWinningName);

  const allUsers = useAppSelector(selectAllUsers);
  const remainingUsers = useAppSelector(selectRemainingUsers);
  const seed = useAppSelector(selectSeed);

  const winningIndex = remainingUsers.findIndex(x => x.id === winningId) > 0 ? remainingUsers.findIndex(x => x.id === winningId) : 0;

  const [newName, setNewName] = useState("");

  const [showSettings, setShowSettings] = useState(false);
  const endImageUrl = useAppSelector(selectEndImageUrl);

  const onSpinClicked = () => {
    dispatch(prepareSpin({ random: Math.random() })); // eslint-disable-line sonarjs/pseudo-random
    setTimeout(() => {
      dispatch(beginSpin());
    }, 50);
  };

  const onResetClicked = () => {
    dispatch(reset({ seed: Math.random() })); // eslint-disable-line sonarjs/pseudo-random
  };

  const onStopSpinning = () => {
    dispatch(endSpin());

    const winningUser = remainingUsers.find(u => u.id === winningId);

    if (winningUser?.team) {
      selectTeam(`Team ${winningUser.team}`)
        .then((selectedTeam) => {
          if (selectedTeam) {
            selectPerson(winningUser.name).catch((e: unknown) => console.log(e));
          }
        })
        .catch((e: unknown) => console.log(e));
    }
  };

  const onNewNameChange = (event: { target: HTMLInputElement }) => {
    setNewName(event.target.value);
  };

  const onAddUser = () => {
    dispatch(addUser({ name: newName }));
    setNewName("");
  };

  const data: WheelDataType[] = useMemo(() => {
    return remainingUsers.map(user => ({ option: user.name, style: { backgroundColor: user.colour } }));
  }, [remainingUsers]);

  if (props.open) {
    return (
      <Dialog opened={true} className={styles.dialog} position={{ bottom: 0, left: 0 }} w={1000} h={700} withBorder={true} withCloseButton={true} onClose={props.onCloseClicked}>
        <ActionIcon variant="subtle" style={{ position: "absolute", top: "calc(var(--mantine-spacing-md) / 2)", right: "calc(var(--ai-size) + var(--mantine-spacing-md) / 2)" }} onClick={() => setShowSettings(showSettings => !showSettings)}>
          <IconSettings />
        </ActionIcon>
        <Title order={4} fw={400} className={styles.header}>
          <span>Standup Roulette</span>
          <ActionIcon style={{ margin: "0 1rem", verticalAlign: "bottom" }} onClick={() => dispatch(prevGame())}>
            <IconArrowLeft />
          </ActionIcon>
          <span>
            <TextInput value={gameName} style={{ display: "inline-block" }} onChange={event => dispatch(setGameName({ name: event.currentTarget.value }))} />
          </span>
          <ActionIcon style={{ margin: "0 1rem", verticalAlign: "bottom" }} onClick={() => dispatch(nextGame())}>
            <IconArrowRight />
          </ActionIcon>
        </Title>
        {
          showSettings
            ? (
                <SettingsPanel />
              )
            : (
                <div style={{ height: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <If condition={!!data.length}>
                      <Wheel data={data} spinDuration={0.15} prizeNumber={winningIndex} mustStartSpinning={spinning} onStopSpinning={onStopSpinning} />
                      <Center>
                        <WinnerControl name={winningName ?? ""} mascotNumber={getMascot(winningName ?? "", seed)} />
                      </Center>
                    </If>
                    <If condition={!data.length && !!winningName}>
                      <img src={endImageUrl || thatsAllFolks} alt="Fin" width={445} height={445} />
                    </If>
                    <Center>
                      <If condition={remainingUsers.length > 0}>
                        <Button variant="filled" disabled={spinning} style={{ width: "5rem", margin: "0.2rem" }} onClick={onSpinClicked}>
                          Spin
                        </Button>
                      </If>
                      <Button variant="filled" disabled={spinning} style={{ width: "5rem", margin: "0.2rem" }} onClick={onResetClicked}>
                        Reset
                      </Button>
                    </Center>
                  </div>
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
                </div>
              )
        }
      </Dialog>
    );
  }
}

function SettingsPanel() {
  const dispatch = useAppDispatch();
  const endImageUrl = useAppSelector(selectEndImageUrl);

  const onEndImageUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setEndImageUrl({ url: event.currentTarget.value }));
  };

  return (
    <div>
      <Title order={5} fw={400} className={styles.header}>
        Settings
      </Title>
      <Input.Wrapper label="End of standup image url">
        <Input placeholder="(default)" value={endImageUrl} onChange={onEndImageUrlChange} />
      </Input.Wrapper>
    </div>
  );
}
