"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Input,
  Label,
  Button,
  Spinner,
  CardBody,
  Container,
  FormGroup,
} from "reactstrap";
import * as Yup from "yup";
import "../document.scss";
import { useFormik } from "formik";
import { LocalServer } from "@/app/utils";
import { useRouter } from "next/navigation";
import ToastNotification from "@/app/utils/Toast";
import { getErrorMessage } from "@/app/utils/helper";
import { useUnsavedChangesWarning } from "@/app/shared/Hooks";

const { ToastComponent } = ToastNotification;

const CreateDocument = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await LocalServer.get(`/api/document/get`);
      const data = response?.data;
      setTemplates(data?.templates || []);
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const formik = useFormik({
    initialValues: {
      docTitle: "",
      templateId: "",
    },
    validationSchema: Yup.object({
      docTitle: Yup.string().required("Document title is required"),
      templateId: Yup.string().required("Please select a template"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);

        router.push(
          `/admin/document/questions?templateId=${values.templateId}&docTitle=${values.docTitle}`
        );
      } catch (err) {
        setLoading(false);
        ToastComponent("error", getErrorMessage(err));
      }
    },
  });
  const isDirty = formik.dirty;
  useUnsavedChangesWarning(isDirty);

  return (
    <>
      {loading ? (
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
      ) : (
        <Container
          fluid
          className="d-flex justify-content-center align-items-center vh-100"
        >
          <Card
            style={{ width: "500px", borderRadius: "8px" }}
            className="doc-card"
          >
            <CardBody>
              <h2 className="text-center mb-4 doc-title">Create Document</h2>

              <form onSubmit={formik.handleSubmit}>
                <FormGroup>
                  <Label>Document Title:</Label>
                  <Input
                    name="docTitle"
                    placeholder="Document title"
                    value={formik.values.docTitle}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="h-42-input"
                  />
                  {formik.touched.docTitle && formik.errors.docTitle && (
                    <div className="text-danger">{formik.errors.docTitle}</div>
                  )}
                </FormGroup>

                <FormGroup className="mt-3">
                  <Label>Template:</Label>
                  {loading ? (
                    <Spinner size="sm" color="primary" />
                  ) : (
                    <Input
                      type="select"
                      name="templateId"
                      value={formik.values.templateId}
                      onChange={formik.handleChange}
                      className="h-42-input"
                      onBlur={formik.handleBlur}
                    >
                      <option value="">Select a template</option>
                      {templates.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name}
                        </option>
                      ))}
                    </Input>
                  )}
                  {formik.touched.templateId && formik.errors.templateId && (
                    <div className="text-danger">
                      {formik.errors.templateId}
                    </div>
                  )}
                </FormGroup>

                <div className="d-flex justify-content-end mt-4">
                  <Button color="primary" type="submit">
                    Next
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </Container>
      )}
    </>
  );
};

export default CreateDocument;
