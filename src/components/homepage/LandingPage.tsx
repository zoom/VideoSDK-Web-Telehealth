import { signIn } from "next-auth/react";
import { Button, buttonVariants } from "~/components/ui/button";

const LandingPage = () => {
  return (
    <section className="relative">
      <div className="-z-1 pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 transform" aria-hidden="true">
        <svg width="1360" height="578" viewBox="0 0 1360 578" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="illustration-01">
              <stop stopColor="#2563EB" offset="0%" />
              <stop stopColor="#92b1f5" offset="77.402%" />
              <stop stopColor="#d3dffb" offset="100%" />
            </linearGradient>
          </defs>
          <g fill="url(#illustration-01)" fillRule="evenodd">
            <circle cx="1232" cy="128" r="128" />
            <circle cx="155" cy="443" r="64" />
          </g>
        </svg>
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          <div className="pb-12 text-center md:pb-16">
            <h1 className="leading-tighter mb-4 text-5xl font-extrabold tracking-tighter md:text-5xl" data-aos="zoom-y-out">
              Video SDK <br /> <span className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">Telehealth Starter-Kit</span>
            </h1>
            <div className="mx-auto max-w-3xl">
              <p className="mb-8 text-xl text-gray-600" data-aos="zoom-y-out" data-aos-delay="150">
                A full-stack, open-source template for creating virtual healthcare applications. Designed to be fully customizable and meet the needs of a
                healthcare audience.
              </p>
              <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center" data-aos="zoom-y-out" data-aos-delay="300">
                <Button className="mb-4 w-full bg-blue-600 text-white hover:bg-blue-700 sm:mb-0 sm:w-auto" variant={"outline"} onClick={() => void signIn()}>
                  Sign in
                </Button>
                <a
                  href="https://github.com/zoom/"
                  target="_blank"
                  className={`w-full md:w-1/3 ${buttonVariants({
                    variant: "outline",
                  })} w-full bg-gray-900 text-white hover:bg-gray-800 sm:ml-4 sm:w-auto`}
                >
                  Github Repository
                </a>
              </div>
            </div>
          </div>
          <div className="relative mx-auto max-w-3xl">
            <video src="/video.webm" controls className="p-6 sm:p-4" poster="ZoomDevelopers.png" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
