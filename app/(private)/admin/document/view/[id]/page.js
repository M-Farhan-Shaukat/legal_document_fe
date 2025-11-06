"use client";

import { ButtonX, SubHeader } from "@/app/shared";
import { LocalServer } from "@/app/utils";
import { Document } from "@/public/icons";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "reactstrap";
import { FaArrowLeft } from "react-icons/fa6";
import "../../document.scss";
import TooltipX from "@/app/shared/TooltipX";
import { TbFileDownload } from "react-icons/tb";
import { useParams, useRouter } from "next/navigation";
import { DownloadDocument, getErrorMessage } from "@/app/utils/helper";
import { TextEditor } from "../../../template/create/textEditor";
import ToastNotification from "@/app/utils/Toast";

export default function ViewDocument() {
  const { id } = useParams();
  const router = useRouter();
  const [htmlContent, setHtmlContent] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [editModal, setEditModal] = useState(false);
  const [editorValue, setEditorValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { ToastComponent } = ToastNotification;

  const fetchDocument = async () => {
    try {
      const response = await LocalServer.get(`/api/document/view?id=${id}`);
      const rawHtml = response?.data;
      setHtmlContent(rawHtml);
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
    }
  };

  useEffect(() => {
    fetchDocument();
  }, []);

  const downloadPDFById = (htmlContent) => {
    let url = `/api/document/download?id=${id}`;
    let name = htmlContent?.user_name;
    DownloadDocument(url, name, "pdf");
  };

  const handleOpenEditor = async () => {
    try {
      setLoading(true);
      const res = await LocalServer.get(
        `/api/document/description/view?id=${id}`
      );
      setEditorValue(res?.data?.description || "");
      setEditModal(true);
    } catch (err) {
      ToastComponent("error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEditor = async () => {
    try {
      setLoading(true);
      await LocalServer.put(`/api/document/description/update?id=${id}`, {
        description: editorValue,
        answers: htmlContent?.questions_answers || [],
      });
      ToastComponent("success", "Description updated successfully");
      setEditModal(false);
      fetchDocument();
    } catch (err) {
      ToastComponent("error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const renderQuestions = () => {
    if (
      !htmlContent?.questions_answers ||
      htmlContent.questions_answers.length === 0
    ) {
      return <div>No questions available for this document.</div>;
    }

    return (
      <div className="questions-container">
        {htmlContent.questions_answers.map((question, idx) => (
          <div key={idx} className="question-item">
            <div className="mb-2">{question?.question_title}</div>
            {question?.having_repeating_items ? (
              <div className="sub-questions">
                {question.questions.map((subQuestionGroup, subIdx) => (
                  <div key={subIdx} className="sub-question-group">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span>{subIdx + 1} :</span>
                      <hr style={{ flex: 1, marginLeft: "8px" }} />
                    </div>
                    {subQuestionGroup.map((subQuestion, subSubIdx) => (
                      <div key={subSubIdx}>
                        {subQuestion.question_title}
                        <div className="text-muted">{`Answer: ${subQuestion.answer}`}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted">{`Answer: ${question?.answer}`}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      {htmlContent?.description ? (
        <>
          {/* Header */}
          <div
            className="subheader--sec justify-content-between"
            style={{ display: "flex", alignItems: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{ cursor: "pointer", color: "#6c757d" }}
                onClick={() => router.back()}
                className="back-btn"
              >
                <FaArrowLeft />
              </div>
              <SubHeader
                SubHeaderLogo={Document}
                headerTitle="Document Preview"
                HeaderText=""
              />
            </div>

            <TooltipX text="Download PDF" id={`${id}d`}>
              <ButtonX
                logoClass="delete-logo"
                id={`tooltip-${id}d`}
                clickHandler={() => downloadPDFById(htmlContent)}
                className="btn-delete d-flex align-items-center"
              >
                <TbFileDownload className="me-2" />
              </ButtonX>
            </TooltipX>
          </div>

          {/* Info */}
          <div className="d-flex justify-content-between align-items-center mb-3 border-custom">
            <div>
              <div className="mb-1 doc-name">
                <span className="label">User Name</span>
                <span className="colon">:</span>
                <span className="value">{htmlContent?.user_name}</span>
              </div>
              <div className="mb-1 doc-name">
                <span className="label">Template Name</span>
                <span className="colon">:</span>
                <span className="value">{htmlContent?.template_name}</span>
              </div>
              <div className="mb-1 doc-name">
                <span className="label">Created Date</span>
                <span className="colon">:</span>
                <span className="value">
                  {moment(htmlContent?.date).format("MMM DD, YY")}
                </span>
              </div>
              <div className="mb-1 doc-name">
                <span className="label">Updated Date</span>
                <span className="colon">:</span>
                <span className="value">
                  {moment(htmlContent?.updated_date).format("MMM DD, YY")}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs mb-3">
            <ButtonX
              className={`btn-tab me-2 ${
                activeTab === "description" ? "active" : ""
              }`}
              clickHandler={() => setActiveTab("description")}
            >
              Description
            </ButtonX>
            <ButtonX
              className={`btn-tab me-2 ${
                activeTab === "questions" ? "active" : ""
              }`}
              clickHandler={() => setActiveTab("questions")}
            >
              Questions
            </ButtonX>
          </div>

          {/* Tab Content */}
          <div
            className="tab-content border-custom"
            style={{ minHeight: "250px" }}
          >
            {activeTab === "description" ? (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: "20px",
                  }}
                >
                  <ButtonX
                    className="btn-tab btn-edit"
                    clickHandler={handleOpenEditor}
                  >
                    Edit
                  </ButtonX>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: "calc(100vh - 40px)",
                    overflow: "hidden",
                  }}
                >
                  <iframe
                    src={`data:application/pdf;base64,${htmlContent?.description}`}
                    style={{
                      width: "100%",
                      height: "calc(100vh + 40px)",
                      border: "none",
                      position: "relative",
                      top: "-45px",
                    }}
                    title="doc-preview"
                  />
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: "20px",
                  }}
                >
                  <Button
                    // className="btn-tab btn-edit"
                    outline
                    color="primary"
                    onClick={() => {
                      router.push(`/admin/document/questions?id=${id}`);
                      localStorage.setItem("document_id", id);
                    }}
                  >
                    Edit
                  </Button>
                </div>
                {renderQuestions()}
              </>
            )}
          </div>

          {/* Edit Modal */}
          <Modal
            isOpen={editModal}
            toggle={() => setEditModal(!editModal)}
            size="lg"
          >
            <ModalHeader toggle={() => setEditModal(false)}>
              Edit Description
            </ModalHeader>
            <ModalBody>
              <TextEditor
                templateContent={editorValue}
                handleEditorChange={setEditorValue}
              />
            </ModalBody>
            <ModalFooter>
              <ButtonX
                className="btn-secondary"
                clickHandler={() => setEditModal(false)}
              >
                Cancel
              </ButtonX>
              <ButtonX className="btn-primary" clickHandler={handleSaveEditor}>
                {loading ? "Saving..." : "Save"}
              </ButtonX>
            </ModalFooter>
          </Modal>
        </>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
          }}
        >
          <Spinner type="grow" color="primary" />
        </div>
      )}
    </div>
  );
}
