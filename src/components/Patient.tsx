import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import Link from "next/link";
import { api } from "~/utils/api";
import { Card } from "./ui/card";
import UpcomingSession from "./UpcomingSession";
import { Skeleton } from "./ui/skeleton";

const DoctorView = () => {
  const { data: userData } = useSession();
  const { data, isLoading } = api.room.getInvited.useQuery();
  return (
    <>
      <h2 className="mb-2 self-center text-2xl font-bold">Welcome Patient, {userData?.user.name}</h2>
      <h3 className="mt-2 self-center text-xl font-bold">Upcoming Session</h3>
      <Card className="m-4 flex min-h-64 w-64 flex-col self-center rounded-lg bg-white p-5 text-center shadow-lg">
        {isLoading ? <Skeleton className="w-54 h-56"></Skeleton> : data?.[0] ? <UpcomingSession data={data[0]} /> : <p>No Sessions</p>}
      </Card>
      <div className="mx-8 my-4 flex self-center">
        <Link href={"/view"}>
          <Button>All Sessions</Button>
        </Link>
        <div className="w-2"></div>
        <Link href={"/create"}>
          <Button variant={"outline"}>Schedule Session</Button>
        </Link>
        <br />
      </div>
      <div className="my-8 flex flex-col">
        <p className="my-4 flex self-center text-xl font-bold">Documents</p>
        <div className="mb-4 flex self-center">
          <Link href={"/upload"}>
            <Button>Upload</Button>
          </Link>
          <div className="w-2"></div>
          <Link href={`/uploaded/${userData?.user.id}`}>
            <Button variant={"outline"}>View</Button>
          </Link>
        </div>
      </div>
      <Button variant={"outline"} onClick={() => void signOut()}>
        Sign Out
      </Button>
    </>
  );
};

export default DoctorView;
