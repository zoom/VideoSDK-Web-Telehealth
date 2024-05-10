import { useSession } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { capitalize } from "~/lib/utils";
import { api } from "~/utils/api";

const ToggleRoleBanner = () => {
  const { data, update } = useSession();
  const toggleRole = api.user.toggleRole.useMutation();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-slate-200 py-4 ">
      <p className="text-center text-xl font-bold">Demo Mode</p>
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
    </div>
  );
};

export default ToggleRoleBanner;
