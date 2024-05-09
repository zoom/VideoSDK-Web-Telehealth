import Link from "next/link";
import { useState } from "react";
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
import IDInput from "~/components/ui/IDInput";

export default function Home() {
  const createAppointment = api.room.create.useMutation();
  const utils = api.useUtils();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [duration, setDuration] = useState<number>(1);
  const router = useRouter();
  const { toast } = useToast();
  const [ID, setID] = useState<string>("");
  const [IDs, setIDs] = useState<string[]>([]);
  const timeNowPlusOneHour = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 1000 * 60 + 60 * 60 * 1000).toISOString().slice(0, 16);
  const [time, setTime] = useState<string>(timeNowPlusOneHour);

  return (
    <>
      <Header />
      <div className="flex w-screen flex-col items-center bg-gray-100">
        <h1 className="my-10 flex text-center text-3xl font-bold leading-none text-gray-700">Create Appointment</h1>
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
              className="mb-4"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
              }}
            />
            <IDInput ID={ID} IDs={IDs} setID={setID} setIDs={setIDs} />
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
              disabled={createAppointment.status === "loading" || !(title && content && IDs.length > 0 && duration && time)}
              onClick={async () => {
                const utcTime = moment(time).utc().toDate();
                try {
                  toast({
                    title: "Success",
                    description: "Appointment created, redirecting...",
                  });
                  await createAppointment.mutateAsync({ title, content, IDs, duration, time: utcTime });
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
