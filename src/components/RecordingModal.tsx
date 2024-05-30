import Link from "next/link";
import { Button } from "./ui/button";
import { api } from "~/utils/api";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";

const RecordingModal = (props: { roomId: string; buttonVariant?: "link" | "default" | "secondary" | "outline" }) => {
  const fetchAllRecordings = api.zoom.fetchAllRecordings.useMutation();
  const { buttonVariant } = props;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={buttonVariant ? buttonVariant : "link"}
          onClick={() => {
            if (fetchAllRecordings.status === "idle") fetchAllRecordings.mutate({ roomId: props.roomId }, {});
          }}
        >
          Recordings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recordings</DialogTitle>
        </DialogHeader>
        {fetchAllRecordings.isLoading ? (
          <DialogDescription>Loading...</DialogDescription>
        ) : (
          fetchAllRecordings.data?.map((e) => (
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
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecordingModal;
