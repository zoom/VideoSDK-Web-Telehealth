import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/utils/api";

export default function Home() {
  const createPost = api.post.create.useMutation();
  const { refetch } = api.post.getLatest.useQuery();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  return (
    <div className="flex h-screen w-screen flex-col items-center bg-gray-100">
      <h1 className="my-10 flex text-center text-3xl font-bold leading-none text-gray-700">Create</h1>
      <Card className="mb-8 flex w-96 flex-col flex-wrap justify-center p-4 shadow-lg">
        <form
          className="flex w-full flex-col"
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
          <p className="mb-4 text-center">{createPost.status !== "idle" ? createPost.status : ""}</p>
          <Button>Create</Button>
        </form>
      </Card>
      <Link href="/">
        <Button variant={"link"}>back</Button>
      </Link>
    </div>
  );
}
