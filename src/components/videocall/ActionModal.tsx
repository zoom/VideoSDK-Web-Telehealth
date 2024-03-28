// import Link from "next/link";
// import RecordingModal from "../RecordingModal";
// import { type MutableRefObject } from "react";
import { Button } from "~/components/ui/button";
import { useToast } from "../ui/use-toast";
import { LinkIcon, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

// import type { VideoClient } from "@zoom/videosdk";

const ActionModal = () =>
  // props: { client: MutableRefObject<typeof VideoClient> }
  {
    const { toast } = useToast();
    // const { client } = props;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline">
            <Sparkles />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Customize As You See Fit</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem>
          <RecordingModal roomId={client.current.getSessionInfo().topic} buttonVariant="default" />
        </DropdownMenuItem> */}
          {/* <DropdownMenuItem>
          <Link href={"/upload"} className="m-2 flex flex-row justify-around">
            <Button>
              <Upload size={18} className="mr-2" />
              Upload Document
            </Button>
          </Link>
        </DropdownMenuItem> */}
          <DropdownMenuItem>
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
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

export default ActionModal;
