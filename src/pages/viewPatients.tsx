import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";

const Patients = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center overflow-y-scroll bg-gray-100">
      <h1 className="mb-2 mt-8 flex text-3xl font-bold leading-none text-gray-700">Patients</h1>
      <ViewPatient />
      <Link href="/">
        <Button variant={"link"} className="mx-auto flex">
          back
        </Button>
      </Link>
    </div>
  );
};

const ViewPatient = () => {
  const { data, isLoading } = api.user.getPatients.useQuery();

  return (
    <>
      {isLoading ? (
        <Card className="m-2 flex w-96 flex-col justify-center self-center p-8">
          <Skeleton className="h-8 w-80 animate-pulse" />
          <Skeleton className="my-1 h-4 w-80 animate-pulse" />
          <Skeleton className="h-4 w-80 animate-pulse" />
        </Card>
      ) : (
        <>
          {data?.map((patient) => (
            <Card className="m-2 flex w-96 flex-col justify-center self-center p-8" key={patient.id}>
              <p className="text-xl font-bold">{patient.User?.name}</p>
              <p>
                Date of Birth: <span className="font-bold">{patient?.DOB?.toDateString().split(" ").slice(1).join(" ")}</span>
              </p>
              <p>
                Email: <span className="font-bold">{patient.User?.email}</span>
              </p>
              <Link href={`/viewPatient/${patient.userId}`} className="mt-4">
                <Button variant={"secondary"}>View details</Button>
              </Link>
            </Card>
          ))}
        </>
      )}
    </>
  );
};
export { ViewPatient };
export default Patients;