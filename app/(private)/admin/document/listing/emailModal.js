import { FormGroup, Input, Label } from "reactstrap";
import CreatableSelect from "react-select/creatable";
import { ConfirmationPopover } from "@/app/shared/DeleteConfirmation";

export const EmailModal = ({
  loading,
  formik,
  emailModalOpen,
  setEmailModalOpen,
}) => {
  return (
    <ConfirmationPopover
      loading={loading}
      popoverOpen={emailModalOpen}
      handleConfirm={formik.handleSubmit}
      togglePopover={() => setEmailModalOpen(!emailModalOpen)}
      title="Send Document via Email"
      content={
        <>
          <FormGroup>
            <Label for="emailList">Recipient Emails</Label>
            <CreatableSelect
              isMulti
              name="emails"
              placeholder="Type email and press Enter"
              value={formik.values.emails}
              onChange={(value) => formik.setFieldValue("emails", value || [])}
              onCreateOption={(inputValue) => {
                const trimmed = inputValue.trim();
                const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
                if (isValidEmail) {
                  formik.setFieldValue("emails", [
                    ...formik.values.emails,
                    { label: trimmed, value: trimmed },
                  ]);
                } else {
                  ToastComponent("error", "Invalid email format");
                }
              }}
              components={{
                DropdownIndicator: null,
                IndicatorSeparator: null,
              }}
              formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
              noOptionsMessage={() => "Type an email and press Enter"}
            />
            {formik.errors.emails && formik.touched.emails && (
              <div className="text-danger mt-1">{formik.errors.emails}</div>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="docTitle">Document Title</Label>
            <Input
              type="text"
              name="docTitle"
              value={formik.values?.docTitle}
              disabled
            />
          </FormGroup>
        </>
      }
    />
  );
};
// return (
//   <ConfirmationPopover
//     loading={loading}
//     popoverOpen={emailModalOpen}
//     togglePopover={() => setEmailModalOpen(false)}
//     handleConfirm={handleSubmit} // Formik handleSubmit
//     title="Send Document via Email"
//     content={
//       <>
//         <FormGroup>
//           <Label for="emailList">Recipient Emails</Label>
//           <CreatableSelect
//             isMulti
//             name="emails"
//             placeholder="Type email and press Enter"
//             value={values.emails}
//             onChange={(value) => setFieldValue("emails", value || [])}
//             onCreateOption={(inputValue) => {
//               const trimmed = inputValue.trim();
//               const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

//               if (isValidEmail) {
//                 setFieldValue("emails", [
//                   ...values.emails,
//                   { label: trimmed, value: trimmed },
//                 ]);
//               } else {
//                 ToastComponent("error", "Invalid email format");
//               }
//             }}
//             components={{
//               DropdownIndicator: null,
//               IndicatorSeparator: null,
//             }}
//             formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
//             noOptionsMessage={() => "Type an email and press Enter"}
//           />

//           {errors.emails && touched.emails && (
//             <div className="text-danger mt-1">{errors.emails}</div>
//           )}
//         </FormGroup>

//         <FormGroup>
//           <Label for="docTitle">Document Title</Label>
//           <Input
//             type="text"
//             name="docTitle"
//             value={values?.docTitle}
//             disabled
//           />
//         </FormGroup>
//       </>
//     }
//   />
// );
