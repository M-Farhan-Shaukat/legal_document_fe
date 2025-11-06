import Image from "next/image";
import "./Delivery.scss";

export default function willDelivery() {
  return (
    <div className="will-delivery">
      <div className="inner-container">
        <div className="image-container">
          <Image
            src="/images/balloon-doc.jpg"
            alt="RBC Logo"
            width={295}
            height={225}
          />
        </div>
        <div className="content-column">
          <div className="inner-text">
            <h2 className="generic-heading heading">Your Will sent right to your door</h2>
            <p className="generic-description description">
            Once you finish your Will, you'll have the option to have it printed and mailed straight to you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
