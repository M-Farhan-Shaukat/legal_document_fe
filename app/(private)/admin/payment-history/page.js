"use client";

import { useCallback, useEffect, useState } from "react";
import "./PaymentHistory.scss";
import { LocalServer } from "@/app/utils";
import ToastNotification from "@/app/utils/Toast";
import { TableX, Pagination, SubHeader } from "@/app/shared";
import { debounce, getErrorMessage } from "@/app/utils/helper";
import { DollarNote } from "@/public/images";
import moment from "moment";
import { date_range } from "@/app/utils/dateRangeFilter";

const { ToastComponent } = ToastNotification;

export default function PaymentHistory() {
  const [loading, setloading] = useState(false);
  const [lastPage, setLastPage] = useState(1);
  const [paymentListing, setPaymentListing] = useState();
  const [selectedRange, setSelectedRange] = useState("all"); // default
  const [customStart, setCustomStart] = useState(null);
  const [customEnd, setCustomEnd] = useState(null); // default "today"
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [params, setParams] = useState({
    sortBy: "created_at",
    orderBy: "desc",
    pageSize: 20,
  });

  const fetchPayments = async (
    page = 1,
    query = "",
    range = selectedRange == "all" ? "" : selectedRange,
    start = customStart,
    end = customEnd
  ) => {
    setloading(true);
    try {
      let startDate = null;
      let endDate = null;

      if (range === "custom") {
        startDate = start ? moment(start).format("YYYY-MM-DD") : null;
        endDate = end ? moment(end).format("YYYY-MM-DD") : null;
      }

      const response = await LocalServer.get(
        `/api/payment/history?page=${page}&view=${
          params.pageSize
        }&search=${query}&sortBy=${params.sortBy}&orderBy=${
          params.orderBy
        }&startDate=${startDate || null}&endDate=${
          endDate || null
        }&date_range=${range}`
      );

      const data = response?.data;
      setPaymentListing(data);
      setLastPage(data?.last_page);
    } catch (error) {
      setPaymentListing(false);
      ToastComponent("error", getErrorMessage(error));
    } finally {
      setloading(false);
    }
  };
  // const fetchPayments = async (page = 1, query = "") => {
  //   setloading(true);
  //   try {
  //     const response = await LocalServer.get(
  //       `/api/payment/history?page=${page}&view=${params.pageSize}&search=${query}&sortBy=${params.sortBy}&orderBy=${params.orderBy}`
  //     );

  //     const data = response?.data;
  //     setPaymentListing(data);
  //     setloading(false);
  //     setLastPage(data?.last_page);
  //   } catch (error) {
  //     setloading(false);
  //     setPaymentListing(false);
  //     ToastComponent("error", getErrorMessage(error));
  //   }
  // };

  useEffect(() => {
    fetchPayments();
  }, [params]);

  const debouncedFetchSearchResults = useCallback(
    debounce((query) => fetchPayments(1, query), 500),
    []
  );

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearch(query);
    debouncedFetchSearchResults(query);
  };

  const handleSort = (column, order) => {
    setParams({ ...params, sortBy: column, orderBy: order });
  };

  const handlePageSize = (size) => {
    setParams({ ...params, pageSize: size });
  };

  const columns = [
    {
      key: "user_name",
      label: "User",
      sortable: true,
      render: (value) => <span>{value ?? "Unknown"}</span>,
    },
    {
      key: "template_name",
      label: "Template",
      sortable: false,
      render: (value) => <span>{value?.join(",")}</span>,
    },
    {
      key: "original_total_amount",
      label: "Amount",
      sortable: true,
      render: (value) => <span>${value}</span>,
    },
    {
      key: "created_at",
      label: "Payment Date",
      sortable: true,
      render: (value) => <div>{moment(value).format("MMM DD, YY")}</div>,
    },
    // {
    //   key: "transaction_status",
    //   label: "Transaction Status",
    //   sortable: true,
    //   render: (value) => (
    //     <Badge
    //       className={"text-capitalize"}
    //       color={value === "initiate" ? "warning" : "success"}
    //     >
    //       {value}
    //     </Badge>
    //   ),
    // },
    // {
    //   key: "payment_status",
    //   label: "Payment Status",
    //   sortable: true,
    //   render: (value) => (
    //     <Badge
    //       className={"text-capitalize"}
    //       color={value === "unpaid" ? "danger" : "success"}
    //     >
    //       {value}
    //     </Badge>
    //   ),
    // },
  ];

  return (
    <>
      <section className="data-provider--main">
        <div className="col-lg-12">
          <div className="subheader--sec">
            <SubHeader
              SubHeaderLogo={DollarNote}
              headerTitle="Payment History"
              HeaderText=""
            />
          </div>
          <div className="d-flex align-items-center justify-content-end  mb-3 px-3">
            <div className="d-flex gap-2 mb-3 px-3">
              {/* Date range dropdown */}
              <select
                value={selectedRange}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedRange(value);

                  if (value !== "custom") {
                    // reset state
                    setCustomStart(null);
                    setCustomEnd(null);
                    const rangeParam = value === "all" ? "" : value;
                    // fetch immediately with the new range and null dates
                    fetchPayments(1, search, rangeParam, null, null);
                  } else {
                    setCustomStart(null);
                    setCustomEnd(null);
                  }
                }}
                className="form-select w-auto"
              >
                {date_range.map((item) => (
                  <option key={item.key} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              {/* Show date pickers only when "custom" is selected */}
              {selectedRange === "custom" && (
                <>
                  <input
                    type="date"
                    value={customStart || ""}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="form-control"
                  />
                  <input
                    type="date"
                    value={customEnd || ""}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="form-control"
                  />
                  <button
                    className="btn btn-primary"
                    disabled={!customStart || !customEnd} // prevent invalid apply
                    onClick={() => fetchPayments(1, search)}
                  >
                    Apply
                  </button>
                </>
              )}
            </div>

            {/* <GenericField
              type="text"
              name="search"
              value={search}
              placeholder="Search by User or Template"
              onChange={handleSearchChange}
              className="form-input pl-38 bg-white outline-none search-icon max-300"
              Icon={AiOutlineSearch}
            /> */}
          </div>
          <TableX
            heading="Payment History"
            params={params}
            className="provider-table template--list-tbl generic--tbl"
            columns={columns}
            loading={loading}
            handleSort={handleSort}
            data={paymentListing?.data ?? []}
          />
          {!loading && paymentListing?.data?.length > 0 && (
            <div className="data-list--pagination d-flex justify-content-center align-item-center">
              <Pagination
                lastPage={lastPage}
                count={paymentListing}
                currentPage={currentPage}
                handlePageSize={handlePageSize}
                pageSize={params.pageSize}
                label="Payments"
                onPageChange={(page) => {
                  setCurrentPage(page);
                  fetchPayments(page, search);
                }}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
