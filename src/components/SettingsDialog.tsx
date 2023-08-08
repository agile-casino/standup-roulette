import { useEffect, useState } from "react";
import { Wheel } from "react-custom-roulette";
import { getColourScheme } from "../utils/colourScheme";
import { WheelData } from "react-custom-roulette/dist/components/Wheel/types";
import { If } from "./If";

export interface SettingsDialogProps {
    origin: string;
    collection: string;
    project: string;
    team: string;
    sprint: string;
    open: boolean;
    onCloseClicked: () => void;
}

export const SettingsDialog = (props: SettingsDialogProps) => {

    const [spinning, setSpinning] = useState(false);
    const [winningIndex, setWinningIndex] = useState(0);
    const [remainingNames, setRemainingNames] = useState([ "Anthony", "Sad", "Adam" ]);

    const handleSpinClick = () => {
        if (!spinning) {
          const newPrizeNumber = Math.floor(Math.random() * data.length);
          setWinningIndex(newPrizeNumber);
          setSpinning(true);
        }
      }

    const onStopSpinning = () => {
        setRemainingNames(remainingNames.filter((_,i) => i !== winningIndex));
        setSpinning(false);
    };

    useEffect(() => {
    }, [props.collection, props.project, props.team, props.sprint, props.open]);

    const colours = getColourScheme(remainingNames.length);
    const data = remainingNames.map(name => ({
        option: name,
        style: { backgroundColor: colours.shift() }
    } as WheelData));

    if (props.open) {
        return (
            <div className="ui-dialog workitem-dialog ui-dialog-legacy full-screen" style={{ zIndex: 10002 }}>
                <div className="ui-dialog-titlebar">
                    <button type="button" className="ui-button ui-button-icon-only ui-dialog-titlebar-close" style={{ margin: "0.5em" }} onClick={props.onCloseClicked}>
                        <span className="ui-button-icon-primary ui-icon ui-icon-closethick"></span>
                    </button>
                </div>
                <div className="work-item-form-main-header" style={{ borderLeftColor: "rgb(0, 156, 204)", borderBottom: "1px solid rgb(234, 234, 234)" }}>
                    <div className="info-text-wrapper" style={{ fontSize: "large", padding: "0.5em" }}>Standup Roulette Settings</div>
                </div>
                <div style={{ maxHeight: "calc(100% - 42px)", overflowY: "scroll" }}>
                    <div style={{ float: "left" }}>
                        <If condition={!!data.length}>
                            <Wheel
                                data={data}
                                spinDuration={0.25}
                                prizeNumber={winningIndex}
                                mustStartSpinning={spinning}
                                onStopSpinning={onStopSpinning}
                            />
                            <button onClick={handleSpinClick}>SPIN</button>
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
