import { Clock3, Copy, FileText, Trash2, Video } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

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

const subscribeToHydration = () => () => undefined;
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

const formatStartMonth = (date: Date) => date.toLocaleDateString(undefined, { month: "short" });
const formatStartDay = (date: Date) => date.toLocaleDateString(undefined, { day: "2-digit" });
const formatStartTime = (date: Date) =>
  date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

const UpcomingSession = ({ data }: { data: RoomData }) => {
  const { data: userData } = useSession();
  const { toast } = useToast();
  const deleteRoom = api.room.delete.useMutation();
  const utils = api.useUtils();
  const startsAt = new Date(data.time);
  const startsAtTime = startsAt.getTime();
  const [now, setNow] = useState(() => Date.now());
  const isHydrated = useSyncExternalStore(subscribeToHydration, getClientHydrationSnapshot, getServerHydrationSnapshot);

  useEffect(() => {
    const joinWindowStartsAt = startsAtTime - 10 * 60 * 1_000;
    const nextBoundary = now < joinWindowStartsAt ? joinWindowStartsAt : now < startsAtTime ? startsAtTime : null;
    if (nextBoundary === null) return;

    const timeout = window.setTimeout(() => setNow(Date.now()), Math.min(Math.max(nextBoundary - Date.now(), 0), 2_147_483_647));
    return () => window.clearTimeout(timeout);
  }, [now, startsAtTime]);

  const isUpcoming = startsAtTime > now;
  const canJoin = isUpcoming && startsAtTime <= now + 10 * 60 * 1000;
  const otherPerson = data.User_CreatedBy?.id === userData?.user.id ? data.User_CreatedFor?.[0] : data.User_CreatedBy;

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
        <div className="bg-accent/55 flex items-center gap-3 border-b p-4 sm:flex-col sm:items-start sm:justify-between sm:border-r sm:border-b-0 sm:p-5">
          <div>
            <p className="text-primary font-mono text-[11px] font-bold tracking-[0.15em] uppercase">{isHydrated ? formatStartMonth(startsAt) : "\u00a0"}</p>
            <p className="text-3xl leading-none font-bold">{isHydrated ? formatStartDay(startsAt) : "\u00a0"}</p>
          </div>
          <div className="ml-auto sm:ml-0">
            <p className="font-mono text-xs font-semibold">{isHydrated ? formatStartTime(startsAt) : "\u00a0"}</p>
            <p className="text-muted-foreground mt-1 text-[11px]">
              {data.duration} {data.duration === 1 ? "hour" : "hours"}
            </p>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link href={`/roomInfo/${data.id}`} className="hover:text-primary text-lg font-bold tracking-tight">
                {data.title}
              </Link>
              <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                <Clock3 className="h-3.5 w-3.5" />
                <span>{otherPerson?.name ? `With ${otherPerson.name}` : "Private appointment"}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => void copyLink()} title="Copy appointment link">
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

          {data.content && <p className="text-muted-foreground mt-4 line-clamp-2 max-w-2xl text-sm leading-relaxed">{data.content}</p>}

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
  const otherPerson = roomData.createByUserId === userData?.user.id ? roomData.User_CreatedFor?.[0] : roomData.User_CreatedBy;

  if (!otherPerson) return null;

  return (
    <p className="text-muted-foreground text-sm">
      {otherPerson.role === "patient" ? (
        <Link href={`/patient/${otherPerson.id}`} className="text-primary font-medium hover:underline">
          Patient: {otherPerson.name}
        </Link>
      ) : (
        <>Doctor: {otherPerson.name}</>
      )}
    </p>
  );
};

export default UpcomingSession;
