"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";

const stepsOrder = ["province", "partner", "children", "create-account"];

const questionsConfig = {
  province: {
    one_liner: "Let's start with an easy one.",
    question: "Where do you currently live?",
    options: [
      "Alberta",
      "British Columbia",
      "Manitoba",
      "New Brunswick",
      "Newfoundland and Labrador",
      "Nova Scotia",
      "Ontario",
      "Prince Edward Island",
    ].map((label) => ({
      value: label,
      label: "",
      nextStep: "partner",
    })),
  },
  partner: {
    question: "Do you have a spouse or partner?",
    options: [
      {
        value: "Yes",
        label: "I'm married, engaged, or in a common-law relationship",
        nextStep: "children",
      },
      {
        value: "No",
        label: "I'm single, separated, divorced, or widowed",
        nextStep: "children",
      },
    ],
  },
  children: {
    question: "Do you have any children?",
    options: [
      { value: "Yes", label: "", nextStep: "create-account" },
      { value: "No", label: "", nextStep: "create-account" },
    ],
  },
  "create-account": {
    question: "account",
    options: [],
  },
};

const variants = {
  enter: (direction) => ({
    x: direction === "forward" ? 300 : -300,
    opacity: 0,
    position: "absolute",
  }),
  center: {
    x: 0,
    opacity: 1,
    position: "relative",
  },
  exit: (direction) => ({
    x: direction === "forward" ? -300 : 300,
    opacity: 0,
    position: "absolute",
  }),
};

export default function Questionnaire() {
  const params = useParams();
  const { step } = params;
  const router = useRouter();

  const [direction, setDirection] = useState("forward");
  const [stepKey, setStepKey] = useState(0);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    const visitedSteps = JSON.parse(
      sessionStorage.getItem("visitedSteps") || "[]"
    );
    const stepIndex = stepsOrder.indexOf(step);
    const prevStep = stepsOrder[stepIndex - 1];

    if (step !== "province" && !visitedSteps.includes(prevStep)) {
      router.replace("/questionnaire/province");
    }
  }, [step, router]);

  const currentStep = questionsConfig[step];
  if (!currentStep) return <p>Invalid Step</p>;
  useEffect(() => {
    if (currentStep.question === "account") {
      router.replace("/pricing");
    }
  }, [currentStep.question, router]);

  const handleNext = (nextStep) => {
    setDirection("forward");
    setStepKey((prev) => prev + 1);

    const visited = JSON.parse(sessionStorage.getItem("visitedSteps") || "[]");
    if (!visited.includes(step)) {
      visited.push(step);
      sessionStorage.setItem("visitedSteps", JSON.stringify(visited));
    }

    if (nextStep) {
      router.push(`/questionnaire/${nextStep}`);
    }
  };

  const handleBack = () => {
    setDirection("backward");
    setStepKey((prev) => prev - 1);
    router.back();
  };
  // if (currentStep.question === "account" && !user) {
  //   return (
  //     <div className={AccountStyle.createAccountWrapper}>
  //       <h2 className={AccountStyle.createAccountHeading}>
  //         It's time to crevnvnate an account.
  //       </h2>
  //       <p className={AccountStyle.createAccountDescription}>
  //         You can log back in and finish anytime. Handy.
  //       </p>
  //       <div className={AccountStyle.createWithGoogle}>
  //         <button className={AccountStyle.googleBtn}>
  //           <img src="/images/google-icon.svg" alt="Google Icon" />
  //           Continue with Google
  //         </button>
  //       </div>
  //       <div className={AccountStyle.logoSelection}>or</div>
  //       <div className={AccountStyle.formContainer}>
  //         <form action="">
  //           <FormGroup className={`${AccountStyle.formFloating} mb-3`}>
  //             <Input
  //               type="Email"
  //               id="name"
  //               name="email"
  //               placeholder=" "
  //               required
  //             />
  //             <Label for="name">Email Address</Label>
  //           </FormGroup>

  //           <FormGroup className={`${AccountStyle.formFloating} mb-3`}>
  //             <Input
  //               type="password"
  //               id="name"
  //               name="Password"
  //               placeholder=" "
  //               required
  //             />
  //             <Label for="name">Password</Label>
  //             <small>Must be at least 8 characters</small>
  //           </FormGroup>
  //         </form>
  //       </div>
  //       <p className="text-center mb-0">
  //         <button className={AccountStyle.btnContinue}>Continue →</button>
  //       </p>
  //       <p className="text-center mb-0">
  //         <button
  //           className={AccountStyle.backBtn}
  //           onClick={() => router.back()}
  //         >
  //           <FaLongArrowAltLeft className="me-2" />
  //           Back
  //         </button>
  //       </p>

  //       <div className="d-flex flex-column justify-content-center align-items-center mb-4">
  //         <div className="ratingStars">
  //           <RiStarSFill />
  //           <RiStarSFill />
  //           <RiStarSFill />
  //           <RiStarSFill />
  //           <RiStarSFill />
  //         </div>
  //         <p className={AccountStyle.ratingGoogle}>Rated 4.8 stars on Google</p>
  //       </div>

  //       <div className={AccountStyle.goodWill}>
  //         <p className="d-flex align-items-center gap-2 mb-2">
  //           <PiLockFill />
  //           <span>Encrypted Data Storage</span>
  //         </p>
  //         <p className="d-flex align-items-center gap-2 mb-2">
  //           <PiShieldCheck />
  //           <span>Safe Checkout</span>
  //         </p>
  //       </div>
  //       <p className={AccountStyle.goodWillDescription}>
  //         All data is transferred using TLS1.2, encrypted using RSA/SHA-256, and
  //         stored in Canadian data centres.
  //       </p>

  //       {/* Right side – FAQ */}
  //       <div className={AccountStyle.faq}>
  //         <h3>Info & Common Questions</h3>
  //         <div className={AccountStyle.innerFaq}>
  //           <ul>
  //             <li>Why do I need an account?</li>
  //             <li>Will you send me emails?</li>
  //             <li>Is my data secure?</li>
  //             <li>What if I change my mind?</li>
  //             <li>Will my spouse and I share an Epilogue account?</li>
  //           </ul>
  //           <div className={AccountStyle.footer}>
  //             <strong>We're here to help</strong>
  //             <p>Contact our team via chat or call (289) 678-1689</p>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div
      className="main-wrapper"
      style={{ position: "relative", minHeight: "100vh" }}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={stepKey}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="question-wrapper"
        >
          <div className="title-wrapper">
            {currentStep.one_liner && (
              <h4 className="question-title">{currentStep.one_liner}</h4>
            )}
            <h3 className="question-title">{currentStep.question}</h3>
          </div>

          <div className="q-flex-wrapper d-flex">
            {currentStep.options.length > 0 ? (
              currentStep.options.map(({ value, label, nextStep }) => (
                <div key={value}>
                  <button
                    onClick={() => handleNext(nextStep || null)}
                    className="question-tiles"
                  >
                    <span className="question-value">{value}</span>
                    <span className="question-label">{label}</span>
                  </button>
                </div>
              ))
            ) : (
              <div>
                <button onClick={() => router.push("/")}>Go to Home</button>
              </div>
            )}
          </div>
          <div style={{ width: "100%" }} className="d-flex">
            {step !== "province" && (
              <div>
                <button onClick={handleBack} className="back-button">
                  <svg
                    className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-q7mezt"
                    focusable="false"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    data-testid="ArrowBackIcon"
                  >
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"></path>
                  </svg>
                  Back
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
