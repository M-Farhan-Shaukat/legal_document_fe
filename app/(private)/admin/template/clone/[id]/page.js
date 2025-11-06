"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spinner, Container, Row, Form, Col } from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";

import ToastNotification from "@/app/utils/Toast";
import { LocalServer, sortData } from "@/app/utils";
import { getErrorMessage } from "@/app/utils/helper";
import { TemplateForm } from "../../create/form";
import { QuestionsListing } from "../../create/questionsListing";
import { TextEditor } from "../../create/textEditor";
import { PreviewModal } from "../../create/previewModal";
import { ConfirmationPopover } from "@/app/shared/DeleteConfirmation";
import { useFormTemplate, useUnsavedChangesWarning } from "@/app/shared/Hooks";
import { validateTemplateData } from "@/app/utils/templateValidator";
import NestedDndSidebar from "../../create/NestedDndSidebar";

const { ToastComponent } = ToastNotification;

const CloneTemplate = () => {
  const { id } = useParams();
  const router = useRouter();
  const generateSlug = () => Math.random().toString(36).substring(2, 11);

  const [pages, setPages] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [enableButton, setEnableButton] = useState(false);
  const [templateContent, setTemplateContent] = useState("");
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

  useEffect(() => {
    const fetchTemplateForClone = async () => {
      setLoading(true);
      try {
        const response = await LocalServer.get(
          `/api/template/edit?user_id=${id}`
        );
        const data = response?.data;
        
        // Set form values with "(Clone)" suffix
        formik.setValues({
          templateTitle: `${data.name || ""} (Clone)`,
          price: data.price || 0,
          notes: data.notes || "",
        });
        setTemplateContent(data.description || "");

        const originalStandalonePages = data.template.filter(
          (page) => page.type === "page"
        );
        const originalSections = data.template.filter(
          (page) => page.type === "section"
        );

        // Transform sections and generate new slugs for cloning
        const transformedSections = (originalSections || []).map(
          (section, index) => ({
            name: section.name,
            section_slug: generateSlug(), // New slug for clone
            root_order: section.root_order || index + 1,
          })
        );
        setSections(transformedSections);

        // Create mapping of old section slugs to new ones
        const sectionSlugMapping = {};
        originalSections.forEach((originalSection, index) => {
          if (transformedSections[index]) {
            sectionSlugMapping[originalSection.section_slug] = transformedSections[index].section_slug;
          }
        });

        // Create mapping of old question slugs to new ones for condition updates
        const questionSlugMapping = {};
        
        // First pass: collect all original questions and create slug mappings
        const allOriginalQuestions = [
          ...originalStandalonePages.flatMap(page => page.questions || []),
          ...originalSections.flatMap(section => 
            (section.admin_section_pages || []).flatMap(page => page.questions || [])
          )
        ];
        
        allOriginalQuestions.forEach(q => {
          const newSlug = generateSlug();
          questionSlugMapping[q.question_slug] = newSlug;
          
          // Also map sub-questions if they exist
          if (q.having_repeating_items && q.questions) {
            q.questions.forEach(subQ => {
              questionSlugMapping[subQ.question_slug] = generateSlug();
            });
          }
        });

        // Helper function to update condition references
        const updateConditionReferences = (conditions) => {
          if (!conditions || !Array.isArray(conditions)) return conditions;
          return conditions.map(condition => ({
            ...condition,
            slug: questionSlugMapping[condition.slug] || condition.slug
          }));
        };

        // Transform section pages with new slugs
        const sectionPages = (originalSections || []).flatMap((section) =>
          (section.admin_section_pages || []).map((page, index) => ({
            name: page.name,
            page_slug: generateSlug(), // New slug for clone
            page_order: parseInt(page.page_order) || index + 1,
            section_slug: sectionSlugMapping[section.section_slug] || null,
            condition_type: page.condition_type || "show_page",
            condition: page.condition ? updateConditionReferences(page.condition) : null,
            questions: (page.questions || []).map((q) => ({
              title: q.title,
              variable: q.variable,
              question_type: q.question_type,
              required: !!q.required,
              process_key: q.process_key || "normal",
              question_slug: questionSlugMapping[q.question_slug], // Use pre-generated slug
              ...(q.having_repeating_items ? { having_repeating_items: q.having_repeating_items } : {}),
              ...(q.tool_tip !== undefined && q.tool_tip !== null ? { tool_tip: q.tool_tip } : {}),
              ...(q.question_options ? { question_options: q.question_options } : {}),
              ...(q.question_conditions && q.question_conditions.condition ? { 
                question_conditions: {
                  ...q.question_conditions,
                  condition: updateConditionReferences(q.question_conditions.condition)
                }
              } : {}),
              // Handle nested questions for repeat items
              ...(q.having_repeating_items && q.questions ? {
                questions: q.questions.map((subQ) => ({
                  title: subQ.title,
                  variable: subQ.variable,
                  question_type: subQ.question_type,
                  required: !!subQ.required,
                  process_key: subQ.process_key || "normal",
                  question_slug: questionSlugMapping[subQ.question_slug], // Use pre-generated slug
                  ...(subQ.tool_tip !== undefined && subQ.tool_tip !== null ? { tool_tip: subQ.tool_tip } : {}),
                  ...(subQ.question_options ? { question_options: subQ.question_options } : {}),
                  ...(subQ.question_conditions && subQ.question_conditions.condition ? { 
                    question_conditions: {
                      ...subQ.question_conditions,
                      condition: updateConditionReferences(subQ.question_conditions.condition)
                    }
                  } : {}),
                }))
              } : {}),
            })),
          }))
        );

        // Transform standalone pages with new slugs
        const transformedStandalonePages = originalStandalonePages.map((page, index) => ({
          name: page.name,
          page_slug: generateSlug(), // New slug for clone
          page_order: parseInt(page.page_order) || index + 1,
          root_order: page.root_order || index + 1,
          section_slug: null,
          condition_type: page.condition_type || "show_page",
          condition: page.condition ? updateConditionReferences(page.condition) : null,
          questions: (page.questions || []).map((q) => ({
            title: q.title,
            variable: q.variable,
            question_type: q.question_type,
            required: !!q.required,
            process_key: q.process_key || "normal",
            question_slug: questionSlugMapping[q.question_slug], // Use pre-generated slug
            ...(q.having_repeating_items ? { having_repeating_items: q.having_repeating_items } : {}),
            ...(q.tool_tip !== undefined && q.tool_tip !== null ? { tool_tip: q.tool_tip } : {}),
            ...(q.question_options ? { question_options: q.question_options } : {}),
            ...(q.question_conditions && q.question_conditions.condition ? { 
              question_conditions: {
                ...q.question_conditions,
                condition: updateConditionReferences(q.question_conditions.condition)
              }
            } : {}),
            // Handle nested questions for repeat items
            ...(q.having_repeating_items && q.questions ? {
              questions: q.questions.map((subQ) => ({
                title: subQ.title,
                variable: subQ.variable,
                question_type: subQ.question_type,
                required: !!subQ.required,
                process_key: subQ.process_key || "normal",
                question_slug: questionSlugMapping[subQ.question_slug], // Use pre-generated slug
                ...(subQ.tool_tip !== undefined && subQ.tool_tip !== null ? { tool_tip: subQ.tool_tip } : {}),
                ...(subQ.question_options ? { question_options: subQ.question_options } : {}),
                ...(subQ.question_conditions && subQ.question_conditions.condition ? { 
                  question_conditions: {
                    ...subQ.question_conditions,
                    condition: updateConditionReferences(subQ.question_conditions.condition)
                  }
                } : {}),
              }))
            } : {}),
          })),
        }));

        const allPages = [...sectionPages, ...transformedStandalonePages];
        setPages(allPages);

        // Set first section and its first page as active
        if (transformedSections.length > 0) {
          const firstSection = transformedSections[0];
          setActiveSectionSlug(firstSection.section_slug);

          const firstPageInSection = allPages.find(
            (p) => p.section_slug === firstSection.section_slug
          );

          if (firstPageInSection) {
            setActivePageSlug(firstPageInSection.page_slug);
          } else if (allPages.length > 0) {
            setActivePageSlug(allPages[0].page_slug);
            setActiveSectionSlug(allPages[0].section_slug);
          }
        } else if (allPages.length > 0) {
          setActivePageSlug(allPages[0].page_slug);
          setActiveSectionSlug(null);
        }
      } catch (error) {
        ToastComponent("error", getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTemplateForClone();
  }, [id]);

  const handleEditorChange = (content) => {
    const value = content === "<p><br></p>" ? "" : content;
    setTemplateContent(value);
  };

  const generatePreview = () => {
    let preview = templateContent;
    const allQuestions = pages.flatMap((p) => p.questions || []);
    allQuestions.forEach((q) => {
      const regex = new RegExp(`{{${q.variable}}}`, "g");
      preview = preview.replace(regex, `[${q.title || q.variable}]`);
    });
    return preview;
  };

  const addSection = () => {
    const newSectionSlug = generateSlug();

    setSections((prev) => [
      ...prev,
      {
        name: `section ${prev.length + 1}`,
        section_slug: newSectionSlug,
        section_order: prev.length + 1,
        sort_order: pages.at(-1)?.sort_order + 1,
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
      const sectionPages = pages.filter(
        (page) => page.section_slug === sectionSlug
      );
      newPageOrder =
        Math.max(...sectionPages.map((page) => page.page_order || 0), 0) + 1;
    } else {
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
      newPageOrder = 1;
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
      setActiveSectionSlug(null);
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
      ...(q.having_repeating_items ? { having_repeating_items: q.having_repeating_items } : {}),
      ...(q.tool_tip !== undefined && q.tool_tip !== null ? { tool_tip: q.tool_tip } : {}),
      ...(q.question_options ? { question_options: q.question_options } : {}),
      // Handle nested questions for repeat items
      ...(q.having_repeating_items && q.questions ? {
        questions: q.questions.map((subQ) => ({
          title: subQ.title,
          variable: subQ.variable,
          question_type: subQ.question_type,
          required: !!subQ.required,
          process_key: "normal",
          question_slug: generateSlug(), // New slug for sub-question
          ...(subQ.tool_tip !== undefined && subQ.tool_tip !== null ? { tool_tip: subQ.tool_tip } : {}),
          ...(subQ.question_options ? { question_options: subQ.question_options } : {}),
        }))
      } : {}),
    }));

    const newPage = {
      ...originalPage,
      name: `${originalPage.name}(Copy)`,
      page_slug: generateSlug(),
      sort_order: pages.length + 1,
      questions: clonedQuestions,
    };

    setPages((prev) => [...prev, newPage]);
  };

  const addQuestion = (pageSlug, newQuestion) => {
    setPages((prev) =>
      prev.map((page) =>
        page.page_slug === pageSlug
          ? { ...page, questions: [...page.questions, newQuestion] }
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
              questions: page.questions.map((q) =>
                q.question_slug === questionSlug ? { ...q, [field]: value } : q
              ),
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
        .filter(p => p.section_slug === confirmDelete.slug)
        .flatMap(p => p.questions?.map(q => q.question_slug) || []);

      setSections((prev) =>
        prev.filter((s) => s.section_slug !== confirmDelete.slug)
      );
      
      setPages((prev) => {
        let updatedPages = prev.filter((p) => p.section_slug !== confirmDelete.slug);
        
        // Clean up conditions that reference questions from deleted section
        updatedPages = updatedPages.map(p => {
          let updatedPage = { ...p };
          
          // Clean page conditions
          if (p.condition) {
            const hasDeletedSlug = p.condition.some(cond => 
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
          const cleanedQuestions = p.questions?.map(q => {
            if (q.question_conditions?.condition) {
              const hasDeletedSlug = q.question_conditions.condition.some(cond =>
                questionSlugsToDelete.includes(cond.slug)
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
        
        return updatedPages;
      });
    } else if (confirmDelete.type === "page") {
      // Get all question slugs from this page
      const pageToDelete = pages.find(p => p.page_slug === confirmDelete.slug);
      const questionSlugsToDelete = pageToDelete?.questions?.map(q => q.question_slug) || [];

      setPages((prev) => {
        let updatedPages = prev.filter((p) => p.page_slug !== confirmDelete.slug);
        
        // Clean up conditions that reference questions from deleted page
        updatedPages = updatedPages.map(p => {
          let updatedPage = { ...p };
          
          // Clean page conditions
          if (p.condition) {
            const hasDeletedSlug = p.condition.some(cond => 
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
          const cleanedQuestions = p.questions?.map(q => {
            if (q.question_conditions?.condition) {
              const hasDeletedSlug = q.question_conditions.condition.some(cond =>
                questionSlugsToDelete.includes(cond.slug)
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

      const template = [
        ...newSections.map((section) => ({
          ...section,
          pages: section.pages.map((page) => ({
            ...page,
            questions: page.questions.map((question) => ({
              ...question,
            })),
          })),
        })),
        ...standalonePages.map((page) => ({
          ...page,
          questions: page.questions.map((question) => ({
            ...question,
          })),
        })),
      ];

      const transformedPayload = {
        name: values.templateTitle,
        price: parseFloat(values.price) || 0,
        notes: values.notes,
        description: templateContent,
        template: sortData(template),
      };

      try {
        setLoading(true);
        const response = await LocalServer.post(
          "/api/template/create",
          transformedPayload
        );

        if (response?.data?.success) {
          ToastComponent(
            "success",
            response?.data?.message || "Template cloned successfully!"
          );
          router.push("/admin/template/listing");
        } else {
          ToastComponent(
            "error",
            response?.data?.message || "Failed to clone template."
          );
        }
      } catch (error) {
        ToastComponent("error", getErrorMessage(error));
      } finally {
        setLoading(false);
        setEnableButton(false);
      }
    },
  });

  const initialQuestions = pages.flatMap((p) => p.questions);

  const isDirty = useFormTemplate({
    formikValues: formik.values,
    questions: pages.flatMap((p) => p.questions),
    initialQuestions,
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
          toggleModal={toggleModal}
          enableButton={enableButton}
          setEnableButton={setEnableButton}
        />
        <Row
          style={{ boxShadow: "2px 6px 15px 0 rgba(69, 65, 78, .1)" }}
          className="bg-white p-3 rounded"
        >
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
            <Col md={12}>
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

export default CloneTemplate;