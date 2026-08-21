import { useEffect, useRef, useState } from "react";

type SpinDelayOptions = {
  delay?: number;
  minDuration?: number;
};

export function useSpinDelay(loading: boolean, options: SpinDelayOptions = {}): boolean {
  const { delay = 150, minDuration = 300 } = options;
  const [showSpinner, setShowSpinner] = useState(false);
  const showTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (loading) {
      if (showTimeRef.current != null) {
        setShowSpinner(true);
        return;
      }

      if (delay <= 0) {
        showTimeRef.current = Date.now();
        setShowSpinner(true);
      } else {
        timer = setTimeout(() => {
          showTimeRef.current = Date.now();
          setShowSpinner(true);
        }, delay);
      }
    } else {
      if (showTimeRef.current == null) {
        setShowSpinner(false);
      } else {
        const elapsed = Date.now() - showTimeRef.current;
        const remaining = minDuration - elapsed;

        if (remaining <= 0) {
          showTimeRef.current = null;
          setShowSpinner(false);
        } else {
          timer = setTimeout(() => {
            showTimeRef.current = null;
            setShowSpinner(false);
          }, remaining);
        }
      }
    }

    return () => {
      if (timer != null) {
        clearTimeout(timer);
      }
    };
  }, [loading, delay, minDuration]);

  return showSpinner;
}
