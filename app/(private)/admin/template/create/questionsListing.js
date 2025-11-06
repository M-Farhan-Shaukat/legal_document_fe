import { useEffect, useState } from "react";
import { Button, Col, Input } from "reactstrap";
import { ImTree, RiDeleteBin6Line } from "@/app/shared/Icons";
import { MdContentCopy } from "react-icons/md";
import { AccordionWrapper } from "./accordion";
import { Questions } from "./questions";
import "./template.scss";
import "./create.scss";
import { ConditionalPage } from "./pageCondition";

export const QuestionsListing = ({
  pages: allpages,
  addPage,
  clonePage,
  sections,
  deletePage,
  addQuestion,
  deleteSection,
  updateQuestion,
  deleteQuestion,
  changePageSection,
  handleRename,
  updatePageLogic,
  activePageSlug,
  activeSectionSlug,
}) => {
  // const first_page_slug = allpages?.length > 0 && allpages[0]?.page_slug;
  useEffect(() => {
    if (sections.length > 0) {
      const lastSection = sections[sections.length - 1];
      setOpenSections((prev) => [...prev, lastSection.section_slug]);
    }
  }, [sections.length]);

  useEffect(() => {
    if (allpages.length > 0) {
      const lastPage = allpages[allpages.length - 1];
      setOpenPages((prev) => [...prev, lastPage.page_slug]);
    }
  }, [allpages.length]);

  const [openPages, setOpenPages] = useState([]);
  const [openSections, setOpenSections] = useState([]);

  const [logicOpen, setLogicOpen] = useState(false);
  const [activePageId, setActivePageId] = useState(null);

  const getLatestOrderedPages = () => {
    if (!allpages) return [];

    const standalonePages = allpages
      .filter((p) => !p.section_slug)
      .map((p) => ({
        id: p.page_slug,
        type: "page",
        data: p,
        root_order: p.root_order || 0,
      }));

    const sectionRoots = (sections || []).map((s) => ({
      id: s.section_slug,
      type: "section",
      data: s,
      root_order: s.root_order || s.section_order || 0,
    }));

    const combined = [...standalonePages, ...sectionRoots].sort(
      (a, b) => (a.root_order || 0) - (b.root_order || 0)
    );

    const orderedPages = [];
    combined.forEach((item) => {
      if (item.type === "page") {
        orderedPages.push(item.data);
      } else {
        const sectionPages = allpages
          .filter((p) => p.section_slug === item.id)
          .sort((a, b) => (a.page_order || 0) - (b.page_order || 0));
        orderedPages.push(...sectionPages);
      }
    });

    return orderedPages;
  };

  const handleSaveLogic = (data) => {
    // Map the data to match the expected format with conditions
    const logicData = {
      condition_type: data.condition_type,
      condition: data.conditions, // Map conditions to condition for backward compatibility
    };
    updatePageLogic(activePageId, logicData);
  };

  const toggleSection = (slug) => {
    setOpenSections((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const togglePage = (slug) => {
    setOpenPages((prev) =>
      prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]
    );
  };

  return (
    <Col md={12} style={{ maxHeight: "80vh", overflowY: "auto" }}>
      <h2 className="main-heading">Questionary</h2>

      {activeSectionSlug &&
        sections
          .filter(
            (section) =>
              !activeSectionSlug || section.section_slug === activeSectionSlug
          )
          .map((section, idx) => (
            <AccordionWrapper
              key={section.section_slug}
              isOpen={openSections.includes(section.section_slug)}
              toggle={() => toggleSection(section.section_slug)}
              customHeader={
                <>
                  <h5>(Section)</h5>
                  <Input
                    bsSize="sm"
                    style={{ maxWidth: "180px" }}
                    value={section.name}
                    onChange={(e) =>
                      handleRename(
                        e.target.value,
                        "section",
                        section.section_slug
                      )
                    }
                    className="form-input"
                  />
                  <div className="d-flex gap-2 align-items-center justify-content-between flex-fill">
                    <Button
                      size="sm"
                      outline
                      color="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSection(section);
                      }}
                    >
                      <RiDeleteBin6Line />
                    </Button>
                    <Button
                      color="secondary"
                      className=" btn-outline d-flex align-items-center btn-outline-blue"
                      onClick={() => addPage(section.section_slug)}
                    >
                      + Add Page to Section
                    </Button>
                  </div>
                </>
              }
            >
              {allpages
                .filter(
                  (p) =>
                    p.section_slug === section.section_slug &&
                    (!activePageSlug || p.page_slug === activePageSlug)
                )
                .map((page, index) => (
                  <AccordionWrapper
                    key={page.page_slug}
                    isOpen={openPages.includes(page.page_slug)}
                    toggle={() => togglePage(page.page_slug)}
                    customHeader={
                      <>
                        <h5>(Page)</h5>
                        <Input
                          bsSize="sm"
                          value={page.name}
                          className="form-input"
                          style={{ maxWidth: "180px" }}
                          onChange={(e) =>
                            handleRename(e.target.value, "page", page.page_slug)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="d-flex gap-2 align-items-center">
                          <Button
                            size="sm"
                            outline
                            color="danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePage(page);
                            }}
                          >
                            <RiDeleteBin6Line />
                          </Button>
                          <Button
                            size="sm"
                            outline
                            color="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              clonePage(page);
                            }}
                          >
                            <MdContentCopy />
                          </Button>
                          {section.root_order > 1 ? (
                            <Button
                              size="sm"
                              outline
                              color={
                                page?.condition?.length > 0
                                  ? "success"
                                  : "danger"
                              }
                              // disabled={index === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePageId(page.page_slug);
                                setLogicOpen(true);
                              }}
                            >
                              <ImTree />
                            </Button>
                          ) : (
                            page.page_order !== 1 &&
                            section.root_order === 1 && (
                              <Button
                                size="sm"
                                outline
                                color={
                                  page?.condition?.length > 0
                                    ? "success"
                                    : "danger"
                                }
                                // disabled={index === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActivePageId(page.page_slug);
                                  setLogicOpen(true);
                                }}
                              >
                                <ImTree />
                              </Button>
                            )
                          )}
                          <Input
                            type="select"
                            bsSize="sm"
                            style={{ maxWidth: "180px" }}
                            value={page.section_slug || ""}
                            onClick={(e) => e.stopPropagation()}
                            className="form-input"
                            onChange={(e) =>
                              changePageSection(
                                page.page_slug,
                                e.target.value || null
                              )
                            }
                          >
                            <option key="standalone" value="">
                              Standalone
                            </option>
                            {sections.map((section) => (
                              <option
                                key={section.section_slug}
                                value={section.section_slug}
                              >
                                {section.name || "Untitled Section"}
                              </option>
                            ))}
                          </Input>
                        </div>
                      </>
                    }
                  >
                    <Questions
                      allpages={allpages}
                      page={page}
                      sections={sections}
                      updateQuestion={updateQuestion}
                      deleteQuestion={deleteQuestion}
                      addQuestion={addQuestion}
                      changePageSection={changePageSection}
                      deletePage={deletePage}
                    />
                  </AccordionWrapper>
                ))}
            </AccordionWrapper>
          ))}

      {allpages
        .filter(
          (p) =>
            !p.section_slug &&
            (!activePageSlug || p.page_slug === activePageSlug)
        )
        .map((page, index) => (
          <AccordionWrapper
            key={page.page_slug}
            isOpen={openPages.includes(page.page_slug)}
            toggle={() => togglePage(page.page_slug)}
            customHeader={
              <>
                <h5>(Page)</h5>

                <div className="d-flex gap-2 align-items-center justify-content-between flex-fill">
                  <div className="d-flex gap-2">
                    <Input
                      bsSize="sm"
                      value={page.name}
                      style={{ maxWidth: "180px" }}
                      className="form-input h-36"
                      onChange={(e) =>
                        handleRename(e.target.value, "page", page.page_slug)
                      }
                      onClick={(e) => e.stopPropagation()}
                      // disabled={page?.page_slug === first_page_slug}
                    />
                    <Input
                      type="select"
                      bsSize="sm"
                      style={{ maxWidth: "220px" }}
                      value={page.section_slug || ""}
                      className="form-input h-36"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        changePageSection(
                          page.page_slug,
                          e.target.value || null
                        )
                      }
                    >
                      <option key="standalone-2" value="">
                        Standalone
                      </option>
                      {sections.map((section) => (
                        <option
                          key={section.section_slug}
                          value={section.section_slug}
                        >
                          {section.name || "Untitled Section"}
                        </option>
                      ))}
                    </Input>
                  </div>
                  {page?.root_order !== 1 && (
                    <Button
                      size="sm"
                      outline
                      color={page?.condition?.length > 0 ? "success" : "danger"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePageId(page.page_slug);
                        setLogicOpen(true);
                      }}
                    >
                      <ImTree />
                    </Button>
                  )}

                  <div className="d-flex align-items-center  gap-2">
                    <Button
                      size="sm"
                      outline
                      color="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePage(page);
                      }}
                    >
                      <RiDeleteBin6Line />
                    </Button>
                    <Button
                      size="sm"
                      outline
                      color="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        clonePage(page);
                      }}
                    >
                      <MdContentCopy />
                    </Button>
                  </div>
                </div>
              </>
            }
          >
            <Questions
              allpages={allpages}
              page={page}
              sections={sections}
              updateQuestion={updateQuestion}
              deleteQuestion={deleteQuestion}
              addQuestion={addQuestion}
              changePageSection={changePageSection}
              deletePage={deletePage}
            />
          </AccordionWrapper>
        ))}

      <ConditionalPage
        isOpen={logicOpen}
        onSave={handleSaveLogic}
        toggle={() => setLogicOpen(!logicOpen)}
        data={allpages?.find((x) => x.page_slug === activePageId)}
        aboveQuestions={(() => {
          // Use the same ordering logic as drag and drop system
          const orderedPages = getLatestOrderedPages();
          const activeIndex = orderedPages.findIndex(
            (p) => p.page_slug === activePageId
          );
          return orderedPages
            .slice(0, activeIndex)
            .flatMap((p) => p.questions || [])
            .filter((q) => !q.having_repeating_items);
        })()}
      />
    </Col>
  );
};
