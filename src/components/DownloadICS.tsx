import { Button, type ButtonProps } from "./ui/button";
import { type EventAttributes, createEvent } from "ics";

const DownloadICSButton = ({ event: eventData, className, variant }: { event: EventAttributes; className?: string; variant?: ButtonProps["variant"] }) => {
  const handleDownload = async () => {
    const filename = "Event.ics";
    const file = await new Promise<File>((resolve, reject) => {
      createEvent(eventData, (error, value) => {
        if (error) {
          reject(error);
        }
        resolve(new File([value], filename, { type: "text/calendar" }));
      });
    });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };
  return (
    <Button onClick={() => handleDownload()} variant={variant} className={className}>
      Add to calendar
    </Button>
  );
};

export default DownloadICSButton;
