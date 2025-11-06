"use client";

import Questionnaire from "@/app/(private)/(client)/document/questions/page";
import React from "react";

const DocumentQuestions = () => {
  return (
    <div>
      <Questionnaire isAdmin />
    </div>
  );
};

export default DocumentQuestions;
