import FAQAccordion from "@/app/shared/FAQ";
import {
  Banner,
  CharityPartner,
  Collaboration,
  Mission,
  Pricing,
  Promise,
  Security,
  Support,
  Work,
} from "@/app/shared/HomeComponent";
import QuestionForm from "@/app/shared/Questions";
// import PricingCardsToggle from "./pricing/page";
// import Testimonials from "@/app/shared/HomeComponent";
import TestimonialSlider from "@/app/shared/Testimonials";
export default function OnlineWills() {
  return (
    <>
      <Banner />
      <Work />
      <QuestionForm />
      <Pricing />

      <TestimonialSlider />
      <Promise />
      <Mission />
      <Collaboration />
      <Security />
      <Support />
      <CharityPartner />
      {/* <BlogSection /> */}
      {/* <WillDelivery /> */}
      <FAQAccordion />
      {/* <Testimonials /> */}
      {/* <FAQS /> */}
    </>
  );
}
