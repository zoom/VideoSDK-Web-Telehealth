import { useRouter } from "next/router";
import { api } from "~/utils/api";

const Uploaded = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { data, isLoading } = api.S3.getUploadList.useQuery({ userId: userId as string });
  return (
    <div>
      <h1>Uploaded documents</h1>
      {isLoading ? <p>Loading...</p> : <ul>{data?.map((f, i) => <li key={i}>{f}</li>)}</ul>}
    </div>
  );
};

export default Uploaded;
