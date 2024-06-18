import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import Link from "next/link";
import { api } from "~/utils/api";
import { Card } from "./ui/card";
import UpcomingSession from "./UpcomingSession";
import { Skeleton } from "./ui/skeleton";
import { CalendarPlus, UserSearch, Calendar } from "lucide-react";

const DoctorView = () => {
  const { data: userData } = useSession();
  const { data, isLoading } = api.room.getUpcoming.useQuery();

  return (
    <>
      <span className="py-8">
        <h2 className="mb-8 self-center text-2xl font-bold text-gray-700">Welcome Dr. {userData?.user.name}</h2>
        <h3 className="text-sm text-gray-700">
          Welcome to your dashboard! Here you can create an appointment, join scheduled appointments, and search for patients.
        </h3>
        <div className="flex w-full flex-row">
          <Link href={"/create"} className="m-2 flex flex-row justify-around">
            <Button>
              <CalendarPlus size={20} className="mr-2" />
              Create an appointment
            </Button>
          </Link>
          <Link href={"/schedule"} className="m-2 flex flex-row justify-around">
            <Button variant={"outline"}>
              <Calendar size={18} className="mr-2" />
              View your schedule
            </Button>
          </Link>
          <Link href={"/patients"} className="m-2 flex flex-row justify-around">
            <Button variant={"outline"}>
              <UserSearch size={18} className="mr-2" />
              Find a patient
            </Button>
          </Link>
        </div>
      </span>
      <div className="flex flex-1 flex-row justify-around">
        <div className="flex flex-1 flex-col">
          <h3 className="text-xl font-bold text-gray-700">Upcoming appointments</h3>
          <div className="mt-4 flex flex-col rounded-lg text-center">
            {isLoading ? (
              <Skeleton className="w-full animate-pulse" />
            ) : data?.[0] ? (
              <UpcomingSession data={data[0]} />
            ) : (
              <Card className="p-4">No appointments, yet</Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorView;
