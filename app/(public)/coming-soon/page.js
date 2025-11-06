"use client";
import { useEffect, useState } from "react";
import "./coming-soon.scss";

export default function ComingSoon() {
  const calculateTimeLeft = () => {
    const launchDate = new Date("2025-09-01T00:00:00").getTime();
    const now = new Date().getTime();
    const diff = launchDate - now;

    if (diff <= 0) return null;

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!timeLeft) {
    return (
      <div className="coming-soon-container">
        <h1 className="title">🎉 Epilogue is Live!</h1>
      </div>
    );
  }

  return (
    <div className="coming-soon-container">
      <h1 className="title">Coming Soon</h1>
      <p className="subtitle">
        We're working hard to launch Epilogue soon. Stay tuned!
      </p>

      <div className="countdown">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="timer-box">
            <div className="timer-number">{String(value).padStart(2, "0")}</div>
            <div className="timer-label">{unit.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
