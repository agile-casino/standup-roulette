import { useState } from "react";
import { Wheel, WheelDataType } from "react-custom-roulette";
import { If } from "./If";
import { css } from "@emotion/react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addUser, beginSpin, endSpin, prepareSpin, removeUser, reset, selectAllUsers, selectRemainingUsers, selectSpinning, selectWinningIndex, selectWinningName, setUserName, setUserTeam, toggleUser } from "../store/roulette/rouletteSlice";
import { selectPerson, selectTeam } from "../utils/adosHelper";

export interface SettingsDialogProps {
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

  const winningIndex = useAppSelector(selectWinningIndex);
  const winningName = useAppSelector(selectWinningName);

  const allUsers = useAppSelector(selectAllUsers);
  const remainingUsers = useAppSelector(selectRemainingUsers);

  const [newName, setNewName] = useState("");

  const onSpinClicked = () => {
    dispatch(prepareSpin());
    setTimeout(() => {
      dispatch(beginSpin());
    }, 50);
  };

  const onResetClicked = () => {
    dispatch(reset());
  };

  const onStopSpinning = () => {
    dispatch(endSpin());

     const winningUser = remainingUsers[winningIndex ?? 0];

    if (winningUser.team) {
      selectTeam(`Team ${winningUser.team}`)
        .then(selectedTeam => {
          if (selectedTeam) {
            selectPerson(winningUser.name).catch(console.log);
          }
        })
        .catch(console.log);
    }
  };

  const onNameChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setUserName({ index: index, newUserName: event.target.value }));
  };

  const onTeamChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setUserTeam({ index: index, newTeamName: event.target.value }));
  };

  const onNewNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(event.target.value);
  };

  const onAddUser = () => {
    dispatch(addUser({ name: newName }));
    setNewName("");
  };

  const onRemoveUser = (index: number) => {
    dispatch(removeUser({ index: index }));
  };

  const onUserToggle = (index: number) => {
    dispatch(toggleUser({ index: index }));
  };

  const data = remainingUsers.map(user => ({
    option: user.name,
    style: { backgroundColor: user.colour }
  } as WheelDataType));

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
              <Wheel
                data={data}
                spinDuration={0.15}
                prizeNumber={winningIndex ?? 0}
                mustStartSpinning={spinning}
                onStopSpinning={onStopSpinning}
              />
              <div style={{ fontSize: "200%" }}>Winner: {winningName}</div>
            </If>
            <div>
              <button disabled={spinning} onClick={onSpinClicked} css={buttonStyle}>
                Spin
              </button>
              <button disabled={spinning} onClick={onResetClicked} css={buttonStyle}>
                Reset
              </button>
            </div>
          </div>
          <div style={{ float: "right" }}>
            <table>
              <tbody>
                {allUsers.map((user, index) => (
                  <tr key={index}>
                    <td style={{ verticalAlign: "middle" }}>
                      <div className="core-fields-checkbox">
                        <input type="checkbox" checked={user.checked} onChange={() => { onUserToggle(index); }} />
                      </div>
                    </td>
                    <td>
                      <input type="text" value={user.name} onChange={event => { onNameChange(index, event); }} />
                    </td>
                    <td>
                      <input type="text" value={user.team} onChange={event => { onTeamChange(index, event); }} />
                    </td>
                    <td style={{ verticalAlign: "middle" }}>
                      <i role="button" className="icon bowtie-icon bowtie-math-multiply" style={{ marginBottom: 0 }} onClick={() => { onRemoveUser(index); }}></i>
                    </td>
                  </tr>
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
