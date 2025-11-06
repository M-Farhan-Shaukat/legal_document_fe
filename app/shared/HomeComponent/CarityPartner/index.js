
  import { RiArrowRightLine } from "react-icons/ri";
  import Image from "next/image";
import "./Charity.scss";

export default function CharityPartner() {
  return (
    <section className="charity-section">
      <div className="charity-container custome-container">
        <div className="charity-content left-column">
          <p className="generic-label">Giving Back</p>
          <div>
            <h4 className="generic-heading">Become a Charity Partner</h4>
            <div className="generic-description">
              <p>
                Leaving a gift in a Will is a meaningful way for donors to
                create a lasting legacy. But getting donors to take that
                step—and knowing if they have—can be tough.
              </p>
              <p>
                We make it easier for your donors to include your organization
                in their plans. Plus, we provide marketing support, custom
                reporting, and much more.
              </p>
            </div>
          </div>
          <div className="rating-sec">
            <button type="button" className="btn-start">
              Become a Charity Partner
              <span className="arrow"><RiArrowRightLine /></span>
            </button>
          </div>
        </div>
        <div className="right-column">
          <div className="charity-map">
            <Image
              src="/images/charity-logo.jpg"
              alt="Map of Canada"
              width={483}
              height={320}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
