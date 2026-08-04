"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "~/utils/api";
import { Input } from "./input";
import { Label } from "./label";
import { Loader2, UserRound, XIcon } from "lucide-react";
import { Button } from "./button";
import { useDebouncedCallback } from "~/lib/use-debounced-callback";
import { type UserWithoutEmail } from "~/server/api/routers/user";

function Search(props: {
  user: UserWithoutEmail | undefined;
  setUser: React.Dispatch<React.SetStateAction<UserWithoutEmail | undefined>>;
}) {
  const { user, setUser } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const name = searchParams.get("name")?.trim() ?? null;
  const query = api.user.searchUserByName.useQuery(
    { name: name ?? "" },
    { enabled: !!name, initialData: user ? [user] : undefined },
  );

  const updateParams = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v === null) params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const handleInput = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateParams({ name: e.target.value });
    },
    300,
  );

  return (
    <>
      <Label htmlFor="user" className="mb-2 block">
        Attendee
      </Label>
      {user ? (
        <div className="flex w-full items-center gap-3 rounded-xl border border-primary/20 bg-accent/50 p-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-primary">
            <UserRound className="h-4 w-4" />
          </span>
          <p className="flex-1 text-sm font-semibold">{user.name}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Remove attendee"
            onClick={() => {
              updateParams({ name: null, inviteID: null });
              setUser(undefined);
            }}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="relative flex w-full flex-1 flex-col">
          <Input
            type="search"
            name="q"
            id="user"
            defaultValue={name ?? undefined}
            onChange={(e) => handleInput(e)}
            placeholder="Search by name…"
          />
          <div className="flex flex-col gap-2 ">
            {query.isFetching ? (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching…
              </div>
            ) : (
              <></>
            )}
            {query.data ? (
              query.data.length > 0 ? (
                query.data.map((user) => (
                  <button
                    type="button"
                    key={user.id}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-accent"
                    onClick={() => setUser(user)}
                  >
                    <UserRound className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>
                ))
              ) : (
                <div className="py-3 text-center text-sm text-muted-foreground">
                  No matching people
                </div>
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

export default Search;
