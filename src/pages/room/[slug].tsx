import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import dynamic from "next/dynamic";

const Videocall = dynamic<{ jwt: string; session: string }>(() => import("../../components/Videocall"), {
  ssr: false,
});

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const { data, isLoading: loadingJwt } = api.zoom.createJWT.useQuery({
    role: 1,
    sessionName: router.query.slug as string,
  });
  if (status === "loading" || loadingJwt) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (status === "unauthenticated") {
    void router.replace("/");
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1>Loading...</h1>
      </div>
    );
  }
  if (!loadingJwt && data) {
    return (
      <div className="flex h-screen w-screen flex-col items-center bg-gray-100">
        <Videocall jwt={data} session={router.query.slug as string} />
      </div>
    );
  }
}
