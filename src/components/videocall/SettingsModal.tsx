import { type MutableRefObject, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import ZoomVideo from "@zoom/videosdk";
import type { VideoClient } from "@zoom/videosdk";
import { Settings } from "lucide-react";

const SettingsModal = (props: { client: MutableRefObject<typeof VideoClient> }) => {
  const [cameraList, setCameraList] = useState<device[]>();
  const [micList, setMicList] = useState<device[]>();
  const [speakerList, setSpeakerList] = useState<device[]>();

  const getDevices = async () => {
    const allDevices = await ZoomVideo.getDevices();

    const cameraDevices = allDevices.filter((el) => {
      return el.kind === "videoinput";
    });
    const micDevices = allDevices.filter((el) => {
      return el.kind === "audioinput";
    });
    const speakerDevices = allDevices.filter((el) => {
      return el.kind === "audiooutput";
    });

    return {
      cameras: cameraDevices.map((el) => {
        return { label: el.label, deviceId: el.deviceId };
      }),
      mics: micDevices.map((el) => {
        return { label: el.label, deviceId: el.deviceId };
      }),
      speakers: speakerDevices.map((el) => {
        return { label: el.label, deviceId: el.deviceId };
      }),
    };
  };

  useEffect(() => {
    void getDevices().then((devices) => {
      setCameraList(devices.cameras);
      setMicList(devices.mics);
      setSpeakerList(devices.speakers);
    });
  }, []);

  const setCameraDevice = async (camera: device) => {
    const mediaStream = props.client.current.getMediaStream();
    if (mediaStream) {
      await mediaStream.switchCamera(camera.deviceId);
    }
  };

  const setMicDevice = async (mic: device) => {
    const mediaStream = props.client.current.getMediaStream();
    if (mediaStream) {
      await mediaStream.switchMicrophone(mic.deviceId);
    }
  };

  const setSpeakerDevice = async (speaker: device) => {
    const mediaStream = props.client.current.getMediaStream();
    if (mediaStream) {
      await mediaStream.switchSpeaker(speaker.deviceId);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" title="settings">
          <Settings />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Your Preferred Device</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="t1" className="mt-2 flex w-[28rem] flex-col self-center ">
          <TabsList>
            <TabsTrigger value="t1">Cameras</TabsTrigger>
            <TabsTrigger value="t2">Microphones</TabsTrigger>
            <TabsTrigger value="t3">Speakers</TabsTrigger>
          </TabsList>
          <TabsContent value="t1">
            <RadioGroup className="my-4 flex h-24 flex-row overflow-y-hidden overflow-x-scroll">
              {cameraList?.map((device) => (
                <div className="flex items-center space-x-2" key={device.deviceId}>
                  <RadioGroupItem value={device.label} id={device.deviceId} onClick={() => setCameraDevice(device)} />
                  <Label htmlFor={device.deviceId}>{device.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
          <TabsContent value="t2">
            <RadioGroup className="my-4 flex h-24 flex-row overflow-y-hidden overflow-x-scroll">
              {micList?.map((device) => (
                <div className="flex items-center space-x-2" key={device.deviceId}>
                  <RadioGroupItem value={device.label} id={device.deviceId} onClick={() => setMicDevice(device)} />
                  <Label htmlFor={device.deviceId}>{device.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
          <TabsContent value="t3">
            <RadioGroup className="my-4 flex h-24 flex-row overflow-y-hidden overflow-x-scroll">
              {speakerList?.map((device) => (
                <div className="flex items-center space-x-2" key={device.deviceId}>
                  <RadioGroupItem value={device.label} id={device.deviceId} onClick={() => setSpeakerDevice(device)} />
                  <Label htmlFor={device.deviceId}>{device.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
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

type device = {
  label: string;
  deviceId: string;
};

export default SettingsModal;
