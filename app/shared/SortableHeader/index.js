import { FaSortAmountDownAlt } from "react-icons/fa";
import { FaSortAmountUp } from "react-icons/fa";

const SortableHeader = ({
  value,
  name,
  sortBy,
  orderBy,
  handleSort = () => null,
}) => {
  return (
    <div
      className="d-flex gap-2 "
      onClick={() => handleSort(value, orderBy === "desc" ? "asc" : "desc")}
      style={{ cursor: "pointer" }}
    >
      <div>{name}</div>
      {sortBy === value && (
        <div>
          {orderBy === "desc" && <FaSortAmountDownAlt size={14} />}
          {orderBy === "asc" && <FaSortAmountUp size={14} />}
        </div>
      )}
    </div>
  );
};

export default SortableHeader;
