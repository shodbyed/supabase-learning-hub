import React, { useEffect, useRef } from 'react';

/**
 * Custom hook that allows you to update the state when a specific value changes
 * This is good for making sure these values update whenever the data is fetched
 * @param currentValue - the value of the initial state you want to keep track of (ex. data: from database)
 * @param setState - the state setter of the mutable state you want to keep
 */
export const useStateUpdater = <T>(
  currentValue: T | undefined,
  setState: React.Dispatch<React.SetStateAction<T | undefined>>,
) => {
  // set a ref for the current value
  const prevValueRef = useRef<T>();
  useEffect(() => {
    // checks if the currentValue is different from the previous value
    // if it is different, then set the state to the current value
    // update the previous value
    if (currentValue && currentValue !== prevValueRef.current) {
      setState(currentValue);
      prevValueRef.current = currentValue;
    }
  }, [currentValue, setState]);
};

export const useStateCreator = <T>(initialState: T | undefined) => {
  const [state, setState] = React.useState<T | undefined>(initialState);
  useStateUpdater(initialState, setState);
  return [state, setState] as [T, React.Dispatch<React.SetStateAction<T>>];
};
