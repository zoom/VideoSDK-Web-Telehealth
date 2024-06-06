import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import Link from "next/link";
import { api } from "~/utils/api";
import UpcomingSession from "./UpcomingSession";
import { Skeleton } from "./ui/skeleton";
import { CalendarPlus, BadgePlus, Calendar, Upload, BookUser } from "lucide-react";
import { Card } from "./ui/card";

const DoctorView = () => {
  const { data: userData } = useSession();
  const { data, isLoading } = api.room.getUpcoming.useQuery();
  return (
    <>
      <span className="py-8">
        <p className="text-sm text-gray-700">Welcome,</p>
        <h2 className="mb-6 mt-2 self-center text-2xl font-bold text-gray-700">{userData?.user.name}</h2>
        <h3 className="text-sm text-gray-700">
          Welcome to your dashboard, where you can view upcoming apointments, join scheduled appointments, and view active users
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
          <Link href={"/doctors"} className="m-2 flex flex-row justify-around">
            <Button variant={"outline"}>
              <BadgePlus className="mr-2" />
              Find a doctor
            </Button>
          </Link>
          <Link href={`/patient/${userData?.user.id}`} className="m-2 flex flex-row justify-around">
            <Button variant={"outline"}>
              <BookUser className="mr-2" />
              View your profile
            </Button>
          </Link>
          <Link href={"/upload"} className="m-2 flex flex-row justify-around">
            <Button variant={"outline"}>
              <Upload size={18} className="mr-2" />
              Upload Document
            </Button>
          </Link>
        </div>
      </span>
      <div className="flex flex-1 flex-row justify-around">
        <div className="flex flex-1 flex-col">
          <h3 className="text-xl font-bold text-gray-700">Upcoming Appointments</h3>
          <div className="mt-4 flex flex-col rounded-lg text-center">
            {isLoading ? (
              <Skeleton className="h-64 w-64"></Skeleton>
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
