import { useEffect, useState } from "react";

import sortBy from "lodash/sortBy";

import {
  Box,
  Button,
  Card,
  Group,
  Menu,
  Modal,
  Space,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";

import { useSelector } from "react-redux";

import { useDebouncedValue } from "@mantine/hooks";

import { IconChevronDown, IconPlus, IconSearch } from "@tabler/icons";

import ItemTable from "../../components/Inventory/ItemTable";
import AddItemModal from "../../components/Inventory/AddItemModal";
import EditItemModal from "../../components/Inventory/EditItemModal";
import LocateModal from "../../components/Inventory/LocateModal";

const Inventory = ({ items, setItems }) => {
  const userRole = useSelector((state) => state.user.userInfo.role);

  const [formattedItems, setformattedItems] = useState(items);

  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 400);

  const [sortStatus, setSortStatus] = useState({
    columnAccessor: "name",
    direction: "asc",
  });

  const [filter, setFilter] = useState("Name");

  const [opened, setOpened] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editRecord, setEditRecord] = useState({});

  const [locationRecord, setLocationRecord] = useState(null);
  const [locationModal, setLocationModal] = useState(false);

  useEffect(() => {
    setLoading(true);

    let data = items.slice();

    if (debouncedQuery && filter !== "Quantity")
      data = data.filter((item) =>
        item[filter.toLowerCase()].startsWith(debouncedQuery)
      );

    if (sortStatus) data = sortBy(data, sortStatus.columnAccessor);

    if (sortStatus.direction === "desc") data.reverse();

    setformattedItems(data);

    setTimeout(() => setLoading(false), 250);
  }, [items, debouncedQuery, sortStatus, filter]);

  const handleFilter = (value) => {
    setFilter(value);
  };

  const openEditModal = (record) => {
    setOpenedEdit(true);
    setEditRecord(record);
  };

  const handleCreate = (id, data) => {
    setOpened(false);
    setItems((prev) => sortBy([...prev, { uid: id, ...data }], "name"));
  };

  const handleEdit = (id, data) => {
    setItems((prev) =>
      prev.map((record) => {
        if (record.uid === id) {
          return { uid: id, ...data };
        }
        return record;
      })
    );
    setEditRecord({});
  };

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((record) => record.uid !== id));
  };

  const locateItem = (record) => {
    setLocationModal(true);
    setLocationRecord(record);
  };

  const handleCloseLocationModal = () => {
    setLocationModal(false);
    setLocationRecord(null);
  };

  return (
    <>
      <Title order={1}>Inventory</Title>
      <Space h="md" />
      <Card>
        <Stack>
          <Group position="apart">
            {userRole !== "user" ? (
              <Button leftIcon={<IconPlus />} onClick={() => setOpened(true)}>
                Add New
              </Button>
            ) : (
              <div></div>
            )}
            <Group position="right">
              <TextInput
                icon={<IconSearch size={18} stroke={1.5} />}
                placeholder="Search"
                size="md"
                radius="md"
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
              />
              <Menu
                shadow="md"
                withArrow
                width="PopoverWidth"
                position="bottom-end"
              >
                <Menu.Target>
                  <Button
                    variant="outline"
                    rightIcon={<IconChevronDown size={20} />}
                  >
                    Filter by: {filter}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown
                  onClick={(e) => handleFilter(e.target.innerText)}
                >
                  <Menu.Item>Name</Menu.Item>
                  <Menu.Item>Potency</Menu.Item>
                  <Menu.Item>Brand</Menu.Item>
                  <Menu.Item>Quantity</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>

          <ItemTable
            items={formattedItems}
            userRole={userRole}
            sortStatus={sortStatus}
            setSortStatus={setSortStatus}
            openEditModal={openEditModal}
            handleDelete={handleDelete}
            locateItem={locateItem}
            fetching={loading}
          />
        </Stack>
      </Card>

      <Modal
        title="Add new item"
        opened={opened}
        onClose={() => setOpened(false)}
      >
        <AddItemModal
          handleSuccess={handleCreate}
          handleClose={() => setOpened(false)}
        />
      </Modal>

      <Modal
        title="Edit item"
        opened={openedEdit}
        onClose={() => setOpenedEdit(false)}
      >
        <EditItemModal
          record={editRecord}
          handleSuccess={handleEdit}
          handleClose={() => setOpenedEdit(false)}
        />
      </Modal>

      <Modal
        centered
        title="Location:"
        opened={locationModal}
        onClose={handleCloseLocationModal}
      >
        <LocateModal item={locationRecord} />
      </Modal>
    </>
  );
};

export default Inventory;
