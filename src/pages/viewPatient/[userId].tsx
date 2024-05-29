import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Footer from "~/components/ui/footer";
import Header from "~/components/ui/header";
import { Skeleton } from "~/components/ui/skeleton";
import { File, Download } from "lucide-react";
import { api } from "~/utils/api";

const Uploaded = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { error, isError } = api.S3.getUploadList.useQuery({ userId: userId as string }, { retry: 0 });

  if (isError) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <Card className="flex w-96 flex-col justify-center self-center p-8">Error: {error?.message}</Card>
        <Link href="/">
          <Button variant={"link"} className="mx-auto flex">
            back
          </Button>
        </Link>
      </div>
    );
  }
  return (
    <>
      <Header />
      <div className="flex h-screen w-screen flex-col items-center overflow-y-scroll bg-gray-100">
        <div className="mb-4 mt-8 w-full max-w-xl">
          <h1 className="mb-2 mt-8 flex text-3xl font-bold leading-none text-gray-700 ">Patient details</h1>
        </div>
        <ViewPatient userId={userId as string} />
        <Link href="/">
          <Button variant={"link"} className="mx-auto flex">
            back
          </Button>
        </Link>
      </div>
      <Footer />
    </>
  );
};

const ViewPatient = (props: { userId: string }) => {
  const { userId } = props;
  const { data: patientData, isLoading: patientLoading } = api.user.getPatientDetails.useQuery({ userId: userId });
  const { data, isLoading } = api.S3.getUploadList.useQuery({ userId: userId }, { retry: 0 });
  const { mutateAsync } = api.S3.getDownloadLink.useMutation();

  return (
    <>
      {patientLoading ? (
        <Card className="flex w-96 flex-col justify-center self-center p-8">
          <Skeleton className="m-1 h-8 w-80 animate-pulse" />
          <Skeleton className="m-1 h-4 w-80 animate-pulse" />
          <Skeleton className="m-1 h-4 w-80 animate-pulse" />
          <Skeleton className="m-1 h-4 w-80 animate-pulse" />
          <Skeleton className="m-1 h-4 w-80 animate-pulse" />
          <Skeleton className="m-1 h-4 w-80 animate-pulse" />
        </Card>
      ) : (
        <>
          <Card className="flex w-full max-w-xl items-center gap-4 p-8">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-600">
              <svg className="absolute -left-1 h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <p className="m-0 p-0 text-xl font-bold">{patientData?.User?.name}</p>
          </Card>
          <Card className="m-2 flex w-full max-w-xl flex-col justify-center self-center p-8">
            <p>
              Date of Birth: <span className="font-bold">{patientData?.DOB?.toLocaleDateString()}</span>
            </p>
            <p>
              Allergies: <span className="font-bold">{patientData?.allergies}</span>
            </p>
            <p>
              Blood type: <span className="font-bold">{patientData?.bloodType}</span>
            </p>
            <p>
              Weight: <span className="font-bold">{patientData?.weight}</span>
            </p>
            <p>
              Height: <span className="font-bold">{patientData?.height}</span>
            </p>
          </Card>
        </>
      )}
      {/* TODO: add patient's most recent appointments here */}
      <div>{isLoading ? <div></div> : <div></div>}</div>
      <div className="my-10 flex w-full max-w-xl flex-col justify-center">
        <p className="mb-2 flex text-center text-xl font-bold leading-none text-gray-700">Files</p>
        {isLoading ? (
          <Card className="flex w-96 flex-col justify-center self-center p-8">
            <Skeleton className="my-2 h-4 w-80 animate-pulse" />
            <Skeleton className="my-2 h-4 w-80 animate-pulse" />
            <Skeleton className="my-2 h-8 w-80 animate-pulse" />
          </Card>
        ) : data?.length === 0 ? (
          <Card className="my-2 flex h-36 w-full max-w-xl flex-col justify-center self-center p-6">
            <p className="text-center text-lg">No files uploaded</p>
          </Card>
        ) : (
          data?.map((e) => (
            <Card className="my-2 flex w-full flex-col self-center p-6" key={e.id}>
              <div className="flex flex-row justify-between">
                <div className="align-center flex flex-row gap-2">
                  <File size={24} />
                  <div>
                    <p className="text-md font-bold">{e.name.split("_")[2]}</p>
                    <p className="text-sm text-gray-700">Uploaded on {new Date(e.createdAt).toLocaleString().slice(0, -3)}</p>
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    const link = await mutateAsync({ filename: e.name });
                    window.open(link, "_blank");
                  }}
                >
                  <Download />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
};
export { ViewPatient };
export default Uploaded;
