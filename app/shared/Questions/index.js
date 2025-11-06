"use client";
import React, { useState } from "react";
import { IoReload } from "react-icons/io5";
import {
  Container,
  Card,
  CardBody,
  Button,
  Input,
  Label,
  Row,
  Col,
  FormGroup,
  Progress,
} from "reactstrap";
import "./quiz.scss";
const initialQuestions = [
  {
    id: "spouse",
    label: "Do you have a spouse or partner?",
    type: "yesno",
    value: "",
  },
  {
    id: "gender",
    label: "Select your gender",
    type: "select",
    options: ["Male", "Female", "Other"],
    value: "",
  },
  {
    id: "email",
    label: "What is your email?",
    type: "email",
    value: "",
  },
];

const QuestionForm = () => {
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = questions[currentStep];

  const handleChange = (id, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, value } : q))
    );
  };

  const handleAnswerAndNext = (value) => {
    handleChange(currentQuestion.id, value);

    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        setSubmitted(true);
      }
    }, 300);
  };

  const getResponses = () =>
    questions.reduce((acc, q) => {
      acc[q.id] = q.value;
      return acc;
    }, {});

  const restartQuiz = () => {
    setQuestions(initialQuestions.map((q) => ({ ...q, value: "" })));
    setCurrentStep(0);
    setSubmitted(false);
  };
  return (
    <section className="quiz-sec">
      <div className="quiz-container">
        <div className="quiz-title">
          <h5>Quiz</h5>
          <div className="separator">
            <p></p>
          </div>
          <h2>Is an online Will right for you?</h2>
          <p>Find out in less than a minute by taking our quiz.</p>
        </div>
        <Card>
          <CardBody>
            <h4 className="text-right start-quiz-title">
              <Button
                color="outline"
                onClick={restartQuiz}
                className="start-quiz-btn"
              >
                Restart Quiz <IoReload />
              </Button>
            </h4>
            <Progress
              value={((currentStep + 1) / questions.length) * 100}
              className="question--progress"
            />
            {!submitted ? (
              <div className="quiz__question-main">
                <QuestionRenderer
                  question={currentQuestion}
                  onAnswer={handleAnswerAndNext}
                  onChange={handleChange}
                />
                {/* <div className="text-center text-muted mt-4">
                Question {currentStep + 1} of {questions.length}
              </div> */}
              </div>
            ) : (
              <div className="text-center">
                <h5 className="mb-3">Thank you for your response!</h5>
                {/* <pre className="bg-light p-3 rounded text-start">
                  {/* {JSON.stringify(getResponses(), null, 2)}
                </pre> */}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </section>
  );
};

const QuestionRenderer = ({ question, onAnswer, onChange }) => {
  const { id, label, type, options, value } = question;

  if (type === "yesno") {
    return (
      <FormGroup>
        <Label>{label}</Label>
        <div className="action-row">
          <Button
            color="light"
            outline={value !== "Yes"}
            onClick={() => onAnswer("Yes")}
          >
            Yes
          </Button>

          <Button
            color="light"
            outline={value !== "No"}
            onClick={() => onAnswer("No")}
          >
            No
          </Button>
        </div>
      </FormGroup>
    );
  }

  if (type === "select") {
    return (
      <FormGroup>
        <Label className="fw-bold">{label}</Label>
        <Input
          type="select"
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            onChange(id, val);
            if (val) onAnswer(val);
          }}
        >
          <option value="">-- Select --</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Input>
      </FormGroup>
    );
  }

  if (type === "email") {
    const handleEmailSubmit = (e) => {
      e.preventDefault();
      if (!value || !/\S+@\S+\.\S+/.test(value)) {
        alert("Please enter a valid email address.");
        return;
      }
      onAnswer(value);
    };

    return (
      <form onSubmit={handleEmailSubmit}>
        <FormGroup>
          <Label className="fw-bold">{label}</Label>
          <Input
            type="email"
            value={value}
            onChange={(e) => onChange(id, e.target.value)}
            placeholder="example@email.com"
            required
          />
        </FormGroup>
        <div className="text-center">
          <Button type="submit" className="quiz-submit-btn">
            Submit
          </Button>
        </div>
      </form>
    );
  }

  return null;
};

export default QuestionForm;
