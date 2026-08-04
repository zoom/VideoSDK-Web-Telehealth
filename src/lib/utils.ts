import { type ClassValue, clsx } from "clsx";
import { type CSSProperties } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const capitalize = (s: string | null | undefined) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const videoCallStyle = {
  height: "75vh",
  marginTop: "1.5rem",
  marginLeft: "3rem",
  marginRight: "3rem",
  alignContent: "center",
  borderRadius: "10px",
  overflow: "hidden",
} as CSSProperties;
