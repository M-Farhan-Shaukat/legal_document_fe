"use client";
import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import ButtonX from "../ButtonX";

export const ConfirmationPopover = ({
  loading = false,
  title = "Confirmation",
  content = "Are you sure you want to proceed?",
  popoverOpen = false,
  togglePopover = () => null,
  handleConfirm = () => null,
}) => {
  return (
    <div>
      <Modal
        backdrop="static"
        keyboard={false}
        isOpen={popoverOpen}
        toggle={togglePopover}
      >
        <ModalHeader toggle={togglePopover}>{title}</ModalHeader>
        <ModalBody>{content}</ModalBody>
        <ModalFooter className='modal-footer'>
          <ButtonX
            disabled={loading}
            className="btn-quote d-flex align-items-center"
            clickHandler={handleConfirm}
          >
            Confirm
          </ButtonX>
          <ButtonX clickHandler={togglePopover}>Cancel</ButtonX>
        </ModalFooter>
      </Modal>
    </div>
  );
};
