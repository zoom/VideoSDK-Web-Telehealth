"use client";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";

export function ViewNotes({ roomId, dontShowAdd }: { roomId: string; dontShowAdd?: boolean }) {
  const { data, isLoading } = api.room.getNotesFromRoom.useQuery({ id: roomId });
  const addNote = api.room.addNote.useMutation();
  const { room } = api.useUtils();
  const [S, setS] = useState("");
  const [O, setO] = useState("");
  const [A, setA] = useState("");
  const [P, setP] = useState("");

  return (
    <>
      <Card className="mt-2 min-w-96 p-8 pl-12">
        {isLoading ? <Skeleton className="h-8 w-72" /> : <></>}
        {data?.length !== 0 ? (
          <ol className="list-decimal">
            {data?.slice().reverse().map((note) => (
              <li className="mb-2 list-item" key={note.id}>
                <span>
                  {note.createdAt.toDateString().split(" ").slice(1, 3).join(" ")} / {note.createdAt.toTimeString().split(" ").slice(0, 1).join(" ")}
                </span>
                <ul className="text-sm">
                  <li><span className="font-bold">Subjective:</span> {note.contentS}</li>
                  <li><span className="font-bold">Objective:</span> {note.contentO}</li>
                  <li><span className="font-bold">Assessment:</span> {note.contentA}</li>
                  <li><span className="font-bold">Planning:</span> {note.contentP}</li>
                </ul>
              </li>
            ))}
          </ol>
        ) : (
          <p>No notes</p>
        )}
      </Card>
      {dontShowAdd ? null : (
        <Card className="my-2 min-w-96 p-8">
          <div className="mb-4 flex flex-col">
            <Label htmlFor="note" className="font-bold">Subjective - Patient&apos;s Perspective</Label>
            <textarea className="min-h-8 rounded-sm border-2 p-1" value={S} onChange={(e) => setS(e.target.value)} />
          </div>
          <div className="mb-4 flex flex-col">
            <Label htmlFor="note" className="font-bold">Objective - Observed Objective Data</Label>
            <textarea className="min-h-8 rounded-sm border-2 p-1" value={O} onChange={(e) => setO(e.target.value)} />
          </div>
          <div className="mb-4 flex flex-col">
            <Label htmlFor="note" className="font-bold">Assessment - Summary of Patient&apos;s Status and Progress</Label>
            <textarea className="min-h-8 rounded-sm border-2 p-1" value={A} onChange={(e) => setA(e.target.value)} />
          </div>
          <div className="mb-4 flex flex-col">
            <Label htmlFor="note" className="font-bold">Planning - Actions Taken, Referrals, etc.</Label>
            <textarea className="min-h-8 rounded-sm border-2 p-1" value={P} onChange={(e) => setP(e.target.value)} />
          </div>
          {addNote.status !== "idle" ? <p>{addNote.status}</p> : null}
          <Button
            className="mt-4 w-full"
            disabled={addNote.isPending}
            onClick={async () => {
              await addNote.mutateAsync({ roomId, contentS: S, contentO: O, contentA: A, contentP: P });
              setS(""); setO(""); setA(""); setP("");
              await room.getNotesFromRoom.invalidate({ id: roomId });
            }}
          >
            Add
          </Button>
        </Card>
      )}
    </>
  );
}
