"use client";
import dynamic from "next/dynamic";

const DynamicHome = dynamic(
  () => import("~/components/videocall/VideocallContainer"),
  { ssr: false },
);

export default function ExportPage() {
  return <DynamicHome />;
}
