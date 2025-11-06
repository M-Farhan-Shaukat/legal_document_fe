import { Work } from "@/app/shared/HomeComponent";
import Question from "./question";
import Recognition from "./recognition";
import Started from "./started";
import Story from "./story";
import Vision from "./vision";
import Planning from "./planning";
import './about.scss'

export default function AboutUs() {
  return (
    <>
      <Story />
      <Vision />
      <Started />
      <Work />
      <Planning />
      <Recognition />
      <Question />
    </>
  );
}
