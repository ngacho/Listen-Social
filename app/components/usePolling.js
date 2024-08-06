import { useEffect, useRef } from 'react';

function usePolling(callback, delay) {
  const savedCallback = useRef();
  const timeoutId = useRef(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = async () => {
      await savedCallback.current();
      timeoutId.current = setTimeout(tick, delay);
    };

    if (delay !== null) {
      tick(); // Start the polling
      return () => clearTimeout(timeoutId.current);
    }
  }, [delay]);
}

export default usePolling;
