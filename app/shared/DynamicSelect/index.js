"use client";
import React, { useEffect, useState } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import { FaPlus } from "react-icons/fa6";
import ButtonX from "../ButtonX";
import Image from "next/image";
import { Avatar, HomeIcon } from "@/public/images";
import { base64ToBlob, LocalServer } from "@/app/utils";

const addNewOption = {
  value: "createNew",
  label: (
    <ButtonX className="btn-delete d-flex align-items-center">
      Add New <FaPlus />
    </ButtonX>
  ),
  className: "add-new-option",
};

const prepareOptions = (options) => {
  return options.map((option) => ({
    value: option.id,
    user_id: option?.user?.id,
    label: (
      <div className="option--with-image d-flex options--main">
        <div className="opttions--main-left">
          {option.image ? (
            <Image
              src={base64ToBlob(option.image)}
              alt={option?.business_name}
              className="img-fluid"
              width={100}
              height={100}
            />
          ) : (
            <Image src={Avatar} alt="user pic" className="img-fluid" />
          )}
        </div>
        <div className="opttions--main-right">
          <div className="desc">{option.name}</div>
          <div className="desc">{option.business_key}</div>
        </div>
      </div>
    ),
  }));
};

const SelectDynamicPaginationField = ({
  api = "",
  value = null,
  newCust = {},
  editCust = {},
  clearable = true,
  disabled = false,
  withImage = false,
  addButton = false,
  className = "",
  placeholder = "Select",
  handleChange = () => {},
  name = "",
  onBlur,
  error,
}) => {
  const [customerList, setCustomerList] = useState([]);
  const [customValue, setCustomValue] = useState(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === null) setCount(1);
  }, [value]);

  useEffect(() => {
    if (newCust.value) {
      setCustomerList((prev) => [...prev, newCust]);
    }
  }, [newCust]);

  useEffect(() => {
    if (editCust.value) {
      setCustomerList((prev) => [...prev, editCust]);
    }
  }, [editCust]);

  useEffect(() => {
    const selected = customerList.find((item) => item.value === value);
    setCustomValue(selected || null);
  }, [value, customerList]);

  const loadOptions = async (search, loadedOptions, { page }) => {
    try {
      const response = await LocalServer.get(
        `/api/business/getAll?page=${page}&search=${search}`
      );
      const business_list = response?.data?.businesses ?? { data: [] };
      let options = withImage
        ? prepareOptions(business_list?.data)
        : business_list?.data?.length > 0 &&
          business_list?.data?.map((user) => ({
            value: user.id,
            label: user.name,
            user_id: user?.user?.id,
          }));

      if (options.length === 0 && addButton) {
        options = [addNewOption];
      }
      let hasMore = business_list.current_page < business_list.last_page;

      return {
        options,
        hasMore,
        additional: {
          page: page + 1,
        },
      };
    } catch (error) {
      console.error("Error fetching options:", error);
      return { options: [], hasMore: false };
    }
  };

  return (
    <AsyncPaginate
      className={`custom-loader ${className}`}
      styles={{ menu: (base) => ({ ...base, zIndex: 999 }) }}
      id="paginate-select"
      cacheUniqs={[count]}
      // editCust={editCust}
      value={value}
      // menuIsOpen={true}
      loadOptions={loadOptions}
      onChange={handleChange}
      isClearable={clearable}
      isDisabled={disabled}
      placeholder={placeholder}
      noOptionsMessage={() => null}
      additional={{
        page: 1,
      }}
      onBlur={onBlur}
      error={!!error}
    />
  );
};

export default SelectDynamicPaginationField;
