import { useEffect, useState } from "react";
import { Wheel, WheelDataType } from "react-custom-roulette";
import { getColourScheme } from "../utils/colourScheme";
import { If } from "./If";
import { css } from "@emotion/react";

interface User {
    name: string;
    colour: string;
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

export function RouletteDialog(props: SettingsDialogProps) {

    const [spinning, setSpinning] = useState(false);
    const [winningIndex, setWinningIndex] = useState<number>(0);
    const [removeItemOnNextSpin, setRemoveItemOnNextSpin] = useState(false);

    const [allNames, setAllNames] = useState<string[]>([]);
    const [remainingUsers, setRemainingUsers] = useState<User[]>([]);

    useEffect(() => {
        const serialisedNames = localStorage.getItem("standup-roulette:names");
        if (serialisedNames) {
            const names = JSON.parse(serialisedNames) as string[];
            setAllNames(names);
            const colours = getColourScheme(names.length);
            setRemainingUsers(names.map(name => ({ name: name, colour: colours.shift() } as User)));
            const newPrizeNumber = Math.floor(Math.random() * data.length);
            setWinningIndex(newPrizeNumber);
        }
    }, []);

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
      }

    const onResetClicked = () => {
        setSpinning(false);
        const colours = getColourScheme(allNames.length);
        setRemainingUsers(allNames.map(name => ({ name: name, colour: colours.shift() } as User)));
        setRemoveItemOnNextSpin(false);
    };

    const onStopSpinning = () => {
        setSpinning(false);
    };

    useEffect(() => {
    }, [props.collection, props.project, props.team, props.sprint, props.open]);

    const data = remainingUsers.map(user => ({
        option: user.name,
        style: { backgroundColor: user.colour }
    } as WheelDataType));

    if (props.open) {
        return (
            <div className="ui-dialog workitem-dialog ui-dialog-legacy" style={{ zIndex: 10002, width: "900px", height: "600px", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
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
                                spinDuration={0.25}
                                prizeNumber={winningIndex}
                                mustStartSpinning={spinning}
                                onStopSpinning={onStopSpinning}
                            />
                            <button disabled={spinning} onClick={onSpinClicked} css={buttonStyle}>Spin</button>
                            <button disabled={spinning} onClick={onResetClicked} css={buttonStyle}>Reset</button>
                        </If>
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
