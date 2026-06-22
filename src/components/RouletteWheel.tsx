import { Button, Center } from "@mantine/core";
import { useCallback, useMemo } from "react";
import { Wheel, type WheelDataType } from "react-custom-roulette";
import { thatsAllFolks } from "../images/thatsAllFolks";
import { useRouletteStore } from "../store/useRouletteStore";
import { selectPerson, selectTeam } from "../utils/adosHelper";
import { getMascot } from "../utils/mascot";
import { WinnerControl } from "./WinnerControl";

export function RouletteWheel() {
  const spinning = useRouletteStore(state => state.games[state.currentGame].spinning);
  const winningId = useRouletteStore(state => state.games[state.currentGame].winningId);
  const winningName = useRouletteStore(state => state.games[state.currentGame].winningName);
  const remainingUsers = useRouletteStore(state => state.games[state.currentGame].remainingUsers);
  const seed = useRouletteStore(state => state.games[state.currentGame].seed);
  const endImageUrls = useRouletteStore(state => state.games[state.currentGame].endImageUrls);

  const prepareSpin = useRouletteStore(state => state.prepareSpin);
  const beginSpin = useRouletteStore(state => state.beginSpin);
  const reset = useRouletteStore(state => state.reset);
  const endSpin = useRouletteStore(state => state.endSpin);

  const winningUser = useMemo(() => {
    return remainingUsers.find(u => u.id === winningId);
  }, [remainingUsers, winningId]);

  const winningUserIndex = useMemo(() => {
    return remainingUsers.findIndex(u => u.id === winningId);
  }, [remainingUsers, winningId]);

  const data: WheelDataType[] = useMemo(() => {
    return remainingUsers.map(user => ({ option: user.name, style: { backgroundColor: user.colour } }));
  }, [remainingUsers]);

  const selectedEndImageUrl = useMemo(() => {
    const enabledEndImageUrls = endImageUrls.filter(x => x.enabled && x.url.trim().length > 0);
    if (!enabledEndImageUrls.length) {
      return "";
    }

    const randomValue = (Math.random() + seed + (winningName?.length ?? 0)) % 1;
    const randomIndex = Math.min(Math.floor(randomValue * enabledEndImageUrls.length), enabledEndImageUrls.length - 1);
    return enabledEndImageUrls[randomIndex].url;
  }, [endImageUrls, seed, winningName]);

  const onSpinClicked = useCallback(() => {
    prepareSpin(Math.random());
    setTimeout(() => {
      beginSpin();
    }, 50);
  }, [prepareSpin, beginSpin]);

  const onFinishClicked = useCallback(() => {
    prepareSpin(Math.random());
  }, [prepareSpin]);

  const onResetClicked = useCallback(() => {
    reset(Math.random());
  }, [reset]);

  const onStopSpinning = useCallback(() => {
    endSpin();

    if (winningUser?.team) {
      selectTeam(winningUser.team)
        .then(selectedTeam => {
          if (selectedTeam) {
            selectPerson(winningUser.name).catch(console.error);
          }
        })
        .catch(console.error);
    }
  }, [endSpin, winningUser]);

  const showFinishButton = remainingUsers.length === 1 && winningId !== null;

  return (
    <div>
      {!!data.length && (
        <>
          <Wheel data={data} spinDuration={0.15} prizeNumber={winningUserIndex} mustStartSpinning={spinning} onStopSpinning={onStopSpinning} />
          <Center>
            <WinnerControl name={winningName ?? ""} mascotNumber={getMascot(winningName ?? "", seed)} />
          </Center>
        </>
      )}
      {!data.length && !!winningName && <img src={selectedEndImageUrl || thatsAllFolks} alt="Fin" width={445} height={445} />}
      <Center>
        {remainingUsers.length > 0 ? (
          <>
            {showFinishButton ? (
              <Button color="green" variant="filled" disabled={spinning} style={{ width: "5rem", margin: "0.2rem" }} onClick={onFinishClicked}>
                Finish
              </Button>
            ) : (
              <Button color="green" variant="filled" disabled={spinning} style={{ width: "5rem", margin: "0.2rem" }} onClick={onSpinClicked}>
                Spin
              </Button>
            )}
            <Button variant="default" disabled={spinning} style={{ width: "5rem", margin: "0.2rem" }} onClick={onResetClicked}>
              Reset
            </Button>
          </>
        ) : (
          <Button color="green" variant="filled" disabled={spinning} style={{ width: "5rem", margin: "0.2rem" }} onClick={onResetClicked}>
            Reset
          </Button>
        )}
      </Center>
    </div>
  );
}
