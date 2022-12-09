import { useState } from "react";
import {
  Avatar,
  createStyles,
  Group,
  Header,
  Menu,
  Text,
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { MantineLogo } from "@mantine/ds";
import {
  IconChevronDown,
  IconMenu2,
  IconLogout,
  IconUser,
  IconFingerprint,
  IconSun,
  IconMoonStars,
} from "@tabler/icons";
import NavbarMobile from "./NavbarMobile";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../redux/userSlice";
import { logout } from "../../firebase/fireAuth";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.fn.variant({
      variant: "filled",
      color: theme.primaryColor,
    }).background,
    display: "flex",
    alignItems: "center",
  },
  menuIcon: {
    paddingRight: "10px",
    display: "grid",
    placeItems: "center",
    color: "white",
    cursor: "pointer",
  },
  right: {
    marginLeft: "auto",
  },

  link: {
    ...theme.fn.focusStyles(),
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
    borderRadius: theme.radius.sm,
    "&:hover": {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: theme.primaryColor })
          .background,
        0.1
      ),
    },
  },
  linkIcon: {
    color: theme.white,
  },

  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  name: {
    "@media (max-width: 400px)": {
      display: "none",
    },
  },
}));

const MyHeader = () => {
  const { classes, cx } = useStyles();

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const navigate = useNavigate();

  const { displayName, photoURL } = useSelector((state) => state.user.userData);

  const dispatch = useDispatch();

  const [opened, setOpened] = useState(false);

  const hanldeLogout = () => {
    logout();
    dispatch(logoutUser());
  };

  const handleClick = (option) => {
    if (option === "Logout") hanldeLogout();
    else if (option == "My Profile") navigate("account");
    else if (option == "Change Password") navigate("security");
  };

  return (
    <Header height={60} p="md" className={classes.header}>
      <div
        className={classes.menuIcon}
        onClick={() => (opened ? setOpened(false) : setOpened(true))}
      >
        <IconMenu2 size={38} />
      </div>

      <Logo size={72} />

      <Group spacing={4} className={classes.right}>
        <Tooltip label={colorScheme === "dark" ? "Light theme" : "Dark theme"}>
          <UnstyledButton
            className={cx(classes.link, classes.center)}
            onClick={() => {
              toggleColorScheme();
            }}
          >
            {colorScheme === "dark" ? (
              <IconSun className={classes.linkIcon} stroke={1.5} size={32} />
            ) : (
              <IconMoonStars
                className={classes.linkIcon}
                stroke={1.5}
                size={32}
              />
            )}
          </UnstyledButton>
        </Tooltip>

        <Menu shadow="md" withArrow>
          <Menu.Target>
            <UnstyledButton className={classes.link}>
              <Group spacing="xs">
                <Avatar src={photoURL} radius="xl" />
                <Text weight={500} color="gray.0" className={classes.name}>
                  {displayName}
                </Text>
                <IconChevronDown color="white" size={20} />
              </Group>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown onClick={(e) => handleClick(e.target.innerText)}>
            <Menu.Item icon={<IconUser color="grey" size={20} />}>
              My Profile
            </Menu.Item>
            <Menu.Item icon={<IconFingerprint color="grey" size={20} />}>
              Change Password
            </Menu.Item>
            <Menu.Item icon={<IconLogout color="grey" size={20} />}>
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <NavbarMobile opened={opened} setOpened={setOpened} />
    </Header>
  );
};

export default MyHeader;
