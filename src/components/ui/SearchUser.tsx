import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Input } from "./input";
import { Label } from "./label";
import { XIcon } from "lucide-react";
import { useDebouncedCallback } from "~/lib/utils";
import { type UserWithoutEmail } from "~/server/api/routers/user";

function Search(props: { user: UserWithoutEmail | undefined; setUser: React.Dispatch<React.SetStateAction<UserWithoutEmail | undefined>> }) {
  const { user, setUser } = props;
  const router = useRouter();
  const name = stringOrNull(router.query.name)?.trim();
  const query = api.user.searchUserByName.useQuery({ name: name ?? "" }, { enabled: !!name, initialData: user ? [user] : undefined });

  const handleInput = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    void router.push({ query: { ...router.query, name: e.target.value } }, undefined, { shallow: true, scroll: false });
  }, 300);

  return (
    <>
      <Label htmlFor="user" className="mb-2">
        User
      </Label>
      {user ? (
        <div className="mb-4 flex w-full flex-1 flex-row justify-between">
          <p>{user.name}</p>
          <XIcon
            strokeWidth={2}
            className="h-4 w-4 cursor-pointer text-red-500"
            onClick={async () => {
              await router.push({ query: { ...router.query, name: undefined, inviteID: undefined } }, undefined, { shallow: true, scroll: false });
              setUser(undefined);
            }}
          />
        </div>
      ) : (
        <div className="relative flex w-full flex-1 flex-col">
          <Input type="search" name="q" id="user" defaultValue={name} onChange={(e) => handleInput(e)} className="mb-2" placeholder="Search by name" />
          <div className="flex flex-col gap-2 ">
            {query.isFetching ? <div className="flex h-full items-center justify-center">Loading...</div> : <></>}
            {query.data ? (
              query.data.length > 0 ? (
                query.data.map((user) => (
                  <div key={user.id} className="flex items-center gap-2 rounded-md p-2 hover:bg-slate-100" onClick={() => setUser(user)}>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{user.name}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-full items-center justify-center">No results</div>
              )
            ) : (
              <></>
            )}
          </div>
        </div>
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
