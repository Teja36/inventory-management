import {
  CloseButton,
  createStyles,
  Drawer,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBuildingWarehouse,
  IconFingerprint,
  IconGauge,
  IconUser,
  IconUsers,
} from "@tabler/icons";
import { useNavigate } from "react-router-dom";

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");
  return {
    drawer: {
      backgroundColor: theme.fn.variant({
        variant: "filled",
        color: theme.primaryColor,
      }).background,
    },

    closeButton: {
      opacity: 0.75,
      width: "100%",
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: "2%",
    },
    wrapper: {
      display: "grid",
      placeItems: "center",
      height: "90%",
    },
    container: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
    },
    button: {
      display: "flex",
      alignItems: "flex-start",
    },

    label: {
      fontSize: "48px",
      color: theme.white,
    },
    icon: {
      ref: icon,
      color: theme.white,
      opacity: 0.75,
      marginRight: theme.spacing.sm,
    },
  };
});

const data = [
  { link: "/", label: "Inventory", icon: IconBuildingWarehouse },
  { link: "/dashboard", label: "Dashboard", icon: IconGauge },
  //   { link: "/account", label: "Account", icon: IconUser },
  //   { link: "/security", label: "Security", icon: IconFingerprint },
  { link: "/users", label: "Users", icon: IconUsers },
];

const NavbarMobile = ({ opened, setOpened }) => {
  const { classes } = useStyles();

  const navigate = useNavigate();
  return (
    <Drawer
      opened={opened}
      onClose={() => setOpened(false)}
      withCloseButton={false}
      position="left"
      size="full"
      padding="sm"
      overlayColor="black"
      classNames={{ drawer: classes.drawer, overlay: classes.overlay }}
    >
      <div className={classes.closeButton}>
        <CloseButton
          onClick={() => setOpened(false)}
          size={52}
          variant="transparent"
          sx={{ color: "white" }}
        />
      </div>
      <div className={classes.wrapper}>
        <div className={classes.container}>
          {data.map((navItem, index) => (
            <UnstyledButton
              key={index}
              onClick={() => {
                setOpened(false);
                navigate(navItem.link);
              }}
              className={classes.button}
            >
              <navItem.icon stroke={1.5} className={classes.icon} size={52} />
              <span className={classes.label}>{navItem.label}</span>
            </UnstyledButton>
          ))}
        </div>
      </div>
    </Drawer>
  );
};

export default NavbarMobile;
