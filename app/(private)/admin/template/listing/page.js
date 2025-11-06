"use client";

import { useCallback, useEffect, useState } from "react";
import "../../users/Users.scss";

import { LocalServer } from "@/app/utils";
import { useRouter, useSearchParams } from "next/navigation";
import ToastNotification from "@/app/utils/Toast";
import { debounce, getErrorMessage } from "@/app/utils/helper";
import { TableX, Pagination, SubHeader, ButtonX } from "@/app/shared";
import { Doc } from "@/public/images";
import { ConfirmationPopover } from "@/app/shared/DeleteConfirmation";
import GenericField from "@/app/FormFields/sharedInput";
import { AiOutlineSearch } from "@/app/shared/Icons";
import { getTemplateColumns } from "./column";
import EditPriceModal from "./priceEdit";

const { ToastComponent } = ToastNotification;

export default function TemplateListing() {
  const router = useRouter();
     const searchParams = useSearchParams()
  
  const [loading, setloading] = useState();
  const [Lisitng, setLisitng] = useState();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(null);
  const [lastPage, setLastPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverDeleteOpen, setPopoverDeleteOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [priceModalOpen, setPriceModalOpen] = useState(false);

  const [params, setParams] = useState({
    sortBy: "created_at",
    orderBy: "desc",
    pageSize: 20,
    search: "",
  });
  const filter = searchParams.get("filter");

  const fetchTemplates = async (page = 1) => {
    setloading(true);
    try {
      const response = await LocalServer.get(
        `/api/template/listing?page=${page}&view=${params.pageSize}&search=${params.search}&sortBy=${params.sortBy}&orderBy=${params.orderBy}&filter=${filter || "all"}`
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
    fetchTemplates();
  }, [params,filter]);

  const handleAction = async (id, action) => {
    if (action === "edit") {
      router.push(`/admin/template/edit/${id}`);
    } else if (action === "view") {
      viewTemplate(id);
    } /*else if (action === "delete") {
      const response = await LocalServer.delete(
        `/api/template/delete?tempId=${id}`
      );
      if(response?.status === 200) {
        ToastComponent("success", response?.data?.message);
        fetchTemplates();
      }
      // router.push(`/admin/template/${id}`);
    }*/
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
  const handleEditPrice = (row) => {
    setSelectedProvider(row);
    setPriceModalOpen(true);
  };
  const handleConfirm = async () => {
    setloading(true);
    try {
      const response = await LocalServer.put(
        `/api/template/active?tempId=${selectedProvider?.id}&active=${status}`,
        {}
      );
      ToastComponent("success", response?.data?.message);
      setloading(false);
      fetchTemplates();
      togglePopover();
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
      setloading(false);
      togglePopover();
    }
  };

  const handleDeleteConfirm = async () => {
    setloading(true);
    try {
      const response = await LocalServer.delete(
        `/api/template/delete?tempId=${selectedProvider?.id}`,
        {}
      );
      ToastComponent("success", response?.data?.message);
      setloading(false);
      fetchTemplates();
      toggleDeletePopover();
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
      setloading(false);
      toggleDeletePopover();
    }
  };

  const debouncedFetchSearchResults = useCallback(
    debounce((query) => fetchTemplates(1, query), 500),
    []
  );

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearch(query);
    setParams((prev) => ({
      ...prev,
      search: query,
    }));
  };

  const handleCreateTemplate = () => {
    router.push("/admin/template/create");
  };

  const handleClone = (id) => {
    router.push(`/admin/template/clone/${id}`);
  };

  const handleSort = (column, order) => {
    setParams({ ...params, sortBy: column, orderBy: order });
  };

  const handlePageSize = (size) => {
    setParams({ ...params, pageSize: size });
  };
  const columns = getTemplateColumns({
    setStatus,
    setSelectedProvider,
    setPopoverOpen,
    setPopoverDeleteOpen,
    handleAction,
    handleEditPrice,
    handleClone,
  });
  return (
    <section className="data-provider--main">
      <div className="col-lg-12">
        <div className="subheader--sec">
          <SubHeader
            SubHeaderLogo={Doc}
            headerTitle="Template List"
            HeaderText=""
          />
        </div>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <ButtonX
            clickHandler={handleCreateTemplate}
            className="create-btn btn-quote btn-quote--hover  d-flex align-items-center justify-content-center"
            size="lg"
          >
            Create Template
          </ButtonX>
          <GenericField
            type="text"
            name="search"
            value={search}
            placeholder="Search by Name"
            onChange={handleSearchChange}
            className="form-input  pl-38  bg-white outline-none search-icon max-300"
            Icon={AiOutlineSearch}
          />
        </div>
        <TableX
          heading="Template List"
          params={params}
          className="provider-table template--list-tbl generic--tbl"
          columns={columns}
          loading={loading}
          handleSort={handleSort}
          data={Lisitng?.data ?? []}
        />
        {!loading && Lisitng?.data?.length > 0 && (
          <div className="data-list--pagination d-flex justify-content-center align-item-center">
            <Pagination
              lastPage={lastPage}
              count={Lisitng}
              currentPage={currentPage}
              handlePageSize={handlePageSize}
              pageSize={params.pageSize}
              label="Templates"
              onPageChange={(page) => {
                setCurrentPage(page);
                fetchTemplates(page);
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
      <EditPriceModal
        isOpen={priceModalOpen}
        toggle={() => setPriceModalOpen(false)}
        template={selectedProvider}
        onSuccess={() => fetchTemplates(currentPage)}
      />
    </section>
  );
}
