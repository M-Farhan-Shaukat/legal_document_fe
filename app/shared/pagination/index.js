"use client";
import Image from "next/image";
import "./Pagination.scss";
import { PArrow } from "@/public/images";
import GenericField from "@/app/FormFields/sharedInput";

export default function Pagination({
  count,
  currentPage,
  lastPage,
  onPageChange,
  pageSize = 20,
  handlePageSize,
  className='',
  label= 'Records'
}) {
  const generatePages = () => {
    const pages = [];
    if (lastPage <= 10) {
      return Array.from({ length: lastPage }, (_, i) => i + 1);
    }

    pages.push(1, 2, 3); // First 3 pages

    if (currentPage > 5) pages.push("...");

    const start = Math.max(4, currentPage - 1);
    const end = Math.min(lastPage - 3, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < lastPage - 4) pages.push("...");

    pages.push(lastPage - 2, lastPage - 1, lastPage); // Last 3 pages
    return pages;
  };

  return (
    <>
      <ul className={`pagination global--pagination ${className}`}>
        {/* Previous Button */}
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link d-flex align-items-center gap-8"
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          >
            <Image src={PArrow} alt="" className="pagination-actions" />
            <span>Previous</span>
          </button>
        </li>

        {/* Dynamic Page Numbers */}
        {generatePages().map((page, index) => (
          <li
            key={index}
            className={`page-item ${currentPage === page ? "active" : ""}`}
          >
            {page === "..." ? (
              <span className="page-link">...</span>
            ) : (
              <button className="page-link" onClick={() => onPageChange(page)}>
                {page}
              </button>
            )}
          </li>
        ))}

        {/* Next Button */}
        <li
          className={`page-item ${currentPage === lastPage ? "disabled" : ""}`}
        >
          <button
            className="page-link d-flex align-items-center gap-8"
            onClick={() =>
              currentPage < lastPage && onPageChange(currentPage + 1)
            }
          >
            <span>Next</span>
            <Image src={PArrow} alt="" className="pagination-actions" />
          </button>
        </li>

        {/* Page Size Selector */}
        <div className="pagination--select">
          <GenericField
            type="select"
            name="pagesize"
            id="pagesize"
            value={pageSize}
            onChange={(e) => handlePageSize(Number(e.target.value))}
            options={[
              { id: 20, title: "20" },
              { id: 50, title: "50" },
              { id: 100, title: "100" },
            ]}
          />
        </div>
      </ul>
      <div className="record-counter">
        {`Total ${label}:`} <span>{count?.total}</span>
      </div>
    </>
  );
}
