"use client";
import "./ButtonX.scss";
import Image from "next/image";
export default function ButtonX({
  id = "",
  children = "",
  size = "",
  className = "",
  logo = "",
  logoClass = "",
  clickHandler,
  type = "button",
  disabled = false,
}) {
  return (
    <button
      id={id}
      aria-label={children}
      onClick={clickHandler}
      className={`btn-default ${className} ${size}`}
      type={type}
      disabled={disabled}
    >
      {logo && (
        <Image src={logo} alt="Button logo" className={`me-2 ${logoClass}`} />
      )}
      {children}
    </button>
  );
}
