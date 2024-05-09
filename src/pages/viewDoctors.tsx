import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
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
  const { data, isLoading } = api.user.getDoctors.useQuery();

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
          {data?.map((doctor) => (
            <Card className="m-4 flex h-48 w-96 flex-col justify-center self-center p-8" key={doctor.id}>
              <p className="text-xl font-bold">{doctor.User?.name}</p>
              <p>
                Department: <span className="font-bold">{doctor.department}</span>
              </p>
              <p>
                Title: <span className="font-bold">{doctor.position}</span>
              </p>
              <Link href={`/create?inviteID=${doctor.userId}`} className="mt-4">
                <Button variant={"default"}>Schedule appointment</Button>
              </Link>
            </Card>
          ))}
        </>
      )}
    </>
  );
};
export { ViewDoctor };
export default Doctors;
