import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/utils/api";
import moment from "moment";
import Header from "~/components/ui/header";
import Footer from "~/components/ui/footer";
import { useRouter } from "next/router";
import { useToast } from "~/components/ui/use-toast";
import { type typeToFlattenedError } from "zod";
import SearchUser from "~/components/ui/SearchUser";
import { type UserWithoutEmail } from "~/server/api/routers/user";

export default function Home() {
  const createAppointment = api.room.create.useMutation();
  const utils = api.useUtils();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [duration, setDuration] = useState<number>(1);
  const router = useRouter();
  const { toast } = useToast();
  const timeNowPlusOneHour = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 1000 * 60 + 60 * 60 * 1000).toISOString().slice(0, 16);
  const [time, setTime] = useState<string>(timeNowPlusOneHour);
  const [user, setUser] = useState<UserWithoutEmail>();
  const inviteID = router.query.inviteID as string;
  const getUserById = api.user.getUserById.useQuery({ id: inviteID }, { enabled: !!inviteID });

  useEffect(() => {
    if (getUserById.isSuccess) {
      setUser(getUserById.data);
    }
  }, [getUserById, inviteID]);

  return (
    <>
      <Header />
      <div className="flex w-screen flex-col items-center bg-gray-100">
        <h1 className="my-10 flex text-center text-3xl font-bold leading-none text-gray-700">Schedule an appointment</h1>
        <Card className="mb-8 flex w-[32rem] flex-col flex-wrap justify-center p-8 shadow-lg">
          <form
            className="flex w-full flex-col"
            onSubmit={async (e) => {
              e.preventDefault();
            }}
          >
            <Label htmlFor="title" className="mb-2">
              Title
            </Label>
            <ErrorMessage fieldName="title" zodError={createAppointment.error?.data?.zodError} />
            <Input
              id="title"
              placeholder="Appointment title"
              className="mb-4"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
            <Label htmlFor="content" className="mb-2">
              Description
            </Label>
            <ErrorMessage fieldName="content" zodError={createAppointment.error?.data?.zodError} />
            <Input
              id="content"
              placeholder="Add any notes or details about the appointment"
              className="mb-4"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
              }}
            />
            <SearchUser setUser={setUser} user={user} />
            <Label htmlFor="duration" className="mb-2">
              Duration
            </Label>
            <ErrorMessage fieldName="duration" zodError={createAppointment.error?.data?.zodError} />
            <div className="flex">
              <Input
                id="duration"
                type="number"
                className="mb-4 mr-2"
                value={duration}
                onChange={(e) => {
                  setDuration(parseInt(e.target.value));
                }}
              />
              <p className="mb-4 mt-auto flex">hours</p>
            </div>
            <Label htmlFor="time" className="mb-2">
              Time (GMT)
            </Label>
            <ErrorMessage fieldName="time" zodError={createAppointment.error?.data?.zodError} />
            <div className="flex">
              <Input
                id="time"
                type="datetime-local"
                className="mb-4 mr-2"
                value={time}
                min={time}
                onChange={(e) => {
                  setTime(e.target.value);
                }}
              />
            </div>
            {createAppointment.status === "loading" ? <p className="mb-4 text-center">Loading...</p> : <></>}
            {createAppointment.status === "error" ? (
              <p className="mb-4 text-left text-sm text-red-500">Uh-oh, we weren&apos;t able to create your appointment. Please fix the errors on screen.</p>
            ) : (
              <></>
            )}
            <Button
              disabled={createAppointment.status === "loading" || !(title && content && user && duration && time)}
              onClick={async () => {
                if (!(title && content && user && duration && time)) return;
                const utcTime = moment(time).utc().toDate();
                try {
                  await createAppointment.mutateAsync({ title, content, IDs: [user?.id], duration, time: utcTime });
                  toast({
                    title: "Success",
                    description: "Appointment created, redirecting...",
                  });
                  await utils.room.getCreatedUpcoming.invalidate();
                  await router.push("/");
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              Create
            </Button>
          </form>
        </Card>
        <Link href="/">
          <Button variant={"link"} className="mb-8">
            back
          </Button>
        </Link>
      </div>
      <Footer />
    </>
  );
}

const ErrorMessage = ({ fieldName, zodError }: { fieldName: string; zodError: typeToFlattenedError<unknown, string> | null | undefined }) => {
  return zodError ? (
    Object.entries(zodError.fieldErrors)
      .filter((fieldData) => fieldData[0] === fieldName)
      .map((fieldData, index) => (
        <p key={index} className="mb-2 text-left text-xs text-red-500">
          {fieldData[1] as string}
        </p>
      ))
  ) : (
    <></>
  );
};
