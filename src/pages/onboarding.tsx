import { type Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { api } from "~/utils/api";

const Onboarding = () => {
  const setRole = api.room.setRole.useMutation();
  const router = useRouter();
  const [role, setRoleState] = useState<Role>("patient");
  const { data } = useSession();

  if (data?.user.role !== undefined) {
    void router.push("/");
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="my-10 flex text-5xl font-bold leading-none text-gray-700">Select Account Type</h1>
      <div className="my-10 flex flex-col justify-center ">
        <RadioGroup defaultValue="Patient">
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="Patient"
              id="r1"
              onClick={() => {
                setRoleState("patient");
              }}
            />
            <Label htmlFor="r1">Patient</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="Doctor"
              id="r2"
              onClick={() => {
                setRoleState("doctor");
              }}
            />
            <Label htmlFor="r2">Doctor</Label>
          </div>
        </RadioGroup>
      </div>
      <Button
        onClick={() =>
          setRole.mutateAsync(role).then((e) => {
            void router.replace("/");
          })
        }
      >
        Submit
      </Button>
    </div>
  );
};

export default Onboarding;
