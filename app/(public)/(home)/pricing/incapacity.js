import Image from "next/image";
import "./Incapacity.scss";
import { RiArrowRightLine } from "react-icons/ri";

export default function incapacitySection() {
  return (
    <section className="incapacity-section">
      <div className="incapacity-container custome-container">
        <div className="incapacity-content left-column">
          <div>
            <h4 className="generic-heading heading">
              What are Incapacity Documents?
            </h4>
            <p className="generic-description description">
              A Will only becomes effective once someone passes away. Incapacity
              planning documents let you appoint someone to take care of things
              in case you ever become incapable. These documents have different
              names in different provinces, like Power of Attorney, Personal
              Directive, or Health Care Directive.
            </p>
          </div>
          <a href="#" className="btn--link">
            <span className="text">Learn more</span>
            <span className="arrow">
              <RiArrowRightLine />
            </span>
          </a>
        </div>
        <div className="right-column">
          <div className="incapacity-map">
            <Image
              width={500}
              height={340}
              src="/images/poas-staggered.svg"
              alt="Map of Canada"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
