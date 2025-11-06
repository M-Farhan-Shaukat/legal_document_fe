import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import "./template.scss";
import { Collapse } from "reactstrap";

export const AccordionWrapper = ({
  isOpen,
  toggle,
  title,
  children,
  customHeader,
}) => {
  return (
    <div className="accordion-wrapper mb-3 border rounded">
      <div
        className="accordion-header d-flex justify-content-between align-items-center p-3"
        style={{ cursor: "pointer", backgroundColor: "#f8f9fa" }}
        onClick={(e) => {
          const tagName = e.target.tagName.toLowerCase();
          const ignoreTags = [
            "input",
            "button",
            "select",
            // "svg",
            // "path",
            "label",
          ];
          if (!ignoreTags.includes(tagName)) {
            toggle();
          }
        }}
      >
        <div className="d-flex align-items-center gap-2">
          {/* {isOpen ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />} */}
          {customHeader || <strong>{title}</strong>}
        </div>
      </div>
      <Collapse isOpen={true}>
        <div className="accordion-body p-3">{children}</div>
      </Collapse>
    </div>
  );
};
