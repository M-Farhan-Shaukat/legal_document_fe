"use client";
import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionBody,
  Button,
} from "reactstrap";
import "./faq.scss";
import { FaArrowRight } from "react-icons/fa";
const faqs = [
  {
    id: "1",
    question: "What is a Will?",
    answer:
      "A Will is the legal document that allows you to provide your instructions for what you want to happen when you're no longer here. It is formally called a 'Last Will and Testament'.",
    link: "/learn/basics#what-is-a-will",
  },
  {
    id: "2",
    question: "What happens if I die without a Will?",
    answer:
      "If you don't have a Will when you die, it's called dying “intestate”. It means that you won't get a say in important decisions like how your assets will be distributed or who gets to be in charge of the process. Instead, your assets would be distributed according to the default rules of the province where you live, and the courts will determine who manages your affairs.",
    link: "/blog/what-happens-if-i-die-without-a-will",
  },
  {
    id: "3",
    question: "Do I need a lawyer to make my Will?",
    answer:
      "There is no legal requirement to have a lawyer prepare your Will. However, legal advice can be helpful in complicated situations like excluding a spouse or child, second marriages, or having significant assets or disabled children.",
    link: "/learn/basics#do-i-need-a-lawyer-to-prepare-my-will",
  },
  {
    id: "4",
    question: "What information do I need to gather before I start?",
    answer:
      "You don't need to gather bank account info. Just be ready with info about your family, guardians for minor children/pets, asset distribution, and who will manage your affairs.",
  },
  {
    id: "5",
    question: "Can my spouse and I make a joint Will?",
    answer:
      "In Canada, each person must create their own Will. Joint Wills are not valid for expressing individual final wishes.",
  },
];

export default function FAQAccordion() {
  const [openId, setOpenId] = useState("0");

  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="faq-sec">
      <div className="faq-container">
        <h2 className="mb-4">FAQs</h2>
        <Accordion open={openId} toggle={toggle} className="landing-accordion">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id}>
              <AccordionHeader targetId={faq.id}>
                {faq.question}
              </AccordionHeader>
              <AccordionBody accordionId={faq.id}>
                <p>{faq.answer}</p>
                {faq.link && (
                  <a href={faq.link} className="faq-link">
                    <button  className="mt-2">
                      Learn more <FaArrowRight />
                    </button>
                  </a>
                )}
              </AccordionBody>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="faq-bottom-sec">
          <a href="/learn">
            <Button className="questions-btn">
              <span>
               Still have questions? Visit our Learn Centre</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20"
                viewBox="0 0 24 24"
                width="20"
                fill="currentColor"
              >
                <path d="M12 4L10.59 5.41 16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
