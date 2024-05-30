import { type ClassValue, clsx } from "clsx"
import { useCallback, useRef, type CSSProperties } from "react"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const capitalize = (s: string | null | undefined) => {
  if (typeof s !== "string") return ""
  return s.charAt(0).toUpperCase() + s.slice(1)
}
export const videoCallStyle = {
  height: "75vh",
  marginTop: "1.5rem",
  marginLeft: "3rem",
  marginRight: "3rem",
  alignContent: "center",
  borderRadius: "10px",
  overflow: "hidden",
} as CSSProperties

export const useDebouncedCallback = (func: (e: React.ChangeEvent<HTMLInputElement>) => void, wait: number) => {
  // Use a ref to store the timeout between renders
  // and prevent changes to it from causing re-renders
  const timeout = useRef<NodeJS.Timeout>();

  return useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const later = () => {
        clearTimeout(timeout.current);
        func(e);
      };

      clearTimeout(timeout.current);
      timeout.current = setTimeout(later, wait);
    },
    [func, wait]
  );
};
