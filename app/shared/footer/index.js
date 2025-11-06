"use client";
import React from "react";
import "./Footer.scss";
import { FaArrowRight } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Footer = ({ className }) => {
  const router = useRouter();
  return (
    <div>
      <div className="make">
        <div className="footer-container">
          <div className="make-you">
            <h2>Make your Will today</h2>
            <p>Take care of your loved ones and give them peace of mind.</p>
            <button
              className="btn-start"
              onClick={() => router.push("/document/view")}>
              Start My Will <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
      <footer>
        <div className="main-footer">
          <div className="footer-container">
            <div className="foot-box">
              <div className="quick-links">
                <div className="contact text">
                  <ul>
                    <li>
                      <Link href="/contact">Contact</Link>
                    </li>
                    <li>
                      <Link href="/about">About Us</Link>
                    </li>
                    <li>
                      <Link href="/pricing">Pricing</Link>
                    </li>
                    <li>
                      <Link href="/coming-soon">Learn</Link>
                    </li>
                    <li>
                      <Link href="/coming-soon">For Advisors</Link>
                    </li>
                  </ul>
                </div>
                <div className="probate text">
                  <ul>
                    <li>
                      <Link href="/coming-soon">Probate</Link>
                    </li>
                    <li>
                      <Link href="/coming-soon">Security</Link>
                    </li>
                    <li>
                      <Link href="/coming-soon">Gifts</Link>
                    </li>
                    <li>
                      <Link href="/coming-soon">Legal</Link>
                    </li>
                    <li>
                      <Link href="/coming-soon">Social Media Will</Link>
                    </li>
                    <li>
                      <Link href="/coming-soon">Affiliate Program</Link>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mui-box">
                <div className="epil">
                  <div className="logo-box">
                    <img src="/images/epilogue-logo.svg" alt="Logo" />
                  </div>
                  <div className="media">
                    <div className="twitter logo">
                      <img src="/images/twitter.svg" alt="Twitter" />
                    </div>
                    <div className="facebook logo">
                      <img src="/images/facebook.svg" alt="Facebook" />
                    </div>
                    <div className="instagram logo">
                      <img src="/images/instagram.svg" alt="Instagram" />
                    </div>
                    <div className="linkedin logo">
                      <img src="/images/linkedin.svg" alt="LinkedIn" />
                    </div>
                  </div>
                  <p>
                    Copyright © 2025 Epilogue <br />
                    All rights reserved
                  </p>
                </div>
              </div>
              <div className="mail">
                <div className="mail-box">
                  <p>
                    Sign up and stay up-to-date on Epilogue news, exclusive
                    offers, and more.
                  </p>
                  <div className="signup-wrapper">
                    <input
                      type="email"
                      placeholder="Email address"
                      className="email-input"
                    />
                    <button className="signup-btn">Sign Up</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <div className="footer-two">
        <div className="container">
          <div className="footer-box">
            <p>
              Epilogue is not a law firm and does not provide any legal advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
