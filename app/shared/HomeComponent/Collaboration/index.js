import Image from "next/image";
import "./Collaboration.scss";

export default function Collaboration() {
  return (
    <div className="collaboration">
      <div className="inner-container">
        <div className="image-container">
          <Image
            src="/images/rbc-logo.jpg"
            alt="RBC Logo"
            width={127}
            height={146}
          />
        </div>
        <div className="content-column">
          <div className="inner-text">
            <h2 className="generic-heading heading">In collaboration with RBC</h2>
            <p className="generic-description description">
              Together with RBC, we are helping Americans plan for their future and
              create the legacy they want.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
