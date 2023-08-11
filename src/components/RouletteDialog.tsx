import { useEffect, useState } from "react";
import { Wheel, WheelDataType } from "react-custom-roulette";
import { getColourScheme } from "../utils/colourScheme";
import { If } from "./If";
import { css } from "@emotion/react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { orderBy } from "../utils/orderBy";

interface User {
    name: string;
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

export function RouletteDialog(props: SettingsDialogProps) {

    const [spinning, setSpinning] = useState(false);
    const [winningIndex, setWinningIndex] = useState<number>(0);
    const [removeItemOnNextSpin, setRemoveItemOnNextSpin] = useState(false);

    const [allUsers, setAllUsers] = useLocalStorage<User[]>("standup-roulette:allUsers", []);
    const [remainingUsers, setRemainingUsers] = useLocalStorage<User[]>("standup-roulette:remainingUsers", []);

    const [newName, setNewName] = useState("");

    const reset = (withUsers?: User[]) => {
        const users = (withUsers ?? allUsers).filter(u => u.checked);
        setRemainingUsers(users);
        setRemoveItemOnNextSpin(false);
    };

    useEffect(() => {
        if (!remainingUsers.length) {
            reset();
            const newPrizeNumber = Math.floor(Math.random() * data.length);
            setWinningIndex(newPrizeNumber);
        }
    }, [allUsers]);

    const onSpinClicked = () => {
        if (spinning) {
            return;
        }
        if (removeItemOnNextSpin) {
            setRemainingUsers(remainingUsers.filter((_,i) => i !== winningIndex));
        }
        setWinningIndex(Math.floor(Math.random() * data.length));
        setRemoveItemOnNextSpin(true);
        setSpinning(true);
    };

    const onResetClicked = () => {
        reset();
    };

    const onStopSpinning = () => {
        setSpinning(false);
    };

    const onNameChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        setAllUsers(users => {
            const newUsers = deepCopy(users);
            newUsers[index].name = event.target.value;
            reset(newUsers);
            return newUsers;
        });
        event.stopPropagation();
        event.preventDefault();
    }

    const onNewNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewName(event.target.value);
    };

    const onAddUser = () => {
        setAllUsers(users => {
            const newUser = { name: newName } as User;
            const newUsers = [...users, newUser].sort(orderBy(u => u.name));

            const colours = getColourScheme(newUsers.length);
            for (let i = 0; i < colours.length; i++) {
                newUsers[i].colour = colours[i];
            }

            reset(newUsers);
            return newUsers;
        });
        setNewName("");
    };

    const onRemoveUser = (index: number) => {
        setAllUsers(names => {
            const newUsers = names.slice();
            newUsers.splice(index, 1);
            return newUsers;
        });
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
        //left: 50%;
        //top: 50%;
        //transform: translate(-50%, -50%);

        // position: fixed !important;
        // left: 0px;
        // bottom: 0px;

        zoom: 25%;
        transition-property: zoom;
        transition-duration: 1s;
        &:hover {
        //     left: 50%;
            zoom: 100%;
        }
    `;

    if (props.open) {
        return (
            <div className="ui-dialog  workitem-dialog ui-dialog-legacy" css={dialogStyles} style={{ zIndex: 10002, width: "1000px", height: "650px", position: "fixed", left: 0, bottom: 0 }}>
                <div className="ui-dialog-titlebar">
                    <button type="button" className="ui-button ui-button-icon-only ui-dialog-titlebar-close" style={{ margin: "0.5em", width: "27px" }} onClick={props.onCloseClicked}>
                        <span className="ui-button-icon-primary ui-icon ui-icon-closethick"></span>
                    </button>
                </div>
                <div className="work-item-form-main-header" style={{ borderLeftColor: "rgb(0, 156, 204)", borderBottom: "1px solid rgb(234, 234, 234)" }}>
                    <div className="info-text-wrapper" style={{ fontSize: "large", padding: "0.5em" }}>Standup Roulette</div>
                </div>
                <div className="bowtie-style" style={{ maxHeight: "calc(100% - 42px)", overflowY: "auto" }}>
                    <div style={{ float: "left", overflow: "hidden" }}>
                        <If condition={!!data.length}>
                            <Wheel
                                data={data}
                                spinDuration={0.15}
                                prizeNumber={winningIndex}
                                mustStartSpinning={spinning}
                                onStopSpinning={onStopSpinning}
                            />
                            <button disabled={spinning} onClick={onSpinClicked} css={buttonStyle}>Spin</button>
                            <button disabled={spinning} onClick={onResetClicked} css={buttonStyle}>Reset</button>
                        </If>
                    </div>
                    <div style={{ float: "right" }}>
                        <table>
                            <tbody>
                                {allUsers.map((user, index) => (
                                    <tr key={index}>
                                        <td style={{ verticalAlign: "middle" }}>
                                            <div className="core-fields-checkbox">
                                                <input type="checkbox" id="showId" checked={user.checked} onChange={() => onUserToggle(index)} />
                                            </div>
                                        </td>
                                        <td>
                                            <input type="text" value={user.name} onChange={event => onNameChange(index, event)} />
                                        </td>
                                        <td style={{ verticalAlign: "middle" }}>
                                            <i role="button" className="icon bowtie-icon bowtie-math-multiply" style={{ marginBottom: 0 }} onClick={() => onRemoveUser(index)}></i>
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td></td>
                                    <td>
                                        <input type="text" value={newName} onChange={onNewNameChange} />
                                    </td>
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
};

const buttonStyle = css({
    margin: "5px"
});
