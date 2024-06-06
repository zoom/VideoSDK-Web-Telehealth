import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Footer from "~/components/ui/footer";
import Header from "~/components/ui/header";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";

const Recordings = () => {
  const router = useRouter();
  const { roomId } = router.query;

  return (
    <>
      <Header />
      <div className="flex h-screen w-screen flex-col items-center overflow-y-scroll bg-gray-100">
        <h1 className="mb-2 mt-8 flex text-3xl font-bold leading-none text-gray-700">Recordings</h1>
        <ViewRecording roomId={roomId as string} />
        <Link href="/">
          <Button variant={"link"} className="mx-auto flex">
            back
          </Button>
        </Link>
      </div>
      <Footer />
    </>
  );
};

const ViewRecording = ({ roomId }: { roomId: string }) => {
  const { isLoading, data } = api.zoom.getAllRecordings.useQuery(
    { roomId: roomId },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: 0,
      retry: false,
    }
  );
  return (
    <Card className="mt-2 min-w-96 p-8 pl-12">
      {isLoading ? (
        <Skeleton className="h-8 w-72" />
      ) : data === undefined || data.length === 0 ? (
        <p>No recordings found</p>
      ) : (
        data?.map((e) => (
          <div key={e.session_id} className="flex flex-row justify-between">
            <div className="flex flex-col">
              <p>{new Date(e.start_time).toLocaleDateString()}</p>
              {e.recording_files?.map((f) => (
                <Link key={f.id} href={f.download_url} target="_blank" className="h-6">
                  <Button variant="link">
                    {new Date(f.recording_start).toLocaleTimeString()} - {new Date(f.recording_end).toLocaleTimeString()}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </Card>
  );
};

export { ViewRecording };
export default Recordings;
