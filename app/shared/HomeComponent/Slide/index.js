import "../Banner/banner.scss";

export default function Slide() {
  return (
    <section className="feartures-logos">
      <div className="logos-row">
        <div className="logo-block">
          <img src="/images/featured-globemail.webp" />
        </div>
        <div className="logo-block">
          <img src="/images/featured-yahoo.webp" />
        </div>
        <div className="logo-block">
          <img src="/images/featured-fp.webp" />
        </div>
        <div className="logo-block">
          <img src="/images/featured-global.webp" />
        </div>
        <div className="logo-block">
          <img src="/images/featured-moneyca.webp" />
        </div>
      </div>
    </section>
  );
}
