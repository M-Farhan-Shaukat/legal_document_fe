import React from "react";
import Image from "next/image";
import "./SubHeader.scss";
import { Alert } from "@/public/images";
const SubHeader = ({
  SubHeaderLogo = "",
  headerTitle = "",
  HeaderText = "",
}) => {
  return (
    <div className="sub-header">
      <div className="left-section">
        {/* <a href="#" className="header-link d-flex align-items-center"> */}
        <div className='d-flex filter-color '>

          <div className="header-logo position-relative">
            <Image
              className="w-100 h-100"
              src={SubHeaderLogo}
              alt={SubHeaderLogo}
            
              fill
            />
          </div>
          <span>
          {headerTitle}
</span>
        </div>
        {/* </a> */}
        {/* <p className="sub-header-text">
          <Image src={Alert} alt="alert-icon" className="me-1" /> 
          {HeaderText}
        </p> */}
      </div>
  {/*<div className="right-section">
        <a href="#" aria-label="Help">
          <div className="header-icon">
            <Image
              className="w-100 h-100"
              src="https://i.ibb.co/HLrCF3Kn/info.png"
              alt="info"
              width={20}
              height={20}
            />
          </div>
        </a>
        <a href="#" aria-label="Settings">
          <div className="header-icon">
            <Image
              className="w-100 h-100"
              src="https://i.ibb.co/bR6DwV3j/setting.png"
              alt="setting"
              width={20}
              height={20}
            />
          </div>
        </a>
      </div>*/}
    </div>
  );
};

export default SubHeader;
