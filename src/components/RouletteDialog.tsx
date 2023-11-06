import { useMemo, useState } from "react";
import { Wheel, WheelDataType } from "react-custom-roulette";
import { If } from "./If";
import { css } from "@emotion/react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addUser, beginSpin, endSpin, prepareSpin, removeUser, reset, selectAllUsers, selectRemainingUsers, selectSeed, selectSpinning, selectWinningId, selectWinningName, setUserName, setUserTeam, toggleUser } from "../store/roulette/rouletteSlice";
import { selectPerson, selectTeam } from "../utils/adosHelper";
import { User } from "../store/roulette/User";
import { thatsAllFolks } from "../images/thatsAllFolks";
import { getMascot } from "../utils/mascot";

interface SettingsDialogProps {
  origin: string;
  collection: string;
  project: string;
  team: string;
  sprint: string;
  open: boolean;
  onCloseClicked: () => void;
}

export function RouletteDialog(props: SettingsDialogProps) {
  const dispatch = useAppDispatch();

  const spinning = useAppSelector(selectSpinning);

  const winningId = useAppSelector(selectWinningId);
  const winningName = useAppSelector(selectWinningName);

  const allUsers = useAppSelector(selectAllUsers);
  const remainingUsers = useAppSelector(selectRemainingUsers);
  const seed = useAppSelector(selectSeed);

  const winningIndex = remainingUsers.findIndex((x) => x.id === winningId) > 0 ? remainingUsers.findIndex((x) => x.id === winningId) : 0;

  const [newName, setNewName] = useState("");

  const onSpinClicked = () => {
    dispatch(prepareSpin({ random: Math.random() }));
    setTimeout(() => {
      dispatch(beginSpin());
    }, 50);
  };

  const onResetClicked = () => {
    dispatch(reset({ seed: Math.random() }));
  };

  const onStopSpinning = () => {
    dispatch(endSpin());

    const winningUser = remainingUsers.find((u) => u.id === winningId);

    if (winningUser?.team) {
      selectTeam(`Team ${winningUser.team}`)
        .then((selectedTeam) => {
          if (selectedTeam) {
            selectPerson(winningUser.name).catch(console.log);
          }
        })
        .catch(console.log);
    }
  };

  const onNewNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(event.target.value);
  };

  const onAddUser = () => {
    dispatch(addUser({ name: newName }));
    setNewName("");
  };

  const data: WheelDataType[] = useMemo(() => {
    return remainingUsers.map((user) => ({ option: user.name, style: { backgroundColor: user.colour } }));
  }, [remainingUsers]);

  if (props.open) {
    return (
      <div className="ui-dialog  workitem-dialog ui-dialog-legacy" css={dialogStyles} style={{ position: "fixed", width: "1000px", height: "650px" }}>
        <div className="ui-dialog-titlebar">
          <button type="button" className="ui-button ui-button-icon-only ui-dialog-titlebar-close" style={{ margin: "0.5em", width: "27px" }} onClick={props.onCloseClicked}>
            <span className="ui-button-icon-primary ui-icon ui-icon-closethick"></span>
          </button>
        </div>
        <div className="work-item-form-main-header" style={{ borderLeftColor: "rgb(0, 156, 204)", borderBottom: "1px solid rgb(234, 234, 234)" }}>
          <div className="info-text-wrapper" style={{ fontSize: "large", padding: "0.5em" }}>
            Standup Roulette
          </div>
        </div>
        <div className="bowtie-style" style={{ maxHeight: "calc(100% - 42px)", overflowY: "auto" }}>
          <div css={wheelContainerStyle}>
            <If condition={!!data.length}>
              <Wheel data={data} spinDuration={0.15} prizeNumber={winningIndex} mustStartSpinning={spinning} onStopSpinning={onStopSpinning} />
              <div style={{ fontSize: "200%" }}>
                <span style={{ verticalAlign: "middle" }}>Winner: {winningName}</span>
                <span style={{ verticalAlign: "middle", paddingLeft: "1em" }}>{winningName && <img src={getMascot(winningName, seed).uri} width={48} height={48} />}</span>
              </div>
            </If>
            <If condition={!data.length && !!winningName}>
              <img src={thatsAllFolks} width={445} height={445} />
            </If>
            <div>
              <If condition={remainingUsers.length > 0}>
                <button disabled={spinning} onClick={onSpinClicked} css={buttonStyle}>
                  Spin
                </button>
              </If>
              <button disabled={spinning} onClick={onResetClicked} css={buttonStyle}>
                Reset
              </button>
            </div>
          </div>
          <div style={{ float: "right" }}>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th style={{ textAlign: "left" }}>Name</th>
                  <th style={{ textAlign: "left" }}>Sprint Backlog</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user) => (
                  <UserEditRow key={user.id} user={user} />
                ))}
                <tr>
                  <td></td>
                  <td>
                    <input type="text" value={newName} onChange={onNewNameChange} />
                  </td>
                  <td></td>
                  <td style={{ verticalAlign: "middle" }}>
                    <i className="icon bowtie-icon bowtie-math-plus" onClick={onAddUser}></i>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  else {
    return null;
  }
}

function UserEditRow({ user }: { user: User }) {
  const dispatch = useAppDispatch();

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setUserName({ id: user.id, newUserName: event.target.value }));
  };

  const onTeamChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setUserTeam({ id: user.id, newTeamName: event.target.value }));
  };

  const onToggleUser = () => {
    dispatch(toggleUser({ id: user.id }));
  };

  const onRemoveUser = () => {
    dispatch(removeUser({ id: user.id }));
  };

  return (
    <tr>
      <td style={{ verticalAlign: "middle" }}>
        <div className="core-fields-checkbox">
          <input type="checkbox" checked={user.checked} onChange={onToggleUser} />
        </div>
      </td>
      <td>
        <input type="text" value={user.name} onChange={onNameChange} />
      </td>
      <td>
        <input type="text" value={user.team} onChange={onTeamChange} />
      </td>
      <td style={{ verticalAlign: "middle" }}>
        <i role="button" className="icon bowtie-icon bowtie-math-multiply" style={{ marginBottom: 0 }} onClick={onRemoveUser}></i>
      </td>
    </tr>
  );
}

const dialogStyles = css`
  left: 0;
  bottom: 0;
  zindex: 10002;
  transform: scale(25%);
  transform-origin: bottom left;
  transition-property: transform;
  transition-duration: 0.3s;
  &:hover {
    transform: scale(100%);
  }
`;

const wheelContainerStyle = css({
  float: "left",
  overflow: "hidden",
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "center"
});

const buttonStyle = css({
  margin: "5px"
});
