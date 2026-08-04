import {
  Clock3,
  Copy,
  FileText,
  Trash2,
  Video,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

import { type Room, type User } from "~/server/db/schema";
import { api } from "~/utils/api";
import DownloadICSButton from "./DownloadICS";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useToast } from "./ui/use-toast";

type RoomData = Room & {
  User_CreatedFor?: User[];
  User_CreatedBy?: User;
};

const UpcomingSession = ({ data }: { data: RoomData }) => {
  const { data: userData } = useSession();
  const { toast } = useToast();
  const deleteRoom = api.room.delete.useMutation();
  const utils = api.useUtils();
  const startsAt = new Date(data.time);
  const [now] = useState(() => Date.now());
  const isUpcoming = startsAt.getTime() > now;
  const canJoin =
    isUpcoming && startsAt.getTime() <= now + 10 * 60 * 1000;
  const otherPerson =
    data.User_CreatedBy?.id === userData?.user.id
      ? data.User_CreatedFor?.[0]
      : data.User_CreatedBy;

  const copyLink = async () => {
    const link = `${window.location.origin}/room/${data.id}`;
    await navigator.clipboard.writeText(link);
    toast({
      title: "Appointment link copied",
      description: "It’s ready to share.",
    });
  };

  const removeAppointment = async () => {
    if (!window.confirm(`Delete “${data.title}”? This cannot be undone.`)) {
      return;
    }
    await deleteRoom.mutateAsync({ id: data.id });
    await utils.room.invalidate();
    toast({ title: "Appointment deleted" });
  };

  return (
    <Card className="overflow-hidden">
      <div className="grid sm:grid-cols-[7rem_1fr]">
        <div className="flex items-center gap-3 border-b bg-accent/55 p-4 sm:flex-col sm:items-start sm:justify-between sm:border-b-0 sm:border-r sm:p-5">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
              {startsAt.toLocaleDateString(undefined, { month: "short" })}
            </p>
            <p className="text-3xl font-bold leading-none">
              {startsAt.toLocaleDateString(undefined, { day: "2-digit" })}
            </p>
          </div>
          <div className="ml-auto sm:ml-0">
            <p className="font-mono text-xs font-semibold">
              {startsAt.toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {data.duration} {data.duration === 1 ? "hour" : "hours"}
            </p>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link
                href={`/roomInfo/${data.id}`}
                className="text-lg font-bold tracking-tight hover:text-primary"
              >
                {data.title}
              </Link>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                <span>
                  {otherPerson?.name
                    ? `With ${otherPerson.name}`
                    : "Private appointment"}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void copyLink()}
                title="Copy appointment link"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => void removeAppointment()}
                title="Delete appointment"
                disabled={deleteRoom.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {data.content && (
            <p className="mt-4 line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {data.content}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {canJoin && (
              <Button asChild>
                <Link href={`/room/${data.id}`}>
                  <Video className="h-4 w-4" />
                  Join appointment
                </Link>
              </Button>
            )}
            {isUpcoming && (
              <DownloadICSButton
                variant={canJoin ? "outline" : "default"}
                event={{
                  start: startsAt.getTime(),
                  duration: { hours: data.duration },
                  title: data.title,
                }}
              />
            )}
            {userData?.user.role === "doctor" && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/viewNotes/${data.id}`}>
                  <FileText className="h-4 w-4" />
                  Notes
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/viewRecordings/${data.id}`}>Recordings</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const MeetingWithLabel = ({ roomData }: { roomData: RoomData }) => {
  const { data: userData } = useSession();
  const otherPerson =
    roomData.createByUserId === userData?.user.id
      ? roomData.User_CreatedFor?.[0]
      : roomData.User_CreatedBy;

  if (!otherPerson) return null;

  return (
    <p className="text-sm text-muted-foreground">
      {otherPerson.role === "patient" ? (
        <Link
          href={`/patient/${otherPerson.id}`}
          className="font-medium text-primary hover:underline"
        >
          Patient: {otherPerson.name}
        </Link>
      ) : (
        <>Doctor: {otherPerson.name}</>
      )}
    </p>
  );
};

export default UpcomingSession;
