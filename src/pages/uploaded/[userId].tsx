import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";

const Uploaded = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { data, isLoading, error, isError } = api.S3.getUploadList.useQuery({ userId: userId as string });
  const { mutateAsync } = api.S3.getDownloadLink.useMutation();

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center overflow-y-scroll bg-gray-100">
      <h1 className="my-10 flex text-3xl font-bold leading-none text-gray-700">Uploaded documents</h1>
      <div className="my-10 flex flex-col justify-center ">
        {isLoading ? (
          <Card className="flex w-96 flex-col justify-center self-center p-8">
            <Skeleton className="m-1 h-8 w-80" />
            <Skeleton className="m-1 h-8 w-80" />
            <Skeleton className="m-1 h-12 w-80" />
          </Card>
        ) : (
          data?.map((e) => (
            <Card className="m-2 flex w-96 flex-col justify-center self-center p-8" key={e.id}>
              <div className="flex flex-col text-center">
                <p className="text-lg font-bold">{e.name.split("_")[2]}</p>
                <p className="my-4">{new Date(e.createdAt).toLocaleString().slice(0, -3)}</p>
                <Button
                  onClick={async () => {
                    const link = await mutateAsync({ filename: e.name });
                    window.open(link, "_blank");
                  }}
                >
                  Download
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Uploaded;
