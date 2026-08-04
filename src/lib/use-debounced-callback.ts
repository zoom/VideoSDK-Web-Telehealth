"use client";

import { useCallback, useRef } from "react";

export const useDebouncedCallback = (
  func: (e: React.ChangeEvent<HTMLInputElement>) => void,
  wait: number,
) => {
  const timeout = useRef<NodeJS.Timeout | undefined>(undefined);
  return useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => func(e), wait);
    },
    [func, wait],
  );
};
