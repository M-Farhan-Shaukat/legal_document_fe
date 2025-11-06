"use client";
import { useRouter } from "next/navigation";
import "./started.scss";
export default function GetStarted() {
  const router = useRouter();
  return (
    <>
      <section id="get-started" className="lets-start-section">
        <div className="container d-flex">
          <div className="started-left wrapper-50">
            <div className="inner-adjust-wrapper">
              <div className="trust-explanation">
                <h1>Let's Get Started</h1>
                <p className="textual-info">
                  See why thousands of Americans trust Law Forma.
                </p>
              </div>
              <div className="qualities-features d-flex">
                <div className="picture-icon">
                  <img src="/images/glasses.svg" alt="" />
                </div>
                <div className="feat-benefits">
                  <h3>Built by lawyers</h3>
                  <p className="textual-info">
                    The only online Will platform in Canada started and run by
                    experienced estate planning lawyers.
                  </p>
                </div>
              </div>
              <div className="qualities-features d-flex">
                <div className="picture-icon">
                  <img src="/images/family.png" alt="" className="spouse" />
                </div>
                <div className="feat-benefits">
                  <h3>Live support</h3>
                  <p className="textual-info">
                    Our team is available by live chat or phone if you have any
                    questions.
                  </p>
                </div>
              </div>
              <div className="qualities-features d-flex">
                <div className="picture-icon">
                  <img src="/images/coins.svg" alt="" className="coins" />
                </div>
                <div className="feat-benefits">
                  <h3>Pay when you're ready</h3>
                  <p className="textual-info">
                    Preview your documents before you pay, with flexible payment
                    options available.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/questionnaire/province")}
                className="continue-btn"
              >
                Continue{" "}
                <svg
                  focusable="false"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  data-testid="ArrowForwardIcon"
                >
                  <path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path>
                </svg>
              </button>
            </div>
          </div>
          <div className="start-right wrapper-50">
            <div className="family-photo">
              <img src="/images/family-photo.svg" alt="" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
