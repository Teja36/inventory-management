import { useEffect, useState } from "react";
import { Box, Card, createStyles, Space, Text, Title } from "@mantine/core";
import {
  IconClock,
  IconMedicineSyrup,
  IconReportSearch,
  IconUser,
} from "@tabler/icons";

import DonutChart from "../../components/Dashboard/DonutChart";
import RecentlySearched from "../../components/Dashboard/RecentlySearched";
import {
  getMedicineCount,
  getSearchCount,
  getUserCount,
} from "../../firebase/fireStore";

const useStyles = createStyles((theme) => ({
  wrapper: {
    display: "grid",
    width: "100%",
    height: "100%",
    gridTemplateAreas: `"card1 card1 card2 card2 card3 card3 card4 card4" "chart chart chart chart chart table table table"`,
    gridTemplateColumns: "repeat(8, 1fr)",
    gap: "15px",
    [`@media (max-width: ${theme.breakpoints.md}px)`]: {
      gridTemplateAreas: `"card1 table" "card2 table" "card3 table" "card4 table" "chart table"`,
      gridTemplateColumns: "repeat(2, 1fr)",
    },
    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      display: "flex",
      flexDirection: "column",
    },
  },
  icon: {
    width: "50px",
    height: "50px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "15px",
    borderRadius: "5px",
  },
  card1: {
    svg: {
      color: "hsl(199, 100%, 49%)",
    },
    "span:first-of-type": {
      backgroundColor: "hsla(199, 100%, 49%, 15%)",
    },
    gridArea: "card1",
    display: "flex",
  },
  card2: {
    svg: {
      color: "hsl(173, 100%, 30%)",
    },
    "span:first-of-type": {
      backgroundColor: "hsla(173, 100%, 30%, 15%)",
    },
    gridArea: "card2",
    display: "flex",
  },
  card3: {
    svg: {
      color: "hsl(296, 95%, 37%)",
    },
    "span:first-of-type": {
      backgroundColor: "hsla(296, 95%, 37%, 15%)",
    },
    gridArea: "card3",
    display: "flex",
  },
  card4: {
    svg: {
      color: "hsl(35, 100%, 50%)",
    },
    "span:first-of-type": {
      backgroundColor: "hsla(35, 100%, 50%, 15%)",
    },
    gridArea: "card4",
    display: "flex",
  },
  chart: {
    gridArea: "chart",
  },
  table: {
    gridArea: "table",
  },
}));

const Dashboard = () => {
  const [count, setCount] = useState({
    userCount: 0,
    medicineCount: 0,
    searchCount: 0,
  });

  const { classes } = useStyles();

  useEffect(() => {
    const getCount = async () => {
      const userCount = await getUserCount();
      const medicineCount = await getMedicineCount();
      const searchCount = await getSearchCount();
      setCount({
        userCount,
        medicineCount,
        searchCount,
      });
    };
    getCount();
  }, []);

  const getTimeSaved = (searchCount) => {
    searchCount += searchCount * 0.2;
    let res = "";
    let hours = Math.floor(searchCount / 60);
    let minutes = Math.round(searchCount % 60);

    if (hours > 0) {
      res += hours;
      res += hours < 2 ? "hr" : "hrs";
    }

    res += minutes;
    res += minutes < 2 ? "min" : "mins";

    return res;
  };

  return (
    <>
      <Title order={1}>Dashboard</Title>
      <Space h="md" />

      <Box className={classes.wrapper}>
        <Card className={classes.card1}>
          <span className={classes.icon}>
            <IconUser size={40} />
          </span>
          <span>
            <Text size="sm" color="dimmed">
              Users
            </Text>
            <Text size="xl" weight={700}>
              {count.userCount}
            </Text>
          </span>
        </Card>

        <Card className={classes.card2}>
          <span className={classes.icon}>
            <IconMedicineSyrup size={40} />
          </span>
          <span>
            <Text size="sm" color="dimmed">
              Medicines
            </Text>
            <Text size="xl" weight={700}>
              {count.medicineCount}
            </Text>
          </span>
        </Card>

        <Card className={classes.card3}>
          <span className={classes.icon}>
            <IconReportSearch size={40} />
          </span>
          <span>
            <Text size="sm" color="dimmed">
              Searches
            </Text>
            <Text size="xl" weight={700}>
              {count.searchCount}
            </Text>
          </span>
        </Card>

        <Card className={classes.card4}>
          <span className={classes.icon}>
            <IconClock size={40} />
          </span>
          <span>
            <Text size="sm" color="dimmed">
              Time saved
            </Text>
            <Text size="xl" weight={700}>
              {getTimeSaved(count.searchCount)}
            </Text>
          </span>
        </Card>

        <DonutChart className={classes.chart} />

        <RecentlySearched className={classes.table} />
      </Box>
    </>
  );
};

export default Dashboard;
