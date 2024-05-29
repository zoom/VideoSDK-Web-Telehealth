import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Footer from "~/components/ui/footer";
import Header from "~/components/ui/header";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";

const Patients = () => {
  return (
    <>
      <Header />
      <div className="flex min-h-[80vh] w-screen flex-col overflow-y-scroll bg-gray-100">
        <div className="mx-auto w-full max-w-xl">
          <h1 className="mb-2 mt-8 flex text-3xl font-bold leading-none text-gray-700">Patients</h1>
          <div className="flex flex-row flex-wrap justify-center self-center">
            <ViewPatients />
          </div>
          <Link href="/">
            <Button variant={"link"} className="mx-auto mb-8 flex">
              back
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

const ViewPatients = () => {
  const { data, isLoading } = api.user.getPatients.useQuery();

  return (
    <>
      {isLoading ? (
        <Card className="m-4 flex flex-col justify-center self-center p-8">
          <Skeleton className="h-8 w-80 animate-pulse" />
          <Skeleton className="my-1 h-4 w-80 animate-pulse" />
          <Skeleton className="h-4 w-80 animate-pulse" />
        </Card>
      ) : (
        <>
          <div className="flex w-full max-w-xl flex-col gap-4">
            {data?.map((patient) => (
              <Card className="flex w-full flex-row justify-between self-center p-8" key={patient.id}>
                <div>
                  <p className="text-xl font-bold">{patient.User?.name}</p>
                  <p>
                    Date of Birth: <span className="font-bold">{patient?.DOB?.toDateString().split(" ").slice(1).join(" ")}</span>
                  </p>
                </div>
                <Link href={`/viewPatient/${patient.userId}`} className="self-start">
                  <Button variant={"secondary"}>View profile</Button>
                </Link>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
};
export { ViewPatients };
export default Patients;
