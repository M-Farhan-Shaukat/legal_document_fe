"use-client";
import React, { useState } from "react";
import { Tooltip } from "reactstrap";

function TooltipX({ children, text, id = "example" }) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => setTooltipOpen(!tooltipOpen);

  const validId = `tooltip-${id}`;

  return (
    <div>
      {children}
      <Tooltip toggle={toggle} target={validId} isOpen={tooltipOpen}>
        {text}
      </Tooltip>
    </div>
  );
}

export default TooltipX;
