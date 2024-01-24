import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import dynamic from "next/dynamic";

const Videocall = dynamic<{ jwt: string; session: string }>(() => import("../../components/Videocall"), {
  ssr: false,
});

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const { data, isLoading } = api.zoom.createJWT.useQuery({
    role: 1,
    sessionName: router.query.slug as string,
  });
  if (status === "loading") {
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
  if (data) {
    return (
      <div className="flex h-screen w-screen flex-col items-center bg-gray-100">
        <Videocall jwt={data} session={router.query.slug as string} />
      </div>
    );
  }
}
