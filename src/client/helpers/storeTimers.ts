import { StateCreator } from "zustand";
import { CombinedSlice, TimersSlice } from "./storeTypes";

const timerExists = (timerObj: object, timerName: string) => {

  if (!Object.hasOwn(timerObj, timerName)) {
    console.log("error: the timer", timerName, "does not exist");
    return false;
  }
  return true;

}

/** 
 * type - either "up" or "down" determines if the timer will count up or down
 * duration - sets the starting or stopping time depending on timer type, setting to false will mean no duration
 */

export const createTimersSlice: StateCreator<
  CombinedSlice,
  [],
  [],
  TimersSlice
> = (set) => ({
  timers: {
    voteTimer: {time: 0, duration: 0, state: "stopped", intervalId: null, type: "down"},
    phaseTimer: {time: 0, duration: false, state: "stopped", intervalId: null, type: "up"}
  },

  setTimer: (timer, aDuration) => set(state => {

    if (!timerExists(state.timers, timer)) return {timers: {...state.timers}};

    const curType = state.timers[timer].type;
    let newTime: number;
    if (aDuration === false || (curType === "up"  && typeof aDuration !== "boolean")) {
      newTime = 0;
    } else if (curType === "down" && typeof aDuration !== "boolean") {
      newTime = aDuration;
    } else {
      throw new Error("error setting timer, new time could not be found")
    }

    return {
      timers: {
        ...state.timers, 
        [timer]: {
          ...state.timers[timer], 
          duration: aDuration,
          time: newTime
        }
      }
    };

  }),

  startTimer: (timer, aDuration, aTime) => set(state => {

    if (!timerExists(state.timers, timer)) return {timers: {...state.timers}};

    const intervalId = state.timers[timer].intervalId;

    if (intervalId !== null) clearInterval(intervalId);

    const interval = setInterval(() => {
      set(state => {

        const curTime = state.timers[timer].time;
        const curType = state.timers[timer].type;
        const curDuration = state.timers[timer].duration;
        const curInterval = state.timers[timer].intervalId;
        if (curInterval === null) throw new Error("timer interval error, interval id is null");

        let newTime = curType === "down" ? curTime - 1 : curTime + 1;
        let newState;

        if (curType === "down" && newTime < 0) {
          newState = "stopped";
          newTime = 0;
          clearInterval(curInterval);
        } else if (typeof curDuration !== "boolean" && curType === "up" && newTime > curDuration) {
          newState = "stopped";
          newTime = curDuration;
          clearInterval(curInterval);
        }

        return {
            timers: {
            ...state.timers, 
            [timer]: {
              ...state.timers[timer], 
              time: newTime,
              state: newState ? newState : state.timers[timer].state
            }
          }
        };
      })
    }, 1000);

    return {
      timers: {
        ...state.timers, 
        [timer]: {
          ...state.timers[timer], 
          intervalId: interval, 
          state: "started",
          duration: aDuration ? aDuration : state.timers[timer].duration,
          time: aTime ? aTime : state.timers[timer].time
        }
      }
    };

  }),

  stopTimer: (timer) => set(state => {

    if (!timerExists(state.timers, timer)) return {timers: {...state.timers}};

    const intervalId = state.timers[timer].intervalId;

    if (intervalId !== null) clearInterval(intervalId);

    return {
      timers: {
        ...state.timers, 
        [timer]: {
          ...state.timers[timer], 
          intervalId: null, 
          state: "stopped",
        }
      }
    };

  }),

  resetTimer: (timer) => set(state => {

    if (!timerExists(state.timers, timer)) return {timers: {...state.timers}};

    const intervalId = state.timers[timer].intervalId;

    if (intervalId === null) throw new Error("error resetting timer, interval id is null");
    else clearInterval(intervalId);

    const duration = state.timers[timer].duration 

    return {
      timers: {
        ...state.timers, 
        [timer]: {
          ...state.timers[timer], 
          intervalId: null, 
          state: "stopped",
          time: typeof duration === "number" ? duration : 0
        }
      }
    };

  }),

})