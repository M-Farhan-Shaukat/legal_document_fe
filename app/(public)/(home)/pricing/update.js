import Image from "next/image";
import "./Update.scss";

export default function BlogSection() {
  return (
    <section className="updated-section">
      <div className="updated-container custome-container">
        <div className="left-column">
          <div className="updated-map">
            <Image
              src="/images/lady-feather.svg"
              alt="Map of Canada"
              width={550}
              height={325}
            />
          </div>
        </div>
        <div className="updated-content right-column">
          <p className="generic-label">Our Promise</p>
          <div>
            <h4 className="generic-heading">Update for free, anytime</h4>
            <p className="generic-description">
              As your life changes, your Will may need to change too. That's why
              we let you update it for free-anytime, as often as you need.
              Because let's face it, what you want today might not be what you
              want forever!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
