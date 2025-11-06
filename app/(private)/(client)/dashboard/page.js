"use client";
import { LocalServer } from "@/app/utils";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { TbLockFilled } from "react-icons/tb";
import { Button, Input, Progress, Spinner } from "reactstrap";
import "./_dashboard.scss";
import { buildPayload } from "@/app/utils/questionpayload";
import { getErrorMessage } from "@/app/utils/helper";
import ToastNotification from "@/app/utils/Toast";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(true);
  const { ToastComponent } = ToastNotification;

  const hasSubmitted = useRef(false);

  const [templates, setTemplates] = useState([]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await LocalServer.get(`/api/document/client/templates`);
      setTemplates(response?.data?.data || []);
    } catch (error) {
      setLoading(false);
      ToastComponent("error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const submitQuestionnaire = async (values, paymentProceed) => {
    if (!paymentProceed || !paymentProceed.template_id) {
      console.error("Invalid payment_proceed data:", paymentProceed);
      ToastComponent("error", "Invalid payment data");
      return;
    }

    const payload = buildPayload(values, paymentProceed);

    try {
      const response = await LocalServer.post(`/api/document/client/document`, {
        ...payload,
        status: "complete",
      });

      localStorage.removeItem("payment_due");
      localStorage.removeItem("payment_proceed");

      if (response.data?.success) {
        //   const payment_link = await LocalServer.post(
        //     "/api/document/client/payment",
        //     {
        //       template_ids: [Number(id)],
        //     }
        //   );

        if (response?.data?.template?.payment_details) {
          window.location.href = response?.data?.template?.payment_details.url;
          localStorage.setItem(
            "payment_token",
            response?.data?.template?.payment_details.system_token
          );
        } else {
          // console.log("No payment details found in response:", response);
          ToastComponent("success", response?.data?.template?.message);

          setStripeLoading(false);
        }
      }
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      stripeLoading && setStripeLoading(false);
      ToastComponent("error", error?.message);
    }
  };

  useEffect(() => {
    const paymentProceed =
      JSON.parse(localStorage.getItem("payment_proceed") || "{}") || false;
    const paymentDue = localStorage.getItem("payment_due") || false;
    if (
      !hasSubmitted.current &&
      paymentDue &&
      paymentProceed &&
      // paymentProceed !== false &&
      paymentProceed.template_id
    ) {
      hasSubmitted.current = true;
      setStripeLoading(true);
      const values = localStorage.getItem(
        `questionnaire_${paymentProceed.template_id}`
      );
      submitQuestionnaire(JSON.parse(values), paymentProceed);
    } else {
      setStripeLoading(false);
    }
  }, []);

  const referralLink = "https://forma.seebiz.com/";

  return stripeLoading ? (
    <div style={{ textAlign: "center", marginTop: "20%" }}>
      <Spinner size="15px" style={{ width: "5rem", height: "5rem" }} />
    </div>
  ) : (
    <div className="client_dashboard">
      <div className="dashboard_container">
        <div className="dashboard_flexBox">
          <div className="dashboard_content">
            <h2 className="heading">Good morning.</h2>
            <p className="description">
              There are still a few more steps before you're finished.
            </p>
            <Progress
              value={47}
              color="dark"
              className="dashboard_progress_bar"
            />
            <p className="mb-0 text-center">
              <Button
                color="warning"
                onClick={() => router.push("/document/view")}
                className="questionnaire_btn mb-40">
                Continue Questionnaire <FaArrowRight />
              </Button>
            </p>
            <div className="client_dashboard_cards">
              <div
                className="dashboard_card"
                onClick={() => router.push("/document/view")}>
                <div className="dashboard_card_body">
                  <h3 className="generic_heading_style">My Estate Plan</h3>
                  <p className="generic_subheading_style">
                    Where the important stuff lives
                  </p>
                </div>
              </div>
              <div className="dashboard_card">
                <div className="dashboard_card_body">
                  <h3 className="generic_heading_style">My Summary</h3>
                  <p className="generic_subheading_style">
                    Review all of your answers here
                  </p>
                </div>
              </div>
            </div>
            <div className="custom_referral_card">
              <h3 className="generic_heading_style">
                Your custom referral link
              </h3>
              <p className="generic_subheading_style">
                Your custom referral link helps your family and friends save on
                their Wills while earning you rewards in the process.
              </p>
              <p className="generic_subheading_style">
                Every time someone finishes their Will using your custom
                referral link, they save $20 on their Will at checkout. For
                every 5 people who do this we’ll email you a{" "}
                <a href="#">$50 Amazon gift card</a>.
              </p>
              <div className="copy_referral_link">
                <Input type="text" readOnly value={referralLink} />
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="dashboard_sidebar">
            <>
              {loading
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <div className="client_mini_card skeleton_card" key={idx}>
                      <div className="dashboard_badge">
                        <div className="skeleton-box badge" />
                      </div>
                      <h3 className="generic_heading_style text-start">
                        <div className="skeleton-box heading" />
                      </h3>
                      <div className="generic_subheading_style text-start">
                        <div className="skeleton-box text" />
                        <div className="skeleton-box text short" />
                      </div>
                      <div className="skeleton-box button" />
                    </div>
                  ))
                : templates.slice(0, 4).map((item, idx) => (
                    <div className="client_mini_card" key={idx}>
                      <div className="dashboard_badge">
                        <strong>
                          {item.status && !item.locked ? (
                            item.status
                          ) : (
                            <span className="text-muted">Locked</span>
                          )}
                        </strong>
                      </div>
                      <h3 className="generic_heading_style text-start">
                        {item.name}
                      </h3>
                      <p className="generic_subheading_style text-start">
                        {item.desc}
                      </p>
                      {!item.locked && (
                        <Button
                          color="light"
                          className="gray_btn"
                          onClick={() =>
                            router.push(`/document/questions?id=${item.id}`)
                          }
                          disabled>
                          {item.price ? `$ ${item.price}` : "Free"}
                          {/* <FaArrowRight /> */}
                        </Button>
                      )}
                    </div>
                  ))}

              <div className="client_mini_card">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <TbLockFilled />
                  <h4 className="mini_heading">Enduring Power of Attorney</h4>
                </div>
                <p className="generic_subheading_style">
                  Appointing a trusted person to handle your finances, if you
                  become incapable.
                </p>
              </div>
              <div className="client_mini_card">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <TbLockFilled />
                  <h4 className="mini_heading">Personal Directive</h4>
                </div>
                <p className="generic_subheading_style">
                  Appointing a trusted person to make decisions about your
                  health care, if you become incapable.
                </p>
              </div>
            </>
            <p className="mb-0 text-center">
              <Button
                color="warning"
                className="questionnaire_btn"
                onClick={() => router.push("/document/view")}>
                Continue Questionnaire <FaArrowRight />
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
