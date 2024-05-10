import dynamic from "next/dynamic";

const DynamicHome = dynamic(() => import("../../components/videocall/VideocallContainer"), { ssr: false });

const ExportPage = () => {
  return <DynamicHome />;
};

export default ExportPage;
