import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import Link from "next/link";
import { api } from "~/utils/api";
import { Card } from "./ui/card";
import UpcomingSession from "./UpcomingSession";
import { Skeleton } from "./ui/skeleton";
import { CalendarPlus, BadgePlus, Calendar, Upload, BookUser } from "lucide-react";

const DoctorView = () => {
  const { data: userData } = useSession();
  const { data, isLoading } = api.room.getUpcoming.useQuery();
  return (
    <>
      <h2 className="mb-8 self-center text-2xl font-bold text-gray-700">Welcome Patient, {userData?.user.name}</h2>
      <div className="flex flex-1 flex-row justify-around">
        <div className="flex flex-1 flex-col">
          <h3 className="self-center text-xl font-bold text-gray-700">Upcoming Session</h3>
          <Card className="m-4 mx-8 flex min-h-96 min-w-72 flex-col self-center rounded-lg bg-white p-5 text-center shadow-lg">
            {isLoading ? <Skeleton className="h-64 w-64"></Skeleton> : data?.[0] ? <UpcomingSession data={data[0]} /> : <p>No Sessions</p>}
          </Card>
        </div>
        <div className="flex flex-1 flex-col">
          <h3 className="self-center text-xl font-bold text-gray-700">Sessions</h3>
          <Card className="m-4 flex h-full w-80 flex-col justify-around self-center rounded-lg bg-white p-4 text-center shadow-sm">
            <div className="flex flex-row justify-center">
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
            <div className="flex flex-row justify-center">
              <Link href={"/viewDoctors"} className="m-2 flex flex-row justify-around">
                <Button variant={"outline"}>
                  <BadgePlus className="mr-2" />
                  View Doctors
                </Button>
              </Link>
            </div>
          </Card>
          <h3 className="self-center text-xl font-bold text-gray-700">Profile</h3>
          <Card className="m-4 mx-8 flex h-full w-80 flex-col justify-around self-center rounded-lg bg-white p-4 text-center shadow-sm">
            <div className="flex flex-col justify-center">
              <Link href={"/upload"} className="m-2 flex flex-row justify-around">
                <Button>
                  <Upload size={18} className="mr-2" />
                  Upload Document
                </Button>
              </Link>
              <Link href={`/viewPatient/${userData?.user.id}`} className="m-2 flex flex-row justify-around">
                <Button variant={"outline"}>
                  <BookUser className="mr-2" />
                  View Details
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
