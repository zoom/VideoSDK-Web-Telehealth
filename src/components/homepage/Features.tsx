import { Wand } from "lucide-react";

const Features = () => {
  return (
    <section className="relative">

    {/* Section background (needs .relative class on parent and next sibling elements) */}
    <div className="absolute inset-0 top-1/2 md:mt-24 lg:mt-0 bg-gray-900 pointer-events-none" aria-hidden="true"></div>
    <div className="absolute left-0 right-0 bottom-0 m-auto w-px p-px h-20 bg-gray-200 transform translate-y-1/2"></div>

    <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
      <div className="py-12 md:py-20">

        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
        <h1 className="text-5xl md:text-4xl font-extrabold leading-tighter tracking-tighter mb-1" data-aos="zoom-y-out"><span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">Customized</span> Features</h1>
          <p className="text-xl text-gray-600">Curated to meet the specific needs of a healthcare audience.</p>
        </div>

        {/* Items */}
        <div className="max-w-sm mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start md:max-w-2xl lg:max-w-none">

          {/* 1st item */}
          <div className="relative flex flex-col items-center p-6 bg-white rounded shadow-xl">
            <Wand/>
            <h4 className="text-xl font-bold leading-snug tracking-tight mb-1">Differentiated User Portals</h4>
            <p className="text-gray-600 text-center">Register as either a doctor or patient and log in to your portal for profile and appointment access.</p>
          </div>

          {/* 2nd item */}
          <div className="relative flex flex-col items-center p-6 bg-white rounded shadow-xl">
            <Wand/>
            <h4 className="text-xl font-bold leading-snug tracking-tight mb-1">Live Transcription</h4>
            <p className="text-gray-600 text-center">Turn on transcription during your virtual appointment for live, auto-generated captions.</p>
          </div>


          {/* 3rd item */}
          <div className="relative flex flex-col items-center p-6 bg-white rounded shadow-xl">
            <Wand/>
            <h4 className="text-xl font-bold leading-snug tracking-tight mb-1">Appointment Management</h4>
            <p className="text-gray-600 text-center">Search for a user and schedule an appointment with them. The process is as easy as a few clicks.</p>
          </div>


          {/* 4th item */}
          <div className="relative flex flex-col items-center p-6 bg-white rounded shadow-xl">
            <Wand/>
            <h4 className="text-xl font-bold leading-snug tracking-tight mb-1">Customized Video-Call Toolbar</h4>
            <p className="text-gray-600 text-center">Customize the actions users can take during the virtual appointment using the built-in action-menu.</p>
          </div>


          {/* 5th item */}
          <div className="relative flex flex-col items-center p-6 bg-white rounded shadow-xl">
            <Wand/>
            <h4 className="text-xl font-bold leading-snug tracking-tight mb-1">Add to Calendar</h4>
            <p className="text-gray-600 text-center">Users can easily add an appointment to their calendar with an auto-generated ICS file.</p>
          </div>


          {/* 6th item */}
          <div className="relative flex flex-col items-center p-6 bg-white rounded shadow-xl">
            <Wand/>
            <h4 className="text-xl font-bold leading-snug tracking-tight mb-1">Secured Appointment Links</h4>
            <p className="text-gray-600 text-center">Be sure that the only people entering your appointments are those that you've invted.</p>
          </div>


        </div>

      </div>
    </div>
  </section>
  );
};

export default Features;
