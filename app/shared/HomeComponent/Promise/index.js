"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import "./Promise.scss";

export default function Promise() {
  const sectionRef = useRef(null);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isAnimated) {
          setIsAnimated(true);
          observer.disconnect(); // stop after one trigger
        }
      },
      {
        root: null,
        threshold: 0.9,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isAnimated]);

  return (
    <div
      ref={sectionRef}
      className={`promise-section ${isAnimated ? "animate" : ""}`}
    >
      <div className="promise-container custome-container">
        <div className="left-column">
          <div className="book book-1">
            <Image
              src="/images/doc-orange.svg"
              alt="Book Orange"
              width={297}
              height={363}
            />
          </div>
          <div className="book book-2">
            <Image
              src="/images/doc-blue.svg"
              alt="Book Blue"
              width={224}
              height={292}
            />
          </div>
          <div className="book book-3">
            <Image
              src="/images/doc-purple.svg"
              alt="Book Purple"
              width={224}
              height={292}
            />
          </div>
          <div className="book book-4">
            <Image
              src="/images/doc-gold.svg"
              alt="Book Gold"
              width={224}
              height={292}
            />
          </div>
        </div>

        <div className="right-column text-block">
          <p className="generic-label">Our Promise</p>
          <div>
            <h4 className="generic-heading">Update for free, anytime</h4>
            <p className="generic-description">
              As your life changes, your Will may need to change too. That’s why
              we let you update it for free-anytime, as often as you need.
              Because let’s face it, what you want today might not be what you
              want forever!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
