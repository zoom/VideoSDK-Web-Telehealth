import { Button } from "~/components/ui/button";
import { useToast } from "../ui/use-toast";
import { LinkIcon, Wand } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const ActionModal = () => {
  const { toast } = useToast();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" title="action menu">
          <Wand />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Customize As You See Fit</DropdownMenuLabel>
        <DropdownMenuSeparator />
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
