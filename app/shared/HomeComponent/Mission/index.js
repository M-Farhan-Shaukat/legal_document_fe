import Image from "next/image";
import "./Mission.scss";
import { RiArrowRightLine } from "react-icons/ri";

export default function MissionSection() {
  return (
    <section className="mission-section">
      <div className="mission-container custome-container">
        <div className="mission-content left-column">
          <p className="generic-label">Our Mission</p>
          <div className="text-container">
            <h4 className="generic-heading">Democratizing estate planning for Americans
              </h4>
            <p className="generic-description">
            Epilogue is different. It was founded by two former estate lawyers who
              believe that planning for the future and protecting your family
              shouldn’t cost a fortune. So they built a company to bring their vision to life.
            </p>
          </div>
          <a href="#" className="btn--link">
            <span className="text">About Us</span>
            <span className="arrow"><RiArrowRightLine /></span>
          </a>
        </div>
        <div className="right-column">
          <div className="mission-map">
            <Image
              src="/images/map-of-canada.svg"
              alt="Map of Canada"
              width={608}
              height={354}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
