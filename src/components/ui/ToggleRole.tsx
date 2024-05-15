import { useSession } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { capitalize } from "~/lib/utils";
import { api } from "~/utils/api";

const ToggleRoleStickyBanner = () => {
  const { data, update } = useSession();
  const toggleRole = api.user.toggleRole.useMutation();
  return (
    <div className="fixed bottom-2 right-2 z-50 flex flex-col rounded-sm  bg-slate-300 bg-opacity-20 px-8 py-4 backdrop-blur-sm">
      <p className="text-center text-xl">You are currently logged in as a {capitalize(data?.user.role as string)}.</p>
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

export default ToggleRoleStickyBanner;
