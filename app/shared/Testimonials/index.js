"use client";
import "./testimonials.scss";
import React from "react";
import { Card, CardBody, CardText, CardTitle, Container } from "reactstrap";

const testimonials = [
  {
    name: "Melissa Allan",
    text: "Honestly can’t believe I am writing a review for my Will (lol) but I’m only doing it because that’s how much I enjoyed Epilogue. It was such a quick, painless and easy thing to do for something we have been putting off for so long.",
    image: "https://i.pravatar.cc/50",
  },
  {
    name: "Mary Anne Caissie",
    text: "Completing this process was very simple and straightforward. Having worked with many clients that were trying to work through a loved one’s passing without a will, I knew that we owed it to our sons to have this done.",
    image: "https://i.pravatar.cc/50",
  },
  {
    name: "Shawna Davey",
    text: "The process to create our will was fast, easy and something I highly recommend. The questions were thoughtful and sensitive. Thank you for the peace of mind ❤️",
    image: "https://i.pravatar.cc/50",
  },
  {
    name: "Tammi Kustka",
    text: "This was an excellent experience. Easy to follow. Did it in one night and ended up with a will we are happy with. Something we have delayed for years.",
    image: "https://i.pravatar.cc/50",
  },
  {
    name: "Martin Davies",
    text: "I found that creating my new will with Epilogue was easy. The process went seamlessly. I just have to fill in details and have it witnessed. I really appreciated the language used in the instructions.",
    image: "https://i.pravatar.cc/50",
  },
  {
    name: "Daniela Costantiello",
    text: "I had been meaning to obtain a Will since my first child was born almost 6 years ago. I just kept putting it off. I came across Epilogue and was surprised at how easy, and fast, and not to mention very affordable it is.",
    image: "https://i.pravatar.cc/50",
  },
  {
    name: "Hughe Rose",
    text: "For years we’ve been putting off redoing our Will because it was a complicated ordeal the first time. We were blown away by the simplicity of the process of doing our will with Epilogue!",
    image: "https://i.pravatar.cc/50",
  },
];

export default function TestimonialScroller({background}) {
  const firstRow = testimonials.slice(0, Math.ceil(testimonials.length / 2));
  const secondRow = testimonials.slice(Math.ceil(testimonials.length / 2));

  const renderRow = (items, reverse = false) => (
    <div className={`scroll-row ${reverse ? "reverse" : ""}`}>
      <div className="scroll-content" >
        {[...items, ...items, ...items].map((t, idx) => (
          <Card key={idx} className="testimonial-card shadow-sm">
            <CardBody>
              <CardText>{t.text}</CardText>
              <div className="d-flex align-items-center mt-3">
                <img
                  src={t.image}
                  alt={t.name}
                  className="rounded-circle me-2"
                  width="40"
                  height="40"
                />
                <div>
                  <CardTitle tag="h6" className="mb-0">
                    {t.name}
                  </CardTitle>
                  <div>★★★★★</div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <Container fluid className="testimonial-scroller" style={{background}}>
      <div className="testimonial-slider-title">
        {!background && (
      <>
        <h5>Testimonials</h5>
        <hr />
        <p>Trusted by thousands of Americans</p>
      </>
    )}
         </div>
      {renderRow(firstRow, false)}
      {renderRow(secondRow, true)}
    </Container>
  );
}
