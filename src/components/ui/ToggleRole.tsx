import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "~/components/ui/tooltip";
import { useSession } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { capitalize } from "~/lib/utils";
import { api } from "~/utils/api";
import { LucideInfo } from "lucide-react";

const ToggleRoleBanner = () => {
  const { data, update } = useSession();
  const toggleRole = api.user.toggleRole.useMutation();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-yellow-200 py-4 ">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center">
              <p className="text-center text-xl font-bold text-slate-800">Demo Mode</p> <LucideInfo className="ml-2" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Demo mode is enabled, we hide your personal details and add mock data to make it easier understand how the app works.</p>
            <p>You can toggle the account role between a Doctor and a Patient.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {data?.user.role ? (
        <>
          <p className="text-center">You are currently logged in as a {capitalize(data?.user.role as string)}.</p>
          <Button
            className="flex self-center"
            onClick={async () => {
              await toggleRole.mutateAsync();
              await update();
            }}
          >
            View as {capitalize(data?.user.role === "doctor" ? "patient" : "doctor")}
          </Button>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ToggleRoleBanner;
