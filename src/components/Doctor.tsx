import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import Link from "next/link";
import { api } from "~/utils/api";
import { Card } from "./ui/card";
import UpcomingSession from "./UpcomingSession";
import { Skeleton } from "./ui/skeleton";

const DoctorView = () => {
  const { data: userData } = useSession();
  const { data, isLoading } = api.room.getCreated.useQuery();

  return (
    <>
      <h2 className="mb-8 self-center text-2xl font-bold">Welcome Dr. {userData?.user.name}</h2>
      <h3 className="self-center text-xl font-bold">Upcoming Session</h3>
      <Card className="m-4 flex min-h-72 min-w-72 flex-col self-center rounded-lg bg-white p-5 text-center shadow-lg">
        {isLoading ? <Skeleton className="h-64 w-64"></Skeleton> : data?.[0] ? <UpcomingSession data={data[0]} isDoctor /> : <p>No Sessions</p>}
      </Card>
      <div className="mx-8 mb-8 mt-4 flex flex-row justify-around">
        <Link href={"/viewRooms"}>
          <Button variant={"outline"}>All Sessions</Button>
        </Link>
        <div className="w-2"></div>
        <Link href={"/create"}>
          <Button>Schedule Session</Button>
        </Link>
      </div>
      <Button variant={"outline"} onClick={() => void signOut()}>
        Sign Out
      </Button>
    </>
  );
};

export default DoctorView;
