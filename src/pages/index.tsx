import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import DoctorView from "~/components/Doctor";
import PatientView from "~/components/Patient";
import { Button } from "~/components/ui/button";
import LandingPage from "~/components/LandingPage";
import InfoPanel from "~/components/InfoPanel";
export default function Home() {
  const { data, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1>Loading...</h1>
      </div>
    );
  }
  // check `/` for auth as it is not protected by RouteValidator
  if (status === "unauthenticated") {
    return (
      <div>
        <LandingPage/>
        <InfoPanel/>
      </div>
    );
  }
  // check `/` for role as it is not protected by RouteValidator
  if (data?.user.role === null) {
    void router.push("/onboarding");
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
      <h1>Loading...</h1>
    </div>;
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center bg-gray-100">
      <span className="my-8 flex justify-start">
        <Image className="inline" src={"/logo.svg"} height={34} width={150} alt="product logo" />
        <h1 className="ml-2 inline text-5xl font-bold leading-none text-gray-700">Telehealth</h1>
      </span>
      <div className="mt-2 flex flex-col justify-center">{data?.user.role === "doctor" ? <DoctorView /> : <PatientView />}</div>
      <Button variant={"outline"} className="mt-8 w-48 self-center" onClick={() => void signOut()}>
        Sign Out
      </Button>
    </div>
  );
}
