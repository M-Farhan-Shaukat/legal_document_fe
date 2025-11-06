import Image from "next/image";
import "./Blog.scss";
import { RiArrowRightLine } from "react-icons/ri";

export default function BlogSection() {
  return (
    <section className="blog-section">
      <div className="blog-container custome-container">
        
        <div className="left-column">
          <div className="blog-map">
            <Image
              src="/images/rbc-blog-default.jpg"
              alt="Map of Canada"
              width={550}
              height={325}
            />
          </div>
        </div>
        <div className="blog-content right-column">
          <p className="generic-label">Our Blog</p>
          <div>
            <h4 className="generic-heading">Why You Need Powers of <br />
            Attorney
              </h4>
            <p className="generic-description">
            It's common to think that we all have tons of time to get our affairs in order and we won't need to worry about deciding who will act for us when we're elderly and need the help. But, the sad reality is that incapacity can happen at any time.
             And one of the best ways to protect yourself is through well-documented POAs.
            </p>
          </div>
          <a href="#" className="btn--link">
            <span className="text">Read More</span>
            <span className="arrow"><RiArrowRightLine /></span>
          </a>
        </div>
      </div>
    </section>
  );
}
