import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function Tos() {
  return (
    <div className="m-auto my-4 flex max-w-5xl flex-col self-center text-center">
      <div className="m-auto my-4 flex max-w-5xl flex-col self-center text-center">
        <h1 className="text-3xl font-bold text-gray-800">Your Terms of Service go here</h1>
        <br />
        <p className="text-justify text-gray-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Sed porttitor, nisl a porta ultrices, orci nisi porta nibh, ac porttitor nisl
          nisi eget nibh. Nullam nec nisl a nisi porta porttitor. Donec nec nulla nec nisi porta porttitor. Nulla facilisi. Sed porttitor, nisl a porta
          ultrices,
        </p>
        <br />
        <Link href="https://explore.zoom.us/en/terms/" className="text-blue-500 underline hover:text-blue-600">
          Read Zoom&apos;s Terms of Service for this application
        </Link>
        <Link href="/">
          <Button variant="link">Back</Button>
        </Link>
      </div>
    </div>
  );
}
