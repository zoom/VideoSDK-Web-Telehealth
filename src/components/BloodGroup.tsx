import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export function BloodGroupSelect({ value, setValue }: { value: string; setValue: React.Dispatch<React.SetStateAction<string>> }) {
  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger className="mb-4">
        <SelectValue placeholder="Blood Group" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="A+">A+</SelectItem>
          <SelectItem value="A-">A-</SelectItem>
          <SelectItem value="B+">B+</SelectItem>
          <SelectItem value="B-">B-</SelectItem>
          <SelectItem value="AB+">AB+</SelectItem>
          <SelectItem value="AB-">AB-</SelectItem>
          <SelectItem value="O+">O+</SelectItem>
          <SelectItem value="O-">O-</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
