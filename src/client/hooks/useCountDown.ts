import { useEffect, useState } from "react";

function useCountDown(duration: number, activationFunc: () => void): [time: number, beginTimer: () => void, resetTimer: () => void] {

  const [time, setTime] = useState(duration);
  const [timerState, setTimerState] = useState("stopped");

  function beginTimer() {
    setTime(duration);
    setTimerState("started");
  }

  function resetTimer() {
    setTime(duration);
    setTimerState("stopped");
  }

  if (timerState === "activate") {
    activationFunc();
    setTimerState("stopped");
  } 

  useEffect(() => {

    if (timerState !== "started") return () => {};

    const interval = setInterval(() => {
      setTime(pt => {
        if (pt <= 0) {
          clearInterval(interval);
          setTimerState("activate");
          return 0;
        } else {
          return pt - 1;
        }
      });
    }, 1000);

    return () => clearInterval(interval);

  }, [timerState]);

  return [time, beginTimer, resetTimer];

}

export default useCountDown;