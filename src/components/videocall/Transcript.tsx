import { Card } from "../ui/card";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";

const Transcipt = (props: { transcriptionSubtitle: TranscriptEleType }) => {
  const { transcriptionSubtitle } = props;
  return Object.keys(transcriptionSubtitle).length > 0 ? (
    <Card className="mt-8 flex max-h-[200px] flex-col self-center overflow-y-scroll rounded-sm bg-white p-4 shadow-sm">
      {Object.keys(transcriptionSubtitle).map((key) => (
        <p
          key={key}
          className="text-sm text-gray-600"
          style={
            transcriptionSubtitle[key]?.isSelf
              ? {
                  alignSelf: "flex-end",
                }
              : {}
          }
        >
          <span className="font-bold">{transcriptionSubtitle[key]?.name}</span>: {transcriptionSubtitle[key]?.text}
        </p>
      ))}
    </Card>
  ) : (
    <></>
  );
};

export type TranscriptEleType = Record<string, { name: string; text: string; isSelf: boolean }>;
export default Transcipt;
