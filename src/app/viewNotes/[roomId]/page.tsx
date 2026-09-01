"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ViewNotes } from "~/components/ViewNotes";
import { Button } from "~/components/ui/button";
import Footer from "~/components/ui/footer";
import Header from "~/components/ui/header";

export default function Notes() {
  const { roomId } = useParams<{ roomId: string }>();
  return (
    <>
      <Header />
      <div className="flex h-screen w-screen flex-col items-center overflow-y-scroll bg-gray-100">
        <h1 className="mb-2 mt-8 flex text-3xl font-bold leading-none text-gray-700">Notes</h1>
        <ViewNotes roomId={roomId} />
        <Link href="/">
          <Button variant={"link"} className="mx-auto flex">back</Button>
        </Link>
      </div>
      <Footer />
    </>
  );
}
