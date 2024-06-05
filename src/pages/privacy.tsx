import Link from "next/link";

export default function Tos() {
  return (
    <div className="m-auto my-4 flex max-w-5xl flex-col self-center text-center">
      <h1 className="text-3xl font-bold text-gray-800">Zoom Privacy Statement</h1>
      <p className="text-gray-600">Last updated: March 17, 2024</p>
      <br />
      <p className="text-justify text-gray-600">
        This Privacy Statement describes the personal data we collect and/or process (which may include collecting, organizing, structuring, storing, using, or
        disclosing) to provide products and services offered directly by Zoom Video Communications, Inc. (“Zoom”), including Zoom’s websites, its meetings,
        webinars, and messaging platform, related collaborative features, and Zoom App Marketplace (“Zoom products and services” or “products and services”).
        Zoom products and services covered in this Privacy Statement do not include products or services developed by Zoom that are covered under a separate
        privacy policy (including those listed{" "}
        <a className="text-blue-500 underline hover:text-blue-600" href="https://explore.zoom.us/en/trust/privacy/policies/">
          here
        </a>
        ).
      </p>
      <br />
      <Link href="https://explore.zoom.us/en/privacy/" className="text-blue-500 underline hover:text-blue-600">
        Read the full privacy policy
      </Link>
    </div>
  );
}
