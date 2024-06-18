import Link from "next/link";

export default function Footer() {
  return (
    <footer className="m-auto flex flex-col gap-5 bg-white py-6">
      <div className="m-auto flex w-full max-w-2xl flex-col">
        <div className="flex flex-col items-center gap-2 sm:items-start sm:gap-1">
          <Link className="inline-flex" href="#">
            <span className="sr-only">Home</span>
          </Link>
          <p className="text-xs text-gray-500">
            This is a reference application built to show the Zoom Video SDK implemented in a telehealth setting. The Zoom Video SDK is a HIPAA-compliant
            solution; but this reference app is not intended to be used.
          </p>
        </div>
      </div>
      <nav className="m-auto flex w-full max-w-2xl flex-row text-xs sm:items-start sm:gap-2">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms of Use</Link>
        <p className="text-xs italic text-gray-400">(Replace with your own!)</p>
      </nav>
    </footer>
  );
}
