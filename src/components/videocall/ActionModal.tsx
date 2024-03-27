import Link from "next/link";
import RecordingModal from "../RecordingModal";
import { type MutableRefObject } from "react";
import { Button } from "~/components/ui/button";
import { useToast } from "../ui/use-toast";
import { LinkIcon } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Upload } from "lucide-react";
import type { VideoClient } from "@zoom/videosdk";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";

const ActionModal = (props: { client: MutableRefObject<typeof VideoClient> }) => {
  const { toast } = useToast();
  const { client } = props;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Action Menu</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize As You See Fit</DialogTitle>
        </DialogHeader>
        <RecordingModal roomId={client.current.getSessionInfo().topic} buttonVariant="default" />
        <p>{client.current.getSessionInfo().topic}</p>
        <Button
          variant={"outline"}
          className="flex flex-1"
          onClick={async () => {
            const link = `${window.location.toString()}`;
            await navigator.clipboard.writeText(link);
            toast({ title: "Copied link to clipoard", description: link });
          }}
        >
          Invite Others
          <LinkIcon height={16} />
        </Button>
        <Link href={"/upload"} className="m-2 flex flex-row justify-around">
          <Button>
            <Upload size={18} className="mr-2" />
            Upload Document
          </Button>
        </Link>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActionModal;
