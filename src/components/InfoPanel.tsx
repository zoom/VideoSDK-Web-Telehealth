import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";

interface FeatureProps {
 
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
   
    title: "Differentiated Views",
    description:
      "Experience our telehealth sample application as both a doctor and a patient with seeded test data",
  },
  {
   
    title: "Plug-and-Play",
    description:
      "Customize color schemes, section headers, descriptions, and more as you see fit",
  },
  {
    
    title: "Integrated Zoom Technology",
    description:
      "Gain access to a personlized video call experience with the Video SDK",
  },
  {
   
    title: "Additional Point",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum quas provident cum",
  },
];
const InfoPanel = () => {
  return (
<section
      id="howItWorks"
      className="container text-center py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold ">
        How It{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Works{" "}
        </span>
        Step-by-Step Guide
      </h2>
      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
       Experience The Power Zoom's Video SDK Offers
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ title, description }: FeatureProps) => (
          <Card
            key={title}
            className="bg-muted/50"
          >
            <CardHeader>
              <CardTitle className="grid gap-4 place-items-center">
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default InfoPanel;