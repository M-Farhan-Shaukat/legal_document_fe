import Image from "next/image";
import "./Security.scss";
import { FaCheckCircle } from "react-icons/fa";
import { RiArrowRightLine } from "react-icons/ri";


export default function PrivacySection() {
  return (
    <section className="privacy-section">
      <div className="privacy-container custome-container">
        <div className="privacy-illustration left-column">
          <div className="illustration-wrapper">
            <img
              src="/images/lock-with-clouds.svg"
              alt="Lock with clouds illustration"
            />
          </div>
        </div>
        <div className="privacy-content right-column">
          <p className="generic-label">Security</p>
          <div>
            <h4 className="generic-heading">Your Privacy, Our Priority</h4>
            <p className="generic-description">
              Your peace of mind is important to us. Here’s how we keep your information safe:
            </p>
            <ul className="privacy-list">
              <li className="privacy-item">
                <FaCheckCircle  className="check-icon" />
                <p>
                  All sessions are encrypted and managed over HTTPS for total data privacy.
                </p>
              </li>
              <li className="privacy-item">
                <FaCheckCircle  className="check-icon" />
                <p>
                  Your data is stored in highly secure, encrypted storage volumes, backed up
                  in a Virtual Private Cloud (VPC) with dedicated firewalls.
                </p>
              </li>
              <li className="privacy-item">
                <FaCheckCircle  className="check-icon" />
                <p>
                  Everything is protected within Canada, adhering to strict data security
                  standards.
                </p>
              </li>
            </ul>
          </div>
          <a href="#" className="btn--link">
            <span className="text">Learn More</span>
            <span className="arrow"><RiArrowRightLine /></span>
          </a>
        </div>
      </div>
    </section>
  );
}
