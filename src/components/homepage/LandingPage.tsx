import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { Button, buttonVariants } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import ModalVideo from "./modal-video";
import VideoThumb from './images/ZoomDevelopers.png'

const LandingPage = () => {
  const router = useRouter();

  return (
    <section className="relative">

    {/* Illustration behind hero content */}
    <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 pointer-events-none -z-1" aria-hidden="true">
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

    <div className="max-w-6xl mx-auto px-4 sm:px-6">

      {/* Hero content */}
      <div className="pt-32 pb-12 md:pt-40 md:pb-20">

        {/* Section header */}
        <div className="text-center pb-12 md:pb-16">
          <h1 className="text-5xl md:text-5xl font-extrabold leading-tighter tracking-tighter mb-4" data-aos="zoom-y-out">Video SDK <br/> <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">Telehealth Starter-Kit</span></h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-gray-600 mb-8" data-aos="zoom-y-out" data-aos-delay="150">A full-stack, open-source template for creating virtual healthcare applications. Designed to be fully customizable and meet the needs of a healthcare audience.</p>
            <div className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center" data-aos="zoom-y-out" data-aos-delay="300">
              <Button className='text-white bg-blue-600 hover:bg-blue-700 w-full mb-4 sm:w-auto sm:mb-0' variant={"outline"} onClick={() => void signIn()}>
              Sign in
              </Button>
              <a
                href="https://github.com/zoom/"
                target="_blank"
                className={`w-full md:w-1/3 ${buttonVariants({
                            variant: "outline",
                          })} text-white bg-gray-900 hover:bg-gray-800 w-full sm:w-auto sm:ml-4`} 
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
          videoHeight={1080} />

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
