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
    <div className="z-50 flex h-full w-full flex-col items-center justify-center  bg-gray-900 py-4 text-white ">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
        <p className="text-sm font-medium">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center justify-center">
                  <span className="text-xl font-bold">Demo Mode</span>
                  <LucideInfo className="ml-2" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Demo mode is enabled, we hide your personal details and add mock data to make it easier understand how the app works.</p>
                <p>You can toggle the account role between a Doctor and a Patient.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
        <div className="flex items-center space-x-4">
          {data?.user.role ? (
            <>
              <p className="text-center">Viewing as a {capitalize(data?.user.role as string)}</p>
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
      </div>
    </div>
  );
};

export default ToggleRoleBanner;
