"use client";

import React, { useState } from "react";
import "./Contact.scss";
import { Form, FormGroup, Label, Input, Button, Alert } from "reactstrap";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    province: "",
    inquiryType: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you could add form submission logic like Axios POST
  };

  return (
    // <Container style={{ maxWidth: "500px", marginTop: "40px" }}>
    //   <h6 className="text-center text-uppercase text-muted">Get in Touch</h6>
    //   <h2 className="text-center mb-4">Let us know how we can help</h2>
    //   <Form onSubmit={handleSubmit}>
    //     <FormGroup>
    //       <Label for="name">Name *</Label>
    //       <Input
    //         type="text"
    //         name="name"
    //         id="name"
    //         value={formData.name}
    //         onChange={handleChange}
    //         required
    //       />
    //     </FormGroup>

    //     <FormGroup>
    //       <Label for="email">Email *</Label>
    //       <Input
    //         type="email"
    //         name="email"
    //         id="email"
    //         value={formData.email}
    //         onChange={handleChange}
    //         required
    //       />
    //     </FormGroup>

    //     <FormGroup>
    //       <Label for="province">Province</Label>
    //       <Input
    //         type="text"
    //         name="province"
    //         id="province"
    //         value={formData.province}
    //         onChange={handleChange}
    //       />
    //     </FormGroup>

    //     <FormGroup>
    //       <Label for="inquiryType">Inquiry Type</Label>
    //       <Input
    //         type="select"
    //         name="inquiryType"
    //         id="inquiryType"
    //         value={formData.inquiryType}
    //         onChange={handleChange}>
    //         <option value="">Select Inquiry Type</option>
    //         <option>General</option>
    //         <option>Support</option>
    //         <option>Sales</option>
    //       </Input>
    //     </FormGroup>

    //     <FormGroup>
    //       <Label for="message">Message *</Label>
    //       <Input
    //         type="textarea"
    //         name="message"
    //         id="message"
    //         rows="4"
    //         value={formData.message}
    //         onChange={handleChange}
    //         required
    //       />
    //     </FormGroup>

    //     {submitted && (
    //       <Alert color="success" className="text-center">
    //         ✅ Success!
    //       </Alert>
    //     )}

    //     <div className="text-center">
    //       <Button color="dark" type="submit" className="px-5 rounded-pill">
    //         Submit
    //       </Button>
    //     </div>
    //   </Form>
    // </Container>
    <section className="contact-us">
      <div className="contact-us-container">
        <div className="heading">
          <p className="label">Get in Touch</p>
          <h1 className="generic-heading">Let us know how we can help</h1>
        </div>
        <div className="form-container">
          <Form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-floating-wrapper">
              <FormGroup className="form-floating">
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder=""
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Label for="name">Name*</Label>
              </FormGroup>

              <FormGroup className="form-floating">
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder=""
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Label for="email">Email*</Label>
              </FormGroup>

              <FormGroup className="form-floating">
                <Input
                  type="text"
                  id="province"
                  name="province"
                  placeholder=""
                  value={formData.province}
                  onChange={handleChange}
                />
                <Label for="province">Province</Label>
              </FormGroup>

              <FormGroup className="form-floating select-field">
                <Input
                  type="select"
                  name="inquiryType"
                  id="inquiryType"
                  className={formData.inquiryType ? "selected" : ""}
                  value={formData.inquiryType}
                  onChange={handleChange}
                >
                  <option value="" disabled hidden></option>
                  <option value="General">General</option>
                  <option value="Support">Support</option>
                  <option value="Sales">Other</option>
                </Input>
                <Label for="inquiryType">Inquiry Type</Label>
              </FormGroup>

              <FormGroup className="form-floating text-field">
                <Input
                  type="textarea"
                  id="message"
                  name="message"
                  rows="5"
                  placeholder=""
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
                <Label for="message">Message*</Label>
              </FormGroup>
            </div>

            {submitted && (
              <Alert color="success" className="text-center">
                ✅ Success!
              </Alert>
            )}

            <div className="submit-wrap">
              <Button type="submit" className="submit-btn">
                Submit
              </Button>
            </div>
          </Form>
        </div>
        <div className="contact-footer">
          <div className="generic-description">
            <p className="company">Epilogue</p>
            <p>c/o The Legal Innovation Zone</p>
            <p>10 Dundas Street East, Suite 1002</p>
            <p>Toronto, ON M5B 2G9</p>
          </div>
          <div className="call-btn-wrapper">
            <button className="call--btn">Book a Call</button>
          </div>
          <div className="generic-description">
            <p>(289) 678-1689</p>
            <p>help@epiloguewills.com</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
