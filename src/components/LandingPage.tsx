import { signIn } from "next-auth/react";
import Image from "next/image";
import { buttonVariants } from "~/components/ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import InfoPanel from "./InfoPanel";

const LandingPage = () => {
  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">
          <span className="flex justify-start">
            <Image className="inline" src={"/logo.svg"} height={34} width={150} alt="product logo" />
            <h1 className="ml-2 inline text-5xl font-bold leading-none text-gray-700">Telehealth</h1>
          </span>{" "}
          <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
              Starter-Kit
            </span>
          </h1>{" "}
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
        This is a sample app for using the Zoom Video SDK for TeleHealth use-case
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
        <Button variant={"outline"} onClick={() => void signIn()}>
            Sign in
          </Button>
          <a
            href="https://github.com/zoom/" target="_blank"
            className={`w-full md:w-1/3 ${buttonVariants({
              variant: "outline",
            })}`}
          >
            Github Repository
            <GitHubLogoIcon className="ml-2 w-5 h-5" />
          </a>
        </div>
      </div>

      {/* // Please read the
      // <a href="https://github.com/zoom/" target="_blank">
      //   <Button variant={"link"} className="p-1">
      //     Disclaimer.
      //   </Button> */}

      {/* Hero cards sections */}
      <div className="z-10">
        <div className="hidden lg:flex flex-row flex-wrap gap-8 relative w-[700px] h-[500px]">
          <Card className="absolute top-[150px] left-[50px] w-72  drop-shadow-xl shadow-black/10 dark:shadow-white/10">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                  <AvatarImage
                    alt=""
                    src="https://github.com/shadcn.png"
                  />
                  <AvatarFallback>SH</AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <CardTitle className="text-lg">Doctor</CardTitle>
                  <CardDescription>Doctor Experience</CardDescription>
                </div>
              </CardHeader>
              <CardContent>Walk through as a Doctor</CardContent>
            </Card>

          <Card className="absolute top-[150px] right-[50px] w-72  drop-shadow-xl shadow-black/10 dark:shadow-white/10">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar>
                <AvatarImage
                  alt=""
                  src="https://github.com/shadcn.png"
                />
                <AvatarFallback>SH</AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <CardTitle className="text-lg">Patience</CardTitle>
                <CardDescription>Patient Experience</CardDescription>
              </div>
            </CardHeader>
            <CardContent>Walk through as a Patient</CardContent>
          </Card>
        </div>
      </div>
      <div className="shadow"></div>
    </section>
  )
}

export default LandingPage;