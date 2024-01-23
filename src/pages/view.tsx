import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/utils/api";

export default function Home() {
  const { status } = useSession();
  const { data, isLoading } = api.post.getLatest.useQuery();
  const router = useRouter();
  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (status === "unauthenticated") {
    void router.replace("/");
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center bg-gray-100">
      <h1 className="my-10 flex text-center text-5xl font-bold leading-none text-gray-700">
        Posts
      </h1>
      {isLoading ? (
        <p>Fetching posts...</p>
      ) : (
        <div className="flex flex-wrap justify-center">
          {data?.map((post) => (
            <Card
              key={post.id}
              className="m-4 flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow-lg"
            >
              <CardTitle>{post.title}</CardTitle>
              <CardContent>{post.content}</CardContent>
              <p>{post.name}</p>
              <p>{post.createdAt.toLocaleDateString()}</p>
            </Card>
          ))}
        </div>
      )}
      <CreatePost />
      <Link href="/">
        <Button variant={"link"}>back</Button>
      </Link>
    </div>
  );
}

const CreatePost = () => {
  const createPost = api.post.create.useMutation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { refetch } = api.post.getLatest.useQuery();

  return (
    <>
      <h2 className="my-10 flex text-center text-3xl font-bold leading-none text-gray-700">
        Create
      </h2>
      <p>{createPost.status !== "idle" ? createPost.status : ""}</p>
      <form
        className="flex w-1/2 flex-col"
        onSubmit={async (e) => {
          e.preventDefault();
          await createPost.mutateAsync({ title, content });
          await refetch();
          setTitle("");
          setContent("");
        }}
      >
        <Label htmlFor="title" className="mb-2">
          Title
        </Label>
        <Input
          id="title"
          className="mb-4"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
        <Label htmlFor="content" className="mb-2">
          Content
        </Label>
        <Input
          id="content"
          className="mb-4"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
        />
        <Button>Create</Button>
      </form>
    </>
  );
};
