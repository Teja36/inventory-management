import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import {
  AppShell,
  ColorSchemeProvider,
  Container,
  MantineProvider,
} from "@mantine/core";
import {
  upperFirst,
  useColorScheme,
  useDocumentTitle,
  useMediaQuery,
} from "@mantine/hooks";
import { NotificationsProvider } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";

import { useSelector, useDispatch } from "react-redux";
import { logoutUser, setUserData, setUserInfo } from "./redux/userSlice";

import { getItems, getUserInfo } from "./firebase/fireStore";

import Login from "./pages/Login/Login";
import Inventory from "./pages/Inventory/Inventory";
import Dashboard from "./pages/Dashboard/Dashboard";
import Navbar from "./components/common/Navbar";
import MyHeader from "./components/common/MyHeader";
import NotFound from "./pages/NotFound/NotFound";
import PrivateRoutes from "./pages/PrivateRoutes";
import Account from "./pages/Account/Account";
import Security from "./pages/Security/Security";
import ManageUsers from "./pages/ManageUsers/ManageUsers";

const customDefaultProps = {
  defaultProps: {
    size: "md",
  },
};

function App() {
  const preferredColorScheme = useColorScheme();

  const [colorScheme, setColorScheme] = useState(preferredColorScheme);

  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  const matches = useMediaQuery("(max-width: 992px)");

  const userExists = useSelector((state) => state.user.userInfo.exists);

  const [items, setItems] = useState([]);

  const [title, setTitle] = useState("");

  useDocumentTitle(title);

  let location = useLocation();

  const dispatch = useDispatch();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const { uid, displayName, email, photoURL } = user;

      getUserInfo(uid).then((info) => {
        if (info.status === "active") dispatch(setUserInfo(info));
      });

      dispatch(setUserData({ uid, displayName, email, photoURL }));
    } else {
      dispatch(logoutUser());
    }
  });

  useEffect(() => {
    const getRecords = async () => {
      const res = await getItems();
      setItems(res);
    };
    getRecords();
  }, []);

  useEffect(() => {
    setTitle(
      location.pathname.length > 1
        ? `Inventory | ${upperFirst(location.pathname.slice(1))}`
        : "Inventory"
    );
  }, [location]);

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          globalStyles: (theme) => ({
            "*::-webkit-scrollbar": {
              width: "0.4em",
            },
            "*::-webkit-scrollbar-track": {
              WebkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
            },
            "*::-webkit-scrollbar-thumb": {
              backgroundColor: theme.fn.lighten(
                theme.fn.variant({
                  variant: "filled",
                  color: theme.primaryColor,
                }).background,
                0.1
              ),
            },
          }),
          primaryColor: "teal",
          colorScheme,
          components: {
            Button: customDefaultProps,
            TextInput: customDefaultProps,
            PasswordInput: customDefaultProps,
            Select: customDefaultProps,
            NumberInput: customDefaultProps,
            Card: {
              defaultProps: {
                radius: "md",
                shadow: "sm",
                withBorder: "true",
              },
            },
          },
        }}
      >
        <NotificationsProvider>
          <ModalsProvider>
            <AppShell
              styles={(theme) => ({
                main: {
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[8]
                      : theme.colors.gray[0],

                  transition:
                    "padding-left 218ms cubic-bezier(0.4, 0, 0.2, 1);",
                },
              })}
              navbarOffsetBreakpoint="md"
              navbar={<Navbar />}
              header={matches ? <MyHeader /> : <></>}
              hidden={!userExists}
            >
              <Container sx={{ maxWidth: 1200, width: "100%", paddingTop: 0 }}>
                <Routes>
                  <Route
                    path="login"
                    element={userExists ? <Navigate to="/" /> : <Login />}
                  />
                  <Route element={<PrivateRoutes />}>
                    <Route
                      index
                      element={<Inventory items={items} setItems={setItems} />}
                    />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="account" element={<Account />} />
                    <Route path="security" element={<Security />} />
                    <Route path="users" element={<ManageUsers />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Container>
            </AppShell>
          </ModalsProvider>
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

export default App;
