import { Button, Center } from "@mantine/core";
import { useCallback, useMemo } from "react";
import { Wheel, type WheelDataType } from "react-custom-roulette";
import { thatsAllFolks } from "../images/thatsAllFolks";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { beginSpin, endSpin, prepareSpin, reset, selectEndImageUrls, selectRemainingUsers, selectSeed, selectSpinning, selectWinningId, selectWinningName } from "../store/roulette/rouletteSlice";
import { selectPerson, selectTeam } from "../utils/adosHelper";
import { getMascot } from "../utils/mascot";
import { WinnerControl } from "./WinnerControl";

export function RouletteWheel() {
  const dispatch = useAppDispatch();

  const spinning = useAppSelector(selectSpinning);
  const winningId = useAppSelector(selectWinningId);
  const winningName = useAppSelector(selectWinningName);
  const remainingUsers = useAppSelector(selectRemainingUsers);
  const seed = useAppSelector(selectSeed);
  const endImageUrls = useAppSelector(selectEndImageUrls);

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
    dispatch(prepareSpin({ random: Math.random() }));
    setTimeout(() => {
      dispatch(beginSpin());
    }, 50);
  }, [dispatch]);

  const onFinishClicked = useCallback(() => {
    dispatch(prepareSpin({ random: Math.random() }));
  }, [dispatch]);

  const onResetClicked = useCallback(() => {
    dispatch(reset({ seed: Math.random() }));
  }, [dispatch]);

  const onStopSpinning = useCallback(() => {
    dispatch(endSpin());

    if (winningUser?.team) {
      selectTeam(winningUser.team)
        .then(selectedTeam => {
          if (selectedTeam) {
            selectPerson(winningUser.name).catch(console.error);
          }
        })
        .catch(console.error);
    }
  }, [dispatch, winningUser]);

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
