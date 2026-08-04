"use client";
import { useSession } from "next-auth/react";
import DoctorView from "~/components/Doctor";
import PatientView from "~/components/Patient";
import LandingPage from "~/components/homepage/LandingPage";
import Features from "~/components/homepage/Features";
import Footer from "~/components/ui/footer";
import Header from "~/components/ui/header";
import { Loader2 } from "lucide-react";

export default function Home() {
  // Middleware already redirected authed users with role==null → /onboarding,
  // so by the time this renders: either unauthenticated OR authed with a role.
  const { data, status } = useSession();

  if (status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Opening your workspace…
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div>
        <Header />
        <LandingPage />
        <Features />
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)]">
        {data?.user.role === "doctor" ? <DoctorView /> : <PatientView />}
      </div>
      <Footer />
    </>
  );
}
