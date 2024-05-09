import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Input } from "./input";
import { Label } from "./label";
import { type User } from "@prisma/client";
import { Delete } from "lucide-react";

function Search(props: { user: User | undefined; setUser: React.Dispatch<React.SetStateAction<User | undefined>> }) {
  const { user, setUser } = props;
  const router = useRouter();
  const q = stringOrNull(router.query.q)?.trim();
  const query = api.user.searchUserByName.useQuery(
    { name: q ?? "" },
    {
      enabled: Boolean(q),
    }
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // debounce this using something like a `useDebouncedCallback`-hook
    void router.push(
      {
        query: {
          ...router.query,
          q: e.target.value,
        },
      },
      undefined,
      {
        shallow: true,
        scroll: false,
      }
    );
  };
  return (
    <>
      <Label htmlFor="user" className="mb-2">
        User
      </Label>
      {user ? (
        <div className="flex w-full flex-1 flex-row">
          <p>{user.name}</p>
          <Delete onClick={() => setUser(undefined)} />
        </div>
      ) : (
        <>
          <Input type="search" name="q" id="user" defaultValue={q} onChange={(e) => handleInput(e)} />
          {query.data?.map((user) => (
            <div key={user.id} onClick={() => setUser(user)}>
              <p>{user.name}</p>
            </div>
          ))}
        </>
      )}
    </>
  );
}

function stringOrNull(str: unknown) {
  if (typeof str === "string") {
    return str;
  }
  return null;
}

export default Search;
