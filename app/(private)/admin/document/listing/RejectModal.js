"use client";

import { ConfirmationPopover } from "@/app/shared/DeleteConfirmation";
import React, { useState } from "react";
import { Input, Label } from "reactstrap";

export const RejectPopover = ({ isOpen, toggle, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Reason is required");
      return;
    }
    setError("");
    onConfirm(reason);
    setReason("");
    togglePopover();
  };

  const togglePopover = () => {
    toggle(false);
    setReason("");
    setError("");
  };

  return (
    <ConfirmationPopover
      popoverOpen={isOpen}
      togglePopover={togglePopover}
      handleConfirm={handleConfirm}
      title="Reject Document"
      content={
        <>
          <Label for="reason">Reason</Label>
          <Input
            type="textarea"
            id="reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            placeholder="Enter rejection reason..."
          />
          {error && <div className="text-danger mt-1">{error}</div>}
        </>
      }
    />
  );
};
