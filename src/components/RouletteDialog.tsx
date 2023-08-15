import { useState } from "react";
import { Wheel, WheelDataType } from "react-custom-roulette";
import { getColourScheme } from "../utils/colourScheme";
import { If } from "./If";
import { css } from "@emotion/react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { orderBy } from "../utils/orderBy";
import { delay } from "../utils/delay";
import { formatName } from "../utils/formatName";

interface User {
  name: string;
  team?: string;
  colour?: string;
  checked?: boolean;
}

export interface SettingsDialogProps {
  origin: string;
  collection: string;
  project: string;
  team: string;
  sprint: string;
  open: boolean;
  onCloseClicked: () => void;
}

function deepCopy<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

async function selectTeam(name: string): Promise<boolean> {
  const teamNameDropdownResults = document.evaluate("//span[starts-with(text(),'Team ')]", document);
  const teamNameDropdown = teamNameDropdownResults.iterateNext() as HTMLElement | undefined;

  if (!teamNameDropdown) {
    console.log("Could not find team name dropdown.");
    return false;
  }

  if (teamNameDropdown.textContent == name) {
    return true;
  }

  teamNameDropdown.click();
  await delay(50);

  const teamNameOptionResults = document.evaluate(`//span[text()='${name}']`, document);
  const teamNameOption = teamNameOptionResults.iterateNext() as HTMLElement | undefined;

  if (!teamNameOption) {
    return false;
  }

  teamNameOption.click();
  return true;
}

async function selectPerson(name: string) {
  let personNameDropdown: HTMLElement | undefined;
  for (let i = 0; i < 30; i++) {
    try {
      const personNameDropdownResults = document.evaluate("//span[starts-with(text(),'Person: ')]", document);
      if (personNameDropdown = personNameDropdownResults.iterateNext() as HTMLElement | undefined) {
        break;
      }
    }
    catch {
    }

    await delay(100);
  }

  if (!personNameDropdown) {
    console.log("Could not find person name dropdown.");
    return;
  }

  personNameDropdown.click();
  await delay(100);

  const personNameOptionResults = document.evaluate(`//span[@class='vss-PickList--selectableElementButton-text']`, document);

  let allOption: HTMLElement | undefined;
  const personNameOptions: HTMLElement[] = [];

  let personNameOption: HTMLElement | undefined;
  while (personNameOption = personNameOptionResults.iterateNext() as HTMLElement | undefined) {
    switch (personNameOption.textContent) {
      case "@Me":
        break;
      case "Unassigned":
        break;
      case "All":
        allOption = personNameOption;
        break;
      default:
        personNameOptions.push(personNameOption);
        break;
    }
  }

  let best: HTMLElement | undefined;
  for (const person of personNameOptions) {
    const name1 = formatName(name);
    const name2 = formatName(person.textContent);

    console.log(name1);
    console.log(name2);

    if (name2.startsWith(name1)) {
      best = person;
    }
  }

  if (best) {
    best.click();
  }
  else {
    allOption?.click();
  }
}

export function RouletteDialog(props: SettingsDialogProps) {
  const [spinning, setSpinning] = useState(false);

  const [winningIndex, setWinningIndex] = useLocalStorage<number>("standup-roulette:setWinningIndex", 0);
  const [winningName, setWinningName] = useLocalStorage("standup-roulette:setWinningName", "");

  const [removeUserOnNextSpin, setRemoveItemOnNextSpin] = useLocalStorage("standup-roulette:removeUserOnNextSpin", false);

  const [allUsers, setAllUsers] = useLocalStorage<User[]>("standup-roulette:allUsers", []);
  const [remainingUsers, setRemainingUsers] = useLocalStorage<User[]>("standup-roulette:remainingUsers", []);

  const [newName, setNewName] = useState("");

  const reset = (withUsers?: User[]) => {
    const users = (withUsers ?? allUsers).filter(u => u.checked);
    const colours = getColourScheme(users.length);
    for (let i = 0; i < colours.length; i++) {
      users[i].colour = colours[i];
    }
    setRemainingUsers(users);
    setWinningName("");
    setRemoveItemOnNextSpin(false);
  };

  const onSpinClicked = () => {
    if (spinning) {
      return;
    }

    if (removeUserOnNextSpin) {
      const newRemainingUsers = remainingUsers.filter((_, i) => i !== winningIndex);
      setRemainingUsers(newRemainingUsers);
      setWinningIndex(Math.floor(Math.random() * newRemainingUsers.length));
    }
    else {
      setWinningIndex(Math.floor(Math.random() * remainingUsers.length));
    }

    setWinningName("");
    setRemoveItemOnNextSpin(true);

    setTimeout(() => {
      setSpinning(true);
    }, 1);
  };

  const onResetClicked = () => {
    reset();
  };

  const onStopSpinning = () => {
    const winningUser = remainingUsers[winningIndex];

    setSpinning(false);
    setWinningName(winningUser.name);

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
    setAllUsers(users => {
      const newUsers = deepCopy(users);
      newUsers[index].name = event.target.value;
      reset(newUsers);
      return newUsers;
    });
  };

  const onTeamChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    setAllUsers(users => {
      const newUsers = deepCopy(users);
      newUsers[index].team = event.target.value;
      reset(newUsers);
      return newUsers;
    });
  };

  const onNewNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(event.target.value);
  };

  const onAddUser = () => {
    setAllUsers(users => {
      const newUser = { name: newName } as User;
      const newUsers = [...users, newUser].sort(orderBy(u => u.name));
      reset(newUsers);
      return newUsers;
    });
    setNewName("");
  };

  const onRemoveUser = (index: number) => {
    const newUsers = allUsers.slice();
    newUsers.splice(index, 1);
    setAllUsers(newUsers);
    reset(newUsers);
  };

  const onUserToggle = (index: number) => {
    const newUsers = deepCopy(allUsers);
    newUsers[index].checked = !newUsers[index].checked;
    setAllUsers(newUsers);
    reset(newUsers);
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
                prizeNumber={winningIndex}
                mustStartSpinning={spinning}
                onStopSpinning={onStopSpinning}
              />
              <div style={{ fontSize: "200%" }}>Winner: {winningName}</div>
            </If>
            <div>
              <If condition={data.length > 2 || !winningName}>
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
