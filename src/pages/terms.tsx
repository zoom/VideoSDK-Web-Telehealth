import Link from "next/link";

export default function Tos() {
  return (
    <div className="m-auto my-4 flex max-w-5xl flex-col self-center text-center">
      <h1 className="text-3xl font-bold text-gray-800">ZOOM TERMS OF SERVICE</h1>
      <p className="text-gray-600">Effective Date: August 11, 2023</p>
      <br />
      <p className="text-justify text-gray-600">
        Please read these terms of service (“Terms of Service”) and the Zoom Services Description (collectively, this “Agreement”) carefully. This Agreement is
        between you and Zoom Video Communications, Inc. and its affiliates (“Zoom,” “we,” “us,” or “our”) and governs your access to and use of our Services and
        Software, unless you and Zoom have entered into a written Master Subscription Agreement (MSA), in which case such MSA will govern your access to and use
        of the Services and Software and not these Terms of Service. You may enter into this Agreement on behalf of yourself or on behalf of a legal entity. If
        you enter into this Agreement on behalf of a legal entity, you represent that you are a duly authorized representative with the authority to bind that
        legal entity to this Agreement. All references to “you” and “your” in this Agreement mean the person accepting this Agreement as an individual or the
        legal entity for which the representative is acting. Capitalized terms in this Agreement will have definitions as set forth in the applicable section
        where they are defined, in the Zoom Services Description, or in Section 34 below. We may provide the Services and Software through Zoom Video
        Communications, Inc., our affiliate(s), or both. You may only use the Services and Software in accordance with the terms and subject to the conditions
        of this Agreement.
      </p>
      <br />
      <Link className="text-blue-500 underline hover:text-blue-600" href="https://explore.zoom.us/en/terms/">
        Read the full terms
      </Link>
    </div>
  );
}
