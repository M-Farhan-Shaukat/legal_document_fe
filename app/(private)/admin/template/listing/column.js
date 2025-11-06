import { FiEdit, RiDeleteBin6Line, FiCopy } from "@/app/shared/Icons";
import { FormGroup, Input } from "reactstrap";

import { ButtonX } from "@/app/shared";
import TooltipX from "@/app/shared/TooltipX";
import moment from "moment";

export const getTemplateColumns = ({
  setStatus,
  setSelectedProvider,
  setPopoverOpen,
  setPopoverDeleteOpen,
  handleAction,
  handleEditPrice,
  handleClone,
}) => [
  { key: "name", label: "Template Name", sortable: true },
  /*{
    key: "category_id",
    sortable: true,
    label: "Category",
  },*/
  /*{
    key: "owner_name",
    label: "Owner",
    sortable: true,
    render: (value) => (
      <div>{value}</div>
    ),
  },*/
  {
    key: "price",
    sortable: true,
    label: "Price",
    render: (value, row) => (
      <div className="d-flex gap-2 align-items-center">
        <TooltipX text="Edit Price" id={`${row?.id}p`}>
          <a
            style={{ cursor: "pointer" }}
            onClick={() => handleEditPrice(row)}
            id={`tooltip-${row?.id}p`}
          >
            {value ? `$${Number(value).toFixed(2)}` : "Free"}
          </a>
          {/* <Button
            outline
            className="btn-sm btn-edit d-flex align-items-center"
            id={`tooltip-${row?.id}p`}
            onClick={() => handleEditPrice(row)}
          >
            <FiEdit />
          </Button> */}
        </TooltipX>
      </div>
    ),
  },
  {
    key: "created_at",
    sortable: true,
    label: "Created date",
    render: (value) => (
      <>
        <div>{moment(value).format("MMM DD, YY")}</div>
      </>
    ),
  },
  {
    key: "updated_at",
    sortable: true,
    label: "Updated date",
    render: (value) => (
      <>
        <div>{moment(value).format("MMM DD, YY")}</div>
      </>
    ),
  },
  {
    key: "active",
    label: "Active/Inactive",
    render: (value, row) => (
      <div className="d-flex justify-content-center marklab--switch">
        <FormGroup switch>
          <Input
            type="switch"
            checked={row.active}
            onChange={(e) => {
              setStatus(e.target.checked);
              setSelectedProvider(row);
              setPopoverOpen(true);
            }}
          />
        </FormGroup>
      </div>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    render: (value, row) => (
      <div className="generic-tbl__actions d-flex justify-content-center">
        <TooltipX text={"Edit Template"} id={`${row?.id}a`}>
          <ButtonX
            logoClass="delete-logo"
            id={`tooltip-${row?.id}a`}
            clickHandler={() => handleAction(row?.id, "edit")}
            className="btn-edit d-flex align-items-center"
          >
            <FiEdit className="me-2" />
          </ButtonX>
        </TooltipX>
        <TooltipX text="Clone Template" id={`${row?.id}c`}>
          <ButtonX
            logoClass="clone-logo"
            id={`tooltip-${row?.id}c`}
            clickHandler={() => handleClone(row?.id)}
            className="btn-info btn-clone d-flex align-items-center"
          >
            <FiCopy className="me-2" />
          </ButtonX>
        </TooltipX>
        <TooltipX text="Delete Template" id={`${row?.id}b`}>
          <ButtonX
            logoClass="delete-logo"
            id={`tooltip-${row?.id}b`}
            clickHandler={() => {
              setSelectedProvider(row);
              setPopoverDeleteOpen(true);
            }}
            className="btn-danger btn-del d-flex align-items-center"
          >
            <RiDeleteBin6Line className="me-2" />
          </ButtonX>
        </TooltipX>
      </div>
    ),
  },
];
