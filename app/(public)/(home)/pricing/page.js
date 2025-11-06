import { Pricing, WillDelivery } from "@/app/shared/HomeComponent";
import TestimonialScroller from "@/app/shared/Testimonials";
import Incapacity from "./incapacity";
import Update from "./update";
import JointWill from "./jointWill";
import "./PricingPage.scss";
export default function PricingCardsToggle() {
  return (
    <>
      <div className="pricing-page-container">
        <Pricing />
        <TestimonialScroller />
        <Incapacity />
        <Update />
        <JointWill />
        <WillDelivery />
      </div>
    </>
  );
}
