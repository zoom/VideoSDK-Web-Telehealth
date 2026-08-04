"use client";

import { ArrowLeft, CalendarPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { type ZodFlattenedError } from "zod";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Footer from "~/components/ui/footer";
import Header from "~/components/ui/header";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import SearchUser from "~/components/ui/SearchUser";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/components/ui/use-toast";
import { type UserWithoutEmail } from "~/server/api/routers/user";
import { api } from "~/utils/api";

const toLocalInput = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);

export default function CreateAppointmentPage() {
  const createAppointment = api.room.create.useMutation();
  const utils = api.useUtils();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [duration, setDuration] = useState(1);
  const [minimumTime] = useState(() => toLocalInput(new Date()));
  const [time, setTime] = useState(() =>
    toLocalInput(new Date(Date.now() + 60 * 60 * 1000)),
  );
  const [selectedUser, setSelectedUser] =
    useState<UserWithoutEmail>();
  const inviteID = searchParams.get("inviteID") ?? "";
  const getUserById = api.user.getUserById.useQuery(
    { id: inviteID },
    { enabled: Boolean(inviteID) },
  );
  const user = selectedUser ?? getUserById.data;
  const isValid = Boolean(title && content && user && duration > 0 && time);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || !user) return;

    try {
      await createAppointment.mutateAsync({
        title,
        content,
        IDs: [user.id],
        duration,
        time: new Date(time),
      });
      await utils.room.getCreatedUpcoming.invalidate();
      toast({
        title: "Appointment scheduled",
        description: "It now appears on both schedules.",
      });
      router.push("/schedule");
    } catch {
      // Field-level and request errors are rendered below.
    }
  };

  return (
    <>
      <Header />
      <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/schedule"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Schedule
        </Link>

        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="pt-2">
            <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-accent text-primary">
              <CalendarPlus className="h-6 w-6" />
            </span>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              New visit
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Schedule an appointment
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Add the care context, choose who is joining, and set a time.
              We’ll handle the appointment room and calendar details.
            </p>
          </div>

          <Card className="p-6 sm:p-8">
            <form className="space-y-6" onSubmit={submit}>
              <Field label="Appointment title" htmlFor="title">
                <ErrorMessage
                  fieldName="title"
                  zodError={createAppointment.error?.data?.zodError}
                />
                <Input
                  id="title"
                  placeholder="e.g. Follow-up consultation"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </Field>

              <Field label="Care notes" htmlFor="content">
                <ErrorMessage
                  fieldName="content"
                  zodError={createAppointment.error?.data?.zodError}
                />
                <Textarea
                  id="content"
                  rows={4}
                  placeholder="What should everyone know before the visit?"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                />
              </Field>

              <div>
                <SearchUser setUser={setSelectedUser} user={user} />
              </div>

              <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
                <Field label="Date and time" htmlFor="time">
                  <ErrorMessage
                    fieldName="time"
                    zodError={createAppointment.error?.data?.zodError}
                  />
                  <Input
                    id="time"
                    type="datetime-local"
                    value={time}
                    min={minimumTime}
                    onChange={(event) => setTime(event.target.value)}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Shown in your local timezone.
                  </p>
                </Field>
                <Field label="Hours" htmlFor="duration">
                  <ErrorMessage
                    fieldName="duration"
                    zodError={createAppointment.error?.data?.zodError}
                  />
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    max={8}
                    value={duration}
                    onChange={(event) =>
                      setDuration(Number(event.target.value))
                    }
                  />
                </Field>
              </div>

              {createAppointment.isError && (
                <p
                  role="alert"
                  className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
                >
                  We couldn’t create this appointment. Review the fields and
                  try again.
                </p>
              )}

              <div className="flex justify-end border-t pt-6">
                <Button
                  type="submit"
                  size="lg"
                  disabled={createAppointment.isPending || !isValid}
                >
                  {createAppointment.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {createAppointment.isPending
                    ? "Scheduling…"
                    : "Schedule appointment"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}

const Field = ({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
  </div>
);

const ErrorMessage = ({
  fieldName,
  zodError,
}: {
  fieldName: string;
  zodError: ZodFlattenedError<unknown, string> | null | undefined;
}) => {
  const fieldValue = Object.entries(zodError?.fieldErrors ?? {}).find(
    ([key]) => key === fieldName,
  )?.[1];
  const messages = Array.isArray(fieldValue)
    ? fieldValue.filter(
        (message): message is string => typeof message === "string",
      )
    : [];
  if (messages.length === 0) return null;
  return (
    <>
      {messages.map((message) => (
        <p key={message} className="text-xs text-destructive">
          {message}
        </p>
      ))}
    </>
  );
};
