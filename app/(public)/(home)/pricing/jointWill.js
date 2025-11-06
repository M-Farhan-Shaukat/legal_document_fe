import Image from "next/image";
import "./Jointwill.scss";
import { RiArrowRightLine } from "react-icons/ri";

export default function incapacitySection() {
  return (
    <section className="joint-will-section">
      <div className="joint-will-container custome-container">
        <div className="joint-will-content left-column">
          <div>
            <h4 className="generic-heading">
              Can my spouse and I make a joint Will?
            </h4>
            <p className="generic-description">
              No — legally each person needs to create their own Will to make
              sure their final wishes are carried out according to their own
              preferences. Epilogue offers special pricing for couples, so you
              can both have peace of mind together.
            </p>
          </div>
        </div>
        <div className="right-column">
          <div className="joint-will-map">
            <Image
              width={550}
              height={355}
              src="/images/polaroid-hug.svg"
              alt="Map of Canada"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
