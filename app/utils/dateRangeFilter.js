import moment from "moment";

export const getDateRange = (range) => {
  switch (range) {
    case "today":
      return {
        startDate: moment().startOf("day").format("YYYY-MM-DD"),
        endDate: moment().endOf("day").format("YYYY-MM-DD"),
      };
    case "yesterday":
      return {
        startDate: moment().subtract(1, "days").startOf("day").format("YYYY-MM-DD"),
        endDate: moment().subtract(1, "days").endOf("day").format("YYYY-MM-DD"),
      };
    case "this_week":
      return {
        startDate: moment().startOf("week").format("YYYY-MM-DD"),
        endDate: moment().endOf("week").format("YYYY-MM-DD"),
      };
    case "last_week":
      return {
        startDate: moment().subtract(1, "week").startOf("week").format("YYYY-MM-DD"),
        endDate: moment().subtract(1, "week").endOf("week").format("YYYY-MM-DD"),
      };
    case "this_month":
      return {
        startDate: moment().startOf("month").format("YYYY-MM-DD"),
        endDate: moment().endOf("month").format("YYYY-MM-DD"),
      };
    case "last_month":
      return {
        startDate: moment().subtract(1, "month").startOf("month").format("YYYY-MM-DD"),
        endDate: moment().subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
      };
    case "this_quarter":
      return {
        startDate: moment().startOf("quarter").format("YYYY-MM-DD"),
        endDate: moment().endOf("quarter").format("YYYY-MM-DD"),
      };
    case "last_quarter":
      return {
        startDate: moment().subtract(1, "quarter").startOf("quarter").format("YYYY-MM-DD"),
        endDate: moment().subtract(1, "quarter").endOf("quarter").format("YYYY-MM-DD"),
      };
    case "this_year":
      return {
        startDate: moment().startOf("year").format("YYYY-MM-DD"),
        endDate: moment().endOf("year").format("YYYY-MM-DD"),
      };
    case "last_year":
      return {
        startDate: moment().subtract(1, "year").startOf("year").format("YYYY-MM-DD"),
        endDate: moment().subtract(1, "year").endOf("year").format("YYYY-MM-DD"),
      };
    case "last_365_days":
      return {
        startDate: moment().subtract(365, "days").format("YYYY-MM-DD"),
        endDate: moment().format("YYYY-MM-DD"),
      };
    default:
      return { startDate: null, endDate: null };
  }
};


export const date_range = [
  { key: 0, value: "all", label: "All" },
  { key: 1, value: "custom", label: "Custom" },
  { key: 2, value: "today", label: "Today" },
  { key: 3, value: "yesterday", label: "Yesterday" },
  { key: 4, value: "this_week", label: "This week" },
  { key: 5, value: "this_month", label: "This month" },
  { key: 6, value: "this_quarter", label: "This quarter" },
  { key: 7, value: "this_year", label: "This year" },
  { key: 8, value: "last_week", label: "Last week" },
  { key: 9, value: "last_month", label: "Last month" },
  { key: 10, value: "last_quarter", label: "Last quarter" },
  { key: 11, value: "last_year", label: "Last year" },
  { key: 12, value: "last_365_days", label: "Last 365 days" },
];