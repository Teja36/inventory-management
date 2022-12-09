import { useEffect, useState } from "react";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Menu,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import { useSelector } from "react-redux";

import { DataTable } from "mantine-datatable";

import {
  IconCheck,
  IconChevronDown,
  IconCircleOff,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons";

import {
  getUsers,
  removeUsers,
  updateUserStatus,
} from "../../firebase/fireStore";

import { getProfilePhotos } from "../../firebase/storage";

import { upperFirst, useDebouncedValue } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";

import InviteModal from "../../components/ManageUsers/InviteModal";
import RoleDropDown from "../../components/ManageUsers/RoleDropDown";
import StatusSwitch from "../../components/ManageUsers/StatusSwitch";

const ManageUsers = () => {
  const userRole = useSelector((state) => state.user.userInfo.role);

  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    setIsFetching(true);
    (async () => {
      const data = await getUsers(debouncedQuery);
      const imgurls = await getProfilePhotos(data.map((record) => record.id));
      const newData = data.map((user, index) => ({
        ...user,
        photoURL: imgurls[index],
      }));
      setRecords(newData);
      setIsFetching(false);
    })();
  }, [debouncedQuery]);

  const handleActions = async (action, userID) => {
    let userIDs = selectedRecords.flatMap((record) =>
      record.role === "owner" ? [] : record.id
    );

    if (userIDs.length === 0 && userID) userIDs.push(userID);

    if (action.toLowerCase() === "remove") {
      await removeUsers(userIDs);
      const newRecords = records.filter(
        (record) => !userIDs.includes(record.id)
      );
      setRecords(newRecords);
    } else {
      const status = action === "enable" ? "active" : "disabled";
      await updateUserStatus(userIDs, status);
      const updatedRecords = records.map((record) => {
        if (userIDs.includes(record.id)) {
          return { ...record, status };
        }
        return record;
      });
      setRecords(updatedRecords);
    }

    showNotification({
      message: `Account ${action}d`,
      title: "Success!",
      icon: <IconCheck size={16} />,
    });
    setSelectedRecords([]);
  };

  const openDeleteModal = (id, name) =>
    openConfirmModal({
      title: "Remove Account",
      children: (
        <Text size="sm">
          Are you sure you want to remove{" "}
          <Text component="strong" weight={700}>
            {name}
          </Text>
          's account? This action is destructive and you will have to contact
          support to restore your data.
        </Text>
      ),
      labels: { confirm: "Remove account", cancel: "No don't remove it" },
      confirmProps: { color: "red" },
      onConfirm: () => handleActions("remove", id),
    });

  const handleRoleUpdate = (id, value) => {
    setRecords((prev) =>
      prev.map((item) => {
        if (item.id === id) return { ...item, role: value };
        return item;
      })
    );

    showNotification({
      message: `Role updated.`,
      title: "Success!",
      icon: <IconCheck size={16} />,
    });
  };

  const handleStatusUpdate = (id, status) => {
    setRecords((prev) =>
      prev.map((item) => {
        if (item.id === id) return { ...item, status };
        return item;
      })
    );

    showNotification({
      message: `Status updated.`,
      title: "Success!",
      icon: <IconCheck size={16} />,
    });
  };

  return (
    <>
      <Title order={1}> Users</Title>
      <Space h="md" />
      <Card sx={{ minHeight: "80vh" }}>
        <Stack spacing="xs">
          <Group position="apart">
            <Group>
              <Button leftIcon={<IconPlus />} onClick={() => setOpened(true)}>
                Invite User
              </Button>
              {userRole !== "user" && (
                <Menu
                  shadow="md"
                  withArrow
                  width="PopoverWidth"
                  position="bottom-end"
                >
                  <Menu.Target>
                    <Button
                      variant="outline"
                      disabled={!selectedRecords.length || userRole === "user"}
                      rightIcon={<IconChevronDown size={20} />}
                    >
                      Actions
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown
                    onClick={(e) => handleActions(e.target.innerText)}
                  >
                    <Menu.Item icon={<IconCircleOff size={20} />}>
                      Disable
                    </Menu.Item>
                    <Menu.Item icon={<IconTrash size={20} />}>Remove</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )}
            </Group>
            <TextInput
              placeholder="Filter Name"
              icon={<IconSearch />}
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
            />
          </Group>
          <Space h="xs" />
          <DataTable
            withBorder
            borderRadius="sm"
            withColumnBorders
            minHeight={100}
            records={records}
            columns={[
              {
                accessor: "user",
                render: ({ name, photoURL }) => (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar src={photoURL} alt={name} radius="50%" size={52} />
                    <Text ml="xs">{name}</Text>
                  </div>
                ),
              },
              {
                accessor: "email",
              },
              { accessor: "phone" },
              {
                accessor: "role",
                render: ({ id, role }) => {
                  if (userRole === "user") return upperFirst(role);

                  return (
                    <RoleDropDown
                      id={id}
                      role={role}
                      handleRoleUpdate={handleRoleUpdate}
                    />
                  );
                },
              },
              {
                accessor: "status",
                render: ({ id, status, role }) => {
                  if (userRole === "user")
                    return (
                      <Badge color={status === "active" ? "green" : "red"}>
                        {status}
                      </Badge>
                    );

                  return (
                    role !== "owner" && (
                      <StatusSwitch
                        id={id}
                        status={status}
                        handleStatusUpdate={handleStatusUpdate}
                      />
                    )
                  );
                },
              },
              {
                accessor: "action",
                visibleMediaQuery: () => {
                  if (userRole === "user") return "width: 0";
                },
                render: ({ id, role, name }) => {
                  if (role === "owner") return;

                  return (
                    <Button
                      onClick={() => openDeleteModal(id, name)}
                      leftIcon={<IconTrash size={16} />}
                      size="sm"
                      variant="light"
                      color="red"
                      disabled={userRole === "user"}
                    >
                      Remove
                    </Button>
                  );
                },
              },
            ]}
            fetching={isFetching}
            {...(userRole !== "user"
              ? {
                  selectedRecords: selectedRecords,
                  onSelectedRecordsChange: setSelectedRecords,
                }
              : {})}
          />
        </Stack>
      </Card>
      <InviteModal opened={opened} handleOpened={setOpened} />
    </>
  );
};

export default ManageUsers;
