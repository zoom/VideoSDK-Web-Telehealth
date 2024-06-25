import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Footer from "~/components/ui/footer";
import Header from "~/components/ui/header";
import { Skeleton } from "~/components/ui/skeleton";
import { File, Download } from "lucide-react";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Label } from "@radix-ui/react-label";
import { Input } from "~/components/ui/input";
import { BloodGroupSelect } from "~/components/BloodGroup";

const ViewPatientContainer = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { data: sessionData } = useSession();
  const { error, isError } = api.S3.getUploadList.useQuery({ userId: userId as string }, { retry: 0 });
  const [isEdit, setEdit] = useState(false);

  if (isError) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <Card className="flex w-96 flex-col justify-center self-center p-8">Error: {error?.message}</Card>
        <Link href="/">
          <Button variant={"link"} className="mx-auto flex">
            back
          </Button>
        </Link>
      </div>
    );
  }
  return (
    <>
      <Header />
      <div className="flex h-screen w-screen flex-col items-center overflow-y-scroll bg-gray-100">
        <div className="mb-4 mt-8 flex w-full max-w-xl flex-row">
          <h1 className="mb-2 mt-8 flex text-3xl font-bold leading-none text-gray-700 ">Patient details</h1>
          {userId === sessionData?.user.id ? (
            <Button variant={"default"} className="ml-auto" onClick={() => setEdit(true)}>
              Edit
            </Button>
          ) : (
            <></>
          )}
        </div>
        {isEdit ? <EditPatient userId={userId as string} setEdit={setEdit} /> : <ViewPatient userId={userId as string} />}
        <Link href="/">
          <Button variant={"link"} className="mx-auto flex">
            back
          </Button>
        </Link>
      </div>
      <Footer />
    </>
  );
};

const ViewPatient = (props: { userId: string }) => {
  const { userId } = props;
  const { data: sessionData } = useSession();
  const { data: patientData, isLoading: patientLoading } = api.user.getPatientDetails.useQuery({ userId: userId });
  const { data, isLoading } = api.S3.getUploadList.useQuery({ userId: userId }, { retry: 0 });
  const { mutateAsync } = api.S3.getDownloadLink.useMutation();

  return (
    <>
      {patientLoading ? (
        <Card className="flex w-96 flex-col justify-center self-center p-8">
          <Skeleton className="m-1 h-8 w-80 animate-pulse" />
          <Skeleton className="m-1 h-4 w-80 animate-pulse" />
          <Skeleton className="m-1 h-4 w-80 animate-pulse" />
          <Skeleton className="m-1 h-4 w-80 animate-pulse" />
          <Skeleton className="m-1 h-4 w-80 animate-pulse" />
          <Skeleton className="m-1 h-4 w-80 animate-pulse" />
        </Card>
      ) : (
        <>
          <Card className="flex w-full max-w-xl items-center gap-4 p-8">
            <Avatar className="ml-4">
              <AvatarImage src={sessionData?.user.image ?? undefined} alt="User Avatar" />
            </Avatar>
            <p className="m-0 p-0 text-xl font-bold">{patientData?.User?.name}</p>
          </Card>
          <Card className="m-2 flex w-full max-w-xl flex-col justify-center self-center p-8">
            <p>
              Date of Birth: <span className="font-bold">{patientData?.DOB?.toLocaleDateString()}</span>
            </p>
            <p>
              Allergies: <span className="font-bold">{patientData?.allergies}</span>
            </p>
            <p>
              Blood type: <span className="font-bold">{patientData?.bloodType}</span>
            </p>
            <p>
              Weight: <span className="font-bold">{patientData?.weight}</span>
            </p>
            <p>
              Height: <span className="font-bold">{patientData?.height}</span>
            </p>
          </Card>
        </>
      )}
      <div className="my-10 flex w-full max-w-xl flex-col justify-center">
        <p className="mb-2 flex text-center text-xl font-bold leading-none text-gray-700">Files</p>
        {isLoading ? (
          <Card className="flex w-96 flex-col justify-center self-center p-8">
            <Skeleton className="my-2 h-4 w-80 animate-pulse" />
            <Skeleton className="my-2 h-4 w-80 animate-pulse" />
            <Skeleton className="my-2 h-8 w-80 animate-pulse" />
          </Card>
        ) : data?.length === 0 ? (
          <Card className="my-2 flex h-36 w-full max-w-xl flex-col justify-center self-center p-6">
            <p className="text-center text-lg">No files uploaded</p>
          </Card>
        ) : (
          data?.map((e) => (
            <Card className="my-2 flex w-full flex-col self-center p-6" key={e.id}>
              <div className="flex flex-row justify-between">
                <div className="align-center flex flex-row gap-2">
                  <File size={24} />
                  <div>
                    <p className="text-md font-bold">{e.name.split("_")[2]}</p>
                    <p className="text-sm text-gray-700">Uploaded on {new Date(e.createdAt).toLocaleString().slice(0, -3)}</p>
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    const link = await mutateAsync({ filename: e.name });
                    window.open(link, "_blank");
                  }}
                >
                  <Download />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
};

const EditPatient = (props: { userId: string; setEdit: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const { userId, setEdit } = props;
  const { data } = useSession();
  const { data: patientData } = api.user.getPatientDetails.useQuery({ userId: userId });
  const { mutateAsync } = api.user.setPatientDetails.useMutation();
  const [height, setHeight] = useState(patientData?.height ?? 0);
  const [weight, setWeight] = useState(patientData?.weight ?? 0);
  const [bloodType, setBloodType] = useState(patientData?.bloodType ?? "");
  const [allergies, setAllergies] = useState(patientData?.allergies ?? "");
  const [medications, setMedications] = useState(patientData?.medications ?? "");
  const [DOB, setDOB] = useState(patientData?.DOB?.toLocaleDateString() ?? "");

  return (
    <>
      <Card className="flex w-full max-w-xl items-center gap-4 p-8">
        <Avatar className="ml-4">
          <AvatarImage src={data?.user.image ?? undefined} alt="User Avatar" />
        </Avatar>
        <p className="m-0 p-0 text-xl font-bold">{patientData?.User?.name}</p>
      </Card>
      <Card className="m-2 flex w-full max-w-xl flex-col justify-center self-center p-8">
        <Label>Height:</Label>
        <Input value={height} onChange={(e) => setHeight(parseInt(e.target.value))} className="mb-4" />
        <Label>Weight:</Label>
        <Input value={weight} onChange={(e) => setWeight(parseInt(e.target.value))} className="mb-4" />
        <Label>Medications:</Label>
        <Input value={medications} onChange={(e) => setMedications(e.target.value)} className="mb-4" />
        <Label>Allergies:</Label>
        <Input value={allergies} onChange={(e) => setAllergies(e.target.value)} className="mb-4" />
        <Label>Blood type:</Label>
        <BloodGroupSelect value={bloodType} setValue={setBloodType} />
        <Label>Date of Birth:</Label>
        <Input value={DOB} onChange={(e) => setDOB(e.target.value)} className="mb-4" />
        <div className="flex w-64 flex-col justify-between self-center">
          <Button
            className="my-2"
            onClick={async () => {
              await mutateAsync({ height, weight, bloodType, allergies, medications, DOB: new Date(DOB), userId: userId });
              setEdit(false);
            }}
          >
            Save
          </Button>
          <Button className="my-2" onClick={() => setEdit(false)} variant={"destructive"}>
            Cancel
          </Button>
        </div>
      </Card>
    </>
  );
};
export { ViewPatient };
export default ViewPatientContainer;
