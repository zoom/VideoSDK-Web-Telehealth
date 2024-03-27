import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/utils/api";

const EmailInput = ({
  email,
  emails,
  setEmail,
  setEmails,
}: {
  email: string;
  emails: string[];
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setEmails: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const getUser = api.user.getUserByEmail.useMutation();
  const [emailError, setEmailError] = useState<string>("");
  return (
    <>
      <Label htmlFor="email" className="mb-2">
        Emails
      </Label>
      {emails.map((email, index) => (
        <p className="my-2" key={index}>
          - {email}
        </p>
      ))}
      <div>
        <p className="mb-2 text-sm text-red-800">{emailError}</p>
      </div>
      {/* only allow one patient for now */}
      {emails.length < 1 ? (
        <div className="flex">
          <Input
            id="email"
            className="mb-4 mr-2"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <Button
            className="mb-4 ml-2"
            onClick={async () => {
              if (!email) {
                return;
              }
              setEmailError("");
              if (emails.includes(email)) {
                setEmailError("Email already added");
                return;
              }
              let user;
              try {
                user = await getUser.mutateAsync({ email });
              } catch (e) {
                setEmailError("User not found");
              }
              if (user) {
                setEmails([...emails, email]);
                setEmail("");
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

export default EmailInput;
