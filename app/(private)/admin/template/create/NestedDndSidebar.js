"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import {
  FaPlus,
  FaFolder,
  FaFileAlt,
  FaChevronDown,
  FaChevronRight,
  FaGripVertical,
  FaQuestion,
  FaLayerGroup,
  FaFile,
  FaExclamationTriangle,
} from "react-icons/fa";

const SortableItem = ({ id, children, type, data }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id,
    data: { type, ...data },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease",
    opacity: isDragging ? 0.6 : 1,
    scale: isDragging ? 1.02 : 1,
    zIndex: isDragging ? 999 : "auto",
    boxShadow: isDragging ? "0 8px 25px rgba(0,0,0,0.15)" : "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-item ${isDragging ? "dragging" : ""} ${
        isOver ? "drag-over" : ""
      }`}>
      {typeof children === "function"
        ? children({ attributes, listeners, isDragging, isOver })
        : React.cloneElement(children, {
            dragAttributes: attributes,
            dragListeners: listeners,
            isDragging,
            isOver,
          })}
    </div>
  );
};

const NestedDndSidebar = ({
  sections,
  setSections,
  pages,
  setPages,
  activePageSlug,
  setActivePageSlug,
  activeSectionSlug,
  setActiveSectionSlug,
  addPage,
  addSection,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [collapsedPages, setCollapsedPages] = useState(new Set());
  const [collapsedSections, setCollapsedSections] = useState(new Set());
  const [dragOverId, setDragOverId] = useState(null);
  const [dragOverType, setDragOverType] = useState(null);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [conditionModalData, setConditionModalData] = useState(null);
  const [pendingDragAction, setPendingDragAction] = useState(null);

  const [newpages, setNewpages] = useState(pages);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const rootItems = useMemo(() => {
    const standalonePages = pages
      .filter((page) => !page.section_slug)
      .map((page) => ({
        id: page.page_slug,
        type: "page",
        data: page,
        page_order: page.page_order || 0,
        root_order: page.root_order || page.page_order || 0,
      }));

    const sectionsWithOrder = sections.map((section) => ({
      id: section.section_slug,
      type: "section",
      data: section,
      section_order: section.section_order || 0,
      root_order: section.root_order || section.section_order || 0,
    }));

    const combined = [...standalonePages, ...sectionsWithOrder];
    const result = combined.sort(
      (a, b) => (a.root_order || 0) - (b.root_order || 0)
    );

    return result;
  }, [pages, sections]);

  const getSectionPages = (sectionSlug) => {
    return pages
      .filter((page) => page.section_slug === sectionSlug)
      .sort((a, b) => (a.page_order || 0) - (b.page_order || 0));
  };

  const getPageQuestions = (pageSlug) => {
    const page = pages.find((p) => p.page_slug === pageSlug);
    return page?.questions || [];
  };

  const findQuestionDependencies = (question) => {
    const dependencies = [];

    if (
      question.question_conditions &&
      question.question_conditions.condition &&
      Array.isArray(question.question_conditions.condition)
    ) {
      question.question_conditions.condition.forEach((condition) => {
        if (condition.slug) {
          dependencies.push({
            type: "question",
            slug: condition.slug,
            condition: condition,
          });
        }
      });
    }

    if (
      question.question_conditions &&
      Array.isArray(question.question_conditions)
    ) {
      question.question_conditions.forEach((condition) => {
        if (condition.question_slug || condition.slug) {
          dependencies.push({
            type: "question",
            slug: condition.question_slug || condition.slug,
            condition: condition,
          });
        }
      });
    }

    if (question.conditions && Array.isArray(question.conditions)) {
      question.conditions.forEach((condition) => {
        if (condition.question_slug || condition.slug) {
          dependencies.push({
            type: "question",
            slug: condition.question_slug || condition.slug,
            condition: condition,
          });
        }
      });
    }

    if (question.condition_type && question.condition) {
      try {
        const conditionObj =
          typeof question.condition === "string"
            ? JSON.parse(question.condition)
            : question.condition;
        if (conditionObj.question_slug || conditionObj.slug) {
          dependencies.push({
            type: "question",
            slug: conditionObj.question_slug || conditionObj.slug,
            condition: conditionObj,
          });
        }
      } catch (e) {}
    }

    return dependencies;
  };

  const findQuestionDependents = (questionSlug) => {
    const dependents = [];

    pages.forEach((page) => {
      page.questions?.forEach((question) => {
        const deps = findQuestionDependencies(question);
        deps.forEach((dep) => {
          if (dep.slug === questionSlug) {
            dependents.push({
              type: "question",
              slug: question.question_slug,
              condition: dep.condition,
            });
          }
        });
      });
    });

    pages.forEach((page) => {
      const deps = findPageDependencies(page);
      deps.forEach((dep) => {
        if (dep.type === "question" && dep.slug === questionSlug) {
          dependents.push({
            type: "page",
            slug: page.page_slug,
            condition: dep.condition,
          });
        }
      });
    });

    sections.forEach((section) => {
      const deps = findSectionDependencies(section);
      deps.forEach((dep) => {
        if (dep.type === "question" && dep.slug === questionSlug) {
          dependents.push({
            type: "section",
            slug: section.section_slug,
            condition: dep.condition,
          });
        }
      });
    });
    return dependents;
  };

  const findPageDependencies = (page) => {
    const dependencies = [];

    if (page.condition_type && page.condition) {
      try {
        const conditionObj =
          typeof page.condition === "string"
            ? JSON.parse(page.condition)
            : page.condition;
        if (conditionObj.question_slug) {
          dependencies.push({
            type: "question",
            slug: conditionObj.question_slug,
            condition: conditionObj,
          });
        }
        if (conditionObj.page_slug) {
          dependencies.push({
            type: "page",
            slug: conditionObj.page_slug,
            condition: conditionObj,
          });
        }
      } catch (e) {}
    }

    return dependencies;
  };

  const findPageDependents = (pageSlug) => {
    const dependents = [];

    pages.forEach((p) => {
      const deps = findPageDependencies(p);
      deps.forEach((dep) => {
        if (dep.type === "page" && dep.slug === pageSlug) {
          dependents.push({
            type: "page",
            slug: p.page_slug,
            condition: dep.condition,
          });
        }
      });
    });

    sections.forEach((s) => {
      const deps = findSectionDependencies(s);
      deps.forEach((dep) => {
        if (dep.type === "page" && dep.slug === pageSlug) {
          dependents.push({
            type: "section",
            slug: s.section_slug,
            condition: dep.condition,
          });
        }
      });
    });
    return dependents;
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.data.current.name);
    setDragOverId(null);
    setDragOverType(null);
  };
  const findSectionDependencies = (section) => {
    const dependencies = [];

    if (section.condition_type && section.condition) {
      try {
        const conditionObj =
          typeof section.condition === "string"
            ? JSON.parse(section.condition)
            : section.condition;
        if (conditionObj.question_slug) {
          dependencies.push({
            type: "question",
            slug: conditionObj.question_slug,
            condition: conditionObj,
          });
        }
        if (conditionObj.page_slug) {
          dependencies.push({
            type: "page",
            slug: conditionObj.page_slug,
            condition: conditionObj,
          });
        }
        if (conditionObj.section_slug) {
          dependencies.push({
            type: "section",
            slug: conditionObj.section_slug,
            condition: conditionObj,
          });
        }
      } catch (e) {}
    }

    return dependencies;
  };
  const findSectionDependents = (sectionSlug) => {
    const dependents = [];

    sections.forEach((s) => {
      const deps = findSectionDependencies(s);
      deps.forEach((dep) => {
        if (dep.type === "section" && dep.slug === sectionSlug) {
          dependents.push({
            type: "section",
            slug: s.section_slug,
            condition: dep.condition,
          });
        }
      });
    });
    return dependents;
  };

  const pageHasLogic = (pageSlug) => {
    const page = pages.find((p) => p.page_slug === pageSlug);
    if (!page) return false;

    if (page.condition_type && page.condition) {
      return true;
    }

    const pageQuestions = getPageQuestions(pageSlug);
    return pageQuestions.some((question) => {
      if (question.condition_type && question.condition) return true;
      if (
        question.question_conditions &&
        question.question_conditions.condition &&
        Array.isArray(question.question_conditions.condition) &&
        question.question_conditions.condition.length > 0
      )
        return true;
      if (
        question.question_conditions &&
        Array.isArray(question.question_conditions) &&
        question.question_conditions.length > 0
      )
        return true;
      if (
        question.conditions &&
        Array.isArray(question.conditions) &&
        question.conditions.length > 0
      )
        return true;

      return false;
    });
  };

  const sectionHasLogic = (sectionSlug) => {
    const section = sections.find((s) => s.section_slug === sectionSlug);
    if (!section) return false;

    if (section.condition_type && section.condition) {
      return true;
    }

    const sectionPages = getSectionPages(sectionSlug);
    return sectionPages.some((page) => pageHasLogic(page.page_slug));
  };

  const getQuestionGlobalPosition = (questionSlug) => {
    for (const page of pages) {
      const questionIndex = page.questions?.findIndex(
        (q) => q.question_slug === questionSlug
      );
      if (questionIndex !== -1) {
        let pagePosition = 0;
        if (page.section_slug) {
          const section = sections.find(
            (s) => s.section_slug === page.section_slug
          );
          const sectionRootOrder = section?.root_order || 0;
          pagePosition = sectionRootOrder * 1000 + (page.page_order || 0);
        } else {
          pagePosition = (page.root_order || 0) * 1000;
        }

        return pagePosition + questionIndex;
      }
    }
    return -1;
  };

  const validateQuestionMove = (
    questionSlug,
    targetPageSlug,
    targetPosition
  ) => {
    const question = pages
      .flatMap((p) => p.questions || [])
      .find((q) => q.question_slug === questionSlug);

    if (!question) {
      return { valid: true };
    }

    const dependencies = findQuestionDependencies(question);

    const dependents = findQuestionDependents(questionSlug);

    const brokenConditions = [];

    const targetPage = pages.find((p) => p.page_slug === targetPageSlug);
    if (!targetPage) {
      return { valid: true };
    }

    let targetGlobalPosition = 0;
    if (targetPage.section_slug) {
      const section = sections.find(
        (s) => s.section_slug === targetPage.section_slug
      );
      const sectionRootOrder = section?.root_order || 0;
      targetGlobalPosition =
        sectionRootOrder * 1000 + (targetPage.page_order || 0) + targetPosition;
    } else {
      targetGlobalPosition =
        (targetPage.root_order || 0) * 1000 + targetPosition;
    }

    dependencies.forEach((dep) => {
      if (dep.type === "question") {
        const depQuestion = pages
          .flatMap((p) => p.questions || [])
          .find((q) => q.question_slug === dep.slug);

        if (depQuestion) {
          const depPage = pages.find((p) =>
            p.questions?.some((q) => q.question_slug === dep.slug)
          );

          if (depPage?.page_slug === targetPageSlug) {
            const depPosition = depPage.questions.findIndex(
              (q) => q.question_slug === dep.slug
            );

            if (targetPosition <= depPosition) {
              brokenConditions.push({
                type: "question_order",
                dependentType: "question",
                dependent: question.title || question.name || questionSlug,
                dependentSlug: questionSlug,
                dependencyType: "question",
                dependency: depQuestion.title || depQuestion.name || dep.slug,
                dependencySlug: dep.slug,
                reason: "Question cannot be moved above its dependency",
              });
            }
          } else {
            const depGlobalPosition = getQuestionGlobalPosition(dep.slug);

            if (targetGlobalPosition <= depGlobalPosition) {
              brokenConditions.push({
                type: "question_page_order",
                dependentType: "question",
                dependent: question.title || question.name || questionSlug,
                dependentSlug: questionSlug,
                dependencyType: "question",
                dependency: depQuestion.title || depQuestion.name || dep.slug,
                dependencySlug: dep.slug,
                reason:
                  "Question cannot be moved above its dependency in global order",
              });
            }
          }
        }
      }
    });

    dependents.forEach((dep) => {
      if (dep.type === "question") {
        const depQuestion = pages
          .flatMap((p) => p.questions || [])
          .find((q) => q.question_slug === dep.slug);
        if (depQuestion) {
          const depPage = pages.find((p) =>
            p.questions?.some((q) => q.question_slug === dep.slug)
          );
          if (depPage?.page_slug === targetPageSlug) {
            const depPosition = depPage.questions.findIndex(
              (q) => q.question_slug === dep.slug
            );
            if (targetPosition >= depPosition) {
              brokenConditions.push({
                type: "question_order",
                dependentType: "question",
                dependent: depQuestion.title || depQuestion.name || dep.slug,
                dependentSlug: dep.slug,
                dependencyType: "question",
                dependency: question.title || question.name || questionSlug,
                dependencySlug: questionSlug,
                reason: "Cannot move dependency below its dependent question",
              });
            }
          } else {
            const depGlobalPosition = getQuestionGlobalPosition(dep.slug);

            if (targetGlobalPosition >= depGlobalPosition) {
              brokenConditions.push({
                type: "question_page_order",
                dependentType: "question",
                dependent: depQuestion.title || depQuestion.name || dep.slug,
                dependentSlug: dep.slug,
                dependencyType: "question",
                dependency: question.title || question.name || questionSlug,
                dependencySlug: questionSlug,
                reason:
                  "Cannot move dependency below its dependent question in global order",
              });
            }
          }
        }
      } else if (dep.type === "page") {
        const depPage = pages.find((p) => p.page_slug === dep.slug);
        const targetSection = pages.find(
          (p) => p.page_slug === targetPageSlug
        )?.section_slug;
        if (targetSection !== depPage.section_slug) {
          brokenConditions.push({
            type: "page_question_dependency",
            dependentType: "page",
            dependent: depPage.name || dep.slug,
            dependentSlug: dep.slug,
            dependencyType: "question",
            dependency: question.title || question.name || questionSlug,
            dependencySlug: questionSlug,
            reason: "Moving question to different section from dependent page",
          });
        }
      } else if (dep.type === "section") {
        const depSection = sections.find((s) => s.section_slug === dep.slug);
        brokenConditions.push({
          type: "section_question_dependency",
          dependentType: "section",
          dependent: depSection.name || dep.slug,
          dependentSlug: dep.slug,
          dependencyType: "question",
          dependency: question.title || question.name || questionSlug,
          dependencySlug: questionSlug,
          reason: "Section depends on this question",
        });
      }
    });

    return {
      valid: brokenConditions.length === 0,
      brokenConditions,
    };
  };

  const validatePageMove = (pageSlug, targetSectionSlug, targetPosition) => {
    const page = pages.find((p) => p.page_slug === pageSlug);
    if (!page) {
      return { valid: true };
    }

    const dependencies = findPageDependencies(page);
    const dependents = findPageDependents(pageSlug);
    const brokenConditions = [];

    const movingPageQuestions = getPageQuestions(pageSlug);

    let updatedPages = [...pages];
    const currentIndex = updatedPages.findIndex(
      (p) => p.page_slug === pageSlug
    );
    const movingPage = { ...updatedPages[currentIndex] };

    updatedPages.splice(currentIndex, 1);

    const adjustedTargetPosition = targetPosition + 1;
    let targetIndex = targetPosition;

    if (targetIndex > updatedPages.length) {
      targetIndex = updatedPages.length;
    }

    movingPage.section_slug = targetSectionSlug;
    movingPage.page_order = targetSectionSlug
      ? adjustedTargetPosition
      : undefined;
    movingPage.root_order = targetSectionSlug
      ? undefined
      : adjustedTargetPosition;
    updatedPages.splice(targetIndex, 0, movingPage);

    updatedPages = updatedPages.map((p, index) => {
      if (!p.section_slug) {
        return { ...p, root_order: index + 1 };
      }
      return p;
    });

    let movingPageGlobalPosition;
    if (targetSectionSlug) {
      const targetSection = sections.find(
        (s) => s.section_slug === targetSectionSlug
      );
      const sectionRootOrder = targetSection?.root_order || 0;
      movingPageGlobalPosition =
        sectionRootOrder * 1000 + adjustedTargetPosition;
    } else {
      movingPageGlobalPosition = adjustedTargetPosition * 1000;
    }

    const getUpdatedQuestionGlobalPosition = (questionSlug) => {
      for (const page of updatedPages) {
        const questionIndex =
          page.questions?.findIndex((q) => q.question_slug === questionSlug) ||
          0;
        if (questionIndex !== -1) {
          let pagePosition = 0;
          if (page.section_slug) {
            const section = sections.find(
              (s) => s.section_slug === page.section_slug
            );
            const sectionRootOrder = section?.root_order || 0;
            pagePosition = sectionRootOrder * 1000 + (page.page_order || 0);
          } else {
            pagePosition = (page.root_order || 0) * 1000;
          }
          return pagePosition + questionIndex;
        }
      }

      return -1;
    };

    movingPageQuestions.forEach((question) => {
      const questionDependencies = findQuestionDependencies(question);

      questionDependencies.forEach((dep) => {
        if (dep.type === "question") {
          const depPage = updatedPages.find((p) =>
            p.questions?.some((q) => q.question_slug === dep.slug)
          );
          if (!depPage) {
            return;
          }

          const depQuestion = depPage.questions.find(
            (q) => q.question_slug === dep.slug
          );
          if (!depQuestion) {
            return;
          }

          const depGlobalPosition = getUpdatedQuestionGlobalPosition(dep.slug);

          if (depGlobalPosition === -1) return;

          if (movingPageGlobalPosition <= depGlobalPosition) {
            brokenConditions.push({
              type: "question_page_order",
              dependentType: "question",
              dependent:
                question.title || question.name || question.question_slug,
              dependentSlug: question.question_slug,
              dependencyType: "question",
              dependency: depQuestion.title || depQuestion.name || dep.slug,
              dependencySlug: dep.slug,
              reason:
                "Cannot move page containing a question before the page containing its dependency question in global order",
            });
          }
        }
      });
    });

    movingPageQuestions.forEach((question) => {
      const questionDependents = findQuestionDependents(question.question_slug);

      questionDependents.forEach((dep) => {
        if (dep.type === "question") {
          const depQuestion = updatedPages
            .flatMap((p) => p.questions || [])
            .find((q) => q.question_slug === dep.slug);
          if (!depQuestion) {
            return;
          }

          const depPage = updatedPages.find((p) =>
            p.questions?.some((q) => q.question_slug === dep.slug)
          );
          if (!depPage) {
            return;
          }

          const depGlobalPosition = getUpdatedQuestionGlobalPosition(dep.slug);

          if (depGlobalPosition === -1) return;

          if (movingPageGlobalPosition >= depGlobalPosition) {
            brokenConditions.push({
              type: "question_page_order",
              dependentType: "question",
              dependent: depQuestion.title || depQuestion.name || dep.slug,
              dependentSlug: dep.slug,
              dependencyType: "question",
              dependency:
                question.title || question.name || question.question_slug,
              dependencySlug: question.question_slug,
              reason:
                "Cannot move page containing a question after a question that depends on it in global order",
            });
          }
        }
      });
    });

    return {
      valid: brokenConditions.length === 0,
      brokenConditions,
    };
  };

  const validateSectionMove = (sectionSlug, targetPosition) => {
    const section = sections.find((s) => s.section_slug === sectionSlug);
    if (!section) {
      return { valid: true };
    }

    const dependencies = findSectionDependencies(section);
    const dependents = findSectionDependents(sectionSlug);
    const brokenConditions = [];

    const sectionPages = getSectionPages(sectionSlug);

    let updatedSections = [...sections];
    let updatedPages = [...pages];
    const currentSectionIndex = updatedSections.findIndex(
      (s) => s.section_slug === sectionSlug
    );
    const movingSection = { ...updatedSections[currentSectionIndex] };

    updatedSections.splice(currentSectionIndex, 1);

    const adjustedTargetPosition = targetPosition + 1;
    let targetIndex = targetPosition;

    if (targetIndex > updatedSections.length) {
      targetIndex = updatedSections.length;
    }

    movingSection.root_order = adjustedTargetPosition;
    updatedSections.splice(targetIndex, 0, movingSection);

    updatedSections = updatedSections.map((s, index) => ({
      ...s,
      root_order: index + 1,
    }));

    updatedPages = updatedPages.map((p) => {
      const pageSection = updatedSections.find(
        (s) => s.section_slug === p.section_slug
      );
      if (pageSection) {
        if (p.section_slug === sectionSlug) {
          return { ...p, page_order: p.page_order || 1 };
        }
        return { ...p };
      } else {
        return { ...p };
      }
    });

    const sectionGlobalPosition = adjustedTargetPosition * 1000;

    const getUpdatedQuestionGlobalPosition = (questionSlug) => {
      for (const page of updatedPages) {
        const questionIndex =
          page.questions?.findIndex((q) => q.question_slug === questionSlug) ||
          0;
        if (questionIndex !== -1) {
          let pagePosition = 0;
          if (page.section_slug) {
            const section = updatedSections.find(
              (s) => s.section_slug === page.section_slug
            );
            const sectionRootOrder = section?.root_order || 0;
            pagePosition = sectionRootOrder * 1000 + (page.page_order || 0);
          } else {
            pagePosition = (page.root_order || 0) * 1000;
          }
          return pagePosition + questionIndex;
        }
      }
      return -1;
    };

    sectionPages.forEach((page) => {
      const movingPageQuestions = getPageQuestions(page.page_slug);
      movingPageQuestions.forEach((question) => {
        const questionDependencies = findQuestionDependencies(question);

        questionDependencies.forEach((dep) => {
          if (dep.type === "question") {
            const depPage = updatedPages.find((p) =>
              p.questions?.some((q) => q.question_slug === dep.slug)
            );
            if (!depPage) {
              return;
            }

            const depQuestion = depPage.questions.find(
              (q) => q.question_slug === dep.slug
            );
            if (!depQuestion) {
              return;
            }

            const depGlobalPosition = getUpdatedQuestionGlobalPosition(
              dep.slug
            );

            if (depGlobalPosition === -1) return;

            const pageGlobalPosition = page.section_slug
              ? adjustedTargetPosition * 1000 + (page.page_order || 0)
              : (page.root_order || 0) * 1000;
            if (pageGlobalPosition <= depGlobalPosition) {
              brokenConditions.push({
                type: "question_section_order",
                dependentType: "question",
                dependent:
                  question.title || question.name || question.question_slug,
                dependentSlug: question.question_slug,
                dependencyType: "question",
                dependency: depQuestion.title || depQuestion.name || dep.slug,
                dependencySlug: dep.slug,
                reason:
                  "Cannot move section containing a question before the page containing its dependency question",
              });
            }
          }
        });
      });
    });

    sectionPages.forEach((page) => {
      const movingPageQuestions = getPageQuestions(page.page_slug);
      movingPageQuestions.forEach((question) => {
        const questionDependents = findQuestionDependents(
          question.question_slug
        );

        questionDependents.forEach((dep) => {
          if (dep.type === "question") {
            const depQuestion = updatedPages
              .flatMap((p) => p.questions || [])
              .find((q) => q.question_slug === dep.slug);
            if (!depQuestion) {
              return;
            }

            const depPage = updatedPages.find((p) =>
              p.questions?.some((q) => q.question_slug === dep.slug)
            );
            if (!depPage) {
              return;
            }

            const depGlobalPosition = getUpdatedQuestionGlobalPosition(
              dep.slug
            );

            if (depGlobalPosition === -1) return;

            const pageGlobalPosition = page.section_slug
              ? adjustedTargetPosition * 1000 + (page.page_order || 0)
              : (page.root_order || 0) * 1000;

            if (pageGlobalPosition >= depGlobalPosition) {
              brokenConditions.push({
                type: "question_section_order",
                dependentType: "question",
                dependent: depQuestion.title || depQuestion.name || dep.slug,
                dependentSlug: dep.slug,
                dependencyType: "question",
                dependency:
                  question.title || question.name || question.question_slug,
                dependencySlug: question.question_slug,
                reason:
                  "Cannot move section containing a question after a question that depends on it in global order",
              });
            }
          }
        });
      });
    });

    dependencies.forEach((dep) => {
      if (dep.type === "section") {
        const depSection = updatedSections.find(
          (s) => s.section_slug === dep.slug
        );
        if (depSection) {
          const depRootOrder = depSection.root_order || 0;
          if (adjustedTargetPosition <= depRootOrder) {
            brokenConditions.push({
              type: "section_order",
              dependentType: "section",
              dependent: section.name || sectionSlug,
              dependentSlug: sectionSlug,
              dependencyType: "section",
              dependency: depSection.name || dep.slug,
              dependencySlug: dep.slug,
              reason: "Section cannot be moved above its dependency",
            });
          }
        }
      } else if (dep.type === "page") {
        const depPage = updatedPages.find((p) => p.page_slug === dep.slug);
        if (depPage) {
          if (!depPage.section_slug) {
            const depRootOrder = depPage.root_order || 0;
            if (adjustedTargetPosition <= depRootOrder) {
              brokenConditions.push({
                type: "section_page_order",
                dependentType: "section",
                dependent: section.name || sectionSlug,
                dependentSlug: sectionSlug,
                dependencyType: "page",
                dependency: depPage.name || dep.slug,
                dependencySlug: dep.slug,
                reason: "Section cannot be moved above its dependency page",
              });
            }
          } else {
            brokenConditions.push({
              type: "section_page_dependency",
              dependentType: "section",
              dependent: section.name || sectionSlug,
              dependentSlug: sectionSlug,
              dependencyType: "page",
              dependency: depPage.name || dep.slug,
              dependencySlug: dep.slug,
              reason: "Section depends on a page in a section",
            });
          }
        }
      } else if (dep.type === "question") {
        brokenConditions.push({
          type: "section_question_dependency",
          dependentType: "section",
          dependent: section.name || sectionSlug,
          dependentSlug: sectionSlug,
          dependencyType: "question",
          dependency: dep.slug,
          dependencySlug: dep.slug,
          reason: "Section depends on a question",
        });
      }
    });

    dependents.forEach((dep) => {
      if (dep.type === "section") {
        const depSection = updatedSections.find(
          (s) => s.section_slug === dep.slug
        );
        if (depSection) {
          const depRootOrder = depSection.root_order || 0;
          if (adjustedTargetPosition >= depRootOrder) {
            brokenConditions.push({
              type: "section_order",
              dependentType: "section",
              dependent: depSection.name || dep.slug,
              dependentSlug: dep.slug,
              dependencyType: "section",
              dependency: section.name || sectionSlug,
              dependencySlug: sectionSlug,
              reason:
                "Cannot move dependency section below its dependent section",
            });
          }
        }
      }
    });

    return {
      valid: brokenConditions.length === 0,
      brokenConditions,
    };
  };

  const removeBrokenConditions = (brokenConditions) => {
    let updatedPages = [...pages];
    let updatedSections = [...sections];
    brokenConditions.forEach((broken) => {
      if (broken.dependentType === "question") {
        updatedPages = updatedPages.map((page) => ({
          ...page,
          questions: (page.questions || []).map((question) => {
            if (question.question_slug === broken.dependentSlug) {
              // console.log("Removing conditions from question:", { question });
              return {
                ...question,
                process_key: "normal",
                question_conditions: null,
              };
            }
            return question;
          }),
        }));
        executeDragAction(pendingDragAction, false, updatedPages);
        return;
      } else if (broken.dependentType === "page") {
        updatedPages = updatedPages.map((page) => {
          if (page.page_slug === broken.dependentSlug) {
            if (page.condition_type && page.condition) {
              try {
                const condObj =
                  typeof page.condition === "string"
                    ? JSON.parse(page.condition)
                    : page.condition;
                if (
                  (condObj.question_slug ||
                    condObj.page_slug ||
                    condObj.slug) === broken.dependencySlug
                ) {
                  return {
                    ...page,
                    condition_type: undefined,
                    condition: undefined,
                  };
                }
              } catch (e) {}
            }
          }
          return page;
        });
      } else if (broken.dependentType === "section") {
        updatedSections = updatedSections.map((section) => {
          if (section.section_slug === broken.dependentSlug) {
            if (section.condition_type && section.condition) {
              try {
                const condObj =
                  typeof section.condition === "string"
                    ? JSON.parse(section.condition)
                    : section.condition;
                if (
                  (condObj.question_slug ||
                    condObj.page_slug ||
                    condObj.section_slug ||
                    condObj.slug) === broken.dependencySlug
                ) {
                  return {
                    ...section,
                    condition_type: undefined,
                    condition: undefined,
                  };
                }
              } catch (e) {}
            }
          }
          return section;
        });
      }
    });

    // if (broken.dependentType != "question") {
    // setPages(updatedPages);
    // setSections(updatedSections);
    // }
  };

  useEffect(() => {
    if (newpages) {
      setPages(newpages);
      setNewpages(null);
    }
  }, [newpages]);

  const handleConditionModalConfirm = () => {
    // console.log({ conditionModalData });
    if (pendingDragAction && conditionModalData) {
      if (
        conditionModalData.itemType === "swap" &&
        conditionModalData.swapType === "page"
      ) {
        setTimeout(() => {
          executeDragAction(pendingDragAction, true);
        }, 50);
      } else {
        removeBrokenConditions(conditionModalData.brokenConditions);

        // executeDragAction(pendingDragAction, true);
      }
    }

    setShowConditionModal(false);
    setConditionModalData(null);
    setPendingDragAction(null);
  };

  const handleConditionModalCancel = () => {
    setShowConditionModal(false);
    setConditionModalData(null);
    setPendingDragAction(null);
  };

  const executeDragAction = (
    dragAction,
    removelogic = false,
    logicremovepages = false
  ) => {
    const { activeId, overId, activeItem, overItem } = dragAction;

    if (activeItem?.type === "section" && overItem?.type === "section") {
      const activeSectionSlug = activeId;
      const overSectionSlug = overId;

      const currentSections = [...sections];
      const oldIndex = currentSections.findIndex(
        (s) => s.section_slug === activeSectionSlug
      );
      const newIndex = currentSections.findIndex(
        (s) => s.section_slug === overSectionSlug
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = arrayMove(currentSections, oldIndex, newIndex);

        const updatedSections = newSections.map((section, index) => ({
          ...section,
          root_order: index + 1,
        }));

        setSections(updatedSections);
        return;
      }
    }

    if (activeItem?.type === "page" && overItem?.type === "page") {
      if (!activeItem.section_slug && !overItem.section_slug) {
        const activeIndex = rootItems.findIndex((item) => item.id === activeId);
        const overIndex = rootItems.findIndex((item) => item.id === overId);

        if (activeIndex !== -1 && overIndex !== -1) {
          const newRootItems = arrayMove(rootItems, activeIndex, overIndex);

          const updatedPages = [...pages];

          newRootItems.forEach((item, index) => {
            const rootOrder = index + 1;

            if (item.type === "page") {
              const pageIndex = updatedPages.findIndex(
                (p) => p.page_slug === item.id
              );

              if (pageIndex !== -1) {
                updatedPages[pageIndex] = {
                  ...updatedPages[pageIndex],
                  root_order: rootOrder,
                };
              }
            }
          });
          if (removelogic) {
            const update = updatedPages.map((value) => {
              if (
                conditionModalData?.logicItems?.some(
                  (item) => item.slug === value.page_slug
                )
              ) {
                return {
                  ...value,
                  condition_type: null,
                  condition: null,
                  questions: value?.questions.map((q) => ({
                    ...q,
                    process_key: "normal",
                    question_conditions: null,
                  })),
                };
              }
              return value;
            });
            setPages(update);
            return;
          }

          setPages(updatedPages);
          return;
        } else {
          const updatedPages = [...pages];
          const activePageIndex = updatedPages.findIndex(
            (p) => p.page_slug === activeId
          );
          const overPageIndex = updatedPages.findIndex(
            (p) => p.page_slug === overId
          );

          if (activePageIndex !== -1 && overPageIndex !== -1) {
            const newPages = arrayMove(
              updatedPages,
              activePageIndex,
              overPageIndex
            );

            setPages(newPages);
            return;
          }
        }
      }
    }

    if (activeItem?.type === "question") {
      const activeQuestion = activeItem.question;
      const activePageSlug = activeItem.pageSlug;
      const currentPages = logicremovepages
        ? [...logicremovepages]
        : [...pages];
      if (overItem?.type === "question") {
        const overPageSlug = overItem.pageSlug;

        if (activePageSlug === overPageSlug) {
          const activePage = currentPages.find(
            (p) => p.page_slug === activePageSlug
          );
          const questions = [...(activePage.questions || [])];
          const activeIndex = questions.findIndex(
            (q) => q.question_slug === activeId
          );
          const overIndex = questions.findIndex(
            (q) => q.question_slug === overId
          );

          if (activeIndex !== -1 && overIndex !== -1) {
            const newQuestions = arrayMove(questions, activeIndex, overIndex);
            const updatedQuestions = newQuestions.map((q, index) => ({
              ...q,
              sort_order: index + 1,
            }));

            const updatedPages = currentPages?.map((page) => {
              if (page.page_slug === activePageSlug) {
                return { ...page, questions: updatedQuestions };
              }
              return page;
            });

            setPages(updatedPages);
          }
        } else {
          const updatedPages = pages.map((page) => {
            if (page.page_slug === activePageSlug) {
              const filteredQuestions = (page.questions || []).filter(
                (q) => q.question_slug !== activeId
              );
              return { ...page, questions: filteredQuestions };
            } else if (page.page_slug === overPageSlug) {
              const targetQuestions = [...(page.questions || [])];
              const overIndex = targetQuestions.findIndex(
                (q) => q.question_slug === overId
              );
              const updatedQuestion = {
                ...activeQuestion,
                page_slug: overPageSlug,
                section_slug: page.section_slug,
                sort_order: overIndex + 1,
              };
              targetQuestions.splice(overIndex, 0, updatedQuestion);

              const reorderedQuestions = targetQuestions.map((q, index) => ({
                ...q,
                sort_order: index + 1,
              }));

              return { ...page, questions: reorderedQuestions };
            }
            return page;
          });

          setPages(updatedPages);
        }
      } else if (overItem?.type === "page") {
        const targetPageSlug = overId;

        const updatedPages = currentPages?.map((page) => {
          if (page.page_slug === activePageSlug) {
            const filteredQuestions = (page.questions || []).filter(
              (q) => q.question_slug !== activeId
            );
            return { ...page, questions: filteredQuestions };
          } else if (page.page_slug === targetPageSlug) {
            const targetQuestions = [...(page.questions || [])];
            const updatedQuestion = {
              ...activeQuestion,
              page_slug: targetPageSlug,
              section_slug: page.section_slug,
              sort_order: targetQuestions.length + 1,
            };
            targetQuestions.push(updatedQuestion);

            return { ...page, questions: targetQuestions };
          }
          return page;
        });

        setPages(updatedPages);
      }
      return;
    }

    if (
      (activeItem?.type === "section" || activeItem?.type === "page") &&
      (overItem?.type === "section" || overItem?.type === "page") &&
      !overItem?.section_slug
    ) {
      const activeIndex = rootItems.findIndex((item) => item.id === activeId);
      const overIndex = rootItems.findIndex((item) => item.id === overId);

      if (
        activeItem?.type === "page" &&
        activeItem?.section_slug &&
        activeIndex === -1
      ) {
        const activePage = pages.find((p) => p.page_slug === activeId);
        if (!activePage) return;

        const newRootItems = [...rootItems];
        newRootItems.splice(overIndex, 0, {
          id: activeId,
          type: "page",
          data: activePage,
          root_order: overIndex + 1,
        });

        const updatedSections = [...sections];
        const updatedPages = pages.map((page) => {
          if (page.page_slug === activeId) {
            return {
              ...page,
              section_slug: null,
              page_order: 1,
              root_order: overIndex + 1,
            };
          }
          return page;
        });

        newRootItems.forEach((item, index) => {
          const rootOrder = index + 1;

          if (item.type === "section") {
            const sectionIndex = updatedSections.findIndex(
              (s) => s.section_slug === item.id
            );
            if (sectionIndex !== -1) {
              updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                root_order: rootOrder,
              };
            }
          } else if (item.type === "page" && item.id !== activeId) {
            const pageIndex = updatedPages.findIndex(
              (p) => p.page_slug === item.id
            );
            if (pageIndex !== -1) {
              updatedPages[pageIndex] = {
                ...updatedPages[pageIndex],
                root_order: rootOrder,
              };
            }
          }
        });

        setSections(updatedSections);
        setPages(updatedPages);
        return;
      }

      if (activeIndex !== -1 && overIndex !== -1) {
        const newRootItems = arrayMove(rootItems, activeIndex, overIndex);

        const updatedSections = [...sections];
        const updatedPages = [...pages];

        newRootItems.forEach((item, index) => {
          const rootOrder = index + 1;

          if (item.type === "section") {
            const sectionIndex = updatedSections.findIndex(
              (s) => s.section_slug === item.id
            );
            if (sectionIndex !== -1) {
              updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                section_order: updatedSections[sectionIndex].section_order || 1,
                root_order: rootOrder,
              };
            }
          } else if (item.type === "page") {
            const pageIndex = updatedPages.findIndex(
              (p) => p.page_slug === item.id
            );
            if (pageIndex !== -1) {
              updatedPages[pageIndex] = {
                ...updatedPages[pageIndex],
                page_order: updatedPages[pageIndex].page_order || 1,
                section_slug: null,
                root_order: rootOrder,
              };
            }
          }
        });

        setSections(updatedSections);
        setPages(updatedPages);
        return;
      }
    }

    if (activeItem?.type === "page" && overItem?.section_slug) {
      const targetSectionSlug = overItem.section_slug;
      const sectionPages = getSectionPages(targetSectionSlug);

      const activePageIndex = sectionPages.findIndex(
        (p) => p.page_slug === activeId
      );
      const overPageIndex = sectionPages.findIndex(
        (p) => p.page_slug === overId
      );

      if (activePageIndex !== -1 && overPageIndex !== -1) {
        const newSectionPages = arrayMove(
          sectionPages,
          activePageIndex,
          overPageIndex
        );

        const updatedPages = pages.map((page) => {
          const newPageIndex = newSectionPages.findIndex(
            (p) => p.page_slug === page.page_slug
          );
          if (newPageIndex !== -1) {
            return {
              ...page,
              page_order: newPageIndex + 1,
              section_slug: targetSectionSlug,
            };
          }
          return page;
        });

        setPages(updatedPages);
      } else {
        const updatedPages = pages.map((page) => {
          if (page.page_slug === activeId) {
            return {
              ...page,
              section_slug: targetSectionSlug,
              page_order: sectionPages.length + 1,
              root_order: undefined,
            };
          }
          return page;
        });

        setPages(updatedPages);
      }
    }
  };

  const togglePageCollapse = (pageSlug) => {
    setCollapsedPages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pageSlug)) {
        newSet.delete(pageSlug);
      } else {
        newSet.add(pageSlug);
      }
      return newSet;
    });
  };

  const toggleSectionCollapse = (sectionSlug) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionSlug)) {
        newSet.delete(sectionSlug);
      } else {
        newSet.add(sectionSlug);
      }
      return newSet;
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    setActiveId(null);
    setDragOverId(null);
    setDragOverType(null);

    if (!over) {
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) {
      return;
    }

    const activeItem = active.data.current;
    const overItem = over.data.current;

    const dragAction = { activeId, overId, activeItem, overItem };

    const isSwappingOperation =
      activeItem?.type === overItem?.type &&
      (activeItem?.type === "page" || activeItem?.type === "section");

    if (isSwappingOperation) {
      let hasLogic = false;
      let logicItems = [];

      if (activeItem?.type === "page") {
        const activePageLogic = pageHasLogic(activeId);

        if (activePageLogic) {
          hasLogic = true;
          logicItems.push({
            type: "page",
            slug: activeId,
            name: pages.find((p) => p.page_slug === activeId)?.name || activeId,
          });
        }

        const overPageLogic = pageHasLogic(overId);

        if (overPageLogic) {
          hasLogic = true;
          logicItems.push({
            type: "page",
            slug: overId,
            name: pages.find((p) => p.page_slug === overId)?.name || overId,
          });
        }
      } else if (activeItem?.type === "section") {
        const activeSectionLogic = sectionHasLogic(activeId);

        if (activeSectionLogic) {
          hasLogic = true;
          logicItems.push({
            type: "section",
            slug: activeId,
            name:
              sections.find((s) => s.section_slug === activeId)?.name ||
              activeId,
          });
        }

        const overSectionLogic = sectionHasLogic(overId);

        if (overSectionLogic) {
          hasLogic = true;
          logicItems.push({
            type: "section",
            slug: overId,
            name:
              sections.find((s) => s.section_slug === overId)?.name || overId,
          });
        }
      }

      if (hasLogic) {
        setConditionModalData({
          itemType: "swap",
          itemSlug: `${activeId}_${overId}`,
          logicItems: logicItems,
          swapType: activeItem?.type,
          brokenConditions: [
            {
              type: "swap_with_logic",
              reason: `Swapping ${activeItem?.type}s that contain conditional logic`,
              logicItems: logicItems,
            },
          ],
        });
        setPendingDragAction(dragAction);
        setShowConditionModal(true);
        return;
      }
    }

    if (
      active.data.current?.type === "section" &&
      over.data.current?.type === "section"
    ) {
      const activeSectionSlug = active.id;
      const overSectionSlug = over.id;

      if (activeSectionSlug === overSectionSlug) {
        return;
      }

      const currentSections = [...sections];
      const oldIndex = currentSections.findIndex(
        (s) => s.section_slug === activeSectionSlug
      );
      const newIndex = currentSections.findIndex(
        (s) => s.section_slug === overSectionSlug
      );

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const newSections = arrayMove(currentSections, oldIndex, newIndex);

      const updatedSections = newSections.map((section, index) => ({
        ...section,
        root_order: index + 1,
      }));

      setSections(updatedSections);
      return;
    }

    let validation = { valid: true };
    let itemType = "";
    let itemSlug = "";

    if (activeItem?.type === "question") {
      itemType = "question";
      itemSlug = activeId;

      if (overItem?.type === "question") {
        const overPageSlug = overItem.pageSlug;
        const activePageSlug = activeItem.pageSlug;

        const overIndex = pages
          .find((p) => p.page_slug === overPageSlug)
          .questions.findIndex((q) => q.question_slug === overId);

        validation = validateQuestionMove(activeId, overPageSlug, overIndex);
      } else if (overItem?.type === "page") {
        const targetPageSlug = overId;
        const targetPage = pages.find((p) => p.page_slug === targetPageSlug);
        const targetPosition = (targetPage?.questions || []).length;

        validation = validateQuestionMove(
          activeId,
          targetPageSlug,
          targetPosition
        );
      }
    } else if (activeItem?.type === "page") {
      itemType = "page";
      itemSlug = activeId;

      let targetSectionSlug;
      let targetPosition;

      if (overItem?.type === "section") {
        targetSectionSlug = overId;
        const sectionPages = getSectionPages(targetSectionSlug);
        targetPosition = sectionPages.length;
      } else if (overItem?.type === "page" && overItem.section_slug) {
        targetSectionSlug = overItem.section_slug;
        const sectionPages = getSectionPages(targetSectionSlug);
        targetPosition = sectionPages.findIndex((p) => p.page_slug === overId);
      } else if (overItem?.type === "page" && !overItem.section_slug) {
        targetSectionSlug = null;
        targetPosition = rootItems.findIndex((item) => item.id === overId);
      } else if (overItem?.type === "section") {
        targetSectionSlug = overId;
        const sectionPages = getSectionPages(targetSectionSlug);
        targetPosition = sectionPages.length;
      }
      if (targetSectionSlug !== undefined) {
        validation = validatePageMove(
          activeId,
          targetSectionSlug,
          targetPosition
        );
      }
    } else if (activeItem?.type === "section") {
      itemType = "section";
      itemSlug = activeId;

      const overIndex = rootItems.findIndex((item) => item.id === overId);
      validation = validateSectionMove(activeId, overIndex);
    }

    if (!validation.valid && validation.brokenConditions?.length > 0) {
      setConditionModalData({
        itemType,
        itemSlug,
        brokenConditions: validation.brokenConditions,
      });
      setPendingDragAction(dragAction);
      setShowConditionModal(true);
      return;
    }

    executeDragAction(dragAction);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;

    if (!over) {
      setDragOverId(null);
      setDragOverType(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;
    const activeItem = active.data.current;
    const overItem = over.data.current;

    setDragOverId(overId);
    setDragOverType(overItem?.type);

    if (activeItem?.type === "page" && overItem?.type === "section") {
      const activePage = pages.find((p) => p.page_slug === activeId);
      const targetSectionSlug = overId;

      if (activePage && activePage.section_slug !== targetSectionSlug) {
        const updatedPages = pages.map((page) => {
          if (page.page_slug === activeId) {
            const sectionPages = getSectionPages(targetSectionSlug);
            return {
              ...page,
              section_slug: targetSectionSlug,
              page_order: sectionPages.length + 1,
              root_order: undefined,
            };
          }
          return page;
        });

        setPages(updatedPages);
      }
    }

    if (
      activeItem?.type === "page" &&
      activeItem?.section_slug &&
      (overItem?.type === "section" || overItem?.type === "page") &&
      !overItem?.section_slug
    ) {
      const activePage = pages.find((p) => p.page_slug === activeId);
      if (activePage && activePage.section_slug) {
        const updatedPages = pages.map((page) => {
          if (page.page_slug === activeId) {
            return {
              ...page,
              section_slug: null,
              page_order: 1,
              root_order: rootItems.length + 1,
            };
          }
          return page;
        });

        setPages(updatedPages);
      }
    }
  };

  const renderQuestion = (question, pageSlug, questionIndex) => {
    const isCollapsed = collapsedPages.has(pageSlug);
    if (isCollapsed) return null;

    const isDragOver = dragOverId === question.question_slug;

    return (
      <SortableItem
        key={question.question_slug}
        id={question.question_slug}
        type="question"
        data={{ type: "question", question, pageSlug }}>
        {({ attributes, listeners, isDragging }) => (
          <div
            style={{
              padding: "8px 12px",
              margin: "3px 0",
              marginLeft: "40px",
              backgroundColor: isDragOver
                ? "#e3f2fd"
                : isDragging
                ? "#fff3e0"
                : "#f8f9fa",
              border: isDragOver
                ? "2px dashed #2196f3"
                : isDragging
                ? "2px solid #ff9800"
                : "1px solid #e9ecef",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              transition: "all 0.2s ease",
              transform: isDragging ? "rotate(2deg)" : "none",
              boxShadow: isDragOver
                ? "0 2px 8px rgba(33, 150, 243, 0.2)"
                : "none",
            }}>
            <FaGripVertical
              className="text-muted me-2"
              style={{
                cursor: isDragging ? "grabbing" : "grab",
                fontSize: "10px",
                color: isDragging ? "#ff9800" : "#6c757d",
              }}
              onClick={(e) => e.stopPropagation()}
              {...attributes}
              {...listeners}
            />
            <FaQuestion
              className="text-info me-2"
              style={{ fontSize: "12px" }}
            />
            <span
              style={{
                fontSize: "13px",
                fontWeight: isDragging ? "500" : "normal",
              }}>
              {question.title ||
                question.name ||
                `Question ${questionIndex + 1}`}
            </span>
          </div>
        )}
      </SortableItem>
    );
  };

  const renderPage = (page, isInSection = false) => {
    const questions = getPageQuestions(page.page_slug);
    const isCollapsed = collapsedPages.has(page.page_slug);
    const hasQuestions = questions.length > 0;
    const isDragOver = dragOverId === page.page_slug;
    const isActive = page.page_slug === activePageSlug;

    return (
      <div key={page.page_slug}>
        <SortableItem
          id={page.page_slug}
          type="page"
          data={{
            type: "page",
            section_slug: isInSection ? page.section_slug : null,
            ...page,
          }}>
          {({ attributes, listeners, isDragging }) => (
            <div
              onClick={() => {
                setActivePageSlug(page.page_slug);
                if (isInSection) {
                  setActiveSectionSlug(page.section_slug);
                } else {
                  setActiveSectionSlug(null);
                }
              }}
              style={{
                padding: "10px 14px",
                margin: "4px 0",
                marginLeft: isInSection ? "20px" : "0px",
                backgroundColor: isDragOver
                  ? "#e8f5e8"
                  : isDragging
                  ? "#fff3e0"
                  : isActive
                  ? "#e3f2fd"
                  : "white",
                border: isDragOver
                  ? "2px dashed #4caf50"
                  : isDragging
                  ? "2px solid #ff9800"
                  : isActive
                  ? "2px solid #2196f3"
                  : "1px solid #e0e0e0",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                transition: "all 0.2s ease",
                transform: isDragging ? "rotate(1deg)" : "none",
                boxShadow: isDragOver
                  ? "0 4px 12px rgba(76, 175, 80, 0.2)"
                  : isDragging
                  ? "0 6px 20px rgba(0,0,0,0.15)"
                  : isActive
                  ? "0 2px 8px rgba(33, 150, 243, 0.2)"
                  : "0 1px 3px rgba(0,0,0,0.1)",
              }}>
              <FaGripVertical
                className="text-muted me-2"
                style={{
                  cursor: isDragging ? "grabbing" : "grab",
                  fontSize: "12px",
                  color: isDragging ? "#ff9800" : "#6c757d",
                }}
                onClick={(e) => e.stopPropagation()}
                {...attributes}
                {...listeners}
              />

              <FaFile
                className="text-primary me-2"
                style={{ fontSize: "14px" }}
              />
              <span
                style={{
                  fontWeight: isActive ? "600" : isDragging ? "500" : "normal",
                  color: isActive ? "#1976d2" : "#333",
                }}>
                {page.name}
              </span>
              {hasQuestions && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "11px",
                    color: "#666",
                    backgroundColor: "#f8f9fa",
                    padding: "2px 6px",
                    borderRadius: "12px",
                    fontWeight: "500",
                  }}>
                  {questions.length}
                </span>
              )}
              {hasQuestions && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePageCollapse(page.page_slug);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    marginLeft: "8px",
                    padding: "4px",
                    cursor: "pointer",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6c757d",
                    fontSize: "12px",
                  }}>
                  {isCollapsed ? (
                    <FaChevronRight size={10} className="text-secondary" />
                  ) : (
                    <FaChevronDown size={10} className="text-secondary" />
                  )}
                </button>
              )}
            </div>
          )}
        </SortableItem>

        {/* Questions for this page */}
        {hasQuestions && !isCollapsed && (
          <div
            style={{
              marginTop: "8px",
              paddingLeft: "8px",
              borderLeft: "2px solid #e9ecef",
              marginLeft: isInSection ? "32px" : "12px",
            }}>
            <SortableContext
              items={questions.map((q) => q.question_slug)}
              strategy={verticalListSortingStrategy}>
              {questions
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((question, qIndex) =>
                  renderQuestion(question, page.page_slug, qIndex)
                )}
            </SortableContext>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxHeight: "80vh", overflowY: "auto" }}>
      <h2 className="main-heading mb-3">Template Structure</h2>

      {/* Add New Button */}
      <div className="d-flex justify-content-end mb-3 position-relative">
        <Button
          outline
          className="btn-default btn-outline mb-2 d-flex align-items-center gap-1"
          onClick={(e) => {
            e.preventDefault();
            setShowOptions((prev) => !prev);
          }}>
          <FaPlus /> New
        </Button>

        {showOptions && (
          <div
            className="dropdown-options p-2 mt-2"
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              backgroundColor: "white",
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              zIndex: 1000,
              minWidth: "150px",
            }}>
            <Button
              className="w-100 mb-2 btn-default btn-quote d-flex align-items-center gap-1 justify-content-center"
              onClick={(e) => {
                e.preventDefault();
                if (addPage)
                  addPage(activeSectionSlug ? activeSectionSlug : null);
                setShowOptions(false);
              }}>
              <FaFileAlt /> Add Page
            </Button>
            <Button
              className="w-100 btn-default btn-quote d-flex align-items-center gap-1 justify-content-center"
              onClick={(e) => {
                e.preventDefault();
                if (addSection) addSection();
                setShowOptions(false);
              }}>
              <FaFolder /> Add Section
            </Button>
          </div>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}>
        {/* Unified Root Items (Standalone Pages + Sections) */}
        <SortableContext
          items={rootItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}>
          {rootItems.map((item) => {
            if (item.type === "page") {
              return renderPage(item.data, false);
            } else {
              const sectionPages = getSectionPages(item.data.section_slug);

              return (
                <div key={item.id} style={{ marginBottom: "12px" }}>
                  <SortableItem
                    id={item.id}
                    type="section"
                    data={{ type: "section", ...item.data }}>
                    {({ attributes, listeners, isDragging }) => {
                      const isActive =
                        item.data.section_slug === activeSectionSlug;
                      const isDragOver =
                        dragOverId === item.id && dragOverType === "section";

                      return (
                        <div
                          onClick={() => {
                            setActiveSectionSlug(item.data.section_slug);
                            setActivePageSlug(null);
                          }}
                          style={{
                            padding: "14px 16px",
                            backgroundColor: isDragOver
                              ? "#fff3e0"
                              : isDragging
                              ? "#ffecb3"
                              : isActive
                              ? "#e3f2fd"
                              : "#f8f9fa",
                            border: isDragOver
                              ? "2px dashed #ff9800"
                              : isDragging
                              ? "2px solid #ffc107"
                              : isActive
                              ? "2px solid #2196f3"
                              : "1px solid #dee2e6",
                            borderRadius: "10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            fontWeight: "600",
                            transition: "all 0.2s ease",
                            transform: isDragging ? "rotate(-1deg)" : "none",
                            boxShadow: isDragOver
                              ? "0 4px 12px rgba(255, 152, 0, 0.2)"
                              : isDragging
                              ? "0 8px 25px rgba(0,0,0,0.15)"
                              : isActive
                              ? "0 4px 12px rgba(33, 150, 243, 0.2)"
                              : "0 2px 4px rgba(0,0,0,0.1)",
                          }}>
                          <FaGripVertical
                            className="text-muted me-3"
                            style={{
                              cursor: isDragging ? "grabbing" : "grab",
                              fontSize: "14px",
                              color: isDragging ? "#ff9800" : "#6c757d",
                            }}
                            onClick={(e) => e.stopPropagation()}
                            {...attributes}
                            {...listeners}
                          />
                          <FaLayerGroup
                            className="text-warning me-3"
                            style={{ fontSize: "16px" }}
                          />
                          <span
                            style={{
                              color: isActive ? "#1976d2" : "#333",
                              fontSize: "15px",
                            }}>
                            {item.data.name}
                          </span>
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: "11px",
                              color: "#666",
                              backgroundColor: isActive ? "#bbdefb" : "#e9ecef",
                              padding: "3px 8px",
                              borderRadius: "12px",
                              fontWeight: "500",
                            }}>
                            {sectionPages.length} pages
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSectionCollapse(item.data.section_slug);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              marginLeft: "8px",
                              padding: "4px",
                              cursor: "pointer",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#6c757d",
                              fontSize: "12px",
                            }}
                            title={
                              collapsedSections.has(item.data.section_slug)
                                ? "Expand section"
                                : "Collapse section"
                            }>
                            {collapsedSections.has(item.data.section_slug) ? (
                              <FaChevronRight />
                            ) : (
                              <FaChevronDown />
                            )}
                          </button>
                        </div>
                      );
                    }}
                  </SortableItem>

                  {/* Section Pages */}
                  {!collapsedSections.has(item.data.section_slug) && (
                    <div
                      style={{
                        marginLeft: "0px",
                        marginTop: "12px",
                        padding: "12px",
                        border:
                          dragOverId === item.id && dragOverType === "page"
                            ? "2px dashed #4caf50"
                            : "2px dashed #e9ecef",
                        borderRadius: "8px",
                        minHeight: "60px",
                        backgroundColor:
                          dragOverId === item.id && dragOverType === "page"
                            ? "#f3e5f5"
                            : "#fafafa",
                        transition: "all 0.2s ease",
                      }}>
                      <SortableContext
                        items={sectionPages.map((p) => p.page_slug)}
                        strategy={verticalListSortingStrategy}>
                        {sectionPages.map((page) => renderPage(page, true))}
                      </SortableContext>
                      {sectionPages.length === 0 && (
                        <div
                          style={{
                            padding: "20px",
                            textAlign: "center",
                            color: dragOverId === item.id ? "#4caf50" : "#999",
                            fontStyle: "italic",
                            fontSize: "14px",
                            fontWeight: "500",
                            transition: "color 0.2s ease",
                          }}>
                          {dragOverId === item.id
                            ? "Drop page here"
                            : "No pages yet - drag pages here"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
          })}
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div
              style={{
                padding: "14px 18px",
                backgroundColor: "#ffffff",
                border: "2px solid #2196f3",
                borderRadius: "10px",
                boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                transform: "rotate(3deg)",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1976d2",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                minWidth: "200px",
                backdropFilter: "blur(4px)",
              }}>
              <FaGripVertical className="text-primary" />
              <span>Moving: {activeId}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Condition Break Confirmation Modal */}
      <Modal
        isOpen={showConditionModal}
        toggle={handleConditionModalCancel}
        centered>
        <ModalHeader toggle={handleConditionModalCancel}>
          <div className="d-flex align-items-center">
            <FaExclamationTriangle className="text-warning me-2" />
            {conditionModalData?.itemType === "swap"
              ? "Logic Removal Warning"
              : "Conditional Logic Warning"}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            {conditionModalData?.itemType === "swap" ? (
              <>
                <p className="mb-3">
                  <strong>
                    You are swapping {conditionModalData?.swapType}s that
                    contain conditional logic:
                  </strong>
                </p>
                {conditionModalData?.logicItems?.map((item, index) => (
                  <div key={index} className="alert alert-info mb-2">
                    <div className="d-flex align-items-start">
                      <FaExclamationTriangle
                        className="text-info me-2 mt-1"
                        style={{ fontSize: "14px" }}
                      />
                      <div>
                        <strong>{item.name}</strong> ({item.type})
                        <br />
                        <small className="text-muted">
                          Contains conditional logic that will be removed
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-3 p-3 bg-light rounded">
                  <p className="mb-2">
                    <strong>What happens if you continue:</strong>
                  </p>
                  <ul className="mb-0">
                    <li>
                      All conditional logic in these{" "}
                      {conditionModalData?.swapType}s will be permanently
                      removed
                    </li>
                    <li>
                      The {conditionModalData?.swapType}s will be swapped to
                      their new positions
                    </li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3">
                  <strong>
                    This move will break the following conditional logic:
                  </strong>
                </p>
                {conditionModalData?.brokenConditions?.map(
                  (condition, index) => (
                    <div key={index} className="alert alert-warning mb-2">
                      <div className="d-flex align-items-start">
                        <FaExclamationTriangle
                          className="text-warning me-2 mt-1"
                          style={{ fontSize: "14px" }}
                        />
                        <div>
                          <strong>{condition.dependent}</strong> depends on{" "}
                          <strong>{condition.dependency}</strong>
                          <br />
                          <small className="text-muted">
                            {condition.reason}
                          </small>
                        </div>
                      </div>
                    </div>
                  )
                )}
                <div className="mt-3 p-3 bg-light rounded">
                  <p className="mb-2">
                    <strong>What happens if you continue:</strong>
                  </p>
                  <ul className="mb-0">
                    <li>The conditional logic will be permanently removed</li>
                    <li>The item will be moved to the new position</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleConditionModalCancel}>
            Cancel Move
          </Button>
          <Button color="danger" onClick={handleConditionModalConfirm}>
            Remove Conditions & Continue
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default NestedDndSidebar;
