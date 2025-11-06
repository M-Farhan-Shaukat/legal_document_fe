"use client";
import { LocalServer } from "@/app/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import ToastNotification from "@/app/utils/Toast";
import { FaArrowRight, FaDownload } from "react-icons/fa6";
import { Button, Spinner, Tooltip } from "reactstrap";
import { DownloadDocument, getErrorMessage } from "@/app/utils/helper";
import "./_document.scss";

const { ToastComponent } = ToastNotification;

export default function Dashboard() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const { user } = useSelector((state) => state.user);

  // Add refs to track state and prevent duplicate calls
  const isLoadingRef = useRef(false);
  const lastPageLoadedRef = useRef(0);

  const fetchTemplates = async (page = 1, append = false) => {
    // Prevent duplicate calls to the same page
    if (isLoadingRef.current || (append && page <= lastPageLoadedRef.current)) {
      return;
    }

    isLoadingRef.current = true;

    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await LocalServer.get(
        `/api/document/client/templates?user_id=${
          user ? user?.user?.id : ""
        }&page=${page}`
      );

      const newTemplates = response?.data?.data || [];
      const { last_page, current_page } = response?.data || {};

      if (append) {
        setTemplates((prev) => [...prev, ...newTemplates]);
      } else {
        setTemplates(newTemplates);
      }

      // Update tracking refs
      lastPageLoadedRef.current = current_page;

      // Check if there's more data to load
      setHasMoreData(current_page < last_page);
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

  // Throttled scroll handler for better performance
  const lastScrollTime = useRef(0);
  const handleScroll = useCallback(() => {
    const now = Date.now();

    // Throttle to max one call per 150ms
    if (now - lastScrollTime.current < 150) return;

    // Early return if already loading or no more data
    if (isLoadingRef.current || !hasMoreData) return;

    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    // Load more when user is 200px from bottom
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      lastScrollTime.current = now;
      const nextPage = lastPageLoadedRef.current + 1;
      fetchTemplates(nextPage, true);
    }
  }, [hasMoreData]);

  useEffect(() => {
    fetchTemplates(1, false);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // Scroll to top when component mounts only (not on page changes for infinite scroll)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <div className="client_document">
      <div className="document_container">
        <h2 className="heading">Your Estate Plan</h2>
        <p className="description">
          Your estate planning documents, all in one place.
        </p>
        {/* {templates.length > 0 && (
          <div className="mb-0 text-center">
            <Button
              size="sm"
              color="warning"
              className="questionnaire_btn"
              onClick={() =>
                router.push(`/document/questions?id=${templates[0]?.id}`)
              }
            >
              Continue Questionnaire <FaArrowRight />
            </Button>
          </div>
        )} */}

        <div className="document_list">
          {templates?.map((template, index) => (
            <RenderTemplateCard key={index} template={template} />
          ))}
        </div>

        {/* Load More Button - Alternative to infinite scroll */}
        {hasMoreData && !loading && (
          <div className="text-center mt-4">
            {loadingMore && (
              <Spinner size="sm" className="me-2" color="primary" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const RenderTemplateCard = ({ template }) => {
  const router = useRouter();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => setTooltipOpen(!tooltipOpen);
  const tooltipId = `rejected-tooltip-${template.id}`;
  const paymentTooltip = `pending-payment-tooltip-${template.id}`;
  const handlePendingpayment = async (id) => {
    const response = await LocalServer.post("/api/document/client/payment", {
      document_ids: [Number(id)],
    });
    if (response?.data?.system_token) {
      window.location.href = response?.data?.url;
      localStorage.setItem("payment_token", response?.data?.system_token);
    }
  };
  return (
    <div className="document_card" key={template.id}>
      <div className="document_card_body">
        <h4 className="document_title">{template.name}</h4>
        <p className="document_description">{template?.notes || "N/A"}</p>
        {template.price > 0 ? (
          <span>${Number(template?.price).toFixed(2)}</span>
        ) : (
          <span>Free</span>
        )}
        {template.status == "complete" &&
        template.admin_status === "pending" ? (
          <Button className="pending-btn" color="light" size="sm" disabled>
            <span className="ms-2">Pending Approval</span>
          </Button>
        ) : template.status == "complete" &&
          template.admin_status === "pending_payments" ? (
          <span className="ms-2 " id={paymentTooltip}>
            <Button
              className="pending-payment-btn"
              color="light"
              size="sm"
              // disabled
              onClick={() => handlePendingpayment(template.document_id)}
            >
              <span className="ms-2">Pending Payment</span>
            </Button>
          </span>
        ) : template.status == "complete" &&
          template.admin_status === "rejected" ? (
          <>
            <Button
              className="reject-btn"
              color="danger"
              size="sm"
              onClick={() => {
                localStorage.setItem("document_id", template.document_id);
                router.push(`/document/questions?id=${template.id}`);
              }}
              id={tooltipId}
            >
              <span className="ms-2 text-white">Rejected</span>
            </Button>
            <Tooltip
              placement="top"
              toggle={toggle}
              target={tooltipId}
              isOpen={tooltipOpen}
            >
              {template.reason || "No reason provided for rejection."}
            </Tooltip>
          </>
        ) : template.status == "complete" &&
          template.admin_status === "approved" ? (
          <Button
            className="gray_btn"
            color="light"
            size="sm"
            onClick={() => {
              // Logic to trigger PDF download
              let url = `/api/document/client/download?id=${template?.document_id}`;
              let name = template?.name;
              DownloadDocument(url, name, "pdf");
            }}
          >
            <span className="ms-2">Download PDF</span>
            <FaDownload />
          </Button>
        ) : (
          <Button
            className="gray_btn"
            color="light"
            size="sm"
            onClick={() => {
              if (template.status === "in_progress") {
                localStorage.setItem("document_id", template.document_id);
              }
              router.push(`/document/questions?id=${template.id}`);
            }}
          >
            <span className="ms-2">
              {template.status === "in_progress" ? "Continue" : "Start"}
            </span>
            <FaArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
};
