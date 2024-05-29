import { signIn } from "next-auth/react";
import { buttonVariants } from "~/components/ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

const Demopage = () => {
  return (
    <section className="container grid place-items-center gap-10 py-20 md:py-1 lg:grid-cols-2">
      <div className="space-y-6 text-center lg:text-start">
        <main className="text-5xl font-bold md:text-6xl">
          <h1 className="inline">
            <span className="flex justify-start">{/* <h1 className="ml-2 inline text-5xl font-bold leading-none text-gray-700">Demo Health</h1> */}</span>{" "}
            <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] bg-clip-text text-transparent">Demo Health</span>
          </h1>{" "}
        </main>

        <p className="mx-auto text-xl text-muted-foreground md:w-10/12 lg:mx-0">This is a sample app for using the Zoom Video SDK for TeleHealth use-case</p>

        <div className="space-y-4 md:space-x-4 md:space-y-0">
          <Button variant={"outline"} onClick={() => void signIn()}>
            Sign in
          </Button>
          <a
            href="https://github.com/zoom/"
            target="_blank"
            className={`w-full md:w-1/3 ${buttonVariants({
              variant: "outline",
            })}`}
          >
            Github Repository
            <GitHubLogoIcon className="ml-2 h-5 w-5" />
          </a>
        </div>
      </div>

      {/* // Please read the
      // <a href="https://github.com/zoom/" target="_blank">
      //   <Button variant={"link"} className="p-1">
      //     Disclaimer.
      //   </Button> */}

      <div className="z-10">
        <div className="relative hidden h-[500px] w-[700px] flex-row flex-wrap gap-8 lg:flex">
          <Card className="absolute left-[50px] top-[150px] w-72  shadow-black/10 drop-shadow-xl dark:shadow-white/10">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar>
                <AvatarImage alt="" src="" />
                <AvatarFallback>DV</AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <CardTitle className="text-lg">Doctor</CardTitle>
                <CardDescription>Doctor Experience</CardDescription>
              </div>
            </CardHeader>
            <CardContent>Walk through as a Doctor</CardContent>
          </Card>

          <Card className="absolute right-[50px] top-[150px] w-72  shadow-black/10 drop-shadow-xl dark:shadow-white/10">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar>
                <AvatarImage alt="" src="" />
                <AvatarFallback>PV</AvatarFallback>
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
  );
};

export default Demopage;
