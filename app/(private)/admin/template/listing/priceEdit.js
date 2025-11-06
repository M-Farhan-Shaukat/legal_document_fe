"use client";

import { ConfirmationPopover } from "@/app/shared/DeleteConfirmation";
import { LocalServer } from "@/app/utils";
import { getErrorMessage } from "@/app/utils/helper";
import ToastNotification from "@/app/utils/Toast";
import { useEffect, useState } from "react";
import { Input, InputGroup, InputGroupText } from "reactstrap";

const { ToastComponent } = ToastNotification;

export default function EditPriceModal({
  isOpen,
  toggle,
  template,
  onSuccess,
}) {
  const [newPrice, setNewPrice] = useState(template?.price || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNewPrice(template?.price || "");
  }, [template, isOpen]);

  const savePrice = async () => {
    setLoading(true);
    try {
      const response = await LocalServer.put(
        `/api/template/updatePrice?tempId=${template?.id}`,
        { price: newPrice }
      );
      ToastComponent("success", response?.data?.message);
      setLoading(false);
      toggle();
      onSuccess(); // refresh parent listing
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
      setLoading(false);
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (value === "" || Number(value) > 0) {
      setNewPrice(value);
    }
  };

  const handleCancel = () => {
    setNewPrice(template?.price || "");
    toggle();
  };

  return (
    <ConfirmationPopover
      loading={loading}
      popoverOpen={isOpen}
      togglePopover={handleCancel}
      handleConfirm={savePrice}
      title={`Edit Price for ${template?.name}`}
      content={
        <InputGroup>
          <InputGroupText>$</InputGroupText>
          <Input
            type="text"
            inputMode="decimal"
            // min="0"
            value={newPrice}
            onChange={handlePriceChange}
            placeholder={0}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
              }
            }}
          />
        </InputGroup>
      }
    />
  );
}
