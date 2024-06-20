import { signIn } from "next-auth/react";
import { Button, buttonVariants } from "~/components/ui/button";
import ModalVideo from "./modal-video";
import VideoThumb from "./images/ZoomDevelopers.png";

const LandingPage = () => {
  return (
    <section className="relative">
      {/* Illustration behind hero content */}
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
        {/* Hero content */}
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          {/* Section header */}
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
                  {/* <GitHubLogoIcon className="ml-2 h-5 w-5" /> */}
                </a>
              </div>
            </div>
          </div>

          {/* Hero image */}
          <ModalVideo
            thumb={VideoThumb}
            thumbWidth={768}
            thumbHeight={432}
            thumbAlt="Modal video thumbnail"
            video="https://www.youtube.com/watch?v=7h3rLJUMtS4"
            videoWidth={1920}
            videoHeight={1080}
          />
        </div>
      </div>
    </section>
    // <section className="container grid place-items-center gap-10 py-20 md:py-1 lg:grid-cols-2">
    //   <div className="space-y-6 text-center lg:text-start">
    //     <main className="text-5xl font-bold md:text-6xl">
    //       <h1 className="inline">
    //         <span className="flex justify-start">
    //           {/* <Image className="inline" src={"/logo.svg"} height={34} width={150} alt="product logo" /> */}
    //           {/* <h1 className="ml-2 inline text-5xl font-bold leading-none text-gray-700">Telehealth</h1> */}
    //         </span>{" "}
    //         <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] bg-clip-text text-transparent">Demo Health</span>
    //       </h1>{" "}
    //     </main>

    //     <p className="mx-auto text-xl text-muted-foreground md:w-10/12 lg:mx-0">
    //       Welcome to your healthcare corner, where we&apos;ll treat with you respect and handle you with care
    //     </p>

    //     <div className="space-y-4 md:space-x-4 md:space-y-0">
    //       <Button variant={"outline"} onClick={() => void signIn()}>
    //         Sign in
    //       </Button>
    //       {/* <a
    //         href="https://github.com/zoom/"
    //         target="_blank"
    //         className={`w-full md:w-1/3 ${buttonVariants({
    //           variant: "outline",
    //         })}`}
    //       >
    //         Github Repository
    //         <GitHubLogoIcon className="ml-2 h-5 w-5" />
    //       </a> */}
    //     </div>
    //   </div>

    //   {/* // Please read the
    //   // <a href="https://github.com/zoom/" target="_blank">
    //   //   <Button variant={"link"} className="p-1">
    //   //     Disclaimer.
    //   //   </Button> */}

    //   <div className="z-10">
    //     <div className="relative hidden h-[500px] w-[700px] flex-row flex-wrap gap-8 lg:flex">
    //       <Card className="absolute left-[50px] top-[150px] w-72  shadow-black/10 drop-shadow-xl dark:shadow-white/10">
    //         <CardHeader className="flex flex-row items-center gap-4 pb-2">
    //           <Avatar>
    //             <AvatarImage alt="" src="" />
    //             <AvatarFallback>DV</AvatarFallback>
    //           </Avatar>

    //           <div className="flex flex-col">
    //             <CardTitle className="text-lg">Demo Health Staff</CardTitle>
    //             <CardDescription>Staff and Care Team</CardDescription>
    //           </div>
    //         </CardHeader>
    //         <CardContent className="text-center">Learn more about the trained professionals providing you care</CardContent>
    //       </Card>

    //       <Card className="absolute right-[50px] top-[150px] w-72  shadow-black/10 drop-shadow-xl dark:shadow-white/10">
    //         <CardHeader className="flex flex-row items-center gap-4 pb-2">
    //           <Avatar>
    //             <AvatarImage alt="" src="" />
    //             <AvatarFallback>PV</AvatarFallback>
    //           </Avatar>

    //           <div className="flex flex-col">
    //             <CardTitle className="text-lg">Patient Experience</CardTitle>
    //             <CardDescription>Your care matters</CardDescription>
    //           </div>
    //         </CardHeader>
    //         <CardContent className="text-center">Learn more about what your care process looks like when being seen by Demo Health</CardContent>
    //       </Card>
    //     </div>
    //   </div>
    //   <div className="shadow"></div>
    // </section>
  );
};

export default LandingPage;
