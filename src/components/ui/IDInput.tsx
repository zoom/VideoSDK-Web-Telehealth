import { type User } from "@prisma/client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/utils/api";

const IDInput = ({
  ID,
  IDs,
  setID,
  setIDs,
}: {
  ID: string;
  IDs: string[];
  setID: React.Dispatch<React.SetStateAction<string>>;
  setIDs: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const getUser = api.user.getUserById.useMutation();
  const [IDError, setIDError] = useState<string>("");
  const [user, setUser] = useState<User>();
  return (
    <>
      <Label htmlFor="ID" className="mb-2">
        Attendee ID
      </Label>
      {IDs.map((id, index) => (
        <p className="my-2" key={index}>
          - {id}
          <div>{user?.name}</div>
        </p>
      ))}
      <div>
        <p className="mb-2 text-sm text-red-800">{IDError}</p>
      </div>
      {/* only allow one patient for now */}
      {IDs.length < 1 ? (
        <div className="flex">
          <Input
            id="ID"
            className="mb-4 mr-2"
            value={ID}
            onChange={(e) => {
              setID(e.target.value);
            }}
          />
          <Button
            className="mb-4 ml-2"
            onClick={async () => {
              if (!ID) {
                return;
              }
              setIDError("");
              if (IDs.includes(ID)) {
                setIDError("ID already added");
                return;
              }
              let user;
              try {
                user = await getUser.mutateAsync({ id: ID });
              } catch (e) {
                setIDError("User not found");
              }
              if (user) {
                setUser(user);
                setIDs([...IDs, ID]);
                setID("");
              }
            }}
          >
            Add
          </Button>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default IDInput;
