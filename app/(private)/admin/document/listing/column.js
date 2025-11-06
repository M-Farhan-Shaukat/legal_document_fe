import {
  FiEye,
  FiMail,
  FiEdit,
  TbFileDownload,
  BsThreeDotsVertical,
} from "@/app/shared/Icons";
import moment from "moment";
import { ButtonX } from "@/app/shared";
import TooltipX from "@/app/shared/TooltipX";
import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";

export const getDocumentColumns = ({
  handleApprove,
  setRejectRow,
  setRejectModalOpen,
  handleAction,
  downloadPDFById,
}) => {
  return [
    { key: "owner_name", label: "User", sortable: true },

    {
      key: "document_template",
      label: "Template",
      sortable: true,
      render: (value) => <div>{value?.name}</div>,
    },
    {
      key: "updated_at",
      sortable: true,
      label: "Updated Date",
      render: (value) => (
        <>
          <div>{moment(value).format("MMM DD, YY")}</div>
        </>
      ),
    },
    {
      key: "admin_status",
      label: "Admin Status",
      sortable: true,
      render: (value) => {
        return (
          <>
            {value == "approved" ? (
              <Badge color="success">Approved</Badge>
            ) : value == "pending" ? (
              <Badge color="warning">Pending</Badge>
            ) : (
              <Badge color="danger">Rejected</Badge>
            )}
          </>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, row) => {
        return (
          <div className="generic-tbl__actions d-flex justify-content-center">
            <TooltipX text={"View Document"} id={`${row?.id}c`}>
              <ButtonX
                logoClass="delete-logo"
                id={`tooltip-${row?.id}c`}
                clickHandler={() => handleAction(row?.id, "view")}
                className="btn-delete d-flex align-items-center"
              >
                <FiEye className="me-2" />
              </ButtonX>
            </TooltipX>
            {/* <ButtonX
              logoClass="delete-logo"
              clickHandler={() => handleAction(row, "edit")}
              className="btn-edit d-flex align-items-center"
            >
              <FiEdit className="me-2" />
            </ButtonX> */}

            <TooltipX text="Download PDF" id={`${row?.id}d`}>
              <ButtonX
                logoClass="delete-logo"
                id={`tooltip-${row?.id}d`}
                clickHandler={() => downloadPDFById(row)}
                className="btn-edit d-flex align-items-center"
              >
                <TbFileDownload className="me-2" />
              </ButtonX>
            </TooltipX>
            <TooltipX text="Send Email" id={`${row?.id}f`}>
              <ButtonX
                logoClass="delete-logo"
                id={`tooltip-${row?.id}f`}
                clickHandler={() => {
                  handleAction(row, "email");
                }}
                className="btn-edit d-flex align-items-center"
              >
                <FiMail className="me-2" />
              </ButtonX>
            </TooltipX>

            <UncontrolledDropdown>
              <DropdownToggle
                className="btn btn-light border-0 d-flex align-items-center"
                caret={false}
              >
                <BsThreeDotsVertical />
              </DropdownToggle>
              <DropdownMenu end>
                <DropdownItem
                  disabled={row.admin_status === "approved"} // disable if already approved
                  onClick={() => {
                    if (row.admin_status !== "approved") {
                      handleApprove(row);
                    }
                  }}
                >
                  Approve
                </DropdownItem>

                <DropdownItem
                  disabled={row.admin_status === "rejected"} // disable if already rejected
                  onClick={() => {
                    if (row.admin_status !== "rejected") {
                      setRejectRow(row); // set the current row
                      setRejectModalOpen(true); // open modal
                    }
                  }}
                >
                  Reject
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>
        );
      },
    },
  ];
};
