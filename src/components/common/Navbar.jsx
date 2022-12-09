import { useEffect, useState } from "react";
import {
  createStyles,
  Navbar,
  useMantineColorScheme,
  UnstyledButton,
  Avatar,
  Text,
  Stack,
} from "@mantine/core";
import {
  IconFingerprint,
  IconLogout,
  IconUser,
  IconGauge,
  IconSun,
  IconMoonStars,
  IconUsers,
  IconBuildingWarehouse,
} from "@tabler/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../firebase/fireAuth";
import { logoutUser } from "../../redux/userSlice";
import Logo from "./Logo";

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");
  return {
    navbar: {
      backgroundColor: theme.fn.variant({
        variant: "filled",
        color: theme.primaryColor,
      }).background,
    },

    header: {
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md * 1.5,
      borderBottom: `1px solid ${theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: theme.primaryColor })
          .background,
        0.1
      )}`,
    },

    footer: {
      paddingTop: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderTop: `1px solid ${theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: theme.primaryColor })
          .background,
        0.1
      )}`,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      fontSize: theme.fontSizes.sm,
      color: theme.white,
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,
      width: "100%",

      "&:hover": {
        backgroundColor: theme.fn.lighten(
          theme.fn.variant({ variant: "filled", color: theme.primaryColor })
            .background,
          0.1
        ),
      },
    },

    linkIcon: {
      ref: icon,
      color: theme.white,
      opacity: 0.75,
      marginRight: theme.spacing.sm,
    },

    linkActive: {
      "&, &:hover": {
        backgroundColor: theme.fn.lighten(
          theme.fn.variant({ variant: "filled", color: theme.primaryColor })
            .background,
          0.15
        ),
        [`& .${icon}`]: {
          opacity: 0.9,
        },
      },
    },
  };
});

const data = [
  { link: "/", label: "Inventory", icon: IconBuildingWarehouse },
  { link: "/dashboard", label: "Dashboard", icon: IconGauge },
  { link: "/account", label: "Account", icon: IconUser },
  { link: "/security", label: "Security", icon: IconFingerprint },
  { link: "/users", label: "Users", icon: IconUsers },
];

export function NavbarSimpleColored() {
  const { classes, cx } = useStyles();

  const {
    userData: { displayName, photoURL },
    userInfo: { role },
  } = useSelector((state) => state.user);

  const [active, setActive] = useState(0);

  let location = useLocation();

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  useEffect(() => {
    let index = data.findIndex(
      (link) => link.label.toLowerCase() === location.pathname.slice(1)
    );

    setActive(index === -1 ? 0 : index);
  }, [location]);

  const hanldeLogout = () => {
    logout();
    dispatch(logoutUser());
  };

  const links = data.map((item, index) => (
    <UnstyledButton
      className={cx(classes.link, {
        [classes.linkActive]: index === active,
      })}
      href={item.link}
      key={item.label}
      onClick={() => {
        navigate(item.link);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </UnstyledButton>
  ));

  return (
    <Navbar
      hidden={true}
      hiddenBreakpoint="md"
      // height={"100vh"}
      width={{ xs: 250 }}
      p="md"
      className={classes.navbar}
    >
      <Navbar.Section
        className={classes.header}
        sx={{ display: "flex", alignItems: "center" }}
      >
        <Logo size={72} />
        {/* <Text weight="bold" color="white" size={26}>
          Inventory
        </Text> */}
      </Navbar.Section>

      <Navbar.Section className={classes.header}>
        <Stack align="center" justify="flex-start" spacing={5}>
          <Avatar src={photoURL} size="xl" radius={50} />

          <Text weight={500} color="gray.0">
            {displayName}
          </Text>
          <Text transform="capitalize" color="gray.3">
            {role}
          </Text>
        </Stack>
      </Navbar.Section>
      <Navbar.Section grow>{links}</Navbar.Section>
      <Navbar.Section className={classes.footer}>
        <UnstyledButton
          className={classes.link}
          onClick={() => {
            toggleColorScheme();
          }}
        >
          {colorScheme === "dark" ? (
            <IconSun className={classes.linkIcon} stroke={1.5} />
          ) : (
            <IconMoonStars className={classes.linkIcon} stroke={1.5} />
          )}

          <span>{colorScheme === "dark" ? "Light theme" : "Dark theme"}</span>
        </UnstyledButton>

        <UnstyledButton className={classes.link} onClick={hanldeLogout}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </UnstyledButton>
      </Navbar.Section>
    </Navbar>
  );
}

export default NavbarSimpleColored;
