import React from "react";
import "./shop.scss";
import { BsArrowRightShort } from "react-icons/bs";

const learnTopics = [
  {
    title: "Will Basics",
    description:
      "We’ll cover the basics of why you need a Will and what goes in it.",
    links: ["What is a Will?", "Do I need a Will?", "Basic Will terminology"],
  },
  {
    title: "Beneficiaries",
    description:
      "The people you indicate that will inherit something from your estate.",
    links: [
      "What is a beneficiary?",
      "Who can be a beneficiary?",
      "Gifts and beneficiaries",
    ],
  },
  {
    title: "Executors",
    description:
      "The person or trust company that will be in charge of administering your estate.",
    links: [
      "What is an executor?",
      "What are the powers of executors?",
      "Duties of executors",
    ],
  },
  {
    title: "Guardians",
    description:
      "The people you appoint in your Will to care for your minor children and pets.",
    links: [
      "What is a Legal Guardian?",
      "Legal Guardian appointment",
      "Appointing a guardian",
    ],
  },
  {
    title: "Witnesses",
    description: "We’ll explain how to make sure your Will is legally binding.",
    links: [
      "How to make a Will official?",
      "Can my spouse be a witness?",
      "Who can witness my Will?",
    ],
  },
  {
    title: "Probate",
    description: "The court process that takes place after someone dies.",
    links: [
      "What is probate?",
      "Estate Trustee certificate",
      "Why probate is needed",
    ],
  },
  {
    title: "Powers Of Attorney",
    description: "Documents that allow someone to make decisions for you.",
    links: [
      "Types of Powers of Attorney",
      "When to use a Power of Attorney",
      "Power of Attorney for finances",
    ],
  },
  {
    title: "Marriage and Wills",
    description:
      "Some things to know about how your marriage status can impact your estate planning.",
    links: [
      "Inheritance in Canada",
      "Wills before and after marriage",
      "Assets and inheritance",
    ],
  },
  {
    title: "Pets",
    description:
      "Key considerations when it comes to the future care of your pets.",
    links: [
      "What is pet guardianship?",
      "How does pet guardianship work?",
      "Making sure your pet is provided for",
    ],
  },
];

export default function Shop() {
  return (
    <>
      <section className="estate__planning-sec">
        <div className="planning__container">
          <div className="title__Sec">
            <h2 className="learn__title">
              Your one-stop-shop for all things estate planning
            </h2>
          </div>

          <div className="estate-planning-blocks">
            {learnTopics.map((topic, index) => (
              <div className="estate-planning-block" key={index}>
                <div className="estate-planning-left planning-inner">
                  <a
                    href={`/learn/${topic.title
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    <h3>{topic.title}</h3>
                  </a>
                  <p>{topic.description}</p>
                </div>

                <div className="estate-planning-separator"></div>

                <div className="estate-planning-right planning-inner">
                  <div className="links__link-main">
                    {topic.links.map((link, linkIndex) => (
                      <div className="learn-link" key={linkIndex}>
                        <a
                          href={`/learn/${topic.title
                            .toLowerCase()
                            .replace(/\s+/g, "-")}/#${link
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^\w-]/g, "")}`}
                        >
                          <span className="link-text">
                            {link}
                            <BsArrowRightShort />
                          </span>
                        </a>
                      </div>
                    ))}
                  </div>
                  <a href="#" className="show-more">
                    Show all {topic.links.length} article
                    {topic.links.length > 1 ? "s" : ""}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
