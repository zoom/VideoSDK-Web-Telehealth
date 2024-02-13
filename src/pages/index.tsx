import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import DoctorView from "~/components/Doctor";
import PatientView from "~/components/Patient";
import { Button } from "~/components/ui/button";

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
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1 className="my-4 flex text-5xl font-bold leading-none text-gray-700">Zoom Telehealth Demo</h1>
        <Button variant={"outline"} onClick={() => void signIn("github")}>
          Sign in
        </Button>
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
    <>
      <div className="flex h-screen w-screen flex-col items-center bg-gray-100">
        <h1 className="mb-8 mt-12 flex text-5xl font-bold leading-none text-gray-700">Zoom Telehealth Demo</h1>
        <div className="mt-2 flex flex-col justify-center ">{data?.user.role === "doctor" ? <DoctorView /> : <PatientView />}</div>
      </div>
    </>
  );
}
