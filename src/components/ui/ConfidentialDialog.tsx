import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";

const ConfidentialDialog = () => {
  const { data: userData } = useSession();
  const router = useRouter();

  return (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notice</DialogTitle>
          <DialogDescription>
            {userData?.user?.role === "patient"
              ? "Patient Agreement: Confidentiality Clause. Note: captions are not medical grade."
              : "Doctor Info: captions are not medical grade."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => router.push("/")}>
            Back
          </Button>
          <DialogClose asChild>
            <Button type="button">{userData?.user?.role === "patient" ? "I agree" : "Okay"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfidentialDialog;
