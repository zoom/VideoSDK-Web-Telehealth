import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import Link from "next/link";
import { api } from "~/utils/api";
import { Card } from "./ui/card";
import UpcomingSession from "./UpcomingSession";
import { Skeleton } from "./ui/skeleton";
import { CalendarPlus, UserSearch, BadgePlus, Calendar } from "lucide-react";

const DoctorView = () => {
  const { data: userData } = useSession();
  const { data, isLoading } = api.room.getUpcoming.useQuery();

  return (
    <>
      <span className="py-8">
        <h2 className="mb-8 self-center text-2xl font-bold text-gray-700">Welcome Dr. {userData?.user.name}</h2>
        <h3 className="text-sm text-gray-700">
          Welcome to your dashboard, where you can view upcoming appointments, join scheduled appointments, and view active users
        </h3>
      </span>
      <div className="flex flex-1 flex-row justify-around">
        <div className="flex flex-1 flex-col">
          <h3 className="self-center text-xl font-bold text-gray-700">Upcoming Appointments</h3>
          <Card className="m-4 mx-8 flex min-h-96 min-w-96 flex-col self-center rounded-lg bg-white p-5 text-center shadow-lg">
            {isLoading ? (
              <Skeleton className="h-96 w-full animate-pulse" />
            ) : data?.[0] ? (
              <UpcomingSession data={data[0]} isDoctor />
            ) : (
              <div className="flex flex-1 flex-col justify-center text-lg">No Appointments</div>
            )}
          </Card>
        </div>
        <div className="flex flex-1 flex-col">
          <h3 className="self-center text-xl font-bold text-gray-700">Appointments</h3>
          <Card className="m-4 flex h-full w-48 flex-col justify-around self-center rounded-lg bg-white p-4 text-center shadow-sm">
            <div className="flex flex-col justify-center">
              <Link href={"/create"} className="m-2 flex flex-row justify-around">
                <Button>
                  <CalendarPlus size={20} className="mr-2" />
                  Schedule
                </Button>
              </Link>
              <Link href={"/viewRooms"} className="m-2 flex flex-row justify-around">
                <Button variant={"outline"}>
                  <Calendar size={18} className="mr-2" />
                  View All
                </Button>
              </Link>
            </div>
          </Card>
          <h3 className="self-center text-xl font-bold text-gray-700">View Users</h3>
          <Card className="m-4 mx-8 flex h-full w-48 flex-col justify-around self-center rounded-lg bg-white p-4 text-center shadow-sm">
            <div className="flex flex-col justify-center">
              <Link href={"/viewPatients"} className="m-2 flex flex-row justify-around">
                <Button variant={"outline"}>
                  <UserSearch size={18} className="mr-2" />
                  Patients
                </Button>
              </Link>
              <div className="w-2"></div>
              <Link href={"/viewDoctors"} className="m-2 flex flex-row justify-around">
                <Button variant={"outline"}>
                  <BadgePlus className="mr-2" />
                  Doctors
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DoctorView;
