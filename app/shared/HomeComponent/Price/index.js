"use client";
import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Button,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import "./pricing.scss";
import { FaCheckCircle } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";
import { useRouter } from "next/navigation";

export default function PricingCardsToggle() {
  const [isCouple, setIsCouple] = useState(false);
  const router = useRouter();
  // Prices for each plan
  const prices = {
    individual: {
      willOnly: 139,
      willPlus: 199,
    },
    couple: {
      willOnly: 239,
      willPlus: 319,
    },
  };

  const currentPrices = isCouple ? prices.couple : prices.individual;
  // const planLabel = isCouple ? "Couple" : "Individual";

  const handleToggle = () => setIsCouple(!isCouple);
  const paymentDue = localStorage.getItem("payment_due");

  return (
    <section className="pricing-sec">
      <div className="pricing-container">
        <div className="quiz-title">
          <h5>Pricing</h5>

          <div className="separator">
            <p className="sep"></p>
          </div>
          <h2>Our simple pricing plan</h2>
          <p className="sub-title">
            Preview your documents before you pay, with flexible payment options
            available.
          </p>
        </div>
        {/* Toggle */}
        {paymentDue && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "20px",
              position: "relative",
              zIndex: 2,
            }}>
            <button
              className="proceed-to-payment"
              onClick={() => router.push("/login")}>
              Proceed to Payment
            </button>
          </div>
        )}
        <FormGroup
          style={{
            position: "relative",
            zIndex: 2,
          }}
          className="pricing-toggles">
          <Label check>Individual</Label>

          <label className="custom-switch">
            <input type="checkbox" checked={isCouple} onChange={handleToggle} />
            <span className="slider" />
          </label>
          <Label check>Couple</Label>
        </FormGroup>

        <div className="cards-row">
          {/* Will Only Card */}
          <div className="card-main">
            <Card>
              <CardBody>
                <CardTitle tag="h5" className="text-primary">
                  Will Only
                </CardTitle>
                <h2 className="my-3">${currentPrices.willOnly}</h2>
                <CardText className="text-muted">
                  Everything you need to set up a legally binding Will.
                </CardText>
                <hr className="pricing-block-hr" />
                <ul className="block-listing">
                  <li>
                    <FaCheckCircle fill="#221c54" />{" "}
                    <span>Make your own custom Will</span>
                  </li>
                  <li>
                    <FaCheckCircle fill="#221c54" />{" "}
                    <span>Includes detailed signing instructions</span>
                  </li>
                  <li>
                    <FaCheckCircle fill="#221c54" />{" "}
                    <span>
                      Express your final wishes for funeral, cremation/burial,
                      etc.
                    </span>
                  </li>
                  <li>
                    <FaCheckCircle fill="#221c54" />{" "}
                    <span>
                      Send notifications to the executors and guardians named in
                      your Will
                    </span>
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
                  <li>
                    <FaCheckCircle fill="#221c54" />{" "}
                    <span>
                      Receive a code to register your Will with the Canada Will
                      Registry ($40 value)
                    </span>
                  </li>
                  <li>
                    <FaCheckCircle fill="#221c54" />{" "}
                    <span>Update your documents anytime for free</span>
                  </li>
                  <li>
                    <FaCheckCircle fill="#221c54" />{" "}
                    <span>
                      Appoint someone to handle your finances if you become
                      incapable
                    </span>
                  </li>
                  <li>
                    <FaCheckCircle fill="#221c54" />{" "}
                    <span>
                      Name someone to make health care decisions for you if you
                      cannot
                    </span>
                  </li>
                </ul>
                <div className="card-action">
                  <button
                    className="btn-start"
                    onClick={() => router.push("/document/view")}>
                    Start My Will <FaArrowRight />
                  </button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Will + Incapacity Card */}
          <div className="card-main">
            <Card style={{ position: "relative" }}>
              <div className="popular-row">
                <img src="/images/arrow-drawn.svg" />
                <span>Most popular!</span>
              </div>
              <CardBody>
                <CardTitle tag="h5" className="text-primary">
                  Will + Incapacity Documents
                </CardTitle>
                <h2 className="my-3">${currentPrices.willPlus}</h2>
                <CardText className="text-muted">
                  Complete protection that covers both death and incapacity.
                </CardText>
                <hr className="pricing-block-hr" />
                <ul className="block-listing">
                  <li>
                    <FaCheckCircle fill="#221c54" />{" "}
                    <span>Make your own custom Will</span>
                  </li>
                  <li>
                    <FaCheckCircle fill="#221c54" />{" "}
                    <span>Includes detailed signing instructions</span>
                  </li>
                  <li>
                    <FaCheckCircle fill="#221c54" />{" "}
                    <span>
                      Express your final wishes for funeral, cremation/burial,
                      etc.
                    </span>
                  </li>
                  <li>
                    <FaCheckCircle fill="#221c54" />{" "}
                    <span>
                      Send notifications to the executors and guardians named in
                      your Will
                    </span>
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
                  <li>
                    <FaCheckCircle fill="#221c54" />{" "}
                    <span>
                      Receive a code to register your Will with the Canada Will
                      Registry ($40 value)
                    </span>
                  </li>
                  <li>
                    <FaCheckCircle fill="#221c54" />{" "}
                    <span>Update your documents anytime for free</span>
                  </li>
                  <li>
                    <FaCheckCircle fill="#221c54" />{" "}
                    <span>
                      Appoint someone to handle your finances if you become
                      incapable
                    </span>
                  </li>
                  <li>
                    <FaCheckCircle fill="#221c54" />{" "}
                    <span>
                      Name someone to make health care decisions for you if you
                      cannot
                    </span>
                  </li>
                </ul>
                <div className="card-action">
                  <button className="btn-start">
                    Start My Will <FaArrowRight />
                  </button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
      <div className="banner_images-main">
        <div className="banner-img-1">
          <img src="/images/cloud-1.svg" width="120" height="47" />
        </div>
        <div className="banner-img-2">
          <img src="/images/cloud-2.svg" width="145" height="58" />
        </div>
        <div className="banner-img-3">
          <img src="/images/cloud-3.svg" width="80" height="32" />
        </div>
        <div className="banner-img-4">
          <img src="/images/cloud-4.svg" width="120" height="47" />
        </div>
        <div className="banner-img-5">
          <img src="/images/cloud-5.svg" width="120" height="47" />
        </div>
        <div className="banner-img-6">
          <img src="/images/cloud-6.svg" width="84" height="32" />
        </div>
      </div>
    </section>
  );
}
