"use client";
import SortableHeader from "../SortableHeader";
import "./TableX.scss";

export default function TableX({
  params = { sortBy: "", orderBy: "" },
  data = [],
  columns = [],
  loading = false,
  handleSort = () => null,
  heading = "List of Documents",
  className = "",
}) {
  return (
    <div className="data-table">
      <div className="data-table__header generic--tbl-header">
        <h1 className="text-center">{heading}</h1>
      </div>
      <div className="data-table__content">
        <table className={`data-table__table w-100 ${className}`}>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index} className={col.className || ""}>
                  {col.sortable ? (
                    <SortableHeader
                      value={col.key}
                      name={col.label}
                      sortBy={params.sortBy}
                      orderBy={params.orderBy}
                      handleSort={handleSort}
                    />
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex} className="skeleton-row">
                  {columns.map((_, colIndex) => (
                    <td key={colIndex}>
                      <div className="skeleton-box"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              <>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className={col.className || ""}>
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* <tr>
                  <td colSpan="7" className="text-right --total-count">
                    Total records: <span>{count?.total}</span>
                  </td>
                </tr> */}
              </>
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center -no--data">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
