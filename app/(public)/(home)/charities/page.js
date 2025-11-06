import { Mission } from "@/app/shared/HomeComponent";
import Slide from "@/app/shared/HomeComponent/Slide";
import PlannedGiving from "./planned";
import CharityPartners from "./charityPartner";
import TopofMind from "./topOfMind";
import Dashboard from "./dashboard";
import Benefits from "./benefits";


export default function ForCharities() {
  return (
    <>
      <PlannedGiving />
      <CharityPartners />
      <TopofMind />
      <Dashboard />
      <Benefits />
      <Slide />
      <Mission />
    </>
  );

}
