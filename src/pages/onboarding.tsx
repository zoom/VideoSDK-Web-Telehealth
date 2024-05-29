import { type Role } from "@prisma/client";
// import { Link } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { useToast } from "~/components/ui/use-toast";
import { api } from "~/utils/api";

const Onboarding = () => {
  const router = useRouter();
  const { data } = useSession();
  const [role, setRoleState] = useState<Role>("patient");

  if (data?.user.role !== null) {
    void router.push("/");
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-screen max-w-screen-sm">
        <h1 className="my-10 flex text-5xl font-bold leading-none text-gray-700">Welcome {data?.user.name?.split(" ")[0]}</h1>
        <span className="flex w-full flex-col">
          <Label htmlFor="r2">Sign up as a:</Label>
          <RadioGroup defaultValue="Patient" className="my-4 flex flex-row">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Doctor" id="r2" onClick={() => setRoleState("doctor")} />
              <Label htmlFor="r2">Doctor</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Patient" id="r1" onClick={() => setRoleState("patient")} />
              <Label htmlFor="r1">Patient</Label>
            </div>
          </RadioGroup>
        </span>
        <Card className="mb-8 flex w-full flex-col flex-wrap justify-center p-4 shadow-lg">{role === "doctor" ? <DoctorFields /> : <PatientFields />}</Card>
        <p className="text-sm italic text-gray-400">Sample data is used here for creating test users.</p>
      </div>
    </div>
  );
};

const PatientFields = () => {
  const { update } = useSession();
  const { toast } = useToast();
  const setPatient = api.user.setPatient.useMutation();
  const [height, setHeight] = useState("72");
  const [weight, setWeight] = useState("150");
  const [bloodType, setBloodType] = useState("O+");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [DOB, setDOB] = useState("1990-01-01");

  return (
    <>
      <Label htmlFor="DOB" className="mb-2">
        Date of Birth
      </Label>
      <Input type="date" id="DOB" className="mb-4" value={DOB} onChange={(e) => setDOB(e.target.value)} />
      {/* TODO: height needs to be feet/inches */}
      <Label htmlFor="height" className="mb-2">
        Height (in inches)
      </Label>
      <Input type="number" id="height" className="mb-4" value={height} onChange={(e) => setHeight(e.target.value)} />
      <Label htmlFor="weight" className="mb-2">
        Weight (in pounds)
      </Label>
      <Input type="number" id="weight" className="mb-4" value={weight} onChange={(e) => setWeight(e.target.value)} />
      <Label htmlFor="bloodType" className="mb-2">
        Blood Type
      </Label>
      <Input id="bloodType" className="mb-4" value={bloodType} onChange={(e) => setBloodType(e.target.value)} />
      <Label htmlFor="allergies" className="mb-2">
        Allergies
      </Label>
      <Input id="allergies" className="mb-4" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
      <Label htmlFor="medications" className="mb-2">
        Medications
      </Label>
      <Input id="medications" className="mb-4" value={medications} onChange={(e) => setMedications(e.target.value)} />
      <span className="my-2 flex flex-row items-center gap-2">
        <Input type="checkbox" id="toc" checked className="max-w-4" />
        <Label htmlFor="toc" className="text-gray-600">
          I agree to the{" "}
          <Link className="underline" href="/">
            Terms and Conditions
          </Link>
          .
        </Label>
      </span>
      <Button
        onClick={async () => {
          await setPatient.mutateAsync({
            height: parseFloat(height),
            weight: parseFloat(weight),
            bloodType,
            allergies,
            medications,
            DOB: new Date(DOB),
          });
          toast({
            title: "Account created, redirecting...",
          });
          await update();
        }}
      >
        Submit
      </Button>
    </>
  );
};

const DoctorFields = () => {
  const { update } = useSession();
  const { toast } = useToast();
  const setDoctor = api.user.setDoctor.useMutation();
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");

  return (
    <>
      <Label htmlFor="department" className="mb-2">
        Department
      </Label>
      <Input id="department" className="mb-4" value={department} onChange={(e) => setDepartment(e.target.value)} />
      <Label htmlFor="position" className="mb-2">
        Designation
      </Label>
      <Input id="position" className="mb-4" value={position} onChange={(e) => setPosition(e.target.value)} />
      <Button
        onClick={async () => {
          await setDoctor.mutateAsync({ department, position });
          toast({
            title: "Account created, redirecting...",
          });
          await update();
        }}
      >
        Submit
      </Button>
    </>
  );
};

export default Onboarding;
