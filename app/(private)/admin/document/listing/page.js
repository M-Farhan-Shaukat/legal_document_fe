"use client";
import { useCallback, useEffect, useState } from "react";
import { Input } from "reactstrap";
import { LocalServer } from "@/app/utils";
import ToastNotification from "@/app/utils/Toast";
import {
  debounce,
  getErrorMessage,
  DownloadDocument,
  DownloadWordDocument,
} from "@/app/utils/helper";
import { Form, Formik } from "formik";
import { Document } from "@/public/icons";
import * as Yup from "yup";
import "../../users/Users.scss";
import { EmailModal } from "./emailModal";
import { useRouter, useSearchParams } from "next/navigation";
import { getDocumentColumns } from "./column";
import { RejectPopover } from "./RejectModal";
import { Pagination, SubHeader, TableX } from "@/app/shared";
import { ConfirmationPopover } from "@/app/shared/DeleteConfirmation";

const { ToastComponent } = ToastNotification;

export default function DocumentListing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setloading] = useState();
  const [Lisitng, setLisitng] = useState();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(null);
  const [lastPage, setLastPage] = useState(1);
  const [rejectRow, setRejectRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [emailSelectedRow, setEmailSelectedRow] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [popoverDeleteOpen, setPopoverDeleteOpen] = useState(false);

  const [params, setParams] = useState({
    filter: "",
    pageSize: 20,
    orderBy: "desc",
    sortBy: "created_at",
  });
  const filter = searchParams.get("filter");

  const fetchDocuments = async (page = 1, query = "") => {
    setloading(true);
    try {
      const response = await LocalServer.get(
        `/api/document/listing?page=${page}&view=${params.pageSize}&search=${query}&sortBy=${params.sortBy}&orderBy=${params.orderBy}&filter=${params.filter ?params.filter:filter}`
      );
      const data = response?.data;
      setLisitng(data);
      setloading(false);
      setLastPage(data?.last_page);
    } catch (error) {
      setloading(false);
      setLisitng(false);
      ToastComponent("error", getErrorMessage(error));
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [params, filter]);

  const handleReject = async (reason) => {
    setloading(true);
    try {
      const response = await LocalServer.put(
        `/api/document/active?documentId=${rejectRow?.id}&status=reject`,
        { reason }
      );
      if (response) {
        ToastComponent("success", response?.data?.message);
        await fetchDocuments(currentPage, search);
      }
    } catch (error) {
      ToastComponent("error", getErrorMessage(error.message));
    } finally {
      setRejectModalOpen(false);
      setRejectRow(null);
      setloading(false);
    }
  };

  const handleApprove = async (row) => {
    setloading(true);
    try {
      const response = await LocalServer.put(
        `/api/document/active?documentId=${row?.id}&status=approve`
      );
      if (response) {
        ToastComponent("success", response?.data?.message);
        await fetchDocuments(currentPage, search); // 🔥 refresh table
      }
    } catch (error) {
      ToastComponent("error", getErrorMessage(error.message));
    } finally {
      setloading(false);
    }
  };

  const handleStatusChange = async (e) => {
    setParams({ ...params, filter: e.target.value });
    setCurrentPage(1);
  };

  const handleAction = async (id, action) => {
    if (action === "edit") {
      router.push(
        `/admin/document/questions?id=${id?.document_template?.admin_template_id}`
      );
      localStorage.setItem("document_id", id?.document_template?.document_id);
    } else if (action === "view") {
      router.push(`/admin/document/view/${id}`);
    } else if (action === "email") {
      setEmailSelectedRow(id);
      setEmailModalOpen(true);
    }
  };

  const togglePopover = () => {
    setStatus(null);
    setSelectedProvider(null);
    setPopoverOpen(!popoverOpen);
  };

  const toggleDeletePopover = () => {
    setStatus(null);
    setSelectedProvider(null);
    setPopoverDeleteOpen(!popoverDeleteOpen);
  };

  const handleDeleteConfirm = async () => {
    setloading(true);
    try {
      const response = await LocalServer.delete(
        `/api/document/delete?tempId=${selectedProvider?.id}`,
        {}
      );
      ToastComponent("success", response?.data?.message);
      setloading(false);
      fetchDocuments();
      toggleDeletePopover();
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
      setloading(false);
      toggleDeletePopover();
    }
  };

  const handleConfirm = async () => {
    setloading(true);
    try {
      const response = await LocalServer.put(
        `/api/document/active?tempId=${selectedProvider?.id}&active=${status}`,
        {}
      );
      ToastComponent("success", response?.data?.message);
      setloading(false);
      fetchDocuments();
      togglePopover();
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
      setloading(false);
      togglePopover();
    }
  };

  const downloadPDFById = (doc) => {
    let url = `/api/document/download?id=${doc?.id}`;
    let name = doc?.owner_name;
    DownloadDocument(url, name, "pdf");
  };

  const downloadWordById = (doc) => {
    let url = `/api/document/wordDownload?id=${doc?.id}`;
    let name = doc?.name;
    DownloadWordDocument(url, name, "word");
  };

  const debouncedFetchSearchResults = useCallback(
    debounce((query) => fetchDocuments(1, query), 500),
    []
  );

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearch(query);
    debouncedFetchSearchResults(query);
  };

  const handleCreateDocument = () => {
    router.push("/admin/document/create");
  };

  const handleSort = (column, order) => {
    setParams({ ...params, sortBy: column, orderBy: order });
  };

  const handlePageSize = (size) => {
    setParams({ ...params, pageSize: size });
  };

  const columns = getDocumentColumns({
    handleApprove,
    setRejectRow,
    setRejectModalOpen,
    handleAction,
    downloadPDFById,
  });

  return (
    <section className="data-provider--main">
      <div className="col-lg-12">
        <div className="subheader--sec">
          <SubHeader
            SubHeaderLogo={Document}
            headerTitle="Document List"
            HeaderText=""
          />
        </div>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <Input
              type="select"
              value={params.filter}
              onChange={handleStatusChange}
              className="max-200"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="approved">Approved</option>
            </Input>
          </div>
        </div>
        <TableX
          params={params}
          columns={columns}
          loading={loading}
          handleSort={handleSort}
          heading="Document List"
          data={Lisitng?.data ?? []}
          className="provider-table template--list-tbl generic--tbl"
        />
        {!loading && Lisitng?.data?.length > 0 && (
          <div className="data-list--pagination d-flex justify-content-center align-item-center">
            <Pagination
              count={Lisitng}
              label="Documents"
              lastPage={lastPage}
              currentPage={currentPage}
              pageSize={params.pageSize}
              handlePageSize={handlePageSize}
              onPageChange={(page) => {
                setCurrentPage(page);
                fetchDocuments(page, search);
              }}
            />
          </div>
        )}
      </div>
      <ConfirmationPopover
        loading={loading}
        popoverOpen={popoverOpen}
        togglePopover={togglePopover}
        handleConfirm={handleConfirm}
      />
      <ConfirmationPopover
        loading={loading}
        popoverOpen={popoverDeleteOpen}
        togglePopover={toggleDeletePopover}
        handleConfirm={handleDeleteConfirm}
      />
      <Formik
        initialValues={{
          emails: [],
          docTitle: emailSelectedRow?.document_template?.name || "",
        }}
        enableReinitialize
        validationSchema={Yup.object({
          emails: Yup.array()
            .min(1, "At least one email is required")
            .of(
              Yup.object().shape({
                label: Yup.string()
                  .email("Invalid email")
                  .required("Email is required"),
                value: Yup.string()
                  .email("Invalid email")
                  .required("Email is required"),
              })
            ),
        })}
        onSubmit={async (values, { resetForm }) => {
          const recipientEmails = values.emails.map((e) => e.value);
          const formData = new FormData();
          formData.append("email", recipientEmails.join(","));
          formData.append("subject", emailSelectedRow?.name);
          try {
            await LocalServer.post(
              `/api/document/email?document_id=${emailSelectedRow?.id}`,
              formData
            );

            ToastComponent("success", "Emails sent successfully");
            resetForm();
            setEmailModalOpen(false);
          } catch (error) {
            ToastComponent("error", "Failed to send email.");
          }
        }}
      >
        {(formik) => (
          <Form onSubmit={formik.handleSubmit}>
            <EmailModal
              formik={formik}
              loading={loading}
              emailModalOpen={emailModalOpen}
              setEmailModalOpen={setEmailModalOpen}
            />
          </Form>
        )}
      </Formik>
      <RejectPopover
        isOpen={rejectModalOpen}
        toggle={setRejectModalOpen}
        onConfirm={handleReject}
      />
    </section>
  );
}
