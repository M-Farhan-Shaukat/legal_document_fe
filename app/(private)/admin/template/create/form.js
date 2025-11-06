import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  Button,
  Col,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Row,
} from "reactstrap";
export const TemplateForm = ({
  formik,
  toggleModal,
  edit = false,
  enableButton,
  isDirty = false,
}) => {
  const router = useRouter();
  const templateTitleRef = useRef(null);
  const lastUrl = useRef(window.location.href);

  // useEffect(() => {
  //   if (templateTitleRef.current) {
  //     templateTitleRef.current.focus();
  //   }
  // }, []);

  const handlePopState = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Leave anyway?"
      );
      if (!confirmed) {
        window.history.pushState(null, "", lastUrl.current);
      } else {
        router.push("/admin/template/listing");
      }
    } else {
      lastUrl.current = window.location.href;
      router.back();
    }
  };

  return (
    <div className="clr">
      <div>
        <h2 className="mb-4">{edit ? "Edit Template" : "Create Template"}</h2>
      </div>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label>
              Template Title <span className="required">*</span>
            </Label>
            <Input
              name="templateTitle"
              placeholder="Enter title"
              className="generic_input form-input"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.templateTitle}
              innerRef={templateTitleRef}
            />
            {formik.touched.templateTitle && formik.errors.templateTitle && (
              <div className="text-danger">{formik.errors.templateTitle}</div>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Price</Label>
            <InputGroup>
              <InputGroupText>$</InputGroupText>
              <Input
                name="price"
                type="number"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="generic_input form-input"
                inputMode="decimal"
                placeholder={0}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </InputGroup>
            {formik.touched.price && formik.errors.price && (
              <div className="text-danger">{formik.errors.price}</div>
            )}
          </FormGroup>
        </Col>

        <Col md={6}>
          <FormGroup className="h-100 d-flex flex-column">
            <Label>Description</Label>
            <Input
              name="notes"
              type="textarea"
              rows="4"
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter notes"
              className="generic_input form-input flex-grow-1"
              // style={{ resize: "none" }} // prevents dragging messing layout
            />
            {formik.touched.notes && formik.errors.notes && (
              <div className="text-danger">{formik.errors.notes}</div>
            )}
          </FormGroup>
        </Col>
      </Row>
      <div className="forms-btn">
        <Button
          type="submit"
          color="primary"
          className="btn-quote btn-default mx-10 "
          disabled={enableButton}
        >
          Save
        </Button>
        <Button
          type="button"
          className="btn-cancel btn-default  mx-10"
          onClick={handlePopState}
          disabled={enableButton}
        >
          Cancel
        </Button>
        <Button
          outline
          type="button"
          color="primary"
          className="btn-outline btn-default"
          onClick={toggleModal}
          disabled={enableButton}
        >
          Preview
        </Button>
      </div>
    </div>
  );
};
