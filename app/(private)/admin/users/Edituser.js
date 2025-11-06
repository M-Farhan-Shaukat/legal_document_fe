// import { useEffect } from "react";
import UserForm from "./Form";

const EditUser = ({
  CloseModal = () => null,
  fetchUsers = () => null,
  currentuserid,
}) => {
  // const fetchuser = () => {

  // }
  // useEffect(() => {
  //   if(currentuserid) fetchuser()

  // }, [currentuserid])
  return <UserForm CloseModal={CloseModal} fetchUsers={fetchUsers} />;
};

export default EditUser;
