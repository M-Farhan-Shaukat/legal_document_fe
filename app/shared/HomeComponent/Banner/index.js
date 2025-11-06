"use client";
// import { useEffect } from "react";
import "./banner.scss";
import { BiBadgeCheck } from "react-icons/bi";
// import { LocalServer } from "@/app/utils";
import { useRouter } from "next/navigation";

export default function Banner() {
  const router = useRouter();

  // const fetchTemplates = async () => {
  //   const response = await LocalServer.get("/api/template/get");
  //   localStorage.setItem("templateId", response.data.data[0]?.id);
  // };

  // useEffect(() => {
  //   fetchTemplates();
  // }, []);
  return (
    <>
      <section className="home-banner">
        <div className="container">
          <div className="banner-img-top">
            <img src="/images/landing-banner-01.webp" />
          </div>
          <div className="banner_images-main">
            <div className="banner-img-1">
              <img src="/images/cloud-1.svg" width="120" height="47" />
            </div>
            <div className="banner-img-2">
              <img src="/images/cloud-2.svg" width="145" height="58" />
            </div>
            <div className="banner-img-3">
              <img src="/images/cloud-3.svg" width="80" height="32" />
            </div>
            <div className="banner-img-4">
              <img src="/images/cloud-4.svg" width="128" height="47" />
            </div>
            <div className="banner-img-5">
              <img src="/images/cloud-5.svg" width="100" height="40" />
            </div>
            <div className="banner-img-6">
              <img src="/images/cloud-6.svg" width="80" height="32" />
            </div>
          </div>
          <div className="banner__content-sec">
            <h1>Simple, Smart Online Wills</h1>
            <h2>
              Create a legally-binding Will in just 20 minutes to protect the
              people who matter most to you.
            </h2>

            <div className="rating--block">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.google.com/maps/place/Epilogue/@43.6569658,-79.3804789,15z/data=!3m1!5s0x882b34c51bbe1e97:0x6a8c2ebac3a9ebf8!4m7!3m6!1s0x0:0x6ccffba8d5de074a!8m2!3d43.6569658!4d-79.3804789!9m1!1b1"
              >
                <div className="rating--block-inner">
                  <div className="rating">
                    <span className="star">&#9733;</span>
                    <span className="star">&#9733;</span>
                    <span className="star">&#9733;</span>
                    <span className="star">&#9733;</span>
                    <span className="star">&#9733;</span>
                  </div>
                  <h6>Rated 4.8 stars on</h6>
                  <img src="/images/google-logo.jpg" />
                </div>
              </a>
            </div>

            <div className="rating-sec">
              <button
                type="button"
                className="btn-start"
                onClick={() => router.push("/document/view")}
              >
                Start My Will
                <span>➜</span>
              </button>
            </div>
            <div className="banner-screen-sec">
              <img src="/images/feather-computer.svg" />
            </div>

            <div className="mob-actions">
              <a href="">
                <BiBadgeCheck /> Starting from $139
              </a>
              <a href="">
                <BiBadgeCheck />
                Free lifetime updates
              </a>
              <a href="">
                <BiBadgeCheck />
                Built by lawyers
              </a>
            </div>
          </div>
        </div>
      </section>

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
    </>
  );
}
