import { useEffect, useState } from "react";

import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { upperFirst } from "@mantine/hooks";
import { DataTable } from "mantine-datatable";

import { IconMapPin, IconPencil, IconTrash } from "@tabler/icons";

import openDeleteModal from "./openDeleteModal";

const PAGE_SIZE = 15;

const ItemTable = ({
  userRole,
  items,
  sortStatus,
  setSortStatus,
  openEditModal,
  handleDelete,
  locateItem,
  fetching,
}) => {
  const [records, setRecords] = useState(items?.slice(0, PAGE_SIZE));

  const [page, setPage] = useState(1);

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(items?.slice(from, to));
  }, [page, items]);

  useEffect(() => {
    setPage(1);
  }, [items]);

  return (
    <DataTable
      borderRadius="sm"
      minHeight={180}
      columns={[
        {
          accessor: "uid",
          title: "#",
          textAlignment: "right",
          width: 40,
          render: (record) => items.indexOf(record) + 1,
        },
        {
          accessor: "name",
          width: "50%",
          sortable: true,
          render: (record) => {
            return record.name
              .split(" ")
              .map((word) => upperFirst(word))
              .join(" ");
          },
        },
        {
          accessor: "potency",
          render: (record) => record.potency.toUpperCase(),
        },
        { accessor: "size", title: "ml / g" },
        {
          accessor: "brand",
          sortable: true,
          render: (record) =>
            record.brand === "sbl"
              ? record.brand.toUpperCase()
              : upperFirst(record.brand),
        },
        {
          accessor: "qty",
          title: "Quantity",
          // sortable: filter === "Quantity" ? false : true,
          sortable: true,
          render: (record) => `${record.qty} N`,
        },
        {
          accessor: "actions",
          title: "Actions",
          render: (record) => (
            <Button.Group>
              <Tooltip label="Locate">
                <ActionIcon
                  color="green"
                  variant="subtle"
                  onClick={() => locateItem(record)}
                >
                  <IconMapPin size={16} />
                </ActionIcon>
              </Tooltip>

              {userRole !== "user" && (
                <>
                  <Tooltip label="Edit">
                    <ActionIcon
                      color="blue"
                      variant="subtle"
                      onClick={() => openEditModal(record)}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Delete">
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() =>
                        openDeleteModal(
                          record.uid,
                          record.name,
                          record.potency,
                          handleDelete
                        )
                      }
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </>
              )}
            </Button.Group>
          ),
        },
      ]}
      records={records}
      sortStatus={sortStatus}
      onSortStatusChange={setSortStatus}
      noRecordsText="No records found"
      idAccessor="uid"
      fetching={fetching}
      loaderVariant="oval"
      totalRecords={items?.length}
      recordsPerPage={PAGE_SIZE}
      page={page}
      onPageChange={(p) => setPage(p)}
    />
  );
};

export default ItemTable;
