'use client';
import { RiArrowRightLine } from "react-icons/ri";
import Image from 'next/image';
import './Support.scss';

export default function Support() {
  return (
    <section className="support-section">
      <div className="custome-container">
        <div className='support-container'>
          <div className='support-header'>
            <p className="generic-label label">Customer Support</p>
            <div className="image-container">
                <img src="/images/care-team.jpg" alt="Cloud left" width={80} height={80} />
            </div>
          </div>
          <div className='content-column'>
            <h2 className="generic-heading">Here to Help</h2>
            <p className="generic-description">
              Need a hand? Our dedicated team is made up of real people ready to guide you through every step of the process.
              Whether you have questions or need assistance, we’re here to make your Will experience simple, smooth, and stress-free.
            </p>
          </div>
          <a href="#" className="btn--link">
            <span className="text">Get help now</span>
            <span className="arrow"><RiArrowRightLine /></span>
          </a>
        </div>
      </div>
    </section>
  );
}
