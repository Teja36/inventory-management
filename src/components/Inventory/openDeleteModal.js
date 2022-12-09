import { Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconAlertTriangle, IconCheck } from "@tabler/icons";

import { upperFirst } from "@mantine/hooks";

import { deleteItem } from "../../firebase/fireStore";

const openDeleteModal = (id, name, potency, handleDelete) =>
  openConfirmModal({
    title: "Delete your profile",
    centered: true,
    children: (
      <>
        <Text size="sm">Are you sure you want to delete this item ?</Text>
        <Text weight={700} mt="md">
          {name
            .split(" ")
            .map((word) => upperFirst(word))
            .join(" ")}{" "}
          {potency.toUpperCase()}
        </Text>
      </>
    ),
    labels: { confirm: "Delete Item", cancel: "No don't delete it" },
    confirmProps: { color: "red" },

    onConfirm: () => {
      deleteItem(id, potency)
        .then(() => {
          handleDelete(id);
          showNotification({
            title: "Success!",
            message: "Item deleted.",
            icon: <IconCheck size={16} />,
          });
        })
        .catch((err) => {
          showNotification({
            title: "Oops!",
            message: "Something went wrong.",
            color: "red",
            icon: <IconAlertTriangle size={16} />,
          });
        });
    },
  });

export default openDeleteModal;
