import { useState } from "react";
import { Switch, useMantineTheme } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons";
import { updateUserStatus } from "../../firebase/fireStore";

const StatusSwitch = ({ id, status, handleStatusUpdate, disabled }) => {
  const theme = useMantineTheme();
  const [checked, setChecked] = useState(status === "active" ? true : false);

  const handleStatusChange = (e) => {
    const newStatus = !checked ? "active" : "disabled";
    setChecked(e.currentTarget.checked);
    updateUserStatus([id], newStatus);
    handleStatusUpdate(id, newStatus);
  };
  return (
    <Switch
      disabled={disabled}
      size="lg"
      color="green"
      onLabel="Active"
      offLabel="Disabled"
      checked={checked}
      onChange={(e) => handleStatusChange(e)}
      thumbIcon={
        checked ? (
          <IconCheck
            size={12}
            color={theme.colors.teal[theme.fn.primaryShade()]}
            stroke={3}
          />
        ) : (
          <IconX
            size={12}
            color={theme.colors.red[theme.fn.primaryShade()]}
            stroke={3}
          />
        )
      }
    />
  );
};

export default StatusSwitch;
