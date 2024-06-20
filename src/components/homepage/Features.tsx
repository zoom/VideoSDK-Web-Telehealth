import { Wand } from "lucide-react";

const Features = () => {
  return (
    <section className="relative">
      {/* Section background (needs .relative class on parent and next sibling elements) */}
      <div className="pointer-events-none absolute inset-0 top-1/2 bg-gray-900 md:mt-24 lg:mt-0" aria-hidden="true"></div>
      <div className="absolute bottom-0 left-0 right-0 m-auto h-20 w-px translate-y-1/2 transform bg-gray-200 p-px"></div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-12 text-center md:pb-20">
            <h1 className="leading-tighter mb-1 text-5xl font-extrabold tracking-tighter md:text-4xl" data-aos="zoom-y-out">
              <span className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">Customized</span> Features
            </h1>
            <p className="text-xl text-gray-600">Curated to meet the specific needs of a healthcare audience.</p>
          </div>

          {/* Items */}
          <div className="mx-auto grid max-w-sm items-start gap-6 md:max-w-2xl md:grid-cols-2 lg:max-w-none lg:grid-cols-3">
            {/* 1st item */}
            <div className="relative flex flex-col items-center rounded bg-white p-6 shadow-xl">
              <Wand />
              <h4 className="mb-1 text-xl font-bold leading-snug tracking-tight">Differentiated User Portals</h4>
              <p className="text-center text-gray-600">Register as either a doctor or patient and log in to your portal for profile and appointment access.</p>
            </div>

            {/* 2nd item */}
            <div className="relative flex flex-col items-center rounded bg-white p-6 shadow-xl">
              <Wand />
              <h4 className="mb-1 text-xl font-bold leading-snug tracking-tight">Live Transcription</h4>
              <p className="text-center text-gray-600">Turn on transcription during your virtual appointment for live, auto-generated captions.</p>
            </div>

            {/* 3rd item */}
            <div className="relative flex flex-col items-center rounded bg-white p-6 shadow-xl">
              <Wand />
              <h4 className="mb-1 text-xl font-bold leading-snug tracking-tight">Appointment Management</h4>
              <p className="text-center text-gray-600">Search for a user and schedule an appointment with them. The process is as easy as a few clicks.</p>
            </div>

            {/* 4th item */}
            <div className="relative flex flex-col items-center rounded bg-white p-6 shadow-xl">
              <Wand />
              <h4 className="mb-1 text-xl font-bold leading-snug tracking-tight">Customized Video-Call Toolbar</h4>
              <p className="text-center text-gray-600">Customize the actions users can take during the virtual appointment using the built-in action-menu.</p>
            </div>

            {/* 5th item */}
            <div className="relative flex flex-col items-center rounded bg-white p-6 shadow-xl">
              <Wand />
              <h4 className="mb-1 text-xl font-bold leading-snug tracking-tight">Add to Calendar</h4>
              <p className="text-center text-gray-600">Users can easily add an appointment to their calendar with an auto-generated ICS file.</p>
            </div>

            {/* 6th item */}
            <div className="relative flex flex-col items-center rounded bg-white p-6 shadow-xl">
              <Wand />
              <h4 className="mb-1 text-xl font-bold leading-snug tracking-tight">Secured Appointment Links</h4>
              <p className="text-center text-gray-600">Be sure that the only people entering your appointments are those that you&apos;ve invted.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
