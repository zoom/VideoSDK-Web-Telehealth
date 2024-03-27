import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import dynamic from "next/dynamic";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { ViewPatient } from "../viewPatient/[userId]";
import { ViewNotes } from "../viewNotes/[roomId]";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useToast } from "~/components/ui/use-toast";
import { LinkIcon } from "lucide-react";

const Videocall = dynamic<{ jwt: string; session: string; isCreator: boolean }>(() => import("../../components/videocall/Videocall"), { ssr: false });

export default function Home() {
  const { status } = useSession();
  const { toast } = useToast();
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

  const copyLink = async () => {
    const link = `${window.location.toString()}`;
    await navigator.clipboard.writeText(link);
    toast({ title: "Copied link to clipoard", description: link });
  };

  if (!isLoading && data) {
    return (
      <>
        {/* <Header /> */}
        <div className="m-0 flex h-screen w-screen flex-1 flex-col overflow-y-scroll bg-gray-100 px-0 pb-8">
          <div className="flex w-full flex-1 flex-col self-center lg:flex-row lg:justify-around">
            <div className="relative flex flex-1 flex-col">
              <div className="mx-16 mt-4 flex flex-row">
                <div className="flex flex-1 flex-col rounded-l-md bg-white p-3">
                  <span className="inline-flex">
                    <Button variant={"link"} className="flex" onClick={copyLink}>
                      <h1 className="text-left text-3xl font-bold text-gray-700">{data.room.title}</h1>
                      <LinkIcon height={24} className="ml-2 text-gray-700" strokeWidth={3} />
                    </Button>
                  </span>
                  <span className="inline-flex">
                    <p className="ml-4 text-left text-lg text-gray-700">{data.room.content}</p>
                    <p className="ml-4 text-left text-lg text-gray-700">| {new Date(data.room.time).toTimeString().split(" ")[0]}</p>
                  </span>
                </div>
                <div className=" h-full justify-center rounded-r-md bg-white p-4">
                  {userData?.user.role === "doctor" ? (
                    <Tabs className="mt-2 flex flex-1 flex-col self-start">
                      <TabsList>
                        <TabsTrigger value="password">Patient Data</TabsTrigger>
                        <TabsTrigger value="account">Notes</TabsTrigger>
                        <TabsTrigger value="x">x</TabsTrigger>
                      </TabsList>
                      <div className="absolute right-0 z-10 mr-16 mt-12 flex rounded-md bg-white">
                        <TabsContent value="password" className=" 4">
                          <ViewPatient userId={data.room.User_CreatedFor[0]?.id ?? "0"} />
                        </TabsContent>
                        <TabsContent value="account" className="p-4">
                          <ViewNotes roomId={data.room.id} />
                        </TabsContent>
                      </div>
                    </Tabs>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              <Videocall jwt={data.jwt} session={data.room.id} isCreator={data.room.User_CreatedBy.id === userData?.user.id} />
            </div>
          </div>
          <ConfidnetialDialog />
        </div>
        {/* <Footer /> */}
      </>
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
