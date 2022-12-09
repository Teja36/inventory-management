import { useEffect, useState } from "react";

import { createStyles, Text } from "@mantine/core";

import { upperFirst, useLocalStorage } from "@mantine/hooks";

import {
  increamentSearchCount,
  locateItemByID,
} from "../../firebase/fireStore";

const useStyles = createStyles((theme) => ({
  grid: {
    display: "grid",
    gridTemplateRows: "repeat(8, 40px)",
    gridTemplateColumns: "repeat(2,1fr)",
    gridTemplateAreas: `
    "left-top right-top"
    "left-top right-top"
    "left-top right-middle"
    "left-bottom right-middle"
    "left-bottom right-bottom"
    "left-bottom right-bottom"
    "bottom bottom"
    "bottom bottom"
    `,
  },
  cell: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    border: `5px solid ${
      theme.fn.variant({
        variant: "filled",
        color: theme.primaryColor,
      }).background
    }`,
  },
  active: {
    backgroundColor: theme.fn.lighten(
      theme.fn.variant({ variant: "filled", color: theme.primaryColor })
        .background,
      0.5
    ),
  },
  leftTop: {
    gridArea: "left-top",
  },
  leftBottom: {
    gridArea: "left-bottom",
    borderTop: "none",
  },
  rightTop: {
    gridArea: "right-top",
    borderLeft: "none",
  },
  rightMiddle: {
    gridArea: "right-middle",
    borderLeft: "none",
    borderTop: "none",
  },
  rightBottom: {
    gridArea: "right-bottom",
    borderLeft: "none",
    borderTop: "none",
  },
  bottom: {
    gridArea: "bottom",
    borderTop: "none",
  },
}));

const LocateModal = ({ item }) => {
  const { classes, cx } = useStyles();

  const [data, setData] = useState({
    leftTop: "",
    leftBottom: "",
    rightTop: "",
    rightMiddle: "",
    rightBottom: "",
    bottom: "",
  });

  const [, setRecent] = useLocalStorage({
    key: "recently-searched",
    defaultValue: [],
  });

  useEffect(() => {
    const getData = async () => {
      const res = await locateItemByID(item.uid);

      if (res) {
        const locationData = {
          [`${res.shelf}${upperFirst(
            res.rack
          )}`]: `Col ${res.column}, Row ${res.row}`,
        };

        setData((prev) => ({ ...prev, ...locationData }));
        increamentSearchCount();
        setRecent((prev) => [...new Set([item.uid, ...prev])].slice(0, 10));
      }
    };

    getData();
  }, []);

  return (
    <>
      <Text weight={700} align="center" transform="capitalize">
        {item?.name} {item?.potency.toUpperCase()}
      </Text>

      <div className={classes.grid}>
        <div
          className={cx(classes.cell, classes.leftTop, {
            [classes.active]: data.leftTop,
          })}
        >
          {data.leftTop}
        </div>
        <div
          className={cx(classes.cell, classes.leftBottom, {
            [classes.active]: data.leftBottom,
          })}
        >
          {data.leftBottom}
        </div>
        <div
          className={cx(classes.cell, classes.rightTop, {
            [classes.active]: data.rightTop,
          })}
        >
          {data.rightTop}
        </div>
        <div
          className={cx(classes.cell, classes.rightMiddle, {
            [classes.active]: data.rightMiddle,
          })}
        >
          {data.rightMiddle}
        </div>
        <div
          className={cx(classes.cell, classes.rightBottom, {
            [classes.active]: data.rightBottom,
          })}
        >
          {data.rightBottom}
        </div>
        <div
          className={cx(classes.cell, classes.bottom, {
            [classes.active]: data.bottom,
          })}
        >
          {data.bottom}
        </div>
      </div>
    </>
  );
};

export default LocateModal;
