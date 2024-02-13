import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import dynamic from "next/dynamic";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

const Videocall = dynamic<{ jwt: string; session: string }>(() => import("../../components/Videocall"), { ssr: false });

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const { data, isLoading, isError, error } = api.room.getById.useQuery({ id: `${router.query.slug as string}` }, { retry: false });
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
      <div className="flex h-screen w-screen flex-col items-center bg-gray-100">
        <Videocall jwt={data.jwt} session={data.room.id} />
        <ConfidnetialDialog />
      </div>
    );
  }
}

const ConfidnetialDialog = () => {
  const { data: userData } = useSession();
  const router = useRouter();

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
