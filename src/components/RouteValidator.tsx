import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

const RouteValidator = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();
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
    const route = router.asPath;
    void signIn("github", { callbackUrl: route });
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1>Loading...</h1>
      </div>
    );
  }
  return children;
};
export default RouteValidator;
