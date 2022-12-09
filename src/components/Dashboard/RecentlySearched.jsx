import { useEffect, useState } from "react";

import { Card, Text } from "@mantine/core";

import { DataTable } from "mantine-datatable";

import { upperFirst, useLocalStorage } from "@mantine/hooks";

import { getRecentlySearchedItems } from "../../firebase/fireStore";

const RecentlySearched = ({ className }) => {
  const [records, setRecords] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const [recent] = useLocalStorage({
    key: "recently-searched",
    defaultValue: [],
  });

  useEffect(() => {
    setIsFetching(true);
    const getRecords = async () => {
      const res = await getRecentlySearchedItems(recent);
      setRecords(res);
      setIsFetching(false);
    };
    getRecords();
  }, [recent]);

  return (
    <Card className={className}>
      <Text weight={600}>Recently searched</Text>
      <DataTable
        minHeight={150}
        highlightOnHover
        records={records}
        idAccessor="uid"
        columns={[
          {
            accessor: "uid",
            title: "#",
            textAlignment: "right",
            width: 40,
            render: (record) => records.indexOf(record) + 1,
          },
          {
            accessor: "name",
            width: "60%",
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
          {
            accessor: "brand",
            visibleMediaQuery: (theme) =>
              `((min-width: 460px) and (max-width: ${theme.breakpoints.sm}px)),(min-width: ${theme.breakpoints.xl}px)`,
            render: (record) =>
              record.brand === "sbl"
                ? record.brand.toUpperCase()
                : upperFirst(record.brand),
          },
          {
            accessor: "qty",
            title: "Quantity",
            visibleMediaQuery: (theme) =>
              `(max-width: ${theme.breakpoints.sm}px),(min-width: ${theme.breakpoints.lg}px)`,
            render: (record) => `${record.qty} N`,
          },
        ]}
        fetching={isFetching}
        loaderVariant="oval"
        noRecordsText="No records found"
      />
    </Card>
  );
};

export default RecentlySearched;
