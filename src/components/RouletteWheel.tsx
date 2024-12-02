import { Button, Center } from "@mantine/core";
import { useMemo } from "react";
import { Wheel, WheelDataType } from "react-custom-roulette";
import { thatsAllFolks } from "../images/thatsAllFolks";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { beginSpin, endSpin, prepareSpin, reset, selectEndImageUrl, selectRemainingUsers, selectSeed, selectSpinning, selectWinningId, selectWinningName } from "../store/roulette/rouletteSlice";
import { selectPerson, selectTeam } from "../utils/adosHelper";
import { getMascot } from "../utils/mascot";
import { If } from "./If";
import { WinnerControl } from "./WinnerControl";

export function RouletteWheel() {
  const dispatch = useAppDispatch();

  const spinning = useAppSelector(selectSpinning);

  const winningId = useAppSelector(selectWinningId);
  const winningName = useAppSelector(selectWinningName);

  const remainingUsers = useAppSelector(selectRemainingUsers);
  const seed = useAppSelector(selectSeed);

  const winningIndex = remainingUsers.findIndex(x => x.id === winningId) > 0 ? remainingUsers.findIndex(x => x.id === winningId) : 0;

  const data: WheelDataType[] = useMemo(() => {
    return remainingUsers.map(user => ({ option: user.name, style: { backgroundColor: user.colour } }));
  }, [remainingUsers]);

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

  return (
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
  );
}
