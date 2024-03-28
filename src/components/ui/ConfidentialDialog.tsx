import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";

const ConfidentialDialog = () => {
  const { data: userData } = useSession();
  const router = useRouter();

  return userData?.user?.role === "patient" ? (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confidentiality Agreement</DialogTitle>
          <DialogDescription>Some jargon goes here...</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => router.push("/")}>
            Back
          </Button>
          <DialogClose asChild>
            <Button type="button">I agree</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <></>
  );
};

export default ConfidentialDialog;
