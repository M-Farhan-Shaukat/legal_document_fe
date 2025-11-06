"use client";

import React, { useState } from "react";
import { Spinner, Container, Row, Form, Col } from "reactstrap";
import { useFormTemplate, useUnsavedChangesWarning } from "@/app/shared/Hooks";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TemplateForm } from "./form";
import { TextEditor } from "./textEditor";
import { LocalServer, sortData } from "@/app/utils";
import { PreviewModal } from "./previewModal";
import ToastNotification from "@/app/utils/Toast";
import { getErrorMessage } from "@/app/utils/helper";
import { QuestionsListing } from "./questionsListing";
import { ConfirmationPopover } from "@/app/shared/DeleteConfirmation";
// import TemplateSidebar from "./templateSidebar";
import NestedDndSidebar from "./NestedDndSidebar";
import { validateTemplateData } from "@/app/utils/templateValidator";

const { ToastComponent } = ToastNotification;

const CreateTemplate = () => {
  const router = useRouter();
  const generateSlug = () => Math.random().toString(36).substring(2, 11);
  const questions = [
    {
      title: "",
      variable: "",
      required: false,
      question_type: "text",
      process_key: "normal",
      question_slug: generateSlug(),
    },
  ];

  const [pages, setPages] = useState([
    {
      name: `page 1`,
      page_slug: generateSlug(),
      page_order: 1,
      root_order: 1,
      section_slug: null,
      condition_type: "show_page",
      condition: null,
      questions: [
        {
          title: "",
          variable: "",
          question_type: "text",
          required: false,
          process_key: "normal",
          question_slug: generateSlug(),
        },
      ],
    },
  ]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [templateContent, setTemplateContent] = useState("");
  const [enableButton, setEnableButton] = useState(false);
  const [activePageSlug, setActivePageSlug] = useState(null);
  const [activeSectionSlug, setActiveSectionSlug] = useState(null);
  const [activeTab, setActiveTab] = useState("questions");

  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    type: null,
    slug: null,
    name: "",
  });

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleEditorChange = (content) => {
    const value = content === "<p><br></p>" ? "" : content;
    setTemplateContent(value);
  };

  const generatePreview = () => {
    let preview = templateContent;
    questions.forEach((q) => {
      const regex = new RegExp(`{{${q.variable}}}`, "g");
      preview = preview.replace(regex, `[${q.title || q.variable}]`);
    });
    return preview;
  };

  const addSection = () => {
    const newSectionSlug = generateSlug();

    // Calculate highest root_order among all sections and standalone pages
    const standalonePages = pages.filter((page) => !page.section_slug);
    const allRootItems = [...sections, ...standalonePages];
    const highestRootOrder = Math.max(
      ...allRootItems.map(
        (item) => item.root_order || item.section_order || item.page_order || 0
      ),
      0
    );

    setSections((prev) => [
      ...prev,
      {
        name: `section ${prev.length + 1}`,
        section_slug: newSectionSlug,
        section_order: prev.length + 1,
        root_order: highestRootOrder + 1,
      },
    ]);
    addPage(newSectionSlug);
    setActiveSectionSlug(newSectionSlug);
  };

  const addPage = (sectionSlug = null) => {
    const newPageSlug = generateSlug();

    let newPageOrder = 1;
    let newRootOrder = 1;

    if (sectionSlug) {
      // Page inside section: calculate highest page_order within that section
      const sectionPages = pages.filter(
        (page) => page.section_slug === sectionSlug
      );
      newPageOrder =
        Math.max(...sectionPages.map((page) => page.page_order || 0), 0) + 1;
    } else {
      // Standalone page: calculate highest root_order among all root items
      const standalonePages = pages.filter((page) => !page.section_slug);
      const allRootItems = [...sections, ...standalonePages];
      newRootOrder =
        Math.max(
          ...allRootItems.map(
            (item) =>
              item.root_order || item.section_order || item.page_order || 0
          ),
          0
        ) + 1;
      newPageOrder = 1; // Default page_order for standalone pages
    }

    setPages((prev) => [
      ...prev,
      {
        name: `page ${prev.length + 1}`,
        page_slug: newPageSlug,
        page_order: newPageOrder,
        root_order: newRootOrder,
        section_slug: sectionSlug,
        condition_type: "show_page",
        condition: null,
        questions: [
          {
            title: "",
            variable: "",
            question_type: "text",
            required: false,
            process_key: "normal",
            question_slug: generateSlug(),
          },
        ],
      },
    ]);
    setActivePageSlug(newPageSlug);
    if (sectionSlug) {
      setActiveSectionSlug(sectionSlug);
    } else {
      setActiveSectionSlug(null); // Optional: clear section selection if no section
    }
  };

  const clonePage = (originalPage) => {
    const clonedQuestions = originalPage.questions.map((q) => ({
      title: q.title,
      variable: q.variable,
      question_type: q.question_type,
      required: q.required,
      process_key: "normal",
      question_slug: generateSlug(),
      ...(q.question_options ? { question_options: q.question_options } : {}),
    }));

    const newPage = {
      ...originalPage,
      name: `${originalPage.name}(Copy)`,
      page_slug: generateSlug(),
      page_order: pages.length + 1,
      questions: clonedQuestions,
    };

    setPages((prev) => [...prev, newPage]);
  };

  const addQuestion = (pageSlug, newQuestion) => {
    setPages((prev) =>
      prev.map((page) =>
        page.page_slug === pageSlug
          ? {
              ...page,
              questions: [...page.questions, newQuestion],
            }
          : page
      )
    );
  };

  const updateQuestion = (pageSlug, questionSlug, field, value) => {
    setPages((prev) =>
      prev.map((page) =>
        page.page_slug === pageSlug
          ? {
              ...page,
              questions: page.questions.map((q) => {
                if (q.question_slug === questionSlug) {
                  let updated = { ...q, [field]: value };

                  if (field === "having_repeating_items" && value === true) {
                    delete updated.process_key;
                    delete updated.question_type;
                    delete updated.variable;
                    delete updated.required;
                  }

                  return updated;
                }
                return q;
              }),
            }
          : page
      )
    );
  };

  const updatePageLogic = (pageSlug, updates) => {
    setPages((prev) =>
      prev.map((page) =>
        page.page_slug === pageSlug
          ? {
              ...page,
              ...updates,
            }
          : page
      )
    );
  };

  const deleteQuestion = (pageSlug, questionSlug) => {
    let conditionUpdated = false;

    setPages((prev) =>
      prev.map((page) => {
        let updatedPage =
          page.page_slug === pageSlug
            ? {
                ...page,
                questions: page.questions.filter(
                  (q) => q.question_slug !== questionSlug
                ),
              }
            : { ...page };

        if (page.condition) {
          const hasDeletedSlug = page.condition.some(
            (cond) => cond.slug === questionSlug
          );
          if (hasDeletedSlug) {
            conditionUpdated = true;
            updatedPage = {
              ...updatedPage,
              condition: null,
              process_key: "normal",
            };
          }
        }

        const finalQuestions = updatedPage.questions.map((q) => {
          if (q.question_conditions?.condition) {
            const hasDeletedSlug = q.question_conditions.condition.some(
              (cond) => cond.slug === questionSlug
            );
            if (hasDeletedSlug) {
              conditionUpdated = true;
              return {
                ...q,
                process_key: "normal",
                question_conditions: {
                  ...q.question_conditions,
                  condition: null,
                },
              };
            }
          }
          return q;
        });

        return { ...updatedPage, questions: finalQuestions };
      })
    );
  };

  const changePageSection = (pageSlug, newSectionSlug) => {
    setPages((prev) =>
      prev.map((page) =>
        page.page_slug === pageSlug
          ? { ...page, section_slug: newSectionSlug }
          : page
      )
    );
  };

  const requestDeleteSection = (section) => {
    setConfirmDelete({
      open: true,
      type: "section",
      slug: section.section_slug,
      name: section.name || "Untitled Section",
    });
  };

  const requestDeletePage = (page) => {
    setConfirmDelete({
      open: true,
      type: "page",
      slug: page.page_slug,
      name: page.name || "Untitled Page",
    });
  };
  const handleConfirmDelete = () => {
    if (confirmDelete.type === "section") {
      // Get all question slugs from pages in this section
      const questionSlugsToDelete = pages
        .filter((p) => p.section_slug === confirmDelete.slug)
        .flatMap((p) => p.questions?.map((q) => q.question_slug) || []);

      setSections((prev) =>
        prev.filter((s) => s.section_slug !== confirmDelete.slug)
      );

      setPages((prev) =>
        prev.map((p) => {
          if (p.section_slug === confirmDelete.slug) {
            // Move pages from deleted section to standalone
            return { ...p, section_slug: null };
          }

          // Clean up conditions that reference questions from deleted section
          let updatedPage = { ...p };

          // Clean page conditions
          if (p.condition) {
            const hasDeletedSlug = p.condition.some((cond) =>
              questionSlugsToDelete.includes(cond.slug)
            );
            if (hasDeletedSlug) {
              updatedPage = {
                ...updatedPage,
                condition: null,
                process_key: "normal",
              };
            }
          }

          // Clean question conditions
          const cleanedQuestions =
            p.questions?.map((q) => {
              if (q.question_conditions?.condition) {
                const hasDeletedSlug = q.question_conditions.condition.some(
                  (cond) => questionSlugsToDelete.includes(cond.slug)
                );
                if (hasDeletedSlug) {
                  return {
                    ...q,
                    process_key: "normal",
                    question_conditions: {
                      ...q.question_conditions,
                      condition: null,
                    },
                  };
                }
              }
              return q;
            }) || [];

          return { ...updatedPage, questions: cleanedQuestions };
        })
      );
    } else if (confirmDelete.type === "page") {
      // Get all question slugs from this page
      const pageToDelete = pages.find(
        (p) => p.page_slug === confirmDelete.slug
      );
      const questionSlugsToDelete =
        pageToDelete?.questions?.map((q) => q.question_slug) || [];

      setPages((prev) => {
        let updatedPages = prev.filter(
          (p) => p.page_slug !== confirmDelete.slug
        );

        // Clean up conditions that reference questions from deleted page
        updatedPages = updatedPages.map((p) => {
          let updatedPage = { ...p };

          // Clean page conditions
          if (p.condition) {
            const hasDeletedSlug = p.condition.some((cond) =>
              questionSlugsToDelete.includes(cond.slug)
            );
            if (hasDeletedSlug) {
              updatedPage = {
                ...updatedPage,
                condition: null,
                process_key: "normal",
              };
            }
          }

          // Clean question conditions
          const cleanedQuestions =
            p.questions?.map((q) => {
              if (q.question_conditions?.condition) {
                const hasDeletedSlug = q.question_conditions.condition.some(
                  (cond) => questionSlugsToDelete.includes(cond.slug)
                );
                if (hasDeletedSlug) {
                  return {
                    ...q,
                    process_key: "normal",
                    question_conditions: {
                      ...q.question_conditions,
                      condition: null,
                    },
                  };
                }
              }
              return q;
            }) || [];

          return { ...updatedPage, questions: cleanedQuestions };
        });

        if (activePageSlug === confirmDelete.slug) {
          setActivePageSlug(
            updatedPages.length > 0
              ? updatedPages[updatedPages.length - 1].page_slug
              : null
          );
        }
        return updatedPages;
      });
    }
    setConfirmDelete({ open: false, type: null, slug: null, name: "" });
  };

  const handleRename = (newName, type, slug) => {
    if (type === "section") {
      setSections((prev) =>
        prev.map((s) => (s.section_slug === slug ? { ...s, name: newName } : s))
      );
    } else if (type === "page") {
      setPages((prev) =>
        prev.map((p) => (p.page_slug === slug ? { ...p, name: newName } : p))
      );
    }
  };

  // const extractTemplateVariables = (templateContent) => {
  //   const variableRegex = /{{([^{}]+)}}/g;
  //   const variables = new Set();
  // const validateIfConditions = (templateString) => {
  //   const regex = /{{#if\s+[^}]+}}|{{\/if}}/g;
  //   const stack = [];
  //   let match;

  //   while ((match = variableRegex.exec(templateContent)) !== null) {
  //     const variable = match[1].trim();
  //     if (!/^\d+$/.test(variable) && !/[+\-*/]/.test(variable)) {
  //       variables.add(variable);
  //     }
  //   }

  //   return Array.from(variables);
  // };

  // const templateVariables = extractTemplateVariables(templateContent);
  // const undefinedVariables = templateVariables.filter(
  //   (variable) => !allQuestionVariables.has(variable)
  // );

  // if (undefinedVariables.length > 0) {
  //   return {
  //     valid: false,
  //     message: `Undefined variables: ${undefinedVariables.join(", ")}`,
  //   };
  // }

  const formik = useFormik({
    initialValues: {
      templateTitle: "",
      price: 0,
      notes: "",
    },
    validationSchema: Yup.object({
      templateTitle: Yup.string().required("Template title is required"),
    }),
    onSubmit: async (values) => {
      setEnableButton(true);

      const validation = validateTemplateData(templateContent, sections, pages);
      if (!validation.valid) {
        ToastComponent("error", validation.message);
        setEnableButton(false);
        return;
      }

      const { newSections, standalonePages } = validation;

      const transformedPayload = {
        name: values.templateTitle,
        notes: values.notes,
        price: parseFloat(values.price) || 0,
        description: templateContent,
        template: sortData([...newSections, ...standalonePages]),
      };

      setLoading(true);
      try {
        const response = await LocalServer.post(
          "/api/template/create",
          transformedPayload
        );
        const { data } = response;

        if (data.success) {
          ToastComponent(
            "success",
            data.message || "Template created successfully!"
          );
          router.push("/admin/template/listing");
        } else {
          ToastComponent("error", data.message || "Failed to create template.");
        }
      } catch (error) {
        ToastComponent("error", getErrorMessage(error));
      } finally {
        setLoading(false);
        setEnableButton(false);
      }
    },
  });
  const isDirty = useFormTemplate({
    formikValues: formik.values,
    initialQuestions: questions,
    questions: pages.flatMap((page) => page.questions),
    templateContent,
  });
  useUnsavedChangesWarning(isDirty);

  return (
    <Container fluid className="p-4 position-relative">
      {loading && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(255,255,255,0.6)", zIndex: 10 }}
        >
          <Spinner type="grow" color="primary" />
        </div>
      )}

      <Form onSubmit={formik.handleSubmit}>
        <TemplateForm
          formik={formik}
          isDirty={isDirty}
          toggleModal={toggleModal}
          enableButton={enableButton}
          setEnableButton={setEnableButton}
        />
        <Row className="bg-white p-3 rounded box-shadow-generic">
          <div className="d-flex border-bottom mb-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("questions");
              }}
              className={`tab-btn ${
                activeTab === "questions" ? "active-tab" : ""
              }`}
            >
              Questions
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("editor");
              }}
              className={`tab-btn ${
                activeTab === "editor" ? "active-tab" : ""
              }`}
            >
              Editor
            </button>
          </div>

          {activeTab === "questions" ? (
            <>
              <Col md={3}>
                <NestedDndSidebar
                  sections={sections}
                  setSections={setSections}
                  setPages={setPages}
                  pages={pages}
                  addPage={addPage}
                  addSection={addSection}
                  activePageSlug={activePageSlug}
                  setActivePageSlug={setActivePageSlug}
                  activeSectionSlug={activeSectionSlug}
                  setActiveSectionSlug={setActiveSectionSlug}
                />
              </Col>
              <Col md={9}>
                <QuestionsListing
                  pages={pages}
                  addPage={addPage}
                  setPages={setPages}
                  sections={sections}
                  activePageSlug={activePageSlug}
                  activeSectionSlug={activeSectionSlug}
                  clonePage={clonePage}
                  addSection={addSection}
                  addQuestion={addQuestion}
                  handleRename={handleRename}
                  deletePage={requestDeletePage}
                  updateQuestion={updateQuestion}
                  deleteQuestion={deleteQuestion}
                  updatePageLogic={updatePageLogic}
                  deleteSection={requestDeleteSection}
                  changePageSection={changePageSection}
                />
              </Col>
            </>
          ) : (
            <Col md={12} className="min-width-100">
              <TextEditor
                disabled={loading}
                templateContent={templateContent}
                handleEditorChange={handleEditorChange}
                variables={pages.flatMap((page) =>
                  page.questions
                    .filter((q) => q.variable?.trim())
                    .map((q) => ({
                      label: q.variable || "(Untitled Question)",
                      value: q.variable,
                    }))
                )}
              />
            </Col>
          )}
        </Row>
      </Form>
      <PreviewModal
        modalOpen={modalOpen}
        toggleModal={toggleModal}
        generatePreview={generatePreview}
      />

      <ConfirmationPopover
        popoverOpen={confirmDelete.open}
        title={`Delete ${
          confirmDelete.type === "section" ? "Section" : "Page"
        }`}
        content={`Are you sure you want to delete "${confirmDelete.name}"?`}
        togglePopover={() =>
          setConfirmDelete({ open: false, type: null, slug: null, name: "" })
        }
        handleConfirm={handleConfirmDelete}
      />
    </Container>
  );
};

export default CreateTemplate;
