"use client";
import { useRouter } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";
import { Button, Card, CardBody, CardText, CardTitle } from "reactstrap";
import "./pricing.scss";
import { useEffect, useState } from "react";

export default function PricingCardsToggle() {
  const router = useRouter();
  const [payment, setPayment] = useState({});
  const paymentDue = localStorage.getItem("payment_due");
  const paymentProceed = localStorage.getItem("payment_proceed");
  useEffect(() => {
    setPayment(JSON.parse(paymentProceed) || {});
  }, [paymentProceed]);
  return (
    <section className="pricing-sec">
      {paymentDue ? (
        <div className="pricing-container">
          <div className="quiz-title">
            {/* <h5>Pricing</h5> */}

            <div className="separator">
              <p className="sep"></p>
            </div>
            <h2>pricing</h2>
            <p className="sub-title">
              Preview your documents before you pay, with flexible payment
              options available.
            </p>
          </div>

          <div className="cards-row">
            {/* Will Only Card */}
            <div className="card-main">
              <Card>
                <CardBody>
                  <CardTitle tag="h5" className="text-primary">
                    {payment?.template_name}
                  </CardTitle>
                  <h2 className="my-3">${payment?.template_price}</h2>
                  <CardText className="text-muted">
                    Review and confirm your details{" "}
                  </CardText>
                  <hr className="pricing-block-hr" />
                  <ul className="block-listing">
                    <li>
                      <FaCheckCircle fill="#221c54" />{" "}
                      <span>Fill in your Will document online</span>
                    </li>
                    <li>
                      <FaCheckCircle fill="#221c54" />{" "}
                      <span>Proceed securely to payment</span>
                    </li>
                    <li>
                      <FaCheckCircle fill="#221c54" />{" "}
                      <span>
                        Create a record of your assets and key contacts for your
                        executor
                      </span>
                    </li>
                    <li>
                      <FaCheckCircle fill="#221c54" />{" "}
                      <span>Prepare your Social Media Will</span>
                    </li>
                  </ul>
                  <div className="card-action">
                    <button
                      className="btn-start"
                      onClick={() => router.push("/register")}
                    >
                      Proceed to Payment <FaArrowRight />
                    </button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="error-wrapper">
          <h2>There are no pending payments at this time </h2>
          <Button color="primary" outline onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      )}
    </section>
  );
}
