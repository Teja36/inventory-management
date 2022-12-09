import { useState } from "react";
import { Select } from "@mantine/core";
import { updateUserRole } from "../../firebase/fireStore";

const RoleDropDown = ({ id, role, handleRoleUpdate, disabled }) => {
  const [value, setValue] = useState(role);

  const handleSave = async (newValue) => {
    await updateUserRole(id, newValue);
    handleRoleUpdate(id, newValue);
  };

  if (role === "owner") return "Owner";
  return (
    <Select
      variant="unstyled"
      disabled={disabled}
      sx={{ width: "100px" }}
      size="sm"
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        handleSave(newValue);
      }}
      data={[
        { value: "user", label: "User" },
        { value: "admin", label: "Admin" },
      ]}
    />
  );
};

export default RoleDropDown;
