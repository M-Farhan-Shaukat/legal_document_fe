import "./learnCenter.scss";
export default function Learn() {
  return (
    <section className="learn__sec">
      <div className="learn__container">
        <div className="learn__sec-inner d-flex align-items-center">
          <div className="learn__sec-left">
            <h1>Welcome to the Epilogue Learn Centre</h1>
            <p>
              Explore and learn more about Wills, Powers of Attorney, and all
              things estate planning.
            </p>
          </div>
          <div className="learn__sec-right">
            <img src="/images/learn-banner.svg" alt="Learn Banner" />
          </div>
        </div>
      </div>
    </section>
  );
}
