import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import Footer from "~/components/ui/footer";
import Header from "~/components/ui/header";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";

const Doctors = () => {
  return (
    <>
      <Header />
      <div className="flex min-h-[80vh] w-screen flex-col items-center overflow-y-scroll bg-gray-100">
        <h1 className="mb-2 mt-8 flex text-3xl font-bold leading-none text-gray-700">Doctors</h1>
        <div className="mx-24 flex flex-row flex-wrap justify-center self-center">
          <ViewDoctor />
        </div>
        <Link href="/">
          <Button variant={"link"} className="mx-auto mb-8 flex">
            back
          </Button>
        </Link>
      </div>
      <Footer />
    </>
  );
};

const ViewDoctor = () => {
  const [name, setName] = useState("");
  const { data, isFetching } = api.user.getDoctors.useQuery({ name });

  return (
    <div className="flex flex-col items-center">
      <Input type="text" placeholder="Search Doctors" className="w-96" onChange={(e) => setName(e.target.value)} />
      {isFetching ? (
        <Card className="m-2 flex w-96 flex-col justify-center self-center p-8">
          <Skeleton className="h-8 w-80 animate-pulse" />
          <Skeleton className="my-1 h-4 w-80 animate-pulse" />
          <Skeleton className="h-4 w-80 animate-pulse" />
        </Card>
      ) : (
        <div className="flex flex-wrap justify-center self-center">
          {data?.length === 0 ? (
            <Card className="m-4 flex h-48 w-96 flex-col justify-center self-center p-8 text-center">
              <p className="text-xl font-bold">No Doctors found</p>
            </Card>
          ) : (
            <></>
          )}
          {data?.map((user) => (
            <Card className="m-4 flex h-48 w-96 flex-col justify-center self-center p-8" key={user.Doctor?.id}>
              <p className="text-xl font-bold">{user?.name}</p>
              <p>
                Department: <span className="font-bold">{user.Doctor?.department}</span>
              </p>
              <p>
                Title: <span className="font-bold">{user.Doctor?.position}</span>
              </p>
              <Link href={`/create?inviteID=${user.Doctor?.userId}`} className="mt-4">
                <Button variant={"default"}>Schedule appointment</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
export { ViewDoctor };
export default Doctors;
