import { type Dispatch, type SetStateAction, useEffect, useRef } from "react";
import { Card } from "../ui/card";

const Transcipt = (props: { transcriptionSubtitle: TranscriptEleType }) => {
  const { transcriptionSubtitle } = props;
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.scrollTop = cardRef.current.scrollHeight;
    }
  }, [transcriptionSubtitle]);

  return Object.keys(transcriptionSubtitle).length > 0 ? (
    <Card className="bottom-20 mt-8 flex max-h-[70vh] max-w-[30rem] flex-col self-center overflow-y-scroll rounded-sm bg-white p-4 shadow-sm" ref={cardRef}>
      {Object.keys(transcriptionSubtitle).map((key) => (
        <p
          key={key}
          className="py-1 text-sm text-gray-800"
          style={
            transcriptionSubtitle[key]?.isSelf
              ? {
                  alignSelf: "flex-end",
                  color: "rgb(30 64 175)",
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
export type setTranscriptionType = Dispatch<SetStateAction<TranscriptEleType>>;
export default Transcipt;
