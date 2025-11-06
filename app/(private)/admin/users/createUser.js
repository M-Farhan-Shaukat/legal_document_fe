import UserForm from "./Form";

const CreateUser = ({ CloseModal, fetchUsers, doctor, businessId }) => {
  return (
    <UserForm
      doctor={doctor}
      CloseModal={CloseModal}
      fetchUsers={fetchUsers}
      businessId={businessId}
    />
  );
};

export default CreateUser;
