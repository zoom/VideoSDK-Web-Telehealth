import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import dynamic from "next/dynamic";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { ViewPatient } from "../viewPatient/[userId]";
import { ViewNotes } from "../viewNotes/[roomId]";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

const Videocall = dynamic<{ jwt: string; session: string }>(() => import("../../components/Videocall"), { ssr: false });

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const { data, isLoading, isError, error } = api.room.getById.useQuery({ id: `${router.query.slug as string}` }, { retry: false });
  const { data: userData } = useSession();
  if (isError) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1>Error: {error.message}</h1>
      </div>
    );
  }
  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1>Loading...</h1>
      </div>
    );
  }
  if (status === "unauthenticated") {
    void router.replace("/");
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1>Loading...</h1>
      </div>
    );
  }
  if (!isLoading && data) {
    return (
      <div className="m-0 flex min-h-screen w-screen flex-1 flex-col overflow-y-scroll bg-gray-100 px-0 pb-8">
        <div className="flex w-full flex-1 flex-col items-center self-center lg:flex-row lg:justify-around">
          <div className="flex flex-[4] flex-col items-center">
            <Videocall jwt={data.jwt} session={data.room.id} />
          </div>
          {userData?.user.role === "doctor" ? (
            <Tabs defaultValue="account" className="mr-8 mt-16 flex flex-1 flex-col self-start">
              <TabsList>
                <TabsTrigger value="password">Patient Data</TabsTrigger>
                <TabsTrigger value="account">Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="password">
                <ViewPatient userId={data.room.User_CreatedFor[0]?.id ?? "0"} />
              </TabsContent>
              <TabsContent value="account">
                <ViewNotes roomId={data.room.id} />
              </TabsContent>
            </Tabs>
          ) : (
            <></>
          )}
        </div>
        <Button onClick={() => void router.push("/")} className="mx-auto flex w-48" variant={"link"}>
          back
        </Button>
        <ConfidnetialDialog />
      </div>
    );
  }
}

const ConfidnetialDialog = () => {
  const { data: userData } = useSession();
  const router = useRouter();

  // return true ? (
  return userData?.user?.role === "patient" ? (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confidentiality Agreement</DialogTitle>
          <DialogDescription>Some jargon goes here...</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => router.push("/")}>
            Back
          </Button>
          <DialogClose asChild>
            <Button type="button">I agree</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <></>
  );
};
