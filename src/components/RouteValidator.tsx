import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

// you can add more routes here
const forbiddenRoutesForPatient = ["/patients", "/viewNotes/[roomId]"];

const RouteValidator = ({ children }: { children: React.ReactNode }) => {
  const { status, data } = useSession();
  const router = useRouter();

  if (["/"].includes(router.pathname)) {
    return children;
  }

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (status === "unauthenticated") {
    // const route = router.pathname;
    void signIn();
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (data?.user.role === null) {
    void router.push("/onboarding");
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
      <h1>Loading...</h1>
    </div>;
  }

  if (data?.user.role === "patient" && forbiddenRoutesForPatient.includes(router.pathname)) {
    void router.push("/");
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1>Redirecting...</h1>
      </div>
    );
  }

  return children;
};
export default RouteValidator;
