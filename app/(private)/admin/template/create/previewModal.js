import { sanitizeQuillHTML } from "@/app/utils/quillPreview";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

export const PreviewModal = ({ modalOpen, toggleModal, generatePreview }) => {
  return (
    <Modal isOpen={modalOpen} toggle={toggleModal} size="lg">
      <ModalHeader toggle={toggleModal}>Template Preview</ModalHeader>
      <ModalBody style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <div
          dangerouslySetInnerHTML={{
            __html: sanitizeQuillHTML(generatePreview()),
          }}
          style={{ whiteSpace: "pre-wrap" }}
        />
      </ModalBody>
    </Modal>
  );
};
