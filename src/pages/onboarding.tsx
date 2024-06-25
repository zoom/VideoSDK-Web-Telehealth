import { type Role } from "@prisma/client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { useToast } from "~/components/ui/use-toast";
import { env } from "~/env";
import { api } from "~/utils/api";
import { BloodGroupSelect } from "~/components/BloodGroup";
import { useRouter } from "next/router";

const defaultRole = (env.NEXT_PUBLIC_TESTMODE === "TESTING" ? "null" : "patient") as Role;

const Onboarding = () => {
  const { data } = useSession();
  const [role, setRoleState] = useState<Role>(defaultRole);
  const router = useRouter();

  if (data?.user.role !== null) {
    void router.push("/");
  }

  return (
    <div className="flex w-screen flex-col items-center justify-center">
      <div className="w-screen max-w-screen-sm">
        <h1 className="my-10 flex text-5xl font-bold leading-none text-gray-700">Welcome {data?.user.name?.split(" ")[0]}</h1>
        {env.NEXT_PUBLIC_TESTMODE === "TESTING" ? (
          <DoctorAndPatientFields />
        ) : (
          <>
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
          </>
        )}
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
        Height (in cm)
      </Label>
      <Input type="number" id="height" className="mb-4" value={height} onChange={(e) => setHeight(e.target.value)} />
      <Label htmlFor="weight" className="mb-2">
        Weight (in kg)
      </Label>
      <Input type="number" id="weight" className="mb-4" value={weight} onChange={(e) => setWeight(e.target.value)} />
      <Label htmlFor="bloodType" className="mb-2">
        Blood Type
      </Label>
      <BloodGroupSelect value={bloodType} setValue={setBloodType} />
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
  const [department, setDepartment] = useState("General Medicine");
  const [position, setPosition] = useState("General Practitioner");

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

const DoctorAndPatientFields = () => {
  const { update } = useSession();
  const { toast } = useToast();
  const setDemo = api.user.setDemo.useMutation();
  const [department, setDepartment] = useState("General Medicine");
  const [position, setPosition] = useState("General Practitioner");
  const [height, setHeight] = useState("180");
  const [weight, setWeight] = useState("60");
  const [bloodType, setBloodType] = useState("B+");
  const [allergies, setAllergies] = useState("None");
  const [medications, setMedications] = useState("None");
  const [DOB, setDOB] = useState("2001-01-01");

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm">Demo accounts creates both a Doctor and a Patient profile, we&apos;ve prefilled the details to make it easier to get started.</p>
      <div className="flex flex-row items-center pt-8">
        <Card className="mx-4 mb-8 flex w-96 flex-col flex-wrap justify-center p-4 shadow-lg">
          <p className="py-4 font-bold">Patient:</p>
          <Label htmlFor="height" className="mb-2">
            Height (in cm)
          </Label>
          <Input type="number" id="height" className="mb-4" value={height} onChange={(e) => setHeight(e.target.value)} />
          <Label htmlFor="weight" className="mb-2">
            Weight (in kg)
          </Label>
          <Input type="number" id="weight" className="mb-4" value={weight} onChange={(e) => setWeight(e.target.value)} />
          <Label htmlFor="bloodType" className="mb-2">
            Blood Type
          </Label>
          <BloodGroupSelect value={bloodType} setValue={setBloodType} />
          <Label htmlFor="allergies" className="mb-2">
            Allergies
          </Label>
          <Input id="allergies" className="mb-4" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
          <Label htmlFor="medications" className="mb-2">
            Medications
          </Label>
          <Input id="medications" className="mb-4" value={medications} onChange={(e) => setMedications(e.target.value)} />
          <Label htmlFor="DOB" className="mb-2">
            Date of Birth
          </Label>
          <Input type="date" id="DOB" className="mb-4" value={DOB} onChange={(e) => setDOB(e.target.value)} />
        </Card>
        <Card className="mx-4 mb-8 flex w-96 flex-col flex-wrap justify-center p-4 shadow-lg">
          <p className="py-4 font-bold">Doctor:</p>
          <Label htmlFor="department" className="mb-2">
            Department
          </Label>
          <Input id="department" className="mb-4" value={department} onChange={(e) => setDepartment(e.target.value)} />
          <Label htmlFor="position" className="mb-2">
            Designation
          </Label>
          <Input id="position" className="mb-4" value={position} onChange={(e) => setPosition(e.target.value)} />
        </Card>
      </div>
      <Button
        onClick={async () => {
          await setDemo.mutateAsync({
            height: parseFloat(height),
            weight: parseFloat(weight),
            bloodType,
            allergies,
            medications,
            department,
            position,
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
    </div>
  );
};

export default Onboarding;
