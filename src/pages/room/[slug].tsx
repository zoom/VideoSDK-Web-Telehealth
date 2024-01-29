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
  const {
    data,
    isLoading: loadingJwt,
    isError,
    error,
  } = api.room.getById.useQuery(
    { id: `${router.query.slug as string}` },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  if (isError) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1>Error: {error.message}</h1>
      </div>
    );
  }

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
        <Videocall jwt={data.jwt} session={data.room.id} />
      </div>
    );
  }
}
