import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import DoctorView from "~/components/Doctor";
import PatientView from "~/components/Patient";
import { Button } from "~/components/ui/button";
import LandingPage from "~/components/homepage/LandingPage";
import InfoPanel from "~/components/homepage/InfoPanel";
import About from "~/components/homepage/About";
import Footer from "~/components/ui/footer";
import Header from "~/components/ui/header";

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
        <Header />
        <LandingPage />
        <InfoPanel />
        <About />
        <Footer />
      </div>
<<<<<<< HEAD
    )
=======
    );
>>>>>>> c1a922f4cbc159d9eac847cec918baa2868ca56c
  }

  if (data?.user.role === null) {
    void router.push("/onboarding");
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
      <h1>Loading...</h1>
    </div>;
  }

  return (
    <>
      <Header />
<<<<<<< HEAD
      <div className="flex h-screen w-screen flex-col items-center bg-gray-100">
        <div className="mt-2 flex flex-col justify-center">{data?.user.role === "doctor" ? <DoctorView /> : <PatientView />}</div>
        <Button variant={"outline"} className="mt-8 w-48 self-center" onClick={() => void signOut()}>
=======
      <div className="flex w-screen flex-col items-center bg-gray-100">
        <div className="mt-2 flex min-h-[70vh] flex-col justify-center">{data?.user.role === "doctor" ? <DoctorView /> : <PatientView />}</div>
        <Button variant={"outline"} className="my-8 w-48 self-center" onClick={() => void signOut()}>
>>>>>>> c1a922f4cbc159d9eac847cec918baa2868ca56c
          Sign Out
        </Button>
      </div>
      <Footer />
    </>
  );
}
