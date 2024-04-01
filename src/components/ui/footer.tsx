import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full flex-shrink-0 bg-white">
      <div className="container flex flex-col items-center justify-center gap-4 py-4 text-center sm:flex-row sm:gap-8 sm:py-6 md:gap-10 lg:py-8">
        <div className="flex flex-col items-center gap-2 sm:items-start sm:gap-1">
          <Link className="inline-flex" href="#">
            <span className="sr-only">Home</span>
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400">Your health in your hands.</p>
        </div>
        <nav className="flex items-center gap-4 sm:gap-8 lg:gap-6">
          <Link
            className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            href="/"
          >
            Home
          </Link>
          <Link
            className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            href="/viewDoctors"
          >
            Doctors
          </Link>
          <Link
            className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            href="mailto:test@example.com"
          >
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
