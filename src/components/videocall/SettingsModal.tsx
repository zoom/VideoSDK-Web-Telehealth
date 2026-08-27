import { useReducer } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Settings } from "lucide-react";
import { getZoomClient } from "~/lib/zoom-video";
import { useZoomMediaDevices } from "./useZoomMediaDevices";

type SettingsModalProps = {
  currentSpeaker: string;
  setCurrentSpeaker: (deviceId: string) => void;
};

const SettingsModal = ({ currentSpeaker, setCurrentSpeaker }: SettingsModalProps) => {
  const client = getZoomClient();
  const { cameras, microphones, speakers } = useZoomMediaDevices();
  const mediaStream = client.getMediaStream();
  const [, refreshCurrentDevices] = useReducer((revision: number) => revision + 1, 0);

  const tabs = [
    { id: "camera", label: "Cameras", devices: cameras, current: mediaStream?.getActiveCamera() ?? "", select: async (deviceId: string) => { await mediaStream?.switchCamera(deviceId); refreshCurrentDevices(); } },
    { id: "microphone", label: "Microphones", devices: microphones, current: mediaStream?.getActiveMicrophone() ?? "", select: async (deviceId: string) => { await mediaStream?.switchMicrophone(deviceId); refreshCurrentDevices(); } },
    { id: "speaker", label: "Speakers", devices: speakers, current: currentSpeaker, select: async (deviceId: string) => { await mediaStream?.switchSpeaker(deviceId); setCurrentSpeaker(deviceId); } },
  ];

  return (
    <Dialog onOpenChange={(open) => open && refreshCurrentDevices()}>
      <DialogTrigger asChild>
        <Button variant="outline" title="settings">
          <Settings />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Your Preferred Device</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="camera" className="mt-2 flex w-[28rem] flex-col self-center">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <RadioGroup
                className="my-4 flex h-24 flex-row overflow-x-scroll overflow-y-hidden"
                value={tab.current}
                onValueChange={(deviceId) => void tab.select(deviceId)}
              >
                {tab.devices.map((device) => (
                  <div className="flex items-center space-x-2" key={device.deviceId}>
                    <RadioGroupItem value={device.deviceId} id={`${tab.id}-${device.deviceId}`} />
                    <Label htmlFor={`${tab.id}-${device.deviceId}`}>{device.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </TabsContent>
          ))}
        </Tabs>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
