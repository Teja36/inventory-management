import { useEffect, useState } from "react";

import { Card, Space, Text, useMantineColorScheme } from "@mantine/core";

import Chart from "react-apexcharts";

import { useMediaQuery } from "@mantine/hooks";

import { getDataForDonut } from "../../firebase/fireStore";

const DonutChart = ({ className }) => {
  const matches = useMediaQuery("(max-width: 400px)");

  const [data, setData] = useState({});

  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    getDataForDonut().then((res) => setData(res));
  }, []);

  return (
    <Card className={className}>
      <Text weight={600}>Items by potency</Text>
      <Space h="lg" />
      <Card.Section
        sx={{
          width: "100%",
        }}
      >
        <Chart
          height={matches ? "100%" : 400}
          type="donut"
          series={Object.values(data)}
          options={{
            legend: {
              fontSize: "13px",
              fontWeight: 600,
              // position: "bottom",
              show: matches ? false : true,
            },
            chart: {
              background: "",
              foreColor: colorScheme === "dark" ? "#c1c2c5" : "#000",
            },
            stroke: { show: false },
            labels: Object.keys(data).map((item) => item.toUpperCase()),
            theme: {
              mode: colorScheme,
            },
            plotOptions: {
              pie: {
                donut: {
                  labels: {
                    show: true,
                    total: {
                      show: true,
                      fontWeight: "bold",
                    },
                  },
                },
              },
            },
          }}
        />
      </Card.Section>
    </Card>
  );
};

export default DonutChart;
