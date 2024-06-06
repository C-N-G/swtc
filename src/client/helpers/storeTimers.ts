const timerExists = (timerObj, timerName) => {

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

export const createTimersSlice = (set) => ({
  timers: {
    voteTimer: {time: 0, duration: 0, state: "stopped", intervalId: null, type: "down"},
    phaseTimer: {time: 0, duration: false, state: "stopped", intervalId: null, type: "up"}
  },

  setTimer: (timer, aDuration) => set(state => {

    if (!timerExists(state.timers, timer)) return {timers: {...state.timers}};

    const curType = state.timers[timer].type;
    const newTime = curType === "down" ? aDuration : 0

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

    if (state.timers[timer].intervalId) {
      clearInterval(state.timers[timer].intervalId);
    }

    const interval = setInterval(() => {
      set(state => {

        const curTime = state.timers[timer].time;
        const curType = state.timers[timer].type;
        const curDuration = state.timers[timer].duration;
        const curInterval = state.timers[timer].intervalId;

        let newTime = curType === "down" ? curTime - 1 : curTime + 1;
        let newState;

        if (curType === "down" && newTime < 0) {
          newState = "stopped";
          newTime = 0;
          clearInterval(curInterval);
        } else if (curDuration && curType === "up" && newTime > curDuration) {
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

    clearInterval(state.timers[timer].intervalId);

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

    clearInterval(state.timers[timer].intervalId);

    const duration = state.timers[timer].duration 

    return {
      timers: {
        ...state.timers, 
        [timer]: {
          ...state.timers[timer], 
          intervalId: null, 
          state: "stopped",
          time: duration ? duration : 0
        }
      }
    };

  }),

})