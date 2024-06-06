import Link from "next/link";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Footer from "~/components/ui/footer";
import Header from "~/components/ui/header";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";
import { useDebounce } from "@uidotdev/usehooks";

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
  const [name, setName] = useState("");
  const debouncedSearchTerm = useDebounce(name, 500);
  const { data, isLoading } = api.user.getPatients.useQuery({ name: debouncedSearchTerm }, { refetchOnWindowFocus: false });

  return (
    <div className="flex flex-col items-center">
      <Input type="text" placeholder="Search Patients" className="my-4 w-96" onChange={(e) => setName(e.target.value)} />
      {isLoading ? (
        <Card className="m-4 flex flex-col justify-center self-center p-8">
          <Skeleton className="h-8 w-80 animate-pulse" />
          <Skeleton className="my-1 h-4 w-80 animate-pulse" />
          <Skeleton className="h-4 w-80 animate-pulse" />
        </Card>
      ) : (
        <div className="flex w-full max-w-xl flex-col gap-4">
          {data?.map((patient) => (
            <Card className="flex w-full flex-row justify-between self-center p-8" key={patient.id}>
              <div>
                <p className="text-xl font-bold">{patient.name}</p>
                <p className="mr-2 text-sm">
                  Date of Birth: <span className="font-bold">{patient.Patient?.DOB?.toDateString().split(" ").slice(1).join(" ")}</span>
                </p>
              </div>
              <Link href={`/patient/${patient.id}`} className="self-start">
                <Button variant={"outline"}>View profile</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
export { ViewPatients };
export default Patients;
