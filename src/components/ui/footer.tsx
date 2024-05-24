import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full flex-shrink-0 bg-white">
      <div className="container flex flex-col gap-4 py-4 sm:flex-row sm:gap-8 sm:py-6 md:gap-10 lg:py-8">
        <div className="flex flex-col items-center gap-2 sm:items-start sm:gap-1">
          <Link className="inline-flex" href="#">
            <span className="sr-only">Home</span>
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This is a reference application built to show the Zoom Video SDK implemented in a telehealth setting. The Zoom Video SDK is a HIPAA-compliant
            solution; but this reference app is not intended to be used.
          </p>
        </div>
      </div>
      <nav className="flex flex-row text-xs sm:items-start sm:gap-1">
        <Link href="/">Privacy Policy</Link>
        <Link href="/">Terms of Use</Link>
      </nav>
    </footer>
  );
}
