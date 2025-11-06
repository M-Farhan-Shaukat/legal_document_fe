import { FaArrowRight } from "react-icons/fa6";
export default function Question() {
  return (
    <>
      <div className="question ">
        <div className="about-container">
          <div className="question-box">
            <h3>Have a question?</h3>
            <p>Click the button below to reach out. We're here to help!</p>
            <button className="btn-make btn-start">
              get in touch
              <FaArrowRight />
            </button>
            <div className="glasses">
              <img src="/images/glasses.svg" alt="" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
